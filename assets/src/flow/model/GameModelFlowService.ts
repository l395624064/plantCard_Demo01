import { DICE_VALUES } from '../../GlobalConst';
import { CardData } from '../../card/CardTypes';
import { BoardCell, PlacementPreview } from '../../board/BoardTypes';
import { GameStatus, GridPos, Rotation } from '../../core/types/BaseGameTypes';

interface interface_game_model_place_from_hand_context {
    status: GameStatus;
    hand: CardData[];
    handIndex: number;
    anchor: GridPos;
    rotation: Rotation;
    board: BoardCell[][];
    score: number;
    remainingRotten: number;
    evaluatePlacement: (card: CardData, anchor: GridPos, rotation: Rotation) => PlacementPreview;
}

export interface interface_game_model_place_from_hand_result {
    preview: PlacementPreview;
    nextScore: number;
    nextRemainingRotten: number;
    message: string;
    shouldConsumeCard: boolean;
}

function fn_game_model_create_invalid_preview(
    reason: string,
    anchor: GridPos,
    rotation: Rotation,
): PlacementPreview {
    return {
        isValid: false,
        reason,
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

function fn_game_model_build_place_message(preview: PlacementPreview): string {
    const sameCount = preview.sameColorHits.length;
    const diffCount = preview.diffColorHits.length;
    const parts: string[] = [];
    if (sameCount > 0) {
        parts.push(`同色重叠 ${sameCount} 处，得分 +${preview.scoreGain}`);
    }
    if (diffCount > 0) {
        parts.push(`异色重叠 ${diffCount} 处，生成烂水果`);
    }
    if (parts.length === 0) {
        parts.push('成功放置了一张卡牌');
    }
    return parts.join('；');
}

export function fn_game_model_place_from_hand(
    context: interface_game_model_place_from_hand_context,
): interface_game_model_place_from_hand_result {
    const card = context.hand[context.handIndex];
    if (!card || context.status !== 'playing') {
        return {
            preview: fn_game_model_create_invalid_preview('当前无法出牌', context.anchor, context.rotation),
            nextScore: context.score,
            nextRemainingRotten: context.remainingRotten,
            message: '当前无法出牌',
            shouldConsumeCard: false,
        };
    }

    const preview = context.evaluatePlacement(card, context.anchor, context.rotation);
    if (!preview.isValid) {
        return {
            preview,
            nextScore: context.score,
            nextRemainingRotten: context.remainingRotten,
            message: preview.reason,
            shouldConsumeCard: false,
        };
    }

    let nextRemainingRotten = context.remainingRotten;
    for (const cell of preview.cells) {
        const boardCell = context.board[cell.y][cell.x];
        if (cell.overlapsSame) {
            boardCell.baseColor = cell.color;
            boardCell.diceIndex = Math.min(boardCell.diceIndex + 1, DICE_VALUES.length - 1);
            boardCell.plantVariant = boardCell.plantVariant ?? cell.plantVariant;
            boardCell.plantId = boardCell.plantId ?? cell.plantId;
            boardCell.fertilizerBlockedTurns = 0;
        } else if (cell.overlapsDiff) {
            boardCell.baseColor = null;
            boardCell.diceIndex = -1;
            boardCell.rotten = true;
            boardCell.plantVariant = null;
            boardCell.plantId = null;
            boardCell.fertilizerBlockedTurns = 1;
            nextRemainingRotten -= 1;
        } else {
            boardCell.baseColor = cell.color;
            boardCell.diceIndex = -1;
            boardCell.rotten = false;
            boardCell.plantVariant = cell.plantVariant;
            boardCell.plantId = cell.plantId;
            boardCell.fertilizerBlockedTurns = 0;
        }
    }

    return {
        preview,
        nextScore: context.score + preview.scoreGain,
        nextRemainingRotten,
        message: fn_game_model_build_place_message(preview),
        shouldConsumeCard: true,
    };
}
