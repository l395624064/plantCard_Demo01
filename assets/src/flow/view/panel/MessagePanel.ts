import { Color, Label, Node } from 'cc';

export interface interface_game_message_view {
    panel: Node;
    label: Label;
}

interface interface_game_message_create_style {
    makeColor: (r: number, g: number, b: number, a?: number) => Color;
}

interface interface_game_message_create_config {
    root: Node;
    makeNode: (name: string, width: number, height: number, x: number, y: number) => Node;
    createLabel: (
        parent: Node,
        name: string,
        width: number,
        height: number,
        x: number,
        y: number,
        fontSize: number,
        horizontalAlign: number,
        verticalAlign: number,
    ) => Label;
    style: interface_game_message_create_style;
    hAlignLeft: number;
    vAlignCenter: number;
}

export function fn_game_create_message_panel(
    config: interface_game_message_create_config,
): interface_game_message_view {
    const panel = config.makeNode('MessagePanel', 1, 1, 0, 0);
    panel.active = false;
    config.root.addChild(panel);
    const label = config.createLabel(
        panel,
        'MessageLabel',
        1,
        1,
        0,
        0,
        1,
        config.hAlignLeft,
        config.vAlignCenter,
    );
    label.color = config.style.makeColor(78, 63, 43, 255);
    return {
        panel,
        label,
    };
}

export function fn_game_render_message_panel(
    view: interface_game_message_view,
    message: string,
): void {
    view.label.string = message;
}
