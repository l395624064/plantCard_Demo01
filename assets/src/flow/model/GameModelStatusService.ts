import { CardData } from '../../card/CardTypes';
import { GameStatus } from '../../core/types/BaseGameTypes';

export interface interface_game_model_status_result {
    status: GameStatus;
    message: string | null;
}

export function fn_game_model_resolve_status(
    score: number,
    targetScore: number,
    hand: CardData[],
    deckCount: number,
    hasPlayableCard: boolean,
): interface_game_model_status_result {
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
