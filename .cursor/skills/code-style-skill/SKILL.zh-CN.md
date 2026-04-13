# 代码习惯skill（中文简版）

> 本文件为 `SKILL.md` 的中文简版说明，语义必须与 `SKILL.md` 保持一致。

## 适用范围与优先级

- 仅当前项目生效（project skill）。
- 本规则在项目内为最高优先级。
- 模块根目录统一：`assets/src/<module>/*`。

## 架构总原则

- 先保证模块单一职责，再考虑分层形式。
- 功能模块优先采用 MVC 思路，但不是所有模块都必须有 model/view。
- 基础设施模块（例如 `core/*`）可以只保留必要的基础设施代码。
- 禁止为了“结构完整”而创建无业务价值的空层。

## 游戏流程独立模块规则（硬规则）

- 游戏规则、流程推进、胜负判定必须放入独立流程模块。
- 模块命名允许同义（例如 `flow/*`、`gameFlow/*`），但同一项目内必须统一一种命名风格。
- 禁止将流程核心逻辑散落在入口文件、视图文件或临时工具文件中。

## `game/*` 目录职责规则（硬规则）

- `game/*` 仅允许承载跨模块编排/协调逻辑。
- `game/*` 可做跨模块调用编排，但不得长期承载具体领域核心实现。
- 领域核心实现（例如棋盘/卡牌/地块/植物）必须归属各自独立模块。

## 禁止冗余状态构建层（硬规则）

- 禁止新增仅做字段拼装/透传且无独立业务价值的状态构建器文件。
- 这类层默认不应存在。
- 该类逻辑应：
  - 直接放在入口协调层，或
  - 放在真实流程/领域模块（当其职责确实属于该模块）。

## 适配归属规则（硬规则）

- 屏幕适配、Canvas 适配、安全区与缩放计算逻辑，统一放在 `core` 适配模块（例如 `core/adaptive/*`）。
- 禁止将适配逻辑放在业务模块目录中。

## 全局管理器（缺失时才创建）

全局路径统一：

- `assets/src/core/ui/UIManager.ts`
- `assets/src/core/event/EventManager.ts`
- `assets/src/core/model/ModelManager.ts`

最小接口要求：

- `UIManager`
  - `open(uiKey, data?)`
  - `close(uiKey?)`
  - `closeAll()`
  - `curui`（最后打开的 UI 实例）
- `EventManager`
  - `on(event, handler, target?)`
  - `off(event, handler?, target?)`
  - `emit(event, payload?)`
  - `once(event, handler, target?)`
- `ModelManager`
  - `register(type, ctor)`
  - `enable(type)`
  - `get(type)`
  - `disable(type)`
  - `destroy(type)`

Model 使用要求：

- 模块 model 类型需先在 `ModelManager` 注册；
- 模块功能使用前需先启用对应 model 数据源/实例。

## 模块目录规范

以 `card` 模块为例：

- `assets/src/card/CardManager.ts`
- `assets/src/card/model/CardModelBase.ts`
- `assets/src/card/model/CardModelBuilder.ts`
- `assets/src/card/view/ui/*`
- `assets/src/card/view/item/*`
- `assets/src/card/view/panel/*`
- `assets/src/card/utils/*`
- `assets/src/card/CardEnum.ts`

其他模块（如 `parcel`）按模块名等价替换。

- 说明：
  - 以上是“按需推荐结构”，不是要求每个模块都必须包含全部层级。
  - 不允许仅为凑结构而新增空的 model/view 层。

## 命名规范（Enum/Type/Interface）

在 `<ModuleName>Enum.ts` 中：

- `type_<module>_xxx`
- `enum_<module>_xxx`
- `interface_<module>_xxx`

说明：

- `<module>` 必须小写（如 `card`、`parcel`、`audio`）；
- 有意义字段采用驼峰式命名。

## Manager 调试挂载安全规则

- 若需要把 manager 单例挂到 `window` 便于调试，必须先做运行环境判断：
  - 使用 `if (typeof window !== 'undefined') { ... }`
  - 再执行 `window['模块名Manager'] = 模块Manager`

## View 与 Manager 约束

- `view/*` 建议约 300 行内（软限制）。
- 若 UI 内部组件复杂，优先拆分到 `item` 或 `panel`。
- 视图实现必须保持清洁：
  - 清理未调用方法、未使用字段、未使用导入；
  - 视图入口类仅保留门面职责；
  - 交互/绘制/几何等重逻辑下沉到专门模块。
- `Manager` 必须保持单一职责与唯一性：
  - 例如 `AudioManager` 只管理音频，不混入其他模块逻辑。

## 类型文件单一职责规则（硬规则）

- 禁止“全能类型文件”混放多个领域的类型与职责。
- 类型应按领域拆分。
- 跨领域共享类型应保持最小且稳定。
- 允许短期过渡导出文件，但需按计划逐步移除。

## 防碎片化拆分规则（硬规则）

- 禁止对直接依赖、强上下文耦合的小体量代码进行过度拆分，避免产生过多碎片文件。
- 对于直接依赖代码，若实现体量低于约 60 行，默认保持在当前归属文件中。
- 目标是在“功能单一职责”和“人工审阅可读性”之间取得平衡。
- 建议拆分时机：
  - 代码扩写并持续超过约 60 行，
  - 已出现明显多职责混杂，
  - 出现稳定跨文件复用需求。
- 参考阈值：
  - 小于 60 行：默认不拆；
  - 60-100 行：结合复杂度和耦合度评估；
  - 大于 100 行：优先拆分。
- 允许提前拆分的例外：
  - 安全或关键生命周期边界；
  - 明确的公共复用能力；
  - 可测试性/隔离性需要；
  - 用户明确要求拆分。

## MVP 模式规则（硬规则）

- 当用户明确提出以下指令时，必须按 MVP 生命周期默认规则执行，无需额外提示词模板：
  - `xx模块需要使用mvp模式开发`
  - `xx模块需要从mvp模式转正`
- 可选第三条指令：
  - `xx模块的mvp方案废弃`

### MVP 开发默认行为

- 功能代码放在：
  - `assets/src/mvp_<feature>/*`
- 必须满足三条约束：
  1. 单入口接入（`Mvp<Feature>Entry.ts` 作为唯一接入入口）；
  2. 明确开关控制（关闭后主链路行为不变）；
  3. 不污染核心契约（MVP 阶段默认不修改 `core/*`、`flow/*` 的共享契约，除非用户明确要求）。

### MVP 转正默认行为

- 将确认保留的 MVP 逻辑迁移到正式模块，并遵循当前 code-style-skill 的边界与命名规则。
- 清理 MVP 阶段临时耦合代码。
- 转正后删除 `mvp_<feature>` 目录与残留接入点。

### MVP 废弃默认行为

- 关闭开关、移除接入入口、删除 `mvp_<feature>` 目录。
- 确保删除后主链路行为不受影响。

## 工具函数放置规范

- 高复用、跨模块工具放全局工具（如 `TweenUtils.ts`、`ArrayUtils.ts`、`ColorUtils.ts`）。
- 仅模块内部使用的工具放 `<module>/utils/*`。

## 常量放置规范

- 全局共享常量统一放在：
  - `assets/src/GlobalConst.ts`
- 模块内常量放在模块目录下，命名为：
  - `<ModuleName>Const.ts`
  - 例如：`assets/src/card/CardConst.ts`、`assets/src/parcel/ParcelConst.ts`

## 模块临时代码规则

- 某个模块的测试性/实验性代码，统一放在：
  - `assets/src/<module>/tmp/*`
- `<module>/tmp/*` 下代码视为可抛弃代码，可随时删除。
- 临时代码不允许成为稳定功能模块的运行时依赖。
- 核心模块逻辑不得依赖 `<module>/tmp/*` 中的文件。

## 事件系统规范

- 事件定义保持单文件集中管理，不按模块拆分事件定义文件。
- 事件定义路径统一：`assets/src/core/event/EventEnum.ts`。
- 事件命名使用下划线风格：
  - 模块事件：`card_xxx`、`parcel_xxx`、`audio_xxx`
  - 公共事件：`app_xxx` 或 `global_xxx`
- `EventManager` 使用全局单例方式（不引入 Sender 包装层）。
- Manager 生命周期事件处理约束：
  - 在 `addEvents()` 注册
  - 在 `offEvents()` 反注册
  - `dispose()` 必须调用 `offEvents()`

## Git 管理约束（当前项目）

- 编码/提交前先检查 `git status` 与相关 `git diff`。
- 提交按任务粒度聚焦，避免混入无关改动。
- 未经用户明确要求，禁止破坏性操作：
  - `reset --hard`
  - 强制推送共享分支
- 未经用户明确要求，不改写历史（如 amend）。
- 若仓库有无关未提交改动，必须保留，禁止回滚用户改动。
- 当前 skill 不强制分支命名与 PR 流程。

## 执行流程

编码前：

1. 检查全局 manager 是否已存在。
2. 优先复用现有基建。
3. 缺失时仅补最小可用 manager。
4. 按模块规范创建目录和骨架。
5. view 按 ui/item/panel 控制复杂度。
6. 工具函数放置到正确层级。
7. 检查 git 状态，避免误改无关文件。

编码后：

1. 校验命名与目录规范。
2. 校验 model 注册/启用流程。
3. 校验 view 复杂度与拆分合理性。
4. 复查 git diff，仅保留目标改动。
5. 复查是否产生了不必要的小碎片文件（直接依赖且小于 60 行的代码默认不拆）。

## 歧义处理（必须先问用户）

遇到以下不明确项，必须先沟通再执行：

- 全局 manager 的确切路径或组织方式是否变更；
- ui/event/model 需要超出最小接口时的签名；
- view 300 行阈值在当前任务是否有例外；
- `<ModuleName>Enum.ts` 命名前缀是否有模块级例外；
- 是否允许 manager 做临时跨模块编排。

## Skill 维护治理（强制）

- 任何对 `code-style-skill` 的修改，必须先和用户讨论。
- 只有用户确认完整方案后，才允许修改 skill 文件。
- 维护时必须同步更新：
  - `SKILL.md`
  - `SKILL.zh-CN.md`
- 两个版本语义必须一致。
- 规则文本写法要求：
  - 规则正文保持抽象、稳定，避免强绑定当前具体文件名；
  - 具体文件名放到示例/附录（如确有必要）。
