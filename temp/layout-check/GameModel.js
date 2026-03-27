"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModel = void 0;
const GameTypes_1 = require("./GameTypes");
function createEmptyBoard() {
    return Array.from({ length: GameTypes_1.BOARD_ROWS }, () => Array.from({ length: GameTypes_1.BOARD_COLS }, () => ({
        baseColor: null,
        diceIndex: -1,
        rotten: false,
    })));
}
function createCard(id, label, colors) {
    const cells = [];
    for (let y = 0; y < colors.length; y++) {
        for (let x = 0; x < colors[y].length; x++) {
            cells.push({
                x,
                y,
                color: colors[y][x],
            });
        }
    }
    return {
        id: `card-${id}`,
        label,
        cells,
    };
}
function shuffle(list) {
    const next = list.slice();
    for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = next[i];
        next[i] = next[j];
        next[j] = tmp;
    }
    return next;
}
class GameModel {
    constructor() {
        this.board = [];
        this.hand = [];
        this.deck = [];
        this.score = 0;
        this.targetScore = GameTypes_1.TARGET_SCORE;
        this.remainingRotten = GameTypes_1.MAX_ROTTEN;
        this.status = 'playing';
        this.message = '';
        this.cardLibrary = [
            createCard(1, '晨露', [['red', 'yellow'], ['purple', 'red']]),
            createCard(2, '暖阳', [['yellow', 'red'], ['yellow', 'purple']]),
            createCard(3, '莓影', [['purple', 'red'], ['yellow', 'purple']]),
            createCard(4, '果径', [['red', 'purple'], ['yellow', 'yellow']]),
            createCard(5, '花圃', [['yellow', 'purple'], ['red', 'red']]),
            createCard(6, '藤蔓', [['purple', 'yellow'], ['red', 'purple']]),
            createCard(7, '果丘', [['red', 'yellow'], ['red', 'purple']]),
            createCard(8, '林隙', [['yellow', 'purple'], ['yellow', 'red']]),
            createCard(9, '晚风', [['purple', 'yellow'], ['purple', 'red']]),
            createCard(10, '溪畔', [['red', 'purple'], ['red', 'yellow']]),
            createCard(11, '蜜香', [['yellow', 'red'], ['purple', 'yellow']]),
            createCard(12, '月影', [['purple', 'red'], ['red', 'yellow']]),
        ];
        this.startCard = createCard(0, '起始', [['red', 'yellow'], ['purple', 'red']]);
        this.startNewGame();
    }
    startNewGame() {
        this.board = createEmptyBoard();
        this.hand = [];
        this.deck = shuffle(this.cardLibrary);
        this.score = 0;
        this.targetScore = GameTypes_1.TARGET_SCORE;
        this.remainingRotten = GameTypes_1.MAX_ROTTEN;
        this.status = 'playing';
        this.message = '选择一张手牌，然后在果园中寻找一个可重叠的位置。';
        const startAnchor = {
            x: Math.floor(GameTypes_1.BOARD_COLS / 2) - 1,
            y: Math.floor(GameTypes_1.BOARD_ROWS / 2) - 1,
        };
        this.placeInitialCard(this.startCard, startAnchor);
        this.refillHand();
        this.updateStatus();
    }
    getCardAtHand(index) {
        var _a;
        return (_a = this.hand[index]) !== null && _a !== void 0 ? _a : null;
    }
    canCardBePlaced(card) {
        for (let rotation = 0; rotation < 4; rotation = (rotation + 1)) {
            for (let y = 0; y <= GameTypes_1.BOARD_ROWS - GameTypes_1.CARD_SIZE; y++) {
                for (let x = 0; x <= GameTypes_1.BOARD_COLS - GameTypes_1.CARD_SIZE; x++) {
                    const preview = this.evaluatePlacement(card, { x, y }, rotation);
                    if (preview.isValid) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    evaluatePlacement(card, anchor, rotation) {
        const rotatedCells = (0, GameTypes_1.rotateCardCells)(card.cells, rotation);
        const sameColorHits = [];
        const diffColorHits = [];
        const placementCells = [];
        let occupiedOverlapCount = 0;
        let scoreGain = 0;
        let reason = '';
        for (const cell of rotatedCells) {
            const x = anchor.x + cell.x;
            const y = anchor.y + cell.y;
            if (x < 0 || y < 0 || x >= GameTypes_1.BOARD_COLS || y >= GameTypes_1.BOARD_ROWS) {
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
            const overlapsSame = !boardCell.rotten && boardCell.baseColor === cell.color;
            const overlapsDiff = !boardCell.rotten && !!boardCell.baseColor && boardCell.baseColor !== cell.color;
            const blocked = boardCell.rotten;
            placementCells.push({
                x,
                y,
                color: cell.color,
                blocked,
                overlapsSame,
                overlapsDiff,
            });
            if (blocked) {
                reason = '不能覆盖烂水果位置';
            }
            if (overlapsSame) {
                occupiedOverlapCount++;
                sameColorHits.push({ x, y, color: cell.color });
                const nextDiceIndex = Math.min(boardCell.diceIndex + 1, GameTypes_1.DICE_VALUES.length - 1);
                scoreGain += GameTypes_1.DICE_VALUES[nextDiceIndex];
            }
            else if (overlapsDiff) {
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
        if (occupiedOverlapCount === 0) {
            reason = '至少要和已有果树重叠 1 格';
        }
        else if (diffColorHits.length > this.remainingRotten) {
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
    placeFromHand(handIndex, anchor, rotation) {
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
                boardCell.diceIndex = Math.min(boardCell.diceIndex + 1, GameTypes_1.DICE_VALUES.length - 1);
            }
            else if (cell.overlapsDiff) {
                boardCell.baseColor = null;
                boardCell.diceIndex = -1;
                boardCell.rotten = true;
                this.remainingRotten -= 1;
            }
            else {
                boardCell.baseColor = cell.color;
                boardCell.diceIndex = -1;
                boardCell.rotten = false;
            }
        }
        this.score += preview.scoreGain;
        this.hand.splice(handIndex, 1);
        this.refillHand();
        const sameCount = preview.sameColorHits.length;
        const diffCount = preview.diffColorHits.length;
        const parts = [];
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
    placeInitialCard(card, anchor) {
        const rotatedCells = (0, GameTypes_1.rotateCardCells)(card.cells, 0);
        for (const cell of rotatedCells) {
            const x = anchor.x + cell.x;
            const y = anchor.y + cell.y;
            this.board[y][x].baseColor = cell.color;
        }
    }
    refillHand() {
        while (this.hand.length < GameTypes_1.HAND_SIZE && this.deck.length > 0) {
            const next = this.deck.shift();
            if (next) {
                this.hand.push(next);
            }
        }
    }
    updateStatus() {
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
exports.GameModel = GameModel;
