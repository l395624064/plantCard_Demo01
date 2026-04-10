import { GAME_GM_ADD_ROTTEN_AMOUNT, GAME_GM_ADD_SCORE_AMOUNT } from '../GameConst';

export type type_game_main_gm_action = 'draw' | 'score' | 'rotten' | 'restart';

interface interface_game_main_gm_model {
    hand: Array<{ id: string }>;
    drawOneCardToHand: () => unknown;
    gmAddScore: (amount: number) => void;
    gmAddRottenCharge: (amount: number) => void;
    startNewGame: () => void;
}

interface interface_game_main_gm_view_port {
    captureHandLayoutSnapshot: () => unknown;
    scheduleHandRefillAnimation: (removedIdx: number, snapshot: unknown, oldIds: (string | null)[]) => void;
    resetTimeWheel: () => void;
}

interface interface_game_main_gm_context {
    model: interface_game_main_gm_model | null;
    view: interface_game_main_gm_view_port | null;
    currentRotation: number;
    lastRotationStep: -1 | 0 | 1;
    hoverAnchor: unknown;
    lockedPreplaceAnchor: unknown;
    normalizeSelection: () => void;
    render: () => void;
}

function asGmContext(view: unknown): interface_game_main_gm_context {
    return view as interface_game_main_gm_context;
}

export function fn_game_main_run_gm_action(view: unknown, action: type_game_main_gm_action): void {
    const context = asGmContext(view);
    if (!context.model) {
        return;
    }

    if (action === 'draw') {
        const oldIds: (string | null)[] = context.model.hand.map((card) => card.id);
        const handSnap = context.view?.captureHandLayoutSnapshot();
        const drew = context.model.drawOneCardToHand();
        context.normalizeSelection();
        if (drew && context.view && handSnap) {
            context.view.scheduleHandRefillAnimation(-1, handSnap, oldIds);
        }
        context.render();
        return;
    }

    if (action === 'score') {
        context.model.gmAddScore(GAME_GM_ADD_SCORE_AMOUNT);
        context.render();
        return;
    }

    if (action === 'rotten') {
        context.model.gmAddRottenCharge(GAME_GM_ADD_ROTTEN_AMOUNT);
        context.render();
        return;
    }

    context.model.startNewGame();
    context.currentRotation = 0;
    context.lastRotationStep = 0;
    context.hoverAnchor = null;
    context.lockedPreplaceAnchor = null;
    context.view?.resetTimeWheel();
    context.normalizeSelection();
    context.render();
}
