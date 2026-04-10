import { BoardCell, PlacementPreview } from '../board/BoardTypes';
import { CardData } from '../card/CardTypes';
import { GameStatus, Rotation } from '../core/types/BaseGameTypes';

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
