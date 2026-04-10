import { _decorator, Component, Node, UITransform } from 'cc';
import { GameModel } from './GameModelImpl';
import { GameView } from './GameViewImpl';
import { enum_app_event_key } from './core/event/EventEnum';
import { eventManager } from './core/event/EventManager';
import { uiManager } from './core/ui/UIManager';
import { cardManager } from './card/CardManager';
import { parcelManager } from './parcel/ParcelManager';
import {
    fn_game_main_configure_canvas_adaptation,
    fn_game_main_ensure_ui_root,
} from './core/adaptive/AdaptiveLayout';
import { fn_game_main_run_gm_action } from './flow/controller/MainGameGmService';
import { fn_game_main_get_rotated_anchor_with_kick } from './flow/controller/MainGameRotationService';
import {
    fn_game_main_begin_placement_drag,
    fn_game_main_cancel_preplace,
    fn_game_main_commit_preplace_state2,
    fn_game_main_confirm_preplace_place,
    fn_game_main_set_preplace_hover,
    fn_game_main_update_locked_preplace_anchor,
} from './game/controller/MainGamePlacementController';
import {
    GridPos,
    Rotation,
} from './core/types/BaseGameTypes';
import { PlacementPreview } from './board/BoardTypes';
import { HandSlotState, GameViewState } from './view/ViewStateTypes';

const { ccclass } = _decorator;
const MAIN_GAME_VIEW_UI_KEY = 'app_main_game_view';

@ccclass('MainGame')
export class MainGame extends Component {
    private model: GameModel | null = null;
    private view: GameView | null = null;
    private selectedHandIndex = 0;
    private currentRotation: Rotation = 0;
    private lastRotationStep: -1 | 0 | 1 = 0;
    private hoverAnchor: GridPos | null = null;
    /** 预放置状态2：锁定锚点，仅通过「放置」按钮结算 */
    private lockedPreplaceAnchor: GridPos | null = null;
    private flashPhase = 0;
    private lastRootWidth = 0;
    private lastRootHeight = 0;

    start() {
        this.initManagers();
        this.addEvents();
        this.configureCanvasAdaptation();
        this.model = new GameModel();
        this.normalizeSelection();
        this.rebuildView();
        eventManager.emit(enum_app_event_key.app_bootstrap_done, { source: 'MainGame' });
    }

    onDestroy() {
        this.offEvents();
        if (this.view) {
            this.view.destroyView();
            this.view = null;
        }
        uiManager.close(MAIN_GAME_VIEW_UI_KEY);
        this.disposeManagers();
    }

    update(dt: number) {
        this.flashPhase += dt * 6;
        this.checkForResize();
        if (
            this.model?.status === 'playing'
            && (this.hoverAnchor !== null || this.lockedPreplaceAnchor !== null)
        ) {
            this.render();
        }
    }

    private configureCanvasAdaptation(): void {
        fn_game_main_configure_canvas_adaptation(this.node);
    }

    private ensureUiRoot(): Node {
        const result = fn_game_main_ensure_ui_root(this.node);
        this.lastRootWidth = result.width;
        this.lastRootHeight = result.height;
        return result.contentRoot;
    }

    private rebuildView(): void {
        if (this.view) {
            this.view.destroyView();
            uiManager.close(MAIN_GAME_VIEW_UI_KEY);
            eventManager.emit(enum_app_event_key.app_ui_close, { uiKey: MAIN_GAME_VIEW_UI_KEY });
        }
        const uiRoot = this.ensureUiRoot();
        this.view = new GameView(uiRoot, {
            onRotateLeft: () => this.rotate(-1),
            onRotateRight: () => this.rotate(1),
            onBeginPlacementDrag: (index) => this.beginPlacementDrag(index),
            onPreplaceHoverAnchor: (anchor) => this.setPreplaceHover(anchor),
            onPreplaceCommitState2: (anchor) => this.commitPreplaceState2(anchor),
            onLockedPreplaceAnchorUpdate: (anchor) => this.updateLockedPreplaceAnchor(anchor),
            onPreplaceCancel: () => this.cancelPreplace(),
            onPreplaceConfirmPlace: () => this.confirmPreplacePlace(),
            onGmDrawCard: () => this.gmDrawCard(),
            onGmAddScore: () => this.gmAddScore(),
            onGmAddRottenCharge: () => this.gmAddRottenCharge(),
            onGmRestart: () => this.gmRestart(),
        });
        uiManager.open(MAIN_GAME_VIEW_UI_KEY, this.view);
        eventManager.emit(enum_app_event_key.app_ui_open, { uiKey: MAIN_GAME_VIEW_UI_KEY, payload: this.view });
        this.render();
    }

    private initManagers(): void {
        cardManager.init();
        parcelManager.init();
    }

    private disposeManagers(): void {
        cardManager.dispose();
        parcelManager.dispose();
    }

    private addEvents(): void {
        // reserved
    }

    private offEvents(): void {
        // reserved
    }

    private checkForResize(): void {
        const canvasTransform = this.node.getComponent(UITransform);
        if (!canvasTransform) {
            return;
        }

        const { width, height } = canvasTransform.contentSize;
        if (width === this.lastRootWidth && height === this.lastRootHeight) {
            return;
        }

        this.lastRootWidth = width;
        this.lastRootHeight = height;
        this.rebuildView();
    }

    private beginPlacementDrag(index: number): void {
        fn_game_main_begin_placement_drag(this, index);
    }

    private setPreplaceHover(anchor: GridPos | null): void {
        fn_game_main_set_preplace_hover(this, anchor);
    }

    /** 预放置状态2：在棋盘上拖拽更换锚点 */
    private updateLockedPreplaceAnchor(anchor: GridPos): void {
        fn_game_main_update_locked_preplace_anchor(this, anchor);
    }

    private commitPreplaceState2(anchor: GridPos): void {
        fn_game_main_commit_preplace_state2(this, anchor);
    }

    private cancelPreplace(): void {
        fn_game_main_cancel_preplace(this);
    }

    private confirmPreplacePlace(): void {
        fn_game_main_confirm_preplace_place(this);
    }

    private rotate(direction: number): void {
        if (!this.model || this.model.status !== 'playing' || !this.model.getCardAtHand(this.selectedHandIndex)) {
            return;
        }

        const card = this.model.getCardAtHand(this.selectedHandIndex)!;
        const currentAnchor = this.lockedPreplaceAnchor ?? this.hoverAnchor;
        const nextRotation = (this.currentRotation + direction + 4) % 4;
        if (currentAnchor) {
            const adjustedAnchor = fn_game_main_get_rotated_anchor_with_kick(
                card.cells,
                currentAnchor,
                this.currentRotation,
                nextRotation as Rotation,
            );
            if (this.lockedPreplaceAnchor) {
                this.lockedPreplaceAnchor = adjustedAnchor;
            }
            if (this.hoverAnchor) {
                this.hoverAnchor = adjustedAnchor;
            }
        }
        this.currentRotation = nextRotation as Rotation;
        this.lastRotationStep = direction < 0 ? -1 : 1;
        this.render();
    }

    private gmDrawCard(): void {
        fn_game_main_run_gm_action(this, 'draw');
    }

    private gmAddScore(): void {
        fn_game_main_run_gm_action(this, 'score');
    }

    private gmAddRottenCharge(): void {
        fn_game_main_run_gm_action(this, 'rotten');
    }

    private gmRestart(): void {
        fn_game_main_run_gm_action(this, 'restart');
    }

    private normalizeSelection(): void {
        if (!this.model) {
            return;
        }
        if (this.model.hand.length === 0) {
            this.selectedHandIndex = -1;
            return;
        }
        if (this.selectedHandIndex < 0 || this.selectedHandIndex >= this.model.hand.length) {
            this.selectedHandIndex = 0;
        }
    }

    private getCurrentPreview(): PlacementPreview | null {
        if (!this.model) {
            return null;
        }
        const anchor = this.lockedPreplaceAnchor ?? this.hoverAnchor;
        if (!anchor) {
            return null;
        }
        const card = this.model.getCardAtHand(this.selectedHandIndex);
        if (!card) {
            return null;
        }
        return this.model.evaluatePlacement(card, anchor, this.currentRotation);
    }

    private buildHandSlots(): HandSlotState[] {
        if (!this.model) {
            return [];
        }
        const model = this.model;
        return model.hand.map((card, index) => ({
            index,
            card,
            selected: index === this.selectedHandIndex,
            canPlace: !!card && model.canCardBePlaced(card),
        }));
    }

    private buildViewState(): GameViewState | null {
        if (!this.model) {
            return null;
        }
        return {
            board: this.model.board,
            handSlots: this.buildHandSlots(),
            deckCount: this.model.getDeckCount(),
            score: this.model.score,
            targetScore: this.model.targetScore,
            remainingRotten: this.model.remainingRotten,
            rotation: this.currentRotation,
            rotationStep: this.lastRotationStep,
            status: this.model.status,
            message: this.model.message,
            preview: this.getCurrentPreview(),
            preplaceLocked: this.lockedPreplaceAnchor !== null,
            flashPhase: this.flashPhase,
        };
    }

    private render(): void {
        const state = this.buildViewState();
        if (!state || !this.view) {
            return;
        }

        try {
            this.view.render(state);
        } catch (error) {
            console.error('[MainGame] render failed:', error);
        }
    }
}
