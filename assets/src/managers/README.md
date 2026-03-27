# Managers 设计草图

这里的管理器是“下一步重构目标”，不是要求一次性替换现有代码。

## 管理器清单

### `game/GameManager.ts`

- 高层总控入口。
- 负责组合各子管理器。
- 未来目标：让 `MainGame.ts` 只保留 Cocos 生命周期与场景挂载。

### `flow/GameFlowManager.ts`

- 管理局内流程阶段。
- 示例阶段：选牌、预放置跟随、预放置锁定、结算、补牌动画。
- 未来目标：收拢 `MainGame.ts` 中零散的流程状态。

### `card/CardManager.ts`

- 管理牌库、手牌、抽牌、出牌预检。
- 当前是对 `GameModel` 的轻量封装。
- 未来目标：把牌相关操作统一从 `GameModel` 中抽离到更清晰的服务接口。

### `ui/UIManager.ts`

- 负责创建、销毁、刷新 `GameView`。
- 负责界面动画调度入口。
- 未来目标：让 UI 相关逻辑不直接散落在 `MainGame.ts`。

### `effect/EffectManager.ts`

- 管理表现层 tween、提示、脉冲和飞入效果。
- 未来目标：收拢手牌飞入、旋转过渡、按钮反馈等特效代码。

### `buff/BuffSkillManager.ts`

- 管理 Buff / Debuff / Skill 的运行时状态。
- 未来目标：对接顶部右侧预留 UI 区和结算逻辑。

### `score/ScoreManager.ts`

- 管理分数结算摘要与表现层可读结构。
- 未来目标：从 `GameModel` 的原始判定结果中生成统一结算文本和明细。

## 建议迁移图

```text
MainGame
  └─ GameManager
      ├─ GameFlowManager
      ├─ CardManager
      ├─ UIManager
      ├─ EffectManager
      ├─ BuffSkillManager
      └─ ScoreManager
```

## 推荐重构步骤

1. `MainGame` 先改为持有 `GameManager`。
2. `GameView` 的创建、销毁、render 迁到 `UIManager`。
3. `GameModel` 的直接调用逐步改走 `CardManager`。
4. 各类动画从 `GameView` 中抽成 `EffectManager`。
5. Buff、Skill、分数摘要再接到真实业务。

## 当前状态说明

- 已新增目录与管理器骨架。
- 当前游戏仍然使用旧主链路运行，确保 Demo 不被大重构打断。
- 下一阶段可以按模块逐步迁移，不需要一次性拆完。
