export type FruitColor = 'red' | 'yellow' | 'purple';

export type Rotation = 0 | 1 | 2 | 3;

export type GameStatus = 'playing' | 'win' | 'lose';

export type ParcelType = 'Crackedland' | 'desert' | 'grassland' | 'mossland' | 'snowfield' | 'wasteland' | 'mudland';
export type CardMainType = 'plant' | 'vegetation' | 'technology' | 'farming';
export type CardPlayMode = 'board_placement' | 'parcel_target' | 'structure_target' | 'instant_effect';
export type ParcelModifierType = 'fertile' | 'moist';
export type ParcelStructureType = 'none' | 'waterway' | 'wall';

export interface GridPos {
    x: number;
    y: number;
}

export interface CardCell {
    x: number;
    y: number;
    color: FruitColor;
    plantVariant?: number | null;
    plantId?: string | null;
}

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

export interface CardBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
}

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

export interface HandSlotState {
    index: number;
    card: CardData | null;
    selected: boolean;
    canPlace: boolean;
}

export interface GameViewState {
    board: BoardCell[][];
    handSlots: HandSlotState[];
    deckCount: number;
    score: number;
    targetScore: number;
    remainingRotten: number;
    rotation: Rotation;
    status: GameStatus;
    message: string;
    preview: PlacementPreview | null;
    /** 最近一次旋转方向：-1 左转，1 右转，0 无 */
    rotationStep: -1 | 0 | 1;
    /** 预放置状态2：锚点已锁定，仅此时可点「放置」结算 */
    preplaceLocked: boolean;
    /** 用于重叠区边框闪烁，由 MainGame 每帧递增 */
    flashPhase: number;
}

export const BOARD_COLS = 8;
export const BOARD_ROWS = 8;
export const CARD_TEMPLATE_COLS = 2;
export const CARD_TEMPLATE_ROWS = 3;
export const HAND_SIZE = 3;
export const MAX_ROTTEN = 2;
export const TARGET_SCORE = 9999;

export const DICE_VALUES = [1, 3, 6, 10];

export const FRUIT_COLORS: FruitColor[] = ['red', 'yellow', 'purple'];

export function cloneGridPos(pos: GridPos | null): GridPos | null {
    if (!pos) {
        return null;
    }

    return { x: pos.x, y: pos.y };
}

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

export function getCardMainTypeLabel(mainType: CardMainType): string {
    switch (mainType) {
        case 'plant':
            return '植物牌';
        case 'vegetation':
            return '植被牌';
        case 'technology':
            return '科技牌';
        case 'farming':
            return '农术牌';
        default:
            return '卡牌';
    }
}

export function isBoardPlacementCard(card: CardData | null | undefined): boolean {
    return !!card && card.mainType === 'plant' && card.playMode === 'board_placement';
}
