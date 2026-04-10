import { Color, Graphics, Label, Layers, Node, Sprite, UITransform, Vec3 } from 'cc';

interface interface_game_hand_create_style {
    clamp: (value: number, min: number, max: number) => number;
}

interface interface_game_hand_create_config {
    root: Node;
    rootHeight: number;
    panelWidth: number;
    handPanelHeight: number;
    style: interface_game_hand_create_style;
}

export function fn_game_create_hand_panel(
    config: interface_game_hand_create_config,
): Node {
    const bottomPadding = config.style.clamp(config.rootHeight * 0.02, 18, 32);
    const y = -config.rootHeight / 2 + bottomPadding + config.handPanelHeight / 2;
    const node = new Node('HandPanel');
    node.layer = Layers.Enum.UI_2D;
    const transform = node.addComponent(UITransform);
    transform.setContentSize(config.panelWidth, config.handPanelHeight);
    node.setPosition(new Vec3(0, y, 0));
    config.root.addChild(node);
    return node;
}

export interface interface_game_hand_card_art_cell_view {
    node: Node;
    graphics: Graphics;
    sprite: Sprite;
}

export interface interface_game_hand_card_view {
    node: Node;
    graphics: Graphics;
    artRoot: Node;
    artCells: interface_game_hand_card_art_cell_view[];
    costLabel: Label;
    title: Label;
    descLabel: Label;
    typeLabel: Label;
}

interface interface_game_hand_card_style {
    clamp: (value: number, min: number, max: number) => number;
    makeColor: (r: number, g: number, b: number, a?: number) => Color;
}

interface interface_game_hand_card_create_config {
    index: number;
    rootWidth: number;
    handCardWidth: number;
    handCardHeight: number;
    templateCols: number;
    templateRows: number;
    makeNode: (name: string, width: number, height: number, x: number, y: number) => Node;
    makePanel: (name: string, width: number, height: number, x: number, y: number, color: Color) => Node;
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
    style: interface_game_hand_card_style;
    hAlignCenter: number;
    vAlignCenter: number;
    vAlignTop: number;
}

export function fn_game_create_hand_card_view(
    config: interface_game_hand_card_create_config,
): interface_game_hand_card_view {
    const i = config.index;
    const node = config.makePanel(
        `HandCard-${i}`,
        config.handCardWidth,
        config.handCardHeight,
        0,
        0,
        config.style.makeColor(245, 238, 215, 255),
    );
    const graphics = node.getComponent(Graphics)!;
    const artRoot = config.makeNode(`ArtRoot-${i}`, config.handCardWidth, config.handCardHeight, 0, 0);
    node.addChild(artRoot);
    artRoot.setSiblingIndex(0);
    const artCells: interface_game_hand_card_art_cell_view[] = [];
    for (let y = 0; y < config.templateRows; y++) {
        for (let x = 0; x < config.templateCols; x++) {
            const cellNode = config.makeNode(`ArtCell-${i}-${x}-${y}`, 10, 10, 0, 0);
            const cellGraphics = cellNode.addComponent(Graphics);
            const spriteNode = config.makeNode(`ArtPlant-${i}-${x}-${y}`, 10, 10, 0, 0);
            const sprite = spriteNode.addComponent(Sprite);
            sprite.sizeMode = Sprite.SizeMode.CUSTOM;
            cellNode.addChild(spriteNode);
            artRoot.addChild(cellNode);
            cellNode.active = false;
            artCells.push({
                node: cellNode,
                graphics: cellGraphics,
                sprite,
            });
        }
    }

    const costLabel = config.createLabel(
        node,
        `Cost-${i}`,
        44,
        44,
        -config.handCardWidth / 2 + 28,
        config.handCardHeight / 2 - 30,
        config.style.clamp(config.rootWidth * 0.032, 18, 22),
        config.hAlignCenter,
        config.vAlignCenter,
    );
    costLabel.string = '0';

    const title = config.createLabel(
        node,
        `Title-${i}`,
        config.handCardWidth - 24,
        30,
        0,
        config.handCardHeight * 0.08,
        config.style.clamp(config.rootWidth * 0.03, 17, 21),
        config.hAlignCenter,
        config.vAlignCenter,
    );

    const descLabel = config.createLabel(
        node,
        `Desc-${i}`,
        config.handCardWidth - 20,
        52,
        0,
        -config.handCardHeight * 0.22,
        config.style.clamp(config.rootWidth * 0.024, 13, 17),
        config.hAlignCenter,
        config.vAlignTop,
    );
    descLabel.overflow = Label.Overflow.CLAMP;

    const typeLabel = config.createLabel(
        node,
        `Type-${i}`,
        config.handCardWidth - 20,
        22,
        0,
        -config.handCardHeight / 2 + 18,
        config.style.clamp(config.rootWidth * 0.022, 12, 15),
        config.hAlignCenter,
        config.vAlignCenter,
    );

    return {
        node,
        graphics,
        artRoot,
        artCells,
        costLabel,
        title,
        descLabel,
        typeLabel,
    };
}
