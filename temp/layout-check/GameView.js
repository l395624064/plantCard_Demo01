"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameView = void 0;
const cc_1 = require("cc");
const GameTypes_1 = require("./GameTypes");
function makeColor(r, g, b, a = 255) {
    return new cc_1.Color(r, g, b, a);
}
function fruitColor(color, alpha = 255) {
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
function rotationToText(rotation) {
    return `${rotation * 90}°`;
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
class GameView {
    constructor(root, callbacks) {
        this.rootWidth = 720;
        this.rootHeight = 1280;
        this.panelWidth = 680;
        this.boardSize = 620;
        this.boardCenterY = 40;
        this.topPanelHeight = 150;
        this.messagePanelHeight = 70;
        this.controlsHeight = 110;
        this.handPanelHeight = 220;
        this.handCardWidth = 180;
        this.handCardHeight = 180;
        this.cellLabels = [];
        this.handViews = [];
        this.root = root;
        this.callbacks = callbacks;
        this.root.removeAllChildren();
        this.measureLayout();
        this.createBackground();
        this.infoLabel = this.createTopInfo();
        this.messageLabel = this.createMessage();
        this.boardNode = this.createBoard();
        this.boardGraphics = this.boardNode.getComponent(cc_1.Graphics);
        this.rotationLabel = this.createControls();
        this.createHandArea();
    }
    render(state) {
        this.infoLabel.string = [
            `关卡: Demo`,
            `分数: ${state.score} / ${state.targetScore}`,
            `牌库: ${state.deckCount}`,
            `烂水果: ${state.remainingRotten}`,
            `旋转: ${rotationToText(state.rotation)}`,
        ].join('\n');
        const statusText = state.status === 'playing'
            ? state.preview
                ? state.preview.reason
                : state.message
            : `${state.message}`;
        this.messageLabel.string = statusText;
        this.rotationLabel.string = `当前朝向 ${rotationToText(state.rotation)}`;
        this.drawBoard(state);
        this.renderHand(state.handSlots);
    }
    createBackground() {
        const node = this.makeNode('Background', this.rootWidth, this.rootHeight, 0, 0);
        const graphics = node.addComponent(cc_1.Graphics);
        graphics.fillColor = makeColor(250, 245, 232, 255);
        graphics.rect(-this.rootWidth / 2, -this.rootHeight / 2, this.rootWidth, this.rootHeight);
        graphics.fill();
        this.root.addChild(node);
    }
    createTopInfo() {
        const topPadding = clamp(this.rootHeight * 0.02, 18, 32);
        const y = this.rootHeight / 2 - topPadding - this.topPanelHeight / 2;
        const panel = this.makePanel('TopPanel', this.panelWidth, this.topPanelHeight, 0, y, makeColor(255, 255, 255, 210));
        this.root.addChild(panel);
        return this.createLabel(panel, 'InfoLabel', this.panelWidth - 36, this.topPanelHeight - 24, 0, 0, clamp(this.rootWidth * 0.038, 22, 30), cc_1.HorizontalTextAlignment.LEFT, cc_1.VerticalTextAlignment.CENTER);
    }
    createMessage() {
        const topPadding = clamp(this.rootHeight * 0.02, 18, 32);
        const sectionGap = clamp(this.rootHeight * 0.012, 12, 18);
        const topY = this.rootHeight / 2 - topPadding - this.topPanelHeight / 2;
        const y = topY - this.topPanelHeight / 2 - sectionGap - this.messagePanelHeight / 2;
        const panel = this.makePanel('MessagePanel', this.panelWidth, this.messagePanelHeight, 0, y, makeColor(255, 255, 255, 200));
        this.root.addChild(panel);
        const label = this.createLabel(panel, 'MessageLabel', this.panelWidth - 36, this.messagePanelHeight - 16, 0, 0, clamp(this.rootWidth * 0.032, 18, 24), cc_1.HorizontalTextAlignment.LEFT, cc_1.VerticalTextAlignment.CENTER);
        label.color = makeColor(78, 63, 43, 255);
        return label;
    }
    createBoard() {
        const board = this.makePanel('Board', this.boardSize, this.boardSize, 0, this.boardCenterY, makeColor(248, 243, 224, 255));
        this.root.addChild(board);
        const boardTransform = board.getComponent(cc_1.UITransform);
        board.on(cc_1.Node.EventType.TOUCH_START, (event) => {
            this.callbacks.onHoverAnchor(this.resolveAnchor(boardTransform, event.getUILocation().x, event.getUILocation().y));
        });
        board.on(cc_1.Node.EventType.TOUCH_MOVE, (event) => {
            this.callbacks.onHoverAnchor(this.resolveAnchor(boardTransform, event.getUILocation().x, event.getUILocation().y));
        });
        board.on(cc_1.Node.EventType.TOUCH_END, (event) => {
            const anchor = this.resolveAnchor(boardTransform, event.getUILocation().x, event.getUILocation().y);
            this.callbacks.onHoverAnchor(anchor);
            this.callbacks.onConfirmPlacement(anchor);
        });
        board.on(cc_1.Node.EventType.MOUSE_MOVE, (event) => {
            this.callbacks.onHoverAnchor(this.resolveAnchor(boardTransform, event.getUILocation().x, event.getUILocation().y));
        });
        board.on(cc_1.Node.EventType.MOUSE_UP, (event) => {
            const anchor = this.resolveAnchor(boardTransform, event.getUILocation().x, event.getUILocation().y);
            this.callbacks.onHoverAnchor(anchor);
            this.callbacks.onConfirmPlacement(anchor);
        });
        board.on(cc_1.Node.EventType.MOUSE_LEAVE, () => {
            this.callbacks.onHoverAnchor(null);
        });
        const cellSize = this.boardSize / GameTypes_1.BOARD_COLS;
        for (let y = 0; y < GameTypes_1.BOARD_ROWS; y++) {
            const row = [];
            for (let x = 0; x < GameTypes_1.BOARD_COLS; x++) {
                const label = this.createLabel(board, `CellLabel-${x}-${y}`, cellSize, cellSize, -this.boardSize / 2 + cellSize * (x + 0.5), this.boardSize / 2 - cellSize * (y + 0.5), 20, cc_1.HorizontalTextAlignment.CENTER, cc_1.VerticalTextAlignment.CENTER);
                row.push(label);
            }
            this.cellLabels.push(row);
        }
        return board;
    }
    createControls() {
        const sectionGap = clamp(this.rootHeight * 0.012, 12, 18);
        const bottomPadding = clamp(this.rootHeight * 0.02, 18, 32);
        const handCenterY = -this.rootHeight / 2 + bottomPadding + this.handPanelHeight / 2;
        const controlsCenterY = handCenterY + this.handPanelHeight / 2 + sectionGap + this.controlsHeight / 2;
        const panel = this.makePanel('Controls', this.panelWidth, this.controlsHeight, 0, controlsCenterY, makeColor(255, 255, 255, 210));
        this.root.addChild(panel);
        const buttonWidth = clamp((this.panelWidth - 70) / 4, 88, 138);
        const step = this.panelWidth / 4;
        const buttonY = -this.controlsHeight * 0.12;
        this.createButton(panel, '左转', -this.panelWidth / 2 + step * 0.5, buttonY, buttonWidth, () => this.callbacks.onRotateLeft());
        this.createButton(panel, '右转', -this.panelWidth / 2 + step * 1.5, buttonY, buttonWidth, () => this.callbacks.onRotateRight());
        this.createButton(panel, '放置', -this.panelWidth / 2 + step * 2.5, buttonY, buttonWidth, () => this.callbacks.onConfirmPlacement(null));
        this.createButton(panel, '重开', -this.panelWidth / 2 + step * 3.5, buttonY, buttonWidth, () => this.callbacks.onRestart());
        return this.createLabel(panel, 'RotationLabel', this.panelWidth - 30, 36, 0, this.controlsHeight / 2 - 22, clamp(this.rootWidth * 0.032, 18, 24), cc_1.HorizontalTextAlignment.CENTER, cc_1.VerticalTextAlignment.CENTER);
    }
    createHandArea() {
        const bottomPadding = clamp(this.rootHeight * 0.02, 18, 32);
        const y = -this.rootHeight / 2 + bottomPadding + this.handPanelHeight / 2;
        const panel = this.makePanel('HandPanel', this.panelWidth, this.handPanelHeight, 0, y, makeColor(255, 255, 255, 220));
        this.root.addChild(panel);
        const slotSpacing = this.panelWidth / GameTypes_1.HAND_SIZE;
        for (let i = 0; i < GameTypes_1.HAND_SIZE; i++) {
            const x = -this.panelWidth / 2 + slotSpacing * (i + 0.5);
            const node = this.makePanel(`HandCard-${i}`, this.handCardWidth, this.handCardHeight, x, 0, makeColor(245, 238, 215, 255));
            node.on(cc_1.Node.EventType.TOUCH_END, () => this.callbacks.onSelectHand(i));
            node.on(cc_1.Node.EventType.MOUSE_UP, () => this.callbacks.onSelectHand(i));
            panel.addChild(node);
            const graphics = node.getComponent(cc_1.Graphics);
            const title = this.createLabel(node, `Title-${i}`, this.handCardWidth - 20, 28, 0, this.handCardHeight / 2 - 24, clamp(this.rootWidth * 0.03, 18, 22), cc_1.HorizontalTextAlignment.CENTER, cc_1.VerticalTextAlignment.CENTER);
            const status = this.createLabel(node, `Status-${i}`, this.handCardWidth - 20, 26, 0, -this.handCardHeight / 2 + 20, clamp(this.rootWidth * 0.025, 14, 18), cc_1.HorizontalTextAlignment.CENTER, cc_1.VerticalTextAlignment.CENTER);
            this.handViews.push({ node, graphics, title, status });
        }
    }
    renderHand(handSlots) {
        for (let i = 0; i < this.handViews.length; i++) {
            const view = this.handViews[i];
            const slot = handSlots[i];
            const graphics = view.graphics;
            graphics.clear();
            graphics.fillColor = (slot === null || slot === void 0 ? void 0 : slot.selected) ? makeColor(255, 243, 168, 255) : makeColor(245, 238, 215, 255);
            graphics.roundRect(-this.handCardWidth / 2, -this.handCardHeight / 2, this.handCardWidth, this.handCardHeight, 16);
            graphics.fill();
            graphics.lineWidth = (slot === null || slot === void 0 ? void 0 : slot.selected) ? 6 : 3;
            graphics.strokeColor = (slot === null || slot === void 0 ? void 0 : slot.selected) ? makeColor(223, 164, 43, 255) : makeColor(171, 141, 96, 255);
            graphics.roundRect(-this.handCardWidth / 2, -this.handCardHeight / 2, this.handCardWidth, this.handCardHeight, 16);
            graphics.stroke();
            if (!slot || !slot.card) {
                view.title.string = '空';
                view.status.string = '';
                continue;
            }
            const card = slot.card;
            const previewArea = Math.min(this.handCardWidth - 34, this.handCardHeight - 72);
            const gap = clamp(previewArea * 0.08, 6, 12);
            const cellSize = (previewArea - gap) / 2;
            const startX = -(cellSize * 2 + gap) / 2;
            const startY = (cellSize * 2 + gap) / 2;
            for (const cell of card.cells) {
                const x = startX + cell.x * (cellSize + gap);
                const y = startY - cell.y * (cellSize + gap);
                graphics.fillColor = fruitColor(cell.color, 255);
                graphics.roundRect(x, y - cellSize, cellSize, cellSize, 10);
                graphics.fill();
            }
            view.title.string = card.label;
            view.status.string = slot.canPlace ? '可放置' : '无可用落点';
            view.status.color = slot.canPlace ? makeColor(76, 126, 65, 255) : makeColor(170, 83, 69, 255);
        }
    }
    drawBoard(state) {
        const graphics = this.boardGraphics;
        const cellSize = this.boardSize / GameTypes_1.BOARD_COLS;
        graphics.clear();
        graphics.fillColor = makeColor(234, 223, 194, 255);
        graphics.roundRect(-this.boardSize / 2, -this.boardSize / 2, this.boardSize, this.boardSize, 20);
        graphics.fill();
        for (let y = 0; y < GameTypes_1.BOARD_ROWS; y++) {
            for (let x = 0; x < GameTypes_1.BOARD_COLS; x++) {
                const cell = state.board[y][x];
                const left = -this.boardSize / 2 + cellSize * x;
                const top = this.boardSize / 2 - cellSize * y;
                if (cell.rotten) {
                    graphics.fillColor = makeColor(107, 80, 67, 255);
                    graphics.rect(left + 3, top - cellSize + 3, cellSize - 6, cellSize - 6);
                    graphics.fill();
                    this.cellLabels[y][x].string = 'X';
                    this.cellLabels[y][x].color = makeColor(255, 255, 255, 255);
                }
                else if (cell.baseColor) {
                    graphics.fillColor = fruitColor(cell.baseColor, 120);
                    graphics.rect(left + 3, top - cellSize + 3, cellSize - 6, cellSize - 6);
                    graphics.fill();
                    this.cellLabels[y][x].string = cell.diceIndex >= 0 ? `${GameTypes_1.DICE_VALUES[cell.diceIndex]}` : '';
                    this.cellLabels[y][x].color = makeColor(72, 58, 45, 255);
                }
                else {
                    this.cellLabels[y][x].string = '';
                }
            }
        }
        if (state.preview) {
            for (const cell of state.preview.cells) {
                const left = -this.boardSize / 2 + cellSize * cell.x;
                const top = this.boardSize / 2 - cellSize * cell.y;
                const previewColor = cell.blocked
                    ? makeColor(85, 64, 58, 170)
                    : state.preview.isValid
                        ? fruitColor(cell.color, 140)
                        : makeColor(206, 88, 76, 140);
                graphics.fillColor = previewColor;
                graphics.rect(left + 10, top - cellSize + 10, cellSize - 20, cellSize - 20);
                graphics.fill();
                graphics.lineWidth = 3;
                graphics.strokeColor = state.preview.isValid ? makeColor(70, 138, 76, 255) : makeColor(170, 65, 58, 255);
                graphics.rect(left + 8, top - cellSize + 8, cellSize - 16, cellSize - 16);
                graphics.stroke();
            }
        }
        graphics.strokeColor = makeColor(170, 154, 120, 255);
        graphics.lineWidth = 2;
        for (let x = 0; x <= GameTypes_1.BOARD_COLS; x++) {
            const drawX = -this.boardSize / 2 + cellSize * x;
            graphics.moveTo(drawX, -this.boardSize / 2);
            graphics.lineTo(drawX, this.boardSize / 2);
        }
        for (let y = 0; y <= GameTypes_1.BOARD_ROWS; y++) {
            const drawY = this.boardSize / 2 - cellSize * y;
            graphics.moveTo(-this.boardSize / 2, drawY);
            graphics.lineTo(this.boardSize / 2, drawY);
        }
        graphics.stroke();
    }
    createButton(parent, title, x, y, width, onClick) {
        const buttonHeight = clamp(this.controlsHeight * 0.42, 42, 54);
        const node = this.makePanel(`Button-${title}`, width, buttonHeight, x, y - buttonHeight * 0.2, makeColor(244, 226, 166, 255));
        const graphics = node.getComponent(cc_1.Graphics);
        graphics.lineWidth = 3;
        graphics.strokeColor = makeColor(187, 148, 56, 255);
        graphics.roundRect(-width / 2, -buttonHeight / 2, width, buttonHeight, 14);
        graphics.stroke();
        this.createLabel(node, `ButtonLabel-${title}`, width - 20, buttonHeight - 8, 0, 0, clamp(this.rootWidth * 0.028, 16, 22), cc_1.HorizontalTextAlignment.CENTER, cc_1.VerticalTextAlignment.CENTER).string = title;
        node.on(cc_1.Node.EventType.TOUCH_END, onClick);
        node.on(cc_1.Node.EventType.MOUSE_UP, onClick);
        parent.addChild(node);
    }
    createLabel(parent, name, width, height, x, y, fontSize, horizontal, vertical) {
        const node = this.makeNode(name, width, height, x, y);
        const label = node.addComponent(cc_1.Label);
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.horizontalAlign = horizontal;
        label.verticalAlign = vertical;
        label.color = makeColor(74, 60, 44, 255);
        parent.addChild(node);
        return label;
    }
    makePanel(name, width, height, x, y, color) {
        const node = this.makeNode(name, width, height, x, y);
        const graphics = node.addComponent(cc_1.Graphics);
        graphics.fillColor = color;
        graphics.roundRect(-width / 2, -height / 2, width, height, clamp(Math.min(width, height) * 0.08, 14, 18));
        graphics.fill();
        return node;
    }
    makeNode(name, width, height, x, y) {
        const node = new cc_1.Node(name);
        node.layer = cc_1.Layers.Enum.UI_2D;
        const transform = node.addComponent(cc_1.UITransform);
        transform.setContentSize(width, height);
        node.setPosition(new cc_1.Vec3(x, y, 0));
        return node;
    }
    resolveAnchor(boardTransform, uiX, uiY) {
        const local = boardTransform.convertToNodeSpaceAR(new cc_1.Vec3(uiX, uiY, 0));
        const half = this.boardSize / 2;
        if (local.x < -half || local.x >= half || local.y <= -half || local.y > half) {
            return null;
        }
        const cellSize = this.boardSize / GameTypes_1.BOARD_COLS;
        const x = Math.floor((local.x + half) / cellSize);
        const y = Math.floor((half - local.y) / cellSize);
        if (x < 0 || y < 0 || x > GameTypes_1.BOARD_COLS - GameTypes_1.CARD_SIZE || y > GameTypes_1.BOARD_ROWS - GameTypes_1.CARD_SIZE) {
            return null;
        }
        return { x, y };
    }
    measureLayout() {
        var _a, _b;
        const rootTransform = this.root.getComponent(cc_1.UITransform);
        const contentSize = rootTransform === null || rootTransform === void 0 ? void 0 : rootTransform.contentSize;
        this.rootWidth = Math.max((_a = contentSize === null || contentSize === void 0 ? void 0 : contentSize.width) !== null && _a !== void 0 ? _a : 720, 360);
        this.rootHeight = Math.max((_b = contentSize === null || contentSize === void 0 ? void 0 : contentSize.height) !== null && _b !== void 0 ? _b : 1280, 640);
        this.panelWidth = this.rootWidth - clamp(this.rootWidth * 0.06, 28, 40) * 2;
        this.topPanelHeight = clamp(this.rootHeight * 0.12, 120, 170);
        this.messagePanelHeight = clamp(this.rootHeight * 0.06, 58, 82);
        this.controlsHeight = clamp(this.rootHeight * 0.1, 96, 124);
        this.handPanelHeight = clamp(this.rootHeight * 0.2, 190, 250);
        const handGap = clamp(this.panelWidth * 0.025, 8, 14);
        this.handCardWidth = Math.min(180, (this.panelWidth - handGap * (GameTypes_1.HAND_SIZE + 1)) / GameTypes_1.HAND_SIZE);
        this.handCardHeight = clamp(this.handPanelHeight - 30, 150, 190);
        const topPadding = clamp(this.rootHeight * 0.02, 18, 32);
        const bottomPadding = clamp(this.rootHeight * 0.02, 18, 32);
        const sectionGap = clamp(this.rootHeight * 0.012, 12, 18);
        const topRegionBottom = this.rootHeight / 2 - topPadding - this.topPanelHeight - sectionGap - this.messagePanelHeight - sectionGap;
        const bottomRegionTop = -this.rootHeight / 2 + bottomPadding + this.handPanelHeight + sectionGap + this.controlsHeight + sectionGap;
        const boardAvailable = topRegionBottom - bottomRegionTop;
        this.boardSize = Math.floor(Math.min(this.panelWidth, clamp(boardAvailable, 300, this.rootHeight * 0.48)));
        this.boardCenterY = (topRegionBottom + bottomRegionTop) / 2;
    }
}
exports.GameView = GameView;
