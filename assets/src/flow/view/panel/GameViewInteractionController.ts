import { Color, EventMouse, EventTouch, Input, Node, Tween, UITransform, Vec3, input, tween } from 'cc';
import { BOARD_COLS, BOARD_ROWS } from '../../../GlobalConst';
import { getCardBounds, rotateCardCells } from '../../../card/CardGeometry';
import { isBoardPlacementCard } from '../../../card/CardRuleUtils';
import { fn_game_apply_hand_fan_layout_for_view } from './HandRenderController';
import {
    fn_game_preplace_cancel_flow_for_view,
    fn_game_preplace_on_board_pointer_down_for_view,
    fn_game_preplace_finish_track_for_view,
    fn_game_preplace_update_tracking_for_view,
} from './PreplacePanel';

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function fn_game_view_is_preplace_board_input_suppressed(view: any): boolean {
    return Date.now() < view.preplaceBoardInputSuppressUntil;
}

export function fn_game_view_set_preplace_button_base_pos(node: Node, x: number, y: number): void {
    (node as Node & { __basePos?: Vec3 }).__basePos = new Vec3(x, y, 0);
    node.setPosition(x, y, 0);
}

export function fn_game_view_get_preplace_button_base_pos(node: Node): Vec3 {
    return ((node as Node & { __basePos?: Vec3 }).__basePos ?? node.position).clone();
}

export function fn_game_view_layout_preplace_buttons_for_view(view: any, useTopStack: boolean): void {
    if (!view.preplaceBar) {
        return;
    }
    const transform = view.preplaceBar.getComponent(UITransform)!;
    if (useTopStack) {
        transform.setContentSize(98, 208);
        const orderedTitles = ['旋转', '放置', '取消'];
        const startY = 56;
        const gap = 56;
        for (let i = 0; i < orderedTitles.length; i++) {
            const title = orderedTitles[i];
            const btn = view.preplaceButtons.find((item: any) => item.title === title);
            if (!btn) {
                continue;
            }
            const y = startY - i * gap;
            fn_game_view_set_preplace_button_base_pos(btn.node, 0, y);
            btn.node.setScale(1, 1, 1);
        }
        return;
    }
    transform.setContentSize(250, 126);
    const sideOffset = 88;
    const bw = 74;
    const bh = 42;
    const stackGap = 6;
    const groupLift = 12;
    const upperY = groupLift + bh / 2 + stackGap / 2;
    const lowerY = groupLift - bh / 2 - stackGap / 2;
    for (const btn of view.preplaceButtons) {
        if (btn.title === '旋转') {
            fn_game_view_set_preplace_button_base_pos(btn.node, -sideOffset, groupLift);
        } else if (btn.title === '放置') {
            fn_game_view_set_preplace_button_base_pos(btn.node, sideOffset, upperY);
        } else if (btn.title === '取消') {
            fn_game_view_set_preplace_button_base_pos(btn.node, sideOffset, lowerY);
        }
        btn.node.getComponent(UITransform)?.setContentSize(bw, 44);
        btn.node.setScale(1, 1, 1);
    }
}

export function fn_game_view_bind_global_input_for_view(view: any): void {
    input.on(Input.EventType.MOUSE_DOWN, view.onGlobalMouseDown, view);
    input.on(Input.EventType.TOUCH_START, view.onGlobalTouchStart, view);
}

export function fn_game_view_on_global_touch_start_for_view(view: any, event: EventTouch): void {
    const loc = event.getUILocation();
    if (fn_game_view_is_point_inside_any_preplace_button_for_view(view, loc.x, loc.y)) {
        return;
    }
    fn_game_view_try_close_gm_popup_for_view(view, loc.x, loc.y);
    if (view.preplacePhase === 'preplace2') {
        const boardTransform = view.boardNode.getComponent(UITransform)!;
        fn_game_preplace_on_board_pointer_down_for_view(view, boardTransform, loc.x, loc.y);
    }
}

export function fn_game_view_on_global_mouse_down_for_view(view: any, event: EventMouse): void {
    const loc = event.getUILocation();
    if (fn_game_view_is_point_inside_any_preplace_button_for_view(view, loc.x, loc.y)) {
        return;
    }
    fn_game_view_try_close_gm_popup_for_view(view, loc.x, loc.y);
    if (event.getButton() === EventMouse.BUTTON_LEFT && view.preplacePhase === 'preplace2') {
        const boardTransform = view.boardNode.getComponent(UITransform)!;
        fn_game_preplace_on_board_pointer_down_for_view(view, boardTransform, loc.x, loc.y);
    }
    if (view.preplacePhase === 'idle') {
        return;
    }
    if (event.getButton() === EventMouse.BUTTON_RIGHT) {
        fn_game_preplace_cancel_flow_for_view(view, true);
    }
}

export function fn_game_view_try_close_gm_popup_for_view(view: any, uiX: number, uiY: number): void {
    if (!view.gmPopupOpen || !view.topInfoView.gmPopup || !view.topInfoView.gmButton) {
        return;
    }
    const popupHit = fn_game_view_is_point_inside_node(view.topInfoView.gmPopup, uiX, uiY);
    const buttonHit = fn_game_view_is_point_inside_node(view.topInfoView.gmButton, uiX, uiY);
    if (!popupHit && !buttonHit) {
        view.gmPopupOpen = false;
        view.topInfoView.gmPopup.active = false;
    }
}

export function fn_game_view_is_point_inside_node(node: Node, uiX: number, uiY: number): boolean {
    if (!node?.isValid || !node.activeInHierarchy) {
        return false;
    }
    const transform = node.getComponent(UITransform);
    if (!transform) {
        return false;
    }
    const local = transform.convertToNodeSpaceAR(new Vec3(uiX, uiY, 0));
    const size = transform.contentSize;
    const halfW = size.width / 2;
    const halfH = size.height / 2;
    return local.x >= -halfW && local.x <= halfW && local.y >= -halfH && local.y <= halfH;
}

export function fn_game_view_is_point_inside_any_preplace_button_for_view(view: any, uiX: number, uiY: number): boolean {
    if (!view.preplaceBar || !view.preplaceBar.activeInHierarchy) {
        return false;
    }
    return view.preplaceButtons.some((btn: any) => fn_game_view_is_point_inside_node(btn.node, uiX, uiY));
}

export function fn_game_view_is_pointer_near_locked_preview_for_view(
    view: any,
    boardTransform: UITransform,
    uiX: number,
    uiY: number,
): boolean {
    const anchor = view.lastRenderState?.preview?.anchor ?? null;
    const bounds = fn_game_view_get_active_placement_bounds_for_view(view);
    if (!anchor || bounds.width <= 0 || bounds.height <= 0) {
        return false;
    }
    const cellSize = view.boardSize / BOARD_COLS;
    const left = -view.boardSize / 2 + anchor.x * cellSize;
    const top = view.boardSize / 2 - anchor.y * cellSize;
    const width = bounds.width * cellSize;
    const height = bounds.height * cellSize;
    const pad = cellSize * 0.38;
    const local = boardTransform.convertToNodeSpaceAR(new Vec3(uiX, uiY, 0));
    return local.x >= left - pad
        && local.x <= left + width + pad
        && local.y <= top + pad
        && local.y >= top - height - pad;
}

export function fn_game_view_get_active_placement_bounds_for_view(view: any): { width: number; height: number } {
    const state = view.lastRenderState;
    const card = state && view.preplaceHandIndex !== null ? state.handSlots[view.preplaceHandIndex]?.card : null;
    if (!card || !isBoardPlacementCard(card)) {
        return { width: 1, height: 1 };
    }
    const rotation = state?.rotation ?? 0;
    return getCardBounds(rotateCardCells(card.cells, rotation));
}

export function fn_game_view_on_hand_card_touch_start_for_view(view: any, index: number, event: EventTouch): void {
    event.propagationStopped = true;
    fn_game_view_try_begin_preplace_for_view(view, index, event.getUILocation().y);
}

export function fn_game_view_on_hand_card_mouse_down_for_view(view: any, index: number, event: EventMouse): void {
    if (event.getButton() !== EventMouse.BUTTON_LEFT) {
        return;
    }
    event.propagationStopped = true;
    fn_game_view_try_begin_preplace_for_view(view, index, event.getUILocation().y);
}

export function fn_game_view_on_hand_card_mouse_enter_for_view(view: any, index: number): void {
    if (view.preplacePhase !== 'idle') {
        return;
    }
    view.hoverHandIndex = index;
    fn_game_apply_hand_fan_layout_for_view(view, view.lastRenderState?.handSlots.length ?? view.handViews.length);
}

export function fn_game_view_on_hand_card_mouse_leave_for_view(view: any, index: number): void {
    if (view.preplacePhase !== 'idle' || view.hoverHandIndex !== index) {
        return;
    }
    view.hoverHandIndex = null;
    fn_game_apply_hand_fan_layout_for_view(view, view.lastRenderState?.handSlots.length ?? view.handViews.length);
}

export function fn_game_view_try_begin_preplace_for_view(view: any, index: number, pointerYUi?: number): void {
    if (view.preplacePhase !== 'idle') {
        return;
    }
    const state = view.lastRenderState;
    const slot = state?.handSlots[index];
    if (!slot?.card || !isBoardPlacementCard(slot.card)) {
        return;
    }
    view.callbacks.onBeginPlacementDrag(index);
    view.preplacePhase = 'preplace1_track';
    view.preplaceHandIndex = index;
    view.hoverHandIndex = null;
    view.handDragStartY = pointerYUi ?? 0;
    view.handDragLiftY = 0;
    fn_game_apply_hand_fan_layout_for_view(view, state?.handSlots.length ?? 0);
    view.root.on(Node.EventType.TOUCH_MOVE, view.onRootTouchMove, view);
    view.root.on(Node.EventType.TOUCH_END, view.onRootTouchEnd, view);
    view.root.on(Node.EventType.TOUCH_CANCEL, view.onRootTouchEnd, view);
    view.root.on(Node.EventType.MOUSE_MOVE, view.onRootMouseMove, view);
    view.root.on(Node.EventType.MOUSE_UP, view.onRootMouseUp, view);
}

export function fn_game_view_on_root_touch_move_for_view(view: any, event: EventTouch): void {
    if (view.preplacePhase !== 'preplace1_track') {
        return;
    }
    const p = event.getUILocation();
    fn_game_preplace_update_tracking_for_view(view, p.x, p.y);
}

export function fn_game_view_on_root_touch_end_for_view(view: any, event: EventTouch): void {
    if (view.preplacePhase !== 'preplace1_track') {
        return;
    }
    const p = event.getUILocation();
    fn_game_preplace_finish_track_for_view(view, p.x, p.y);
}

export function fn_game_view_on_root_mouse_move_for_view(view: any, event: EventMouse): void {
    if (view.preplacePhase !== 'preplace1_track') {
        return;
    }
    const p = event.getUILocation();
    fn_game_preplace_update_tracking_for_view(view, p.x, p.y);
}

export function fn_game_view_on_root_mouse_up_for_view(view: any, event: EventMouse): void {
    if (event.getButton() !== EventMouse.BUTTON_LEFT || view.preplacePhase !== 'preplace1_track') {
        return;
    }
    const p = event.getUILocation();
    fn_game_preplace_finish_track_for_view(view, p.x, p.y);
}

export function fn_game_view_enter_preplace2_for_view(view: any, anchor: { x: number; y: number }): void {
    view.handDragLiftY = 0;
    fn_game_apply_hand_fan_layout_for_view(view);
    view.preplacePhase = 'preplace2';
    view.callbacks.onPreplaceCommitState2(anchor);
    if (view.preplaceBar) {
        view.preplaceBar.active = true;
    }
}

export function fn_game_view_teardown_tracking_listeners_for_view(view: any): void {
    view.root.off(Node.EventType.TOUCH_MOVE, view.onRootTouchMove, view);
    view.root.off(Node.EventType.TOUCH_END, view.onRootTouchEnd, view);
    view.root.off(Node.EventType.TOUCH_CANCEL, view.onRootTouchEnd, view);
    view.root.off(Node.EventType.MOUSE_MOVE, view.onRootMouseMove, view);
    view.root.off(Node.EventType.MOUSE_UP, view.onRootMouseUp, view);
}

export function fn_game_view_draw_drag_arrow_for_view(view: any, fromLocal: Vec3, toLocal: Vec3): void {
    if (!view.dragArrow) {
        return;
    }
    const graphics = view.dragArrow;
    graphics.clear();
    const dx = toLocal.x - fromLocal.x;
    const dy = toLocal.y - fromLocal.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) {
        return;
    }
    const ux = dx / len;
    const uy = dy / len;
    const leftX = -uy;
    const leftY = ux;
    const arrowSize = Math.min(26, Math.max(14, len * 0.1));
    graphics.lineWidth = 6;
    graphics.strokeColor = new Color(104, 170, 255, 255);
    graphics.moveTo(fromLocal.x, fromLocal.y);
    graphics.lineTo(toLocal.x, toLocal.y);
    graphics.stroke();
    graphics.fillColor = new Color(104, 170, 255, 230);
    graphics.moveTo(toLocal.x, toLocal.y);
    graphics.lineTo(toLocal.x - ux * arrowSize + leftX * arrowSize * 0.6, toLocal.y - uy * arrowSize + leftY * arrowSize * 0.6);
    graphics.lineTo(toLocal.x - ux * arrowSize - leftX * arrowSize * 0.6, toLocal.y - uy * arrowSize - leftY * arrowSize * 0.6);
    graphics.close();
    graphics.fill();
}

export function fn_game_view_draw_preplace_guide_line_for_view(view: any, fromLocal: Vec3, toLocal: Vec3): void {
    if (!view.dragArrow) {
        return;
    }
    const g = view.dragArrow;
    g.clear();
    g.lineWidth = 2;
    g.strokeColor = new Color(72, 160, 92, 180);
    const dash = 12;
    const gap = 8;
    const dx = toLocal.x - fromLocal.x;
    const dy = toLocal.y - fromLocal.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) {
        return;
    }
    const ux = dx / len;
    const uy = dy / len;
    let dist = 0;
    while (dist < len) {
        const segStart = dist;
        const segEnd = Math.min(dist + dash, len);
        const sx = fromLocal.x + ux * segStart;
        const sy = fromLocal.y + uy * segStart;
        const ex = fromLocal.x + ux * segEnd;
        const ey = fromLocal.y + uy * segEnd;
        g.moveTo(sx, sy);
        g.lineTo(ex, ey);
        dist += dash + gap;
    }
    g.stroke();
}

export function fn_game_view_play_preview_drop_pulse_for_view(view: any): void {
    Tween.stopAllByTarget(view.previewDropPulseState);
    view.previewDropPulseState.value = 1;
    tween(view.previewDropPulseState)
        .to(0.2, { value: 0 }, { easing: 'quadOut' })
        .start();
}

export function fn_game_view_resolve_anchor_for_view(
    view: any,
    boardTransform: UITransform,
    uiX: number,
    uiY: number,
): { x: number; y: number } | null {
    const local = boardTransform.convertToNodeSpaceAR(new Vec3(uiX, uiY, 0));
    const half = view.boardSize / 2;
    if (local.x < -half || local.x >= half || local.y <= -half || local.y > half) {
        return null;
    }

    const cellSize = view.boardSize / BOARD_COLS;
    const pointerCellX = Math.floor((local.x + half) / cellSize);
    const pointerCellY = Math.floor((half - local.y) / cellSize);
    const activeBounds = fn_game_view_get_active_placement_bounds_for_view(view);
    const x = clamp(pointerCellX - (activeBounds.width - 1), 0, BOARD_COLS - activeBounds.width);
    const y = clamp(pointerCellY - (activeBounds.height - 1), 0, BOARD_ROWS - activeBounds.height);

    return { x, y };
}
