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
- Module root path in this repository is unified as `assets/src/<module>/*`.

## Core Architecture Rule

- Prefer MVC-style separation for feature modules.
- For any complete module, include:
  - one manager (global control),
  - one model layer (data lifecycle),
  - one view layer (ui/item/panel split).

## Baseline Managers (create only when missing)

- Global manager location is unified as:
  - `assets/src/core/ui/UIManager.ts`
  - `assets/src/core/event/EventManager.ts`
  - `assets/src/core/model/ModelManager.ts`

- **UI manager**
  - If no global UI manager and no reusable UI base component exist, create a minimal `UIManager.ts`.
  - Minimum interfaces:
    - `open(uiKey, data?)`
    - `close(uiKey?)`
    - `closeAll()`
    - `curui` (the last opened UI instance, for debugging and console access)
  - Additional methods are allowed later when UI flow becomes more complex.

- **Event manager**
  - If no global event manager exists, create a minimal `EventManager.ts`.
  - Minimum interfaces:
    - `on(event, handler, target?)`
    - `off(event, handler?, target?)`
    - `emit(event, payload?)`
    - `once(event, handler, target?)`
  - Custom events must be registrable and usable across modules.

- **Model manager**
  - If no global model manager exists, create a minimal `ModelManager.ts`.
  - Minimum interfaces:
    - `register(type, ctor)`
    - `enable(type)`
    - `get(type)`
    - `disable(type)`
    - `destroy(type)`
  - Model usage rule:
    - module model types must be registered in `modelManager`,
    - module model data source/store must be enabled before module features use it.

## Module Directory Standard

When creating a feature module (example: `card`), use:

- `assets/src/card/CardManager.ts`
- `assets/src/card/model/CardModelBase.ts`
- `assets/src/card/model/CardModelBuilder.ts`
- `assets/src/card/view/ui/*`
- `assets/src/card/view/item/*`
- `assets/src/card/view/panel/*`
- `assets/src/card/utils/*`
- `assets/src/card/CardEnum.ts`

For another module (example: `parcel`), keep the same structure with module name replacement.

## Enum/Type/Interface Naming Rule

Inside `<ModuleName>Enum.ts`, follow:

- `type` naming: `type_<module>_xxx`
- `enum` naming: `enum_<module>_xxx`
- `interface` naming: `interface_<module>_xxx`
- `<module>` must be lowercase (for example: `card`, `parcel`, `audio`).
- Use camelCase style for meaningful name segments.

## View File Size Rule

- Files under `view/*` should stay within about 300 lines.
- This is a soft limit. Decide by readability and complexity, not by hard cutoff only.
- If a view contains complex internal components, prefer splitting into `item` or `panel`.
- Goal: lower reading and maintenance complexity.
- For `Manager` files, keep single-responsibility and uniqueness:
  - for example, `AudioManager` manages audio only,
  - do not mix unrelated module logic into one manager.

## Utility Placement Rule

- Frequently reused cross-module tools should be global utilities, for example:
  - `TweenUtils.ts`,
  - `ArrayUtils.ts`,
  - `ColorUtils.ts`.
- Module-specific helpers must stay in that module’s `utils/*`.

## Temporary Test Code Rule

- Temporary or experimental code for a module must be placed under:
  - `assets/src/<module>/tmp/*`
- Code inside `<module>/tmp/*` is considered disposable test scaffolding.
- It may be deleted at any time and must not become a dependency of stable module runtime.
- Do not let core module logic rely on files from `<module>/tmp/*`.

## Event System Rule

- Event definition remains in a single centralized file, do not split by module.
- Unified event definition path for this project:
  - `assets/src/core/event/EventEnum.ts`
- Event naming uses underscore style (snake-like segments):
  - module events: `card_xxx`, `parcel_xxx`, `audio_xxx`
  - common/app events: `app_xxx` or `global_xxx`
- `EventManager` is a global singleton style service (no Sender wrapper layer).
- Manager event lifecycle must follow:
  - register in `addEvents()`
  - unregister in `offEvents()`
  - `dispose()` must call `offEvents()`

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
- Branch naming / PR workflow is not mandatory in this skill for now.

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
- expected interface signatures beyond the minimum ui/event/model manager set,
- whether 300-line view limit is strict or soft,
- exceptions to naming prefixes in `<ModuleName>Enum.ts`,
- whether any manager needs temporary cross-module orchestration.

## Skill Change Governance (Mandatory)

- Any future modification to this `code-style-skill` must be discussed with the user first.
- Only after the user confirms the full change plan can the skill file be updated.
- This skill uses two synchronized documents:
  - `SKILL.md` (current English-oriented master)
  - `SKILL.zh-CN.md` (Chinese simplified version)
- Any maintenance must update both files in the same change, and keep semantics consistent.
