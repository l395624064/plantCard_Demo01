---
name: code-style-skill
description: Enforces this project's highest-priority coding conventions: MVC-style module structure, minimal ui/event/model managers when missing, module naming and folder standards, utility placement, and project git workflow constraints. Use for any code creation, refactor, module setup, or git-related operation in this repository.
---

# 代码习惯skill（项目级）

## Priority

- Treat this skill as highest priority for this repository.
- Apply these conventions before adding new business logic.

## Scope

- This is a **project skill** and only applies to this project.

## Core Architecture Rule

- Prefer MVC-style separation for feature modules.
- For any complete module, include:
  - one manager (global control),
  - one model layer (data lifecycle),
  - one view layer (ui/item/panel split).

## Baseline Managers (create only when missing)

- **UI manager**
  - If no global `uiManager.ts` and no reusable UI base component exist, create a minimal `uiManager.ts`.
  - Must provide open/close APIs.
  - Must expose the last opened UI for debugging via `uiManager.curui`.

- **Event manager**
  - If no global `eventManager.ts`, create a minimal version.
  - Must support:
    - `on` for subscribe/listen,
    - `emit` for dispatch.
  - Custom events must be registrable and usable across modules.

- **Model manager**
  - If no global `modelManager.ts`, create a minimal version.
  - Model usage rule:
    - module model types must be registered in `modelManager`,
    - module model data source/store must be enabled before module features use it.

## Module Directory Standard

When creating a feature module (example: `card`), use:

- `src/card/CardManager.ts`
- `src/card/model/CardModelBase.ts`
- `src/card/model/CardModelBuilder.ts`
- `src/card/view/ui/*`
- `src/card/view/item/*`
- `src/card/view/panel/*`
- `src/card/utils/*`
- `src/card/CardEnum.ts`

For another module (example: `parcel`), keep the same structure with module name replacement.

## Enum/Type/Interface Naming Rule

Inside `<ModuleName>Enum.ts`, follow:

- `type` naming: `type_<模块名称>_xxx`
- `enum` naming: `enum_<模块名称>_xxx`
- `interface` naming: `interface_<模块名称>_xxx`
- Use camelCase style for meaningful name segments.

## View File Size Rule

- Files under `view/*` should stay within about 300 lines.
- If a view grows too large, split complex pieces into `item` or `panel`.
- Goal: lower reading and maintenance complexity.

## Utility Placement Rule

- Frequently reused cross-module tools should be global utilities, for example:
  - `TweenUtils.ts`,
  - `ArrayUtils.ts`,
  - `ColorUtils.ts`.
- Module-specific helpers must stay in that module’s `utils/*`.

## Project Git Management

- Before coding or committing, always inspect current repo state:
  - run `git status`,
  - review relevant `git diff`.
- Keep commits focused by feature/task step; avoid unrelated mixed changes.
- Do not use destructive git operations unless user explicitly asks:
  - no `reset --hard`,
  - no forced push to shared branches.
- Do not amend or rewrite history unless user explicitly requests it.
- Prefer clear commit messages with module + intent, for example:
  - `feat(parcel): add parcel manager skeleton`
  - `refactor(card): split card view into item and panel`
- If repository has uncommitted unrelated work, preserve it and avoid rollback.

## Execution Workflow

Before coding:

1. Check whether baseline managers already exist.
2. Reuse existing manager/base systems when present.
3. Only create minimal manager scaffolding when missing.
4. Create module skeleton in MVC-oriented structure.
5. Keep view files small and split by ui/item/panel.
6. Place utilities in correct scope (global vs module).
7. Check git status/diff to avoid touching unrelated changes.

After coding:

1. Verify naming/path conventions.
2. Verify manager registration flow for models.
3. Verify no oversized `view/*` file remains without split.
4. Recheck git diff so only intended changes remain.

## Clarification Rule (must ask user)

If any of these are unclear, stop and ask user before proceeding:

- exact location/path for global managers in the current project,
- expected interface signatures for ui/event/model managers,
- whether 300-line view limit is strict or soft,
- exceptions to naming prefixes in `<ModuleName>Enum.ts`,
- project-specific git branching/commit strategy preferences.
