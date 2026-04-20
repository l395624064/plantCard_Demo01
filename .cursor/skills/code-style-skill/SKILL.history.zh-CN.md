# code-style-skill 变更历史

## 20260417-141826

- version: `20260417-141826`
- time: `2026-04-17`
- type: `update`
- scope:
  - 辅助引导自动工具链
  - 工具链步骤语义元数据
  - 模板 AI理解优先基线
- summary:
  - 新增强制闭环：`check -> auto implement -> debug validate`。
  - 工具实现推荐目录调整为 `skillTools/*`。
  - 非可直接执行脚本要求补充双语工具说明与启动入口。

## 20260417-143748

- version: `20260417-143748`
- time: `2026-04-17`
- type: `add`
- scope:
  - skill 历史治理
  - 优先级合规自检
- summary:
  - 新增 `SKILL.history.md` 作为强制变更历史文件。
  - 新增安装后优先级合规自检规则。
  - 明确在助手可控执行层保证 skill 优先。

## 20260417-144219

- version: `20260417-144219`
- time: `2026-04-17`
- type: `update`
- scope:
  - 历史与待定双语治理
  - 待定计划治理规则
- summary:
  - 历史与待定文件新增双语强制要求（`*.md` + `*.zh-CN.md`）。
  - 明确中英文件必须同次同步更新并保持语义一致。

## 20260417-152706

- version: `20260417-152706`
- time: `2026-04-17`
- type: `update`
- scope:
  - 自动工具链产物隔离
  - 生成文件回执
  - 检查后自动启动
- summary:
  - 强制自动工具链新增文件默认留在 `skillTools/*`，禁止默认写入业务目录。
  - 新增“生成文件回执”规则并要求越界文件自动修正。
  - 新增“自动工具链流程检查成功后自动启动工具”规则。

## 20260417-172742

- version: `20260417-172742`
- time: `2026-04-17`
- type: `update`
- scope:
  - web 工具链实现参考
  - 非强制稳定性指导
- summary:
  - 在 web 工具链示例下新增“实现参考（稳定性指导）”段落。
  - 补充路径、去重、启动、停止、最小自检与回执的参考要点。

## 20260420-165407

- version: `20260420-165407`
- time: `2026-04-20`
- type: `update`
- scope:
  - WEB-5 acceptance 工具链步骤
  - acceptance 四阶段阻断闭环
  - Game_acceptance_board 生成规则
  - acceptance 工具职责定义
- summary:
  - 新增 `WEB-5`，将验收看板生成、runtime 分析与回写纳入 web 工具链步骤。
  - 强化 acceptance 四阶段为最高优先级阻断门，任一阶段失败必须暂停后续工作流并回执原因。
  - 明确 `Game_acceptance_board.md` 路径、必填字段、映射字段和 AI 验收字段要求。
