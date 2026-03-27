System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _crd, BOARD_COLS, BOARD_ROWS, CARD_TEMPLATE_COLS, CARD_TEMPLATE_ROWS, HAND_SIZE, MAX_ROTTEN, TARGET_SCORE, DICE_VALUES, FRUIT_COLORS;

  function cloneGridPos(pos) {
    if (!pos) {
      return null;
    }

    return {
      x: pos.x,
      y: pos.y
    };
  }

  function getCardBounds(cells) {
    if (cells.length === 0) {
      return {
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
        width: 0,
        height: 0
      };
    }

    var xs = cells.map(cell => cell.x);
    var ys = cells.map(cell => cell.y);
    var minX = Math.min(...xs);
    var minY = Math.min(...ys);
    var maxX = Math.max(...xs);
    var maxY = Math.max(...ys);
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX + 1,
      height: maxY - minY + 1
    };
  }

  function normalizeCardCells(cells) {
    var bounds = getCardBounds(cells);
    return cells.map(cell => {
      var _cell$plantVariant;

      return {
        x: cell.x - bounds.minX,
        y: cell.y - bounds.minY,
        color: cell.color,
        plantVariant: (_cell$plantVariant = cell.plantVariant) != null ? _cell$plantVariant : null
      };
    });
  }

  function rotateCardCells(cells, rotation) {
    var next = normalizeCardCells(cells);
    var width = getCardBounds(next).width;
    var height = getCardBounds(next).height; // 棋盘格坐标的 y 轴向下，因此正 rotation 在这里表示“视觉上的顺时针 90°”

    for (var i = 0; i < rotation; i++) {
      next = next.map(cell => {
        var _cell$plantVariant2;

        return {
          x: height - 1 - cell.y,
          y: cell.x,
          color: cell.color,
          plantVariant: (_cell$plantVariant2 = cell.plantVariant) != null ? _cell$plantVariant2 : null
        };
      });
      var oldWidth = width;
      width = height;
      height = oldWidth;
      next = normalizeCardCells(next);
    }

    return next;
  }

  _export({
    cloneGridPos: cloneGridPos,
    getCardBounds: getCardBounds,
    normalizeCardCells: normalizeCardCells,
    rotateCardCells: rotateCardCells
  });

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "d8080Hm8W9DEY/SwECALMKx", "GameTypes", undefined);
      /** 放置卡：可拖入格子的果丛卡；法术卡：后续版本启用 */


      _export("BOARD_COLS", BOARD_COLS = 8);

      _export("BOARD_ROWS", BOARD_ROWS = 8);

      _export("CARD_TEMPLATE_COLS", CARD_TEMPLATE_COLS = 2);

      _export("CARD_TEMPLATE_ROWS", CARD_TEMPLATE_ROWS = 3);

      _export("HAND_SIZE", HAND_SIZE = 3);

      _export("MAX_ROTTEN", MAX_ROTTEN = 2);

      _export("TARGET_SCORE", TARGET_SCORE = 9999);

      _export("DICE_VALUES", DICE_VALUES = [1, 3, 6, 10]);

      _export("FRUIT_COLORS", FRUIT_COLORS = ['red', 'yellow', 'purple']);

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=7ee451989c49fee0da860b35f4798a923890683d.js.map