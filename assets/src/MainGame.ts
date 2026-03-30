import { _decorator, Canvas, Color, Component, Graphics, Layers, Node, UITransform, Vec3 } from 'cc';
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
const DESIGN_WIDTH = 720;
const DESIGN_HEIGHT = 1280;
const SAFE_FRAME_PADDING = 14;
const SAFE_FRAME_RADIUS = 26;
const SAFE_CONTENT_MARGIN_X = 28;
const SAFE_CONTENT_MARGIN_Y = 40;

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
        const safeContentWidth = DESIGN_WIDTH - SAFE_CONTENT_MARGIN_X * 2;
        const safeContentHeight = DESIGN_HEIGHT - SAFE_CONTENT_MARGIN_Y * 2;
        const canvasTransform = this.node.getComponent(UITransform);
        if (!canvasTransform) {
            const fallbackRoot = new Node('DemoContent');
            fallbackRoot.layer = Layers.Enum.UI_2D;
            fallbackRoot.addComponent(UITransform).setContentSize(safeContentWidth, safeContentHeight);
            return fallbackRoot;
        }

        let shell = this.node.getChildByName('DemoRoot');
        if (!shell) {
            shell = new Node('DemoRoot');
            shell.layer = Layers.Enum.UI_2D;
            shell.addComponent(UITransform);
            this.node.addChild(shell);
        }

        const shellTransform = shell.getComponent(UITransform)!;
        shellTransform.setContentSize(canvasTransform.contentSize);
        this.lastRootWidth = canvasTransform.contentSize.width;
        this.lastRootHeight = canvasTransform.contentSize.height;

        let shellBackground = shell.getChildByName('ViewportBackground');
        if (!shellBackground) {
            shellBackground = new Node('ViewportBackground');
            shellBackground.layer = Layers.Enum.UI_2D;
            shellBackground.addComponent(UITransform);
            shellBackground.addComponent(Graphics);
            shell.addChild(shellBackground);
        }
        shellBackground.setPosition(Vec3.ZERO);
        const shellBgTransform = shellBackground.getComponent(UITransform)!;
        shellBgTransform.setContentSize(canvasTransform.contentSize);
        const shellBgGraphics = shellBackground.getComponent(Graphics)!;
        shellBgGraphics.clear();
        shellBgGraphics.fillColor = new Color(250, 245, 232, 255);
        shellBgGraphics.rect(
            -canvasTransform.contentSize.width / 2,
            -canvasTransform.contentSize.height / 2,
            canvasTransform.contentSize.width,
            canvasTransform.contentSize.height,
        );
        shellBgGraphics.fill();

        const scale = Math.min(
            canvasTransform.contentSize.width / DESIGN_WIDTH,
            canvasTransform.contentSize.height / DESIGN_HEIGHT,
        );

        let safeArea = shell.getChildByName('DemoSafeArea');
        if (!safeArea) {
            safeArea = new Node('DemoSafeArea');
            safeArea.layer = Layers.Enum.UI_2D;
            safeArea.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
            shell.addChild(safeArea);
        }
        safeArea.setPosition(Vec3.ZERO);
        safeArea.setScale(scale, scale, 1);
        safeArea.getComponent(UITransform)?.setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);

        let contentRoot = safeArea.getChildByName('DemoContent');
        if (!contentRoot) {
            contentRoot = new Node('DemoContent');
            contentRoot.layer = Layers.Enum.UI_2D;
            contentRoot.addComponent(UITransform);
            safeArea.addChild(contentRoot);
        }
        contentRoot.setPosition(Vec3.ZERO);
        contentRoot.getComponent(UITransform)?.setContentSize(safeContentWidth, safeContentHeight);

        let safeFrame = shell.getChildByName('DemoSafeFrame');
        if (!safeFrame) {
            safeFrame = new Node('DemoSafeFrame');
            safeFrame.layer = Layers.Enum.UI_2D;
            safeFrame.addComponent(UITransform).setContentSize(DESIGN_WIDTH, DESIGN_HEIGHT);
            safeFrame.addComponent(Graphics);
            shell.addChild(safeFrame);
        }
        safeFrame.setPosition(Vec3.ZERO);
        safeFrame.setScale(scale, scale, 1);
        const safeFrameGraphics = safeFrame.getComponent(Graphics)!;
        safeFrameGraphics.clear();
        safeFrameGraphics.lineWidth = 4;
        safeFrameGraphics.strokeColor = new Color(160, 146, 112, 220);
        safeFrameGraphics.roundRect(
            -DESIGN_WIDTH / 2 + SAFE_FRAME_PADDING,
            -DESIGN_HEIGHT / 2 + SAFE_FRAME_PADDING,
            DESIGN_WIDTH - SAFE_FRAME_PADDING * 2,
            DESIGN_HEIGHT - SAFE_FRAME_PADDING * 2,
            SAFE_FRAME_RADIUS,
        );
        safeFrameGraphics.stroke();

        return contentRoot;
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
