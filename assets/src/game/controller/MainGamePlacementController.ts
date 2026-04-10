import { GridPos } from '../../core/types/BaseGameTypes';

interface interface_game_main_placement_model {
    hand: Array<{ id: string }>;
    status: string;
    placeFromHand: (handIndex: number, anchor: GridPos, rotation: number) => { isValid: boolean };
}

interface interface_game_main_placement_view_port {
    captureHandLayoutSnapshot: () => unknown;
    scheduleHandRefillAnimation: (removedIdx: number, snapshot: unknown, oldIds: (string | null)[]) => void;
}

interface interface_game_main_placement_context {
    model: interface_game_main_placement_model | null;
    view: interface_game_main_placement_view_port | null;
    selectedHandIndex: number;
    currentRotation: number;
    lastRotationStep: -1 | 0 | 1;
    hoverAnchor: GridPos | null;
    lockedPreplaceAnchor: GridPos | null;
    normalizeSelection: () => void;
    render: () => void;
}

function asPlacementContext(view: unknown): interface_game_main_placement_context {
    return view as interface_game_main_placement_context;
}

export function fn_game_main_select_hand(view: unknown, index: number): void {
    const context = asPlacementContext(view);
    if (!context.model || index < 0 || index >= context.model.hand.length) {
        return;
    }
    context.selectedHandIndex = index;
    context.currentRotation = 0;
    context.lastRotationStep = 0;
    context.render();
}

export function fn_game_main_begin_placement_drag(view: unknown, index: number): void {
    const context = asPlacementContext(view);
    context.lockedPreplaceAnchor = null;
    context.hoverAnchor = null;
    context.currentRotation = 0;
    context.lastRotationStep = 0;
    fn_game_main_select_hand(context, index);
}

export function fn_game_main_set_preplace_hover(view: unknown, anchor: GridPos | null): void {
    const context = asPlacementContext(view);
    if (context.lockedPreplaceAnchor !== null) {
        return;
    }
    context.hoverAnchor = anchor;
    context.render();
}

export function fn_game_main_update_locked_preplace_anchor(view: unknown, anchor: GridPos): void {
    const context = asPlacementContext(view);
    if (context.lockedPreplaceAnchor === null) {
        return;
    }
    context.lockedPreplaceAnchor = anchor;
    context.hoverAnchor = anchor;
    context.render();
}

export function fn_game_main_commit_preplace_state2(view: unknown, anchor: GridPos): void {
    const context = asPlacementContext(view);
    context.lockedPreplaceAnchor = anchor;
    context.hoverAnchor = anchor;
    context.render();
}

export function fn_game_main_cancel_preplace(view: unknown): void {
    const context = asPlacementContext(view);
    context.lockedPreplaceAnchor = null;
    context.hoverAnchor = null;
    context.currentRotation = 0;
    context.lastRotationStep = 0;
    context.render();
}

export function fn_game_main_confirm_preplace_place(view: unknown): void {
    const context = asPlacementContext(view);
    if (!context.model || context.model.status !== 'playing' || context.lockedPreplaceAnchor === null) {
        return;
    }
    const anchor = context.lockedPreplaceAnchor;
    const removedIdx = context.selectedHandIndex;
    const oldIds: (string | null)[] = context.model.hand.map((card) => card.id);
    const handSnap = context.view?.captureHandLayoutSnapshot();
    const result = context.model.placeFromHand(removedIdx, anchor, context.currentRotation);
    if (result.isValid) {
        context.currentRotation = 0;
        context.lastRotationStep = 0;
        context.hoverAnchor = null;
        context.lockedPreplaceAnchor = null;
        context.normalizeSelection();
        if (context.view && handSnap) {
            context.view.scheduleHandRefillAnimation(removedIdx, handSnap, oldIds);
        }
    }
    context.render();
}
