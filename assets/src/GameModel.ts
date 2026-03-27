import {
    BOARD_COLS,
    BOARD_ROWS,
    CARD_TEMPLATE_COLS,
    CARD_TEMPLATE_ROWS,
    DICE_VALUES,
    FruitColor,
    GameStatus,
    GridPos,
    HAND_SIZE,
    MAX_ROTTEN,
    PlacementCell,
    PlacementHit,
    PlacementPreview,
    Rotation,
    TARGET_SCORE,
    BoardCell,
    CardData,
    getCardBounds,
    normalizeCardCells,
    rotateCardCells,
} from './GameTypes';

function createEmptyBoard(): BoardCell[][] {
    return Array.from({ length: BOARD_ROWS }, () =>
        Array.from({ length: BOARD_COLS }, () => ({
            baseColor: null,
            diceIndex: -1,
            rotten: false,
            plantVariant: null,
        })),
    );
}

function createCard(id: number, label: string, colors: FruitColor[][]): CardData {
    const cells = [];
    for (let y = 0; y < colors.length; y++) {
        for (let x = 0; x < colors[y].length; x++) {
            cells.push({
                x,
                y,
                color: colors[y][x],
                plantVariant: null,
            });
        }
    }

    return {
        id: `card-${id}`,
        label,
        cells,
        cardKind: 'placement',
    };
}

function randomColor(): FruitColor {
    const pool: FruitColor[] = ['red', 'yellow', 'purple'];
    return pool[Math.floor(Math.random() * pool.length)];
}

function createRandomShapeCard(id: number, label: string): CardData {
    const targetCount = 1 + Math.floor(Math.random() * 4);
    const used = new Set<string>();
    const cells = [];
    let cx = Math.floor(Math.random() * CARD_TEMPLATE_COLS);
    let cy = Math.floor(Math.random() * CARD_TEMPLATE_ROWS);

    while (cells.length < targetCount) {
        const key = `${cx},${cy}`;
        if (!used.has(key)) {
            used.add(key);
            cells.push({
                x: cx,
                y: cy,
                color: randomColor(),
                plantVariant: null,
            });
        }
        const candidates = [
            { x: cx + 1, y: cy },
            { x: cx - 1, y: cy },
            { x: cx, y: cy + 1 },
            { x: cx, y: cy - 1 },
        ].filter((p) => p.x >= 0 && p.x < CARD_TEMPLATE_COLS && p.y >= 0 && p.y < CARD_TEMPLATE_ROWS);
        if (candidates.length === 0) {
            break;
        }
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        cx = pick.x;
        cy = pick.y;
    }

    return {
        id: `card-${id}`,
        label,
        cells: normalizeCardCells(cells),
        cardKind: 'placement',
    };
}

function shuffle<T>(list: T[]): T[] {
    const next = list.slice();

    for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = next[i];
        next[i] = next[j];
        next[j] = tmp;
    }

    return next;
}

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

    private hashString(value: string): number {
        let hash = 0;
        for (let i = 0; i < value.length; i++) {
            hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
        }
        return Math.abs(hash);
    }

    private getPlantVariant(cardId: string, cellX: number, cellY: number, color: FruitColor): number {
        const seed = `${cardId}:${cellX},${cellY}:${color}`;
        return this.hashString(seed) % 11;
    }

    private assignPlantVariants(cardId: string, cells: CardData['cells']): CardData['cells'] {
        return cells.map((cell) => ({
            x: cell.x,
            y: cell.y,
            color: cell.color,
            plantVariant: cell.plantVariant ?? this.getPlantVariant(cardId, cell.x, cell.y, cell.color),
        }));
    }

    constructor() {
        const labels = ['晨露', '暖阳', '莓影', '果径', '花圃', '藤蔓', '果丘', '林隙', '晚风', '溪畔', '蜜香', '月影'];
        this.cardLibrary = labels.map((label, index) => createRandomShapeCard(index + 1, label));

        this.startCard = createCard(0, '起始', [['red', 'yellow'], ['purple', 'red']]);
        this.startNewGame();
    }

    public startNewGame(): void {
        this.board = createEmptyBoard();
        this.hand = [];
        this.nextCardInstanceId = 1;
        this.deck = shuffle(this.cardLibrary).map((card) => this.cloneCardInstance(card));
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

    public getCardAtHand(index: number): CardData | null {
        return this.hand[index] ?? null;
    }

    public canCardBePlaced(card: CardData): boolean {
        for (let rotation = 0 as Rotation; rotation < 4; rotation = (rotation + 1) as Rotation) {
            const rotated = rotateCardCells(card.cells, rotation);
            const bounds = getCardBounds(rotated);
            for (let y = 0; y <= BOARD_ROWS - bounds.height; y++) {
                for (let x = 0; x <= BOARD_COLS - bounds.width; x++) {
                    const preview = this.evaluatePlacement(card, { x, y }, rotation);
                    if (preview.isValid) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    public evaluatePlacement(card: CardData, anchor: GridPos, rotation: Rotation): PlacementPreview {
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

            const boardCell = this.board[y][x];
            const overlapsSame = !boardCell.rotten
                && !!boardCell.baseColor
                && boardCell.plantVariant !== null
                && boardCell.plantVariant === (cell.plantVariant ?? null);
            const overlapsDiff = !boardCell.rotten
                && !!boardCell.baseColor
                && boardCell.plantVariant !== null
                && boardCell.plantVariant !== (cell.plantVariant ?? null);
            const blocked = boardCell.rotten;

            placementCells.push({
                x,
                y,
                color: cell.color,
                blocked,
                overlapsSame,
                overlapsDiff,
                plantVariant: cell.plantVariant ?? this.getPlantVariant(card.id, cell.x, cell.y, cell.color),
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

        if (diffColorHits.length > this.remainingRotten) {
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

    public placeFromHand(handIndex: number, anchor: GridPos, rotation: Rotation): PlacementPreview {
        const card = this.hand[handIndex];
        if (!card || this.status !== 'playing') {
            return {
                isValid: false,
                reason: '当前无法出牌',
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

        const preview = this.evaluatePlacement(card, anchor, rotation);
        if (!preview.isValid) {
            this.message = preview.reason;
            return preview;
        }

        for (const cell of preview.cells) {
            const boardCell = this.board[cell.y][cell.x];

            if (cell.overlapsSame) {
                boardCell.baseColor = cell.color;
                boardCell.diceIndex = Math.min(boardCell.diceIndex + 1, DICE_VALUES.length - 1);
                boardCell.plantVariant = boardCell.plantVariant ?? cell.plantVariant;
            } else if (cell.overlapsDiff) {
                boardCell.baseColor = null;
                boardCell.diceIndex = -1;
                boardCell.rotten = true;
                boardCell.plantVariant = null;
                this.remainingRotten -= 1;
            } else {
                boardCell.baseColor = cell.color;
                boardCell.diceIndex = -1;
                boardCell.rotten = false;
                boardCell.plantVariant = cell.plantVariant;
            }
        }

        this.score += preview.scoreGain;
        this.hand.splice(handIndex, 1);
        this.refillHand();

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
        this.message = parts.join('；');

        this.updateStatus();
        return preview;
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
        const rotatedCells = rotateCardCells(card.cells, 0);
        for (const cell of rotatedCells) {
            const x = anchor.x + cell.x;
            const y = anchor.y + cell.y;
            this.board[y][x].baseColor = cell.color;
            this.board[y][x].plantVariant = cell.plantVariant ?? this.getPlantVariant(card.id, cell.x, cell.y, cell.color);
        }
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
            cardKind: card.cardKind,
            cells: this.assignPlantVariants(`${card.id}-inst-${instanceId}`, card.cells),
        };
    }

    private updateStatus(): void {
        if (this.score >= this.targetScore) {
            this.status = 'win';
            this.message = `达成目标分数 ${this.targetScore}，挑战成功。`;
            return;
        }

        if (this.hand.length === 0 && this.deck.length === 0) {
            this.status = 'win';
            this.message = `牌库已经打空，最终得分 ${this.score}。`;
            return;
        }

        const hasPlayableCard = this.hand.some((card) => this.canCardBePlaced(card));
        if (!hasPlayableCard) {
            this.status = 'lose';
            this.message = '当前手牌都无法合法放置，本局结束。';
            return;
        }

        this.status = 'playing';
    }
}
