System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, assetManager, Color, EventMouse, Graphics, HorizontalTextAlignment, Input, Label, Layers, Node, Sprite, Tween, UIOpacity, UITransform, Vec3, VerticalTextAlignment, input, tween, BOARD_COLS, BOARD_ROWS, CARD_TEMPLATE_COLS, CARD_TEMPLATE_ROWS, HAND_SIZE, getCardBounds, rotateCardCells, GameView, _crd, TIME_WHEEL_YEAR_COUNT, TIME_WHEEL_YEAR_LABELS, TIME_WHEEL_SEASONS, PLANT_SPRITE_UUIDS, TIME_WHEEL_SPRITE_UUIDS;

  function makeColor(r, g, b, a) {
    if (a === void 0) {
      a = 255;
    }

    return new Color(r, g, b, a);
  }

  function fruitColor(color, alpha) {
    if (alpha === void 0) {
      alpha = 255;
    }

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
    return rotation * 90 + "\xB0";
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function flashAlpha(phase, base, amplitude) {
    var w = 0.5 + 0.5 * Math.sin(phase * 2.4);
    return clamp(base + amplitude * w, 0, 255);
  }

  function _reportPossibleCrUseOfBOARD_COLS(extras) {
    _reporterNs.report("BOARD_COLS", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBOARD_ROWS(extras) {
    _reporterNs.report("BOARD_ROWS", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCARD_TEMPLATE_COLS(extras) {
    _reporterNs.report("CARD_TEMPLATE_COLS", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCARD_TEMPLATE_ROWS(extras) {
    _reporterNs.report("CARD_TEMPLATE_ROWS", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFruitColor(extras) {
    _reporterNs.report("FruitColor", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameViewState(extras) {
    _reporterNs.report("GameViewState", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGridPos(extras) {
    _reporterNs.report("GridPos", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfHAND_SIZE(extras) {
    _reporterNs.report("HAND_SIZE", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfHandSlotState(extras) {
    _reporterNs.report("HandSlotState", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRotation(extras) {
    _reporterNs.report("Rotation", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfgetCardBounds(extras) {
    _reporterNs.report("getCardBounds", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfrotateCardCells(extras) {
    _reporterNs.report("rotateCardCells", "./GameTypes", _context.meta, extras);
  }

  _export("GameView", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      assetManager = _cc.assetManager;
      Color = _cc.Color;
      EventMouse = _cc.EventMouse;
      Graphics = _cc.Graphics;
      HorizontalTextAlignment = _cc.HorizontalTextAlignment;
      Input = _cc.Input;
      Label = _cc.Label;
      Layers = _cc.Layers;
      Node = _cc.Node;
      Sprite = _cc.Sprite;
      Tween = _cc.Tween;
      UIOpacity = _cc.UIOpacity;
      UITransform = _cc.UITransform;
      Vec3 = _cc.Vec3;
      VerticalTextAlignment = _cc.VerticalTextAlignment;
      input = _cc.input;
      tween = _cc.tween;
    }, function (_unresolved_2) {
      BOARD_COLS = _unresolved_2.BOARD_COLS;
      BOARD_ROWS = _unresolved_2.BOARD_ROWS;
      CARD_TEMPLATE_COLS = _unresolved_2.CARD_TEMPLATE_COLS;
      CARD_TEMPLATE_ROWS = _unresolved_2.CARD_TEMPLATE_ROWS;
      HAND_SIZE = _unresolved_2.HAND_SIZE;
      getCardBounds = _unresolved_2.getCardBounds;
      rotateCardCells = _unresolved_2.rotateCardCells;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "dffb9Xj6fdAO6dZ9IKM1gip", "GameView", undefined);

      __checkObsolete__(['assetManager', 'Color', 'EventMouse', 'EventTouch', 'Graphics', 'HorizontalTextAlignment', 'Input', 'Label', 'Layers', 'Node', 'Sprite', 'SpriteFrame', 'Tween', 'UIOpacity', 'UITransform', 'Vec3', 'VerticalTextAlignment', 'input', 'tween']);

      TIME_WHEEL_YEAR_COUNT = 12;
      TIME_WHEEL_YEAR_LABELS = Array.from({
        length: TIME_WHEEL_YEAR_COUNT
      }, (_, index) => "\u7B2C" + (index + 1) + "\u5E74");
      TIME_WHEEL_SEASONS = ['春', '夏', '秋', '冬'];
      PLANT_SPRITE_UUIDS = ['d8d2b4e7-02fa-43d8-ae32-f88962512158@f9941', 'e7f3ab4d-6043-48c1-96d4-51b9bd5d34d3@f9941', 'dc847cb1-176d-44ee-87d1-3ecd68a5dbfe@f9941', 'bc1f8201-5074-41aa-8986-f4dd4bf5c678@f9941', 'a059e044-b835-4428-9ea2-be1de3d318ee@f9941', 'add56ff4-64f6-4e72-91ca-0ae96d294b70@f9941', 'b739c0a5-a345-4f30-91eb-4db2a896f16e@f9941', 'b14ad91d-22b3-4ea4-b0ff-9b08aea89766@f9941', '767e3709-c821-4c56-999f-356bfb281fe9@f9941', 'b00fe362-b12a-4de5-9cd9-fac4b09c42e1@f9941', '9b73190d-d559-4748-863c-44d7cd0e1aec@f9941'];
      TIME_WHEEL_SPRITE_UUIDS = {
        outer: '297f1be5-ff1f-4730-a82d-3d1e521c425e@f9941',
        inner: '9d42f535-cb00-4762-9f8d-9724f9115dbb@f9941',
        center: '91ac284c-e776-42d2-8148-589a9c1d7ef9@f9941',
        pointer: '75e5a02b-e1ac-4795-b04e-4c82f8bae4a8@f9941'
      };

      _export("GameView", GameView = class GameView {
        constructor(root, callbacks) {
          this.root = void 0;
          this.callbacks = void 0;
          this.spriteFrameCache = new Map();
          this.rootWidth = 720;
          this.rootHeight = 1280;
          this.panelWidth = 680;
          this.boardSize = 620;
          this.boardCenterY = 40;
          this.topPanelHeight = 150;
          this.messagePanelHeight = 70;
          this.handPanelHeight = 220;
          this.handCardWidth = 180;
          this.handCardHeight = 180;
          this.boardNode = void 0;
          this.boardGraphics = void 0;
          this.cellLabels = [];
          this.levelLabels = [];
          this.boardPlantLayer = void 0;
          this.boardPlantViews = [];
          this.previewPlantViews = [];
          this.topInfoView = void 0;
          this.messageLabel = void 0;
          this.handViews = [];
          this.preplaceButtons = [];
          this.handPanel = null;
          this.dragArrow = null;
          this.preplaceBar = null;
          this.lastRenderState = null;
          this.preplacePhase = 'idle';
          this.preplaceHandIndex = null;
          this.preplace2BoardDragging = false;
          this.preplace2PointerDown = false;
          this.preplace2PointerStartX = 0;
          this.preplace2PointerStartY = 0;
          this.preplaceBoardInputSuppressUntil = 0;

          /** 悬停手牌：抬高、放大、置顶 */
          this.hoverHandIndex = null;

          /** 预放置阶段1：向上拖拽的额外 Y（UI 坐标，向上为正） */
          this.handDragStartY = 0;
          this.handDragLiftY = 0;

          /** 补牌 / 手牌归位动画进行中，不覆盖节点坐标 */
          this.handRefillAnimRunning = false;
          this.pendingHandRefillAnim = null;

          /** 状态2旋转时，对当前预览补角度和位移过渡，避免长条/L 形出现视觉跳位 */
          this.previewRotateTweenState = {
            extraDeg: 0,
            offsetX: 0,
            offsetY: 0
          };
          this.previewRotateAnchorKey = '';
          this.previewRotateLogical = 0;
          this.previewDropPulseState = {
            value: 0
          };
          this.lastPreplaceButtonTitle = '';
          this.lastPreplaceButtonAt = 0;
          this.gmPopupOpen = false;
          this.timeWheelYearIndex = 0;
          this.timeWheelSeasonIndex = 0;
          this.root = root;
          this.callbacks = callbacks;
          this.root.removeAllChildren();
          this.measureLayout();
          this.createBackground();
          this.topInfoView = this.createTopInfo();
          this.messageLabel = this.createMessage();
          this.boardNode = this.createBoard();
          this.boardGraphics = this.boardNode.getComponent(Graphics);
          this.boardPlantLayer = this.boardNode.getChildByName('BoardPlantLayer');
          this.createHandArea();
          this.createDragArrowOnly();
          this.createPreplaceBar();
          this.bindGlobalInput();
        }

        render(state) {
          if (this.pendingHandRefillAnim) {
            var p = this.pendingHandRefillAnim;
            this.pendingHandRefillAnim = null;
            this.startHandRefillAnimation(p.removedIdx, p.snap, p.oldIds, state.handSlots);
          }

          this.syncPreviewRotateTween(state);
          this.lastRenderState = state;
          this.renderTopInfo(state);
          var statusText = state.status === 'playing' ? state.preview ? state.preview.reason : state.message : "" + state.message;
          this.messageLabel.string = statusText;
          this.syncPreplaceBar(state);
          this.drawBoard(state);
          this.renderHand(state.handSlots);
          this.refreshArcAndBarPosition(state);
        }

        destroyView() {
          this.cancelPreplaceFlow(true);
          this.pendingHandRefillAnim = null;
          this.handRefillAnimRunning = false;
          this.hoverHandIndex = null;
          this.resetPreviewRotateState();
          Tween.stopAllByTarget(this.previewDropPulseState);
          Tween.stopAllByTarget(this.topInfoView.timeWheelOuterNode);
          Tween.stopAllByTarget(this.topInfoView.timeWheelInnerNode);

          for (var v of this.handViews) {
            Tween.stopAllByTarget(v.node);
          }

          input.off(Input.EventType.MOUSE_DOWN, this.onGlobalMouseDown, this);
          input.off(Input.EventType.TOUCH_START, this.onGlobalTouchStart, this);
        }
        /** 出牌前记录手牌节点位置，供补牌动画使用 */


        captureHandLayoutSnapshot() {
          return {
            positions: this.handViews.map(v => v.node.position.clone()),
            eulers: this.handViews.map(v => v.node.eulerAngles.clone())
          };
        }

        scheduleHandRefillAnimation(removedIdx, snap, oldIds) {
          this.pendingHandRefillAnim = {
            removedIdx,
            snap,
            oldIds
          };
        }

        resetPreviewRotateState() {
          Tween.stopAllByTarget(this.previewRotateTweenState);
          this.previewRotateTweenState.extraDeg = 0;
          this.previewRotateTweenState.offsetX = 0;
          this.previewRotateTweenState.offsetY = 0;
          this.previewRotateAnchorKey = '';
          this.previewRotateLogical = 0;
        }

        loadSpriteFrameByUuid(uuid, sprite) {
          var cached = this.spriteFrameCache.get(uuid);

          if (cached) {
            sprite.spriteFrame = cached;
            this.applyPlantSpriteFitFromNode(sprite);
            return;
          }

          assetManager.loadAny(uuid, (error, asset) => {
            var _sprite$node;

            if (error || !((_sprite$node = sprite.node) != null && _sprite$node.isValid)) {
              return;
            }

            this.spriteFrameCache.set(uuid, asset);
            sprite.spriteFrame = asset;
            this.applyPlantSpriteFitFromNode(sprite);
          });
        }

        setPlantSpriteFit(sprite, maxWidth, maxHeight, bottomY) {
          sprite.node.__plantFit = {
            width: maxWidth,
            height: maxHeight,
            bottomY
          };
          this.applyPlantSpriteFitFromNode(sprite);
        }

        getPlantSpriteUuidByVariant(variant) {
          var safeIndex = Math.abs(variant != null ? variant : 0) % PLANT_SPRITE_UUIDS.length;
          return PLANT_SPRITE_UUIDS[safeIndex];
        }

        applyPlantSpriteFitFromNode(sprite) {
          var fit = sprite.node.__plantFit;
          var transform = sprite.node.getComponent(UITransform);

          if (!fit || !transform) {
            return;
          }

          var frame = sprite.spriteFrame;

          if (!frame) {
            transform.setContentSize(fit.width, fit.height);
            return;
          }

          var original = frame.originalSize;
          var ow = Math.max(original.width, 1);
          var oh = Math.max(original.height, 1);
          var scale = Math.min(fit.width / ow, fit.height / oh);
          var width = Math.max(1, ow * scale);
          var height = Math.max(1, oh * scale);
          transform.setContentSize(width, height);

          if (fit.bottomY !== undefined) {
            sprite.node.setPosition(0, fit.bottomY + height / 2, 0);
          }
        }

        getTimeWheelDisplaySize() {
          return clamp((this.topPanelHeight - 28) * 1.12, 180, 228);
        }

        getMaxHandDragLift() {
          var defaultMax = clamp(this.handCardHeight * 0.75, 90, 150);

          if (!this.handPanel) {
            return defaultMax;
          }

          var boardBottom = this.boardCenterY - this.boardSize / 2;
          var handPanelTop = this.handPanel.position.y + this.handPanelHeight / 2;
          var visualReserve = this.handCardHeight * 0.5;
          var safeLift = boardBottom - handPanelTop - visualReserve;
          return clamp(Math.min(defaultMax, safeLift), 28, defaultMax);
        }

        createBackground() {
          var node = this.makeNode('Background', this.rootWidth, this.rootHeight, 0, 0);
          var graphics = node.addComponent(Graphics);
          graphics.fillColor = makeColor(250, 245, 232, 255);
          graphics.rect(-this.rootWidth / 2, -this.rootHeight / 2, this.rootWidth, this.rootHeight);
          graphics.fill();
          this.root.addChild(node);
        }

        createTopInfo() {
          var topPadding = clamp(this.rootHeight * 0.02, 18, 32);
          var y = this.rootHeight / 2 - topPadding - this.topPanelHeight / 2;
          var panel = this.makePanel('TopPanel', this.panelWidth, this.topPanelHeight, 0, y, makeColor(255, 255, 255, 210));
          this.root.addChild(panel);
          var panelLeft = -this.panelWidth / 2;
          var panelRight = this.panelWidth / 2;
          var wheelSize = this.getTimeWheelDisplaySize();
          var progressY = this.topPanelHeight / 2 - 28;
          var wheelX = panelLeft + 8 + wheelSize / 2;
          var wheelY = progressY + 13 - wheelSize / 2;
          var timeWheelNode = this.makeNode('TimeWheel', wheelSize, wheelSize, wheelX, wheelY);
          panel.addChild(timeWheelNode);
          var timeWheelOuterNode = this.makeNode('TimeWheelOuter', wheelSize, wheelSize, 0, 0);
          var timeWheelOuterSprite = timeWheelOuterNode.addComponent(Sprite);
          timeWheelOuterSprite.sizeMode = Sprite.SizeMode.CUSTOM;
          timeWheelNode.addChild(timeWheelOuterNode);
          var timeWheelInnerNode = this.makeNode('TimeWheelInner', wheelSize * 0.79, wheelSize * 0.79, 0, 0);
          var timeWheelInnerSprite = timeWheelInnerNode.addComponent(Sprite);
          timeWheelInnerSprite.sizeMode = Sprite.SizeMode.CUSTOM;
          timeWheelNode.addChild(timeWheelInnerNode);
          var timeWheelCenterNode = this.makeNode('TimeWheelCenter', wheelSize * 0.42, wheelSize * 0.42, 0, 0);
          var timeWheelCenterSprite = timeWheelCenterNode.addComponent(Sprite);
          timeWheelCenterSprite.sizeMode = Sprite.SizeMode.CUSTOM;
          timeWheelNode.addChild(timeWheelCenterNode);
          var timeWheelPointerNode = this.makeNode('TimeWheelPointer', wheelSize * 0.11, wheelSize * 0.075, 0, wheelSize * 0.35);
          var timeWheelPointerSprite = timeWheelPointerNode.addComponent(Sprite);
          timeWheelPointerSprite.sizeMode = Sprite.SizeMode.CUSTOM;
          timeWheelNode.addChild(timeWheelPointerNode);
          var wheelCenterSize = wheelSize * 0.34;
          var timeWheelYearLabel = this.createLabel(timeWheelCenterNode, 'TimeWheelYearLabel', wheelCenterSize * 1.55, 32, 0, 18, clamp(this.rootWidth * 0.032, 20, 28), HorizontalTextAlignment.CENTER, VerticalTextAlignment.CENTER);
          timeWheelYearLabel.color = makeColor(112, 78, 52, 255);
          var timeWheelSeasonLabel = this.createLabel(timeWheelCenterNode, 'TimeWheelSeasonLabel', wheelCenterSize * 1.2, 38, 0, -20, clamp(this.rootWidth * 0.05, 28, 40), HorizontalTextAlignment.CENTER, VerticalTextAlignment.CENTER);
          timeWheelSeasonLabel.color = makeColor(112, 78, 52, 255);
          this.loadSpriteFrameByUuid(TIME_WHEEL_SPRITE_UUIDS.outer, timeWheelOuterSprite);
          this.loadSpriteFrameByUuid(TIME_WHEEL_SPRITE_UUIDS.inner, timeWheelInnerSprite);
          this.loadSpriteFrameByUuid(TIME_WHEEL_SPRITE_UUIDS.center, timeWheelCenterSprite);
          this.loadSpriteFrameByUuid(TIME_WHEEL_SPRITE_UUIDS.pointer, timeWheelPointerSprite);
          var contentLeft = wheelX + wheelSize / 2 + 22;
          var contentRight = panelRight - 16;
          var contentWidth = contentRight - contentLeft;
          var gmWidth = 68;
          var gmX = contentRight - gmWidth / 2;
          var progressWidth = Math.max(160, contentWidth - gmWidth - 18);
          var progressCenterX = contentLeft + progressWidth / 2;
          var progressNode = this.makeNode('ScoreProgress', progressWidth, 26, progressCenterX, progressY);
          var progressGraphics = progressNode.addComponent(Graphics);
          panel.addChild(progressNode);
          var progressLabel = this.createLabel(panel, 'ScoreProgressLabel', progressWidth - 18, 26, progressCenterX, progressY, clamp(this.rootWidth * 0.026, 15, 18), HorizontalTextAlignment.CENTER, VerticalTextAlignment.CENTER);
          progressLabel.color = makeColor(92, 70, 36, 255);
          var lowerTop = progressY - 18;
          var lowerHeight = this.topPanelHeight - 58;
          var statsWidth = Math.max(110, contentWidth * 0.28);
          var reserveWidth = Math.max(140, contentWidth - statsWidth - 16);
          var statsX = contentLeft + statsWidth / 2;
          var reserveX = contentLeft + statsWidth + 16 + reserveWidth / 2;
          var lowerCenterY = lowerTop - lowerHeight / 2;
          var statsLabel = this.createLabel(panel, 'InfoStatsLabel', statsWidth, lowerHeight, statsX, lowerCenterY, clamp(this.rootWidth * 0.028, 16, 20), HorizontalTextAlignment.LEFT, VerticalTextAlignment.CENTER);
          var reserveLabel = this.createLabel(panel, 'ReserveLabel', reserveWidth - 18, lowerHeight - 12, reserveX, lowerCenterY, clamp(this.rootWidth * 0.024, 13, 16), HorizontalTextAlignment.LEFT, VerticalTextAlignment.CENTER);
          reserveLabel.color = makeColor(132, 118, 96, 255);
          var reserveNode = this.makeNode('ReservePanel', reserveWidth, lowerHeight, reserveX, lowerCenterY);
          var reserveGraphics = reserveNode.addComponent(Graphics);
          panel.addChild(reserveNode);
          reserveNode.setSiblingIndex(panel.children.length - 2);
          var gmButton = this.makePanel('GmButton', gmWidth, 30, gmX, progressY, makeColor(229, 235, 248, 255));
          var gmButtonGraphics = gmButton.getComponent(Graphics);
          gmButtonGraphics.lineWidth = 2;
          gmButtonGraphics.strokeColor = makeColor(84, 104, 148, 255);
          gmButtonGraphics.roundRect(-34, -15, 68, 30, 10);
          gmButtonGraphics.stroke();
          var gmLabel = this.createLabel(gmButton, 'GmButtonLabel', 60, 24, 0, 0, 16, HorizontalTextAlignment.CENTER, VerticalTextAlignment.CENTER);
          gmLabel.string = 'GM';
          gmLabel.color = makeColor(84, 104, 148, 255);
          panel.addChild(gmButton);
          var gmPopup = this.makeNode('GmPopup', 156, 198, gmX - 10, lowerCenterY);
          var gmPopupGraphics = gmPopup.addComponent(Graphics);
          gmPopupGraphics.fillColor = makeColor(255, 252, 244, 255);
          gmPopupGraphics.roundRect(-78, -99, 156, 198, 12);
          gmPopupGraphics.fill();
          gmPopupGraphics.lineWidth = 2;
          gmPopupGraphics.strokeColor = makeColor(171, 141, 96, 255);
          gmPopupGraphics.roundRect(-78, -99, 156, 198, 12);
          gmPopupGraphics.stroke();
          gmPopup.active = false;
          panel.addChild(gmPopup);
          var gmPopupTitle = this.createLabel(gmPopup, 'GmPopupTitle', 130, 22, 0, 72, 15, HorizontalTextAlignment.CENTER, VerticalTextAlignment.CENTER);
          gmPopupTitle.string = 'GM 工具栏';

          var togglePopup = () => {
            this.gmPopupOpen = !this.gmPopupOpen;
            gmPopup.active = this.gmPopupOpen;
          };

          gmButton.on(Node.EventType.MOUSE_DOWN, event => {
            if (event.getButton() !== EventMouse.BUTTON_LEFT) {
              return;
            }

            event.propagationStopped = true;
            togglePopup();
          }, this);
          gmButton.on(Node.EventType.TOUCH_START, event => {
            event.propagationStopped = true;
            togglePopup();
          }, this);
          this.createGmPopupButton(gmPopup, '抽牌', 34, makeColor(214, 242, 198, 255), makeColor(76, 138, 64, 255), () => this.callbacks.onGmDrawCard());
          this.createGmPopupButton(gmPopup, '+3 分', -8, makeColor(234, 229, 249, 255), makeColor(101, 87, 155, 255), () => this.callbacks.onGmAddScore());
          this.createGmPopupButton(gmPopup, '+1 烂果', -50, makeColor(250, 228, 199, 255), makeColor(170, 112, 44, 255), () => this.callbacks.onGmAddRottenCharge());
          this.createGmPopupButton(gmPopup, '重开', -92, makeColor(244, 230, 230, 255), makeColor(160, 88, 88, 255), () => this.callbacks.onGmRestart());
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
            gmPopup
          };
        }

        createGmPopupButton(parent, title, y, fillColor, strokeColor, onClick) {
          var button = this.makePanel("GmPopupButton-" + title, 108, 32, 0, y, fillColor);
          var graphics = button.getComponent(Graphics);
          graphics.lineWidth = 2;
          graphics.strokeColor = strokeColor;
          graphics.roundRect(-54, -16, 108, 32, 10);
          graphics.stroke();
          var label = this.createLabel(button, "GmPopupButtonLabel-" + title, 96, 22, 0, 0, 14, HorizontalTextAlignment.CENTER, VerticalTextAlignment.CENTER);
          label.string = title;
          label.color = strokeColor;

          var trigger = () => {
            onClick();
            this.gmPopupOpen = false;
            this.topInfoView.gmPopup.active = false;
          };

          button.on(Node.EventType.MOUSE_DOWN, event => {
            if (event.getButton() !== EventMouse.BUTTON_LEFT) {
              return;
            }

            event.propagationStopped = true;
            trigger();
          }, this);
          button.on(Node.EventType.TOUCH_START, event => {
            event.propagationStopped = true;
            trigger();
          }, this);
          parent.addChild(button);
        }

        createMessage() {
          var panel = this.makeNode('MessagePanel', 1, 1, 0, 0);
          panel.active = false;
          this.root.addChild(panel);
          var label = this.createLabel(panel, 'MessageLabel', 1, 1, 0, 0, 1, HorizontalTextAlignment.LEFT, VerticalTextAlignment.CENTER);
          label.color = makeColor(78, 63, 43, 255);
          return label;
        }

        createBoard() {
          var board = this.makePanel('Board', this.boardSize, this.boardSize, 0, this.boardCenterY, makeColor(248, 243, 224, 255));
          this.root.addChild(board);
          var boardTransform = board.getComponent(UITransform);
          board.on(Node.EventType.TOUCH_START, event => {
            this.onBoardPointerDown(boardTransform, event.getUILocation().x, event.getUILocation().y);
          });
          board.on(Node.EventType.MOUSE_DOWN, event => {
            if (event.getButton() !== EventMouse.BUTTON_LEFT) {
              return;
            }

            this.onBoardPointerDown(boardTransform, event.getUILocation().x, event.getUILocation().y);
          });
          var cellSize = this.boardSize / (_crd && BOARD_COLS === void 0 ? (_reportPossibleCrUseOfBOARD_COLS({
            error: Error()
          }), BOARD_COLS) : BOARD_COLS);
          var plantLayer = this.makeNode('BoardPlantLayer', this.boardSize, this.boardSize, 0, 0);
          board.addChild(plantLayer);

          for (var y = 0; y < (_crd && BOARD_ROWS === void 0 ? (_reportPossibleCrUseOfBOARD_ROWS({
            error: Error()
          }), BOARD_ROWS) : BOARD_ROWS); y++) {
            for (var x = 0; x < (_crd && BOARD_COLS === void 0 ? (_reportPossibleCrUseOfBOARD_COLS({
              error: Error()
            }), BOARD_COLS) : BOARD_COLS); x++) {
              this.boardPlantViews.push(this.createBoardPlantCellView(plantLayer, "BoardPlant-" + x + "-" + y, x, y, false));
            }
          }

          for (var i = 0; i < 8; i++) {
            this.previewPlantViews.push(this.createBoardPlantCellView(plantLayer, "PreviewPlant-" + i, 0, 0, true));
          }

          for (var _y = 0; _y < (_crd && BOARD_ROWS === void 0 ? (_reportPossibleCrUseOfBOARD_ROWS({
            error: Error()
          }), BOARD_ROWS) : BOARD_ROWS); _y++) {
            var row = [];
            var levelRow = [];

            for (var _x = 0; _x < (_crd && BOARD_COLS === void 0 ? (_reportPossibleCrUseOfBOARD_COLS({
              error: Error()
            }), BOARD_COLS) : BOARD_COLS); _x++) {
              var label = this.createLabel(board, "CellLabel-" + _x + "-" + _y, cellSize, cellSize, -this.boardSize / 2 + cellSize * (_x + 0.5), this.boardSize / 2 - cellSize * (_y + 0.5), 20, HorizontalTextAlignment.CENTER, VerticalTextAlignment.CENTER);
              row.push(label);
              var levelLabel = this.createLabel(board, "CellLevel-" + _x + "-" + _y, cellSize, 22, -this.boardSize / 2 + cellSize * (_x + 0.5), this.boardSize / 2 - cellSize * _y - cellSize * 0.835, 13, HorizontalTextAlignment.CENTER, VerticalTextAlignment.CENTER);
              levelLabel.color = makeColor(246, 238, 221, 255);
              levelRow.push(levelLabel);
            }

            this.cellLabels.push(row);
            this.levelLabels.push(levelRow);
          }

          return board;
        }

        createBoardPlantCellView(parent, name, col, row, preview) {
          var node = this.makeNode(name, 10, 10, 0, 0);
          var graphics = node.addComponent(Graphics);
          var spriteNode = this.makeNode(name + "-Sprite", 10, 10, 0, 0);
          var sprite = spriteNode.addComponent(Sprite);
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
            preview
          };
        }

        onBoardPointerDown(boardTransform, uiX, uiY) {
          if (this.preplacePhase !== 'preplace2' || this.preplace2PointerDown || this.isPreplaceBoardInputSuppressed()) {
            return;
          }

          if (!this.isPointerNearLockedPreview(boardTransform, uiX, uiY)) {
            return;
          }

          var anchor = this.resolveAnchor(boardTransform, uiX, uiY);

          if (!anchor) {
            return;
          }

          this.preplace2PointerDown = true;
          this.preplace2PointerStartX = uiX;
          this.preplace2PointerStartY = uiY;
          this.root.on(Node.EventType.TOUCH_MOVE, this.onState2BoardDragMoveTouch, this);
          this.root.on(Node.EventType.TOUCH_END, this.onState2BoardDragEndTouch, this);
          this.root.on(Node.EventType.TOUCH_CANCEL, this.onState2BoardDragEndTouch, this);
          this.root.on(Node.EventType.MOUSE_MOVE, this.onState2BoardDragMoveMouse, this);
          this.root.on(Node.EventType.MOUSE_UP, this.onState2BoardDragEndMouse, this);
        }

        onState2BoardDragMoveTouch(event) {
          this.state2BoardDragMove(event.getUILocation().x, event.getUILocation().y);
        }

        onState2BoardDragMoveMouse(event) {
          this.state2BoardDragMove(event.getUILocation().x, event.getUILocation().y);
        }

        state2BoardDragMove(uiX, uiY) {
          if (!this.preplace2PointerDown) {
            return;
          }

          var dx = uiX - this.preplace2PointerStartX;
          var dy = uiY - this.preplace2PointerStartY;
          var dragThreshold = 8;

          if (!this.preplace2BoardDragging && dx * dx + dy * dy < dragThreshold * dragThreshold) {
            return;
          }

          this.preplace2BoardDragging = true;
          var boardTransform = this.boardNode.getComponent(UITransform);
          var anchor = this.resolveAnchor(boardTransform, uiX, uiY);

          if (anchor) {
            this.callbacks.onLockedPreplaceAnchorUpdate(anchor);
          }
        }

        onState2BoardDragEndTouch() {
          var hadDragged = this.preplace2BoardDragging;
          this.endState2BoardDrag();

          if (hadDragged) {
            this.playPreviewDropPulse();
          }
        }

        onState2BoardDragEndMouse(event) {
          if (event.getButton() !== EventMouse.BUTTON_LEFT) {
            return;
          }

          var hadDragged = this.preplace2BoardDragging;
          this.endState2BoardDrag();

          if (hadDragged) {
            this.playPreviewDropPulse();
          }
        }

        endState2BoardDrag() {
          this.preplace2PointerDown = false;
          this.preplace2BoardDragging = false;
          this.root.off(Node.EventType.TOUCH_MOVE, this.onState2BoardDragMoveTouch, this);
          this.root.off(Node.EventType.TOUCH_END, this.onState2BoardDragEndTouch, this);
          this.root.off(Node.EventType.TOUCH_CANCEL, this.onState2BoardDragEndTouch, this);
          this.root.off(Node.EventType.MOUSE_MOVE, this.onState2BoardDragMoveMouse, this);
          this.root.off(Node.EventType.MOUSE_UP, this.onState2BoardDragEndMouse, this);
        }

        createHandArea() {
          var bottomPadding = clamp(this.rootHeight * 0.02, 18, 32);
          var y = -this.rootHeight / 2 + bottomPadding + this.handPanelHeight / 2;
          var panel = this.makeHandPanelRoot('HandPanel', this.panelWidth, this.handPanelHeight, 0, y);
          this.handPanel = panel;
          this.root.addChild(panel);
          this.ensureHandViewCount(_crd && HAND_SIZE === void 0 ? (_reportPossibleCrUseOfHAND_SIZE({
            error: Error()
          }), HAND_SIZE) : HAND_SIZE);
        }

        ensureHandViewCount(count) {
          var _this = this;

          if (!this.handPanel) {
            return;
          }

          var _loop = function _loop() {
            var i = _this.handViews.length;

            var node = _this.makePanel("HandCard-" + i, _this.handCardWidth, _this.handCardHeight, 0, 0, makeColor(245, 238, 215, 255));

            var graphics = node.getComponent(Graphics);

            var artRoot = _this.makeNode("ArtRoot-" + i, _this.handCardWidth, _this.handCardHeight, 0, 0);

            node.addChild(artRoot);
            artRoot.setSiblingIndex(0);
            var artCells = [];

            for (var y = 0; y < (_crd && CARD_TEMPLATE_ROWS === void 0 ? (_reportPossibleCrUseOfCARD_TEMPLATE_ROWS({
              error: Error()
            }), CARD_TEMPLATE_ROWS) : CARD_TEMPLATE_ROWS); y++) {
              for (var x = 0; x < (_crd && CARD_TEMPLATE_COLS === void 0 ? (_reportPossibleCrUseOfCARD_TEMPLATE_COLS({
                error: Error()
              }), CARD_TEMPLATE_COLS) : CARD_TEMPLATE_COLS); x++) {
                var cellNode = _this.makeNode("ArtCell-" + i + "-" + x + "-" + y, 10, 10, 0, 0);

                var cellGraphics = cellNode.addComponent(Graphics);

                var spriteNode = _this.makeNode("ArtPlant-" + i + "-" + x + "-" + y, 10, 10, 0, 0);

                var sprite = spriteNode.addComponent(Sprite);
                sprite.sizeMode = Sprite.SizeMode.CUSTOM;
                cellNode.addChild(spriteNode);
                artRoot.addChild(cellNode);
                cellNode.active = false;
                artCells.push({
                  node: cellNode,
                  graphics: cellGraphics,
                  sprite
                });
              }
            }

            var costLabel = _this.createLabel(node, "Cost-" + i, 44, 44, -_this.handCardWidth / 2 + 28, _this.handCardHeight / 2 - 30, clamp(_this.rootWidth * 0.032, 18, 22), HorizontalTextAlignment.CENTER, VerticalTextAlignment.CENTER);

            costLabel.string = '0';

            var title = _this.createLabel(node, "Title-" + i, _this.handCardWidth - 24, 30, 0, _this.handCardHeight * 0.08, clamp(_this.rootWidth * 0.03, 17, 21), HorizontalTextAlignment.CENTER, VerticalTextAlignment.CENTER);

            var descLabel = _this.createLabel(node, "Desc-" + i, _this.handCardWidth - 20, 52, 0, -_this.handCardHeight * 0.22, clamp(_this.rootWidth * 0.024, 13, 17), HorizontalTextAlignment.CENTER, VerticalTextAlignment.TOP);

            descLabel.overflow = Label.Overflow.CLAMP;

            var typeLabel = _this.createLabel(node, "Type-" + i, _this.handCardWidth - 20, 22, 0, -_this.handCardHeight / 2 + 18, clamp(_this.rootWidth * 0.022, 12, 15), HorizontalTextAlignment.CENTER, VerticalTextAlignment.CENTER);

            node.on(Node.EventType.TOUCH_START, event => _this.onHandCardTouchStart(i, event), _this);
            node.on(Node.EventType.MOUSE_DOWN, event => _this.onHandCardMouseDown(i, event), _this);
            node.on(Node.EventType.MOUSE_ENTER, () => _this.onHandCardMouseEnter(i), _this);
            node.on(Node.EventType.MOUSE_LEAVE, () => _this.onHandCardMouseLeave(i), _this);

            _this.handPanel.addChild(node);

            _this.handViews.push({
              node,
              graphics,
              artRoot,
              artCells,
              costLabel,
              title,
              descLabel,
              typeLabel
            });
          };

          while (this.handViews.length < count) {
            _loop();
          }
        }

        makeHandPanelRoot(name, width, height, x, y) {
          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          var transform = node.addComponent(UITransform);
          transform.setContentSize(width, height);
          node.setPosition(new Vec3(x, y, 0));
          return node;
        }

        createDragArrowOnly() {
          var arrowNode = new Node('DragArrow');
          arrowNode.layer = Layers.Enum.UI_2D;
          var arrowTransform = arrowNode.addComponent(UITransform);
          arrowTransform.setContentSize(this.rootWidth, this.rootHeight);
          arrowNode.setPosition(Vec3.ZERO);
          this.dragArrow = arrowNode.addComponent(Graphics);
          this.root.addChild(arrowNode);
        }

        createPreplaceBar() {
          var bar = new Node('PreplaceBar');
          bar.layer = Layers.Enum.UI_2D;
          bar.addComponent(UITransform).setContentSize(250, 126);
          bar.setPosition(Vec3.ZERO);
          bar.active = false;
          var bw = 74;
          var bh = 42;
          var sideOffset = 88;
          var stackGap = 6;
          var groupLift = 12;
          var upperY = groupLift + bh / 2 + stackGap / 2;
          var lowerY = groupLift - bh / 2 - stackGap / 2;
          this.createPreplaceButton(bar, '旋转', -sideOffset, groupLift, bw, () => this.callbacks.onRotateRight());
          this.createPreplaceButton(bar, '放置', sideOffset, upperY, bw, () => this.callbacks.onPreplaceConfirmPlace());
          this.createPreplaceButton(bar, '取消', sideOffset, lowerY, bw, () => this.cancelPreplaceFlow());
          this.layoutPreplaceButtons(false);
          this.root.addChild(bar);
          this.preplaceBar = bar;
        }

        createPreplaceButton(parent, title, x, y, width, onClick) {
          var h = 44;
          var fillColor = title === '放置' ? makeColor(214, 242, 198, 255) : title === '取消' ? makeColor(250, 216, 201, 255) : makeColor(244, 226, 166, 255);
          var strokeColor = title === '放置' ? makeColor(76, 138, 64, 255) : title === '取消' ? makeColor(176, 91, 72, 255) : makeColor(160, 120, 50, 255);
          var node = this.makePanel("Pb-" + title, width, h, x, y, fillColor);
          var graphics = node.getComponent(Graphics);
          graphics.lineWidth = 2;
          graphics.strokeColor = strokeColor;
          graphics.roundRect(-width / 2, -h / 2, width, h, 10);
          graphics.stroke();
          var label = this.createLabel(node, "PbL-" + title, width - 8, h - 6, 0, 0, 18, HorizontalTextAlignment.CENTER, VerticalTextAlignment.CENTER);
          label.string = title;
          label.color = strokeColor;
          var hoverScale = 1.06;
          var pressScale = 0.95;
          var hoverLift = 4;

          var applyButtonVisual = (scale, liftY) => {
            var basePos = this.getPreplaceButtonBasePos(node);
            Tween.stopAllByTarget(node);
            tween(node).to(0.08, {
              scale: new Vec3(scale, scale, 1),
              position: new Vec3(basePos.x, basePos.y + liftY, 0)
            }, {
              easing: 'quadOut'
            }).start();
          };

          var triggerOnce = () => {
            var now = Date.now();

            if (this.lastPreplaceButtonTitle === title && now - this.lastPreplaceButtonAt < 80) {
              return;
            }

            this.lastPreplaceButtonTitle = title;
            this.lastPreplaceButtonAt = now;
            this.preplaceBoardInputSuppressUntil = now + 180;
            onClick();
          };

          node.on(Node.EventType.MOUSE_ENTER, () => applyButtonVisual(hoverScale, hoverLift), this);
          node.on(Node.EventType.MOUSE_LEAVE, () => applyButtonVisual(1, 0), this);
          node.on(Node.EventType.MOUSE_DOWN, event => {
            if (event.getButton() !== EventMouse.BUTTON_LEFT) {
              return;
            }

            event.propagationStopped = true;
            applyButtonVisual(pressScale, 1);
            triggerOnce();
          }, this);
          node.on(Node.EventType.MOUSE_UP, () => applyButtonVisual(hoverScale, hoverLift), this);
          node.on(Node.EventType.TOUCH_START, event => {
            event.propagationStopped = true;
            applyButtonVisual(pressScale, 1);
            triggerOnce();
          }, this);
          node.on(Node.EventType.TOUCH_END, () => applyButtonVisual(1, 0), this);
          node.on(Node.EventType.TOUCH_CANCEL, () => applyButtonVisual(1, 0), this);
          this.setPreplaceButtonBasePos(node, x, y);
          this.preplaceButtons.push({
            title,
            node
          });
          parent.addChild(node);
        }

        isPreplaceBoardInputSuppressed() {
          return Date.now() < this.preplaceBoardInputSuppressUntil;
        }

        setPreplaceButtonBasePos(node, x, y) {
          node.__basePos = new Vec3(x, y, 0);
          node.setPosition(x, y, 0);
        }

        getPreplaceButtonBasePos(node) {
          var _basePos;

          return ((_basePos = node.__basePos) != null ? _basePos : node.position).clone();
        }

        layoutPreplaceButtons(useTopStack) {
          var _this2 = this;

          if (!this.preplaceBar) {
            return;
          }

          var transform = this.preplaceBar.getComponent(UITransform);

          if (useTopStack) {
            transform.setContentSize(98, 208);
            var orderedTitles = ['旋转', '放置', '取消'];
            var startY = 56;
            var gap = 46;

            var _loop2 = function _loop2(i) {
              var button = _this2.preplaceButtons.find(item => item.title === orderedTitles[i]);

              if (button) {
                _this2.setPreplaceButtonBasePos(button.node, 0, startY - i * gap);
              }
            };

            for (var i = 0; i < orderedTitles.length; i++) {
              _loop2(i);
            }
          } else {
            transform.setContentSize(250, 126);
            var sideOffset = 88;
            var centerY = 12;
            var upperY = 36;
            var lowerY = -12;

            for (var button of this.preplaceButtons) {
              if (button.title === '旋转') {
                this.setPreplaceButtonBasePos(button.node, -sideOffset, centerY);
              } else if (button.title === '放置') {
                this.setPreplaceButtonBasePos(button.node, sideOffset, upperY);
              } else if (button.title === '取消') {
                this.setPreplaceButtonBasePos(button.node, sideOffset, lowerY);
              }
            }
          }
        }

        bindGlobalInput() {
          input.on(Input.EventType.MOUSE_DOWN, this.onGlobalMouseDown, this);
          input.on(Input.EventType.TOUCH_START, this.onGlobalTouchStart, this);
        }

        onGlobalTouchStart(event) {
          var loc = event.getUILocation();
          this.tryCloseGmPopup(loc.x, loc.y);
        }

        onGlobalMouseDown(event) {
          var loc = event.getUILocation();
          this.tryCloseGmPopup(loc.x, loc.y);

          if (this.preplacePhase === 'idle') {
            return;
          }

          if (event.getButton() === EventMouse.BUTTON_RIGHT) {
            this.cancelPreplaceFlow();
          }
        }

        tryCloseGmPopup(uiX, uiY) {
          if (!this.gmPopupOpen) {
            return;
          }

          if (this.isPointInsideNode(this.topInfoView.gmButton, uiX, uiY) || this.isPointInsideNode(this.topInfoView.gmPopup, uiX, uiY)) {
            return;
          }

          this.gmPopupOpen = false;
          this.topInfoView.gmPopup.active = false;
        }

        isPointInsideNode(node, uiX, uiY) {
          var transform = node.getComponent(UITransform);

          if (!transform || !node.activeInHierarchy) {
            return false;
          }

          var local = transform.convertToNodeSpaceAR(new Vec3(uiX, uiY, 0));
          var size = transform.contentSize;
          return Math.abs(local.x) <= size.width / 2 && Math.abs(local.y) <= size.height / 2;
        }

        isPointerNearLockedPreview(boardTransform, uiX, uiY) {
          var _this$lastRenderState, _this$lastRenderState2;

          var preview = (_this$lastRenderState = this.lastRenderState) == null ? void 0 : _this$lastRenderState.preview;

          if (!preview || !((_this$lastRenderState2 = this.lastRenderState) != null && _this$lastRenderState2.preplaceLocked)) {
            return false;
          }

          var local = boardTransform.convertToNodeSpaceAR(new Vec3(uiX, uiY, 0));
          var cellSize = this.boardSize / (_crd && BOARD_COLS === void 0 ? (_reportPossibleCrUseOfBOARD_COLS({
            error: Error()
          }), BOARD_COLS) : BOARD_COLS);
          var minX = Math.min(...preview.cells.map(cell => cell.x));
          var maxX = Math.max(...preview.cells.map(cell => cell.x));
          var minY = Math.min(...preview.cells.map(cell => cell.y));
          var maxY = Math.max(...preview.cells.map(cell => cell.y));
          var expand = cellSize * 0.28;
          var left = -this.boardSize / 2 + minX * cellSize - expand;
          var right = -this.boardSize / 2 + (maxX + 1) * cellSize + expand;
          var top = this.boardSize / 2 - minY * cellSize + expand;
          var bottom = this.boardSize / 2 - (maxY + 1) * cellSize - expand;
          return local.x >= left && local.x <= right && local.y <= top && local.y >= bottom;
        }

        getActivePlacementBounds() {
          var _ref, _this$lastRenderState3, _this$lastRenderState4, _this$lastRenderState5, _slot$card, _this$lastRenderState6, _this$lastRenderState7;

          var slot = (_ref = (_this$lastRenderState3 = (_this$lastRenderState4 = this.lastRenderState) == null ? void 0 : _this$lastRenderState4.handSlots.find(item => item.selected)) != null ? _this$lastRenderState3 : this.preplaceHandIndex !== null ? (_this$lastRenderState5 = this.lastRenderState) == null ? void 0 : _this$lastRenderState5.handSlots[this.preplaceHandIndex] : null) != null ? _ref : null;
          var card = (_slot$card = slot == null ? void 0 : slot.card) != null ? _slot$card : null;

          if (!card) {
            return {
              width: 1,
              height: 1
            };
          }

          var rotated = (_crd && rotateCardCells === void 0 ? (_reportPossibleCrUseOfrotateCardCells({
            error: Error()
          }), rotateCardCells) : rotateCardCells)(card.cells, (_this$lastRenderState6 = (_this$lastRenderState7 = this.lastRenderState) == null ? void 0 : _this$lastRenderState7.rotation) != null ? _this$lastRenderState6 : 0);
          var bounds = (_crd && getCardBounds === void 0 ? (_reportPossibleCrUseOfgetCardBounds({
            error: Error()
          }), getCardBounds) : getCardBounds)(rotated);
          return {
            width: Math.max(bounds.width, 1),
            height: Math.max(bounds.height, 1)
          };
        }

        onHandCardTouchStart(index, event) {
          event.propagationStopped = true;
          var loc = event.getUILocation();
          this.tryBeginPreplace(index, loc.y);
          this.root.on(Node.EventType.TOUCH_MOVE, this.onRootTouchMove, this);
          this.root.on(Node.EventType.TOUCH_END, this.onRootTouchEnd, this);
          this.root.on(Node.EventType.TOUCH_CANCEL, this.onRootTouchEnd, this);
        }

        onHandCardMouseDown(index, event) {
          if (event.getButton() !== EventMouse.BUTTON_LEFT) {
            return;
          }

          event.propagationStopped = true;
          var loc = event.getUILocation();
          this.tryBeginPreplace(index, loc.y);
          this.root.on(Node.EventType.MOUSE_MOVE, this.onRootMouseMove, this);
          this.root.on(Node.EventType.MOUSE_UP, this.onRootMouseUp, this);
        }

        onHandCardMouseEnter(index) {
          var _this$lastRenderState8;

          if (this.preplacePhase !== 'idle' || this.handRefillAnimRunning) {
            return;
          }

          if (!((_this$lastRenderState8 = this.lastRenderState) != null && (_this$lastRenderState8 = _this$lastRenderState8.handSlots[index]) != null && _this$lastRenderState8.card)) {
            return;
          }

          this.hoverHandIndex = index;
          this.applyHandFanLayout();
        }

        onHandCardMouseLeave(index) {
          if (this.hoverHandIndex === index) {
            this.hoverHandIndex = null;
            this.applyHandFanLayout();
          }
        }

        tryBeginPreplace(index, pointerYUi) {
          if (!this.lastRenderState || this.lastRenderState.status !== 'playing') {
            return;
          }

          var slot = this.lastRenderState.handSlots[index];
          var card = slot == null ? void 0 : slot.card;

          if (!card) {
            return;
          }

          if (card.cardKind === 'spell') {
            return;
          }

          this.cancelPreplaceFlow(false);
          this.resetPreviewRotateState();
          this.hoverHandIndex = null;
          this.preplacePhase = 'preplace1_track';
          this.preplaceHandIndex = index;
          this.handDragLiftY = 0;
          this.handDragStartY = pointerYUi != null ? pointerYUi : 0;
          this.callbacks.onBeginPlacementDrag(index);
          this.callbacks.onPreplaceHoverAnchor(null);
        }

        onRootTouchMove(event) {
          if (this.preplacePhase !== 'preplace1_track') {
            return;
          }

          var loc = event.getUILocation();
          this.updatePreplaceTracking(loc.x, loc.y);
        }

        onRootTouchEnd(event) {
          if (this.preplacePhase !== 'preplace1_track') {
            return;
          }

          var loc = event.getUILocation();
          this.finishPreplace1Track(loc.x, loc.y);
        }

        onRootMouseMove(event) {
          if (this.preplacePhase !== 'preplace1_track') {
            return;
          }

          var loc = event.getUILocation();
          this.updatePreplaceTracking(loc.x, loc.y);
        }

        onRootMouseUp(event) {
          if (this.preplacePhase !== 'preplace1_track') {
            return;
          }

          if (event.getButton() !== EventMouse.BUTTON_LEFT) {
            return;
          }

          var loc = event.getUILocation();
          this.finishPreplace1Track(loc.x, loc.y);
        }

        updatePreplaceTracking(uiX, uiY) {
          if (this.preplaceHandIndex !== null) {
            this.handDragLiftY = clamp(uiY - this.handDragStartY, 0, this.getMaxHandDragLift());
            this.applyHandFanLayout();
          }

          var boardTransform = this.boardNode.getComponent(UITransform);
          var anchor = this.resolveAnchor(boardTransform, uiX, uiY);
          this.callbacks.onPreplaceHoverAnchor(anchor);
          this.refreshArcOnly();
        }

        finishPreplace1Track(uiX, uiY) {
          this.root.off(Node.EventType.TOUCH_MOVE, this.onRootTouchMove, this);
          this.root.off(Node.EventType.TOUCH_END, this.onRootTouchEnd, this);
          this.root.off(Node.EventType.TOUCH_CANCEL, this.onRootTouchEnd, this);
          this.root.off(Node.EventType.MOUSE_MOVE, this.onRootMouseMove, this);
          this.root.off(Node.EventType.MOUSE_UP, this.onRootMouseUp, this);
          var boardTransform = this.boardNode.getComponent(UITransform);
          var anchor = this.resolveAnchor(boardTransform, uiX, uiY);

          if (!anchor) {
            this.cancelPreplaceFlow();
            return;
          }

          this.callbacks.onPreplaceHoverAnchor(anchor);
          this.enterPreplace2(anchor);
        }

        enterPreplace2(anchor) {
          this.handDragLiftY = 0;
          this.applyHandFanLayout();
          this.preplacePhase = 'preplace2';
          this.callbacks.onPreplaceCommitState2(anchor);

          if (this.preplaceBar) {
            this.preplaceBar.active = true;
          }
        }

        cancelPreplaceFlow(notify) {
          if (notify === void 0) {
            notify = true;
          }

          this.teardownTrackingListeners();
          this.resetPreviewRotateState();
          this.preplacePhase = 'idle';
          this.preplaceHandIndex = null;
          this.handDragLiftY = 0;
          this.preplace2BoardDragging = false;

          if (this.dragArrow) {
            this.dragArrow.clear();
          }

          if (this.preplaceBar) {
            this.preplaceBar.active = false;
          }

          if (notify) {
            this.callbacks.onPreplaceCancel();
          }
        }

        teardownTrackingListeners() {
          this.root.off(Node.EventType.TOUCH_MOVE, this.onRootTouchMove, this);
          this.root.off(Node.EventType.TOUCH_END, this.onRootTouchEnd, this);
          this.root.off(Node.EventType.TOUCH_CANCEL, this.onRootTouchEnd, this);
          this.root.off(Node.EventType.MOUSE_MOVE, this.onRootMouseMove, this);
          this.root.off(Node.EventType.MOUSE_UP, this.onRootMouseUp, this);
          this.endState2BoardDrag();
        }

        syncPreplaceBar(state) {
          if (!this.preplaceBar) {
            return;
          }

          this.preplaceBar.active = state.preplaceLocked;
          var opacity = this.preplaceBar.getComponent(UIOpacity);

          if (!opacity) {
            opacity = this.preplaceBar.addComponent(UIOpacity);
          }

          opacity.opacity = state.preplaceLocked ? this.preplace2BoardDragging ? 140 : 255 : 255;
          var scale = state.preplaceLocked ? this.preplace2BoardDragging ? 0.94 : 1 : 1;
          this.preplaceBar.setScale(scale, scale, 1);
        }

        refreshArcAndBarPosition(state) {
          this.refreshArcOnly();

          if (!this.preplaceBar || !state.preview) {
            return;
          }

          var center = this.previewCellsToRootCenter(state.preview.cells);
          var margin = 14;
          var sideHalfWidth = 314 / 2;
          var overflowLeft = center.x - sideHalfWidth < -this.rootWidth / 2 + margin;
          var overflowRight = center.x + sideHalfWidth > this.rootWidth / 2 - margin;
          var useTopStack = overflowLeft || overflowRight;
          this.layoutPreplaceButtons(useTopStack);
          var barTransform = this.preplaceBar.getComponent(UITransform);
          var idealX = center.x;
          var idealY = useTopStack ? center.y + clamp(this.boardSize * 0.22, 88, 120) : center.y + clamp(this.boardSize * 0.035, 10, 18);
          var x = clamp(idealX, -this.rootWidth / 2 + barTransform.contentSize.width / 2 + margin, this.rootWidth / 2 - barTransform.contentSize.width / 2 - margin);
          var y = clamp(idealY, -this.rootHeight / 2 + barTransform.contentSize.height / 2 + margin, this.rootHeight / 2 - barTransform.contentSize.height / 2 - margin);
          this.preplaceBar.setPosition(x, y, 0);
          this.preplaceBar.setSiblingIndex(this.root.children.length - 1);
        }

        refreshArcOnly() {
          var _this$lastRenderState9;

          if (!this.dragArrow || this.preplacePhase === 'idle') {
            if (this.dragArrow) {
              this.dragArrow.clear();
            }

            return;
          }

          if (!((_this$lastRenderState9 = this.lastRenderState) != null && _this$lastRenderState9.preview)) {
            this.dragArrow.clear();
            return;
          }

          if (this.preplacePhase === 'preplace2') {
            if (!this.preplaceBar) {
              this.dragArrow.clear();
              return;
            }

            var previewCenter = this.previewCellsToRootCenter(this.lastRenderState.preview.cells);
            var barCenter = this.preplaceBar.position.clone();
            this.drawPreplaceGuideLine(previewCenter, barCenter);

            if (this.dragArrow.node) {
              this.dragArrow.node.setSiblingIndex(this.root.children.length - 2);
            }

            return;
          }

          if (this.preplaceHandIndex === null) {
            this.dragArrow.clear();
            return;
          }

          var handNode = this.handViews[this.preplaceHandIndex].node;
          var tailWorld = handNode.worldPosition;
          var rootTransform = this.root.getComponent(UITransform);
          var tailLocal = rootTransform.convertToNodeSpaceAR(tailWorld);
          var headLocal = this.previewCellsToRootCenter(this.lastRenderState.preview.cells);
          this.drawDragArrow(tailLocal, headLocal);

          if (this.dragArrow.node) {
            this.dragArrow.node.setSiblingIndex(this.root.children.length - 1);
          }
        }

        previewCellsToRootCenter(cells) {
          var boardCenter = this.previewCellsToBoardCenter(cells);
          var rootTransform = this.root.getComponent(UITransform);
          var boardTransform = this.boardNode.getComponent(UITransform);
          var world = boardTransform.convertToWorldSpaceAR(boardCenter);
          return rootTransform.convertToNodeSpaceAR(world);
        }

        previewCellsToBoardCenter(cells) {
          var minX = Math.min(...cells.map(cell => cell.x));
          var maxX = Math.max(...cells.map(cell => cell.x));
          var minY = Math.min(...cells.map(cell => cell.y));
          var maxY = Math.max(...cells.map(cell => cell.y));
          var cellSize = this.boardSize / (_crd && BOARD_COLS === void 0 ? (_reportPossibleCrUseOfBOARD_COLS({
            error: Error()
          }), BOARD_COLS) : BOARD_COLS);
          var half = this.boardSize / 2;
          var bx = -half + (minX + maxX + 1) * cellSize / 2;
          var by = half - (minY + maxY + 1) * cellSize / 2;
          return new Vec3(bx, by, 0);
        }

        drawDragArrow(fromLocal, toLocal) {
          if (!this.dragArrow) {
            return;
          }

          var g = this.dragArrow;
          g.clear();
          g.lineWidth = 3;
          g.strokeColor = makeColor(72, 160, 92, 220);
          var midX = (fromLocal.x + toLocal.x) / 2 + (toLocal.y - fromLocal.y) * 0.15;
          var midY = (fromLocal.y + toLocal.y) / 2 - (toLocal.x - fromLocal.x) * 0.12;
          var segments = 14;
          g.moveTo(fromLocal.x, fromLocal.y);

          for (var i = 1; i <= segments; i++) {
            var t = i / segments;
            var omt = 1 - t;
            var bx = omt * omt * fromLocal.x + 2 * omt * t * midX + t * t * toLocal.x;
            var by = omt * omt * fromLocal.y + 2 * omt * t * midY + t * t * toLocal.y;
            g.lineTo(bx, by);
          }

          g.stroke();
        }

        drawPreplaceGuideLine(fromLocal, toLocal) {
          if (!this.dragArrow) {
            return;
          }

          var g = this.dragArrow;
          g.clear();
          g.lineWidth = 2;
          g.strokeColor = makeColor(112, 124, 148, 150);
          var midX = (fromLocal.x + toLocal.x) / 2;
          var midY = (fromLocal.y + toLocal.y) / 2 + clamp(Math.abs(toLocal.x - fromLocal.x) * 0.05, 10, 20);
          var segments = 12;
          g.moveTo(fromLocal.x, fromLocal.y);

          for (var i = 1; i <= segments; i++) {
            var t = i / segments;
            var omt = 1 - t;
            var bx = omt * omt * fromLocal.x + 2 * omt * t * midX + t * t * toLocal.x;
            var by = omt * omt * fromLocal.y + 2 * omt * t * midY + t * t * toLocal.y;
            g.lineTo(bx, by);
          }

          g.stroke();
        }

        playPreviewDropPulse() {
          Tween.stopAllByTarget(this.previewDropPulseState);
          this.previewDropPulseState.value = 1;
          tween(this.previewDropPulseState).to(0.2, {
            value: 0
          }, {
            easing: 'quadOut'
          }).start();
        }

        resetTimeWheel() {
          this.timeWheelYearIndex = 0;
          this.timeWheelSeasonIndex = 0;
          Tween.stopAllByTarget(this.topInfoView.timeWheelOuterNode);
          Tween.stopAllByTarget(this.topInfoView.timeWheelInnerNode);
          this.syncTimeWheelVisuals();
        }

        syncTimeWheelVisuals() {
          if (!this.topInfoView) {
            return;
          }

          this.topInfoView.timeWheelOuterNode.setRotationFromEuler(0, 0, 0);
          this.topInfoView.timeWheelInnerNode.setRotationFromEuler(0, 0, 0);
          this.topInfoView.timeWheelCenterNode.setRotationFromEuler(0, 0, 0);
          this.topInfoView.timeWheelPointerNode.setRotationFromEuler(0, 0, 0);
          this.topInfoView.timeWheelYearLabel.string = TIME_WHEEL_YEAR_LABELS[this.timeWheelYearIndex];
          this.topInfoView.timeWheelSeasonLabel.string = TIME_WHEEL_SEASONS[this.timeWheelSeasonIndex];
        }

        renderTopInfo(state) {
          var {
            progressGraphics,
            progressLabel,
            statsLabel,
            reserveGraphics,
            reserveLabel,
            gmPopup
          } = this.topInfoView;
          var progressTransform = progressGraphics.node.getComponent(UITransform);
          var width = progressTransform.contentSize.width;
          var height = 24;
          var radius = 12;
          var progress = state.targetScore <= 0 ? 0 : clamp(state.score / state.targetScore, 0, 1);
          var segments = Math.max(6, Math.min(10, Math.ceil(state.targetScore / 2)));
          var gap = 4;
          var innerW = width - 10;
          var segmentW = (innerW - gap * (segments - 1)) / segments;
          var fillW = innerW * progress;
          progressGraphics.clear();
          progressGraphics.fillColor = makeColor(242, 234, 214, 255);
          progressGraphics.roundRect(-width / 2, -height / 2, width, height, radius);
          progressGraphics.fill();
          var segmentX = -innerW / 2;

          for (var i = 0; i < segments; i++) {
            var filled = clamp(fillW - i * (segmentW + gap), 0, segmentW);
            progressGraphics.fillColor = makeColor(227, 214, 182, 255);
            progressGraphics.roundRect(segmentX, -height / 2 + 5, segmentW, height - 10, 6);
            progressGraphics.fill();

            if (filled > 0) {
              progressGraphics.fillColor = makeColor(112, 190, 88, 255);
              progressGraphics.roundRect(segmentX, -height / 2 + 5, filled, height - 10, 6);
              progressGraphics.fill();
            }

            segmentX += segmentW + gap;
          }

          this.syncTimeWheelVisuals();
          progressLabel.string = "\u5206\u6570 " + state.score + " / " + state.targetScore;
          statsLabel.string = ["\u724C\u5E93: " + (state.deckCount < 0 ? '∞' : state.deckCount), "\u70C2\u6C34\u679C: " + state.remainingRotten].join('\n');
          var reserveTransform = reserveGraphics.node.getComponent(UITransform);
          var reserveWidth = reserveTransform.contentSize.width;
          var reserveHeight = reserveTransform.contentSize.height;
          reserveGraphics.clear();
          reserveGraphics.fillColor = makeColor(248, 244, 232, 255);
          reserveGraphics.roundRect(-reserveWidth / 2, -reserveHeight / 2, reserveWidth, reserveHeight, 14);
          reserveGraphics.fill();
          reserveGraphics.lineWidth = 2;
          reserveGraphics.strokeColor = makeColor(214, 202, 176, 255);
          reserveGraphics.roundRect(-reserveWidth / 2, -reserveHeight / 2, reserveWidth, reserveHeight, 14);
          reserveGraphics.stroke();
          var slotW = reserveWidth * 0.28;
          var slotH = 24;
          var slotGap = 8;
          var slotY = reserveHeight / 2 - slotH - 14;

          for (var _i = 0; _i < 2; _i++) {
            var slotX = -slotW - slotGap / 2 + _i * (slotW + slotGap);
            reserveGraphics.fillColor = makeColor(236, 230, 214, 255);
            reserveGraphics.roundRect(slotX, slotY, slotW, slotH, 10);
            reserveGraphics.fill();
          }

          reserveLabel.string = ["Buff / Debuff \u9884\u7559", "\u65F6\u95F4\u8F6E\u76D8\u53F3\u4FA7\u4FDD\u7559\u6269\u5C55\u7A7A\u95F4", state.preplaceLocked ? "\u72B6\u60012\uFF1A" + rotationToText(state.rotation) : "\u7B49\u5F85\u540E\u7EED\u72B6\u6001\u8BB0\u5F55"].join('\n');
          gmPopup.active = this.gmPopupOpen;
        }

        renderHand(handSlots) {
          this.ensureHandViewCount(handSlots.length);
          this.applyHandFanLayout(handSlots.length);

          for (var i = 0; i < this.handViews.length; i++) {
            var view = this.handViews[i];
            var slot = handSlots[i];
            view.node.active = i < handSlots.length;

            if (!view.node.active) {
              continue;
            }

            var graphics = view.graphics;
            graphics.clear();

            for (var artCell of view.artCells) {
              artCell.node.active = false;
            }

            var inPreplace = this.preplaceHandIndex === i && this.preplacePhase !== 'idle';
            var isSelected = !!(slot != null && slot.selected) || inPreplace;
            graphics.fillColor = isSelected ? makeColor(255, 243, 168, 255) : makeColor(245, 238, 215, 255);
            graphics.roundRect(-this.handCardWidth / 2, -this.handCardHeight / 2, this.handCardWidth, this.handCardHeight, 16);
            graphics.fill();
            graphics.lineWidth = isSelected ? 6 : 3;
            graphics.strokeColor = isSelected ? makeColor(223, 164, 43, 255) : makeColor(171, 141, 96, 255);
            graphics.roundRect(-this.handCardWidth / 2, -this.handCardHeight / 2, this.handCardWidth, this.handCardHeight, 16);
            graphics.stroke();

            if (!slot || !slot.card) {
              view.title.string = '空';
              view.descLabel.string = '';
              view.costLabel.string = '';
              view.typeLabel.string = '';
              continue;
            }

            var card = slot.card;
            var artTop = this.handCardHeight * 0.12;
            var artH = this.handCardHeight * 0.38;
            var artW = this.handCardWidth - 36;
            var gap = 6;
            var cellW = (artW - gap * ((_crd && CARD_TEMPLATE_COLS === void 0 ? (_reportPossibleCrUseOfCARD_TEMPLATE_COLS({
              error: Error()
            }), CARD_TEMPLATE_COLS) : CARD_TEMPLATE_COLS) - 1)) / (_crd && CARD_TEMPLATE_COLS === void 0 ? (_reportPossibleCrUseOfCARD_TEMPLATE_COLS({
              error: Error()
            }), CARD_TEMPLATE_COLS) : CARD_TEMPLATE_COLS);
            var cellH = (artH - gap * ((_crd && CARD_TEMPLATE_ROWS === void 0 ? (_reportPossibleCrUseOfCARD_TEMPLATE_ROWS({
              error: Error()
            }), CARD_TEMPLATE_ROWS) : CARD_TEMPLATE_ROWS) - 1)) / (_crd && CARD_TEMPLATE_ROWS === void 0 ? (_reportPossibleCrUseOfCARD_TEMPLATE_ROWS({
              error: Error()
            }), CARD_TEMPLATE_ROWS) : CARD_TEMPLATE_ROWS);
            var originX = -artW / 2;
            var artTopY = this.handCardHeight / 2 - artTop;

            for (var cell of card.cells) {
              var _artCell$node$getComp, _cell$plantVariant;

              var x = originX + cell.x * (cellW + gap); // 手牌上的格子朝向要与棋盘放置预览一致：cell.y 越大，视觉上越靠下。

              var y = artTopY - cell.y * (cellH + gap) - cellH;
              var artIndex = cell.y * (_crd && CARD_TEMPLATE_COLS === void 0 ? (_reportPossibleCrUseOfCARD_TEMPLATE_COLS({
                error: Error()
              }), CARD_TEMPLATE_COLS) : CARD_TEMPLATE_COLS) + cell.x;
              var _artCell = view.artCells[artIndex];

              if (!_artCell) {
                continue;
              }

              _artCell.node.active = true;

              _artCell.node.setPosition(x + cellW / 2, y + cellH / 2, 0);

              (_artCell$node$getComp = _artCell.node.getComponent(UITransform)) == null || _artCell$node$getComp.setContentSize(cellW, cellH);

              _artCell.graphics.clear();

              _artCell.graphics.fillColor = fruitColor(cell.color, 28);

              _artCell.graphics.roundRect(-cellW / 2, -cellH / 2, cellW, cellH, 8);

              _artCell.graphics.fill();

              _artCell.graphics.lineWidth = 3;
              _artCell.graphics.strokeColor = fruitColor(cell.color, 255);

              _artCell.graphics.roundRect(-cellW / 2, -cellH / 2, cellW, cellH, 8);

              _artCell.graphics.stroke();

              var spriteMaxWidth = cellW * 0.82;
              var spriteMaxHeight = cellH * 0.88;
              this.setPlantSpriteFit(_artCell.sprite, spriteMaxWidth, spriteMaxHeight, -cellH * 0.34);
              this.loadSpriteFrameByUuid(this.getPlantSpriteUuidByVariant((_cell$plantVariant = cell.plantVariant) != null ? _cell$plantVariant : 0), _artCell.sprite);
            }

            view.costLabel.string = '0';
            view.title.string = card.label;
            var kind = card.cardKind === 'spell' ? '法术卡' : '放置卡';
            view.typeLabel.string = kind;

            if (card.cardKind === 'spell') {
              view.descLabel.string = '暂未开放';
              view.descLabel.color = makeColor(120, 120, 120, 255);
            } else {
              view.descLabel.string = '拖出后在放置区松手进入确认，可在棋盘拖动改位';
              view.descLabel.color = slot.canPlace ? makeColor(76, 126, 65, 255) : makeColor(170, 83, 69, 255);
            }
          }
        }

        getFanSlotTransform(index, count) {
          var center = (count - 1) / 2;
          var crowd = clamp((count - 1) / 5, 0, 1);
          var maxTiltDeg = lerp(11, 4, crowd);
          var spreadX = count <= 1 ? 0 : Math.min(clamp(this.handCardWidth * 0.48, 62, 92), (this.panelWidth - this.handCardWidth * 1.1) / Math.max(count - 1, 1));
          var arcLift = lerp(clamp(this.handCardHeight * 0.07, 10, 18), clamp(this.handCardHeight * 0.025, 4, 8), crowd);
          var sinkY = -this.handPanelHeight * 0.32;
          var t = count > 1 ? (index - center) / center : 0;
          var zDeg = -t * maxTiltDeg;
          var x = t * spreadX;
          var y = sinkY + (1 - Math.abs(t)) * arcLift;
          return {
            x,
            y,
            zDeg
          };
        }

        getHandBaseScale(count) {
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

        applyHandFanLayout(activeCount) {
          if (activeCount === void 0) {
            var _this$lastRenderState10, _this$lastRenderState11;

            activeCount = (_this$lastRenderState10 = (_this$lastRenderState11 = this.lastRenderState) == null ? void 0 : _this$lastRenderState11.handSlots.length) != null ? _this$lastRenderState10 : 0;
          }

          if (!this.handPanel || this.handRefillAnimRunning) {
            return;
          }

          var count = activeCount;
          var baseScale = this.getHandBaseScale(count);

          for (var i = 0; i < count; i++) {
            var _this$lastRenderState12;

            var view = this.handViews[i];
            var node = view.node;

            if (node.parent !== this.handPanel) {
              continue;
            }

            var tr = this.getFanSlotTransform(i, count);
            var x = tr.x;
            var y = tr.y;
            var zDeg = tr.zDeg;
            var sc = baseScale;

            if (this.preplacePhase === 'idle' && this.hoverHandIndex === i && (_this$lastRenderState12 = this.lastRenderState) != null && (_this$lastRenderState12 = _this$lastRenderState12.handSlots[i]) != null && _this$lastRenderState12.card) {
              y += clamp(this.handCardHeight * 0.14, 22, 38);
              sc = baseScale * 1.09;
            }

            if (this.preplacePhase === 'preplace1_track' && this.preplaceHandIndex === i) {
              y += this.handDragLiftY + 18;
              zDeg = 0;
              sc = Math.max(baseScale, 1) * 1.08;
            }

            node.setPosition(x, y, 0);
            node.setScale(sc, sc, 1);
            node.setRotationFromEuler(0, 0, zDeg);
          }

          for (var _i2 = count; _i2 < this.handViews.length; _i2++) {
            this.handViews[_i2].node.active = false;
          }

          this.reorderHandSiblingsForHover(count);
        }

        reorderHandSiblingsForHover(activeCount) {
          if (activeCount === void 0) {
            var _this$lastRenderState13, _this$lastRenderState14;

            activeCount = (_this$lastRenderState13 = (_this$lastRenderState14 = this.lastRenderState) == null ? void 0 : _this$lastRenderState14.handSlots.length) != null ? _this$lastRenderState13 : 0;
          }

          if (!this.handPanel) {
            return;
          }

          var order = Array.from({
            length: activeCount
          }, (_, i) => i);

          if (this.preplacePhase !== 'idle' && this.preplaceHandIndex !== null) {
            order = order.filter(i => i !== this.preplaceHandIndex);
            order.push(this.preplaceHandIndex);
          } else if (this.preplacePhase === 'idle' && this.hoverHandIndex !== null) {
            var h = this.hoverHandIndex;
            order = order.filter(i => i !== h);
            order.push(h);
          }

          var z = 0;

          for (var i of order) {
            var n = this.handViews[i].node;

            if (n.parent === this.handPanel && n.active) {
              n.setSiblingIndex(z);
              z++;
            }
          }
        }

        pickDistinctStart(base, used) {
          var step = 14;
          var p = base.clone();
          var guard = 0;

          while (guard < 12 && used.some(u => Math.abs(u.x - p.x) < 1 && Math.abs(u.y - p.y) < 1)) {
            p = p.add3f(step, 0, 0);
            guard++;
          }

          used.push(p.clone());
          return p;
        }

        syncPreviewRotateTween(state) {
          var preview = state.preview;

          if (!preview) {
            Tween.stopAllByTarget(this.previewRotateTweenState);
            this.previewRotateTweenState.extraDeg = 0;
            this.previewRotateTweenState.offsetX = 0;
            this.previewRotateTweenState.offsetY = 0;
            this.previewRotateAnchorKey = '';
            this.previewRotateLogical = 0;
            return;
          }

          var anchorKey = preview.anchor.x + "," + preview.anchor.y + ":" + (state.preplaceLocked ? 'locked' : 'free');

          if (!state.preplaceLocked) {
            Tween.stopAllByTarget(this.previewRotateTweenState);
            this.previewRotateTweenState.extraDeg = 0;
            this.previewRotateTweenState.offsetX = 0;
            this.previewRotateTweenState.offsetY = 0;
            this.previewRotateAnchorKey = anchorKey;
            this.previewRotateLogical = state.rotation;
            return;
          }

          if (this.previewRotateAnchorKey !== anchorKey) {
            Tween.stopAllByTarget(this.previewRotateTweenState);
            this.previewRotateTweenState.extraDeg = 0;
            this.previewRotateTweenState.offsetX = 0;
            this.previewRotateTweenState.offsetY = 0;
            this.previewRotateAnchorKey = anchorKey;
            this.previewRotateLogical = state.rotation;
            return;
          }

          if (this.previewRotateLogical !== state.rotation) {
            var _this$lastRenderState15, _this$lastRenderState16;

            var prevPreview = (_this$lastRenderState15 = (_this$lastRenderState16 = this.lastRenderState) == null ? void 0 : _this$lastRenderState16.preview) != null ? _this$lastRenderState15 : null;
            this.previewRotateLogical = state.rotation;
            Tween.stopAllByTarget(this.previewRotateTweenState);
            this.previewRotateTweenState.extraDeg = state.rotationStep > 0 ? 90 : state.rotationStep < 0 ? -90 : 0;

            if (prevPreview) {
              var prevCenter = this.previewCellsToBoardCenter(prevPreview.cells);
              var nextCenter = this.previewCellsToBoardCenter(preview.cells);
              this.previewRotateTweenState.offsetX = prevCenter.x - nextCenter.x;
              this.previewRotateTweenState.offsetY = prevCenter.y - nextCenter.y;
            } else {
              this.previewRotateTweenState.offsetX = 0;
              this.previewRotateTweenState.offsetY = 0;
            }

            tween(this.previewRotateTweenState).to(0.18, {
              extraDeg: 0,
              offsetX: 0,
              offsetY: 0
            }, {
              easing: 'quadOut'
            }).start();
          }
        }

        rotatePointAroundPivot(x, y, pivotX, pivotY, angleRad) {
          if (Math.abs(angleRad) < 0.0001) {
            return {
              x,
              y
            };
          }

          var dx = x - pivotX;
          var dy = y - pivotY;
          var cos = Math.cos(angleRad);
          var sin = Math.sin(angleRad);
          return {
            x: pivotX + dx * cos - dy * sin,
            y: pivotY + dx * sin + dy * cos
          };
        }

        tracePreviewRect(graphics, x, y, width, height, pivotX, pivotY, angleRad) {
          if (Math.abs(angleRad) < 0.0001) {
            graphics.rect(x, y, width, height);
            return;
          }

          var corners = [this.rotatePointAroundPivot(x, y, pivotX, pivotY, angleRad), this.rotatePointAroundPivot(x + width, y, pivotX, pivotY, angleRad), this.rotatePointAroundPivot(x + width, y + height, pivotX, pivotY, angleRad), this.rotatePointAroundPivot(x, y + height, pivotX, pivotY, angleRad)];
          graphics.moveTo(corners[0].x, corners[0].y);
          graphics.lineTo(corners[1].x, corners[1].y);
          graphics.lineTo(corners[2].x, corners[2].y);
          graphics.lineTo(corners[3].x, corners[3].y);
          graphics.lineTo(corners[0].x, corners[0].y);
        }

        startHandRefillAnimation(removedIdx, snap, oldIds, handSlots) {
          var _this3 = this;

          if (!this.handPanel) {
            return;
          }

          this.ensureHandViewCount(handSlots.length);

          for (var v of this.handViews) {
            Tween.stopAllByTarget(v.node);
          }

          this.handRefillAnimRunning = true;
          this.hoverHandIndex = null;
          var durationSlide = 0.38;
          var durationFly = 0.52;
          var usedStarts = [];
          var remaining = 0;

          var onOneDone = () => {
            remaining--;

            if (remaining <= 0) {
              this.handRefillAnimRunning = false;

              for (var _v of this.handViews) {
                _v.node.setScale(1, 1, 1);
              }

              this.applyHandFanLayout();
            }
          };

          var _loop3 = function _loop3() {
            var _slot$card2;

            var node = _this3.handViews[i].node;
            var slot = handSlots[i];

            var target = _this3.getFanSlotTransform(i, handSlots.length);

            var targetPos = new Vec3(target.x, target.y, 0);
            var targetEuler = new Vec3(0, 0, target.zDeg);
            node.setScale(1, 1, 1);
            node.active = true;
            var card = (_slot$card2 = slot == null ? void 0 : slot.card) != null ? _slot$card2 : null;

            if (!card) {
              var _snap$positions$i;

              var base = (_snap$positions$i = snap.positions[i]) != null ? _snap$positions$i : targetPos;

              var startPos = _this3.pickDistinctStart(base, usedStarts);

              node.setPosition(startPos);
              node.setRotationFromEuler(snap.eulers[i].x, snap.eulers[i].y, snap.eulers[i].z);
              remaining++;
              tween(node).to(durationSlide, {
                position: targetPos,
                eulerAngles: targetEuler
              }, {
                easing: 'quadOut'
              }).call(onOneDone).start();
              return 0; // continue
            }

            var oldJ = oldIds.findIndex(id => id !== null && id === card.id);

            if (oldJ === removedIdx) {
              oldJ = -1;
            }

            if (oldJ >= 0) {
              var _base = snap.positions[oldJ].clone();

              var _startPos = _this3.pickDistinctStart(_base, usedStarts);

              var startEuler = snap.eulers[oldJ].clone();
              node.setPosition(_startPos);
              node.setRotationFromEuler(startEuler.x, startEuler.y, startEuler.z);
              remaining++;
              tween(node).to(durationSlide, {
                position: targetPos,
                eulerAngles: targetEuler
              }, {
                easing: 'quadOut'
              }).call(onOneDone).start();
              return 0; // continue
            }

            var rightX = _this3.panelWidth * 0.52 + _this3.handCardWidth;
            var midX = (rightX + target.x) * 0.55;
            var midY = Math.max(target.y, -_this3.handPanelHeight * 0.1) + clamp(_this3.handCardHeight * 0.55, 70, 110);
            var p0 = new Vec3(rightX, target.y + 40, 0);
            var p1 = new Vec3(midX, midY, 0);
            var p2 = targetPos.clone();
            var startZ = target.zDeg * 0.35;
            node.setPosition(p0);
            node.setRotationFromEuler(0, 0, startZ);
            remaining++;
            var proxy = {
              t: 0
            };
            tween(proxy).to(durationFly, {
              t: 1
            }, {
              easing: 'quadOut',
              onUpdate: value => {
                var t = clamp(value.t, 0, 1);
                var omt = 1 - t;
                var x = omt * omt * p0.x + 2 * omt * t * p1.x + t * t * p2.x;
                var y = omt * omt * p0.y + 2 * omt * t * p1.y + t * t * p2.y;
                node.setPosition(x, y, 0);
                var ez = lerp(startZ, targetEuler.z, t);
                node.setRotationFromEuler(0, 0, ez);
              }
            }).call(onOneDone).start();
          },
              _ret;

          for (var i = 0; i < handSlots.length; i++) {
            _ret = _loop3();
            if (_ret === 0) continue;
          }

          if (remaining === 0) {
            this.handRefillAnimRunning = false;
          }

          for (var _i3 = handSlots.length; _i3 < this.handViews.length; _i3++) {
            this.handViews[_i3].node.active = false;
          }
        }

        syncBoardPlants(state, cellSize) {
          var visible = [];
          var cellPad = clamp(cellSize * 0.12, 6, 10);
          var borderW = cellSize - cellPad * 2;
          var borderH = cellSize - cellPad * 2;

          for (var y = 0; y < (_crd && BOARD_ROWS === void 0 ? (_reportPossibleCrUseOfBOARD_ROWS({
            error: Error()
          }), BOARD_ROWS) : BOARD_ROWS); y++) {
            for (var x = 0; x < (_crd && BOARD_COLS === void 0 ? (_reportPossibleCrUseOfBOARD_COLS({
              error: Error()
            }), BOARD_COLS) : BOARD_COLS); x++) {
              var _view$node$getCompone;

              var cell = state.board[y][x];
              var view = this.boardPlantViews[y * (_crd && BOARD_COLS === void 0 ? (_reportPossibleCrUseOfBOARD_COLS({
                error: Error()
              }), BOARD_COLS) : BOARD_COLS) + x];

              if (!cell.baseColor || cell.rotten || cell.plantVariant === null) {
                view.node.active = false;
                continue;
              }

              var centerX = -this.boardSize / 2 + cellSize * (x + 0.5);
              var centerY = this.boardSize / 2 - cellSize * (y + 0.5);
              view.row = y;
              view.col = x;
              view.preview = false;
              view.node.active = true;
              view.node.setPosition(centerX, centerY, 0);
              (_view$node$getCompone = view.node.getComponent(UITransform)) == null || _view$node$getCompone.setContentSize(cellSize, cellSize);
              view.graphics.clear();
              view.graphics.fillColor = fruitColor(cell.baseColor, 22);
              view.graphics.roundRect(-borderW / 2, -borderH / 2, borderW, borderH, 8);
              view.graphics.fill();
              view.graphics.lineWidth = 3;
              view.graphics.strokeColor = fruitColor(cell.baseColor, 255);
              view.graphics.roundRect(-borderW / 2, -borderH / 2, borderW, borderH, 8);
              view.graphics.stroke();
              view.sprite.color = makeColor(255, 255, 255, 255);
              this.setPlantSpriteFit(view.sprite, cellSize * 0.8, cellSize * 1.18, -cellSize * 0.36);
              this.loadSpriteFrameByUuid(this.getPlantSpriteUuidByVariant(cell.plantVariant), view.sprite);
              visible.push(view);
            }
          }

          for (var _view of this.previewPlantViews) {
            _view.node.active = false;
          }

          if (state.preview) {
            var previewOffsetX = state.preplaceLocked ? this.previewRotateTweenState.offsetX : 0;
            var previewOffsetY = state.preplaceLocked ? this.previewRotateTweenState.offsetY : 0;
            var previewIndex = 0;

            for (var _cell of state.preview.cells) {
              var _view2$node$getCompon;

              if (previewIndex >= this.previewPlantViews.length || _cell.blocked || _cell.overlapsSame || _cell.overlapsDiff || _cell.plantVariant === null) {
                continue;
              }

              var _view2 = this.previewPlantViews[previewIndex++];

              var _centerX = -this.boardSize / 2 + cellSize * (_cell.x + 0.5) + previewOffsetX;

              var _centerY = this.boardSize / 2 - cellSize * (_cell.y + 0.5) + previewOffsetY;

              _view2.row = _cell.y;
              _view2.col = _cell.x;
              _view2.preview = true;
              _view2.node.active = true;

              _view2.node.setPosition(_centerX, _centerY, 0);

              (_view2$node$getCompon = _view2.node.getComponent(UITransform)) == null || _view2$node$getCompon.setContentSize(cellSize, cellSize);

              _view2.graphics.clear();

              _view2.graphics.fillColor = fruitColor(_cell.color, 18);

              _view2.graphics.roundRect(-borderW / 2, -borderH / 2, borderW, borderH, 8);

              _view2.graphics.fill();

              _view2.graphics.lineWidth = 3;
              _view2.graphics.strokeColor = fruitColor(_cell.color, 210);

              _view2.graphics.roundRect(-borderW / 2, -borderH / 2, borderW, borderH, 8);

              _view2.graphics.stroke();

              _view2.sprite.color = makeColor(255, 255, 255, state.preplaceLocked ? 220 : 170);
              this.setPlantSpriteFit(_view2.sprite, cellSize * 0.8, cellSize * 1.12, -cellSize * 0.36);
              this.loadSpriteFrameByUuid(this.getPlantSpriteUuidByVariant(_cell.plantVariant), _view2.sprite);
              visible.push(_view2);
            }
          }

          visible.sort((a, b) => {
            if (a.row !== b.row) {
              return a.row - b.row;
            }

            if (a.preview !== b.preview) {
              return a.preview ? 1 : -1;
            }

            return a.col - b.col;
          });

          for (var i = 0; i < visible.length; i++) {
            visible[i].node.setSiblingIndex(i);
          }
        }

        drawBoard(state) {
          var graphics = this.boardGraphics;
          var cellSize = this.boardSize / (_crd && BOARD_COLS === void 0 ? (_reportPossibleCrUseOfBOARD_COLS({
            error: Error()
          }), BOARD_COLS) : BOARD_COLS);
          var phase = state.flashPhase;
          graphics.clear();
          graphics.fillColor = makeColor(234, 223, 194, 255);
          graphics.roundRect(-this.boardSize / 2, -this.boardSize / 2, this.boardSize, this.boardSize, 20);
          graphics.fill();

          for (var y = 0; y < (_crd && BOARD_ROWS === void 0 ? (_reportPossibleCrUseOfBOARD_ROWS({
            error: Error()
          }), BOARD_ROWS) : BOARD_ROWS); y++) {
            for (var x = 0; x < (_crd && BOARD_COLS === void 0 ? (_reportPossibleCrUseOfBOARD_COLS({
              error: Error()
            }), BOARD_COLS) : BOARD_COLS); x++) {
              var cell = state.board[y][x];
              var left = -this.boardSize / 2 + cellSize * x;
              var top = this.boardSize / 2 - cellSize * y;
              var levelLabel = this.levelLabels[y][x];
              this.cellLabels[y][x].fontSize = 20;
              levelLabel.fontSize = clamp(cellSize * 0.17, 12, 17);

              if (cell.rotten) {
                graphics.fillColor = makeColor(107, 80, 67, 255);
                graphics.rect(left + 3, top - cellSize + 3, cellSize - 6, cellSize - 6);
                graphics.fill();
                this.cellLabels[y][x].string = 'X';
                this.cellLabels[y][x].color = makeColor(255, 255, 255, 255);
                levelLabel.string = '';
              } else if (cell.baseColor) {
                this.cellLabels[y][x].string = '';
                this.cellLabels[y][x].color = makeColor(72, 58, 45, 255);

                if (cell.diceIndex >= 0) {
                  var tagW = cellSize * 0.68;
                  var tagH = cellSize * 0.2;
                  var tagX = left + (cellSize - tagW) / 2;
                  var tagY = top - cellSize * 0.985;
                  graphics.fillColor = makeColor(62, 62, 66, 168);
                  graphics.roundRect(tagX, tagY, tagW, tagH, 9);
                  graphics.fill();
                  graphics.fillColor = makeColor(255, 255, 255, 34);
                  graphics.roundRect(tagX + 2, tagY + tagH * 0.08, tagW - 4, tagH * 0.34, 7);
                  graphics.fill();
                  graphics.lineWidth = 2;
                  graphics.strokeColor = makeColor(228, 220, 202, 120);
                  graphics.roundRect(tagX, tagY, tagW, tagH, 9);
                  graphics.stroke();
                }

                levelLabel.string = cell.diceIndex >= 0 ? "Lv." + (cell.diceIndex + 2) : '';
                levelLabel.color = cell.diceIndex >= 0 ? makeColor(246, 238, 221, 255) : makeColor(88, 66, 40, 255);
              } else {
                this.cellLabels[y][x].string = '';
                levelLabel.string = '';
              }
            }
          }

          this.syncBoardPlants(state, cellSize);

          if (state.preview) {
            var preview = state.preview;
            var previewOffsetX = state.preplaceLocked ? this.previewRotateTweenState.offsetX : 0;
            var previewOffsetY = state.preplaceLocked ? this.previewRotateTweenState.offsetY : 0;
            var minX = Math.min(...preview.cells.map(c => c.x));
            var maxX = Math.max(...preview.cells.map(c => c.x));
            var minY = Math.min(...preview.cells.map(c => c.y));
            var maxY = Math.max(...preview.cells.map(c => c.y));
            var outerLeft = -this.boardSize / 2 + cellSize * minX + previewOffsetX;
            var outerTop = this.boardSize / 2 - cellSize * minY + previewOffsetY;
            var outerW = cellSize * (maxX - minX + 1);
            var outerH = cellSize * (maxY - minY + 1);
            var previewPivotX = outerLeft + outerW / 2;
            var previewPivotY = outerTop - outerH / 2;
            var previewAngleRad = state.preplaceLocked ? this.previewRotateTweenState.extraDeg * Math.PI / 180 : 0;

            for (var _cell2 of preview.cells) {
              var _left = -this.boardSize / 2 + cellSize * _cell2.x + previewOffsetX;

              var _top = this.boardSize / 2 - cellSize * _cell2.y + previewOffsetY;

              var pad = _cell2.blocked ? 8 : 10;
              var rectX = _left + pad;
              var rectY = _top - cellSize + pad;
              var rectW = cellSize - pad * 2;
              var rectH = cellSize - pad * 2;

              if (_cell2.blocked) {
                graphics.fillColor = makeColor(85, 64, 58, 120);
                this.tracePreviewRect(graphics, rectX, rectY, rectW, rectH, previewPivotX, previewPivotY, previewAngleRad);
                graphics.fill();
              } else if (_cell2.overlapsSame || _cell2.overlapsDiff) {
                graphics.fillColor = makeColor(88, 88, 92, state.preplaceLocked ? 178 : 146);
                this.tracePreviewRect(graphics, rectX, rectY, rectW, rectH, previewPivotX, previewPivotY, previewAngleRad);
                graphics.fill();
                graphics.lineWidth = 2;
                graphics.strokeColor = makeColor(218, 214, 205, state.preplaceLocked ? 168 : 132);
                this.tracePreviewRect(graphics, rectX, rectY, rectW, rectH, previewPivotX, previewPivotY, previewAngleRad);
                graphics.stroke();
              }

              if (!_cell2.blocked && _cell2.overlapsSame) {
                var mark = this.cellLabels[_cell2.y][_cell2.x];
                mark.string = '✓';
                mark.fontSize = clamp(cellSize * 0.42, 22, 34);
                mark.color = makeColor(25, 170, 72, 255);
              } else if (!_cell2.blocked && _cell2.overlapsDiff) {
                var _mark = this.cellLabels[_cell2.y][_cell2.x];
                _mark.string = '✕';
                _mark.fontSize = clamp(cellSize * 0.42, 22, 34);
                _mark.color = makeColor(225, 54, 44, 255);
              } else if (state.preplaceLocked) {
                if (_cell2.overlapsSame || _cell2.overlapsDiff) {// handled by explicit mark rendering above
                }
              } else {
                graphics.lineWidth = 2;

                if (_cell2.overlapsSame || _cell2.overlapsDiff) {// overlap state now uses gray badge + mark only
                }
              }
            }

            if (state.preplaceLocked) {
              var dragHintAlpha = flashAlpha(phase, 70, 60);
              var draggingBoost = this.preplace2BoardDragging ? 35 : 0;
              var dropPulse = this.previewDropPulseState.value;

              if (this.preplace2BoardDragging) {
                graphics.fillColor = preview.isValid ? makeColor(96, 208, 132, 42) : makeColor(222, 118, 96, 42);
                this.tracePreviewRect(graphics, outerLeft - 16, outerTop - outerH - 16, outerW + 32, outerH + 32, previewPivotX, previewPivotY, previewAngleRad);
                graphics.fill();
                graphics.fillColor = preview.isValid ? makeColor(96, 208, 132, 24) : makeColor(222, 118, 96, 24);
                this.tracePreviewRect(graphics, outerLeft - 24, outerTop - outerH - 24, outerW + 48, outerH + 48, previewPivotX, previewPivotY, previewAngleRad);
                graphics.fill();
              }

              graphics.lineWidth = 3;
              graphics.strokeColor = preview.isValid ? makeColor(60, 150, 84, dragHintAlpha + draggingBoost) : makeColor(190, 88, 70, dragHintAlpha + draggingBoost);
              this.tracePreviewRect(graphics, outerLeft - 6, outerTop - outerH - 6, outerW + 12, outerH + 12, previewPivotX, previewPivotY, previewAngleRad);
              graphics.stroke();
              var handleY = outerTop + 16;
              var dotR = clamp(cellSize * 0.07, 3, 5);
              var dotGap = dotR * 3.2;
              graphics.fillColor = makeColor(88, 76, 58, this.preplace2BoardDragging ? 225 : 185);

              for (var offset of [-dotGap, 0, dotGap]) {
                var p = this.rotatePointAroundPivot(previewPivotX + offset, handleY, previewPivotX, previewPivotY, previewAngleRad);
                graphics.circle(p.x, p.y, dotR);
                graphics.fill();
              }

              if (this.preplace2BoardDragging) {
                graphics.lineWidth = 4;
                graphics.strokeColor = preview.isValid ? makeColor(78, 182, 108, 245) : makeColor(210, 94, 72, 245);
                this.tracePreviewRect(graphics, outerLeft - 11, outerTop - outerH - 11, outerW + 22, outerH + 22, previewPivotX, previewPivotY, previewAngleRad);
                graphics.stroke();
              }

              if (dropPulse > 0.001) {
                var pulseGrow = lerp(18, 0, 1 - dropPulse);
                var pulseAlpha = Math.floor(lerp(0, 165, dropPulse));
                graphics.lineWidth = 3;
                graphics.strokeColor = preview.isValid ? makeColor(96, 198, 124, pulseAlpha) : makeColor(220, 118, 96, pulseAlpha);
                this.tracePreviewRect(graphics, outerLeft - pulseGrow, outerTop - outerH - pulseGrow, outerW + pulseGrow * 2, outerH + pulseGrow * 2, previewPivotX, previewPivotY, previewAngleRad);
                graphics.stroke();
              }
            }

            var outerThick = state.preplaceLocked ? 5 : 4;
            graphics.lineWidth = outerThick;
            var oa = 240;
            graphics.strokeColor = preview.isValid ? makeColor(50, 140, 70, oa) : makeColor(180, 70, 55, oa);
            this.tracePreviewRect(graphics, outerLeft + 4, outerTop - outerH + 4, outerW - 8, outerH - 8, previewPivotX, previewPivotY, previewAngleRad);
            graphics.stroke();
          }

          graphics.strokeColor = makeColor(170, 154, 120, 255);
          graphics.lineWidth = 2;

          for (var _x2 = 0; _x2 <= (_crd && BOARD_COLS === void 0 ? (_reportPossibleCrUseOfBOARD_COLS({
            error: Error()
          }), BOARD_COLS) : BOARD_COLS); _x2++) {
            var drawX = -this.boardSize / 2 + cellSize * _x2;
            graphics.moveTo(drawX, -this.boardSize / 2);
            graphics.lineTo(drawX, this.boardSize / 2);
          }

          for (var _y2 = 0; _y2 <= (_crd && BOARD_ROWS === void 0 ? (_reportPossibleCrUseOfBOARD_ROWS({
            error: Error()
          }), BOARD_ROWS) : BOARD_ROWS); _y2++) {
            var drawY = this.boardSize / 2 - cellSize * _y2;
            graphics.moveTo(-this.boardSize / 2, drawY);
            graphics.lineTo(this.boardSize / 2, drawY);
          }

          graphics.stroke();
        }

        createLabel(parent, name, width, height, x, y, fontSize, horizontal, vertical) {
          var node = this.makeNode(name, width, height, x, y);
          var label = node.addComponent(Label);
          label.fontSize = fontSize;
          label.lineHeight = fontSize + 8;
          label.horizontalAlign = horizontal;
          label.verticalAlign = vertical;
          label.color = makeColor(74, 60, 44, 255);
          parent.addChild(node);
          return label;
        }

        makePanel(name, width, height, x, y, color) {
          var node = this.makeNode(name, width, height, x, y);
          var graphics = node.addComponent(Graphics);
          graphics.fillColor = color;
          graphics.roundRect(-width / 2, -height / 2, width, height, clamp(Math.min(width, height) * 0.08, 14, 18));
          graphics.fill();
          return node;
        }

        makeNode(name, width, height, x, y) {
          var node = new Node(name);
          node.layer = Layers.Enum.UI_2D;
          var transform = node.addComponent(UITransform);
          transform.setContentSize(width, height);
          node.setPosition(new Vec3(x, y, 0));
          return node;
        }

        resolveAnchor(boardTransform, uiX, uiY) {
          var local = boardTransform.convertToNodeSpaceAR(new Vec3(uiX, uiY, 0));
          var half = this.boardSize / 2;

          if (local.x < -half || local.x >= half || local.y <= -half || local.y > half) {
            return null;
          }

          var cellSize = this.boardSize / (_crd && BOARD_COLS === void 0 ? (_reportPossibleCrUseOfBOARD_COLS({
            error: Error()
          }), BOARD_COLS) : BOARD_COLS);
          var pointerCellX = Math.floor((local.x + half) / cellSize);
          var pointerCellY = Math.floor((half - local.y) / cellSize);
          var activeBounds = this.getActivePlacementBounds();
          var x = clamp(pointerCellX - (activeBounds.width - 1), 0, (_crd && BOARD_COLS === void 0 ? (_reportPossibleCrUseOfBOARD_COLS({
            error: Error()
          }), BOARD_COLS) : BOARD_COLS) - activeBounds.width);
          var y = clamp(pointerCellY - (activeBounds.height - 1), 0, (_crd && BOARD_ROWS === void 0 ? (_reportPossibleCrUseOfBOARD_ROWS({
            error: Error()
          }), BOARD_ROWS) : BOARD_ROWS) - activeBounds.height);
          return {
            x,
            y
          };
        }

        measureLayout() {
          var _contentSize$width, _contentSize$height;

          var rootTransform = this.root.getComponent(UITransform);
          var contentSize = rootTransform == null ? void 0 : rootTransform.contentSize;
          this.rootWidth = Math.max((_contentSize$width = contentSize == null ? void 0 : contentSize.width) != null ? _contentSize$width : 720, 360);
          this.rootHeight = Math.max((_contentSize$height = contentSize == null ? void 0 : contentSize.height) != null ? _contentSize$height : 1280, 640);
          this.panelWidth = this.rootWidth - clamp(this.rootWidth * 0.035, 14, 24) * 2;
          this.topPanelHeight = clamp(this.rootHeight * 0.22, 250, 310);
          this.messagePanelHeight = 0;
          this.handPanelHeight = clamp(this.rootHeight * 0.2, 190, 250);
          var handGap = clamp(this.panelWidth * 0.025, 8, 14);
          this.handCardWidth = Math.min(180, (this.panelWidth - handGap * ((_crd && HAND_SIZE === void 0 ? (_reportPossibleCrUseOfHAND_SIZE({
            error: Error()
          }), HAND_SIZE) : HAND_SIZE) + 1)) / (_crd && HAND_SIZE === void 0 ? (_reportPossibleCrUseOfHAND_SIZE({
            error: Error()
          }), HAND_SIZE) : HAND_SIZE));
          this.handCardHeight = clamp(this.handPanelHeight - 30, 150, 190);
          var topPadding = clamp(this.rootHeight * 0.02, 18, 32);
          var bottomPadding = clamp(this.rootHeight * 0.02, 18, 32);
          var sectionGap = clamp(this.rootHeight * 0.012, 12, 18);
          var topRegionBottom = this.rootHeight / 2 - topPadding - this.topPanelHeight - sectionGap;
          var bottomRegionTop = -this.rootHeight / 2 + bottomPadding + this.handPanelHeight + sectionGap;
          var boardAvailable = topRegionBottom - bottomRegionTop;
          this.boardSize = Math.floor(Math.min(this.panelWidth, clamp(boardAvailable, 300, this.rootHeight * 0.52)));
          this.boardCenterY = (topRegionBottom + bottomRegionTop) / 2;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=0bf724d2a98045841d6a3308ddefe7d99f53fc62.js.map