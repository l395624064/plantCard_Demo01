System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, CardManager, _crd;

  function _reportPossibleCrUseOfGameModel(extras) {
    _reporterNs.report("GameModel", "../../GameModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCardData(extras) {
    _reporterNs.report("CardData", "../../GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGridPos(extras) {
    _reporterNs.report("GridPos", "../../GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfPlacementPreview(extras) {
    _reporterNs.report("PlacementPreview", "../../GameTypes", _context.meta, extras);
  }

  function _reportPossibleCrUseOfRotation(extras) {
    _reporterNs.report("Rotation", "../../GameTypes", _context.meta, extras);
  }

  _export("CardManager", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "8615aoTyQVHNZnpavaDBJz3", "CardManager", undefined);

      /**
       * 卡牌管理器：
       * 负责牌库、手牌、抽牌、出牌预检等数据层能力。
       * 现阶段对 GameModel 做轻量封装，后续可逐步迁移规则逻辑。
       */
      _export("CardManager", CardManager = class CardManager {
        constructor(model) {
          this.model = model;
        }

        get deckCount() {
          return this.model.deck.length;
        }

        get hand() {
          return this.model.hand;
        }

        getCardAtHand(index) {
          return this.model.getCardAtHand(index);
        }

        canCardBePlaced(card) {
          return this.model.canCardBePlaced(card);
        }

        evaluatePlacement(card, anchor, rotation) {
          return this.model.evaluatePlacement(card, anchor, rotation);
        }

        placeFromHand(handIndex, anchor, rotation) {
          return this.model.placeFromHand(handIndex, anchor, rotation);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=710a0afc992ddad23860c41278787e5f755d89b1.js.map