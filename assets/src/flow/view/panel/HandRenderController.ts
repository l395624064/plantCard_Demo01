import { Color, Graphics, Node, UITransform, Vec3 } from 'cc';
import { CARD_TEMPLATE_COLS, CARD_TEMPLATE_ROWS } from '../../../GlobalConst';
import { getCardMainTypeLabel, isBoardPlacementCard } from '../../../card/CardRuleUtils';
import { FruitColor } from '../../../core/types/BaseGameTypes';
import { HandSlotState } from '../../../view/ViewStateTypes';
import {
    fn_game_view_get_plant_sprite_path_by_variant,
    fn_game_view_load_sprite_frame_by_path,
    fn_game_view_set_plant_sprite_fit,
} from './GameViewBaseService';
import { GAME_PLANT_SPRITE_PATHS } from '../../GameConst';
import { fn_game_view_ensure_hand_view_count_for_view } from './GameViewSceneAssembler';

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function lerp(from: number, to: number, t: number): number {
    return from + (to - from) * t;
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

export function fn_game_get_fan_slot_transform_for_view(view: any, index: number, count: number): { x: number; y: number; zDeg: number } {
    const center = (count - 1) / 2;
    const crowd = clamp((count - 1) / 5, 0, 1);
    const maxTiltDeg = lerp(11, 4, crowd);
    const spreadX = count <= 1
        ? 0
        : Math.min(
            clamp(view.handCardWidth * 0.48, 62, 92),
            (view.panelWidth - view.handCardWidth * 1.1) / Math.max(count - 1, 1),
        );
    const arcLift = lerp(clamp(view.handCardHeight * 0.07, 10, 18), clamp(view.handCardHeight * 0.025, 4, 8), crowd);
    const sinkY = -view.handPanelHeight * 0.32;
    const t = count > 1 ? (index - center) / center : 0;
    const zDeg = -t * maxTiltDeg;
    const x = t * spreadX;
    const y = sinkY + (1 - Math.abs(t)) * arcLift;
    return { x, y, zDeg };
}

export function fn_game_get_hand_base_scale_for_view(count: number): number {
    if (count <= 3) {
        return 1;
    }
    if (count === 4) {
        return 0.96;
    }
    if (count === 5) {
        return 0.9;
    }
    return clamp(0.9 - (count - 5) * 0.06, 0.68, 0.9);
}

export function fn_game_reorder_hand_siblings_for_hover_for_view(view: any, activeCount = view.lastRenderState?.handSlots.length ?? 0): void {
    if (!view.handPanel) {
        return;
    }
    let order = Array.from({ length: activeCount }, (_, i) => i);
    if (view.preplacePhase !== 'idle' && view.preplaceHandIndex !== null) {
        order = order.filter((i) => i !== view.preplaceHandIndex);
        order.push(view.preplaceHandIndex);
    } else if (view.preplacePhase === 'idle' && view.hoverHandIndex !== null) {
        const h = view.hoverHandIndex;
        order = order.filter((i) => i !== h);
        order.push(h);
    }
    let z = 0;
    for (const i of order) {
        const n = view.handViews[i].node;
        if (n.parent === view.handPanel && n.active) {
            n.setSiblingIndex(z);
            z++;
        }
    }
}

export function fn_game_apply_hand_fan_layout_for_view(view: any, activeCount = view.lastRenderState?.handSlots.length ?? 0): void {
    if (!view.handPanel || view.handRefillAnimRunning) {
        return;
    }

    const count = activeCount;
    const baseScale = fn_game_get_hand_base_scale_for_view(count);
    for (let i = 0; i < count; i++) {
        const handView = view.handViews[i];
        const node = handView.node;
        if (node.parent !== view.handPanel) {
            continue;
        }

        const tr = fn_game_get_fan_slot_transform_for_view(view, i, count);
        let x = tr.x;
        let y = tr.y;
        let zDeg = tr.zDeg;
        let sc = baseScale;

        if (view.preplacePhase === 'idle' && view.hoverHandIndex === i && view.lastRenderState?.handSlots[i]?.card) {
            y += clamp(view.handCardHeight * 0.14, 22, 38);
            sc = baseScale * 1.09;
        }
        if (view.preplacePhase === 'preplace1_track' && view.preplaceHandIndex === i) {
            y += view.handDragLiftY + 18;
            zDeg = 0;
            sc = Math.max(baseScale, 1) * 1.08;
        }

        node.setPosition(x, y, 0);
        node.setScale(sc, sc, 1);
        node.setRotationFromEuler(0, 0, zDeg);
    }

    for (let i = count; i < view.handViews.length; i++) {
        view.handViews[i].node.active = false;
    }
    fn_game_reorder_hand_siblings_for_hover_for_view(view, count);
}

export function fn_game_pick_distinct_start(base: Vec3, used: Vec3[]): Vec3 {
    const step = 14;
    let p = base.clone();
    let guard = 0;
    while (guard < 12 && used.some((u) => Math.abs(u.x - p.x) < 1 && Math.abs(u.y - p.y) < 1)) {
        p = p.add3f(step, 0, 0);
        guard++;
    }
    used.push(p.clone());
    return p;
}

export function fn_game_render_hand_for_view(view: any, handSlots: HandSlotState[]): void {
    fn_game_view_ensure_hand_view_count_for_view(view, handSlots.length);
    fn_game_apply_hand_fan_layout_for_view(view, handSlots.length);

    for (let i = 0; i < view.handViews.length; i++) {
        const handView = view.handViews[i];
        const slot = handSlots[i];
        handView.node.active = i < handSlots.length;
        if (!handView.node.active) {
            continue;
        }
        const graphics: Graphics = handView.graphics;
        graphics.clear();
        for (const artCell of handView.artCells) {
            artCell.node.active = false;
        }

        const inPreplace = view.preplaceHandIndex === i && view.preplacePhase !== 'idle';
        const isSelected = !!slot?.selected || inPreplace;

        graphics.fillColor = isSelected ? makeColor(255, 243, 168, 255) : makeColor(245, 238, 215, 255);
        graphics.roundRect(-view.handCardWidth / 2, -view.handCardHeight / 2, view.handCardWidth, view.handCardHeight, 16);
        graphics.fill();

        graphics.lineWidth = isSelected ? 6 : 3;
        graphics.strokeColor = isSelected ? makeColor(223, 164, 43, 255) : makeColor(171, 141, 96, 255);
        graphics.roundRect(-view.handCardWidth / 2, -view.handCardHeight / 2, view.handCardWidth, view.handCardHeight, 16);
        graphics.stroke();

        if (!slot || !slot.card) {
            handView.title.string = '空';
            handView.descLabel.string = '';
            handView.costLabel.string = '';
            handView.typeLabel.string = '';
            continue;
        }

        const card = slot.card;
        const artTop = view.handCardHeight * 0.12;
        const artH = view.handCardHeight * 0.38;
        const artW = view.handCardWidth - 36;
        const gap = 6;
        const cellW = (artW - gap * (CARD_TEMPLATE_COLS - 1)) / CARD_TEMPLATE_COLS;
        const cellH = (artH - gap * (CARD_TEMPLATE_ROWS - 1)) / CARD_TEMPLATE_ROWS;
        const originX = -artW / 2;
        const artTopY = view.handCardHeight / 2 - artTop;
        for (const cell of card.cells) {
            const x = originX + cell.x * (cellW + gap);
            const y = artTopY - cell.y * (cellH + gap) - cellH;
            const artIndex = cell.y * CARD_TEMPLATE_COLS + cell.x;
            const artCell = handView.artCells[artIndex];
            if (!artCell) {
                continue;
            }
            artCell.node.active = true;
            artCell.node.setPosition(x + cellW / 2, y + cellH / 2, 0);
            artCell.node.getComponent(UITransform)?.setContentSize(cellW, cellH);

            artCell.graphics.clear();
            artCell.graphics.fillColor = fruitColor(cell.color, 28);
            artCell.graphics.roundRect(-cellW / 2, -cellH / 2, cellW, cellH, 8);
            artCell.graphics.fill();
            artCell.graphics.lineWidth = 3;
            artCell.graphics.strokeColor = fruitColor(cell.color, 255);
            artCell.graphics.roundRect(-cellW / 2, -cellH / 2, cellW, cellH, 8);
            artCell.graphics.stroke();

            const spriteMaxWidth = cellW * 0.82;
            const spriteMaxHeight = cellH * 0.88;
            fn_game_view_set_plant_sprite_fit(artCell.sprite, spriteMaxWidth, spriteMaxHeight, -cellH * 0.34);
            fn_game_view_load_sprite_frame_by_path(
                view,
                fn_game_view_get_plant_sprite_path_by_variant(
                    GAME_PLANT_SPRITE_PATHS as unknown as string[],
                    cell.plantVariant ?? 0,
                ),
                artCell.sprite,
            );
        }

        handView.costLabel.string = '0';
        handView.title.string = card.label;
        handView.typeLabel.string = getCardMainTypeLabel(card.mainType);
        if (isBoardPlacementCard(card)) {
            handView.descLabel.string = '拖出后在放置区松手进入确认，可在棋盘拖动改位';
            handView.descLabel.color = slot.canPlace ? makeColor(76, 126, 65, 255) : makeColor(170, 83, 69, 255);
        } else if (card.mainType === 'vegetation') {
            handView.descLabel.string = '基础概念已建立：后续用于调整地块状态';
            handView.descLabel.color = makeColor(84, 118, 82, 255);
        } else if (card.mainType === 'technology') {
            handView.descLabel.string = '基础概念已建立：后续用于改造水渠、墙壁等结构';
            handView.descLabel.color = makeColor(88, 102, 148, 255);
        } else {
            handView.descLabel.string = '基础概念已建立：后续用于抽牌、置换、降雨等战术操作';
            handView.descLabel.color = makeColor(146, 102, 66, 255);
        }
    }
}
