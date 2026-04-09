import {
    Color,
    EventMouse,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Input,
    Label,
    Layers,
    Node,
    Sprite,
    SpriteFrame,
    Tween,
    UIOpacity,
    UITransform,
    Vec3,
    VerticalTextAlignment,
    input,
    resources,
    tween,
} from 'cc';
import {
    BOARD_COLS,
    BOARD_ROWS,
    CARD_TEMPLATE_COLS,
    CARD_TEMPLATE_ROWS,
    FruitColor,
    GameViewState,
    GridPos,
    HAND_SIZE,
    HandSlotState,
    Rotation,
    getCardMainTypeLabel,
    isBoardPlacementCard,
    getCardBounds,
    rotateCardCells,
} from './GameTypes';

export interface GameViewCallbacks {
    onRotateLeft: () => void;
    onRotateRight: () => void;
    onBeginPlacementDrag: (index: number) => void;
    onPreplaceHoverAnchor: (anchor: GridPos | null) => void;
    onPreplaceCommitState2: (anchor: GridPos) => void;
    onLockedPreplaceAnchorUpdate: (anchor: GridPos) => void;
    onPreplaceCancel: () => void;
    onPreplaceConfirmPlace: () => void;
    onGmDrawCard: () => void;
    onGmAddScore: () => void;
    onGmAddRottenCharge: () => void;
    onGmRestart: () => void;
}

interface HandCardView {
    node: Node;
    graphics: Graphics;
    artRoot: Node;
    artCells: HandCardArtCellView[];
    costLabel: Label;
    title: Label;
    descLabel: Label;
    typeLabel: Label;
}

interface HandCardArtCellView {
    node: Node;
    graphics: Graphics;
    sprite: Sprite;
}

interface BoardPlantCellView {
    node: Node;
    graphics: Graphics;
    sprite: Sprite;
    row: number;
    col: number;
    preview: boolean;
}

interface BoardParcelCellView {
    node: Node;
    sprite: Sprite;
    row: number;
    col: number;
}

interface TopInfoView {
    progressGraphics: Graphics;
    progressLabel: Label;
    statsLabel: Label;
    reserveGraphics: Graphics;
    reserveLabel: Label;
    timeWheelOuterNode: Node;
    timeWheelInnerNode: Node;
    timeWheelCenterNode: Node;
    timeWheelPointerNode: Node;
    timeWheelYearLabel: Label;
    timeWheelSeasonLabel: Label;
    gmButton: Node;
    gmPopup: Node;
}

interface PreplaceButtonView {
    title: string;
    node: Node;
}

type PreplacePhase = 'idle' | 'preplace1_track' | 'preplace2';

function makeColor(r: number, g: number, b: number, a = 255): Color {
    return new Color(r, g, b, a);
}

function fruitColor(color: FruitColor, alpha = 255): Color {
    switch (color) {
        case 'red':
            return makeColor(242, 102, 95, alpha);
        case 'yellow':
            return makeColor(242, 205, 84, alpha);
        case 'purple':
        default:
            return makeColor(149, 115, 216, alpha);
    }
}

function rotationToText(rotation: Rotation): string {
    return `${rotation * 90}°`;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export interface HandLayoutSnapshot {
    positions: Vec3[];
    eulers: Vec3[];
}

const TIME_WHEEL_YEAR_COUNT = 12;
const TIME_WHEEL_YEAR_LABELS = Array.from({ length: TIME_WHEEL_YEAR_COUNT }, (_, index) => `第${index + 1}年`);
const TIME_WHEEL_SEASONS = ['春', '夏', '秋', '冬'] as const;
const PLANT_SPRITE_PATHS = [
    'icon/zhiwu/zhiwu_1/spriteFrame',
    'icon/zhiwu/zhiwu_2/spriteFrame',
    'icon/zhiwu/zhiwu_3/spriteFrame',
    'icon/zhiwu/zhiwu_4/spriteFrame',
    'icon/zhiwu/zhiwu_5/spriteFrame',
    'icon/zhiwu/zhiwu_6/spriteFrame',
    'icon/zhiwu/zhiwu_7/spriteFrame',
    'icon/zhiwu/zhiwu_8/spriteFrame',
    'icon/zhiwu/zhiwu_9/spriteFrame',
    'icon/zhiwu/zhiwu_10/spriteFrame',
    'icon/zhiwu/zhiwu_11/spriteFrame',
] as const;
const TIME_WHEEL_SPRITE_PATHS = {
    outer: 'ui/timewheel/zhuanpan_waiquan/spriteFrame',
    inner: 'ui/timewheel/zhuanpan_neiquan/spriteFrame',
    center: 'ui/timewheel/zhuanpan_zhongxin/spriteFrame',
    pointer: 'ui/timewheel/jiantou_icon/spriteFrame',
} as const;

function flashAlpha(phase: number, base: number, amplitude: number): number {
    const w = 0.5 + 0.5 * Math.sin(phase * 2.4);
    return clamp(base + amplitude * w, 0, 255);
}

export class GameView {
    private readonly root: Node;
    private readonly callbacks: GameViewCallbacks;
    private readonly spriteFrameCache = new Map<string, SpriteFrame>();
    private readonly spriteFrameWaiters = new Map<string, Set<Sprite>>();

    private rootWidth = 720;
    private rootHeight = 1280;
    private panelWidth = 680;
    private boardSize = 620;
    private boardCenterY = 40;
    private topPanelHeight = 150;
    private messagePanelHeight = 70;
    private handPanelHeight = 220;
    private handCardWidth = 180;
    private handCardHeight = 180;

    private readonly boardNode: Node;
    private readonly boardGraphics: Graphics;
    private readonly cellLabels: Label[][] = [];
    private readonly levelLabels: Label[][] = [];
    private readonly boardParcelViews: BoardParcelCellView[] = [];
    private readonly boardPlantViews: BoardPlantCellView[] = [];
    private readonly previewPlantViews: BoardPlantCellView[] = [];
    private readonly topInfoView: TopInfoView;
    private readonly messageLabel: Label;
    private readonly handViews: HandCardView[] = [];
    private readonly preplaceButtons: PreplaceButtonView[] = [];
    private handPanel: Node | null = null;
    private dragArrow: Graphics | null = null;
    private preplaceBar: Node | null = null;
    private lastRenderState: GameViewState | null = null;

    private preplacePhase: PreplacePhase = 'idle';
    private preplaceHandIndex: number | null = null;
    private preplace2BoardDragging = false;
    private preplace2PointerDown = false;
    private preplace2PointerStartX = 0;
    private preplace2PointerStartY = 0;
    private preplaceBoardInputSuppressUntil = 0;

    /** 悬停手牌：抬高、放大、置顶 */
    private hoverHandIndex: number | null = null;
    /** 预放置阶段1：向上拖拽的额外 Y（UI 坐标，向上为正） */
    private handDragStartY = 0;
    private handDragLiftY = 0;

    /** 补牌 / 手牌归位动画进行中，不覆盖节点坐标 */
    private handRefillAnimRunning = false;
    private pendingHandRefillAnim: {
        removedIdx: number;
        snap: HandLayoutSnapshot;
        oldIds: (string | null)[];
    } | null = null;

    /** 状态2旋转时，对当前预览补角度和位移过渡，避免长条/L 形出现视觉跳位 */
    private readonly previewRotateTweenState = { extraDeg: 0, offsetX: 0, offsetY: 0 };
    private previewRotateAnchorKey = '';
    private previewRotateLogical: Rotation = 0;
    private readonly previewDropPulseState = { value: 0 };
    private lastPreplaceButtonTitle = '';
    private lastPreplaceButtonAt = 0;
    private gmPopupOpen = false;
    private timeWheelYearIndex = 0;
    private timeWheelSeasonIndex = 0;

    constructor(root: Node, callbacks: GameViewCallbacks) {
        this.root = root;
        this.callbacks = callbacks;
        this.root.removeAllChildren();
        this.measureLayout();

        this.createBackground();
        this.topInfoView = this.createTopInfo();
        this.messageLabel = this.createMessage();
        this.boardNode = this.createBoard();
        this.boardGraphics = this.boardNode.getChildByName('BoardOverlay')!.getComponent(Graphics)!;
        this.createHandArea();
        this.createDragArrowOnly();
        this.createPreplaceBar();
        this.bindGlobalInput();
    }

    public render(state: GameViewState): void {
        if (this.pendingHandRefillAnim) {
            const p = this.pendingHandRefillAnim;
            this.pendingHandRefillAnim = null;
            this.startHandRefillAnimation(p.removedIdx, p.snap, p.oldIds, state.handSlots);
        }
        this.syncPreviewRotateTween(state);
        this.lastRenderState = state;
        this.renderTopInfo(state);

        const statusText = state.status === 'playing'
            ? state.preview
                ? state.preview.reason
                : state.message
            : `${state.message}`;
        this.messageLabel.string = statusText;

        this.syncPreplaceBar(state);
        this.drawBoard(state);
        this.renderHand(state.handSlots);
        this.refreshArcAndBarPosition(state);
    }

    public destroyView(): void {
        this.cancelPreplaceFlow(true);
        this.pendingHandRefillAnim = null;
        this.handRefillAnimRunning = false;
        this.hoverHandIndex = null;
        this.resetPreviewRotateState();
        Tween.stopAllByTarget(this.previewDropPulseState);
        Tween.stopAllByTarget(this.topInfoView.timeWheelOuterNode);
        Tween.stopAllByTarget(this.topInfoView.timeWheelInnerNode);
        for (const v of this.handViews) {
            Tween.stopAllByTarget(v.node);
        }
        input.off(Input.EventType.MOUSE_DOWN, this.onGlobalMouseDown, this);
        input.off(Input.EventType.TOUCH_START, this.onGlobalTouchStart, this);
    }

    /** 出牌前记录手牌节点位置，供补牌动画使用 */
    public captureHandLayoutSnapshot(): HandLayoutSnapshot {
        return {
            positions: this.handViews.map((v) => v.node.position.clone()),
            eulers: this.handViews.map((v) => v.node.eulerAngles.clone()),
        };
    }

    public scheduleHandRefillAnimation(removedIdx: number, snap: HandLayoutSnapshot, oldIds: (string | null)[]): void {
        this.pendingHandRefillAnim = { removedIdx, snap, oldIds };
    }

    private resetPreviewRotateState(): void {
        Tween.stopAllByTarget(this.previewRotateTweenState);
        this.previewRotateTweenState.extraDeg = 0;
        this.previewRotateTweenState.offsetX = 0;
        this.previewRotateTweenState.offsetY = 0;
        this.previewRotateAnchorKey = '';
        this.previewRotateLogical = 0;
    }

    private loadSpriteFrameByPath(path: string, sprite: Sprite): void {
        const spriteNode = sprite.node as Node & { __spriteFramePath?: string };
        spriteNode.__spriteFramePath = path;
        const cached = this.spriteFrameCache.get(path);
        if (cached) {
            if (sprite.spriteFrame !== cached) {
                sprite.spriteFrame = cached;
            }
            this.applyPlantSpriteFitFromNode(sprite);
            return;
        }
        const waiters = this.spriteFrameWaiters.get(path);
        if (waiters) {
            waiters.add(sprite);
            return;
        }
        this.spriteFrameWaiters.set(path, new Set([sprite]));
        resources.load(path, SpriteFrame, (error: Error | null, asset: SpriteFrame | null) => {
            const pendingSprites = this.spriteFrameWaiters.get(path);
            this.spriteFrameWaiters.delete(path);
            if (error || !asset || !pendingSprites) {
                return;
            }
            this.spriteFrameCache.set(path, asset);
            pendingSprites.forEach((pendingSprite) => {
                const pendingNode = pendingSprite.node as Node & { __spriteFramePath?: string };
                if (!pendingSprite.node?.isValid || pendingNode.__spriteFramePath !== path) {
                    return;
                }
                pendingSprite.spriteFrame = asset;
                this.applyPlantSpriteFitFromNode(pendingSprite);
            });
        });
    }

    private setPlantSpriteFit(sprite: Sprite, maxWidth: number, maxHeight: number, bottomY?: number): void {
        (sprite.node as Node & { __plantFit?: { width: number; height: number; bottomY?: number } }).__plantFit = {
            width: maxWidth,
            height: maxHeight,
            bottomY,
        };
        this.applyPlantSpriteFitFromNode(sprite);
    }

    private getPlantSpritePathByVariant(variant: number | null): string {
        const safeIndex = Math.abs(variant ?? 0) % PLANT_SPRITE_PATHS.length;
        return PLANT_SPRITE_PATHS[safeIndex];
    }

    private applyPlantSpriteFitFromNode(sprite: Sprite): void {
        const fit = (sprite.node as Node & { __plantFit?: { width: number; height: number; bottomY?: number } }).__plantFit;
        const transform = sprite.node.getComponent(UITransform);
        if (!fit || !transform) {
            return;
        }
        const frame = sprite.spriteFrame;
        if (!frame) {
            transform.setContentSize(fit.width, fit.height);
            return;
        }
        const original = frame.originalSize;
        const ow = Math.max(original.width, 1);
        const oh = Math.max(original.height, 1);
        const scale = Math.min(fit.width / ow, fit.height / oh);
        const width = Math.max(1, ow * scale);
        const height = Math.max(1, oh * scale);
        transform.setContentSize(width, height);
        if (fit.bottomY !== undefined) {
            sprite.node.setPosition(0, fit.bottomY + height / 2, 0);
        }
    }

    private getTimeWheelDisplaySize(): number {
        return clamp((this.topPanelHeight - 28) * 1.12, 180, 228);
    }

    private getMaxHandDragLift(): number {
        const defaultMax = clamp(this.handCardHeight * 0.75, 90, 150);
        if (!this.handPanel) {
            return defaultMax;
        }
        const boardBottom = this.boardCenterY - this.boardSize / 2;
        const handPanelTop = this.handPanel.position.y + this.handPanelHeight / 2;
        const visualReserve = this.handCardHeight * 0.5;
        const safeLift = boardBottom - handPanelTop - visualReserve;
        return clamp(Math.min(defaultMax, safeLift), 28, defaultMax);
    }

    private createBackground(): void {
        const node = this.makeNode('Background', this.rootWidth, this.rootHeight, 0, 0);
        const graphics = node.addComponent(Graphics);
        graphics.fillColor = makeColor(250, 245, 232, 255);
        graphics.rect(-this.rootWidth / 2, -this.rootHeight / 2, this.rootWidth, this.rootHeight);
        graphics.fill();
        this.root.addChild(node);
    }

    private createTopInfo(): TopInfoView {
        const topPadding = clamp(this.rootHeight * 0.02, 18, 32);
        const y = this.rootHeight / 2 - topPadding - this.topPanelHeight / 2;
        const panel = this.makePanel('TopPanel', this.panelWidth, this.topPanelHeight, 0, y, makeColor(255, 255, 255, 210));
        this.root.addChild(panel);

        const panelLeft = -this.panelWidth / 2;
        const panelRight = this.panelWidth / 2;
        const wheelSize = this.getTimeWheelDisplaySize();
        const progressY = this.topPanelHeight / 2 - 28;
        const wheelX = panelLeft + 8 + wheelSize / 2;
        const wheelY = progressY + 13 - wheelSize / 2;

        const timeWheelNode = this.makeNode('TimeWheel', wheelSize, wheelSize, wheelX, wheelY);
        panel.addChild(timeWheelNode);

        const timeWheelOuterNode = this.makeNode('TimeWheelOuter', wheelSize, wheelSize, 0, 0);
        const timeWheelOuterSprite = timeWheelOuterNode.addComponent(Sprite);
        timeWheelOuterSprite.sizeMode = Sprite.SizeMode.CUSTOM;
        timeWheelNode.addChild(timeWheelOuterNode);

        const timeWheelInnerNode = this.makeNode('TimeWheelInner', wheelSize * 0.79, wheelSize * 0.79, 0, 0);
        const timeWheelInnerSprite = timeWheelInnerNode.addComponent(Sprite);
        timeWheelInnerSprite.sizeMode = Sprite.SizeMode.CUSTOM;
        timeWheelNode.addChild(timeWheelInnerNode);

        const timeWheelCenterNode = this.makeNode('TimeWheelCenter', wheelSize * 0.42, wheelSize * 0.42, 0, 0);
        const timeWheelCenterSprite = timeWheelCenterNode.addComponent(Sprite);
        timeWheelCenterSprite.sizeMode = Sprite.SizeMode.CUSTOM;
        timeWheelNode.addChild(timeWheelCenterNode);

        const timeWheelPointerNode = this.makeNode('TimeWheelPointer', wheelSize * 0.11, wheelSize * 0.075, 0, wheelSize * 0.35);
        const timeWheelPointerSprite = timeWheelPointerNode.addComponent(Sprite);
        timeWheelPointerSprite.sizeMode = Sprite.SizeMode.CUSTOM;
        timeWheelNode.addChild(timeWheelPointerNode);

        const wheelCenterSize = wheelSize * 0.34;
        const timeWheelYearLabel = this.createLabel(
            timeWheelCenterNode,
            'TimeWheelYearLabel',
            wheelCenterSize * 1.55,
            32,
            0,
            18,
            clamp(this.rootWidth * 0.032, 20, 28),
            HorizontalTextAlignment.CENTER,
            VerticalTextAlignment.CENTER,
        );
        timeWheelYearLabel.color = makeColor(112, 78, 52, 255);
        const timeWheelSeasonLabel = this.createLabel(
            timeWheelCenterNode,
            'TimeWheelSeasonLabel',
            wheelCenterSize * 1.2,
            38,
            0,
            -20,
            clamp(this.rootWidth * 0.05, 28, 40),
            HorizontalTextAlignment.CENTER,
            VerticalTextAlignment.CENTER,
        );
        timeWheelSeasonLabel.color = makeColor(112, 78, 52, 255);

        this.loadSpriteFrameByPath(TIME_WHEEL_SPRITE_PATHS.outer, timeWheelOuterSprite);
        this.loadSpriteFrameByPath(TIME_WHEEL_SPRITE_PATHS.inner, timeWheelInnerSprite);
        this.loadSpriteFrameByPath(TIME_WHEEL_SPRITE_PATHS.center, timeWheelCenterSprite);
        this.loadSpriteFrameByPath(TIME_WHEEL_SPRITE_PATHS.pointer, timeWheelPointerSprite);

        const contentLeft = wheelX + wheelSize / 2 + 22;
        const contentRight = panelRight - 16;
        const contentWidth = contentRight - contentLeft;
        const gmWidth = 68;
        const gmX = contentRight - gmWidth / 2;
        const progressWidth = Math.max(160, contentWidth - gmWidth - 18);
        const progressCenterX = contentLeft + progressWidth / 2;

        const progressNode = this.makeNode('ScoreProgress', progressWidth, 26, progressCenterX, progressY);
        const progressGraphics = progressNode.addComponent(Graphics);
        panel.addChild(progressNode);

        const progressLabel = this.createLabel(
            panel,
            'ScoreProgressLabel',
            progressWidth - 18,
            26,
            progressCenterX,
            progressY,
            clamp(this.rootWidth * 0.026, 15, 18),
            HorizontalTextAlignment.CENTER,
            VerticalTextAlignment.CENTER,
        );
        progressLabel.color = makeColor(92, 70, 36, 255);

        const lowerTop = progressY - 18;
        const lowerHeight = this.topPanelHeight - 58;
        const statsWidth = Math.max(110, contentWidth * 0.28);
        const reserveWidth = Math.max(140, contentWidth - statsWidth - 16);
        const statsX = contentLeft + statsWidth / 2;
        const reserveX = contentLeft + statsWidth + 16 + reserveWidth / 2;
        const lowerCenterY = lowerTop - lowerHeight / 2;

        const statsLabel = this.createLabel(
            panel,
            'InfoStatsLabel',
            statsWidth,
            lowerHeight,
            statsX,
            lowerCenterY,
            clamp(this.rootWidth * 0.028, 16, 20),
            HorizontalTextAlignment.LEFT,
            VerticalTextAlignment.CENTER,
        );

        const reserveLabel = this.createLabel(
            panel,
            'ReserveLabel',
            reserveWidth - 18,
            lowerHeight - 12,
            reserveX,
            lowerCenterY,
            clamp(this.rootWidth * 0.024, 13, 16),
            HorizontalTextAlignment.LEFT,
            VerticalTextAlignment.CENTER,
        );
        reserveLabel.color = makeColor(132, 118, 96, 255);

        const reserveNode = this.makeNode(
            'ReservePanel',
            reserveWidth,
            lowerHeight,
            reserveX,
            lowerCenterY,
        );
        const reserveGraphics = reserveNode.addComponent(Graphics);
        panel.addChild(reserveNode);
        reserveNode.setSiblingIndex(panel.children.length - 2);

        const gmButton = this.makePanel(
            'GmButton',
            gmWidth,
            30,
            gmX,
            progressY,
            makeColor(229, 235, 248, 255),
        );
        const gmButtonGraphics = gmButton.getComponent(Graphics)!;
        gmButtonGraphics.lineWidth = 2;
        gmButtonGraphics.strokeColor = makeColor(84, 104, 148, 255);
        gmButtonGraphics.roundRect(-34, -15, 68, 30, 10);
        gmButtonGraphics.stroke();
        const gmLabel = this.createLabel(gmButton, 'GmButtonLabel', 60, 24, 0, 0, 16, HorizontalTextAlignment.CENTER, VerticalTextAlignment.CENTER);
        gmLabel.string = 'GM';
        gmLabel.color = makeColor(84, 104, 148, 255);
        panel.addChild(gmButton);

        const gmPopup = this.makeNode('GmPopup', 156, 198, gmX - 10, lowerCenterY);
        const gmPopupGraphics = gmPopup.addComponent(Graphics);
        gmPopupGraphics.fillColor = makeColor(255, 252, 244, 255);
        gmPopupGraphics.roundRect(-78, -99, 156, 198, 12);
        gmPopupGraphics.fill();
        gmPopupGraphics.lineWidth = 2;
        gmPopupGraphics.strokeColor = makeColor(171, 141, 96, 255);
        gmPopupGraphics.roundRect(-78, -99, 156, 198, 12);
        gmPopupGraphics.stroke();
        gmPopup.active = false;
        panel.addChild(gmPopup);

        const gmPopupTitle = this.createLabel(gmPopup, 'GmPopupTitle', 130, 22, 0, 72, 15, HorizontalTextAlignment.CENTER, VerticalTextAlignment.CENTER);
        gmPopupTitle.string = 'GM 工具栏';

        const togglePopup = (): void => {
            this.gmPopupOpen = !this.gmPopupOpen;
            gmPopup.active = this.gmPopupOpen;
        };
        gmButton.on(Node.EventType.MOUSE_DOWN, (event: EventMouse) => {
            if (event.getButton() !== EventMouse.BUTTON_LEFT) {
                return;
            }
            event.propagationStopped = true;
            togglePopup();
        }, this);
        gmButton.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
            togglePopup();
        }, this);
        this.createGmPopupButton(gmPopup, '抽牌', 34, makeColor(214, 242, 198, 255), makeColor(76, 138, 64, 255), () => this.callbacks.onGmDrawCard());
        this.createGmPopupButton(gmPopup, '+3 分', -8, makeColor(234, 229, 249, 255), makeColor(101, 87, 155, 255), () => this.callbacks.onGmAddScore());
        this.createGmPopupButton(gmPopup, '+1 烂果', -50, makeColor(250, 228, 199, 255), makeColor(170, 112, 44, 255), () => this.callbacks.onGmAddRottenCharge());
        this.createGmPopupButton(gmPopup, '重开', -92, makeColor(244, 230, 230, 255), makeColor(160, 88, 88, 255), () => this.callbacks.onGmRestart());

        return {
            progressGraphics,
            progressLabel,
            statsLabel,
            reserveGraphics,
            reserveLabel,
            timeWheelOuterNode,
            timeWheelInnerNode,
            timeWheelCenterNode,
            timeWheelPointerNode,
            timeWheelYearLabel,
            timeWheelSeasonLabel,
            gmButton,
            gmPopup,
        };
    }

    private createGmPopupButton(
        parent: Node,
        title: string,
        y: number,
        fillColor: Color,
        strokeColor: Color,
        onClick: () => void,
    ): void {
        const button = this.makePanel(`GmPopupButton-${title}`, 108, 32, 0, y, fillColor);
        const graphics = button.getComponent(Graphics)!;
        graphics.lineWidth = 2;
        graphics.strokeColor = strokeColor;
        graphics.roundRect(-54, -16, 108, 32, 10);
        graphics.stroke();
        const label = this.createLabel(button, `GmPopupButtonLabel-${title}`, 96, 22, 0, 0, 14, HorizontalTextAlignment.CENTER, VerticalTextAlignment.CENTER);
        label.string = title;
        label.color = strokeColor;

        const trigger = (): void => {
            onClick();
            this.gmPopupOpen = false;
            this.topInfoView.gmPopup.active = false;
        };
        button.on(Node.EventType.MOUSE_DOWN, (event: EventMouse) => {
            if (event.getButton() !== EventMouse.BUTTON_LEFT) {
                return;
            }
            event.propagationStopped = true;
            trigger();
        }, this);
        button.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
            trigger();
        }, this);
        parent.addChild(button);
    }

    private createMessage(): Label {
        const panel = this.makeNode('MessagePanel', 1, 1, 0, 0);
        panel.active = false;
        this.root.addChild(panel);
        const label = this.createLabel(
            panel,
            'MessageLabel',
            1,
            1,
            0,
            0,
            1,
            HorizontalTextAlignment.LEFT,
            VerticalTextAlignment.CENTER,
        );
        label.color = makeColor(78, 63, 43, 255);
        return label;
    }

    private createBoard(): Node {
        const board = this.makePanel('Board', this.boardSize, this.boardSize, 0, this.boardCenterY, makeColor(248, 243, 224, 255));
        this.root.addChild(board);

        const boardTransform = board.getComponent(UITransform)!;
        board.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            this.onBoardPointerDown(boardTransform, event.getUILocation().x, event.getUILocation().y);
        });
        board.on(Node.EventType.MOUSE_DOWN, (event: EventMouse) => {
            if (event.getButton() !== EventMouse.BUTTON_LEFT) {
                return;
            }
            this.onBoardPointerDown(boardTransform, event.getUILocation().x, event.getUILocation().y);
        });

        const cellSize = this.boardSize / BOARD_COLS;
        const parcelLayer = this.makeNode('BoardParcelLayer', this.boardSize, this.boardSize, 0, 0);
        board.addChild(parcelLayer);
        for (let y = 0; y < BOARD_ROWS; y++) {
            for (let x = 0; x < BOARD_COLS; x++) {
                this.boardParcelViews.push(this.createBoardParcelCellView(parcelLayer, `BoardParcel-${x}-${y}`, x, y));
            }
        }
        const plantLayer = this.makeNode('BoardPlantLayer', this.boardSize, this.boardSize, 0, 0);
        board.addChild(plantLayer);
        for (let y = 0; y < BOARD_ROWS; y++) {
            for (let x = 0; x < BOARD_COLS; x++) {
                this.boardPlantViews.push(this.createBoardPlantCellView(plantLayer, `BoardPlant-${x}-${y}`, x, y, false));
            }
        }
        for (let i = 0; i < 8; i++) {
            this.previewPlantViews.push(this.createBoardPlantCellView(plantLayer, `PreviewPlant-${i}`, 0, 0, true));
        }
        const overlayNode = this.makeNode('BoardOverlay', this.boardSize, this.boardSize, 0, 0);
        overlayNode.addComponent(Graphics);
        board.addChild(overlayNode);
        for (let y = 0; y < BOARD_ROWS; y++) {
            const row: Label[] = [];
            const levelRow: Label[] = [];
            for (let x = 0; x < BOARD_COLS; x++) {
                const label = this.createLabel(
                    board,
                    `CellLabel-${x}-${y}`,
                    cellSize,
                    cellSize,
                    -this.boardSize / 2 + cellSize * (x + 0.5),
                    this.boardSize / 2 - cellSize * (y + 0.5),
                    20,
                    HorizontalTextAlignment.CENTER,
                    VerticalTextAlignment.CENTER,
                );
                row.push(label);

                const levelLabel = this.createLabel(
                    board,
                    `CellLevel-${x}-${y}`,
                    cellSize,
                    22,
                    -this.boardSize / 2 + cellSize * (x + 0.5),
                    this.boardSize / 2 - cellSize * y - cellSize * 0.835,
                    13,
                    HorizontalTextAlignment.CENTER,
                    VerticalTextAlignment.CENTER,
                );
                levelLabel.color = makeColor(246, 238, 221, 255);
                levelRow.push(levelLabel);
            }
            this.cellLabels.push(row);
            this.levelLabels.push(levelRow);
        }

        return board;
    }

    private createBoardParcelCellView(parent: Node, name: string, col: number, row: number): BoardParcelCellView {
        const node = this.makeNode(name, 10, 10, 0, 0);
        const spriteNode = this.makeNode(`${name}-Sprite`, 10, 10, 0, 0);
        const sprite = spriteNode.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        node.addChild(spriteNode);
        parent.addChild(node);
        return {
            node,
            sprite,
            row,
            col,
        };
    }

    private createBoardPlantCellView(parent: Node, name: string, col: number, row: number, preview: boolean): BoardPlantCellView {
        const node = this.makeNode(name, 10, 10, 0, 0);
        const graphics = node.addComponent(Graphics);
        const spriteNode = this.makeNode(`${name}-Sprite`, 10, 10, 0, 0);
        const sprite = spriteNode.addComponent(Sprite);
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        node.addChild(spriteNode);
        parent.addChild(node);
        node.active = false;
        return {
            node,
            graphics,
            sprite,
            row,
            col,
            preview,
        };
    }

    private onBoardPointerDown(boardTransform: UITransform, uiX: number, uiY: number): void {
        if (this.preplacePhase !== 'preplace2' || this.preplace2PointerDown || this.isPreplaceBoardInputSuppressed()) {
            return;
        }
        if (this.isPointInsideAnyPreplaceButton(uiX, uiY)) {
            return;
        }
        const anchor = this.resolveAnchor(boardTransform, uiX, uiY);
        if (!anchor) {
            return;
        }
        this.preplace2PointerDown = true;
        this.preplace2PointerStartX = uiX;
        this.preplace2PointerStartY = uiY;
        this.callbacks.onLockedPreplaceAnchorUpdate(anchor);
        input.on(Input.EventType.TOUCH_MOVE, this.onState2BoardDragMoveTouch, this);
        input.on(Input.EventType.TOUCH_END, this.onState2BoardDragEndTouch, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onState2BoardDragEndTouch, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onState2BoardDragMoveMouse, this);
        input.on(Input.EventType.MOUSE_UP, this.onState2BoardDragEndMouse, this);
    }

    private onState2BoardDragMoveTouch(event: EventTouch): void {
        this.state2BoardDragMove(event.getUILocation().x, event.getUILocation().y);
    }

    private onState2BoardDragMoveMouse(event: EventMouse): void {
        this.state2BoardDragMove(event.getUILocation().x, event.getUILocation().y);
    }

    private state2BoardDragMove(uiX: number, uiY: number): void {
        if (!this.preplace2PointerDown) {
            return;
        }
        const dx = uiX - this.preplace2PointerStartX;
        const dy = uiY - this.preplace2PointerStartY;
        const dragThreshold = 8;
        if (!this.preplace2BoardDragging && dx * dx + dy * dy < dragThreshold * dragThreshold) {
            return;
        }
        this.preplace2BoardDragging = true;
        const boardTransform = this.boardNode.getComponent(UITransform)!;
        const anchor = this.resolveAnchor(boardTransform, uiX, uiY);
        if (anchor) {
            this.callbacks.onLockedPreplaceAnchorUpdate(anchor);
        }
    }

    private onState2BoardDragEndTouch(): void {
        const hadDragged = this.preplace2BoardDragging;
        this.endState2BoardDrag();
        if (hadDragged) {
            this.playPreviewDropPulse();
        }
    }

    private onState2BoardDragEndMouse(event: EventMouse): void {
        if (event.getButton() !== EventMouse.BUTTON_LEFT) {
            return;
        }
        const hadDragged = this.preplace2BoardDragging;
        this.endState2BoardDrag();
        if (hadDragged) {
            this.playPreviewDropPulse();
        }
    }

    private endState2BoardDrag(): void {
        this.preplace2PointerDown = false;
        this.preplace2BoardDragging = false;
        input.off(Input.EventType.TOUCH_MOVE, this.onState2BoardDragMoveTouch, this);
        input.off(Input.EventType.TOUCH_END, this.onState2BoardDragEndTouch, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onState2BoardDragEndTouch, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onState2BoardDragMoveMouse, this);
        input.off(Input.EventType.MOUSE_UP, this.onState2BoardDragEndMouse, this);
    }

    private createHandArea(): void {
        const bottomPadding = clamp(this.rootHeight * 0.02, 18, 32);
        const y = -this.rootHeight / 2 + bottomPadding + this.handPanelHeight / 2;
        const panel = this.makeHandPanelRoot('HandPanel', this.panelWidth, this.handPanelHeight, 0, y);
        this.handPanel = panel;
        this.root.addChild(panel);
        this.ensureHandViewCount(HAND_SIZE);
    }

    private ensureHandViewCount(count: number): void {
        if (!this.handPanel) {
            return;
        }
        while (this.handViews.length < count) {
            const i = this.handViews.length;
            const node = this.makePanel(`HandCard-${i}`, this.handCardWidth, this.handCardHeight, 0, 0, makeColor(245, 238, 215, 255));
            const graphics = node.getComponent(Graphics)!;
            const artRoot = this.makeNode(`ArtRoot-${i}`, this.handCardWidth, this.handCardHeight, 0, 0);
            node.addChild(artRoot);
            artRoot.setSiblingIndex(0);
            const artCells: HandCardArtCellView[] = [];
            for (let y = 0; y < CARD_TEMPLATE_ROWS; y++) {
                for (let x = 0; x < CARD_TEMPLATE_COLS; x++) {
                    const cellNode = this.makeNode(`ArtCell-${i}-${x}-${y}`, 10, 10, 0, 0);
                    const cellGraphics = cellNode.addComponent(Graphics);
                    const spriteNode = this.makeNode(`ArtPlant-${i}-${x}-${y}`, 10, 10, 0, 0);
                    const sprite = spriteNode.addComponent(Sprite);
                    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
                    cellNode.addChild(spriteNode);
                    artRoot.addChild(cellNode);
                    cellNode.active = false;
                    artCells.push({
                        node: cellNode,
                        graphics: cellGraphics,
                        sprite,
                    });
                }
            }

            const costLabel = this.createLabel(
                node,
                `Cost-${i}`,
                44,
                44,
                -this.handCardWidth / 2 + 28,
                this.handCardHeight / 2 - 30,
                clamp(this.rootWidth * 0.032, 18, 22),
                HorizontalTextAlignment.CENTER,
                VerticalTextAlignment.CENTER,
            );
            costLabel.string = '0';

            const title = this.createLabel(
                node,
                `Title-${i}`,
                this.handCardWidth - 24,
                30,
                0,
                this.handCardHeight * 0.08,
                clamp(this.rootWidth * 0.03, 17, 21),
                HorizontalTextAlignment.CENTER,
                VerticalTextAlignment.CENTER,
            );

            const descLabel = this.createLabel(
                node,
                `Desc-${i}`,
                this.handCardWidth - 20,
                52,
                0,
                -this.handCardHeight * 0.22,
                clamp(this.rootWidth * 0.024, 13, 17),
                HorizontalTextAlignment.CENTER,
                VerticalTextAlignment.TOP,
            );
            descLabel.overflow = Label.Overflow.CLAMP;

            const typeLabel = this.createLabel(
                node,
                `Type-${i}`,
                this.handCardWidth - 20,
                22,
                0,
                -this.handCardHeight / 2 + 18,
                clamp(this.rootWidth * 0.022, 12, 15),
                HorizontalTextAlignment.CENTER,
                VerticalTextAlignment.CENTER,
            );

            node.on(Node.EventType.TOUCH_START, (event: EventTouch) => this.onHandCardTouchStart(i, event), this);
            node.on(Node.EventType.MOUSE_DOWN, (event: EventMouse) => this.onHandCardMouseDown(i, event), this);
            node.on(Node.EventType.MOUSE_ENTER, () => this.onHandCardMouseEnter(i), this);
            node.on(Node.EventType.MOUSE_LEAVE, () => this.onHandCardMouseLeave(i), this);

            this.handPanel.addChild(node);
            this.handViews.push({ node, graphics, artRoot, artCells, costLabel, title, descLabel, typeLabel });
        }
    }

    private makeHandPanelRoot(name: string, width: number, height: number, x: number, y: number): Node {
        const node = new Node(name);
        node.layer = Layers.Enum.UI_2D;
        const transform = node.addComponent(UITransform);
        transform.setContentSize(width, height);
        node.setPosition(new Vec3(x, y, 0));
        return node;
    }

    private createDragArrowOnly(): void {
        const arrowNode = new Node('DragArrow');
        arrowNode.layer = Layers.Enum.UI_2D;
        const arrowTransform = arrowNode.addComponent(UITransform);
        arrowTransform.setContentSize(this.rootWidth, this.rootHeight);
        arrowNode.setPosition(Vec3.ZERO);
        this.dragArrow = arrowNode.addComponent(Graphics);
        arrowNode.active = false;
        this.root.addChild(arrowNode);
    }

    private createPreplaceBar(): void {
        const bar = new Node('PreplaceBar');
        bar.layer = Layers.Enum.UI_2D;
        bar.addComponent(UITransform).setContentSize(250, 126);
        bar.setPosition(Vec3.ZERO);
        bar.active = false;

        const bw = 74;
        const bh = 42;
        const sideOffset = 88;
        const stackGap = 6;
        const groupLift = 12;
        const upperY = groupLift + bh / 2 + stackGap / 2;
        const lowerY = groupLift - bh / 2 - stackGap / 2;

        this.createPreplaceButton(bar, '旋转', -sideOffset, groupLift, bw, () => this.callbacks.onRotateRight());
        this.createPreplaceButton(bar, '放置', sideOffset, upperY, bw, () => this.callbacks.onPreplaceConfirmPlace());
        this.createPreplaceButton(bar, '取消', sideOffset, lowerY, bw, () => this.cancelPreplaceFlow());
        this.layoutPreplaceButtons(false);

        this.root.addChild(bar);
        this.preplaceBar = bar;
    }

    private createPreplaceButton(parent: Node, title: string, x: number, y: number, width: number, onClick: () => void): void {
        const h = 44;
        const fillColor = title === '放置'
            ? makeColor(214, 242, 198, 255)
            : title === '取消'
                ? makeColor(250, 216, 201, 255)
                : makeColor(244, 226, 166, 255);
        const strokeColor = title === '放置'
            ? makeColor(76, 138, 64, 255)
            : title === '取消'
                ? makeColor(176, 91, 72, 255)
                : makeColor(160, 120, 50, 255);
        const node = this.makePanel(`Pb-${title}`, width, h, x, y, fillColor);
        const graphics = node.getComponent(Graphics)!;
        graphics.lineWidth = 2;
        graphics.strokeColor = strokeColor;
        graphics.roundRect(-width / 2, -h / 2, width, h, 10);
        graphics.stroke();
        const label = this.createLabel(node, `PbL-${title}`, width - 8, h - 6, 0, 0, 18, HorizontalTextAlignment.CENTER, VerticalTextAlignment.CENTER);
        label.string = title;
        label.color = strokeColor;

        const hoverScale = 1.06;
        const pressScale = 0.95;
        const hoverLift = 4;
        const applyButtonVisual = (scale: number, liftY: number): void => {
            const basePos = this.getPreplaceButtonBasePos(node);
            Tween.stopAllByTarget(node);
            tween(node)
                .to(0.08, { scale: new Vec3(scale, scale, 1), position: new Vec3(basePos.x, basePos.y + liftY, 0) }, { easing: 'quadOut' })
                .start();
        };
        const triggerOnce = (): void => {
            const now = Date.now();
            if (this.lastPreplaceButtonTitle === title && now - this.lastPreplaceButtonAt < 80) {
                return;
            }
            this.lastPreplaceButtonTitle = title;
            this.lastPreplaceButtonAt = now;
            this.preplaceBoardInputSuppressUntil = now + 180;
            onClick();
        };

        node.on(Node.EventType.MOUSE_ENTER, () => applyButtonVisual(hoverScale, hoverLift), this);
        node.on(Node.EventType.MOUSE_LEAVE, () => applyButtonVisual(1, 0), this);
        node.on(Node.EventType.MOUSE_DOWN, (event: EventMouse) => {
            if (event.getButton() !== EventMouse.BUTTON_LEFT) {
                return;
            }
            event.propagationStopped = true;
            applyButtonVisual(pressScale, 1);
            triggerOnce();
        }, this);
        node.on(Node.EventType.MOUSE_UP, () => applyButtonVisual(hoverScale, hoverLift), this);
        node.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
            applyButtonVisual(pressScale, 1);
            triggerOnce();
        }, this);
        node.on(Node.EventType.TOUCH_END, () => applyButtonVisual(1, 0), this);
        node.on(Node.EventType.TOUCH_CANCEL, () => applyButtonVisual(1, 0), this);
        this.setPreplaceButtonBasePos(node, x, y);
        this.preplaceButtons.push({ title, node });
        parent.addChild(node);
    }

    private isPreplaceBoardInputSuppressed(): boolean {
        return Date.now() < this.preplaceBoardInputSuppressUntil;
    }

    private setPreplaceButtonBasePos(node: Node, x: number, y: number): void {
        (node as Node & { __basePos?: Vec3 }).__basePos = new Vec3(x, y, 0);
        node.setPosition(x, y, 0);
    }

    private getPreplaceButtonBasePos(node: Node): Vec3 {
        return ((node as Node & { __basePos?: Vec3 }).__basePos ?? node.position).clone();
    }

    private layoutPreplaceButtons(useTopStack: boolean): void {
        if (!this.preplaceBar) {
            return;
        }
        const transform = this.preplaceBar.getComponent(UITransform)!;
        if (useTopStack) {
            transform.setContentSize(98, 208);
            const orderedTitles = ['旋转', '放置', '取消'];
            const startY = 56;
            const gap = 46;
            for (let i = 0; i < orderedTitles.length; i++) {
                const button = this.preplaceButtons.find((item) => item.title === orderedTitles[i]);
                if (button) {
                    this.setPreplaceButtonBasePos(button.node, 0, startY - i * gap);
                }
            }
        } else {
            transform.setContentSize(250, 126);
            const sideOffset = 88;
            const centerY = 12;
            const upperY = 36;
            const lowerY = -12;
            for (const button of this.preplaceButtons) {
                if (button.title === '旋转') {
                    this.setPreplaceButtonBasePos(button.node, -sideOffset, centerY);
                } else if (button.title === '放置') {
                    this.setPreplaceButtonBasePos(button.node, sideOffset, upperY);
                } else if (button.title === '取消') {
                    this.setPreplaceButtonBasePos(button.node, sideOffset, lowerY);
                }
            }
        }
    }

    private bindGlobalInput(): void {
        input.on(Input.EventType.MOUSE_DOWN, this.onGlobalMouseDown, this);
        input.on(Input.EventType.TOUCH_START, this.onGlobalTouchStart, this);
    }

    private onGlobalTouchStart(event: EventTouch): void {
        const loc = event.getUILocation();
        if (this.isPointInsideAnyPreplaceButton(loc.x, loc.y)) {
            return;
        }
        this.tryCloseGmPopup(loc.x, loc.y);
        if (this.preplacePhase === 'preplace2') {
            const boardTransform = this.boardNode.getComponent(UITransform)!;
            this.onBoardPointerDown(boardTransform, loc.x, loc.y);
        }
    }

    private onGlobalMouseDown(event: EventMouse): void {
        const loc = event.getUILocation();
        if (this.isPointInsideAnyPreplaceButton(loc.x, loc.y)) {
            return;
        }
        this.tryCloseGmPopup(loc.x, loc.y);
        if (event.getButton() === EventMouse.BUTTON_LEFT && this.preplacePhase === 'preplace2') {
            const boardTransform = this.boardNode.getComponent(UITransform)!;
            this.onBoardPointerDown(boardTransform, loc.x, loc.y);
        }
        if (this.preplacePhase === 'idle') {
            return;
        }
        if (event.getButton() === EventMouse.BUTTON_RIGHT) {
            this.cancelPreplaceFlow();
        }
    }

    private tryCloseGmPopup(uiX: number, uiY: number): void {
        if (!this.gmPopupOpen) {
            return;
        }
        if (this.isPointInsideNode(this.topInfoView.gmButton, uiX, uiY) || this.isPointInsideNode(this.topInfoView.gmPopup, uiX, uiY)) {
            return;
        }
        this.gmPopupOpen = false;
        this.topInfoView.gmPopup.active = false;
    }

    private isPointInsideNode(node: Node, uiX: number, uiY: number): boolean {
        const transform = node.getComponent(UITransform);
        if (!transform || !node.activeInHierarchy) {
            return false;
        }
        const local = transform.convertToNodeSpaceAR(new Vec3(uiX, uiY, 0));
        const size = transform.contentSize;
        return Math.abs(local.x) <= size.width / 2 && Math.abs(local.y) <= size.height / 2;
    }

    private isPointInsideAnyPreplaceButton(uiX: number, uiY: number): boolean {
        for (const button of this.preplaceButtons) {
            if (this.isPointInsideNode(button.node, uiX, uiY)) {
                return true;
            }
        }
        return false;
    }

    private isPointerNearLockedPreview(boardTransform: UITransform, uiX: number, uiY: number): boolean {
        const preview = this.lastRenderState?.preview;
        if (!preview || !this.lastRenderState?.preplaceLocked) {
            return false;
        }
        const local = boardTransform.convertToNodeSpaceAR(new Vec3(uiX, uiY, 0));
        const cellSize = this.boardSize / BOARD_COLS;
        const minX = Math.min(...preview.cells.map((cell) => cell.x));
        const maxX = Math.max(...preview.cells.map((cell) => cell.x));
        const minY = Math.min(...preview.cells.map((cell) => cell.y));
        const maxY = Math.max(...preview.cells.map((cell) => cell.y));
        const expand = cellSize * 0.28;
        const left = -this.boardSize / 2 + minX * cellSize - expand;
        const right = -this.boardSize / 2 + (maxX + 1) * cellSize + expand;
        const top = this.boardSize / 2 - minY * cellSize + expand;
        const bottom = this.boardSize / 2 - (maxY + 1) * cellSize - expand;
        return local.x >= left && local.x <= right && local.y <= top && local.y >= bottom;
    }

    private getActivePlacementBounds(): { width: number; height: number } {
        const slot = this.lastRenderState?.handSlots.find((item) => item.selected)
            ?? (this.preplaceHandIndex !== null ? this.lastRenderState?.handSlots[this.preplaceHandIndex] : null)
            ?? null;
        const card = slot?.card ?? null;
        if (!card) {
            return { width: 1, height: 1 };
        }
        const rotated = rotateCardCells(card.cells, this.lastRenderState?.rotation ?? 0);
        const bounds = getCardBounds(rotated);
        return {
            width: Math.max(bounds.width, 1),
            height: Math.max(bounds.height, 1),
        };
    }

    private onHandCardTouchStart(index: number, event: EventTouch): void {
        event.propagationStopped = true;
        const loc = event.getUILocation();
        this.tryBeginPreplace(index, loc.y);
        this.root.on(Node.EventType.TOUCH_MOVE, this.onRootTouchMove, this);
        this.root.on(Node.EventType.TOUCH_END, this.onRootTouchEnd, this);
        this.root.on(Node.EventType.TOUCH_CANCEL, this.onRootTouchEnd, this);
    }

    private onHandCardMouseDown(index: number, event: EventMouse): void {
        if (event.getButton() !== EventMouse.BUTTON_LEFT) {
            return;
        }
        event.propagationStopped = true;
        const loc = event.getUILocation();
        this.tryBeginPreplace(index, loc.y);
        this.root.on(Node.EventType.MOUSE_MOVE, this.onRootMouseMove, this);
        this.root.on(Node.EventType.MOUSE_UP, this.onRootMouseUp, this);
    }

    private onHandCardMouseEnter(index: number): void {
        if (this.preplacePhase !== 'idle' || this.handRefillAnimRunning) {
            return;
        }
        if (!this.lastRenderState?.handSlots[index]?.card) {
            return;
        }
        this.hoverHandIndex = index;
        this.applyHandFanLayout();
    }

    private onHandCardMouseLeave(index: number): void {
        if (this.hoverHandIndex === index) {
            this.hoverHandIndex = null;
            this.applyHandFanLayout();
        }
    }

    private tryBeginPreplace(index: number, pointerYUi?: number): void {
        if (!this.lastRenderState || this.lastRenderState.status !== 'playing') {
            return;
        }
        const slot = this.lastRenderState.handSlots[index];
        const card = slot?.card;
        if (!card) {
            return;
        }
        if (!isBoardPlacementCard(card)) {
            return;
        }

        this.cancelPreplaceFlow(false);
        this.resetPreviewRotateState();
        this.hoverHandIndex = null;
        this.preplacePhase = 'preplace1_track';
        this.preplaceHandIndex = index;
        this.handDragLiftY = 0;
        this.handDragStartY = pointerYUi ?? 0;
        this.callbacks.onBeginPlacementDrag(index);
        this.callbacks.onPreplaceHoverAnchor(null);
    }

    private onRootTouchMove(event: EventTouch): void {
        if (this.preplacePhase !== 'preplace1_track') {
            return;
        }
        const loc = event.getUILocation();
        this.updatePreplaceTracking(loc.x, loc.y);
    }

    private onRootTouchEnd(event: EventTouch): void {
        if (this.preplacePhase !== 'preplace1_track') {
            return;
        }
        const loc = event.getUILocation();
        this.finishPreplace1Track(loc.x, loc.y);
    }

    private onRootMouseMove(event: EventMouse): void {
        if (this.preplacePhase !== 'preplace1_track') {
            return;
        }
        const loc = event.getUILocation();
        this.updatePreplaceTracking(loc.x, loc.y);
    }

    private onRootMouseUp(event: EventMouse): void {
        if (this.preplacePhase !== 'preplace1_track') {
            return;
        }
        if (event.getButton() !== EventMouse.BUTTON_LEFT) {
            return;
        }
        const loc = event.getUILocation();
        this.finishPreplace1Track(loc.x, loc.y);
    }

    private updatePreplaceTracking(uiX: number, uiY: number): void {
        if (this.preplaceHandIndex !== null) {
            this.handDragLiftY = clamp(uiY - this.handDragStartY, 0, this.getMaxHandDragLift());
            this.applyHandFanLayout();
        }
        const boardTransform = this.boardNode.getComponent(UITransform)!;
        const anchor = this.resolveAnchor(boardTransform, uiX, uiY);
        this.callbacks.onPreplaceHoverAnchor(anchor);
        this.refreshArcOnly();
    }

    private finishPreplace1Track(uiX: number, uiY: number): void {
        this.root.off(Node.EventType.TOUCH_MOVE, this.onRootTouchMove, this);
        this.root.off(Node.EventType.TOUCH_END, this.onRootTouchEnd, this);
        this.root.off(Node.EventType.TOUCH_CANCEL, this.onRootTouchEnd, this);
        this.root.off(Node.EventType.MOUSE_MOVE, this.onRootMouseMove, this);
        this.root.off(Node.EventType.MOUSE_UP, this.onRootMouseUp, this);

        const boardTransform = this.boardNode.getComponent(UITransform)!;
        const anchor = this.resolveAnchor(boardTransform, uiX, uiY);
        if (!anchor) {
            this.cancelPreplaceFlow();
            return;
        }

        this.callbacks.onPreplaceHoverAnchor(anchor);
        this.enterPreplace2(anchor);
    }

    private enterPreplace2(anchor: GridPos): void {
        this.handDragLiftY = 0;
        this.applyHandFanLayout();
        this.preplacePhase = 'preplace2';
        this.callbacks.onPreplaceCommitState2(anchor);
        if (this.preplaceBar) {
            this.preplaceBar.active = true;
        }
    }

    private cancelPreplaceFlow(notify = true): void {
        this.teardownTrackingListeners();
        this.resetPreviewRotateState();
        this.preplacePhase = 'idle';
        this.preplaceHandIndex = null;
        this.handDragLiftY = 0;
        this.preplace2BoardDragging = false;
        if (this.dragArrow) {
            this.dragArrow.clear();
        }
        if (this.preplaceBar) {
            this.preplaceBar.active = false;
        }
        if (notify) {
            this.callbacks.onPreplaceCancel();
        }
    }

    private teardownTrackingListeners(): void {
        this.root.off(Node.EventType.TOUCH_MOVE, this.onRootTouchMove, this);
        this.root.off(Node.EventType.TOUCH_END, this.onRootTouchEnd, this);
        this.root.off(Node.EventType.TOUCH_CANCEL, this.onRootTouchEnd, this);
        this.root.off(Node.EventType.MOUSE_MOVE, this.onRootMouseMove, this);
        this.root.off(Node.EventType.MOUSE_UP, this.onRootMouseUp, this);
        this.endState2BoardDrag();
    }

    private syncPreplaceBar(state: GameViewState): void {
        if (!this.preplaceBar) {
            return;
        }
        this.preplaceBar.active = state.preplaceLocked;
        let opacity = this.preplaceBar.getComponent(UIOpacity);
        if (!opacity) {
            opacity = this.preplaceBar.addComponent(UIOpacity);
        }
        opacity.opacity = state.preplaceLocked
            ? (this.preplace2BoardDragging ? 140 : 255)
            : 255;
        const scale = state.preplaceLocked
            ? (this.preplace2BoardDragging ? 0.94 : 1)
            : 1;
        this.preplaceBar.setScale(scale, scale, 1);
    }

    private refreshArcAndBarPosition(state: GameViewState): void {
        this.refreshArcOnly();
        if (!this.preplaceBar || !state.preview) {
            return;
        }
        const center = this.previewCellsToRootCenter(state.preview.cells);
        const margin = 14;
        const sideHalfWidth = 314 / 2;
        const overflowLeft = center.x - sideHalfWidth < -this.rootWidth / 2 + margin;
        const overflowRight = center.x + sideHalfWidth > this.rootWidth / 2 - margin;
        const useTopStack = overflowLeft || overflowRight;
        this.layoutPreplaceButtons(useTopStack);
        const barTransform = this.preplaceBar.getComponent(UITransform)!;
        const idealX = center.x;
        const idealY = useTopStack
            ? center.y + clamp(this.boardSize * 0.22, 88, 120)
            : center.y + clamp(this.boardSize * 0.035, 10, 18);
        const x = clamp(
            idealX,
            -this.rootWidth / 2 + barTransform.contentSize.width / 2 + margin,
            this.rootWidth / 2 - barTransform.contentSize.width / 2 - margin,
        );
        const y = clamp(
            idealY,
            -this.rootHeight / 2 + barTransform.contentSize.height / 2 + margin,
            this.rootHeight / 2 - barTransform.contentSize.height / 2 - margin,
        );
        this.preplaceBar.setPosition(x, y, 0);
        this.preplaceBar.setSiblingIndex(this.root.children.length - 1);
    }

    private refreshArcOnly(): void {
        if (!this.dragArrow || this.preplacePhase === 'idle') {
            if (this.dragArrow) {
                this.dragArrow.node.active = false;
                this.dragArrow.clear();
            }
            return;
        }
        if (!this.lastRenderState?.preview) {
            this.dragArrow.node.active = false;
            this.dragArrow.clear();
            return;
        }
        this.dragArrow.node.active = true;

        if (this.preplacePhase === 'preplace2') {
            if (!this.preplaceBar) {
                this.dragArrow.node.active = false;
                this.dragArrow.clear();
                return;
            }
            const previewCenter = this.previewCellsToRootCenter(this.lastRenderState.preview.cells);
            const barCenter = this.preplaceBar.position.clone();
            this.drawPreplaceGuideLine(previewCenter, barCenter);
            if (this.dragArrow.node) {
                this.dragArrow.node.setSiblingIndex(this.root.children.length - 2);
            }
            return;
        }
        if (this.preplaceHandIndex === null) {
            this.dragArrow.node.active = false;
            this.dragArrow.clear();
            return;
        }

        const handNode = this.handViews[this.preplaceHandIndex].node;
        const tailWorld = handNode.worldPosition;
        const rootTransform = this.root.getComponent(UITransform)!;
        const tailLocal = rootTransform.convertToNodeSpaceAR(tailWorld);
        const headLocal = this.previewCellsToRootCenter(this.lastRenderState.preview.cells);

        this.drawDragArrow(tailLocal, headLocal);
        if (this.dragArrow.node) {
            this.dragArrow.node.setSiblingIndex(this.root.children.length - 1);
        }
    }

    private previewCellsToRootCenter(cells: { x: number; y: number }[]): Vec3 {
        const boardCenter = this.previewCellsToBoardCenter(cells);
        const rootTransform = this.root.getComponent(UITransform)!;
        const boardTransform = this.boardNode.getComponent(UITransform)!;
        const world = boardTransform.convertToWorldSpaceAR(boardCenter);
        return rootTransform.convertToNodeSpaceAR(world);
    }

    private previewCellsToBoardCenter(cells: { x: number; y: number }[]): Vec3 {
        const minX = Math.min(...cells.map((cell) => cell.x));
        const maxX = Math.max(...cells.map((cell) => cell.x));
        const minY = Math.min(...cells.map((cell) => cell.y));
        const maxY = Math.max(...cells.map((cell) => cell.y));
        const cellSize = this.boardSize / BOARD_COLS;
        const half = this.boardSize / 2;
        const bx = -half + (minX + maxX + 1) * cellSize / 2;
        const by = half - (minY + maxY + 1) * cellSize / 2;
        return new Vec3(bx, by, 0);
    }

    private drawDragArrow(fromLocal: Vec3, toLocal: Vec3): void {
        if (!this.dragArrow) {
            return;
        }
        const g = this.dragArrow;
        g.clear();
        g.lineWidth = 3;
        g.strokeColor = makeColor(72, 160, 92, 220);

        const midX = (fromLocal.x + toLocal.x) / 2 + (toLocal.y - fromLocal.y) * 0.15;
        const midY = (fromLocal.y + toLocal.y) / 2 - (toLocal.x - fromLocal.x) * 0.12;

        const segments = 14;
        g.moveTo(fromLocal.x, fromLocal.y);
        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const omt = 1 - t;
            const bx = omt * omt * fromLocal.x + 2 * omt * t * midX + t * t * toLocal.x;
            const by = omt * omt * fromLocal.y + 2 * omt * t * midY + t * t * toLocal.y;
            g.lineTo(bx, by);
        }
        g.stroke();
    }

    private drawPreplaceGuideLine(fromLocal: Vec3, toLocal: Vec3): void {
        if (!this.dragArrow) {
            return;
        }
        const g = this.dragArrow;
        g.clear();
        g.lineWidth = 2;
        g.strokeColor = makeColor(112, 124, 148, 150);

        const midX = (fromLocal.x + toLocal.x) / 2;
        const midY = (fromLocal.y + toLocal.y) / 2 + clamp(Math.abs(toLocal.x - fromLocal.x) * 0.05, 10, 20);

        const segments = 12;
        g.moveTo(fromLocal.x, fromLocal.y);
        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const omt = 1 - t;
            const bx = omt * omt * fromLocal.x + 2 * omt * t * midX + t * t * toLocal.x;
            const by = omt * omt * fromLocal.y + 2 * omt * t * midY + t * t * toLocal.y;
            g.lineTo(bx, by);
        }
        g.stroke();
    }

    private playPreviewDropPulse(): void {
        Tween.stopAllByTarget(this.previewDropPulseState);
        this.previewDropPulseState.value = 1;
        tween(this.previewDropPulseState)
            .to(0.2, { value: 0 }, { easing: 'quadOut' })
            .start();
    }

    public resetTimeWheel(): void {
        this.timeWheelYearIndex = 0;
        this.timeWheelSeasonIndex = 0;
        Tween.stopAllByTarget(this.topInfoView.timeWheelOuterNode);
        Tween.stopAllByTarget(this.topInfoView.timeWheelInnerNode);
        this.syncTimeWheelVisuals();
    }

    private syncTimeWheelVisuals(): void {
        if (!this.topInfoView) {
            return;
        }
        this.topInfoView.timeWheelOuterNode.setRotationFromEuler(0, 0, 0);
        this.topInfoView.timeWheelInnerNode.setRotationFromEuler(0, 0, 0);
        this.topInfoView.timeWheelCenterNode.setRotationFromEuler(0, 0, 0);
        this.topInfoView.timeWheelPointerNode.setRotationFromEuler(0, 0, 0);
        this.topInfoView.timeWheelYearLabel.string = TIME_WHEEL_YEAR_LABELS[this.timeWheelYearIndex];
        this.topInfoView.timeWheelSeasonLabel.string = TIME_WHEEL_SEASONS[this.timeWheelSeasonIndex];
    }

    private renderTopInfo(state: GameViewState): void {
        const {
            progressGraphics,
            progressLabel,
            statsLabel,
            reserveGraphics,
            reserveLabel,
            gmPopup,
        } = this.topInfoView;
        const progressTransform = progressGraphics.node.getComponent(UITransform)!;
        const width = progressTransform.contentSize.width;
        const height = 24;
        const radius = 12;
        const progress = state.targetScore <= 0 ? 0 : clamp(state.score / state.targetScore, 0, 1);
        const segments = Math.max(6, Math.min(10, Math.ceil(state.targetScore / 2)));
        const gap = 4;
        const innerW = width - 10;
        const segmentW = (innerW - gap * (segments - 1)) / segments;
        const fillW = innerW * progress;

        progressGraphics.clear();
        progressGraphics.fillColor = makeColor(242, 234, 214, 255);
        progressGraphics.roundRect(-width / 2, -height / 2, width, height, radius);
        progressGraphics.fill();

        let segmentX = -innerW / 2;
        for (let i = 0; i < segments; i++) {
            const filled = clamp(fillW - i * (segmentW + gap), 0, segmentW);
            progressGraphics.fillColor = makeColor(227, 214, 182, 255);
            progressGraphics.roundRect(segmentX, -height / 2 + 5, segmentW, height - 10, 6);
            progressGraphics.fill();
            if (filled > 0) {
                progressGraphics.fillColor = makeColor(112, 190, 88, 255);
                progressGraphics.roundRect(segmentX, -height / 2 + 5, filled, height - 10, 6);
                progressGraphics.fill();
            }
            segmentX += segmentW + gap;
        }

        this.syncTimeWheelVisuals();

        progressLabel.string = `分数 ${state.score} / ${state.targetScore}`;
        statsLabel.string = [
            `牌库: ${state.deckCount < 0 ? '∞' : state.deckCount}`,
            `烂水果: ${state.remainingRotten}`,
        ].join('\n');

        const reserveTransform = reserveGraphics.node.getComponent(UITransform)!;
        const reserveWidth = reserveTransform.contentSize.width;
        const reserveHeight = reserveTransform.contentSize.height;
        reserveGraphics.clear();
        reserveGraphics.fillColor = makeColor(248, 244, 232, 255);
        reserveGraphics.roundRect(-reserveWidth / 2, -reserveHeight / 2, reserveWidth, reserveHeight, 14);
        reserveGraphics.fill();
        reserveGraphics.lineWidth = 2;
        reserveGraphics.strokeColor = makeColor(214, 202, 176, 255);
        reserveGraphics.roundRect(-reserveWidth / 2, -reserveHeight / 2, reserveWidth, reserveHeight, 14);
        reserveGraphics.stroke();

        const slotW = reserveWidth * 0.28;
        const slotH = 24;
        const slotGap = 8;
        const slotY = reserveHeight / 2 - slotH - 14;
        for (let i = 0; i < 2; i++) {
            const slotX = -slotW - slotGap / 2 + i * (slotW + slotGap);
            reserveGraphics.fillColor = makeColor(236, 230, 214, 255);
            reserveGraphics.roundRect(slotX, slotY, slotW, slotH, 10);
            reserveGraphics.fill();
        }
        reserveLabel.string = [
            `Buff / Debuff 预留`,
            `时间轮盘右侧保留扩展空间`,
            state.preplaceLocked ? `状态2：${rotationToText(state.rotation)}` : `等待后续状态记录`,
        ].join('\n');
        gmPopup.active = this.gmPopupOpen;
    }

    private renderHand(handSlots: HandSlotState[]): void {
        this.ensureHandViewCount(handSlots.length);
        this.applyHandFanLayout(handSlots.length);

        for (let i = 0; i < this.handViews.length; i++) {
            const view = this.handViews[i];
            const slot = handSlots[i];
            view.node.active = i < handSlots.length;
            if (!view.node.active) {
                continue;
            }
            const graphics = view.graphics;
            graphics.clear();
            for (const artCell of view.artCells) {
                artCell.node.active = false;
            }

            const inPreplace = this.preplaceHandIndex === i && this.preplacePhase !== 'idle';
            const isSelected = !!slot?.selected || inPreplace;

            graphics.fillColor = isSelected ? makeColor(255, 243, 168, 255) : makeColor(245, 238, 215, 255);
            graphics.roundRect(-this.handCardWidth / 2, -this.handCardHeight / 2, this.handCardWidth, this.handCardHeight, 16);
            graphics.fill();

            graphics.lineWidth = isSelected ? 6 : 3;
            graphics.strokeColor = isSelected ? makeColor(223, 164, 43, 255) : makeColor(171, 141, 96, 255);
            graphics.roundRect(-this.handCardWidth / 2, -this.handCardHeight / 2, this.handCardWidth, this.handCardHeight, 16);
            graphics.stroke();

            if (!slot || !slot.card) {
                view.title.string = '空';
                view.descLabel.string = '';
                view.costLabel.string = '';
                view.typeLabel.string = '';
                continue;
            }

            const card = slot.card;
            const artTop = this.handCardHeight * 0.12;
            const artH = this.handCardHeight * 0.38;
            const artW = this.handCardWidth - 36;
            const gap = 6;
            const cellW = (artW - gap * (CARD_TEMPLATE_COLS - 1)) / CARD_TEMPLATE_COLS;
            const cellH = (artH - gap * (CARD_TEMPLATE_ROWS - 1)) / CARD_TEMPLATE_ROWS;
            const originX = -artW / 2;
            const artTopY = this.handCardHeight / 2 - artTop;
            for (const cell of card.cells) {
                const x = originX + cell.x * (cellW + gap);
                // 手牌上的格子朝向要与棋盘放置预览一致：cell.y 越大，视觉上越靠下。
                const y = artTopY - cell.y * (cellH + gap) - cellH;
                const artIndex = cell.y * CARD_TEMPLATE_COLS + cell.x;
                const artCell = view.artCells[artIndex];
                if (!artCell) {
                    continue;
                }
                artCell.node.active = true;
                artCell.node.setPosition(x + cellW / 2, y + cellH / 2, 0);
                artCell.node.getComponent(UITransform)?.setContentSize(cellW, cellH);

                artCell.graphics.clear();
                artCell.graphics.fillColor = fruitColor(cell.color, 28);
                artCell.graphics.roundRect(-cellW / 2, -cellH / 2, cellW, cellH, 8);
                artCell.graphics.fill();
                artCell.graphics.lineWidth = 3;
                artCell.graphics.strokeColor = fruitColor(cell.color, 255);
                artCell.graphics.roundRect(-cellW / 2, -cellH / 2, cellW, cellH, 8);
                artCell.graphics.stroke();

                const spriteMaxWidth = cellW * 0.82;
                const spriteMaxHeight = cellH * 0.88;
                this.setPlantSpriteFit(artCell.sprite, spriteMaxWidth, spriteMaxHeight, -cellH * 0.34);
                this.loadSpriteFrameByPath(
                    this.getPlantSpritePathByVariant(cell.plantVariant ?? 0),
                    artCell.sprite,
                );
            }

            view.costLabel.string = '0';
            view.title.string = card.label;
            view.typeLabel.string = getCardMainTypeLabel(card.mainType);
            if (isBoardPlacementCard(card)) {
                view.descLabel.string = '拖出后在放置区松手进入确认，可在棋盘拖动改位';
                view.descLabel.color = slot.canPlace ? makeColor(76, 126, 65, 255) : makeColor(170, 83, 69, 255);
            } else if (card.mainType === 'vegetation') {
                view.descLabel.string = '基础概念已建立：后续用于调整地块状态';
                view.descLabel.color = makeColor(84, 118, 82, 255);
            } else if (card.mainType === 'technology') {
                view.descLabel.string = '基础概念已建立：后续用于改造水渠、墙壁等结构';
                view.descLabel.color = makeColor(88, 102, 148, 255);
            } else {
                view.descLabel.string = '基础概念已建立：后续用于抽牌、置换、降雨等战术操作';
                view.descLabel.color = makeColor(146, 102, 66, 255);
            }
        }
    }

    private getFanSlotTransform(index: number, count: number): { x: number; y: number; zDeg: number } {
        const center = (count - 1) / 2;
        const crowd = clamp((count - 1) / 5, 0, 1);
        const maxTiltDeg = lerp(11, 4, crowd);
        const spreadX = count <= 1
            ? 0
            : Math.min(
                clamp(this.handCardWidth * 0.48, 62, 92),
                (this.panelWidth - this.handCardWidth * 1.1) / Math.max(count - 1, 1),
            );
        const arcLift = lerp(clamp(this.handCardHeight * 0.07, 10, 18), clamp(this.handCardHeight * 0.025, 4, 8), crowd);
        const sinkY = -this.handPanelHeight * 0.32;
        const t = count > 1 ? (index - center) / center : 0;
        const zDeg = -t * maxTiltDeg;
        const x = t * spreadX;
        const y = sinkY + (1 - Math.abs(t)) * arcLift;
        return { x, y, zDeg };
    }

    private getHandBaseScale(count: number): number {
        if (count <= 3) {
            return 1;
        }
        if (count === 4) {
            return 0.96;
        }
        if (count === 5) {
            return 0.9;
        }
        return clamp(0.9 - (count - 5) * 0.06, 0.68, 0.9);
    }

    private applyHandFanLayout(activeCount = this.lastRenderState?.handSlots.length ?? 0): void {
        if (!this.handPanel || this.handRefillAnimRunning) {
            return;
        }

        const count = activeCount;
        const baseScale = this.getHandBaseScale(count);
        for (let i = 0; i < count; i++) {
            const view = this.handViews[i];
            const node = view.node;
            if (node.parent !== this.handPanel) {
                continue;
            }

            const tr = this.getFanSlotTransform(i, count);
            let x = tr.x;
            let y = tr.y;
            let zDeg = tr.zDeg;
            let sc = baseScale;

            if (this.preplacePhase === 'idle' && this.hoverHandIndex === i && this.lastRenderState?.handSlots[i]?.card) {
                y += clamp(this.handCardHeight * 0.14, 22, 38);
                sc = baseScale * 1.09;
            }
            if (this.preplacePhase === 'preplace1_track' && this.preplaceHandIndex === i) {
                y += this.handDragLiftY + 18;
                zDeg = 0;
                sc = Math.max(baseScale, 1) * 1.08;
            }

            node.setPosition(x, y, 0);
            node.setScale(sc, sc, 1);
            node.setRotationFromEuler(0, 0, zDeg);
        }

        for (let i = count; i < this.handViews.length; i++) {
            this.handViews[i].node.active = false;
        }
        this.reorderHandSiblingsForHover(count);
    }

    private reorderHandSiblingsForHover(activeCount = this.lastRenderState?.handSlots.length ?? 0): void {
        if (!this.handPanel) {
            return;
        }
        let order = Array.from({ length: activeCount }, (_, i) => i);
        if (this.preplacePhase !== 'idle' && this.preplaceHandIndex !== null) {
            order = order.filter((i) => i !== this.preplaceHandIndex);
            order.push(this.preplaceHandIndex);
        } else if (this.preplacePhase === 'idle' && this.hoverHandIndex !== null) {
            const h = this.hoverHandIndex;
            order = order.filter((i) => i !== h);
            order.push(h);
        }
        let z = 0;
        for (const i of order) {
            const n = this.handViews[i].node;
            if (n.parent === this.handPanel && n.active) {
                n.setSiblingIndex(z);
                z++;
            }
        }
    }

    private pickDistinctStart(base: Vec3, used: Vec3[]): Vec3 {
        const step = 14;
        let p = base.clone();
        let guard = 0;
        while (guard < 12 && used.some((u) => Math.abs(u.x - p.x) < 1 && Math.abs(u.y - p.y) < 1)) {
            p = p.add3f(step, 0, 0);
            guard++;
        }
        used.push(p.clone());
        return p;
    }

    private syncPreviewRotateTween(state: GameViewState): void {
        const preview = state.preview;
        if (!preview) {
            Tween.stopAllByTarget(this.previewRotateTweenState);
            this.previewRotateTweenState.extraDeg = 0;
            this.previewRotateTweenState.offsetX = 0;
            this.previewRotateTweenState.offsetY = 0;
            this.previewRotateAnchorKey = '';
            this.previewRotateLogical = 0;
            return;
        }

        const anchorKey = `${preview.anchor.x},${preview.anchor.y}:${state.preplaceLocked ? 'locked' : 'free'}`;
        if (!state.preplaceLocked) {
            Tween.stopAllByTarget(this.previewRotateTweenState);
            this.previewRotateTweenState.extraDeg = 0;
            this.previewRotateTweenState.offsetX = 0;
            this.previewRotateTweenState.offsetY = 0;
            this.previewRotateAnchorKey = anchorKey;
            this.previewRotateLogical = state.rotation;
            return;
        }

        if (this.previewRotateAnchorKey !== anchorKey) {
            Tween.stopAllByTarget(this.previewRotateTweenState);
            this.previewRotateTweenState.extraDeg = 0;
            this.previewRotateTweenState.offsetX = 0;
            this.previewRotateTweenState.offsetY = 0;
            this.previewRotateAnchorKey = anchorKey;
            this.previewRotateLogical = state.rotation;
            return;
        }

        if (this.previewRotateLogical !== state.rotation) {
            const prevPreview = this.lastRenderState?.preview ?? null;
            this.previewRotateLogical = state.rotation;
            Tween.stopAllByTarget(this.previewRotateTweenState);
            this.previewRotateTweenState.extraDeg = state.rotationStep > 0
                ? 90
                : state.rotationStep < 0
                    ? -90
                    : 0;
            if (prevPreview) {
                const prevCenter = this.previewCellsToBoardCenter(prevPreview.cells);
                const nextCenter = this.previewCellsToBoardCenter(preview.cells);
                this.previewRotateTweenState.offsetX = prevCenter.x - nextCenter.x;
                this.previewRotateTweenState.offsetY = prevCenter.y - nextCenter.y;
            } else {
                this.previewRotateTweenState.offsetX = 0;
                this.previewRotateTweenState.offsetY = 0;
            }
            tween(this.previewRotateTweenState)
                .to(0.18, { extraDeg: 0, offsetX: 0, offsetY: 0 }, { easing: 'quadOut' })
                .start();
        }
    }

    private rotatePointAroundPivot(x: number, y: number, pivotX: number, pivotY: number, angleRad: number): { x: number; y: number } {
        if (Math.abs(angleRad) < 0.0001) {
            return { x, y };
        }
        const dx = x - pivotX;
        const dy = y - pivotY;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        return {
            x: pivotX + dx * cos - dy * sin,
            y: pivotY + dx * sin + dy * cos,
        };
    }

    private tracePreviewRect(
        graphics: Graphics,
        x: number,
        y: number,
        width: number,
        height: number,
        pivotX: number,
        pivotY: number,
        angleRad: number,
    ): void {
        if (Math.abs(angleRad) < 0.0001) {
            graphics.rect(x, y, width, height);
            return;
        }
        const corners = [
            this.rotatePointAroundPivot(x, y, pivotX, pivotY, angleRad),
            this.rotatePointAroundPivot(x + width, y, pivotX, pivotY, angleRad),
            this.rotatePointAroundPivot(x + width, y + height, pivotX, pivotY, angleRad),
            this.rotatePointAroundPivot(x, y + height, pivotX, pivotY, angleRad),
        ];
        graphics.moveTo(corners[0].x, corners[0].y);
        graphics.lineTo(corners[1].x, corners[1].y);
        graphics.lineTo(corners[2].x, corners[2].y);
        graphics.lineTo(corners[3].x, corners[3].y);
        graphics.lineTo(corners[0].x, corners[0].y);
    }

    private startHandRefillAnimation(
        removedIdx: number,
        snap: HandLayoutSnapshot,
        oldIds: (string | null)[],
        handSlots: HandSlotState[],
    ): void {
        if (!this.handPanel) {
            return;
        }
        this.ensureHandViewCount(handSlots.length);

        for (const v of this.handViews) {
            Tween.stopAllByTarget(v.node);
        }

        this.handRefillAnimRunning = true;
        this.hoverHandIndex = null;

        const durationSlide = 0.38;
        const durationFly = 0.52;
        const usedStarts: Vec3[] = [];

        let remaining = 0;
        const onOneDone = (): void => {
            remaining--;
            if (remaining <= 0) {
                this.handRefillAnimRunning = false;
                for (const v of this.handViews) {
                    v.node.setScale(1, 1, 1);
                }
                this.applyHandFanLayout();
            }
        };

        for (let i = 0; i < handSlots.length; i++) {
            const node = this.handViews[i].node;
            const slot = handSlots[i];
            const target = this.getFanSlotTransform(i, handSlots.length);
            const targetPos = new Vec3(target.x, target.y, 0);
            const targetEuler = new Vec3(0, 0, target.zDeg);
            node.setScale(1, 1, 1);
            node.active = true;

            const card = slot?.card ?? null;

            if (!card) {
                const base = snap.positions[i] ?? targetPos;
                const startPos = this.pickDistinctStart(base, usedStarts);
                node.setPosition(startPos);
                node.setRotationFromEuler(snap.eulers[i].x, snap.eulers[i].y, snap.eulers[i].z);
                remaining++;
                tween(node)
                    .to(
                        durationSlide,
                        { position: targetPos, eulerAngles: targetEuler },
                        { easing: 'quadOut' },
                    )
                    .call(onOneDone)
                    .start();
                continue;
            }

            let oldJ = oldIds.findIndex((id) => id !== null && id === card.id);
            if (oldJ === removedIdx) {
                oldJ = -1;
            }

            if (oldJ >= 0) {
                const base = snap.positions[oldJ].clone();
                const startPos = this.pickDistinctStart(base, usedStarts);
                const startEuler = snap.eulers[oldJ].clone();
                node.setPosition(startPos);
                node.setRotationFromEuler(startEuler.x, startEuler.y, startEuler.z);
                remaining++;
                tween(node)
                    .to(
                        durationSlide,
                        { position: targetPos, eulerAngles: targetEuler },
                        { easing: 'quadOut' },
                    )
                    .call(onOneDone)
                    .start();
                continue;
            }

            const rightX = this.rootWidth / 2 - this.handCardWidth * 0.22;
            const midX = (rightX + target.x) * 0.55;
            const midY = Math.max(target.y, -this.handPanelHeight * 0.1) + clamp(this.handCardHeight * 0.55, 70, 110);
            const p0 = new Vec3(rightX, target.y + 40, 0);
            const p1 = new Vec3(midX, midY, 0);
            const p2 = targetPos.clone();
            const startZ = target.zDeg * 0.35;
            node.setPosition(p0);
            node.setRotationFromEuler(0, 0, startZ);

            remaining++;
            const proxy = { t: 0 };
            tween(proxy)
                .to(
                    durationFly,
                    { t: 1 },
                    {
                        easing: 'quadOut',
                        onUpdate: (value: { t: number }) => {
                            const t = clamp(value.t, 0, 1);
                            const omt = 1 - t;
                            const x = omt * omt * p0.x + 2 * omt * t * p1.x + t * t * p2.x;
                            const y = omt * omt * p0.y + 2 * omt * t * p1.y + t * t * p2.y;
                            node.setPosition(x, y, 0);
                            const ez = lerp(startZ, targetEuler.z, t);
                            node.setRotationFromEuler(0, 0, ez);
                        },
                    },
                )
                .call(onOneDone)
                .start();
        }

        if (remaining === 0) {
            this.handRefillAnimRunning = false;
        }
        for (let i = handSlots.length; i < this.handViews.length; i++) {
            this.handViews[i].node.active = false;
        }
    }

    private syncBoardPlants(state: GameViewState, cellSize: number): void {
        const visible: BoardPlantCellView[] = [];
        const cellPad = clamp(cellSize * 0.12, 6, 10);
        const borderW = cellSize - cellPad * 2;
        const borderH = cellSize - cellPad * 2;

        for (let y = 0; y < BOARD_ROWS; y++) {
            for (let x = 0; x < BOARD_COLS; x++) {
                const cell = state.board[y][x];
                const view = this.boardPlantViews[y * BOARD_COLS + x];
                if (!cell.baseColor || cell.rotten || cell.plantVariant === null) {
                    view.node.active = false;
                    continue;
                }
                const centerX = -this.boardSize / 2 + cellSize * (x + 0.5);
                const centerY = this.boardSize / 2 - cellSize * (y + 0.5);
                view.row = y;
                view.col = x;
                view.preview = false;
                view.node.active = true;
                view.node.setPosition(centerX, centerY, 0);
                view.node.getComponent(UITransform)?.setContentSize(cellSize, cellSize);
                view.graphics.clear();
                view.graphics.fillColor = fruitColor(cell.baseColor, 22);
                view.graphics.roundRect(-borderW / 2, -borderH / 2, borderW, borderH, 8);
                view.graphics.fill();
                view.graphics.lineWidth = 3;
                view.graphics.strokeColor = fruitColor(cell.baseColor, 255);
                view.graphics.roundRect(-borderW / 2, -borderH / 2, borderW, borderH, 8);
                view.graphics.stroke();
                view.sprite.color = makeColor(255, 255, 255, 255);
                this.setPlantSpriteFit(view.sprite, cellSize * 0.8, cellSize * 1.18, -cellSize * 0.36);
                this.loadSpriteFrameByPath(this.getPlantSpritePathByVariant(cell.plantVariant), view.sprite);
                visible.push(view);
            }
        }

        for (const view of this.previewPlantViews) {
            view.node.active = false;
        }
        if (state.preview) {
            const previewOffsetX = state.preplaceLocked ? this.previewRotateTweenState.offsetX : 0;
            const previewOffsetY = state.preplaceLocked ? this.previewRotateTweenState.offsetY : 0;
            let previewIndex = 0;
            for (const cell of state.preview.cells) {
                if (
                    previewIndex >= this.previewPlantViews.length
                    || cell.blocked
                    || cell.overlapsSame
                    || cell.overlapsDiff
                    || cell.plantVariant === null
                ) {
                    continue;
                }
                const view = this.previewPlantViews[previewIndex++];
                const centerX = -this.boardSize / 2 + cellSize * (cell.x + 0.5) + previewOffsetX;
                const centerY = this.boardSize / 2 - cellSize * (cell.y + 0.5) + previewOffsetY;
                view.row = cell.y;
                view.col = cell.x;
                view.preview = true;
                view.node.active = true;
                view.node.setPosition(centerX, centerY, 0);
                view.node.getComponent(UITransform)?.setContentSize(cellSize, cellSize);
                view.graphics.clear();
                view.graphics.fillColor = fruitColor(cell.color, 18);
                view.graphics.roundRect(-borderW / 2, -borderH / 2, borderW, borderH, 8);
                view.graphics.fill();
                view.graphics.lineWidth = 3;
                view.graphics.strokeColor = fruitColor(cell.color, 210);
                view.graphics.roundRect(-borderW / 2, -borderH / 2, borderW, borderH, 8);
                view.graphics.stroke();
                view.sprite.color = makeColor(255, 255, 255, state.preplaceLocked ? 220 : 170);
                this.setPlantSpriteFit(view.sprite, cellSize * 0.8, cellSize * 1.12, -cellSize * 0.36);
                this.loadSpriteFrameByPath(this.getPlantSpritePathByVariant(cell.plantVariant), view.sprite);
                visible.push(view);
            }
        }

        visible.sort((a, b) => {
            if (a.row !== b.row) {
                return a.row - b.row;
            }
            if (a.preview !== b.preview) {
                return a.preview ? 1 : -1;
            }
            return a.col - b.col;
        });
        for (let i = 0; i < visible.length; i++) {
            visible[i].node.setSiblingIndex(i);
        }
    }

    private syncBoardParcels(state: GameViewState, cellSize: number): void {
        const visible: BoardParcelCellView[] = [];
        for (let y = 0; y < BOARD_ROWS; y++) {
            for (let x = 0; x < BOARD_COLS; x++) {
                const cell = state.board[y][x];
                const view = this.boardParcelViews[y * BOARD_COLS + x];
                const centerX = -this.boardSize / 2 + cellSize * (x + 0.5);
                const centerY = this.boardSize / 2 - cellSize * (y + 0.5);
                view.row = y;
                view.col = x;
                view.node.active = true;
                view.node.setPosition(centerX, centerY, 0);
                view.node.getComponent(UITransform)?.setContentSize(cellSize, cellSize);
                view.sprite.color = makeColor(255, 255, 255, 128);
                // Parcel art is width-constrained first and aligned near the tile bottom edge.
                this.setPlantSpriteFit(view.sprite, cellSize * 1.08, cellSize * 1.1, -cellSize * 0.58);
                this.loadSpriteFrameByPath(cell.parcelSpritePath, view.sprite);
                visible.push(view);
            }
        }

        visible.sort((a, b) => {
            if (a.row !== b.row) {
                return a.row - b.row;
            }
            return a.col - b.col;
        });
        for (let i = 0; i < visible.length; i++) {
            visible[i].node.setSiblingIndex(i);
        }
    }

    private drawBoard(state: GameViewState): void {
        const graphics = this.boardGraphics;
        const cellSize = this.boardSize / BOARD_COLS;
        const phase = state.flashPhase;
        this.syncBoardParcels(state, cellSize);
        graphics.clear();

        for (let y = 0; y < BOARD_ROWS; y++) {
            for (let x = 0; x < BOARD_COLS; x++) {
                const cell = state.board[y][x];
                const left = -this.boardSize / 2 + cellSize * x;
                const top = this.boardSize / 2 - cellSize * y;
                const levelLabel = this.levelLabels[y][x];

                this.cellLabels[y][x].fontSize = 20;
                levelLabel.fontSize = clamp(cellSize * 0.17, 12, 17);

                if (cell.rotten) {
                    graphics.fillColor = makeColor(107, 80, 67, 255);
                    graphics.rect(left + 3, top - cellSize + 3, cellSize - 6, cellSize - 6);
                    graphics.fill();
                    this.cellLabels[y][x].string = 'X';
                    this.cellLabels[y][x].color = makeColor(255, 255, 255, 255);
                    levelLabel.string = '';
                } else if (cell.baseColor) {
                    this.cellLabels[y][x].string = '';
                    this.cellLabels[y][x].color = makeColor(72, 58, 45, 255);
                    if (cell.diceIndex >= 0) {
                        const tagW = cellSize * 0.68;
                        const tagH = cellSize * 0.2;
                        const tagX = left + (cellSize - tagW) / 2;
                        const tagY = top - cellSize * 0.985;
                        graphics.fillColor = makeColor(62, 62, 66, 168);
                        graphics.roundRect(tagX, tagY, tagW, tagH, 9);
                        graphics.fill();
                        graphics.fillColor = makeColor(255, 255, 255, 34);
                        graphics.roundRect(tagX + 2, tagY + tagH * 0.08, tagW - 4, tagH * 0.34, 7);
                        graphics.fill();
                        graphics.lineWidth = 2;
                        graphics.strokeColor = makeColor(228, 220, 202, 120);
                        graphics.roundRect(tagX, tagY, tagW, tagH, 9);
                        graphics.stroke();
                    }
                    levelLabel.string = cell.diceIndex >= 0 ? `Lv.${cell.diceIndex + 2}` : '';
                    levelLabel.color = cell.diceIndex >= 0
                        ? makeColor(246, 238, 221, 255)
                        : makeColor(88, 66, 40, 255);
                } else {
                    this.cellLabels[y][x].string = '';
                    levelLabel.string = '';
                }
            }
        }
        this.syncBoardPlants(state, cellSize);

        if (state.preview) {
            const preview = state.preview;
            const previewOffsetX = state.preplaceLocked ? this.previewRotateTweenState.offsetX : 0;
            const previewOffsetY = state.preplaceLocked ? this.previewRotateTweenState.offsetY : 0;
            const minX = Math.min(...preview.cells.map((c) => c.x));
            const maxX = Math.max(...preview.cells.map((c) => c.x));
            const minY = Math.min(...preview.cells.map((c) => c.y));
            const maxY = Math.max(...preview.cells.map((c) => c.y));
            const outerLeft = -this.boardSize / 2 + cellSize * minX + previewOffsetX;
            const outerTop = this.boardSize / 2 - cellSize * minY + previewOffsetY;
            const outerW = cellSize * (maxX - minX + 1);
            const outerH = cellSize * (maxY - minY + 1);
            const previewPivotX = outerLeft + outerW / 2;
            const previewPivotY = outerTop - outerH / 2;
            const previewAngleRad = state.preplaceLocked ? this.previewRotateTweenState.extraDeg * Math.PI / 180 : 0;

            for (const cell of preview.cells) {
                const left = -this.boardSize / 2 + cellSize * cell.x + previewOffsetX;
                const top = this.boardSize / 2 - cellSize * cell.y + previewOffsetY;
                const pad = cell.blocked ? 8 : 10;
                const rectX = left + pad;
                const rectY = top - cellSize + pad;
                const rectW = cellSize - pad * 2;
                const rectH = cellSize - pad * 2;

                if (cell.blocked) {
                    graphics.fillColor = makeColor(85, 64, 58, 120);
                    this.tracePreviewRect(graphics, rectX, rectY, rectW, rectH, previewPivotX, previewPivotY, previewAngleRad);
                    graphics.fill();
                } else if (cell.overlapsSame || cell.overlapsDiff) {
                    graphics.fillColor = makeColor(88, 88, 92, state.preplaceLocked ? 178 : 146);
                    this.tracePreviewRect(graphics, rectX, rectY, rectW, rectH, previewPivotX, previewPivotY, previewAngleRad);
                    graphics.fill();
                    graphics.lineWidth = 2;
                    graphics.strokeColor = makeColor(218, 214, 205, state.preplaceLocked ? 168 : 132);
                    this.tracePreviewRect(graphics, rectX, rectY, rectW, rectH, previewPivotX, previewPivotY, previewAngleRad);
                    graphics.stroke();
                }

                if (!cell.blocked && cell.overlapsSame) {
                    const mark = this.cellLabels[cell.y][cell.x];
                    mark.string = '✓';
                    mark.fontSize = clamp(cellSize * 0.42, 22, 34);
                    mark.color = makeColor(25, 170, 72, 255);
                } else if (!cell.blocked && cell.overlapsDiff) {
                    const mark = this.cellLabels[cell.y][cell.x];
                    mark.string = '✕';
                    mark.fontSize = clamp(cellSize * 0.42, 22, 34);
                    mark.color = makeColor(225, 54, 44, 255);
                } else if (state.preplaceLocked) {
                    if (cell.overlapsSame || cell.overlapsDiff) {
                        // handled by explicit mark rendering above
                    }
                } else {
                    graphics.lineWidth = 2;
                    if (cell.overlapsSame || cell.overlapsDiff) {
                        // overlap state now uses gray badge + mark only
                    }
                }
            }

            if (state.preplaceLocked) {
                const dragHintAlpha = flashAlpha(phase, 70, 60);
                const draggingBoost = this.preplace2BoardDragging ? 35 : 0;
                const dropPulse = this.previewDropPulseState.value;
                if (this.preplace2BoardDragging) {
                    graphics.fillColor = preview.isValid ? makeColor(96, 208, 132, 42) : makeColor(222, 118, 96, 42);
                    this.tracePreviewRect(
                        graphics,
                        outerLeft - 16,
                        outerTop - outerH - 16,
                        outerW + 32,
                        outerH + 32,
                        previewPivotX,
                        previewPivotY,
                        previewAngleRad,
                    );
                    graphics.fill();

                    graphics.fillColor = preview.isValid ? makeColor(96, 208, 132, 24) : makeColor(222, 118, 96, 24);
                    this.tracePreviewRect(
                        graphics,
                        outerLeft - 24,
                        outerTop - outerH - 24,
                        outerW + 48,
                        outerH + 48,
                        previewPivotX,
                        previewPivotY,
                        previewAngleRad,
                    );
                    graphics.fill();
                }
                graphics.lineWidth = 3;
                graphics.strokeColor = preview.isValid
                    ? makeColor(60, 150, 84, dragHintAlpha + draggingBoost)
                    : makeColor(190, 88, 70, dragHintAlpha + draggingBoost);
                this.tracePreviewRect(
                    graphics,
                    outerLeft - 6,
                    outerTop - outerH - 6,
                    outerW + 12,
                    outerH + 12,
                    previewPivotX,
                    previewPivotY,
                    previewAngleRad,
                );
                graphics.stroke();

                const handleY = outerTop + 16;
                const dotR = clamp(cellSize * 0.07, 3, 5);
                const dotGap = dotR * 3.2;
                graphics.fillColor = makeColor(88, 76, 58, this.preplace2BoardDragging ? 225 : 185);
                for (const offset of [-dotGap, 0, dotGap]) {
                    const p = this.rotatePointAroundPivot(previewPivotX + offset, handleY, previewPivotX, previewPivotY, previewAngleRad);
                    graphics.circle(p.x, p.y, dotR);
                    graphics.fill();
                }

                if (this.preplace2BoardDragging) {
                    graphics.lineWidth = 4;
                    graphics.strokeColor = preview.isValid ? makeColor(78, 182, 108, 245) : makeColor(210, 94, 72, 245);
                    this.tracePreviewRect(
                        graphics,
                        outerLeft - 11,
                        outerTop - outerH - 11,
                        outerW + 22,
                        outerH + 22,
                        previewPivotX,
                        previewPivotY,
                        previewAngleRad,
                    );
                    graphics.stroke();
                }

                if (dropPulse > 0.001) {
                    const pulseGrow = lerp(18, 0, 1 - dropPulse);
                    const pulseAlpha = Math.floor(lerp(0, 165, dropPulse));
                    graphics.lineWidth = 3;
                    graphics.strokeColor = preview.isValid
                        ? makeColor(96, 198, 124, pulseAlpha)
                        : makeColor(220, 118, 96, pulseAlpha);
                    this.tracePreviewRect(
                        graphics,
                        outerLeft - pulseGrow,
                        outerTop - outerH - pulseGrow,
                        outerW + pulseGrow * 2,
                        outerH + pulseGrow * 2,
                        previewPivotX,
                        previewPivotY,
                        previewAngleRad,
                    );
                    graphics.stroke();
                }
            }

            const outerThick = state.preplaceLocked ? 5 : 4;
            graphics.lineWidth = outerThick;
            const oa = 240;
            graphics.strokeColor = preview.isValid ? makeColor(50, 140, 70, oa) : makeColor(180, 70, 55, oa);
            this.tracePreviewRect(
                graphics,
                outerLeft + 4,
                outerTop - outerH + 4,
                outerW - 8,
                outerH - 8,
                previewPivotX,
                previewPivotY,
                previewAngleRad,
            );
            graphics.stroke();
        }

        graphics.strokeColor = makeColor(170, 154, 120, 255);
        graphics.lineWidth = 2;
        for (let x = 0; x <= BOARD_COLS; x++) {
            const drawX = -this.boardSize / 2 + cellSize * x;
            graphics.moveTo(drawX, -this.boardSize / 2);
            graphics.lineTo(drawX, this.boardSize / 2);
        }
        for (let y = 0; y <= BOARD_ROWS; y++) {
            const drawY = this.boardSize / 2 - cellSize * y;
            graphics.moveTo(-this.boardSize / 2, drawY);
            graphics.lineTo(this.boardSize / 2, drawY);
        }
        graphics.stroke();
    }

    private createLabel(
        parent: Node,
        name: string,
        width: number,
        height: number,
        x: number,
        y: number,
        fontSize: number,
        horizontal: HorizontalTextAlignment,
        vertical: VerticalTextAlignment,
    ): Label {
        const node = this.makeNode(name, width, height, x, y);
        const label = node.addComponent(Label);
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.horizontalAlign = horizontal;
        label.verticalAlign = vertical;
        label.color = makeColor(74, 60, 44, 255);
        parent.addChild(node);
        return label;
    }

    private makePanel(name: string, width: number, height: number, x: number, y: number, color: Color): Node {
        const node = this.makeNode(name, width, height, x, y);
        const graphics = node.addComponent(Graphics);
        graphics.fillColor = color;
        graphics.roundRect(-width / 2, -height / 2, width, height, clamp(Math.min(width, height) * 0.08, 14, 18));
        graphics.fill();
        return node;
    }

    private makeNode(name: string, width: number, height: number, x: number, y: number): Node {
        const node = new Node(name);
        node.layer = Layers.Enum.UI_2D;
        const transform = node.addComponent(UITransform);
        transform.setContentSize(width, height);
        node.setPosition(new Vec3(x, y, 0));
        return node;
    }

    private resolveAnchor(boardTransform: UITransform, uiX: number, uiY: number): GridPos | null {
        const local = boardTransform.convertToNodeSpaceAR(new Vec3(uiX, uiY, 0));
        const half = this.boardSize / 2;
        if (local.x < -half || local.x >= half || local.y <= -half || local.y > half) {
            return null;
        }

        const cellSize = this.boardSize / BOARD_COLS;
        const pointerCellX = Math.floor((local.x + half) / cellSize);
        const pointerCellY = Math.floor((half - local.y) / cellSize);
        const activeBounds = this.getActivePlacementBounds();
        const x = clamp(pointerCellX - (activeBounds.width - 1), 0, BOARD_COLS - activeBounds.width);
        const y = clamp(pointerCellY - (activeBounds.height - 1), 0, BOARD_ROWS - activeBounds.height);

        return { x, y };
    }

    private measureLayout(): void {
        const rootTransform = this.root.getComponent(UITransform);
        const contentSize = rootTransform?.contentSize;

        this.rootWidth = Math.max(contentSize?.width ?? 720, 360);
        this.rootHeight = Math.max(contentSize?.height ?? 1280, 640);
        this.panelWidth = this.rootWidth - clamp(this.rootWidth * 0.035, 14, 24) * 2;
        this.topPanelHeight = clamp(this.rootHeight * 0.22, 250, 310);
        this.messagePanelHeight = 0;
        this.handPanelHeight = clamp(this.rootHeight * 0.2, 190, 250);

        const handGap = clamp(this.panelWidth * 0.025, 8, 14);
        this.handCardWidth = Math.min(180, (this.panelWidth - handGap * (HAND_SIZE + 1)) / HAND_SIZE);
        this.handCardHeight = clamp(this.handPanelHeight - 30, 150, 190);

        const topPadding = clamp(this.rootHeight * 0.02, 18, 32);
        const bottomPadding = clamp(this.rootHeight * 0.02, 18, 32);
        const sectionGap = clamp(this.rootHeight * 0.012, 12, 18);

        const topRegionBottom = this.rootHeight / 2 - topPadding - this.topPanelHeight - sectionGap;
        const bottomRegionTop = -this.rootHeight / 2 + bottomPadding + this.handPanelHeight + sectionGap;
        const boardAvailable = topRegionBottom - bottomRegionTop;
        this.boardSize = Math.floor(Math.min(this.panelWidth, clamp(boardAvailable, 300, this.rootHeight * 0.52)));
        this.boardCenterY = (topRegionBottom + bottomRegionTop) / 2;
    }
}
