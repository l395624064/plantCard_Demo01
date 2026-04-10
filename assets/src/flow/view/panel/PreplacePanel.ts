import { Graphics, Input, Node, UIOpacity, UITransform, Vec3, input } from 'cc';
import { GridPos } from '../../../core/types/BaseGameTypes';
import { GameViewState } from '../../../view/ViewStateTypes';

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

interface interface_game_preplace_refresh_arc_context {
    dragArrow: Graphics | null;
    preplacePhase: 'idle' | 'preplace1_track' | 'preplace2';
    preplaceBar: Node | null;
    preplaceHandIndex: number | null;
    handViews: Array<{ node: Node }>;
    lastRenderState: GameViewState | null;
    root: Node;
    previewCellsToRootCenter: (cells: { x: number; y: number }[]) => Vec3;
    drawPreplaceGuideLine: (fromLocal: Vec3, toLocal: Vec3) => void;
    drawDragArrow: (fromLocal: Vec3, toLocal: Vec3) => void;
}

interface interface_game_preplace_refresh_bar_context {
    preplaceBar: Node | null;
    root: Node;
    rootWidth: number;
    rootHeight: number;
    boardSize: number;
    layoutPreplaceButtons: (useTopStack: boolean) => void;
    refreshArcOnly: () => void;
    previewCellsToRootCenter: (cells: { x: number; y: number }[]) => Vec3;
}

export function fn_game_preplace_sync_bar(
    preplaceBar: Node | null,
    state: GameViewState,
    preplace2BoardDragging: boolean,
): void {
    if (!preplaceBar) {
        return;
    }
    preplaceBar.active = state.preplaceLocked;
    let opacity = preplaceBar.getComponent(UIOpacity);
    if (!opacity) {
        opacity = preplaceBar.addComponent(UIOpacity);
    }
    opacity.opacity = state.preplaceLocked
        ? (preplace2BoardDragging ? 140 : 255)
        : 255;
    const scale = state.preplaceLocked
        ? (preplace2BoardDragging ? 0.94 : 1)
        : 1;
    preplaceBar.setScale(scale, scale, 1);
}

export function fn_game_preplace_refresh_arc_only(
    context: interface_game_preplace_refresh_arc_context,
): void {
    if (!context.dragArrow || context.preplacePhase === 'idle') {
        if (context.dragArrow) {
            context.dragArrow.node.active = false;
            context.dragArrow.clear();
        }
        return;
    }
    if (!context.lastRenderState?.preview) {
        context.dragArrow.node.active = false;
        context.dragArrow.clear();
        return;
    }
    context.dragArrow.node.active = true;

    if (context.preplacePhase === 'preplace2') {
        if (!context.preplaceBar) {
            context.dragArrow.node.active = false;
            context.dragArrow.clear();
            return;
        }
        const previewCenter = context.previewCellsToRootCenter(context.lastRenderState.preview.cells);
        const barCenter = context.preplaceBar.position.clone();
        context.drawPreplaceGuideLine(previewCenter, barCenter);
        if (context.dragArrow.node) {
            context.dragArrow.node.setSiblingIndex(context.root.children.length - 2);
        }
        return;
    }
    if (context.preplaceHandIndex === null) {
        context.dragArrow.node.active = false;
        context.dragArrow.clear();
        return;
    }

    const handNode = context.handViews[context.preplaceHandIndex].node;
    const tailWorld = handNode.worldPosition;
    const rootTransform = context.root.getComponent(UITransform)!;
    const tailLocal = rootTransform.convertToNodeSpaceAR(tailWorld);
    const headLocal = context.previewCellsToRootCenter(context.lastRenderState.preview.cells);

    context.drawDragArrow(tailLocal, headLocal);
    if (context.dragArrow.node) {
        context.dragArrow.node.setSiblingIndex(context.root.children.length - 1);
    }
}

export function fn_game_preplace_refresh_arc_and_bar_position(
    context: interface_game_preplace_refresh_bar_context,
    state: GameViewState,
): void {
    context.refreshArcOnly();
    if (!context.preplaceBar || !state.preview) {
        return;
    }
    const center = context.previewCellsToRootCenter(state.preview.cells);
    const margin = 14;
    const sideHalfWidth = 314 / 2;
    const overflowLeft = center.x - sideHalfWidth < -context.rootWidth / 2 + margin;
    const overflowRight = center.x + sideHalfWidth > context.rootWidth / 2 - margin;
    const useTopStack = overflowLeft || overflowRight;
    context.layoutPreplaceButtons(useTopStack);
    const barTransform = context.preplaceBar.getComponent(UITransform)!;
    const idealX = center.x;
    const idealY = useTopStack
        ? center.y + clamp(context.boardSize * 0.22, 88, 120)
        : center.y + clamp(context.boardSize * 0.035, 10, 18);
    const x = clamp(
        idealX,
        -context.rootWidth / 2 + barTransform.contentSize.width / 2 + margin,
        context.rootWidth / 2 - barTransform.contentSize.width / 2 - margin,
    );
    const y = clamp(
        idealY,
        -context.rootHeight / 2 + barTransform.contentSize.height / 2 + margin,
        context.rootHeight / 2 - barTransform.contentSize.height / 2 - margin,
    );
    context.preplaceBar.setPosition(x, y, 0);
    context.preplaceBar.setSiblingIndex(context.root.children.length - 1);
}

interface interface_game_preplace_board_pointer_context {
    canStartBoardPointer: () => boolean;
    isPointInsideAnyPreplaceButton: (uiX: number, uiY: number) => boolean;
    resolveAnchor: (uiX: number, uiY: number) => GridPos | null;
    onBeginBoardPointer: (anchor: GridPos, uiX: number, uiY: number) => void;
}

export function fn_game_preplace_on_board_pointer_down(
    context: interface_game_preplace_board_pointer_context,
    uiX: number,
    uiY: number,
): void {
    if (!context.canStartBoardPointer()) {
        return;
    }
    if (context.isPointInsideAnyPreplaceButton(uiX, uiY)) {
        return;
    }
    const anchor = context.resolveAnchor(uiX, uiY);
    if (!anchor) {
        return;
    }
    context.onBeginBoardPointer(anchor, uiX, uiY);
}

interface interface_game_preplace_state2_drag_context {
    canDrag: () => boolean;
    getPointerStart: () => { x: number; y: number };
    isDragging: () => boolean;
    setDragging: (value: boolean) => void;
    resolveAnchor: (uiX: number, uiY: number) => GridPos | null;
    onLockedAnchorUpdate: (anchor: GridPos) => void;
}

export function fn_game_preplace_state2_drag_move(
    context: interface_game_preplace_state2_drag_context,
    uiX: number,
    uiY: number,
): void {
    if (!context.canDrag()) {
        return;
    }
    const start = context.getPointerStart();
    const dx = uiX - start.x;
    const dy = uiY - start.y;
    const dragThreshold = 8;
    if (!context.isDragging() && dx * dx + dy * dy < dragThreshold * dragThreshold) {
        return;
    }
    context.setDragging(true);
    const anchor = context.resolveAnchor(uiX, uiY);
    if (anchor) {
        context.onLockedAnchorUpdate(anchor);
    }
}

interface interface_game_preplace_track_context {
    updateLiftAndLayout: (uiY: number) => void;
    resolveAnchor: (uiX: number, uiY: number) => GridPos | null;
    onHoverAnchor: (anchor: GridPos | null) => void;
    refreshArcOnly: () => void;
    stopTrackingListeners: () => void;
    cancelFlow: () => void;
    enterState2: (anchor: GridPos) => void;
}

export function fn_game_preplace_update_tracking(
    context: interface_game_preplace_track_context,
    uiX: number,
    uiY: number,
): void {
    context.updateLiftAndLayout(uiY);
    const anchor = context.resolveAnchor(uiX, uiY);
    context.onHoverAnchor(anchor);
    context.refreshArcOnly();
}

export function fn_game_preplace_finish_track(
    context: interface_game_preplace_track_context,
    uiX: number,
    uiY: number,
): void {
    context.stopTrackingListeners();
    const anchor = context.resolveAnchor(uiX, uiY);
    if (!anchor) {
        context.cancelFlow();
        return;
    }
    context.onHoverAnchor(anchor);
    context.enterState2(anchor);
}

interface interface_game_preplace_cancel_context {
    teardownTrackingListeners: () => void;
    resetPreviewRotateState: () => void;
    resetPhaseState: () => void;
    clearDragArrow: () => void;
    hidePreplaceBar: () => void;
    onCancelNotify: () => void;
}

export function fn_game_preplace_cancel_flow(
    context: interface_game_preplace_cancel_context,
    notify: boolean,
): void {
    context.teardownTrackingListeners();
    context.resetPreviewRotateState();
    context.resetPhaseState();
    context.clearDragArrow();
    context.hidePreplaceBar();
    if (notify) {
        context.onCancelNotify();
    }
}

// Lean wrappers for GameViewImpl to keep main file shorter.
export function fn_game_preplace_on_board_pointer_down_for_view(
    view: any,
    boardTransform: UITransform,
    uiX: number,
    uiY: number,
): void {
    fn_game_preplace_on_board_pointer_down({
        canStartBoardPointer: () => view.preplacePhase === 'preplace2'
            && !view.preplace2PointerDown
            && !view.isPreplaceBoardInputSuppressed(),
        isPointInsideAnyPreplaceButton: (x, y) => view.isPointInsideAnyPreplaceButton(x, y),
        resolveAnchor: (x, y) => view.resolveAnchor(boardTransform, x, y),
        onBeginBoardPointer: (anchor, x, y) => {
            view.preplace2PointerDown = true;
            view.preplace2PointerStartX = x;
            view.preplace2PointerStartY = y;
            view.callbacks.onLockedPreplaceAnchorUpdate(anchor);
            input.on(Input.EventType.TOUCH_MOVE, view.onState2BoardDragMoveTouch, view);
            input.on(Input.EventType.TOUCH_END, view.onState2BoardDragEndTouch, view);
            input.on(Input.EventType.TOUCH_CANCEL, view.onState2BoardDragEndTouch, view);
            input.on(Input.EventType.MOUSE_MOVE, view.onState2BoardDragMoveMouse, view);
            input.on(Input.EventType.MOUSE_UP, view.onState2BoardDragEndMouse, view);
        },
    }, uiX, uiY);
}

export function fn_game_preplace_state2_drag_move_for_view(view: any, uiX: number, uiY: number): void {
    const boardTransform = view.boardNode.getComponent(UITransform)!;
    fn_game_preplace_state2_drag_move({
        canDrag: () => view.preplace2PointerDown,
        getPointerStart: () => ({ x: view.preplace2PointerStartX, y: view.preplace2PointerStartY }),
        isDragging: () => view.preplace2BoardDragging,
        setDragging: (value) => { view.preplace2BoardDragging = value; },
        resolveAnchor: (x, y) => view.resolveAnchor(boardTransform, x, y),
        onLockedAnchorUpdate: (anchor) => view.callbacks.onLockedPreplaceAnchorUpdate(anchor),
    }, uiX, uiY);
}

export function fn_game_preplace_update_tracking_for_view(view: any, uiX: number, uiY: number): void {
    const boardTransform = view.boardNode.getComponent(UITransform)!;
    fn_game_preplace_update_tracking({
        updateLiftAndLayout: (nextY) => {
            if (view.preplaceHandIndex !== null) {
                view.handDragLiftY = clamp(nextY - view.handDragStartY, 0, view.getMaxHandDragLift());
                view.applyHandFanLayout();
            }
        },
        resolveAnchor: (x, y) => view.resolveAnchor(boardTransform, x, y),
        onHoverAnchor: (anchor) => view.callbacks.onPreplaceHoverAnchor(anchor),
        refreshArcOnly: () => view.refreshArcOnly(),
        stopTrackingListeners: () => {
            view.root.off(Node.EventType.TOUCH_MOVE, view.onRootTouchMove, view);
            view.root.off(Node.EventType.TOUCH_END, view.onRootTouchEnd, view);
            view.root.off(Node.EventType.TOUCH_CANCEL, view.onRootTouchEnd, view);
            view.root.off(Node.EventType.MOUSE_MOVE, view.onRootMouseMove, view);
            view.root.off(Node.EventType.MOUSE_UP, view.onRootMouseUp, view);
        },
        cancelFlow: () => view.cancelPreplaceFlow(),
        enterState2: (anchor) => view.enterPreplace2(anchor),
    }, uiX, uiY);
}

export function fn_game_preplace_finish_track_for_view(view: any, uiX: number, uiY: number): void {
    const boardTransform = view.boardNode.getComponent(UITransform)!;
    fn_game_preplace_finish_track({
        updateLiftAndLayout: () => {},
        resolveAnchor: (x, y) => view.resolveAnchor(boardTransform, x, y),
        onHoverAnchor: (anchor) => view.callbacks.onPreplaceHoverAnchor(anchor),
        refreshArcOnly: () => view.refreshArcOnly(),
        stopTrackingListeners: () => {
            view.root.off(Node.EventType.TOUCH_MOVE, view.onRootTouchMove, view);
            view.root.off(Node.EventType.TOUCH_END, view.onRootTouchEnd, view);
            view.root.off(Node.EventType.TOUCH_CANCEL, view.onRootTouchEnd, view);
            view.root.off(Node.EventType.MOUSE_MOVE, view.onRootMouseMove, view);
            view.root.off(Node.EventType.MOUSE_UP, view.onRootMouseUp, view);
        },
        cancelFlow: () => view.cancelPreplaceFlow(),
        enterState2: (anchor) => view.enterPreplace2(anchor),
    }, uiX, uiY);
}

export function fn_game_preplace_cancel_flow_for_view(view: any, notify: boolean): void {
    fn_game_preplace_cancel_flow({
        teardownTrackingListeners: () => view.teardownTrackingListeners(),
        resetPreviewRotateState: () => view.resetPreviewRotateState(),
        resetPhaseState: () => {
            view.preplacePhase = 'idle';
            view.preplaceHandIndex = null;
            view.handDragLiftY = 0;
            view.preplace2BoardDragging = false;
        },
        clearDragArrow: () => {
            if (view.dragArrow) {
                view.dragArrow.clear();
            }
        },
        hidePreplaceBar: () => {
            if (view.preplaceBar) {
                view.preplaceBar.active = false;
            }
        },
        onCancelNotify: () => view.callbacks.onPreplaceCancel(),
    }, notify);
}
