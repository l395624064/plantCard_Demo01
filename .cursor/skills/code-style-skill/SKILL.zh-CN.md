# 代码习惯skill（中文简版）

> 本文件为 `SKILL.md` 的中文简版说明，语义必须与 `SKILL.md` 保持一致。

## 适用范围与优先级

- 仅当前项目生效（project skill）。
- 本规则在项目内为最高优先级。
- 模块根目录统一：`assets/src/<module>/*`。

## 架构总原则

- 功能模块优先采用 MVC 思路。
- 完整模块至少包含：
  - manager（总控）
  - model（数据层）
  - view（ui/item/panel 分层）

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

## 命名规范（Enum/Type/Interface）

在 `<ModuleName>Enum.ts` 中：

- `type_<module>_xxx`
- `enum_<module>_xxx`
- `interface_<module>_xxx`

说明：

- `<module>` 必须小写（如 `card`、`parcel`、`audio`）；
- 有意义字段采用驼峰式命名。

## View 与 Manager 约束

- `view/*` 建议约 300 行内（软限制）。
- 若 UI 内部组件复杂，优先拆分到 `item` 或 `panel`。
- `Manager` 必须保持单一职责与唯一性：
  - 例如 `AudioManager` 只管理音频，不混入其他模块逻辑。

## 工具函数放置规范

- 高复用、跨模块工具放全局工具（如 `TweenUtils.ts`、`ArrayUtils.ts`、`ColorUtils.ts`）。
- 仅模块内部使用的工具放 `<module>/utils/*`。

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
