System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, ScoreManager, _crd;

  function _reportPossibleCrUseOfPlacementPreview(extras) {
    _reporterNs.report("PlacementPreview", "../../GameTypes", _context.meta, extras);
  }

  _export("ScoreManager", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "e54c2F9MhFDjYjHYHIBph71", "ScoreManager", undefined);

      /**
       * 分数结算管理器：
       * 负责把出牌结果整理成 UI 可展示的结算结构。
       * 现阶段不替代 GameModel，只负责结算摘要与表现层适配。
       */
      _export("ScoreManager", ScoreManager = class ScoreManager {
        buildBreakdown(preview) {
          return {
            total: preview.scoreGain,
            sameColorHits: preview.sameColorHits.length,
            diffColorHits: preview.diffColorHits.length,
            requiredRotten: preview.requiredRotten
          };
        }

        buildSummary(preview) {
          if (!preview.isValid) {
            return preview.reason;
          }

          return [`得分 +${preview.scoreGain}`, `同色重叠 ${preview.sameColorHits.length}`, `异色重叠 ${preview.diffColorHits.length}`].join(' | ');
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=65b9c917a2f62a7b2cd25a3b5a11695f565e782a.js.map