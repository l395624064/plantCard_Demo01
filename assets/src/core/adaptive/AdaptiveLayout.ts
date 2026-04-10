import { Canvas, Color, Graphics, Layers, Mask, Node, UITransform, Vec3 } from 'cc';

export const ADAPTIVE_DESIGN_WIDTH = 720;
export const ADAPTIVE_DESIGN_HEIGHT = 1280;
const SAFE_FRAME_PADDING = 14;
const SAFE_FRAME_RADIUS = 26;
const SAFE_CONTENT_MARGIN_X = 28;
const SAFE_CONTENT_MARGIN_Y = 40;

export interface interface_game_main_root_build_result {
    contentRoot: Node;
    width: number;
    height: number;
}

export function fn_game_main_configure_canvas_adaptation(node: Node): void {
    const canvas = node.getComponent(Canvas);
    if (!canvas) {
        return;
    }
    const adaptCanvas = canvas as Canvas & { fitWidth?: boolean; fitHeight?: boolean };
    adaptCanvas.fitWidth = true;
    adaptCanvas.fitHeight = false;
}

export function fn_game_main_ensure_ui_root(node: Node): interface_game_main_root_build_result {
    const safeContentWidth = ADAPTIVE_DESIGN_WIDTH - SAFE_CONTENT_MARGIN_X * 2;
    const safeContentHeight = ADAPTIVE_DESIGN_HEIGHT - SAFE_CONTENT_MARGIN_Y * 2;
    const canvasTransform = node.getComponent(UITransform);
    if (!canvasTransform) {
        const fallbackRoot = new Node('DemoContent');
        fallbackRoot.layer = Layers.Enum.UI_2D;
        fallbackRoot.addComponent(UITransform).setContentSize(safeContentWidth, safeContentHeight);
        return {
            contentRoot: fallbackRoot,
            width: safeContentWidth,
            height: safeContentHeight,
        };
    }

    let shell = node.getChildByName('DemoRoot');
    if (!shell) {
        shell = new Node('DemoRoot');
        shell.layer = Layers.Enum.UI_2D;
        shell.addComponent(UITransform);
        node.addChild(shell);
    }

    const shellTransform = shell.getComponent(UITransform)!;
    shellTransform.setContentSize(canvasTransform.contentSize);

    let shellBackground = shell.getChildByName('ViewportBackground');
    if (!shellBackground) {
        shellBackground = new Node('ViewportBackground');
        shellBackground.layer = Layers.Enum.UI_2D;
        shellBackground.addComponent(UITransform);
        shellBackground.addComponent(Graphics);
        shell.addChild(shellBackground);
    }
    shellBackground.setPosition(Vec3.ZERO);
    const shellBgTransform = shellBackground.getComponent(UITransform)!;
    shellBgTransform.setContentSize(canvasTransform.contentSize);
    const shellBgGraphics = shellBackground.getComponent(Graphics)!;
    shellBgGraphics.clear();
    shellBgGraphics.fillColor = new Color(250, 245, 232, 255);
    shellBgGraphics.rect(
        -canvasTransform.contentSize.width / 2,
        -canvasTransform.contentSize.height / 2,
        canvasTransform.contentSize.width,
        canvasTransform.contentSize.height,
    );
    shellBgGraphics.fill();

    const scale = Math.min(
        canvasTransform.contentSize.width / ADAPTIVE_DESIGN_WIDTH,
        canvasTransform.contentSize.height / ADAPTIVE_DESIGN_HEIGHT,
    );

    let safeArea = shell.getChildByName('DemoSafeArea');
    if (!safeArea) {
        safeArea = new Node('DemoSafeArea');
        safeArea.layer = Layers.Enum.UI_2D;
        safeArea.addComponent(UITransform).setContentSize(ADAPTIVE_DESIGN_WIDTH, ADAPTIVE_DESIGN_HEIGHT);
        shell.addChild(safeArea);
    }
    safeArea.setPosition(Vec3.ZERO);
    safeArea.setScale(scale, scale, 1);
    safeArea.getComponent(UITransform)?.setContentSize(ADAPTIVE_DESIGN_WIDTH, ADAPTIVE_DESIGN_HEIGHT);

    let contentRoot = safeArea.getChildByName('DemoContent');
    if (!contentRoot) {
        contentRoot = new Node('DemoContent');
        contentRoot.layer = Layers.Enum.UI_2D;
        contentRoot.addComponent(UITransform);
        contentRoot.addComponent(Graphics);
        const mask = contentRoot.addComponent(Mask);
        mask.type = Mask.Type.GRAPHICS_RECT;
        safeArea.addChild(contentRoot);
    }
    contentRoot.setPosition(Vec3.ZERO);
    contentRoot.getComponent(UITransform)?.setContentSize(safeContentWidth, safeContentHeight);
    const contentGraphics = contentRoot.getComponent(Graphics)!;
    contentGraphics.clear();
    contentGraphics.fillColor = new Color(255, 255, 255, 255);
    contentGraphics.rect(
        -safeContentWidth / 2,
        -safeContentHeight / 2,
        safeContentWidth,
        safeContentHeight,
    );
    contentGraphics.fill();

    let safeFrame = shell.getChildByName('DemoSafeFrame');
    if (!safeFrame) {
        safeFrame = new Node('DemoSafeFrame');
        safeFrame.layer = Layers.Enum.UI_2D;
        safeFrame.addComponent(UITransform).setContentSize(ADAPTIVE_DESIGN_WIDTH, ADAPTIVE_DESIGN_HEIGHT);
        safeFrame.addComponent(Graphics);
        shell.addChild(safeFrame);
    }
    safeFrame.setPosition(Vec3.ZERO);
    safeFrame.setScale(scale, scale, 1);
    const safeFrameGraphics = safeFrame.getComponent(Graphics)!;
    safeFrameGraphics.clear();
    safeFrameGraphics.lineWidth = 4;
    safeFrameGraphics.strokeColor = new Color(160, 146, 112, 220);
    safeFrameGraphics.roundRect(
        -ADAPTIVE_DESIGN_WIDTH / 2 + SAFE_FRAME_PADDING,
        -ADAPTIVE_DESIGN_HEIGHT / 2 + SAFE_FRAME_PADDING,
        ADAPTIVE_DESIGN_WIDTH - SAFE_FRAME_PADDING * 2,
        ADAPTIVE_DESIGN_HEIGHT - SAFE_FRAME_PADDING * 2,
        SAFE_FRAME_RADIUS,
    );
    safeFrameGraphics.stroke();

    return {
        contentRoot,
        width: canvasTransform.contentSize.width,
        height: canvasTransform.contentSize.height,
    };
}
