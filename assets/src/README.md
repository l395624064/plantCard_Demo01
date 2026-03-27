# `assets/src` 结构说明

当前项目先保持 `MainGame.ts + GameModel.ts + GameView.ts + GameTypes.ts` 这套可运行主链路不动，在此基础上补了一层更清晰的目录骨架，方便后续逐步迁移逻辑。

## 当前目录建议

```text
assets/src
├─ MainGame.ts                # 当前游戏入口，仍负责把流程串起来
├─ GameModel.ts               # 当前规则与数据模型
├─ GameView.ts                # 当前界面与交互渲染
├─ GameTypes.ts               # 公共类型与基础常量
├─ managers
│  ├─ buff
│  ├─ card
│  ├─ effect
│  ├─ flow
│  ├─ game
│  ├─ score
│  └─ ui
└─ README.md
```

## 现阶段拆分原则

1. 先补“职责边界”，不一次性重写主流程。
2. 先让管理器成为可复用骨架，再逐步把 `MainGame / GameModel / GameView` 的代码迁过去。
3. 所有新增管理器都尽量做轻量封装，避免当前 Demo 失稳。

## 后续推荐迁移顺序

1. 先把 `MainGame` 中的视图创建与刷新迁到 `UIManager`。
2. 再把出牌、抽牌、手牌查询迁到 `CardManager`。
3. 再把阶段状态迁到 `GameFlowManager`。
4. 再把表现动画统一收进 `EffectManager`。
5. 最后接 `BuffSkillManager` 和 `ScoreManager` 到真实业务。

## 当前文件职责

- `MainGame.ts`
  当前场景入口与主循环协调器。
- `GameModel.ts`
  当前规则核心，包含牌库、手牌、棋盘和放置判定。
- `GameView.ts`
  当前 UI、输入处理、拖拽与动画表现。
- `GameTypes.ts`
  类型定义、旋转规则和基础常量。

更多细分职责见 `assets/src/managers/README.md`。
