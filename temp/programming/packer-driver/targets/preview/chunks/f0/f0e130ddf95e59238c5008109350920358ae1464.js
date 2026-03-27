System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, BuffSkillManager, _crd;

  _export("BuffSkillManager", void 0);

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1459ePKRuZFUpD33e4EBiI2", "BuffSkillManager", undefined);

      /**
       * Buff / Skill 管理器：
       * 负责角色与局内临时效果、被动技能、主动技能状态缓存。
       * 目前为占位骨架，后续接入右上角状态展示区。
       */
      _export("BuffSkillManager", BuffSkillManager = class BuffSkillManager {
        constructor() {
          this.modifiers = [];
        }

        list() {
          return this.modifiers.slice();
        }

        add(modifier) {
          this.modifiers.push(modifier);
        }

        remove(id) {
          var index = this.modifiers.findIndex(item => item.id === id);

          if (index >= 0) {
            this.modifiers.splice(index, 1);
          }
        }

        clear() {
          this.modifiers.length = 0;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=f0e130ddf95e59238c5008109350920358ae1464.js.map