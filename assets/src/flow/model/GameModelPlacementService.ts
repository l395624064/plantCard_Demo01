import {
    BOARD_COLS,
    BOARD_ROWS,
    DICE_VALUES,
} from '../../GlobalConst';
import { getCardBounds, rotateCardCells } from '../../card/CardGeometry';
import { isBoardPlacementCard } from '../../card/CardRuleUtils';
import { CardData } from '../../card/CardTypes';
import { BoardCell, PlacementCell, PlacementHit, PlacementPreview } from '../../board/BoardTypes';
import { GridPos, Rotation } from '../../core/types/BaseGameTypes';
import { fn_game_model_get_plant_id, fn_game_model_get_plant_variant } from '../../plant/model/PlantGameplayService';

export function fn_game_model_can_card_be_placed(
    board: BoardCell[][],
    card: CardData,
    remainingRotten: number,
): boolean {
    if (!isBoardPlacementCard(card)) {
        return false;
    }
    for (let rotation = 0 as Rotation; rotation < 4; rotation = (rotation + 1) as Rotation) {
        const rotated = rotateCardCells(card.cells, rotation);
        const bounds = getCardBounds(rotated);
        for (let y = 0; y <= BOARD_ROWS - bounds.height; y++) {
            for (let x = 0; x <= BOARD_COLS - bounds.width; x++) {
                const preview = fn_game_model_evaluate_placement(board, card, { x, y }, rotation, remainingRotten);
                if (preview.isValid) {
                    return true;
                }
            }
        }
    }

    return false;
}

export function fn_game_model_evaluate_placement(
    board: BoardCell[][],
    card: CardData,
    anchor: GridPos,
    rotation: Rotation,
    remainingRotten: number,
): PlacementPreview {
    if (!isBoardPlacementCard(card)) {
        return {
            isValid: false,
            reason: '当前仅植物牌可放置到种植区',
            anchor,
            rotation,
            occupiedOverlapCount: 0,
            scoreGain: 0,
            requiredRotten: 0,
            sameColorHits: [],
            diffColorHits: [],
            cells: [],
        };
    }
    const rotatedCells = rotateCardCells(card.cells, rotation);
    const sameColorHits: PlacementHit[] = [];
    const diffColorHits: PlacementHit[] = [];
    const placementCells: PlacementCell[] = [];
    let occupiedOverlapCount = 0;
    let scoreGain = 0;
    let reason = '';

    for (const cell of rotatedCells) {
        const x = anchor.x + cell.x;
        const y = anchor.y + cell.y;

        if (x < 0 || y < 0 || x >= BOARD_COLS || y >= BOARD_ROWS) {
            return {
                isValid: false,
                reason: '超出果园边界',
                anchor,
                rotation,
                occupiedOverlapCount: 0,
                scoreGain: 0,
                requiredRotten: 0,
                sameColorHits: [],
                diffColorHits: [],
                cells: [],
            };
        }

        const boardCell = board[y][x];
        const cellPlantId = cell.plantId ?? fn_game_model_get_plant_id(card.id, cell.x, cell.y, cell.color, cell.plantVariant ?? null);
        const overlapsSame = !boardCell.rotten
            && !!boardCell.baseColor
            && boardCell.plantId !== null
            && boardCell.plantId === cellPlantId;
        const overlapsDiff = !boardCell.rotten
            && !!boardCell.baseColor
            && boardCell.plantId !== null
            && boardCell.plantId !== cellPlantId;
        const blocked = boardCell.rotten;

        placementCells.push({
            x,
            y,
            color: cell.color,
            blocked,
            overlapsSame,
            overlapsDiff,
            plantVariant: cell.plantVariant ?? fn_game_model_get_plant_variant(card.id, cell.x, cell.y, cell.color),
            plantId: cellPlantId,
        });

        if (blocked) {
            reason = '不能覆盖烂水果位置';
        }

        if (overlapsSame) {
            occupiedOverlapCount++;
            sameColorHits.push({ x, y, color: cell.color });
            const nextDiceIndex = Math.min(boardCell.diceIndex + 1, DICE_VALUES.length - 1);
            scoreGain += DICE_VALUES[nextDiceIndex];
        } else if (overlapsDiff) {
            occupiedOverlapCount++;
            diffColorHits.push({ x, y, color: cell.color });
        }
    }

    if (reason) {
        return {
            isValid: false,
            reason,
            anchor,
            rotation,
            occupiedOverlapCount,
            scoreGain: 0,
            requiredRotten: 0,
            sameColorHits,
            diffColorHits,
            cells: placementCells,
        };
    }

    if (diffColorHits.length > remainingRotten) {
        reason = '烂水果次数不足';
    }

    return {
        isValid: reason.length === 0,
        reason: reason || `可放置，预计得分 +${scoreGain}`,
        anchor,
        rotation,
        occupiedOverlapCount,
        scoreGain,
        requiredRotten: diffColorHits.length,
        sameColorHits,
        diffColorHits,
        cells: placementCells,
    };
}
