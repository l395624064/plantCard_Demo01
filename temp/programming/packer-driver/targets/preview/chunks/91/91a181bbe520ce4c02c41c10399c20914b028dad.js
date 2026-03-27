System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Tween, tween, Vec3, EffectManager, _crd;

  _export("EffectManager", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Tween = _cc.Tween;
      tween = _cc.tween;
      Vec3 = _cc.Vec3;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "a8ab9EkPmpFRYlzIyfoSJVf", "EffectManager", undefined);

      /**
       * 特效管理器：
       * 统一承接轻量 UI / 棋盘表现层动画。
       * 当前只提供通用 tween 工具，后续可沉淀补牌、旋转、提示线等效果。
       */
      __checkObsolete__(['Node', 'Tween', 'tween', 'Vec3']);

      _export("EffectManager", EffectManager = class EffectManager {
        stop(target) {
          Tween.stopAllByTarget(target);
        }

        pulse(node, scale, duration) {
          if (scale === void 0) {
            scale = 1.05;
          }

          if (duration === void 0) {
            duration = 0.12;
          }

          Tween.stopAllByTarget(node);
          tween(node).to(duration, {
            scale: new Vec3(scale, scale, 1)
          }, {
            easing: 'quadOut'
          }).to(duration, {
            scale: new Vec3(1, 1, 1)
          }, {
            easing: 'quadOut'
          }).start();
        }

        moveTo(node, position, duration) {
          if (duration === void 0) {
            duration = 0.2;
          }

          Tween.stopAllByTarget(node);
          tween(node).to(duration, {
            position
          }, {
            easing: 'quadOut'
          }).start();
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=91a181bbe520ce4c02c41c10399c20914b028dad.js.map