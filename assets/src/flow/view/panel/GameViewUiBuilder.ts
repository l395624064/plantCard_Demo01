import {
    Color,
    Graphics,
    HorizontalTextAlignment,
    Layers,
    Node,
    Sprite,
    Tween,
    UITransform,
    Vec3,
    VerticalTextAlignment,
    tween,
} from 'cc';
import { BOARD_COLS, BOARD_ROWS } from '../../../GlobalConst';
import {
    fn_game_view_create_label,
    fn_game_view_make_node,
    fn_game_view_make_panel,
} from './GameViewBaseService';
import {
    fn_game_view_get_preplace_button_base_pos,
    fn_game_view_layout_preplace_buttons_for_view,
    fn_game_view_set_preplace_button_base_pos,
} from './GameViewInteractionController';
import { fn_game_preplace_cancel_flow_for_view } from './PreplacePanel';

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function makeColor(r: number, g: number, b: number, a = 255): Color {
    return new Color(r, g, b, a);
}

function fn_game_view_create_board_parcel_cell_view(parent: Node, name: string, col: number, row: number, view: any): any {
    const node = fn_game_view_make_node(name, 10, 10, 0, 0);
    const spriteNode = fn_game_view_make_node(`${name}-Sprite`, 10, 10, 0, 0);
    const sprite = spriteNode.addComponent(Sprite);
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    node.addChild(spriteNode);
    parent.addChild(node);
    return {
        node,
        sprite,
        row,
        col,
    };
}

function fn_game_view_create_board_plant_cell_view(parent: Node, name: string, col: number, row: number, preview: boolean, view: any): any {
    const node = fn_game_view_make_node(name, 10, 10, 0, 0);
    const graphics = node.addComponent(Graphics);
    const spriteNode = fn_game_view_make_node(`${name}-Sprite`, 10, 10, 0, 0);
    const sprite = spriteNode.addComponent(Sprite);
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    node.addChild(spriteNode);
    parent.addChild(node);
    node.active = false;
    return {
        node,
        graphics,
        sprite,
        row,
        col,
        preview,
    };
}

export function fn_game_view_create_board_for_view(view: any): Node {
    const board = fn_game_view_make_panel('Board', view.boardSize, view.boardSize, 0, view.boardCenterY, makeColor(248, 243, 224, 255));
    view.root.addChild(board);

    const cellSize = view.boardSize / BOARD_COLS;
    const parcelLayer = fn_game_view_make_node('BoardParcelLayer', view.boardSize, view.boardSize, 0, 0);
    board.addChild(parcelLayer);
    for (let y = 0; y < BOARD_ROWS; y++) {
        for (let x = 0; x < BOARD_COLS; x++) {
            view.boardParcelViews.push(fn_game_view_create_board_parcel_cell_view(parcelLayer, `BoardParcel-${x}-${y}`, x, y, view));
        }
    }
    const plantLayer = fn_game_view_make_node('BoardPlantLayer', view.boardSize, view.boardSize, 0, 0);
    board.addChild(plantLayer);
    for (let y = 0; y < BOARD_ROWS; y++) {
        for (let x = 0; x < BOARD_COLS; x++) {
            view.boardPlantViews.push(fn_game_view_create_board_plant_cell_view(plantLayer, `BoardPlant-${x}-${y}`, x, y, false, view));
        }
    }
    for (let i = 0; i < 8; i++) {
        view.previewPlantViews.push(fn_game_view_create_board_plant_cell_view(plantLayer, `PreviewPlant-${i}`, 0, 0, true, view));
    }
    const overlayNode = fn_game_view_make_node('BoardOverlay', view.boardSize, view.boardSize, 0, 0);
    overlayNode.addComponent(Graphics);
    board.addChild(overlayNode);
    for (let y = 0; y < BOARD_ROWS; y++) {
        const row: any[] = [];
        const levelRow: any[] = [];
        for (let x = 0; x < BOARD_COLS; x++) {
            const label = fn_game_view_create_label(
                board,
                `CellLabel-${x}-${y}`,
                cellSize,
                cellSize,
                -view.boardSize / 2 + cellSize * (x + 0.5),
                view.boardSize / 2 - cellSize * (y + 0.5),
                20,
                HorizontalTextAlignment.CENTER,
                VerticalTextAlignment.CENTER,
            );
            row.push(label);

            const levelLabel = fn_game_view_create_label(
                board,
                `CellLevel-${x}-${y}`,
                cellSize,
                22,
                -view.boardSize / 2 + cellSize * (x + 0.5),
                view.boardSize / 2 - cellSize * y - cellSize * 0.835,
                13,
                HorizontalTextAlignment.CENTER,
                VerticalTextAlignment.CENTER,
            );
            levelLabel.color = makeColor(246, 238, 221, 255);
            levelRow.push(levelLabel);
        }
        view.cellLabels.push(row);
        view.levelLabels.push(levelRow);
    }

    return board;
}

function fn_game_view_create_preplace_button(parent: Node, title: string, x: number, y: number, width: number, onClick: () => void, view: any): void {
    const h = 44;
    const fillColor = title === '放置'
        ? makeColor(214, 242, 198, 255)
        : title === '取消'
            ? makeColor(250, 216, 201, 255)
            : makeColor(244, 226, 166, 255);
    const strokeColor = title === '放置'
        ? makeColor(76, 138, 64, 255)
        : title === '取消'
            ? makeColor(176, 91, 72, 255)
            : makeColor(160, 120, 50, 255);
    const node = fn_game_view_make_panel(`Pb-${title}`, width, h, x, y, fillColor);
    const graphics = node.getComponent(Graphics)!;
    graphics.lineWidth = 2;
    graphics.strokeColor = strokeColor;
    graphics.roundRect(-width / 2, -h / 2, width, h, 10);
    graphics.stroke();
    const label = fn_game_view_create_label(
        node,
        `PbL-${title}`,
        width - 8,
        h - 6,
        0,
        0,
        18,
        HorizontalTextAlignment.CENTER,
        VerticalTextAlignment.CENTER,
    );
    label.string = title;
    label.color = strokeColor;

    const hoverScale = 1.06;
    const pressScale = 0.95;
    const hoverLift = 4;
    const applyButtonVisual = (scale: number, liftY: number): void => {
        const basePos = fn_game_view_get_preplace_button_base_pos(node);
        Tween.stopAllByTarget(node);
        tween(node)
            .to(0.08, { scale: new Vec3(scale, scale, 1), position: new Vec3(basePos.x, basePos.y + liftY, 0) }, { easing: 'quadOut' })
            .start();
    };
    const triggerOnce = (): void => {
        const now = Date.now();
        if (view.lastPreplaceButtonTitle === title && now - view.lastPreplaceButtonAt < 80) {
            return;
        }
        view.lastPreplaceButtonTitle = title;
        view.lastPreplaceButtonAt = now;
        view.preplaceBoardInputSuppressUntil = now + 180;
        onClick();
    };

    node.on(Node.EventType.MOUSE_ENTER, () => applyButtonVisual(hoverScale, hoverLift), view);
    node.on(Node.EventType.MOUSE_LEAVE, () => applyButtonVisual(1, 0), view);
    node.on(Node.EventType.MOUSE_DOWN, (event: EventMouse) => {
        if (event.getButton() !== EventMouse.BUTTON_LEFT) {
            return;
        }
        event.propagationStopped = true;
        applyButtonVisual(pressScale, 1);
        triggerOnce();
    }, view);
    node.on(Node.EventType.MOUSE_UP, () => applyButtonVisual(hoverScale, hoverLift), view);
    node.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
        event.propagationStopped = true;
        applyButtonVisual(pressScale, 1);
        triggerOnce();
    }, view);
    node.on(Node.EventType.TOUCH_END, () => applyButtonVisual(1, 0), view);
    node.on(Node.EventType.TOUCH_CANCEL, () => applyButtonVisual(1, 0), view);
    fn_game_view_set_preplace_button_base_pos(node, x, y);
    view.preplaceButtons.push({ title, node });
    parent.addChild(node);
}

export function fn_game_view_create_drag_arrow_only_for_view(view: any): void {
    const arrowNode = new Node('DragArrow');
    arrowNode.layer = Layers.Enum.UI_2D;
    const arrowTransform = arrowNode.addComponent(UITransform);
    arrowTransform.setContentSize(view.rootWidth, view.rootHeight);
    arrowNode.setPosition(Vec3.ZERO);
    view.dragArrow = arrowNode.addComponent(Graphics);
    arrowNode.active = false;
    view.root.addChild(arrowNode);
}

export function fn_game_view_create_preplace_bar_for_view(view: any): void {
    const bar = new Node('PreplaceBar');
    bar.layer = Layers.Enum.UI_2D;
    bar.addComponent(UITransform).setContentSize(250, 126);
    bar.setPosition(Vec3.ZERO);
    bar.active = false;

    const bw = 74;
    const bh = 42;
    const sideOffset = 88;
    const stackGap = 6;
    const groupLift = 12;
    const upperY = groupLift + bh / 2 + stackGap / 2;
    const lowerY = groupLift - bh / 2 - stackGap / 2;

    fn_game_view_create_preplace_button(bar, '旋转', -sideOffset, groupLift, bw, () => view.callbacks.onRotateRight(), view);
    fn_game_view_create_preplace_button(bar, '放置', sideOffset, upperY, bw, () => view.callbacks.onPreplaceConfirmPlace(), view);
    fn_game_view_create_preplace_button(bar, '取消', sideOffset, lowerY, bw, () => fn_game_preplace_cancel_flow_for_view(view, true), view);
    fn_game_view_layout_preplace_buttons_for_view(view, false);

    view.root.addChild(bar);
    view.preplaceBar = bar;
}
