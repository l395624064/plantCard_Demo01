import { FruitColor, GridPos, Rotation } from '../core/types/BaseGameTypes';
import { ParcelStructureType, ParcelType } from '../parcel/ParcelEnum';

export interface BoardCell {
    baseColor: FruitColor | null;
    diceIndex: number;
    rotten: boolean;
    plantVariant: number | null;
    plantId: string | null;
    parcelType: ParcelType;
    parcelSpritePath: string;
    fertilizerBlockedTurns: number;
    fertilityLevel: number;
    moistureLevel: number;
    terrainStructure: ParcelStructureType;
}

export interface PlacementHit extends GridPos {
    color: FruitColor;
}

export interface PlacementCell extends GridPos {
    color: FruitColor;
    blocked: boolean;
    overlapsSame: boolean;
    overlapsDiff: boolean;
    plantVariant: number | null;
    plantId: string | null;
}

export interface PlacementPreview {
    isValid: boolean;
    reason: string;
    anchor: GridPos;
    rotation: Rotation;
    occupiedOverlapCount: number;
    scoreGain: number;
    requiredRotten: number;
    sameColorHits: PlacementHit[];
    diffColorHits: PlacementHit[];
    cells: PlacementCell[];
}
