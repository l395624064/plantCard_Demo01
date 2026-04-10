import {
    Color,
    EventMouse,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Input,
    Label,
    Node,
    Sprite,
    SpriteFrame,
    Tween,
    UITransform,
    Vec3,
    VerticalTextAlignment,
    input,
    tween,
} from 'cc';
import {
    BOARD_COLS,
    HAND_SIZE,
} from './GlobalConst';
import { Rotation, GridPos } from './core/types/BaseGameTypes';
import { GameViewState } from './view/ViewStateTypes';
import { ADAPTIVE_DESIGN_HEIGHT, ADAPTIVE_DESIGN_WIDTH } from './core/adaptive/AdaptiveLayout';
import { fn_game_render_topInfo_panel, fn_game_sync_topInfo_timeWheel, interface_game_topInfo_view } from './flow/view/panel/TopInfoPanel';
import { fn_game_render_message_panel, interface_game_message_view } from './flow/view/panel/MessagePanel';
import { interface_game_hand_card_view } from './flow/view/panel/HandPanel';
import {
    interface_game_board_parcel_cell_view,
    interface_game_board_plant_cell_view,
} from './flow/view/panel/BoardPanel';
import {
    fn_game_preplace_cancel_flow_for_view,
    fn_game_preplace_refresh_arc_and_bar_position,
    fn_game_preplace_refresh_arc_only,
    fn_game_preplace_state2_drag_move_for_view,
    fn_game_preplace_sync_bar,
} from './flow/view/panel/PreplacePanel';
import { fn_game_start_hand_refill_animation_for_view } from './flow/view/panel/HandRefillAnimator';
import {
    fn_game_view_create_board_for_view,
    fn_game_view_create_drag_arrow_only_for_view,
    fn_game_view_create_preplace_bar_for_view,
} from './flow/view/panel/GameViewUiBuilder';
import {
    fn_game_sync_preview_rotate_tween_for_view,
} from './flow/view/panel/PreviewGeometry';
import {
    fn_game_apply_hand_fan_layout_for_view,
    fn_game_render_hand_for_view,
} from './flow/view/panel/HandRenderController';
import {
    fn_game_view_create_background_for_view,
    fn_game_view_get_max_hand_drag_lift,
    fn_game_view_measure_layout_for_view,
} from './flow/view/panel/GameViewBaseService';
import {
    fn_game_view_bind_global_input_for_view,
    fn_game_view_draw_drag_arrow_for_view,
    fn_game_view_enter_preplace2_for_view,
    fn_game_view_is_point_inside_any_preplace_button_for_view,
    fn_game_view_is_point_inside_node,
    fn_game_view_is_preplace_board_input_suppressed,
    fn_game_view_layout_preplace_buttons_for_view,
    fn_game_view_on_global_mouse_down_for_view,
    fn_game_view_on_global_touch_start_for_view,
    fn_game_view_on_hand_card_mouse_down_for_view,
    fn_game_view_on_hand_card_mouse_enter_for_view,
    fn_game_view_on_hand_card_mouse_leave_for_view,
    fn_game_view_on_hand_card_touch_start_for_view,
    fn_game_view_on_root_mouse_move_for_view,
    fn_game_view_on_root_mouse_up_for_view,
    fn_game_view_on_root_touch_end_for_view,
    fn_game_view_on_root_touch_move_for_view,
    fn_game_view_play_preview_drop_pulse_for_view,
    fn_game_view_resolve_anchor_for_view,
    fn_game_view_teardown_tracking_listeners_for_view,
    fn_game_view_try_begin_preplace_for_view,
    fn_game_view_draw_preplace_guide_line_for_view,
} from './flow/view/panel/GameViewInteractionController';
import {
    fn_game_view_create_hand_area_for_view,
    fn_game_view_create_message_for_view,
    fn_game_view_create_top_info_for_view,
    fn_game_view_draw_board_for_view,
} from './flow/view/panel/GameViewSceneAssembler';
import {
    GAME_TIME_WHEEL_SEASONS,
    GAME_TIME_WHEEL_YEAR_LABELS,
} from './flow/GameConst';

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

type PreplacePhase = 'idle' | 'preplace1_track' | 'preplace2';

function makeColor(r: number, g: number, b: number, a = 255): Color {
    return new Color(r, g, b, a);
}

function rotationToText(rotation: Rotation): string {
    return `${rotation * 90}°`;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export interface HandLayoutSnapshot {
    positions: Vec3[];
    eulers: Vec3[];
}

export class GameView {
    private readonly root: Node;
    private readonly callbacks: GameViewCallbacks;
    private readonly spriteFrameCache = new Map<string, SpriteFrame>();
    private readonly spriteFrameWaiters = new Map<string, Set<Sprite>>();

    private rootWidth = ADAPTIVE_DESIGN_WIDTH;
    private rootHeight = ADAPTIVE_DESIGN_HEIGHT;
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
    private readonly boardParcelViews: interface_game_board_parcel_cell_view[] = [];
    private readonly boardPlantViews: interface_game_board_plant_cell_view[] = [];
    private readonly previewPlantViews: interface_game_board_plant_cell_view[] = [];
    private readonly topInfoView: interface_game_topInfo_view;
    private readonly messageView: interface_game_message_view;
    private readonly handViews: interface_game_hand_card_view[] = [];
    private readonly preplaceButtons: Array<{ title: string; node: Node }> = [];
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

        fn_game_view_create_background_for_view(this);
        this.topInfoView = fn_game_view_create_top_info_for_view(this);
        this.messageView = fn_game_view_create_message_for_view(this);
        this.boardNode = fn_game_view_create_board_for_view(this);
        this.boardGraphics = this.boardNode.getChildByName('BoardOverlay')!.getComponent(Graphics)!;
        fn_game_view_create_hand_area_for_view(this);
        fn_game_view_create_drag_arrow_only_for_view(this);
        fn_game_view_create_preplace_bar_for_view(this);
        fn_game_view_bind_global_input_for_view(this);
    }

    public render(state: GameViewState): void {
        try {
            if (this.pendingHandRefillAnim) {
                const p = this.pendingHandRefillAnim;
                this.pendingHandRefillAnim = null;
                fn_game_start_hand_refill_animation_for_view(this, p.removedIdx, p.snap, p.oldIds, state.handSlots);
            }
            fn_game_sync_preview_rotate_tween_for_view(this, state);
        } catch (error) {
            console.error('[GameView] pre-render pipeline failed:', error);
            this.messageView.panel.active = true;
            this.messageView.label.string = '[GameView] pre-render pipeline failed';
        }
        this.lastRenderState = state;
        try {
            fn_game_render_topInfo_panel(
                this.topInfoView,
                state,
                this.gmPopupOpen,
                this.timeWheelYearIndex,
                this.timeWheelSeasonIndex,
                GAME_TIME_WHEEL_YEAR_LABELS,
                GAME_TIME_WHEEL_SEASONS,
                {
                    clamp,
                    makeColor,
                    rotationToText,
                },
            );
        } catch (error) {
            console.error('[GameView] renderTopInfo failed:', error);
            this.messageView.panel.active = true;
            this.messageView.label.string = '[GameView] renderTopInfo failed';
        }

        const statusText = state.status === 'playing'
            ? state.preview
                ? state.preview.reason
                : state.message
            : `${state.message}`;
        try {
            fn_game_render_message_panel(this.messageView, statusText);
        } catch (error) {
            console.error('[GameView] renderMessage failed:', error);
            this.messageView.panel.active = true;
            this.messageView.label.string = '[GameView] renderMessage failed';
        }

        try {
            fn_game_preplace_sync_bar(
                this.preplaceBar,
                state,
                this.preplace2BoardDragging,
            );
            fn_game_view_draw_board_for_view(this, state);
            fn_game_render_hand_for_view(this, state.handSlots);
            this.refreshArcAndBarPosition(state);
        } catch (error) {
            console.error('[GameView] board/hand render failed:', error);
            this.messageView.panel.active = true;
            this.messageView.label.string = '[GameView] board/hand render failed';
        }
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

    private getMaxHandDragLift(): number {
        return fn_game_view_get_max_hand_drag_lift(this);
    }

    private onState2BoardDragMoveTouch(event: EventTouch): void {
        this.state2BoardDragMove(event.getUILocation().x, event.getUILocation().y);
    }

    private onState2BoardDragMoveMouse(event: EventMouse): void {
        this.state2BoardDragMove(event.getUILocation().x, event.getUILocation().y);
    }

    private state2BoardDragMove(uiX: number, uiY: number): void {
        fn_game_preplace_state2_drag_move_for_view(this, uiX, uiY);
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

    private isPreplaceBoardInputSuppressed(): boolean {
        return fn_game_view_is_preplace_board_input_suppressed(this);
    }

    private layoutPreplaceButtons(useTopStack: boolean): void {
        fn_game_view_layout_preplace_buttons_for_view(this, useTopStack);
    }

    private onGlobalTouchStart(event: EventTouch): void {
        fn_game_view_on_global_touch_start_for_view(this, event);
    }

    private onGlobalMouseDown(event: EventMouse): void {
        fn_game_view_on_global_mouse_down_for_view(this, event);
    }

    private isPointInsideAnyPreplaceButton(uiX: number, uiY: number): boolean {
        return fn_game_view_is_point_inside_any_preplace_button_for_view(this, uiX, uiY);
    }

    private onHandCardTouchStart(index: number, event: EventTouch): void {
        fn_game_view_on_hand_card_touch_start_for_view(this, index, event);
    }

    private onHandCardMouseDown(index: number, event: EventMouse): void {
        fn_game_view_on_hand_card_mouse_down_for_view(this, index, event);
    }

    private onHandCardMouseEnter(index: number): void {
        fn_game_view_on_hand_card_mouse_enter_for_view(this, index);
    }

    private onHandCardMouseLeave(index: number): void {
        fn_game_view_on_hand_card_mouse_leave_for_view(this, index);
    }

    private tryBeginPreplace(index: number, pointerYUi?: number): void {
        fn_game_view_try_begin_preplace_for_view(this, index, pointerYUi);
    }

    private onRootTouchMove(event: EventTouch): void {
        fn_game_view_on_root_touch_move_for_view(this, event);
    }

    private onRootTouchEnd(event: EventTouch): void {
        fn_game_view_on_root_touch_end_for_view(this, event);
    }

    private onRootMouseMove(event: EventMouse): void {
        fn_game_view_on_root_mouse_move_for_view(this, event);
    }

    private onRootMouseUp(event: EventMouse): void {
        fn_game_view_on_root_mouse_up_for_view(this, event);
    }

    private enterPreplace2(anchor: GridPos): void {
        fn_game_view_enter_preplace2_for_view(this, anchor);
    }

    private cancelPreplaceFlow(notify = true): void {
        fn_game_preplace_cancel_flow_for_view(this, notify);
    }

    private teardownTrackingListeners(): void {
        fn_game_view_teardown_tracking_listeners_for_view(this);
        this.endState2BoardDrag();
    }

    private refreshArcAndBarPosition(state: GameViewState): void {
        fn_game_preplace_refresh_arc_and_bar_position({
            preplaceBar: this.preplaceBar,
            root: this.root,
            rootWidth: this.rootWidth,
            rootHeight: this.rootHeight,
            boardSize: this.boardSize,
            layoutPreplaceButtons: (useTopStack) => this.layoutPreplaceButtons(useTopStack),
            refreshArcOnly: () => this.refreshArcOnly(),
            previewCellsToRootCenter: (cells) => this.previewCellsToRootCenter(cells),
        }, state);
    }

    private refreshArcOnly(): void {
        fn_game_preplace_refresh_arc_only({
            dragArrow: this.dragArrow,
            preplacePhase: this.preplacePhase,
            preplaceBar: this.preplaceBar,
            preplaceHandIndex: this.preplaceHandIndex,
            handViews: this.handViews,
            lastRenderState: this.lastRenderState,
            root: this.root,
            previewCellsToRootCenter: (cells) => this.previewCellsToRootCenter(cells),
            drawPreplaceGuideLine: (fromLocal, toLocal) => this.drawPreplaceGuideLine(fromLocal, toLocal),
            drawDragArrow: (fromLocal, toLocal) => this.drawDragArrow(fromLocal, toLocal),
        });
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
        fn_game_view_draw_drag_arrow_for_view(this, fromLocal, toLocal);
    }

    private drawPreplaceGuideLine(fromLocal: Vec3, toLocal: Vec3): void {
        fn_game_view_draw_preplace_guide_line_for_view(this, fromLocal, toLocal);
    }

    private playPreviewDropPulse(): void {
        fn_game_view_play_preview_drop_pulse_for_view(this);
    }

    public resetTimeWheel(): void {
        this.timeWheelYearIndex = 0;
        this.timeWheelSeasonIndex = 0;
        Tween.stopAllByTarget(this.topInfoView.timeWheelOuterNode);
        Tween.stopAllByTarget(this.topInfoView.timeWheelInnerNode);
        fn_game_sync_topInfo_timeWheel(
            this.topInfoView,
            this.timeWheelYearIndex,
            this.timeWheelSeasonIndex,
            GAME_TIME_WHEEL_YEAR_LABELS,
            GAME_TIME_WHEEL_SEASONS,
        );
    }

    private applyHandFanLayout(activeCount = this.lastRenderState?.handSlots.length ?? 0): void {
        fn_game_apply_hand_fan_layout_for_view(this, activeCount);
    }

    private resolveAnchor(boardTransform: UITransform, uiX: number, uiY: number): GridPos | null {
        return fn_game_view_resolve_anchor_for_view(this, boardTransform, uiX, uiY);
    }

    private measureLayout(): void {
        fn_game_view_measure_layout_for_view(this, HAND_SIZE);
    }
}
