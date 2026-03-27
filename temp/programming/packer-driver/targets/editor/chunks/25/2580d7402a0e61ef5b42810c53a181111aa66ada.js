System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, GameFlowManager, _crd;

  _export("GameFlowManager", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "9349eRfVp9IzKrF/K/MotZf", "GameFlowManager", undefined);

      /**
       * 游戏进程管理器：
       * 统一描述当前局内流程阶段，便于后续拆开 MainGame 中的状态控制。
       */
      _export("GameFlowManager", GameFlowManager = class GameFlowManager {
        constructor() {
          this.phase = 'boot';
        }

        getPhase() {
          return this.phase;
        }

        setPhase(phase) {
          this.phase = phase;
        }

        isInteractive() {
          return this.phase !== 'resolving_place' && this.phase !== 'animating_refill';
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=2580d7402a0e61ef5b42810c53a181111aa66ada.js.map