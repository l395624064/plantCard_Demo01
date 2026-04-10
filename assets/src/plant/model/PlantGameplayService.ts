import { rotateCardCells } from '../../card/CardGeometry';
import { CardData } from '../../card/CardTypes';
import { BoardCell } from '../../board/BoardTypes';
import { FruitColor, GridPos } from '../../core/types/BaseGameTypes';

function fn_game_model_hash_string(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
        hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

export function fn_game_model_get_plant_variant(cardId: string, cellX: number, cellY: number, color: FruitColor): number {
    const seed = `${cardId}:${cellX},${cellY}:${color}`;
    return fn_game_model_hash_string(seed) % 11;
}

export function fn_game_model_get_plant_id(
    cardId: string,
    cellX: number,
    cellY: number,
    color: FruitColor,
    plantVariant?: number | null,
): string {
    const variant = plantVariant ?? fn_game_model_get_plant_variant(cardId, cellX, cellY, color);
    return `plant-${variant + 1}`;
}

export function fn_game_model_assign_plant_variants(cardId: string, cells: CardData['cells']): CardData['cells'] {
    return cells.map((cell) => ({
        x: cell.x,
        y: cell.y,
        color: cell.color,
        plantVariant: cell.plantVariant ?? fn_game_model_get_plant_variant(cardId, cell.x, cell.y, cell.color),
        plantId: cell.plantId ?? fn_game_model_get_plant_id(cardId, cell.x, cell.y, cell.color, cell.plantVariant ?? null),
    }));
}

export function fn_game_model_place_initial_card(
    board: BoardCell[][],
    card: CardData,
    anchor: GridPos,
): void {
    const rotatedCells = rotateCardCells(card.cells, 0);
    for (const cell of rotatedCells) {
        const x = anchor.x + cell.x;
        const y = anchor.y + cell.y;
        board[y][x].baseColor = cell.color;
        board[y][x].plantVariant = cell.plantVariant ?? fn_game_model_get_plant_variant(card.id, cell.x, cell.y, cell.color);
        board[y][x].plantId = cell.plantId ?? fn_game_model_get_plant_id(card.id, cell.x, cell.y, cell.color, cell.plantVariant ?? null);
    }
}
