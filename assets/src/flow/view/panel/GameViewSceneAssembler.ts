import { Color, EventMouse, EventTouch, HorizontalTextAlignment, Node, VerticalTextAlignment } from 'cc';
import { CARD_TEMPLATE_COLS, CARD_TEMPLATE_ROWS, HAND_SIZE } from '../../../GlobalConst';
import {
    fn_game_create_hand_card_view,
    fn_game_create_hand_panel,
} from './HandPanel';
import {
    fn_game_create_message_panel,
} from './MessagePanel';
import {
    fn_game_create_topInfo_panel,
} from './TopInfoPanel';
import { fn_game_draw_board_panel } from './BoardPanel';
import { fn_game_rotate_point_around_pivot, fn_game_trace_preview_rect } from './PreviewGeometry';
import {
    fn_game_view_bind_primary_down,
    fn_game_view_create_label,
    fn_game_view_get_plant_sprite_path_by_variant,
    fn_game_view_get_time_wheel_display_size,
    fn_game_view_load_sprite_frame_by_path,
    fn_game_view_make_node,
    fn_game_view_make_panel,
    fn_game_view_set_plant_sprite_fit,
} from './GameViewBaseService';
import { GAME_PLANT_SPRITE_PATHS } from '../../GameConst';

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function makeColor(r: number, g: number, b: number, a = 255): Color {
    return new Color(r, g, b, a);
}

export function fn_game_view_create_top_info_for_view(view: any): any {
    return fn_game_create_topInfo_panel({
        root: view.root,
        rootWidth: view.rootWidth,
        rootHeight: view.rootHeight,
        panelWidth: view.panelWidth,
        topPanelHeight: view.topPanelHeight,
        getTimeWheelDisplaySize: () => fn_game_view_get_time_wheel_display_size(view),
        makeNode: (name: string, width: number, height: number, x: number, y: number) => fn_game_view_make_node(name, width, height, x, y),
        makePanel: (name: string, width: number, height: number, x: number, y: number, color: any) => fn_game_view_make_panel(name, width, height, x, y, color),
        createLabel: (
            parent: Node,
            name: string,
            width: number,
            height: number,
            x: number,
            y: number,
            fontSize: number,
            horizontal: HorizontalTextAlignment,
            vertical: VerticalTextAlignment,
        ) => fn_game_view_create_label(parent, name, width, height, x, y, fontSize, horizontal, vertical),
        loadSpriteFrameByPath: (path: string, sprite: any) => fn_game_view_load_sprite_frame_by_path(view, path, sprite),
        bindPress: (target: Node, onPress: () => void) => fn_game_view_bind_primary_down(view, target, onPress),
        isGmPopupOpen: () => view.gmPopupOpen,
        setGmPopupOpen: (value: boolean) => { view.gmPopupOpen = value; },
        onGmDrawCard: () => view.callbacks.onGmDrawCard(),
        onGmAddScore: () => view.callbacks.onGmAddScore(),
        onGmAddRottenCharge: () => view.callbacks.onGmAddRottenCharge(),
        onGmRestart: () => view.callbacks.onGmRestart(),
        style: { clamp, makeColor },
        hAlignCenter: HorizontalTextAlignment.CENTER,
        hAlignLeft: HorizontalTextAlignment.LEFT,
        vAlignCenter: VerticalTextAlignment.CENTER,
    });
}

export function fn_game_view_create_message_for_view(view: any): any {
    return fn_game_create_message_panel({
        root: view.root,
        makeNode: (name: string, width: number, height: number, x: number, y: number) => fn_game_view_make_node(name, width, height, x, y),
        createLabel: (
            parent: Node,
            name: string,
            width: number,
            height: number,
            x: number,
            y: number,
            fontSize: number,
            horizontal: HorizontalTextAlignment,
            vertical: VerticalTextAlignment,
        ) => fn_game_view_create_label(parent, name, width, height, x, y, fontSize, horizontal, vertical),
        style: { makeColor },
        hAlignLeft: HorizontalTextAlignment.LEFT,
        vAlignCenter: VerticalTextAlignment.CENTER,
    });
}

export function fn_game_view_create_hand_area_for_view(view: any): void {
    view.handPanel = fn_game_create_hand_panel({
        root: view.root,
        rootHeight: view.rootHeight,
        panelWidth: view.panelWidth,
        handPanelHeight: view.handPanelHeight,
        style: { clamp },
    });
    fn_game_view_ensure_hand_view_count_for_view(view, HAND_SIZE);
}

export function fn_game_view_ensure_hand_view_count_for_view(view: any, count: number): void {
    if (!view.handPanel) {
        return;
    }
    while (view.handViews.length < count) {
        const i = view.handViews.length;
        const handCardView = fn_game_create_hand_card_view({
            index: i,
            rootWidth: view.rootWidth,
            handCardWidth: view.handCardWidth,
            handCardHeight: view.handCardHeight,
            templateCols: CARD_TEMPLATE_COLS,
            templateRows: CARD_TEMPLATE_ROWS,
            makeNode: (name: string, width: number, height: number, x: number, y: number) => fn_game_view_make_node(name, width, height, x, y),
            makePanel: (name: string, width: number, height: number, x: number, y: number, color: any) => fn_game_view_make_panel(name, width, height, x, y, color),
            createLabel: (
                parent: Node,
                name: string,
                width: number,
                height: number,
                x: number,
                y: number,
                fontSize: number,
                horizontal: HorizontalTextAlignment,
                vertical: VerticalTextAlignment,
            ) => fn_game_view_create_label(parent, name, width, height, x, y, fontSize, horizontal, vertical),
            style: { clamp, makeColor },
            hAlignCenter: HorizontalTextAlignment.CENTER,
            vAlignCenter: VerticalTextAlignment.CENTER,
            vAlignTop: VerticalTextAlignment.TOP,
        });
        handCardView.node.on(Node.EventType.TOUCH_START, (event: EventTouch) => view.onHandCardTouchStart(i, event), view);
        handCardView.node.on(Node.EventType.MOUSE_DOWN, (event: EventMouse) => view.onHandCardMouseDown(i, event), view);
        handCardView.node.on(Node.EventType.MOUSE_ENTER, () => view.onHandCardMouseEnter(i), view);
        handCardView.node.on(Node.EventType.MOUSE_LEAVE, () => view.onHandCardMouseLeave(i), view);
        view.handPanel.addChild(handCardView.node);
        view.handViews.push(handCardView);
    }
}

export function fn_game_view_draw_board_for_view(view: any, state: any): void {
    fn_game_draw_board_panel({
        boardGraphics: view.boardGraphics,
        boardSize: view.boardSize,
        cellLabels: view.cellLabels,
        levelLabels: view.levelLabels,
        boardPlantViews: view.boardPlantViews,
        boardParcelViews: view.boardParcelViews,
        previewPlantViews: view.previewPlantViews,
        previewRotateTweenState: view.previewRotateTweenState,
        preplace2BoardDragging: view.preplace2BoardDragging,
        previewDropPulseState: view.previewDropPulseState,
        setPlantSpriteFit: (sprite: any, maxWidth: number, maxHeight: number, bottomY?: number) => fn_game_view_set_plant_sprite_fit(sprite, maxWidth, maxHeight, bottomY),
        loadSpriteFrameByPath: (path: string, sprite: any) => fn_game_view_load_sprite_frame_by_path(view, path, sprite),
        getPlantSpritePathByVariant: (variant: number | null) =>
            fn_game_view_get_plant_sprite_path_by_variant(GAME_PLANT_SPRITE_PATHS as unknown as string[], variant),
        tracePreviewRect: (graphics: any, x: number, y: number, width: number, height: number, pivotX: number, pivotY: number, angleRad: number) =>
            fn_game_trace_preview_rect(graphics, x, y, width, height, pivotX, pivotY, angleRad),
        rotatePointAroundPivot: (x: number, y: number, pivotX: number, pivotY: number, angleRad: number) =>
            fn_game_rotate_point_around_pivot(x, y, pivotX, pivotY, angleRad),
    }, state);
}
