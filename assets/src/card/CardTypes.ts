import { ParcelModifierType, ParcelStructureType } from '../parcel/ParcelEnum';
import { CardCell } from './types/CardCellTypes';

export type CardMainType = 'plant' | 'vegetation' | 'technology' | 'farming';
export type CardPlayMode = 'board_placement' | 'parcel_target' | 'structure_target' | 'instant_effect';

/** 放置卡：可拖入格子的果丛卡；法术卡：后续版本启用 */
export type CardKind = 'placement' | 'spell';

export interface PlantCardProfile {
    kind: 'plant';
    plantId: string;
    canStackUpgrade: boolean;
    mismatchCreatesFertilizer: boolean;
}

export interface VegetationCardProfile {
    kind: 'vegetation';
    parcelModifiers: ParcelModifierType[];
    allowPlantOnModifiedParcel: boolean;
}

export interface TechnologyCardProfile {
    kind: 'technology';
    structures: Exclude<ParcelStructureType, 'none'>[];
    blocksPlanting: boolean;
}

export interface FarmingCardProfile {
    kind: 'farming';
    actionTags: string[];
}

export type CardProfile = PlantCardProfile | VegetationCardProfile | TechnologyCardProfile | FarmingCardProfile;

export interface CardData {
    id: string;
    label: string;
    cells: CardCell[];
    mainType: CardMainType;
    playMode: CardPlayMode;
    summary: string;
    profile: CardProfile;
    /** 兼容现有 Demo 逻辑，后续可逐步移除 */
    cardKind?: CardKind;
}
