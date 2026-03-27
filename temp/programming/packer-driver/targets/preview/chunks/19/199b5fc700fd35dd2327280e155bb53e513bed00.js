System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, GameModel, BuffSkillManager, CardManager, EffectManager, GameFlowManager, ScoreManager, UIManager, GameManager, _crd;

  function _reportPossibleCrUseOfGameModel(extras) {
    _reporterNs.report("GameModel", "../../GameModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameViewCallbacks(extras) {
    _reporterNs.report("GameViewCallbacks", "../../GameView", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameViewState(extras) {
    _reporterNs.report("GameViewState", "../../GameView", _context.meta, extras);
  }

  function _reportPossibleCrUseOfBuffSkillManager(extras) {
    _reporterNs.report("BuffSkillManager", "../buff/BuffSkillManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfCardManager(extras) {
    _reporterNs.report("CardManager", "../card/CardManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEffectManager(extras) {
    _reporterNs.report("EffectManager", "../effect/EffectManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameFlowManager(extras) {
    _reporterNs.report("GameFlowManager", "../flow/GameFlowManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfScoreManager(extras) {
    _reporterNs.report("ScoreManager", "../score/ScoreManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUIManager(extras) {
    _reporterNs.report("UIManager", "../ui/UIManager", _context.meta, extras);
  }

  _export("GameManager", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
    }, function (_unresolved_2) {
      GameModel = _unresolved_2.GameModel;
    }, function (_unresolved_3) {
      BuffSkillManager = _unresolved_3.BuffSkillManager;
    }, function (_unresolved_4) {
      CardManager = _unresolved_4.CardManager;
    }, function (_unresolved_5) {
      EffectManager = _unresolved_5.EffectManager;
    }, function (_unresolved_6) {
      GameFlowManager = _unresolved_6.GameFlowManager;
    }, function (_unresolved_7) {
      ScoreManager = _unresolved_7.ScoreManager;
    }, function (_unresolved_8) {
      UIManager = _unresolved_8.UIManager;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f7e75ycxRNFy4gDUUEB1pqJ", "GameManager", undefined);

      __checkObsolete__(['Node']);

      /**
       * 游戏管理器：
       * 汇总各个子管理器，作为未来 MainGame 的唯一高层入口。
       * 当前为过渡骨架，避免一次性重构过大。
       */
      _export("GameManager", GameManager = class GameManager {
        constructor() {
          this.model = void 0;
          this.card = void 0;
          this.ui = void 0;
          this.effect = void 0;
          this.buffSkill = void 0;
          this.score = void 0;
          this.flow = void 0;
          this.model = new (_crd && GameModel === void 0 ? (_reportPossibleCrUseOfGameModel({
            error: Error()
          }), GameModel) : GameModel)();
          this.card = new (_crd && CardManager === void 0 ? (_reportPossibleCrUseOfCardManager({
            error: Error()
          }), CardManager) : CardManager)(this.model);
          this.ui = new (_crd && UIManager === void 0 ? (_reportPossibleCrUseOfUIManager({
            error: Error()
          }), UIManager) : UIManager)();
          this.effect = new (_crd && EffectManager === void 0 ? (_reportPossibleCrUseOfEffectManager({
            error: Error()
          }), EffectManager) : EffectManager)();
          this.buffSkill = new (_crd && BuffSkillManager === void 0 ? (_reportPossibleCrUseOfBuffSkillManager({
            error: Error()
          }), BuffSkillManager) : BuffSkillManager)();
          this.score = new (_crd && ScoreManager === void 0 ? (_reportPossibleCrUseOfScoreManager({
            error: Error()
          }), ScoreManager) : ScoreManager)();
          this.flow = new (_crd && GameFlowManager === void 0 ? (_reportPossibleCrUseOfGameFlowManager({
            error: Error()
          }), GameFlowManager) : GameFlowManager)();
        }

        buildUI(root, callbacks) {
          this.ui.build(root, callbacks);
        }

        render(state) {
          this.ui.render(state);
        }

        destroy() {
          this.ui.destroy();
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=199b5fc700fd35dd2327280e155bb53e513bed00.js.map