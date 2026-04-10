import { FruitColor } from '../../core/types/BaseGameTypes';

export interface CardCell {
    x: number;
    y: number;
    color: FruitColor;
    plantVariant?: number | null;
    plantId?: string | null;
}

export interface CardBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
}
