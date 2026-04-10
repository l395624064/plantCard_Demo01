import {
    BOARD_COLS,
    BOARD_ROWS,
    CARD_TEMPLATE_COLS,
    CARD_TEMPLATE_ROWS,
} from '../../GlobalConst';
import { CardData } from '../../card/CardTypes';
import { normalizeCardCells } from '../../card/CardGeometry';
import { BoardCell } from '../../board/BoardTypes';
import { FruitColor, ParcelType } from '../../core/types/BaseGameTypes';

export const GAME_MODEL_PARCEL_SPRITE_PATHS: Record<ParcelType, string[]> = {
    Crackedland: ['icon/parcel/Crackedland_1/spriteFrame'],
    desert: ['icon/parcel/desert_1/spriteFrame'],
    grassland: [
        'icon/parcel/grassland_1/spriteFrame',
        'icon/parcel/grassland_3/spriteFrame',
    ],
    mossland: ['icon/parcel/mossland_1/spriteFrame'],
    snowfield: ['icon/parcel/snowfield_1/spriteFrame'],
    wasteland: ['icon/parcel/wasteland_1/spriteFrame'],
    mudland: [
        'icon/parcel/mudland_1/spriteFrame',
        'icon/parcel/mudland_2/spriteFrame',
    ],
};

export const GAME_MODEL_DEFAULT_PARCEL_WEIGHTS: Record<ParcelType, number> = {
    Crackedland: 0,
    desert: 0,
    grassland: 100,
    mossland: 0,
    snowfield: 0,
    wasteland: 0,
    mudland: 0,
};

export function fn_game_model_create_empty_board(): BoardCell[][] {
    return Array.from({ length: BOARD_ROWS }, () =>
        Array.from({ length: BOARD_COLS }, () => ({
            baseColor: null,
            diceIndex: -1,
            rotten: false,
            plantVariant: null,
            plantId: null,
            parcelType: 'grassland',
            parcelSpritePath: GAME_MODEL_PARCEL_SPRITE_PATHS.grassland[0],
            fertilizerBlockedTurns: 0,
            fertilityLevel: 0,
            moistureLevel: 0,
            terrainStructure: 'none',
        })),
    );
}

export function fn_game_model_create_card(id: number, label: string, colors: FruitColor[][]): CardData {
    const cells = [];
    for (let y = 0; y < colors.length; y++) {
        for (let x = 0; x < colors[y].length; x++) {
            cells.push({
                x,
                y,
                color: colors[y][x],
                plantVariant: null,
                plantId: null,
            });
        }
    }

    return {
        id: `card-${id}`,
        label,
        cells,
        mainType: 'plant',
        playMode: 'board_placement',
        summary: '植物牌：可放置到种植区，并通过叠加提升等级。',
        profile: {
            kind: 'plant',
            plantId: `plant-card-${id}`,
            canStackUpgrade: true,
            mismatchCreatesFertilizer: true,
        },
        cardKind: 'placement',
    };
}

function fn_game_model_random_color(): FruitColor {
    const pool: FruitColor[] = ['red', 'yellow', 'purple'];
    return pool[Math.floor(Math.random() * pool.length)];
}

export function fn_game_model_create_random_shape_card(id: number, label: string): CardData {
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
                color: fn_game_model_random_color(),
                plantVariant: null,
                plantId: null,
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
        mainType: 'plant',
        playMode: 'board_placement',
        summary: '植物牌：当前 Demo 的基础可放置卡。',
        profile: {
            kind: 'plant',
            plantId: `plant-card-${id}`,
            canStackUpgrade: true,
            mismatchCreatesFertilizer: true,
        },
        cardKind: 'placement',
    };
}

export function fn_game_model_shuffle<T>(list: T[]): T[] {
    const next = list.slice();

    for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = next[i];
        next[i] = next[j];
        next[j] = tmp;
    }

    return next;
}
