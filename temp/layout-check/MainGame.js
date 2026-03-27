"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainGame = void 0;
const cc_1 = require("cc");
const GameModel_1 = require("./GameModel");
const GameView_1 = require("./GameView");
const { ccclass } = cc_1._decorator;
let MainGame = (() => {
    let _classDecorators = [ccclass('MainGame')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = cc_1.Component;
    var MainGame = _classThis = class extends _classSuper {
        constructor() {
            super(...arguments);
            this.model = null;
            this.view = null;
            this.selectedHandIndex = 0;
            this.currentRotation = 0;
            this.hoverAnchor = null;
        }
        start() {
            this.configureCanvasAdaptation();
            const uiRoot = this.ensureUiRoot();
            this.model = new GameModel_1.GameModel();
            this.view = new GameView_1.GameView(uiRoot, {
                onSelectHand: (index) => this.selectHand(index),
                onRotateLeft: () => this.rotate(-1),
                onRotateRight: () => this.rotate(1),
                onConfirmPlacement: (anchor) => this.confirmPlacement(anchor),
                onHoverAnchor: (anchor) => this.updateHover(anchor),
                onRestart: () => this.restartGame(),
            });
            this.normalizeSelection();
            this.render();
        }
        update() {
        }
        configureCanvasAdaptation() {
            const canvas = this.node.getComponent(cc_1.Canvas);
            if (!canvas) {
                return;
            }
            // Vertical games should fit width first on tall phones,
            // otherwise 16:9 content is cropped at the top and bottom.
            canvas.fitWidth = true;
            canvas.fitHeight = false;
        }
        ensureUiRoot() {
            let uiRoot = this.node.getChildByName('DemoRoot');
            if (!uiRoot) {
                uiRoot = new cc_1.Node('DemoRoot');
                uiRoot.layer = cc_1.Layers.Enum.UI_2D;
                const canvasTransform = this.node.getComponent(cc_1.UITransform);
                const uiTransform = uiRoot.addComponent(cc_1.UITransform);
                if (canvasTransform) {
                    uiTransform.setContentSize(canvasTransform.contentSize);
                }
                uiRoot.setPosition(new cc_1.Vec3(0, 0, 0));
                this.node.addChild(uiRoot);
            }
            const canvasTransform = this.node.getComponent(cc_1.UITransform);
            const uiTransform = uiRoot.getComponent(cc_1.UITransform);
            if (canvasTransform && uiTransform) {
                uiTransform.setContentSize(canvasTransform.contentSize);
            }
            return uiRoot;
        }
        restartGame() {
            if (!this.model) {
                return;
            }
            this.model.startNewGame();
            this.selectedHandIndex = 0;
            this.currentRotation = 0;
            this.hoverAnchor = null;
            this.render();
        }
        selectHand(index) {
            if (!this.model || index < 0 || index >= this.model.hand.length) {
                return;
            }
            this.selectedHandIndex = index;
            this.currentRotation = 0;
            this.render();
        }
        rotate(direction) {
            if (!this.model || this.model.status !== 'playing' || !this.model.getCardAtHand(this.selectedHandIndex)) {
                return;
            }
            const nextRotation = (this.currentRotation + direction + 4) % 4;
            this.currentRotation = nextRotation;
            this.render();
        }
        updateHover(anchor) {
            this.hoverAnchor = anchor;
            this.render();
        }
        confirmPlacement(anchor) {
            if (!this.model || this.model.status !== 'playing') {
                return;
            }
            const activeAnchor = anchor !== null && anchor !== void 0 ? anchor : this.hoverAnchor;
            if (!activeAnchor) {
                this.model.message = '先把预览移动到果园中的一个合法位置。';
                this.render();
                return;
            }
            const result = this.model.placeFromHand(this.selectedHandIndex, activeAnchor, this.currentRotation);
            if (result.isValid) {
                this.currentRotation = 0;
                this.hoverAnchor = null;
                this.normalizeSelection();
            }
            this.render();
        }
        normalizeSelection() {
            if (!this.model) {
                return;
            }
            if (this.model.hand.length === 0) {
                this.selectedHandIndex = -1;
                return;
            }
            if (this.selectedHandIndex < 0 || this.selectedHandIndex >= this.model.hand.length) {
                this.selectedHandIndex = 0;
            }
        }
        getCurrentPreview() {
            if (!this.model || !this.hoverAnchor) {
                return null;
            }
            const card = this.model.getCardAtHand(this.selectedHandIndex);
            if (!card) {
                return null;
            }
            return this.model.evaluatePlacement(card, this.hoverAnchor, this.currentRotation);
        }
        buildHandSlots() {
            if (!this.model) {
                return [];
            }
            return [0, 1, 2].map((index) => {
                const card = this.model.getCardAtHand(index);
                return {
                    card,
                    selected: index === this.selectedHandIndex,
                    canPlace: !!card && this.model.canCardBePlaced(card),
                };
            });
        }
        buildViewState() {
            if (!this.model) {
                return null;
            }
            return {
                board: this.model.board,
                handSlots: this.buildHandSlots(),
                deckCount: this.model.deck.length,
                score: this.model.score,
                targetScore: this.model.targetScore,
                remainingRotten: this.model.remainingRotten,
                rotation: this.currentRotation,
                status: this.model.status,
                message: this.model.message,
                preview: this.getCurrentPreview(),
            };
        }
        render() {
            const state = this.buildViewState();
            if (!state || !this.view) {
                return;
            }
            this.view.render(state);
        }
    };
    __setFunctionName(_classThis, "MainGame");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MainGame = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MainGame = _classThis;
})();
exports.MainGame = MainGame;
