export const GAME_TIME_WHEEL_YEAR_COUNT = 12;
export const GAME_TIME_WHEEL_YEAR_LABELS = Array.from(
    { length: GAME_TIME_WHEEL_YEAR_COUNT },
    (_, index) => `第${index + 1}年`,
);
export const GAME_TIME_WHEEL_SEASONS = ['春', '夏', '秋', '冬'] as const;

export const GAME_PLANT_SPRITE_PATHS = [
    'icon/zhiwu/zhiwu_1/spriteFrame',
    'icon/zhiwu/zhiwu_2/spriteFrame',
    'icon/zhiwu/zhiwu_3/spriteFrame',
    'icon/zhiwu/zhiwu_4/spriteFrame',
    'icon/zhiwu/zhiwu_5/spriteFrame',
    'icon/zhiwu/zhiwu_6/spriteFrame',
    'icon/zhiwu/zhiwu_7/spriteFrame',
    'icon/zhiwu/zhiwu_8/spriteFrame',
    'icon/zhiwu/zhiwu_9/spriteFrame',
    'icon/zhiwu/zhiwu_10/spriteFrame',
    'icon/zhiwu/zhiwu_11/spriteFrame',
] as const;

export const GAME_GM_ADD_SCORE_AMOUNT = 3;
export const GAME_GM_ADD_ROTTEN_AMOUNT = 1;
