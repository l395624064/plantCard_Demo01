import {
    BOARD_COLS,
    BOARD_ROWS,
    HAND_SIZE,
    MAX_ROTTEN,
    TARGET_SCORE,
} from './GlobalConst';
import { CardData } from './card/CardTypes';
import { BoardCell, PlacementPreview } from './board/BoardTypes';
import { GameStatus, GridPos, ParcelType, Rotation } from './core/types/BaseGameTypes';
import {
    fn_game_model_create_card,
    fn_game_model_create_empty_board,
    fn_game_model_create_random_shape_card,
    fn_game_model_shuffle,
    GAME_MODEL_DEFAULT_PARCEL_WEIGHTS,
    GAME_MODEL_PARCEL_SPRITE_PATHS,
} from './flow/model/GameModelFactory';
import {
    fn_game_model_assign_plant_variants,
    fn_game_model_place_initial_card,
} from './plant/model/PlantGameplayService';
import {
    fn_game_model_assign_parcel_at,
    fn_game_model_fill_board_parcels,
    fn_game_model_reroll_board_parcels,
} from './parcel/model/ParcelGameplayService';
import {
    fn_game_model_can_card_be_placed,
    fn_game_model_evaluate_placement,
} from './flow/model/GameModelPlacementService';
import { fn_game_model_place_from_hand } from './flow/model/GameModelFlowService';
import { fn_game_model_resolve_status } from './flow/model/GameModelStatusService';

export class GameModel {
    public board: BoardCell[][] = [];
    public hand: CardData[] = [];
    public deck: CardData[] = [];
    public score = 0;
    public targetScore = TARGET_SCORE;
    public remainingRotten = MAX_ROTTEN;
    public status: GameStatus = 'playing';
    public message = '';
    public readonly infiniteDeck = true;

    private readonly cardLibrary: CardData[];
    private readonly startCard: CardData;
    private nextCardInstanceId = 1;
    private parcelTypeWeights: Record<ParcelType, number> = { ...GAME_MODEL_DEFAULT_PARCEL_WEIGHTS };

    constructor() {
        const labels = ['晨露', '暖阳', '莓影', '果径', '花圃', '藤蔓', '果丘', '林隙', '晚风', '溪畔', '蜜香', '月影'];
        this.cardLibrary = labels.map((label, index) => fn_game_model_create_random_shape_card(index + 1, label));

        this.startCard = fn_game_model_create_card(0, '起始', [['red', 'yellow'], ['purple', 'red']]);
        this.startNewGame();
    }

    public startNewGame(): void {
        this.board = fn_game_model_create_empty_board();
        fn_game_model_fill_board_parcels(
            this.board,
            'grassland',
            this.parcelTypeWeights,
            GAME_MODEL_PARCEL_SPRITE_PATHS,
        );
        this.hand = [];
        this.nextCardInstanceId = 1;
        this.deck = fn_game_model_shuffle(this.cardLibrary).map((card) => this.cloneCardInstance(card));
        this.score = 0;
        this.targetScore = TARGET_SCORE;
        this.remainingRotten = MAX_ROTTEN;
        this.status = 'playing';
        this.message = '选择一张手牌，然后在果园中寻找一个可重叠的位置。';

        const startAnchor = {
            x: Math.floor(BOARD_COLS / 2) - 1,
            y: Math.floor(BOARD_ROWS / 2) - 1,
        };
        this.placeInitialCard(this.startCard, startAnchor);
        this.refillHand();
        this.updateStatus();
    }

    public setParcelTypeWeights(weights: Partial<Record<ParcelType, number>>, reroll = true): void {
        this.parcelTypeWeights = {
            ...this.parcelTypeWeights,
            ...weights,
        };
        if (reroll) {
            fn_game_model_reroll_board_parcels(
                this.board,
                this.parcelTypeWeights,
                GAME_MODEL_PARCEL_SPRITE_PATHS,
            );
        }
    }

    public setParcelTypeAt(x: number, y: number, type: ParcelType): void {
        if (x < 0 || y < 0 || x >= BOARD_COLS || y >= BOARD_ROWS) {
            return;
        }
        fn_game_model_assign_parcel_at(
            this.board,
            x,
            y,
            this.parcelTypeWeights,
            GAME_MODEL_PARCEL_SPRITE_PATHS,
            type,
        );
    }

    public getCardAtHand(index: number): CardData | null {
        return this.hand[index] ?? null;
    }

    public canCardBePlaced(card: CardData): boolean {
        return fn_game_model_can_card_be_placed(
            this.board,
            card,
            this.remainingRotten,
        );
    }

    public evaluatePlacement(card: CardData, anchor: GridPos, rotation: Rotation): PlacementPreview {
        return fn_game_model_evaluate_placement(
            this.board,
            card,
            anchor,
            rotation,
            this.remainingRotten,
        );
    }

    public placeFromHand(handIndex: number, anchor: GridPos, rotation: Rotation): PlacementPreview {
        const result = fn_game_model_place_from_hand({
            status: this.status,
            hand: this.hand,
            handIndex,
            anchor,
            rotation,
            board: this.board,
            score: this.score,
            remainingRotten: this.remainingRotten,
            evaluatePlacement: (card, placementAnchor, placementRotation) =>
                this.evaluatePlacement(card, placementAnchor, placementRotation),
        });
        this.score = result.nextScore;
        this.remainingRotten = result.nextRemainingRotten;
        this.message = result.message;
        if (result.shouldConsumeCard) {
            this.hand.splice(handIndex, 1);
            this.refillHand();
        }
        this.updateStatus();
        return result.preview;
    }

    public getDeckCount(): number {
        return this.infiniteDeck ? -1 : this.deck.length;
    }

    public drawOneCardToHand(): CardData | null {
        const next = this.drawNextCard();
        if (!next) {
            this.message = '牌库已空，无法继续抽牌。';
            return null;
        }

        this.hand.push(next);
        this.message = `GM 抽取了 1 张卡牌：${next.label}`;
        this.updateStatus();
        return next;
    }

    public gmAddScore(amount: number): void {
        if (amount <= 0) {
            return;
        }
        this.score += amount;
        this.message = `GM 增加了 ${amount} 点分数。`;
        this.updateStatus();
    }

    public gmAddRottenCharge(amount: number): void {
        if (amount <= 0) {
            return;
        }
        this.remainingRotten += amount;
        this.message = `GM 增加了 ${amount} 次烂水果额度。`;
        this.updateStatus();
    }

    private placeInitialCard(card: CardData, anchor: GridPos): void {
        fn_game_model_place_initial_card(this.board, card, anchor);
    }

    private refillHand(): void {
        while (this.hand.length < HAND_SIZE) {
            const next = this.drawNextCard();
            if (!next) {
                break;
            }
            this.hand.push(next);
        }
    }

    private drawNextCard(): CardData | null {
        if (this.deck.length > 0) {
            return this.deck.shift() ?? null;
        }
        if (!this.infiniteDeck || this.cardLibrary.length === 0) {
            return null;
        }
        const template = this.cardLibrary[Math.floor(Math.random() * this.cardLibrary.length)];
        return this.cloneCardInstance(template);
    }

    private cloneCardInstance(card: CardData): CardData {
        const instanceId = this.nextCardInstanceId++;
        return {
            id: `${card.id}-inst-${instanceId}`,
            label: card.label,
            mainType: card.mainType,
            playMode: card.playMode,
            summary: card.summary,
            profile: card.profile,
            cardKind: card.cardKind,
            cells: fn_game_model_assign_plant_variants(`${card.id}-inst-${instanceId}`, card.cells),
        };
    }

    private updateStatus(): void {
        const result = fn_game_model_resolve_status(
            this.score,
            this.targetScore,
            this.hand,
            this.deck.length,
            this.hand.some((card) => this.canCardBePlaced(card)),
        );
        this.status = result.status;
        if (result.message) {
            this.message = result.message;
        }
    }
}
