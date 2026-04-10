import { CardData, CardMainType } from './CardTypes';

export function getCardMainTypeLabel(mainType: CardMainType): string {
    switch (mainType) {
        case 'plant':
            return '植物牌';
        case 'vegetation':
            return '植被牌';
        case 'technology':
            return '科技牌';
        case 'farming':
            return '农术牌';
        default:
            return '卡牌';
    }
}

export function isBoardPlacementCard(card: CardData | null | undefined): boolean {
    return !!card && card.mainType === 'plant' && card.playMode === 'board_placement';
}
