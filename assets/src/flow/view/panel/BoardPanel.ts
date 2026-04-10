import { Color, Graphics, Label, Sprite, UITransform } from 'cc';
import { BOARD_COLS, BOARD_ROWS } from '../../../GlobalConst';
import { FruitColor } from '../../../core/types/BaseGameTypes';
import { GameViewState } from '../../../view/ViewStateTypes';

export interface interface_game_board_plant_cell_view {
    node: { active: boolean; setPosition: (x: number, y: number, z: number) => void; setSiblingIndex: (index: number) => void; getComponent: (t: typeof UITransform) => UITransform | null };
    graphics: Graphics;
    sprite: Sprite;
    row: number;
    col: number;
    preview: boolean;
}

export interface interface_game_board_parcel_cell_view {
    node: { active: boolean; setPosition: (x: number, y: number, z: number) => void; setSiblingIndex: (index: number) => void; getComponent: (t: typeof UITransform) => UITransform | null };
    sprite: Sprite;
    row: number;
    col: number;
}

interface interface_game_preview_rotate_state {
    extraDeg: number;
    offsetX: number;
    offsetY: number;
}

interface interface_game_drop_pulse_state {
    value: number;
}

interface interface_game_board_draw_context {
    boardGraphics: Graphics;
    boardSize: number;
    cellLabels: Label[][];
    levelLabels: Label[][];
    boardPlantViews: interface_game_board_plant_cell_view[];
    boardParcelViews: interface_game_board_parcel_cell_view[];
    previewPlantViews: interface_game_board_plant_cell_view[];
    previewRotateTweenState: interface_game_preview_rotate_state;
    preplace2BoardDragging: boolean;
    previewDropPulseState: interface_game_drop_pulse_state;
    setPlantSpriteFit: (sprite: Sprite, maxWidth: number, maxHeight: number, bottomY?: number) => void;
    loadSpriteFrameByPath: (path: string, sprite: Sprite) => void;
    getPlantSpritePathByVariant: (variant: number | null) => string;
    tracePreviewRect: (
        graphics: Graphics,
        x: number,
        y: number,
        width: number,
        height: number,
        pivotX: number,
        pivotY: number,
        angleRad: number,
    ) => void;
    rotatePointAroundPivot: (x: number, y: number, pivotX: number, pivotY: number, angleRad: number) => { x: number; y: number };
}

function makeColor(r: number, g: number, b: number, a = 255): Color {
    return new Color(r, g, b, a);
}

function fruitColor(color: FruitColor, alpha = 255): Color {
    switch (color) {
        case 'red':
            return makeColor(242, 102, 95, alpha);
        case 'yellow':
            return makeColor(242, 205, 84, alpha);
        case 'purple':
        default:
            return makeColor(149, 115, 216, alpha);
    }
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function flashAlpha(phase: number, base: number, amplitude: number): number {
    const w = 0.5 + 0.5 * Math.sin(phase * 2.4);
    return clamp(base + amplitude * w, 0, 255);
}

function fn_game_sync_board_plants(
    context: interface_game_board_draw_context,
    state: GameViewState,
    cellSize: number,
): void {
    const visible: interface_game_board_plant_cell_view[] = [];
    const cellPad = clamp(cellSize * 0.12, 6, 10);
    const borderW = cellSize - cellPad * 2;
    const borderH = cellSize - cellPad * 2;

    for (let y = 0; y < BOARD_ROWS; y++) {
        for (let x = 0; x < BOARD_COLS; x++) {
            const cell = state.board[y][x];
            const view = context.boardPlantViews[y * BOARD_COLS + x];
            if (!cell.baseColor || cell.rotten || cell.plantVariant === null) {
                view.node.active = false;
                continue;
            }
            const centerX = -context.boardSize / 2 + cellSize * (x + 0.5);
            const centerY = context.boardSize / 2 - cellSize * (y + 0.5);
            view.row = y;
            view.col = x;
            view.preview = false;
            view.node.active = true;
            view.node.setPosition(centerX, centerY, 0);
            view.node.getComponent(UITransform)?.setContentSize(cellSize, cellSize);
            view.graphics.clear();
            view.graphics.fillColor = fruitColor(cell.baseColor, 22);
            view.graphics.roundRect(-borderW / 2, -borderH / 2, borderW, borderH, 8);
            view.graphics.fill();
            view.graphics.lineWidth = 3;
            view.graphics.strokeColor = fruitColor(cell.baseColor, 255);
            view.graphics.roundRect(-borderW / 2, -borderH / 2, borderW, borderH, 8);
            view.graphics.stroke();
            view.sprite.color = makeColor(255, 255, 255, 255);
            context.setPlantSpriteFit(view.sprite, cellSize * 0.8, cellSize * 1.18, -cellSize * 0.36);
            context.loadSpriteFrameByPath(context.getPlantSpritePathByVariant(cell.plantVariant), view.sprite);
            visible.push(view);
        }
    }

    for (const view of context.previewPlantViews) {
        view.node.active = false;
    }
    if (state.preview) {
        const previewOffsetX = state.preplaceLocked ? context.previewRotateTweenState.offsetX : 0;
        const previewOffsetY = state.preplaceLocked ? context.previewRotateTweenState.offsetY : 0;
        let previewIndex = 0;
        for (const cell of state.preview.cells) {
            if (
                previewIndex >= context.previewPlantViews.length
                || cell.blocked
                || cell.overlapsSame
                || cell.overlapsDiff
                || cell.plantVariant === null
            ) {
                continue;
            }
            const view = context.previewPlantViews[previewIndex++];
            const centerX = -context.boardSize / 2 + cellSize * (cell.x + 0.5) + previewOffsetX;
            const centerY = context.boardSize / 2 - cellSize * (cell.y + 0.5) + previewOffsetY;
            view.row = cell.y;
            view.col = cell.x;
            view.preview = true;
            view.node.active = true;
            view.node.setPosition(centerX, centerY, 0);
            view.node.getComponent(UITransform)?.setContentSize(cellSize, cellSize);
            view.graphics.clear();
            view.graphics.fillColor = fruitColor(cell.color, 18);
            view.graphics.roundRect(-borderW / 2, -borderH / 2, borderW, borderH, 8);
            view.graphics.fill();
            view.graphics.lineWidth = 3;
            view.graphics.strokeColor = fruitColor(cell.color, 210);
            view.graphics.roundRect(-borderW / 2, -borderH / 2, borderW, borderH, 8);
            view.graphics.stroke();
            view.sprite.color = makeColor(255, 255, 255, state.preplaceLocked ? 220 : 170);
            context.setPlantSpriteFit(view.sprite, cellSize * 0.8, cellSize * 1.12, -cellSize * 0.36);
            context.loadSpriteFrameByPath(context.getPlantSpritePathByVariant(cell.plantVariant), view.sprite);
            visible.push(view);
        }
    }

    visible.sort((a, b) => {
        if (a.row !== b.row) {
            return a.row - b.row;
        }
        if (a.preview !== b.preview) {
            return a.preview ? 1 : -1;
        }
        return a.col - b.col;
    });
    for (let i = 0; i < visible.length; i++) {
        visible[i].node.setSiblingIndex(i);
    }
}

function fn_game_sync_board_parcels(
    context: interface_game_board_draw_context,
    state: GameViewState,
    cellSize: number,
): void {
    const visible: interface_game_board_parcel_cell_view[] = [];
    for (let y = 0; y < BOARD_ROWS; y++) {
        for (let x = 0; x < BOARD_COLS; x++) {
            const cell = state.board[y][x];
            const view = context.boardParcelViews[y * BOARD_COLS + x];
            const centerX = -context.boardSize / 2 + cellSize * (x + 0.5);
            const centerY = context.boardSize / 2 - cellSize * (y + 0.5);
            view.row = y;
            view.col = x;
            view.node.active = true;
            view.node.setPosition(centerX, centerY, 0);
            view.node.getComponent(UITransform)?.setContentSize(cellSize, cellSize);
            view.sprite.color = makeColor(255, 255, 255, 128);
            context.setPlantSpriteFit(view.sprite, cellSize * 1.08, cellSize * 1.1, -cellSize * 0.58);
            context.loadSpriteFrameByPath(cell.parcelSpritePath, view.sprite);
            visible.push(view);
        }
    }

    visible.sort((a, b) => {
        if (a.row !== b.row) {
            return a.row - b.row;
        }
        return a.col - b.col;
    });
    for (let i = 0; i < visible.length; i++) {
        visible[i].node.setSiblingIndex(i);
    }
}

export function fn_game_draw_board_panel(
    context: interface_game_board_draw_context,
    state: GameViewState,
): void {
    const graphics = context.boardGraphics;
    const cellSize = context.boardSize / BOARD_COLS;
    const phase = state.flashPhase;
    fn_game_sync_board_parcels(context, state, cellSize);
    graphics.clear();

    for (let y = 0; y < BOARD_ROWS; y++) {
        for (let x = 0; x < BOARD_COLS; x++) {
            const cell = state.board[y][x];
            const left = -context.boardSize / 2 + cellSize * x;
            const top = context.boardSize / 2 - cellSize * y;
            const levelLabel = context.levelLabels[y][x];

            context.cellLabels[y][x].fontSize = 20;
            levelLabel.fontSize = clamp(cellSize * 0.17, 12, 17);

            if (cell.rotten) {
                graphics.fillColor = makeColor(107, 80, 67, 255);
                graphics.rect(left + 3, top - cellSize + 3, cellSize - 6, cellSize - 6);
                graphics.fill();
                context.cellLabels[y][x].string = 'X';
                context.cellLabels[y][x].color = makeColor(255, 255, 255, 255);
                levelLabel.string = '';
            } else if (cell.baseColor) {
                context.cellLabels[y][x].string = '';
                context.cellLabels[y][x].color = makeColor(72, 58, 45, 255);
                if (cell.diceIndex >= 0) {
                    const tagW = cellSize * 0.68;
                    const tagH = cellSize * 0.2;
                    const tagX = left + (cellSize - tagW) / 2;
                    const tagY = top - cellSize * 0.985;
                    graphics.fillColor = makeColor(62, 62, 66, 168);
                    graphics.roundRect(tagX, tagY, tagW, tagH, 9);
                    graphics.fill();
                    graphics.fillColor = makeColor(255, 255, 255, 34);
                    graphics.roundRect(tagX + 2, tagY + tagH * 0.08, tagW - 4, tagH * 0.34, 7);
                    graphics.fill();
                    graphics.lineWidth = 2;
                    graphics.strokeColor = makeColor(228, 220, 202, 120);
                    graphics.roundRect(tagX, tagY, tagW, tagH, 9);
                    graphics.stroke();
                }
                levelLabel.string = cell.diceIndex >= 0 ? `Lv.${cell.diceIndex + 2}` : '';
                levelLabel.color = cell.diceIndex >= 0
                    ? makeColor(246, 238, 221, 255)
                    : makeColor(88, 66, 40, 255);
            } else {
                context.cellLabels[y][x].string = '';
                levelLabel.string = '';
            }
        }
    }
    fn_game_sync_board_plants(context, state, cellSize);

    if (state.preview) {
        const preview = state.preview;
        const previewOffsetX = state.preplaceLocked ? context.previewRotateTweenState.offsetX : 0;
        const previewOffsetY = state.preplaceLocked ? context.previewRotateTweenState.offsetY : 0;
        const minX = Math.min(...preview.cells.map((c) => c.x));
        const maxX = Math.max(...preview.cells.map((c) => c.x));
        const minY = Math.min(...preview.cells.map((c) => c.y));
        const maxY = Math.max(...preview.cells.map((c) => c.y));
        const outerLeft = -context.boardSize / 2 + cellSize * minX + previewOffsetX;
        const outerTop = context.boardSize / 2 - cellSize * minY + previewOffsetY;
        const outerW = cellSize * (maxX - minX + 1);
        const outerH = cellSize * (maxY - minY + 1);
        const previewPivotX = outerLeft + outerW / 2;
        const previewPivotY = outerTop - outerH / 2;
        const previewAngleRad = state.preplaceLocked ? context.previewRotateTweenState.extraDeg * Math.PI / 180 : 0;

        for (const cell of preview.cells) {
            const left = -context.boardSize / 2 + cellSize * cell.x + previewOffsetX;
            const top = context.boardSize / 2 - cellSize * cell.y + previewOffsetY;
            const pad = cell.blocked ? 8 : 10;
            const rectX = left + pad;
            const rectY = top - cellSize + pad;
            const rectW = cellSize - pad * 2;
            const rectH = cellSize - pad * 2;

            if (cell.blocked) {
                graphics.fillColor = makeColor(85, 64, 58, 120);
                context.tracePreviewRect(graphics, rectX, rectY, rectW, rectH, previewPivotX, previewPivotY, previewAngleRad);
                graphics.fill();
            } else if (cell.overlapsSame || cell.overlapsDiff) {
                graphics.fillColor = makeColor(88, 88, 92, state.preplaceLocked ? 178 : 146);
                context.tracePreviewRect(graphics, rectX, rectY, rectW, rectH, previewPivotX, previewPivotY, previewAngleRad);
                graphics.fill();
                graphics.lineWidth = 2;
                graphics.strokeColor = makeColor(218, 214, 205, state.preplaceLocked ? 168 : 132);
                context.tracePreviewRect(graphics, rectX, rectY, rectW, rectH, previewPivotX, previewPivotY, previewAngleRad);
                graphics.stroke();
            }

            if (!cell.blocked && cell.overlapsSame) {
                const mark = context.cellLabels[cell.y][cell.x];
                mark.string = '✓';
                mark.fontSize = clamp(cellSize * 0.42, 22, 34);
                mark.color = makeColor(25, 170, 72, 255);
            } else if (!cell.blocked && cell.overlapsDiff) {
                const mark = context.cellLabels[cell.y][cell.x];
                mark.string = '✕';
                mark.fontSize = clamp(cellSize * 0.42, 22, 34);
                mark.color = makeColor(225, 54, 44, 255);
            }
        }

        if (state.preplaceLocked) {
            const dragHintAlpha = flashAlpha(phase, 70, 60);
            const draggingBoost = context.preplace2BoardDragging ? 35 : 0;
            const dropPulse = context.previewDropPulseState.value;
            if (context.preplace2BoardDragging) {
                graphics.fillColor = preview.isValid ? makeColor(96, 208, 132, 42) : makeColor(222, 118, 96, 42);
                context.tracePreviewRect(
                    graphics,
                    outerLeft - 16,
                    outerTop - outerH - 16,
                    outerW + 32,
                    outerH + 32,
                    previewPivotX,
                    previewPivotY,
                    previewAngleRad,
                );
                graphics.fill();

                graphics.fillColor = preview.isValid ? makeColor(96, 208, 132, 24) : makeColor(222, 118, 96, 24);
                context.tracePreviewRect(
                    graphics,
                    outerLeft - 24,
                    outerTop - outerH - 24,
                    outerW + 48,
                    outerH + 48,
                    previewPivotX,
                    previewPivotY,
                    previewAngleRad,
                );
                graphics.fill();
            }
            graphics.lineWidth = 3;
            graphics.strokeColor = preview.isValid
                ? makeColor(60, 150, 84, dragHintAlpha + draggingBoost)
                : makeColor(190, 88, 70, dragHintAlpha + draggingBoost);
            context.tracePreviewRect(
                graphics,
                outerLeft - 6,
                outerTop - outerH - 6,
                outerW + 12,
                outerH + 12,
                previewPivotX,
                previewPivotY,
                previewAngleRad,
            );
            graphics.stroke();

            const handleY = outerTop + 16;
            const dotR = clamp(cellSize * 0.07, 3, 5);
            const dotGap = dotR * 3.2;
            graphics.fillColor = makeColor(88, 76, 58, context.preplace2BoardDragging ? 225 : 185);
            for (const offset of [-dotGap, 0, dotGap]) {
                const p = context.rotatePointAroundPivot(previewPivotX + offset, handleY, previewPivotX, previewPivotY, previewAngleRad);
                graphics.circle(p.x, p.y, dotR);
                graphics.fill();
            }

            if (context.preplace2BoardDragging) {
                graphics.lineWidth = 4;
                graphics.strokeColor = preview.isValid ? makeColor(78, 182, 108, 245) : makeColor(210, 94, 72, 245);
                context.tracePreviewRect(
                    graphics,
                    outerLeft - 11,
                    outerTop - outerH - 11,
                    outerW + 22,
                    outerH + 22,
                    previewPivotX,
                    previewPivotY,
                    previewAngleRad,
                );
                graphics.stroke();
            }

            if (dropPulse > 0.001) {
                const pulseGrow = lerp(18, 0, 1 - dropPulse);
                const pulseAlpha = Math.floor(lerp(0, 165, dropPulse));
                graphics.lineWidth = 3;
                graphics.strokeColor = preview.isValid
                    ? makeColor(96, 198, 124, pulseAlpha)
                    : makeColor(220, 118, 96, pulseAlpha);
                context.tracePreviewRect(
                    graphics,
                    outerLeft - pulseGrow,
                    outerTop - outerH - pulseGrow,
                    outerW + pulseGrow * 2,
                    outerH + pulseGrow * 2,
                    previewPivotX,
                    previewPivotY,
                    previewAngleRad,
                );
                graphics.stroke();
            }
        }

        const outerThick = state.preplaceLocked ? 5 : 4;
        graphics.lineWidth = outerThick;
        const oa = 240;
        graphics.strokeColor = preview.isValid ? makeColor(50, 140, 70, oa) : makeColor(180, 70, 55, oa);
        context.tracePreviewRect(
            graphics,
            outerLeft + 4,
            outerTop - outerH + 4,
            outerW - 8,
            outerH - 8,
            previewPivotX,
            previewPivotY,
            previewAngleRad,
        );
        graphics.stroke();
    }

    graphics.strokeColor = makeColor(170, 154, 120, 255);
    graphics.lineWidth = 2;
    for (let x = 0; x <= BOARD_COLS; x++) {
        const drawX = -context.boardSize / 2 + cellSize * x;
        graphics.moveTo(drawX, -context.boardSize / 2);
        graphics.lineTo(drawX, context.boardSize / 2);
    }
    for (let y = 0; y <= BOARD_ROWS; y++) {
        const drawY = context.boardSize / 2 - cellSize * y;
        graphics.moveTo(-context.boardSize / 2, drawY);
        graphics.lineTo(context.boardSize / 2, drawY);
    }
    graphics.stroke();
}
