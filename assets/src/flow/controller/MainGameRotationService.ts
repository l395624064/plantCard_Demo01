import { BOARD_COLS, BOARD_ROWS } from '../../GlobalConst';
import { GridPos, Rotation } from '../../core/types/BaseGameTypes';

function fn_game_main_get_rotated_bounds(
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

export function fn_game_main_get_rotation_kick_candidates(from: Rotation, to: Rotation): GridPos[] {
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

export function fn_game_main_is_anchor_inside_board(
    cardCells: Array<{ x: number; y: number }>,
    anchor: GridPos,
    rotation: Rotation,
): boolean {
    const bounds = fn_game_main_get_rotated_bounds(cardCells, rotation);
    return anchor.x >= 0
        && anchor.y >= 0
        && anchor.x <= BOARD_COLS - bounds.width
        && anchor.y <= BOARD_ROWS - bounds.height;
}

export function fn_game_main_get_rotated_anchor_with_kick(
    cardCells: Array<{ x: number; y: number }>,
    anchor: GridPos,
    from: Rotation,
    to: Rotation,
): GridPos {
    const kickCandidates = fn_game_main_get_rotation_kick_candidates(from, to);
    for (const kick of kickCandidates) {
        const candidate = { x: anchor.x + kick.x, y: anchor.y + kick.y };
        if (fn_game_main_is_anchor_inside_board(cardCells, candidate, to)) {
            return candidate;
        }
    }
    return anchor;
}
