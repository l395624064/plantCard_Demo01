System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Canvas, Component, Layers, Node, UITransform, Vec3, GameModel, GameView, BOARD_COLS, BOARD_ROWS, getCardBounds, rotateCardCells, _dec, _class, _crd, ccclass, MainGame;

  function _reportPossibleCrUseOfGameModel(extras) {
    _reporterNs.report("GameModel", "./GameModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameView(extras) {
    _reporterNs.report("GameView", "./GameView", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBOARD_COLS(extras) {
    _reporterNs.report("BOARD_COLS", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBOARD_ROWS(extras) {
    _reporterNs.report("BOARD_ROWS", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameViewState(extras) {
    _reporterNs.report("GameViewState", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGridPos(extras) {
    _reporterNs.report("GridPos", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfHandSlotState(extras) {
    _reporterNs.report("HandSlotState", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlacementPreview(extras) {
    _reporterNs.report("PlacementPreview", "./GameTypes", _context.meta, extras);
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

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Canvas = _cc.Canvas;
      Component = _cc.Component;
      Layers = _cc.Layers;
      Node = _cc.Node;
      UITransform = _cc.UITransform;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      GameModel = _unresolved_2.GameModel;
    }, function (_unresolved_3) {
      GameView = _unresolved_3.GameView;
    }, function (_unresolved_4) {
      BOARD_COLS = _unresolved_4.BOARD_COLS;
      BOARD_ROWS = _unresolved_4.BOARD_ROWS;
      getCardBounds = _unresolved_4.getCardBounds;
      rotateCardCells = _unresolved_4.rotateCardCells;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1d5edcX7UpCJ4hLy6pethrm", "MainGame", undefined);

      __checkObsolete__(['_decorator', 'Canvas', 'Component', 'Layers', 'Node', 'UITransform', 'Vec3']);

      ({
        ccclass
      } = _decorator);

      _export("MainGame", MainGame = (_dec = ccclass('MainGame'), _dec(_class = class MainGame extends Component {
        constructor() {
          super(...arguments);
          this.model = null;
          this.view = null;
          this.selectedHandIndex = 0;
          this.currentRotation = 0;
          this.lastRotationStep = 0;
          this.hoverAnchor = null;

          /** 预放置状态2：锁定锚点，仅通过「放置」按钮结算 */
          this.lockedPreplaceAnchor = null;
          this.flashPhase = 0;
          this.lastRootWidth = 0;
          this.lastRootHeight = 0;
        }

        start() {
          this.configureCanvasAdaptation();
          this.model = new (_crd && GameModel === void 0 ? (_reportPossibleCrUseOfGameModel({
            error: Error()
          }), GameModel) : GameModel)();
          this.normalizeSelection();
          this.rebuildView();
        }

        update(dt) {
          var _this$model;

          this.flashPhase += dt * 6;
          this.checkForResize();

          if (((_this$model = this.model) == null ? void 0 : _this$model.status) === 'playing' && (this.hoverAnchor !== null || this.lockedPreplaceAnchor !== null)) {
            this.render();
          }
        }

        configureCanvasAdaptation() {
          var canvas = this.node.getComponent(Canvas);

          if (!canvas) {
            return;
          }

          var adaptCanvas = canvas;
          adaptCanvas.fitWidth = true;
          adaptCanvas.fitHeight = false;
        }

        ensureUiRoot() {
          var uiRoot = this.node.getChildByName('DemoRoot');

          if (!uiRoot) {
            uiRoot = new Node('DemoRoot');
            uiRoot.layer = Layers.Enum.UI_2D;

            var _canvasTransform = this.node.getComponent(UITransform);

            var _uiTransform = uiRoot.addComponent(UITransform);

            if (_canvasTransform) {
              _uiTransform.setContentSize(_canvasTransform.contentSize);
            }

            uiRoot.setPosition(new Vec3(0, 0, 0));
            this.node.addChild(uiRoot);
          }

          var canvasTransform = this.node.getComponent(UITransform);
          var uiTransform = uiRoot.getComponent(UITransform);

          if (canvasTransform && uiTransform) {
            uiTransform.setContentSize(canvasTransform.contentSize);
            this.lastRootWidth = canvasTransform.contentSize.width;
            this.lastRootHeight = canvasTransform.contentSize.height;
          }

          return uiRoot;
        }

        rebuildView() {
          if (this.view) {
            this.view.destroyView();
          }

          var uiRoot = this.ensureUiRoot();
          this.view = new (_crd && GameView === void 0 ? (_reportPossibleCrUseOfGameView({
            error: Error()
          }), GameView) : GameView)(uiRoot, {
            onRotateLeft: () => this.rotate(-1),
            onRotateRight: () => this.rotate(1),
            onBeginPlacementDrag: index => this.beginPlacementDrag(index),
            onPreplaceHoverAnchor: anchor => this.setPreplaceHover(anchor),
            onPreplaceCommitState2: anchor => this.commitPreplaceState2(anchor),
            onLockedPreplaceAnchorUpdate: anchor => this.updateLockedPreplaceAnchor(anchor),
            onPreplaceCancel: () => this.cancelPreplace(),
            onPreplaceConfirmPlace: () => this.confirmPreplacePlace(),
            onGmDrawCard: () => this.gmDrawCard(),
            onGmAddScore: () => this.gmAddScore(),
            onGmAddRottenCharge: () => this.gmAddRottenCharge(),
            onGmRestart: () => this.gmRestart()
          });
          this.render();
        }

        checkForResize() {
          var canvasTransform = this.node.getComponent(UITransform);

          if (!canvasTransform) {
            return;
          }

          var {
            width,
            height
          } = canvasTransform.contentSize;

          if (width === this.lastRootWidth && height === this.lastRootHeight) {
            return;
          }

          this.lastRootWidth = width;
          this.lastRootHeight = height;
          this.rebuildView();
        }

        beginPlacementDrag(index) {
          this.lockedPreplaceAnchor = null;
          this.hoverAnchor = null;
          this.currentRotation = 0;
          this.lastRotationStep = 0;
          this.selectHand(index);
        }

        setPreplaceHover(anchor) {
          if (this.lockedPreplaceAnchor !== null) {
            return;
          }

          this.hoverAnchor = anchor;
          this.render();
        }
        /** 预放置状态2：在棋盘上拖拽更换锚点 */


        updateLockedPreplaceAnchor(anchor) {
          if (this.lockedPreplaceAnchor === null) {
            return;
          }

          this.lockedPreplaceAnchor = anchor;
          this.hoverAnchor = anchor;
          this.render();
        }

        commitPreplaceState2(anchor) {
          this.lockedPreplaceAnchor = anchor;
          this.hoverAnchor = anchor;
          this.render();
        }

        cancelPreplace() {
          this.lockedPreplaceAnchor = null;
          this.hoverAnchor = null;
          this.currentRotation = 0;
          this.lastRotationStep = 0;
          this.render();
        }

        confirmPreplacePlace() {
          var _this$view;

          if (!this.model || this.model.status !== 'playing' || this.lockedPreplaceAnchor === null) {
            return;
          }

          var anchor = this.lockedPreplaceAnchor;
          var removedIdx = this.selectedHandIndex;
          var oldIds = this.model.hand.map(card => card.id);
          var handSnap = (_this$view = this.view) == null ? void 0 : _this$view.captureHandLayoutSnapshot();
          var result = this.model.placeFromHand(removedIdx, anchor, this.currentRotation);

          if (result.isValid) {
            this.currentRotation = 0;
            this.lastRotationStep = 0;
            this.hoverAnchor = null;
            this.lockedPreplaceAnchor = null;
            this.normalizeSelection();

            if (this.view && handSnap) {
              this.view.scheduleHandRefillAnimation(removedIdx, handSnap, oldIds);
            }
          }

          this.render();
        }

        selectHand(index) {
          if (!this.model || index < 0 || index >= this.model.hand.length) {
            return;
          }

          this.selectedHandIndex = index;
          this.currentRotation = 0;
          this.lastRotationStep = 0;
          this.render();
        }

        rotate(direction) {
          var _this$lockedPreplaceA;

          if (!this.model || this.model.status !== 'playing' || !this.model.getCardAtHand(this.selectedHandIndex)) {
            return;
          }

          var card = this.model.getCardAtHand(this.selectedHandIndex);
          var currentAnchor = (_this$lockedPreplaceA = this.lockedPreplaceAnchor) != null ? _this$lockedPreplaceA : this.hoverAnchor;
          var nextRotation = (this.currentRotation + direction + 4) % 4;

          if (currentAnchor) {
            var adjustedAnchor = this.getRotatedAnchorWithKick(card, currentAnchor, this.currentRotation, nextRotation);

            if (this.lockedPreplaceAnchor) {
              this.lockedPreplaceAnchor = adjustedAnchor;
            }

            if (this.hoverAnchor) {
              this.hoverAnchor = adjustedAnchor;
            }
          }

          this.currentRotation = nextRotation;
          this.lastRotationStep = direction < 0 ? -1 : 1;
          this.render();
        }

        getRotatedAnchorWithKick(card, anchor, from, to) {
          var kickCandidates = this.getRotationKickCandidates(from, to);

          for (var kick of kickCandidates) {
            var candidate = {
              x: anchor.x + kick.x,
              y: anchor.y + kick.y
            };

            if (this.isAnchorInsideBoard(card, candidate, to)) {
              return candidate;
            }
          }

          return anchor;
        }
        /**
         * 参考俄罗斯方块 JLSTZ 的 wall kick 顺序，换算到当前 y 轴向下的棋盘坐标。
         * 优先尝试原地旋转；只有贴边时才依次尝试补位，避免异形块在空旷区域无故位移。
         */


        getRotationKickCandidates(from, to) {
          var _map$key;

          var key = from + "->" + to;
          var map = {
            '0->1': [{
              x: 0,
              y: 0
            }, {
              x: -1,
              y: 0
            }, {
              x: -1,
              y: -1
            }, {
              x: 0,
              y: 2
            }, {
              x: -1,
              y: 2
            }],
            '1->0': [{
              x: 0,
              y: 0
            }, {
              x: 1,
              y: 0
            }, {
              x: 1,
              y: 1
            }, {
              x: 0,
              y: -2
            }, {
              x: 1,
              y: -2
            }],
            '1->2': [{
              x: 0,
              y: 0
            }, {
              x: 1,
              y: 0
            }, {
              x: 1,
              y: 1
            }, {
              x: 0,
              y: -2
            }, {
              x: 1,
              y: -2
            }],
            '2->1': [{
              x: 0,
              y: 0
            }, {
              x: -1,
              y: 0
            }, {
              x: -1,
              y: -1
            }, {
              x: 0,
              y: 2
            }, {
              x: -1,
              y: 2
            }],
            '2->3': [{
              x: 0,
              y: 0
            }, {
              x: 1,
              y: 0
            }, {
              x: 1,
              y: -1
            }, {
              x: 0,
              y: 2
            }, {
              x: 1,
              y: 2
            }],
            '3->2': [{
              x: 0,
              y: 0
            }, {
              x: -1,
              y: 0
            }, {
              x: -1,
              y: 1
            }, {
              x: 0,
              y: -2
            }, {
              x: -1,
              y: -2
            }],
            '3->0': [{
              x: 0,
              y: 0
            }, {
              x: -1,
              y: 0
            }, {
              x: -1,
              y: 1
            }, {
              x: 0,
              y: -2
            }, {
              x: -1,
              y: -2
            }],
            '0->3': [{
              x: 0,
              y: 0
            }, {
              x: 1,
              y: 0
            }, {
              x: 1,
              y: -1
            }, {
              x: 0,
              y: 2
            }, {
              x: 1,
              y: 2
            }]
          };
          return (_map$key = map[key]) != null ? _map$key : [{
            x: 0,
            y: 0
          }, {
            x: 1,
            y: 0
          }, {
            x: -1,
            y: 0
          }, {
            x: 0,
            y: 1
          }, {
            x: 0,
            y: -1
          }];
        }

        isAnchorInsideBoard(card, anchor, rotation) {
          var bounds = (_crd && getCardBounds === void 0 ? (_reportPossibleCrUseOfgetCardBounds({
            error: Error()
          }), getCardBounds) : getCardBounds)((_crd && rotateCardCells === void 0 ? (_reportPossibleCrUseOfrotateCardCells({
            error: Error()
          }), rotateCardCells) : rotateCardCells)(card.cells, rotation));
          return anchor.x >= 0 && anchor.y >= 0 && anchor.x <= (_crd && BOARD_COLS === void 0 ? (_reportPossibleCrUseOfBOARD_COLS({
            error: Error()
          }), BOARD_COLS) : BOARD_COLS) - bounds.width && anchor.y <= (_crd && BOARD_ROWS === void 0 ? (_reportPossibleCrUseOfBOARD_ROWS({
            error: Error()
          }), BOARD_ROWS) : BOARD_ROWS) - bounds.height;
        }

        gmDrawCard() {
          var _this$view2;

          if (!this.model) {
            return;
          }

          var oldIds = this.model.hand.map(card => card.id);
          var handSnap = (_this$view2 = this.view) == null ? void 0 : _this$view2.captureHandLayoutSnapshot();
          var drew = this.model.drawOneCardToHand();
          this.normalizeSelection();

          if (drew && this.view && handSnap) {
            this.view.scheduleHandRefillAnimation(-1, handSnap, oldIds);
          }

          this.render();
        }

        gmAddScore() {
          if (!this.model) {
            return;
          }

          this.model.gmAddScore(3);
          this.render();
        }

        gmAddRottenCharge() {
          if (!this.model) {
            return;
          }

          this.model.gmAddRottenCharge(1);
          this.render();
        }

        gmRestart() {
          var _this$view3;

          if (!this.model) {
            return;
          }

          this.model.startNewGame();
          this.currentRotation = 0;
          this.lastRotationStep = 0;
          this.hoverAnchor = null;
          this.lockedPreplaceAnchor = null;
          (_this$view3 = this.view) == null || _this$view3.resetTimeWheel();
          this.normalizeSelection();
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
          var _this$lockedPreplaceA2;

          if (!this.model) {
            return null;
          }

          var anchor = (_this$lockedPreplaceA2 = this.lockedPreplaceAnchor) != null ? _this$lockedPreplaceA2 : this.hoverAnchor;

          if (!anchor) {
            return null;
          }

          var card = this.model.getCardAtHand(this.selectedHandIndex);

          if (!card) {
            return null;
          }

          return this.model.evaluatePlacement(card, anchor, this.currentRotation);
        }

        buildHandSlots() {
          if (!this.model) {
            return [];
          }

          return this.model.hand.map((card, index) => {
            return {
              index,
              card,
              selected: index === this.selectedHandIndex,
              canPlace: !!card && this.model.canCardBePlaced(card)
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
            deckCount: this.model.getDeckCount(),
            score: this.model.score,
            targetScore: this.model.targetScore,
            remainingRotten: this.model.remainingRotten,
            rotation: this.currentRotation,
            rotationStep: this.lastRotationStep,
            status: this.model.status,
            message: this.model.message,
            preview: this.getCurrentPreview(),
            preplaceLocked: this.lockedPreplaceAnchor !== null,
            flashPhase: this.flashPhase
          };
        }

        render() {
          var state = this.buildViewState();

          if (!state || !this.view) {
            return;
          }

          this.view.render(state);
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=ef30ce155f10cdd8fdca1cff29c65adf2100ce4a.js.map