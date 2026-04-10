import { BOARD_COLS, BOARD_ROWS } from '../../GlobalConst';
import { BoardCell } from '../../board/BoardTypes';
import { ParcelType } from '../../core/types/BaseGameTypes';

export function fn_game_model_pick_weighted_parcel_type(
    weights: Record<ParcelType, number>,
): ParcelType {
    const entries: [ParcelType, number][] = [
        ['Crackedland', weights.Crackedland],
        ['desert', weights.desert],
        ['grassland', weights.grassland],
        ['mossland', weights.mossland],
        ['snowfield', weights.snowfield],
        ['wasteland', weights.wasteland],
        ['mudland', weights.mudland],
    ];
    const totalWeight = entries.reduce((sum, [, weight]) => sum + Math.max(0, weight), 0);
    if (totalWeight <= 0) {
        return 'grassland';
    }
    let roll = Math.random() * totalWeight;
    for (const [type, weight] of entries) {
        const safeWeight = Math.max(0, weight);
        if (roll < safeWeight) {
            return type;
        }
        roll -= safeWeight;
    }
    return 'grassland';
}

export function fn_game_model_pick_parcel_sprite_path(
    spritePaths: Record<ParcelType, string[]>,
    type: ParcelType,
): string {
    const pool = spritePaths[type];
    if (!pool || pool.length === 0) {
        return spritePaths.grassland[0];
    }
    return pool[Math.floor(Math.random() * pool.length)];
}

export function fn_game_model_assign_parcel_at(
    board: BoardCell[][],
    x: number,
    y: number,
    weights: Record<ParcelType, number>,
    spritePaths: Record<ParcelType, string[]>,
    type?: ParcelType,
): void {
    const nextType = type ?? fn_game_model_pick_weighted_parcel_type(weights);
    const boardCell = board[y][x];
    boardCell.parcelType = nextType;
    boardCell.parcelSpritePath = fn_game_model_pick_parcel_sprite_path(spritePaths, nextType);
}

export function fn_game_model_reroll_board_parcels(
    board: BoardCell[][],
    weights: Record<ParcelType, number>,
    spritePaths: Record<ParcelType, string[]>,
): void {
    for (let y = 0; y < BOARD_ROWS; y++) {
        for (let x = 0; x < BOARD_COLS; x++) {
            fn_game_model_assign_parcel_at(board, x, y, weights, spritePaths);
        }
    }
}

export function fn_game_model_fill_board_parcels(
    board: BoardCell[][],
    type: ParcelType,
    weights: Record<ParcelType, number>,
    spritePaths: Record<ParcelType, string[]>,
): void {
    for (let y = 0; y < BOARD_ROWS; y++) {
        for (let x = 0; x < BOARD_COLS; x++) {
            fn_game_model_assign_parcel_at(board, x, y, weights, spritePaths, type);
        }
    }
}
