import {
    Color,
    EventMouse,
    EventTouch,
    Graphics,
    HorizontalTextAlignment,
    Label,
    Layers,
    Node,
    Sprite,
    SpriteFrame,
    UITransform,
    Vec3,
    VerticalTextAlignment,
    resources,
} from 'cc';
import { ADAPTIVE_DESIGN_HEIGHT, ADAPTIVE_DESIGN_WIDTH } from '../../../core/adaptive/AdaptiveLayout';

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function makeColor(r: number, g: number, b: number, a = 255): Color {
    return new Color(r, g, b, a);
}

export function fn_game_view_make_node(
    name: string,
    width: number,
    height: number,
    x: number,
    y: number,
): Node {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    const transform = node.addComponent(UITransform);
    transform.setContentSize(width, height);
    node.setPosition(new Vec3(x, y, 0));
    return node;
}

export function fn_game_view_make_panel(
    name: string,
    width: number,
    height: number,
    x: number,
    y: number,
    color: Color,
): Node {
    const node = fn_game_view_make_node(name, width, height, x, y);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = color;
    graphics.roundRect(-width / 2, -height / 2, width, height, clamp(Math.min(width, height) * 0.08, 14, 18));
    graphics.fill();
    return node;
}

export function fn_game_view_create_label(
    parent: Node,
    name: string,
    width: number,
    height: number,
    x: number,
    y: number,
    fontSize: number,
    horizontal: HorizontalTextAlignment,
    vertical: VerticalTextAlignment,
): Label {
    const node = fn_game_view_make_node(name, width, height, x, y);
    const label = node.addComponent(Label);
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 8;
    label.horizontalAlign = horizontal;
    label.verticalAlign = vertical;
    label.color = makeColor(74, 60, 44, 255);
    parent.addChild(node);
    return label;
}

export function fn_game_view_bind_primary_down(view: any, target: Node, onPress: () => void): void {
    target.on(Node.EventType.MOUSE_DOWN, (event: EventMouse) => {
        if (event.getButton() !== EventMouse.BUTTON_LEFT) {
            return;
        }
        event.propagationStopped = true;
        onPress();
    }, view);
    target.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
        event.propagationStopped = true;
        onPress();
    }, view);
}

export function fn_game_view_create_background_for_view(view: any): void {
    const node = fn_game_view_make_node('Background', view.rootWidth, view.rootHeight, 0, 0);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = makeColor(250, 245, 232, 255);
    graphics.rect(-view.rootWidth / 2, -view.rootHeight / 2, view.rootWidth, view.rootHeight);
    graphics.fill();
    view.root.addChild(node);
}

export function fn_game_view_apply_plant_sprite_fit_from_node(sprite: Sprite): void {
    const fit = (sprite.node as Node & { __plantFit?: { width: number; height: number; bottomY?: number } }).__plantFit;
    const transform = sprite.node.getComponent(UITransform);
    if (!fit || !transform) {
        return;
    }
    const frame = sprite.spriteFrame;
    if (!frame) {
        transform.setContentSize(fit.width, fit.height);
        return;
    }
    const original = frame.originalSize;
    const ow = Math.max(original.width, 1);
    const oh = Math.max(original.height, 1);
    const scale = Math.min(fit.width / ow, fit.height / oh);
    const width = Math.max(1, ow * scale);
    const height = Math.max(1, oh * scale);
    transform.setContentSize(width, height);
    if (fit.bottomY !== undefined) {
        sprite.node.setPosition(0, fit.bottomY + height / 2, 0);
    }
}

export function fn_game_view_set_plant_sprite_fit(
    sprite: Sprite,
    maxWidth: number,
    maxHeight: number,
    bottomY?: number,
): void {
    (sprite.node as Node & { __plantFit?: { width: number; height: number; bottomY?: number } }).__plantFit = {
        width: maxWidth,
        height: maxHeight,
        bottomY,
    };
    fn_game_view_apply_plant_sprite_fit_from_node(sprite);
}

export function fn_game_view_get_plant_sprite_path_by_variant(paths: string[], variant: number | null): string {
    const safeIndex = Math.abs(variant ?? 0) % paths.length;
    return paths[safeIndex];
}

export function fn_game_view_load_sprite_frame_by_path(view: any, path: string, sprite: Sprite): void {
    const spriteNode = sprite.node as Node & { __spriteFramePath?: string };
    spriteNode.__spriteFramePath = path;
    const cached = view.spriteFrameCache.get(path);
    if (cached) {
        if (sprite.spriteFrame !== cached) {
            sprite.spriteFrame = cached;
        }
        fn_game_view_apply_plant_sprite_fit_from_node(sprite);
        return;
    }
    const waiters = view.spriteFrameWaiters.get(path);
    if (waiters) {
        waiters.add(sprite);
        return;
    }
    view.spriteFrameWaiters.set(path, new Set([sprite]));
    resources.load(path, SpriteFrame, (error: Error | null, asset: SpriteFrame | null) => {
        const pendingSprites = view.spriteFrameWaiters.get(path);
        view.spriteFrameWaiters.delete(path);
        if (error || !asset || !pendingSprites) {
            return;
        }
        view.spriteFrameCache.set(path, asset);
        pendingSprites.forEach((pendingSprite: Sprite) => {
            const pendingNode = pendingSprite.node as Node & { __spriteFramePath?: string };
            if (!pendingSprite.node?.isValid || pendingNode.__spriteFramePath !== path) {
                return;
            }
            pendingSprite.spriteFrame = asset;
            fn_game_view_apply_plant_sprite_fit_from_node(pendingSprite);
        });
    });
}

export function fn_game_view_get_time_wheel_display_size(view: any): number {
    return clamp((view.topPanelHeight - 28) * 1.12, 180, 228);
}

export function fn_game_view_get_max_hand_drag_lift(view: any): number {
    const defaultMax = clamp(view.handCardHeight * 0.75, 90, 150);
    if (!view.handPanel) {
        return defaultMax;
    }
    const boardBottom = view.boardCenterY - view.boardSize / 2;
    const handPanelTop = view.handPanel.position.y + view.handPanelHeight / 2;
    const visualReserve = view.handCardHeight * 0.5;
    const safeLift = boardBottom - handPanelTop - visualReserve;
    return clamp(Math.min(defaultMax, safeLift), 28, defaultMax);
}

export function fn_game_view_measure_layout_for_view(view: any, handSize: number): void {
    const rootTransform = view.root.getComponent(UITransform);
    const contentSize = rootTransform?.contentSize;

    view.rootWidth = Math.max(contentSize?.width ?? ADAPTIVE_DESIGN_WIDTH, 360);
    view.rootHeight = Math.max(contentSize?.height ?? ADAPTIVE_DESIGN_HEIGHT, 640);
    view.panelWidth = view.rootWidth - clamp(view.rootWidth * 0.035, 14, 24) * 2;
    view.topPanelHeight = clamp(view.rootHeight * 0.22, 250, 310);
    view.messagePanelHeight = 0;
    view.handPanelHeight = clamp(view.rootHeight * 0.2, 190, 250);

    const handGap = clamp(view.panelWidth * 0.025, 8, 14);
    view.handCardWidth = Math.min(180, (view.panelWidth - handGap * (handSize + 1)) / handSize);
    view.handCardHeight = clamp(view.handPanelHeight - 30, 150, 190);

    const topPadding = clamp(view.rootHeight * 0.02, 18, 32);
    const bottomPadding = clamp(view.rootHeight * 0.02, 18, 32);
    const sectionGap = clamp(view.rootHeight * 0.012, 12, 18);
    const occupiedHeight = topPadding + view.topPanelHeight + view.messagePanelHeight + view.handPanelHeight + bottomPadding + sectionGap * 2;
    const boardGapTop = clamp(view.rootHeight * 0.04, 28, 56);
    const boardGapBottom = clamp(view.rootHeight * 0.018, 12, 24);
    const availableBoardHeight = Math.max(view.rootHeight - occupiedHeight - boardGapTop - boardGapBottom, 220);
    const maxBoardByWidth = view.panelWidth;
    view.boardSize = clamp(Math.min(maxBoardByWidth, availableBoardHeight), 220, 860);
    const boardTopY = view.rootHeight / 2 - topPadding - view.topPanelHeight - sectionGap - boardGapTop;
    view.boardCenterY = boardTopY - view.boardSize / 2;
}
