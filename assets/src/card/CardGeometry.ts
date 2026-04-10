import { Rotation } from '../core/types/BaseGameTypes';
import { CardBounds, CardCell } from './types/CardCellTypes';

export function getCardBounds(cells: CardCell[]): CardBounds {
    if (cells.length === 0) {
        return {
            minX: 0,
            minY: 0,
            maxX: 0,
            maxY: 0,
            width: 0,
            height: 0,
        };
    }

    const xs = cells.map((cell) => cell.x);
    const ys = cells.map((cell) => cell.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
    };
}

export function normalizeCardCells(cells: CardCell[]): CardCell[] {
    const bounds = getCardBounds(cells);
    return cells.map((cell) => ({
        x: cell.x - bounds.minX,
        y: cell.y - bounds.minY,
        color: cell.color,
        plantVariant: cell.plantVariant ?? null,
        plantId: cell.plantId ?? null,
    }));
}

export function rotateCardCells(cells: CardCell[], rotation: Rotation): CardCell[] {
    let next = normalizeCardCells(cells);
    let width = getCardBounds(next).width;
    let height = getCardBounds(next).height;

    // 棋盘格坐标的 y 轴向下，因此正 rotation 在这里表示“视觉上的顺时针 90°”
    for (let i = 0; i < rotation; i++) {
        next = next.map((cell) => ({
            x: height - 1 - cell.y,
            y: cell.x,
            color: cell.color,
            plantVariant: cell.plantVariant ?? null,
            plantId: cell.plantId ?? null,
        }));
        const oldWidth = width;
        width = height;
        height = oldWidth;
        next = normalizeCardCells(next);
    }

    return next;
}
