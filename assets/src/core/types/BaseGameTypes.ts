export type FruitColor = 'red' | 'yellow' | 'purple';

export type Rotation = 0 | 1 | 2 | 3;

export type GameStatus = 'playing' | 'win' | 'lose';

export type ParcelType = 'Crackedland' | 'desert' | 'grassland' | 'mossland' | 'snowfield' | 'wasteland' | 'mudland';
export type ParcelModifierType = 'fertile' | 'moist';
export type ParcelStructureType = 'none' | 'waterway' | 'wall';

export interface GridPos {
    x: number;
    y: number;
}
