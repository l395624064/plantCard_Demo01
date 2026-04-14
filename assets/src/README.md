# `assets/src` 结构说明

## 当前结构（2026-03）

```text
assets/src
├─ MainGame.ts                  # 入口协调器（场景生命周期 + 编排）
├─ GameModelImpl.ts             # 主模型门面
├─ GameViewImpl.ts              # 主视图门面
├─ GlobalConst.ts               # 全局常量
├─ core
│  ├─ adaptive/AdaptiveLayout.ts
│  └─ types/BaseGameTypes.ts
│  ├─ event/{EventEnum.ts, EventManager.ts}
│  ├─ model/ModelManager.ts
│  └─ ui/UIManager.ts
├─ flow
│  ├─ GameConst.ts
│  ├─ FlowManager.ts            # flow 门面管理器（gm/rotation）
│  └─ model/*                   # 流程模型（FlowModelManager + FlowModelUtils）
├─ card
│  ├─ CardTypes.ts
│  ├─ CardGeometry.ts
│  └─ types/CardCellTypes.ts
├─ board
│  ├─ BoardTypes.ts
│  └─ BoardUtils.ts
└─ view
   └─ ViewStateTypes.ts
├─ game
│  ├─ GameMainManager.ts        # game 编排门面管理器（placement）
│  └─ (no domain implementation)
├─ card/*                       # 卡牌模块骨架
└─ parcel/*                     # 地块模块（ParcelManager + ParcelUtils）
```

## 当前约束（与 code-style-skill 对齐）

1. `game/*` 仅用于跨模块编排，不承载长期领域核心实现。
2. 游戏流程、胜负判定、流程推进放独立流程模块（`flow/*`）。
3. 适配相关逻辑统一放在 `core/adaptive/*`。
4. 禁止“仅做拼装/转发”的冗余状态构建层。
5. 视图实现保持门面化并清理未使用代码。
6. 正式模式下默认不使用 `controller/*` 与独立 `*Service.ts` 文件。

## 说明

- 已完成：`MainGameViewStateBuilder` 删除并内联，`MainGameUiRootBuilder` 迁移到 `core/adaptive`，`game/model/*` 迁移到 `flow/model/*`，`ParcelGameplayService`/`flow/model/*Service` 下沉为 manager+utils，并完成 `GameTypes` 领域拆分。
- 后续重点：继续收敛 `GameViewImpl.ts` 体量并降低 `any` 使用。
