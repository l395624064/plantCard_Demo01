import { _decorator, Canvas, Component, Layers, Node, UITransform, Vec3 } from 'cc';
import { GameModel } from './GameModel';
import { GameView } from './GameView';
import {
    BOARD_COLS,
    BOARD_ROWS,
    GameViewState,
    GridPos,
    HandSlotState,
    PlacementPreview,
    Rotation,
    getCardBounds,
    rotateCardCells,
} from './GameTypes';
const { ccclass } = _decorator;

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
        this.configureCanvasAdaptation();
        this.model = new GameModel();
        this.normalizeSelection();
        this.rebuildView();
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
        const canvas = this.node.getComponent(Canvas);
        if (!canvas) {
            return;
        }

        const adaptCanvas = canvas as Canvas & { fitWidth?: boolean; fitHeight?: boolean };
        adaptCanvas.fitWidth = true;
        adaptCanvas.fitHeight = false;
    }

    private ensureUiRoot(): Node {
        let uiRoot = this.node.getChildByName('DemoRoot');
        if (!uiRoot) {
            uiRoot = new Node('DemoRoot');
            uiRoot.layer = Layers.Enum.UI_2D;
            const canvasTransform = this.node.getComponent(UITransform);
            const uiTransform = uiRoot.addComponent(UITransform);
            if (canvasTransform) {
                uiTransform.setContentSize(canvasTransform.contentSize);
            }
            uiRoot.setPosition(new Vec3(0, 0, 0));
            this.node.addChild(uiRoot);
        }

        const canvasTransform = this.node.getComponent(UITransform);
        const uiTransform = uiRoot.getComponent(UITransform);
        if (canvasTransform && uiTransform) {
            uiTransform.setContentSize(canvasTransform.contentSize);
            this.lastRootWidth = canvasTransform.contentSize.width;
            this.lastRootHeight = canvasTransform.contentSize.height;
        }

        return uiRoot;
    }

    private rebuildView(): void {
        if (this.view) {
            this.view.destroyView();
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
        this.render();
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
        this.lockedPreplaceAnchor = null;
        this.hoverAnchor = null;
        this.currentRotation = 0;
        this.lastRotationStep = 0;
        this.selectHand(index);
    }

    private setPreplaceHover(anchor: GridPos | null): void {
        if (this.lockedPreplaceAnchor !== null) {
            return;
        }
        this.hoverAnchor = anchor;
        this.render();
    }

    /** 预放置状态2：在棋盘上拖拽更换锚点 */
    private updateLockedPreplaceAnchor(anchor: GridPos): void {
        if (this.lockedPreplaceAnchor === null) {
            return;
        }
        this.lockedPreplaceAnchor = anchor;
        this.hoverAnchor = anchor;
        this.render();
    }

    private commitPreplaceState2(anchor: GridPos): void {
        this.lockedPreplaceAnchor = anchor;
        this.hoverAnchor = anchor;
        this.render();
    }

    private cancelPreplace(): void {
        this.lockedPreplaceAnchor = null;
        this.hoverAnchor = null;
        this.currentRotation = 0;
        this.lastRotationStep = 0;
        this.render();
    }

    private confirmPreplacePlace(): void {
        if (!this.model || this.model.status !== 'playing' || this.lockedPreplaceAnchor === null) {
            return;
        }

        const anchor = this.lockedPreplaceAnchor;
        const removedIdx = this.selectedHandIndex;
        const oldIds: (string | null)[] = this.model.hand.map((card) => card.id);
        const handSnap = this.view?.captureHandLayoutSnapshot();
        const result = this.model.placeFromHand(removedIdx, anchor, this.currentRotation);
        if (result.isValid) {
            this.currentRotation = 0;
            this.lastRotationStep = 0;
            this.hoverAnchor = null;
            this.lockedPreplaceAnchor = null;
            this.normalizeSelection();
            if (this.view && handSnap) {
                this.view.scheduleHandRefillAnimation(removedIdx, handSnap, oldIds);
            }
        }
        this.render();
    }

    private selectHand(index: number): void {
        if (!this.model || index < 0 || index >= this.model.hand.length) {
            return;
        }

        this.selectedHandIndex = index;
        this.currentRotation = 0;
        this.lastRotationStep = 0;
        this.render();
    }

    private rotate(direction: number): void {
        if (!this.model || this.model.status !== 'playing' || !this.model.getCardAtHand(this.selectedHandIndex)) {
            return;
        }

        const card = this.model.getCardAtHand(this.selectedHandIndex)!;
        const currentAnchor = this.lockedPreplaceAnchor ?? this.hoverAnchor;
        const nextRotation = (this.currentRotation + direction + 4) % 4;
        if (currentAnchor) {
            const adjustedAnchor = this.getRotatedAnchorWithKick(card, currentAnchor, this.currentRotation, nextRotation as Rotation);
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

    private getRotatedAnchorWithKick(card: NonNullable<ReturnType<GameModel['getCardAtHand']>>, anchor: GridPos, from: Rotation, to: Rotation): GridPos {
        const kickCandidates = this.getRotationKickCandidates(from, to);

        for (const kick of kickCandidates) {
            const candidate = {
                x: anchor.x + kick.x,
                y: anchor.y + kick.y,
            };
            if (this.isAnchorInsideBoard(card, candidate, to)) {
                return candidate;
            }
        }

        return anchor;
    }

    /**
     * 参考俄罗斯方块 JLSTZ 的 wall kick 顺序，换算到当前 y 轴向下的棋盘坐标。
     * 优先尝试原地旋转；只有贴边时才依次尝试补位，避免异形块在空旷区域无故位移。
     */
    private getRotationKickCandidates(from: Rotation, to: Rotation): GridPos[] {
        const key = `${from}->${to}`;
        const map: Record<string, GridPos[]> = {
            '0->1': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
            '1->0': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
            '1->2': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
            '2->1': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
            '2->3': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
            '3->2': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
            '3->0': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
            '0->3': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
        };
        return map[key] ?? [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 },
        ];
    }

    private isAnchorInsideBoard(card: NonNullable<ReturnType<GameModel['getCardAtHand']>>, anchor: GridPos, rotation: Rotation): boolean {
        const bounds = getCardBounds(rotateCardCells(card.cells, rotation));
        return anchor.x >= 0
            && anchor.y >= 0
            && anchor.x <= BOARD_COLS - bounds.width
            && anchor.y <= BOARD_ROWS - bounds.height;
    }

    private gmDrawCard(): void {
        if (!this.model) {
            return;
        }
        const oldIds: (string | null)[] = this.model.hand.map((card) => card.id);
        const handSnap = this.view?.captureHandLayoutSnapshot();
        const drew = this.model.drawOneCardToHand();
        this.normalizeSelection();
        if (drew && this.view && handSnap) {
            this.view.scheduleHandRefillAnimation(-1, handSnap, oldIds);
        }
        this.render();
    }

    private gmAddScore(): void {
        if (!this.model) {
            return;
        }
        this.model.gmAddScore(3);
        this.render();
    }

    private gmAddRottenCharge(): void {
        if (!this.model) {
            return;
        }
        this.model.gmAddRottenCharge(1);
        this.render();
    }

    private gmRestart(): void {
        if (!this.model) {
            return;
        }
        this.model.startNewGame();
        this.currentRotation = 0;
        this.lastRotationStep = 0;
        this.hoverAnchor = null;
        this.lockedPreplaceAnchor = null;
        this.view?.resetTimeWheel();
        this.normalizeSelection();
        this.render();
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

        return this.model.hand.map((card, index) => {
            return {
                index,
                card,
                selected: index === this.selectedHandIndex,
                canPlace: !!card && this.model!.canCardBePlaced(card),
            };
        });
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

        this.view.render(state);
    }
}
