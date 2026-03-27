"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRUIT_COLORS = exports.DICE_VALUES = exports.TARGET_SCORE = exports.MAX_ROTTEN = exports.HAND_SIZE = exports.CARD_SIZE = exports.BOARD_ROWS = exports.BOARD_COLS = void 0;
exports.cloneGridPos = cloneGridPos;
exports.rotateCell = rotateCell;
exports.rotateCardCells = rotateCardCells;
exports.BOARD_COLS = 10;
exports.BOARD_ROWS = 10;
exports.CARD_SIZE = 2;
exports.HAND_SIZE = 3;
exports.MAX_ROTTEN = 2;
exports.TARGET_SCORE = 18;
exports.DICE_VALUES = [1, 3, 6, 10];
exports.FRUIT_COLORS = ['red', 'yellow', 'purple'];
function cloneGridPos(pos) {
    if (!pos) {
        return null;
    }
    return { x: pos.x, y: pos.y };
}
function rotateCell(cell, rotation) {
    let x = cell.x;
    let y = cell.y;
    for (let i = 0; i < rotation; i++) {
        const nextX = exports.CARD_SIZE - 1 - y;
        const nextY = x;
        x = nextX;
        y = nextY;
    }
    return { x, y, color: cell.color };
}
function rotateCardCells(cells, rotation) {
    return cells.map((cell) => rotateCell(cell, rotation));
}
