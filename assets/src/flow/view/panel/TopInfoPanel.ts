import { Color, Graphics, Label, Node, Sprite, UITransform } from 'cc';
import { GameViewState } from '../../../view/ViewStateTypes';

export interface interface_game_topInfo_view {
    progressGraphics: Graphics;
    progressLabel: Label;
    statsLabel: Label;
    reserveGraphics: Graphics;
    reserveLabel: Label;
    timeWheelOuterNode: Node;
    timeWheelInnerNode: Node;
    timeWheelCenterNode: Node;
    timeWheelPointerNode: Node;
    timeWheelYearLabel: Label;
    timeWheelSeasonLabel: Label;
    gmButton: Node;
    gmPopup: Node;
}

interface interface_game_topInfo_create_style {
    clamp: (value: number, min: number, max: number) => number;
    makeColor: (r: number, g: number, b: number, a?: number) => Color;
}

interface interface_game_topInfo_style {
    clamp: (value: number, min: number, max: number) => number;
    makeColor: (r: number, g: number, b: number, a?: number) => Color;
    rotationToText: (rotation: number) => string;
}

interface interface_game_topInfo_create_config {
    root: Node;
    rootWidth: number;
    rootHeight: number;
    panelWidth: number;
    topPanelHeight: number;
    getTimeWheelDisplaySize: () => number;
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
    loadSpriteFrameByPath: (path: string, sprite: Sprite) => void;
    bindPress: (target: Node, onPress: () => void) => void;
    isGmPopupOpen: () => boolean;
    setGmPopupOpen: (value: boolean) => void;
    onGmDrawCard: () => void;
    onGmAddScore: () => void;
    onGmAddRottenCharge: () => void;
    onGmRestart: () => void;
    style: interface_game_topInfo_create_style;
    hAlignCenter: number;
    hAlignLeft: number;
    vAlignCenter: number;
}

const GAME_TOPINFO_TIME_WHEEL_SPRITE_PATHS = {
    outer: 'ui/timewheel/zhuanpan_waiquan/spriteFrame',
    inner: 'ui/timewheel/zhuanpan_neiquan/spriteFrame',
    center: 'ui/timewheel/zhuanpan_zhongxin/spriteFrame',
    pointer: 'ui/timewheel/jiantou_icon/spriteFrame',
} as const;

function fn_game_create_gmPopup_button(
    parent: Node,
    title: string,
    y: number,
    fillColor: Color,
    strokeColor: Color,
    onClick: () => void,
    config: interface_game_topInfo_create_config,
): void {
    const button = config.makePanel(`GmPopupButton-${title}`, 108, 32, 0, y, fillColor);
    const graphics = button.getComponent(Graphics)!;
    graphics.lineWidth = 2;
    graphics.strokeColor = strokeColor;
    graphics.roundRect(-54, -16, 108, 32, 10);
    graphics.stroke();
    const label = config.createLabel(
        button,
        `GmPopupButtonLabel-${title}`,
        96,
        22,
        0,
        0,
        14,
        config.hAlignCenter,
        config.vAlignCenter,
    );
    label.string = title;
    label.color = strokeColor;
    config.bindPress(button, onClick);
    parent.addChild(button);
}

export function fn_game_create_topInfo_panel(
    config: interface_game_topInfo_create_config,
): interface_game_topInfo_view {
    const topPadding = config.style.clamp(config.rootHeight * 0.02, 18, 32);
    const y = config.rootHeight / 2 - topPadding - config.topPanelHeight / 2;
    const panel = config.makePanel(
        'TopPanel',
        config.panelWidth,
        config.topPanelHeight,
        0,
        y,
        config.style.makeColor(255, 255, 255, 210),
    );
    config.root.addChild(panel);

    const panelLeft = -config.panelWidth / 2;
    const panelRight = config.panelWidth / 2;
    const wheelSize = config.getTimeWheelDisplaySize();
    const progressY = config.topPanelHeight / 2 - 28;
    const wheelX = panelLeft + 8 + wheelSize / 2;
    const wheelY = progressY + 13 - wheelSize / 2;

    const timeWheelNode = config.makeNode('TimeWheel', wheelSize, wheelSize, wheelX, wheelY);
    panel.addChild(timeWheelNode);

    const timeWheelOuterNode = config.makeNode('TimeWheelOuter', wheelSize, wheelSize, 0, 0);
    const timeWheelOuterSprite = timeWheelOuterNode.addComponent(Sprite);
    timeWheelOuterSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    timeWheelNode.addChild(timeWheelOuterNode);

    const timeWheelInnerNode = config.makeNode('TimeWheelInner', wheelSize * 0.79, wheelSize * 0.79, 0, 0);
    const timeWheelInnerSprite = timeWheelInnerNode.addComponent(Sprite);
    timeWheelInnerSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    timeWheelNode.addChild(timeWheelInnerNode);

    const timeWheelCenterNode = config.makeNode('TimeWheelCenter', wheelSize * 0.42, wheelSize * 0.42, 0, 0);
    const timeWheelCenterSprite = timeWheelCenterNode.addComponent(Sprite);
    timeWheelCenterSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    timeWheelNode.addChild(timeWheelCenterNode);

    const timeWheelPointerNode = config.makeNode('TimeWheelPointer', wheelSize * 0.11, wheelSize * 0.075, 0, wheelSize * 0.35);
    const timeWheelPointerSprite = timeWheelPointerNode.addComponent(Sprite);
    timeWheelPointerSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    timeWheelNode.addChild(timeWheelPointerNode);

    const wheelCenterSize = wheelSize * 0.34;
    const timeWheelYearLabel = config.createLabel(
        timeWheelCenterNode,
        'TimeWheelYearLabel',
        wheelCenterSize * 1.55,
        32,
        0,
        18,
        config.style.clamp(config.rootWidth * 0.032, 20, 28),
        config.hAlignCenter,
        config.vAlignCenter,
    );
    timeWheelYearLabel.color = config.style.makeColor(112, 78, 52, 255);
    const timeWheelSeasonLabel = config.createLabel(
        timeWheelCenterNode,
        'TimeWheelSeasonLabel',
        wheelCenterSize * 1.2,
        38,
        0,
        -20,
        config.style.clamp(config.rootWidth * 0.05, 28, 40),
        config.hAlignCenter,
        config.vAlignCenter,
    );
    timeWheelSeasonLabel.color = config.style.makeColor(112, 78, 52, 255);

    config.loadSpriteFrameByPath(GAME_TOPINFO_TIME_WHEEL_SPRITE_PATHS.outer, timeWheelOuterSprite);
    config.loadSpriteFrameByPath(GAME_TOPINFO_TIME_WHEEL_SPRITE_PATHS.inner, timeWheelInnerSprite);
    config.loadSpriteFrameByPath(GAME_TOPINFO_TIME_WHEEL_SPRITE_PATHS.center, timeWheelCenterSprite);
    config.loadSpriteFrameByPath(GAME_TOPINFO_TIME_WHEEL_SPRITE_PATHS.pointer, timeWheelPointerSprite);

    const contentLeft = wheelX + wheelSize / 2 + 22;
    const contentRight = panelRight - 16;
    const contentWidth = contentRight - contentLeft;
    const gmWidth = 68;
    const gmX = contentRight - gmWidth / 2;
    const progressWidth = Math.max(160, contentWidth - gmWidth - 18);
    const progressCenterX = contentLeft + progressWidth / 2;

    const progressNode = config.makeNode('ScoreProgress', progressWidth, 26, progressCenterX, progressY);
    const progressGraphics = progressNode.addComponent(Graphics);
    panel.addChild(progressNode);

    const progressLabel = config.createLabel(
        panel,
        'ScoreProgressLabel',
        progressWidth - 18,
        26,
        progressCenterX,
        progressY,
        config.style.clamp(config.rootWidth * 0.026, 15, 18),
        config.hAlignCenter,
        config.vAlignCenter,
    );
    progressLabel.color = config.style.makeColor(92, 70, 36, 255);

    const lowerTop = progressY - 18;
    const lowerHeight = config.topPanelHeight - 58;
    const statsWidth = Math.max(110, contentWidth * 0.28);
    const reserveWidth = Math.max(140, contentWidth - statsWidth - 16);
    const statsX = contentLeft + statsWidth / 2;
    const reserveX = contentLeft + statsWidth + 16 + reserveWidth / 2;
    const lowerCenterY = lowerTop - lowerHeight / 2;

    const statsLabel = config.createLabel(
        panel,
        'InfoStatsLabel',
        statsWidth,
        lowerHeight,
        statsX,
        lowerCenterY,
        config.style.clamp(config.rootWidth * 0.028, 16, 20),
        config.hAlignLeft,
        config.vAlignCenter,
    );

    const reserveLabel = config.createLabel(
        panel,
        'ReserveLabel',
        reserveWidth - 18,
        lowerHeight - 12,
        reserveX,
        lowerCenterY,
        config.style.clamp(config.rootWidth * 0.024, 13, 16),
        config.hAlignLeft,
        config.vAlignCenter,
    );
    reserveLabel.color = config.style.makeColor(132, 118, 96, 255);

    const reserveNode = config.makeNode('ReservePanel', reserveWidth, lowerHeight, reserveX, lowerCenterY);
    const reserveGraphics = reserveNode.addComponent(Graphics);
    panel.addChild(reserveNode);
    reserveNode.setSiblingIndex(panel.children.length - 2);

    const gmButton = config.makePanel(
        'GmButton',
        gmWidth,
        30,
        gmX,
        progressY,
        config.style.makeColor(229, 235, 248, 255),
    );
    const gmButtonGraphics = gmButton.getComponent(Graphics)!;
    gmButtonGraphics.lineWidth = 2;
    gmButtonGraphics.strokeColor = config.style.makeColor(84, 104, 148, 255);
    gmButtonGraphics.roundRect(-34, -15, 68, 30, 10);
    gmButtonGraphics.stroke();
    const gmLabel = config.createLabel(
        gmButton,
        'GmButtonLabel',
        60,
        24,
        0,
        0,
        16,
        config.hAlignCenter,
        config.vAlignCenter,
    );
    gmLabel.string = 'GM';
    gmLabel.color = config.style.makeColor(84, 104, 148, 255);
    panel.addChild(gmButton);

    const gmPopup = config.makeNode('GmPopup', 156, 198, gmX - 10, lowerCenterY);
    const gmPopupGraphics = gmPopup.addComponent(Graphics);
    gmPopupGraphics.fillColor = config.style.makeColor(255, 252, 244, 255);
    gmPopupGraphics.roundRect(-78, -99, 156, 198, 12);
    gmPopupGraphics.fill();
    gmPopupGraphics.lineWidth = 2;
    gmPopupGraphics.strokeColor = config.style.makeColor(171, 141, 96, 255);
    gmPopupGraphics.roundRect(-78, -99, 156, 198, 12);
    gmPopupGraphics.stroke();
    gmPopup.active = false;
    panel.addChild(gmPopup);

    const gmPopupTitle = config.createLabel(
        gmPopup,
        'GmPopupTitle',
        130,
        22,
        0,
        72,
        15,
        config.hAlignCenter,
        config.vAlignCenter,
    );
    gmPopupTitle.string = 'GM 工具栏';

    config.bindPress(gmButton, () => {
        const nextOpen = !config.isGmPopupOpen();
        config.setGmPopupOpen(nextOpen);
        gmPopup.active = nextOpen;
    });
    fn_game_create_gmPopup_button(
        gmPopup,
        '抽牌',
        34,
        config.style.makeColor(214, 242, 198, 255),
        config.style.makeColor(76, 138, 64, 255),
        () => {
            config.onGmDrawCard();
            config.setGmPopupOpen(false);
            gmPopup.active = false;
        },
        config,
    );
    fn_game_create_gmPopup_button(
        gmPopup,
        '+3 分',
        -8,
        config.style.makeColor(234, 229, 249, 255),
        config.style.makeColor(101, 87, 155, 255),
        () => {
            config.onGmAddScore();
            config.setGmPopupOpen(false);
            gmPopup.active = false;
        },
        config,
    );
    fn_game_create_gmPopup_button(
        gmPopup,
        '+1 烂果',
        -50,
        config.style.makeColor(250, 228, 199, 255),
        config.style.makeColor(170, 112, 44, 255),
        () => {
            config.onGmAddRottenCharge();
            config.setGmPopupOpen(false);
            gmPopup.active = false;
        },
        config,
    );
    fn_game_create_gmPopup_button(
        gmPopup,
        '重开',
        -92,
        config.style.makeColor(244, 230, 230, 255),
        config.style.makeColor(160, 88, 88, 255),
        () => {
            config.onGmRestart();
            config.setGmPopupOpen(false);
            gmPopup.active = false;
        },
        config,
    );

    return {
        progressGraphics,
        progressLabel,
        statsLabel,
        reserveGraphics,
        reserveLabel,
        timeWheelOuterNode,
        timeWheelInnerNode,
        timeWheelCenterNode,
        timeWheelPointerNode,
        timeWheelYearLabel,
        timeWheelSeasonLabel,
        gmButton,
        gmPopup,
    };
}

export function fn_game_sync_topInfo_timeWheel(
    view: interface_game_topInfo_view,
    yearIndex: number,
    seasonIndex: number,
    yearLabels: readonly string[],
    seasonLabels: readonly string[],
): void {
    view.timeWheelOuterNode.setRotationFromEuler(0, 0, 0);
    view.timeWheelInnerNode.setRotationFromEuler(0, 0, 0);
    view.timeWheelCenterNode.setRotationFromEuler(0, 0, 0);
    view.timeWheelPointerNode.setRotationFromEuler(0, 0, 0);
    view.timeWheelYearLabel.string = yearLabels[yearIndex] ?? yearLabels[0] ?? '';
    view.timeWheelSeasonLabel.string = seasonLabels[seasonIndex] ?? seasonLabels[0] ?? '';
}

export function fn_game_render_topInfo_panel(
    view: interface_game_topInfo_view,
    state: GameViewState,
    gmPopupOpen: boolean,
    yearIndex: number,
    seasonIndex: number,
    yearLabels: readonly string[],
    seasonLabels: readonly string[],
    style: interface_game_topInfo_style,
): void {
    const {
        progressGraphics,
        progressLabel,
        statsLabel,
        reserveGraphics,
        reserveLabel,
        gmPopup,
    } = view;

    const progressTransform = progressGraphics.node.getComponent(UITransform)!;
    const width = progressTransform.contentSize.width;
    const height = 24;
    const radius = 12;
    const progress = state.targetScore <= 0 ? 0 : style.clamp(state.score / state.targetScore, 0, 1);
    const segments = Math.max(6, Math.min(10, Math.ceil(state.targetScore / 2)));
    const gap = 4;
    const innerW = width - 10;
    const segmentW = (innerW - gap * (segments - 1)) / segments;
    const fillW = innerW * progress;

    progressGraphics.clear();
    progressGraphics.fillColor = style.makeColor(242, 234, 214, 255);
    progressGraphics.roundRect(-width / 2, -height / 2, width, height, radius);
    progressGraphics.fill();

    let segmentX = -innerW / 2;
    for (let i = 0; i < segments; i++) {
        const filled = style.clamp(fillW - i * (segmentW + gap), 0, segmentW);
        progressGraphics.fillColor = style.makeColor(227, 214, 182, 255);
        progressGraphics.roundRect(segmentX, -height / 2 + 5, segmentW, height - 10, 6);
        progressGraphics.fill();
        if (filled > 0) {
            progressGraphics.fillColor = style.makeColor(112, 190, 88, 255);
            progressGraphics.roundRect(segmentX, -height / 2 + 5, filled, height - 10, 6);
            progressGraphics.fill();
        }
        segmentX += segmentW + gap;
    }

    fn_game_sync_topInfo_timeWheel(view, yearIndex, seasonIndex, yearLabels, seasonLabels);

    progressLabel.string = `分数 ${state.score} / ${state.targetScore}`;
    statsLabel.string = [
        `牌库: ${state.deckCount < 0 ? '∞' : state.deckCount}`,
        `烂水果: ${state.remainingRotten}`,
    ].join('\n');

    const reserveTransform = reserveGraphics.node.getComponent(UITransform)!;
    const reserveWidth = reserveTransform.contentSize.width;
    const reserveHeight = reserveTransform.contentSize.height;
    reserveGraphics.clear();
    reserveGraphics.fillColor = style.makeColor(248, 244, 232, 255);
    reserveGraphics.roundRect(-reserveWidth / 2, -reserveHeight / 2, reserveWidth, reserveHeight, 14);
    reserveGraphics.fill();
    reserveGraphics.lineWidth = 2;
    reserveGraphics.strokeColor = style.makeColor(214, 202, 176, 255);
    reserveGraphics.roundRect(-reserveWidth / 2, -reserveHeight / 2, reserveWidth, reserveHeight, 14);
    reserveGraphics.stroke();

    const slotW = reserveWidth * 0.28;
    const slotH = 24;
    const slotGap = 8;
    const slotY = reserveHeight / 2 - slotH - 14;
    for (let i = 0; i < 2; i++) {
        const slotX = -slotW - slotGap / 2 + i * (slotW + slotGap);
        reserveGraphics.fillColor = style.makeColor(236, 230, 214, 255);
        reserveGraphics.roundRect(slotX, slotY, slotW, slotH, 10);
        reserveGraphics.fill();
    }
    reserveLabel.string = [
        'Buff / Debuff 预留',
        '时间轮盘右侧保留扩展空间',
        state.preplaceLocked ? `状态2：${style.rotationToText(state.rotation)}` : '等待后续状态记录',
    ].join('\n');
    gmPopup.active = gmPopupOpen;
}
