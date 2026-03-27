System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, GameView, UIManager, _crd;

  function _reportPossibleCrUseOfGameView(extras) {
    _reporterNs.report("GameView", "../../GameView", _context.meta, extras);
  }

  function _reportPossibleCrUseOfHandLayoutSnapshot(extras) {
    _reporterNs.report("HandLayoutSnapshot", "../../GameView", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameViewCallbacks(extras) {
    _reporterNs.report("GameViewCallbacks", "../../GameView", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameViewState(extras) {
    _reporterNs.report("GameViewState", "../../GameView", _context.meta, extras);
  }

  _export("UIManager", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
    }, function (_unresolved_2) {
      GameView = _unresolved_2.GameView;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "89773p7UBFE+ogH1l3yyPwJ", "UIManager", undefined);

      __checkObsolete__(['Node']);

      /**
       * UI 管理器：
       * 负责 GameView 的创建、销毁、刷新和界面动画调度入口。
       */
      _export("UIManager", UIManager = class UIManager {
        constructor() {
          this.view = null;
        }

        build(root, callbacks) {
          if (this.view) {
            this.view.destroyView();
          }

          this.view = new (_crd && GameView === void 0 ? (_reportPossibleCrUseOfGameView({
            error: Error()
          }), GameView) : GameView)(root, callbacks);
          return this.view;
        }

        getView() {
          return this.view;
        }

        destroy() {
          var _this$view;

          (_this$view = this.view) == null || _this$view.destroyView();
          this.view = null;
        }

        render(state) {
          var _this$view2;

          (_this$view2 = this.view) == null || _this$view2.render(state);
        }

        captureHandLayoutSnapshot() {
          var _this$view$captureHan, _this$view3;

          return (_this$view$captureHan = (_this$view3 = this.view) == null ? void 0 : _this$view3.captureHandLayoutSnapshot()) != null ? _this$view$captureHan : null;
        }

        scheduleHandRefillAnimation(removedIdx, snap, oldIds) {
          var _this$view4;

          (_this$view4 = this.view) == null || _this$view4.scheduleHandRefillAnimation(removedIdx, snap, oldIds);
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=8d5748d8a46f7869121f282a3b2e3cfe925cee91.js.map