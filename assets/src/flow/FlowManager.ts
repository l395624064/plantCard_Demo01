import { BOARD_COLS, BOARD_ROWS } from '../GlobalConst';
import { GridPos, Rotation } from '../core/types/BaseGameTypes';
import { GAME_GM_ADD_ROTTEN_AMOUNT, GAME_GM_ADD_SCORE_AMOUNT } from './GameConst';

export type type_flow_gm_action = 'draw' | 'score' | 'rotten' | 'restart';

interface interface_flow_gm_model {
    hand: Array<{ id: string }>;
    drawOneCardToHand: () => unknown;
    gmAddScore: (amount: number) => void;
    gmAddRottenCharge: (amount: number) => void;
    startNewGame: () => void;
}

interface interface_flow_gm_view_port {
    captureHandLayoutSnapshot: () => unknown;
    scheduleHandRefillAnimation: (removedIdx: number, snapshot: unknown, oldIds: (string | null)[]) => void;
    resetTimeWheel: () => void;
}

interface interface_flow_gm_context {
    model: interface_flow_gm_model | null;
    view: interface_flow_gm_view_port | null;
    currentRotation: number;
    lastRotationStep: -1 | 0 | 1;
    hoverAnchor: unknown;
    lockedPreplaceAnchor: unknown;
    normalizeSelection: () => void;
    render: () => void;
}

function asGmContext(value: unknown): interface_flow_gm_context {
    return value as interface_flow_gm_context;
}

class FlowGmManager {
    public runAction(view: unknown, action: type_flow_gm_action): void {
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
}

class FlowRotationManager {
    public getRotatedAnchorWithKick(
        cardCells: Array<{ x: number; y: number }>,
        anchor: GridPos,
        from: Rotation,
        to: Rotation,
    ): GridPos {
        const kickCandidates = this.getRotationKickCandidates(from, to);
        for (const kick of kickCandidates) {
            const candidate = { x: anchor.x + kick.x, y: anchor.y + kick.y };
            if (this.isAnchorInsideBoard(cardCells, candidate, to)) {
                return candidate;
            }
        }
        return anchor;
    }

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

    private isAnchorInsideBoard(
        cardCells: Array<{ x: number; y: number }>,
        anchor: GridPos,
        rotation: Rotation,
    ): boolean {
        const bounds = this.getRotatedBounds(cardCells, rotation);
        return anchor.x >= 0
            && anchor.y >= 0
            && anchor.x <= BOARD_COLS - bounds.width
            && anchor.y <= BOARD_ROWS - bounds.height;
    }

    private getRotatedBounds(
        cardCells: Array<{ x: number; y: number }>,
        rotation: Rotation,
    ): { width: number; height: number } {
        if (cardCells.length === 0) {
            return { width: 0, height: 0 };
        }
        let cells = cardCells.map((cell) => ({ x: cell.x, y: cell.y }));
        let minX = Math.min(...cells.map((cell) => cell.x));
        let minY = Math.min(...cells.map((cell) => cell.y));
        cells = cells.map((cell) => ({ x: cell.x - minX, y: cell.y - minY }));

        for (let i = 0; i < rotation; i++) {
            const h = Math.max(...cells.map((cell) => cell.y)) + 1;
            cells = cells.map((cell) => ({ x: h - 1 - cell.y, y: cell.x }));
            minX = Math.min(...cells.map((cell) => cell.x));
            minY = Math.min(...cells.map((cell) => cell.y));
            cells = cells.map((cell) => ({ x: cell.x - minX, y: cell.y - minY }));
        }

        const maxX = Math.max(...cells.map((cell) => cell.x));
        const maxY = Math.max(...cells.map((cell) => cell.y));
        return {
            width: maxX + 1,
            height: maxY + 1,
        };
    }
}

export class FlowManager {
    public readonly gmManager = new FlowGmManager();
    public readonly rotationManager = new FlowRotationManager();
}

export const flowManager = new FlowManager();
