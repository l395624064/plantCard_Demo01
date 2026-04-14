import { DICE_VALUES } from '../../GlobalConst';
import { CardData } from '../../card/CardTypes';
import { BoardCell, PlacementHit, PlacementCell, PlacementPreview } from '../../board/BoardTypes';
import { GameStatus, GridPos, Rotation } from '../../core/types/BaseGameTypes';
import { BOARD_COLS, BOARD_ROWS } from '../../GlobalConst';
import { getCardBounds, rotateCardCells } from '../../card/CardGeometry';
import { isBoardPlacementCard } from '../../card/CardRuleUtils';
import { fn_game_model_get_plant_id, fn_game_model_get_plant_variant } from '../../plant/model/PlantGameplayService';

interface interface_flow_model_place_from_hand_context {
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

export interface interface_flow_model_place_from_hand_result {
    preview: PlacementPreview;
    nextScore: number;
    nextRemainingRotten: number;
    message: string;
    shouldConsumeCard: boolean;
}

export interface interface_flow_model_status_result {
    status: GameStatus;
    message: string | null;
}

export class FlowModelUtils {
    public canCardBePlaced(
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
                    const preview = this.evaluatePlacement(board, card, { x, y }, rotation, remainingRotten);
                    if (preview.isValid) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public evaluatePlacement(
        board: BoardCell[][],
        card: CardData,
        anchor: GridPos,
        rotation: Rotation,
        remainingRotten: number,
    ): PlacementPreview {
        if (!isBoardPlacementCard(card)) {
            return this.createInvalidPreview('当前仅植物牌可放置到种植区', anchor, rotation);
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
                return this.createInvalidPreview('超出果园边界', anchor, rotation);
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

    public placeFromHand(
        context: interface_flow_model_place_from_hand_context,
    ): interface_flow_model_place_from_hand_result {
        const card = context.hand[context.handIndex];
        if (!card || context.status !== 'playing') {
            return {
                preview: this.createInvalidPreview('当前无法出牌', context.anchor, context.rotation),
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
            message: this.buildPlaceMessage(preview),
            shouldConsumeCard: true,
        };
    }

    public resolveStatus(
        score: number,
        targetScore: number,
        hand: CardData[],
        deckCount: number,
        hasPlayableCard: boolean,
    ): interface_flow_model_status_result {
        if (score >= targetScore) {
            return {
                status: 'win',
                message: `达成目标分数 ${targetScore}，挑战成功。`,
            };
        }
        if (hand.length === 0 && deckCount === 0) {
            return {
                status: 'win',
                message: `牌库已经打空，最终得分 ${score}。`,
            };
        }
        if (!hasPlayableCard) {
            return {
                status: 'lose',
                message: '当前手牌都无法合法放置，本局结束。',
            };
        }
        return {
            status: 'playing',
            message: null,
        };
    }

    private createInvalidPreview(
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

    private buildPlaceMessage(preview: PlacementPreview): string {
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
}
