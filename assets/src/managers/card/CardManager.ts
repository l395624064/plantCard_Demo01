import { GameModel } from '../../GameModel';
import { CardData, GridPos, PlacementPreview, Rotation } from '../../GameTypes';

/**
 * 卡牌管理器：
 * 负责牌库、手牌、抽牌、出牌预检等数据层能力。
 * 现阶段对 GameModel 做轻量封装，后续可逐步迁移规则逻辑。
 */
export class CardManager {
    constructor(private readonly model: GameModel) {}

    public get deckCount(): number {
        return this.model.deck.length;
    }

    public get hand(): CardData[] {
        return this.model.hand;
    }

    public getCardAtHand(index: number): CardData | null {
        return this.model.getCardAtHand(index);
    }

    public canCardBePlaced(card: CardData): boolean {
        return this.model.canCardBePlaced(card);
    }

    public evaluatePlacement(card: CardData, anchor: GridPos, rotation: Rotation): PlacementPreview {
        return this.model.evaluatePlacement(card, anchor, rotation);
    }

    public placeFromHand(handIndex: number, anchor: GridPos, rotation: Rotation): PlacementPreview {
        return this.model.placeFromHand(handIndex, anchor, rotation);
    }
}
