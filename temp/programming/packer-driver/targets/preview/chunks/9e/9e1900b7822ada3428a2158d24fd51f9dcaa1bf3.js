System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, BOARD_COLS, BOARD_ROWS, CARD_TEMPLATE_COLS, CARD_TEMPLATE_ROWS, DICE_VALUES, HAND_SIZE, MAX_ROTTEN, TARGET_SCORE, getCardBounds, normalizeCardCells, rotateCardCells, GameModel, _crd;

  function createEmptyBoard() {
    return Array.from({
      length: _crd && BOARD_ROWS === void 0 ? (_reportPossibleCrUseOfBOARD_ROWS({
        error: Error()
      }), BOARD_ROWS) : BOARD_ROWS
    }, () => Array.from({
      length: _crd && BOARD_COLS === void 0 ? (_reportPossibleCrUseOfBOARD_COLS({
        error: Error()
      }), BOARD_COLS) : BOARD_COLS
    }, () => ({
      baseColor: null,
      diceIndex: -1,
      rotten: false,
      plantVariant: null
    })));
  }

  function createCard(id, label, colors) {
    var cells = [];

    for (var y = 0; y < colors.length; y++) {
      for (var x = 0; x < colors[y].length; x++) {
        cells.push({
          x,
          y,
          color: colors[y][x],
          plantVariant: null
        });
      }
    }

    return {
      id: "card-" + id,
      label,
      cells,
      cardKind: 'placement'
    };
  }

  function randomColor() {
    var pool = ['red', 'yellow', 'purple'];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function createRandomShapeCard(id, label) {
    var targetCount = 1 + Math.floor(Math.random() * 4);
    var used = new Set();
    var cells = [];
    var cx = Math.floor(Math.random() * (_crd && CARD_TEMPLATE_COLS === void 0 ? (_reportPossibleCrUseOfCARD_TEMPLATE_COLS({
      error: Error()
    }), CARD_TEMPLATE_COLS) : CARD_TEMPLATE_COLS));
    var cy = Math.floor(Math.random() * (_crd && CARD_TEMPLATE_ROWS === void 0 ? (_reportPossibleCrUseOfCARD_TEMPLATE_ROWS({
      error: Error()
    }), CARD_TEMPLATE_ROWS) : CARD_TEMPLATE_ROWS));

    while (cells.length < targetCount) {
      var key = cx + "," + cy;

      if (!used.has(key)) {
        used.add(key);
        cells.push({
          x: cx,
          y: cy,
          color: randomColor(),
          plantVariant: null
        });
      }

      var candidates = [{
        x: cx + 1,
        y: cy
      }, {
        x: cx - 1,
        y: cy
      }, {
        x: cx,
        y: cy + 1
      }, {
        x: cx,
        y: cy - 1
      }].filter(p => p.x >= 0 && p.x < (_crd && CARD_TEMPLATE_COLS === void 0 ? (_reportPossibleCrUseOfCARD_TEMPLATE_COLS({
        error: Error()
      }), CARD_TEMPLATE_COLS) : CARD_TEMPLATE_COLS) && p.y >= 0 && p.y < (_crd && CARD_TEMPLATE_ROWS === void 0 ? (_reportPossibleCrUseOfCARD_TEMPLATE_ROWS({
        error: Error()
      }), CARD_TEMPLATE_ROWS) : CARD_TEMPLATE_ROWS));

      if (candidates.length === 0) {
        break;
      }

      var pick = candidates[Math.floor(Math.random() * candidates.length)];
      cx = pick.x;
      cy = pick.y;
    }

    return {
      id: "card-" + id,
      label,
      cells: (_crd && normalizeCardCells === void 0 ? (_reportPossibleCrUseOfnormalizeCardCells({
        error: Error()
      }), normalizeCardCells) : normalizeCardCells)(cells),
      cardKind: 'placement'
    };
  }

  function shuffle(list) {
    var next = list.slice();

    for (var i = next.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = next[i];
      next[i] = next[j];
      next[j] = tmp;
    }

    return next;
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

  function _reportPossibleCrUseOfDICE_VALUES(extras) {
    _reporterNs.report("DICE_VALUES", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFruitColor(extras) {
    _reporterNs.report("FruitColor", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameStatus(extras) {
    _reporterNs.report("GameStatus", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGridPos(extras) {
    _reporterNs.report("GridPos", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfHAND_SIZE(extras) {
    _reporterNs.report("HAND_SIZE", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfMAX_ROTTEN(extras) {
    _reporterNs.report("MAX_ROTTEN", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlacementCell(extras) {
    _reporterNs.report("PlacementCell", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlacementHit(extras) {
    _reporterNs.report("PlacementHit", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlacementPreview(extras) {
    _reporterNs.report("PlacementPreview", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRotation(extras) {
    _reporterNs.report("Rotation", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfTARGET_SCORE(extras) {
    _reporterNs.report("TARGET_SCORE", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBoardCell(extras) {
    _reporterNs.report("BoardCell", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCardData(extras) {
    _reporterNs.report("CardData", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfgetCardBounds(extras) {
    _reporterNs.report("getCardBounds", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfnormalizeCardCells(extras) {
    _reporterNs.report("normalizeCardCells", "./GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfrotateCardCells(extras) {
    _reporterNs.report("rotateCardCells", "./GameTypes", _context.meta, extras);
  }

  _export("GameModel", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      BOARD_COLS = _unresolved_2.BOARD_COLS;
      BOARD_ROWS = _unresolved_2.BOARD_ROWS;
      CARD_TEMPLATE_COLS = _unresolved_2.CARD_TEMPLATE_COLS;
      CARD_TEMPLATE_ROWS = _unresolved_2.CARD_TEMPLATE_ROWS;
      DICE_VALUES = _unresolved_2.DICE_VALUES;
      HAND_SIZE = _unresolved_2.HAND_SIZE;
      MAX_ROTTEN = _unresolved_2.MAX_ROTTEN;
      TARGET_SCORE = _unresolved_2.TARGET_SCORE;
      getCardBounds = _unresolved_2.getCardBounds;
      normalizeCardCells = _unresolved_2.normalizeCardCells;
      rotateCardCells = _unresolved_2.rotateCardCells;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "18e93kbTfVMUZyTfWyzwHl0", "GameModel", undefined);

      _export("GameModel", GameModel = class GameModel {
        hashString(value) {
          var hash = 0;

          for (var i = 0; i < value.length; i++) {
            hash = (hash << 5) - hash + value.charCodeAt(i) | 0;
          }

          return Math.abs(hash);
        }

        getPlantVariant(cardId, cellX, cellY, color) {
          var seed = cardId + ":" + cellX + "," + cellY + ":" + color;
          return this.hashString(seed) % 11;
        }

        assignPlantVariants(cardId, cells) {
          return cells.map(cell => {
            var _cell$plantVariant;

            return {
              x: cell.x,
              y: cell.y,
              color: cell.color,
              plantVariant: (_cell$plantVariant = cell.plantVariant) != null ? _cell$plantVariant : this.getPlantVariant(cardId, cell.x, cell.y, cell.color)
            };
          });
        }

        constructor() {
          this.board = [];
          this.hand = [];
          this.deck = [];
          this.score = 0;
          this.targetScore = _crd && TARGET_SCORE === void 0 ? (_reportPossibleCrUseOfTARGET_SCORE({
            error: Error()
          }), TARGET_SCORE) : TARGET_SCORE;
          this.remainingRotten = _crd && MAX_ROTTEN === void 0 ? (_reportPossibleCrUseOfMAX_ROTTEN({
            error: Error()
          }), MAX_ROTTEN) : MAX_ROTTEN;
          this.status = 'playing';
          this.message = '';
          this.infiniteDeck = true;
          this.cardLibrary = void 0;
          this.startCard = void 0;
          this.nextCardInstanceId = 1;
          var labels = ['晨露', '暖阳', '莓影', '果径', '花圃', '藤蔓', '果丘', '林隙', '晚风', '溪畔', '蜜香', '月影'];
          this.cardLibrary = labels.map((label, index) => createRandomShapeCard(index + 1, label));
          this.startCard = createCard(0, '起始', [['red', 'yellow'], ['purple', 'red']]);
          this.startNewGame();
        }

        startNewGame() {
          this.board = createEmptyBoard();
          this.hand = [];
          this.nextCardInstanceId = 1;
          this.deck = shuffle(this.cardLibrary).map(card => this.cloneCardInstance(card));
          this.score = 0;
          this.targetScore = _crd && TARGET_SCORE === void 0 ? (_reportPossibleCrUseOfTARGET_SCORE({
            error: Error()
          }), TARGET_SCORE) : TARGET_SCORE;
          this.remainingRotten = _crd && MAX_ROTTEN === void 0 ? (_reportPossibleCrUseOfMAX_ROTTEN({
            error: Error()
          }), MAX_ROTTEN) : MAX_ROTTEN;
          this.status = 'playing';
          this.message = '选择一张手牌，然后在果园中寻找一个可重叠的位置。';
          var startAnchor = {
            x: Math.floor((_crd && BOARD_COLS === void 0 ? (_reportPossibleCrUseOfBOARD_COLS({
              error: Error()
            }), BOARD_COLS) : BOARD_COLS) / 2) - 1,
            y: Math.floor((_crd && BOARD_ROWS === void 0 ? (_reportPossibleCrUseOfBOARD_ROWS({
              error: Error()
            }), BOARD_ROWS) : BOARD_ROWS) / 2) - 1
          };
          this.placeInitialCard(this.startCard, startAnchor);
          this.refillHand();
          this.updateStatus();
        }

        getCardAtHand(index) {
          var _this$hand$index;

          return (_this$hand$index = this.hand[index]) != null ? _this$hand$index : null;
        }

        canCardBePlaced(card) {
          for (var rotation = 0; rotation < 4; rotation = rotation + 1) {
            var rotated = (_crd && rotateCardCells === void 0 ? (_reportPossibleCrUseOfrotateCardCells({
              error: Error()
            }), rotateCardCells) : rotateCardCells)(card.cells, rotation);
            var bounds = (_crd && getCardBounds === void 0 ? (_reportPossibleCrUseOfgetCardBounds({
              error: Error()
            }), getCardBounds) : getCardBounds)(rotated);

            for (var y = 0; y <= (_crd && BOARD_ROWS === void 0 ? (_reportPossibleCrUseOfBOARD_ROWS({
              error: Error()
            }), BOARD_ROWS) : BOARD_ROWS) - bounds.height; y++) {
              for (var x = 0; x <= (_crd && BOARD_COLS === void 0 ? (_reportPossibleCrUseOfBOARD_COLS({
                error: Error()
              }), BOARD_COLS) : BOARD_COLS) - bounds.width; x++) {
                var preview = this.evaluatePlacement(card, {
                  x,
                  y
                }, rotation);

                if (preview.isValid) {
                  return true;
                }
              }
            }
          }

          return false;
        }

        evaluatePlacement(card, anchor, rotation) {
          var rotatedCells = (_crd && rotateCardCells === void 0 ? (_reportPossibleCrUseOfrotateCardCells({
            error: Error()
          }), rotateCardCells) : rotateCardCells)(card.cells, rotation);
          var sameColorHits = [];
          var diffColorHits = [];
          var placementCells = [];
          var occupiedOverlapCount = 0;
          var scoreGain = 0;
          var reason = '';

          for (var cell of rotatedCells) {
            var _cell$plantVariant2, _cell$plantVariant3, _cell$plantVariant4;

            var x = anchor.x + cell.x;
            var y = anchor.y + cell.y;

            if (x < 0 || y < 0 || x >= (_crd && BOARD_COLS === void 0 ? (_reportPossibleCrUseOfBOARD_COLS({
              error: Error()
            }), BOARD_COLS) : BOARD_COLS) || y >= (_crd && BOARD_ROWS === void 0 ? (_reportPossibleCrUseOfBOARD_ROWS({
              error: Error()
            }), BOARD_ROWS) : BOARD_ROWS)) {
              return {
                isValid: false,
                reason: '超出果园边界',
                anchor,
                rotation,
                occupiedOverlapCount: 0,
                scoreGain: 0,
                requiredRotten: 0,
                sameColorHits: [],
                diffColorHits: [],
                cells: []
              };
            }

            var boardCell = this.board[y][x];
            var overlapsSame = !boardCell.rotten && !!boardCell.baseColor && boardCell.plantVariant !== null && boardCell.plantVariant === ((_cell$plantVariant2 = cell.plantVariant) != null ? _cell$plantVariant2 : null);
            var overlapsDiff = !boardCell.rotten && !!boardCell.baseColor && boardCell.plantVariant !== null && boardCell.plantVariant !== ((_cell$plantVariant3 = cell.plantVariant) != null ? _cell$plantVariant3 : null);
            var blocked = boardCell.rotten;
            placementCells.push({
              x,
              y,
              color: cell.color,
              blocked,
              overlapsSame,
              overlapsDiff,
              plantVariant: (_cell$plantVariant4 = cell.plantVariant) != null ? _cell$plantVariant4 : this.getPlantVariant(card.id, cell.x, cell.y, cell.color)
            });

            if (blocked) {
              reason = '不能覆盖烂水果位置';
            }

            if (overlapsSame) {
              occupiedOverlapCount++;
              sameColorHits.push({
                x,
                y,
                color: cell.color
              });
              var nextDiceIndex = Math.min(boardCell.diceIndex + 1, (_crd && DICE_VALUES === void 0 ? (_reportPossibleCrUseOfDICE_VALUES({
                error: Error()
              }), DICE_VALUES) : DICE_VALUES).length - 1);
              scoreGain += (_crd && DICE_VALUES === void 0 ? (_reportPossibleCrUseOfDICE_VALUES({
                error: Error()
              }), DICE_VALUES) : DICE_VALUES)[nextDiceIndex];
            } else if (overlapsDiff) {
              occupiedOverlapCount++;
              diffColorHits.push({
                x,
                y,
                color: cell.color
              });
            }
          }

          if (reason) {
            return {
              isValid: false,
              reason,
              anchor,
              rotation,
              occupiedOverlapCount,
              scoreGain: 0,
              requiredRotten: 0,
              sameColorHits,
              diffColorHits,
              cells: placementCells
            };
          }

          if (diffColorHits.length > this.remainingRotten) {
            reason = '烂水果次数不足';
          }

          return {
            isValid: reason.length === 0,
            reason: reason || "\u53EF\u653E\u7F6E\uFF0C\u9884\u8BA1\u5F97\u5206 +" + scoreGain,
            anchor,
            rotation,
            occupiedOverlapCount,
            scoreGain,
            requiredRotten: diffColorHits.length,
            sameColorHits,
            diffColorHits,
            cells: placementCells
          };
        }

        placeFromHand(handIndex, anchor, rotation) {
          var card = this.hand[handIndex];

          if (!card || this.status !== 'playing') {
            return {
              isValid: false,
              reason: '当前无法出牌',
              anchor,
              rotation,
              occupiedOverlapCount: 0,
              scoreGain: 0,
              requiredRotten: 0,
              sameColorHits: [],
              diffColorHits: [],
              cells: []
            };
          }

          var preview = this.evaluatePlacement(card, anchor, rotation);

          if (!preview.isValid) {
            this.message = preview.reason;
            return preview;
          }

          for (var cell of preview.cells) {
            var boardCell = this.board[cell.y][cell.x];

            if (cell.overlapsSame) {
              var _boardCell$plantVaria;

              boardCell.baseColor = cell.color;
              boardCell.diceIndex = Math.min(boardCell.diceIndex + 1, (_crd && DICE_VALUES === void 0 ? (_reportPossibleCrUseOfDICE_VALUES({
                error: Error()
              }), DICE_VALUES) : DICE_VALUES).length - 1);
              boardCell.plantVariant = (_boardCell$plantVaria = boardCell.plantVariant) != null ? _boardCell$plantVaria : cell.plantVariant;
            } else if (cell.overlapsDiff) {
              boardCell.baseColor = null;
              boardCell.diceIndex = -1;
              boardCell.rotten = true;
              boardCell.plantVariant = null;
              this.remainingRotten -= 1;
            } else {
              boardCell.baseColor = cell.color;
              boardCell.diceIndex = -1;
              boardCell.rotten = false;
              boardCell.plantVariant = cell.plantVariant;
            }
          }

          this.score += preview.scoreGain;
          this.hand.splice(handIndex, 1);
          this.refillHand();
          var sameCount = preview.sameColorHits.length;
          var diffCount = preview.diffColorHits.length;
          var parts = [];

          if (sameCount > 0) {
            parts.push("\u540C\u8272\u91CD\u53E0 " + sameCount + " \u5904\uFF0C\u5F97\u5206 +" + preview.scoreGain);
          }

          if (diffCount > 0) {
            parts.push("\u5F02\u8272\u91CD\u53E0 " + diffCount + " \u5904\uFF0C\u751F\u6210\u70C2\u6C34\u679C");
          }

          if (parts.length === 0) {
            parts.push('成功放置了一张卡牌');
          }

          this.message = parts.join('；');
          this.updateStatus();
          return preview;
        }

        getDeckCount() {
          return this.infiniteDeck ? -1 : this.deck.length;
        }

        drawOneCardToHand() {
          var next = this.drawNextCard();

          if (!next) {
            this.message = '牌库已空，无法继续抽牌。';
            return null;
          }

          this.hand.push(next);
          this.message = "GM \u62BD\u53D6\u4E86 1 \u5F20\u5361\u724C\uFF1A" + next.label;
          this.updateStatus();
          return next;
        }

        gmAddScore(amount) {
          if (amount <= 0) {
            return;
          }

          this.score += amount;
          this.message = "GM \u589E\u52A0\u4E86 " + amount + " \u70B9\u5206\u6570\u3002";
          this.updateStatus();
        }

        gmAddRottenCharge(amount) {
          if (amount <= 0) {
            return;
          }

          this.remainingRotten += amount;
          this.message = "GM \u589E\u52A0\u4E86 " + amount + " \u6B21\u70C2\u6C34\u679C\u989D\u5EA6\u3002";
          this.updateStatus();
        }

        placeInitialCard(card, anchor) {
          var rotatedCells = (_crd && rotateCardCells === void 0 ? (_reportPossibleCrUseOfrotateCardCells({
            error: Error()
          }), rotateCardCells) : rotateCardCells)(card.cells, 0);

          for (var cell of rotatedCells) {
            var _cell$plantVariant5;

            var x = anchor.x + cell.x;
            var y = anchor.y + cell.y;
            this.board[y][x].baseColor = cell.color;
            this.board[y][x].plantVariant = (_cell$plantVariant5 = cell.plantVariant) != null ? _cell$plantVariant5 : this.getPlantVariant(card.id, cell.x, cell.y, cell.color);
          }
        }

        refillHand() {
          while (this.hand.length < (_crd && HAND_SIZE === void 0 ? (_reportPossibleCrUseOfHAND_SIZE({
            error: Error()
          }), HAND_SIZE) : HAND_SIZE)) {
            var next = this.drawNextCard();

            if (!next) {
              break;
            }

            this.hand.push(next);
          }
        }

        drawNextCard() {
          if (this.deck.length > 0) {
            var _this$deck$shift;

            return (_this$deck$shift = this.deck.shift()) != null ? _this$deck$shift : null;
          }

          if (!this.infiniteDeck || this.cardLibrary.length === 0) {
            return null;
          }

          var template = this.cardLibrary[Math.floor(Math.random() * this.cardLibrary.length)];
          return this.cloneCardInstance(template);
        }

        cloneCardInstance(card) {
          var instanceId = this.nextCardInstanceId++;
          return {
            id: card.id + "-inst-" + instanceId,
            label: card.label,
            cardKind: card.cardKind,
            cells: this.assignPlantVariants(card.id + "-inst-" + instanceId, card.cells)
          };
        }

        updateStatus() {
          if (this.score >= this.targetScore) {
            this.status = 'win';
            this.message = "\u8FBE\u6210\u76EE\u6807\u5206\u6570 " + this.targetScore + "\uFF0C\u6311\u6218\u6210\u529F\u3002";
            return;
          }

          if (this.hand.length === 0 && this.deck.length === 0) {
            this.status = 'win';
            this.message = "\u724C\u5E93\u5DF2\u7ECF\u6253\u7A7A\uFF0C\u6700\u7EC8\u5F97\u5206 " + this.score + "\u3002";
            return;
          }

          var hasPlayableCard = this.hand.some(card => this.canCardBePlaced(card));

          if (!hasPlayableCard) {
            this.status = 'lose';
            this.message = '当前手牌都无法合法放置，本局结束。';
            return;
          }

          this.status = 'playing';
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=9e1900b7822ada3428a2158d24fd51f9dcaa1bf3.js.map