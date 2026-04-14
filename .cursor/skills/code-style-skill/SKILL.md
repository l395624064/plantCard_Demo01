---
name: code-style-skill
description: Enforces this project's highest-priority coding conventions: MVC-style module structure, minimal ui/event/model managers when missing, module naming and folder standards, utility placement, and project git workflow constraints. Use for any code creation, refactor, module setup, or git-related operation in this repository.
version: 20260414-111021
---

# 代码习惯skill（项目级）

## Priority

- Treat this skill as highest priority for this repository.
- Apply these conventions before adding new business logic.

## Scope

- This is a **project skill** and only applies to this project.
- This skill uses a two-layer model:
  - **Core Rules**: reusable across most AI-assisted small/medium projects.
  - **Project Profile**: project-specific paths/module aliases plugged into placeholders.
- Before applying this skill to another project, update profile placeholders first.

## Project Profile Layer (Mandatory For Portability)

- Define project profile placeholders and keep them synchronized:
  - `{{module_root}}`
  - `{{orchestration_module}}`
  - `{{flow_module_alias}}`
  - `{{adaptive_module_root}}`
  - `{{ui_manager_path}}`
  - `{{event_manager_path}}`
  - `{{model_manager_path}}`
  - `{{event_definition_file}}`
  - `{{global_const_file}}`
  - `{{mvp_root}}`
  - `{{module_tmp_rule}}`
- [PROJECT EXAMPLE - NON-NORMATIVE] Current project profile example:
  - `{{module_root}} = assets/src`
  - `{{orchestration_module}} = game`
  - `{{flow_module_alias}} = flow`
  - `{{adaptive_module_root}} = core/adaptive`
  - `{{ui_manager_path}} = assets/src/core/ui/UIManager.ts`
  - `{{event_manager_path}} = assets/src/core/event/EventManager.ts`
  - `{{model_manager_path}} = assets/src/core/model/ModelManager.ts`
  - `{{event_definition_file}} = assets/src/core/event/EventEnum.ts`
  - `{{global_const_file}} = assets/src/GlobalConst.ts`
  - `{{mvp_root}} = assets/src/mvp_<feature>`
  - `{{module_tmp_rule}} = assets/src/<module>/tmp/*`

## Core Architecture Rule

- Enforce single-responsibility module boundaries first.
- Prefer MVC-style separation for feature modules, but do not force every module to have model/view.
- Infrastructure modules (for example: `core/*`) may only contain necessary infrastructure code.
- Avoid creating structural folders/classes without business value.

## Game Flow Module Rule (Hard Rule)

- Game rules, game progression, and win/lose resolution must be placed in an independent flow module.
- Module naming may use equivalent naming styles (for example: `flow/*` or `gameFlow/*`), but one project must use one naming style consistently.
- Do not scatter flow-core logic into entry files, view files, or temporary helper files.

## Orchestration Scope Rule (Hard Rule)

- `{{orchestration_module}}/*` is orchestration-only.
- `{{orchestration_module}}/*` can coordinate cross-module actions, but must not hold long-term domain-core implementations.
- Domain-core implementations (for example board/card/parcel/plant) must live in their own domain modules.

## No Redundant State-Builder Layer (Hard Rule)

- Do not create files that only assemble/forward state fields without independent business value.
- This type of "state builder" layer should not exist by default.
- Place this logic either:
  - directly in the entry coordination layer, or
  - inside a real flow/domain module when it belongs to that module's responsibility.

## Adaptation Ownership Rule (Hard Rule)

- Screen adaptation, canvas adaptation, safe-area and scale calculation logic must be placed in dedicated adaptation module (for example: `{{adaptive_module_root}}/*`).
- Do not place adaptation logic under business module folders.

## Baseline Managers (create only when missing)

- Global manager location is defined by project profile:
  - `{{ui_manager_path}}`
  - `{{event_manager_path}}`
  - `{{model_manager_path}}`

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

When creating a feature module (example: `feature`), prefer this structure when needed:

- `{{module_root}}/feature/FeatureManager.ts`
- `{{module_root}}/feature/model/FeatureModelBase.ts`
- `{{module_root}}/feature/model/FeatureModelBuilder.ts`
- `{{module_root}}/feature/view/ui/*`
- `{{module_root}}/feature/view/item/*`
- `{{module_root}}/feature/view/panel/*`
- `{{module_root}}/feature/utils/*`
- `{{module_root}}/feature/FeatureEnum.ts`

For another module, keep the same structure with module name replacement.

- Important:
  - This is a recommended structure, not a mandatory requirement that every module must include all layers.
  - Do not add empty model/view layers just to satisfy structure.

## Enum/Type/Interface Naming Rule

Inside `<ModuleName>Enum.ts`, follow:

- `type` naming: `type_<module>_xxx`
- `enum` naming: `enum_<module>_xxx`
- `interface` naming: `interface_<module>_xxx`
- `<module>` must be lowercase (for example: `card`, `parcel`, `audio`).
- Use camelCase style for meaningful name segments.

## Formal Mode Type-Safety Rule (Hard Rule)

- In formal (non-MVP) modules, avoid `any` by default.
- `any` is allowed without restriction only in `mvp_*` modules.
- In formal modules, avoid passing full `this` across files.
- Prefer minimal capability interfaces (for example `interface_xxx_port`) for cross-file calls.

## External Exposure Rule (Hard Rule)

- For regular modules, external access should be exposed through `<ModuleName>Manager` singleton by default.
- Keep export surface minimal except global/common items:
  - enum/type/interface/const/utils/common helpers.
- Avoid large sets of thin exported forwarding functions.

## Manager Size And Sub-Manager Rule (Hard Rule)

- In MVP mode, manager size is unrestricted.
- In formal mode:
  - a main manager may keep complete business logic when size is small (soft threshold about 300 lines),
  - when size grows or responsibilities mix, split into sub-managers.
- Call style should remain explicit:
  - `mainManager.subManager.method()`
- Main manager should hold sub-manager singleton references as `readonly`.

## Controller Directory Rule (Hard Rule)

- In formal mode, do not create/use `controller` directory by default.
- Input orchestration should stay in view/view-submodules for easier reading.
- Flow forwarding should prefer:
  - `eventManager.emit(...)` for one-way notifications,
  - direct manager (or sub-manager) calls when return values/synchronous decisions are required.
- Do not add controller files that only forward calls without independent value.
- MVP mode may relax this temporarily, but promotion must align to formal rules.

## Service File Rule (Hard Rule)

- Do not create standalone `*Service.ts` files or `service/*` directories by default.
- Prefer manager sub-modules.
- Naming like `serviceManager` is allowed only as a sub-domain under manager (for example `xxxManager.serviceManager`).

## Manager Debug Exposure Safety

- If manager instance is attached to `window` for debugging, always guard runtime environment first:
  - use `if (typeof window !== 'undefined') { ... }`
  - then assign `window['<module>Manager'] = <module>Manager`

## View File Size Rule

- Files under `view/*` should stay within about 300 lines.
- This is a soft limit. Decide by readability and complexity, not by hard cutoff only.
- If a view contains complex internal components, prefer splitting into `item` or `panel`.
- Goal: lower reading and maintenance complexity.
- View implementation files must remain clean:
  - remove unused methods/fields/imports,
  - keep only façade-level responsibilities in view entry classes,
  - move interaction/render/math-heavy details into focused modules.
- For `Manager` files, keep single-responsibility and uniqueness:
  - for example, `AudioManager` manages audio only,
  - do not mix unrelated module logic into one manager.

## Type File Single-Responsibility Rule (Hard Rule)

- Do not create "all-in-one" type files that mix multiple domain concerns.
- Split types by domain responsibility.
- Cross-domain shared types should be minimal and stable.
- Transitional re-export files are allowed temporarily, but should be removed step-by-step.

## Anti-Fragmentation Rule (Hard Rule)

- Avoid over-splitting directly dependent code into many tiny files.
- For direct-dependency code blocks, if implementation size is below about 60 lines, keep it in the current owner file by default.
- The goal is to balance single-responsibility with human review readability.
- Splitting is recommended when:
  - code grows beyond about 60 lines and keeps expanding,
  - responsibility boundary becomes mixed,
  - stable cross-file reuse appears.
- Suggested thresholds:
  - below 60: default keep together,
  - 60-100: evaluate by complexity and coupling,
  - above 100: prefer split.
- Exceptions (split early is allowed):
  - security/critical lifecycle boundaries,
  - clear shared reusable utility surface,
  - testability/isolation needs,
  - explicit user request.

## MVP Mode Rule (Hard Rule)

- When user explicitly asks:
  - "`<feature>` module use MVP mode development"
  - "`<feature>` module promote from MVP mode to formal code"
  the agent must follow MVP lifecycle defaults below without requiring extra prompt templates.
- Optional third command is supported:
  - "`<feature>` MVP plan is discarded"

### MVP Development Default Behavior

- Create and implement under:
  - `{{mvp_root}}/*`
- Enforce three mandatory constraints:
  1. single entry integration (`Mvp<Feature>Entry.ts` as the only integration entry),
  2. explicit feature flag (can be disabled without changing main flow behavior),
  3. no core contract pollution (do not modify shared contracts in `core/*` or `flow/*` during MVP stage unless user explicitly requests).

### MVP Promotion Default Behavior

- Move retained MVP logic into formal modules following this skill (flow/core/domain boundaries).
- Remove MVP-only temporary coupling and align naming/path conventions.
- Clean up `mvp_<feature>` directory and integration leftovers after promotion.
- Clean up `{{mvp_root}}` directory and integration leftovers after promotion.

### MVP Discard Default Behavior

- Disable feature flag, remove integration entry, delete `{{mvp_root}}`.
- Ensure main flow remains behaviorally unchanged after removal.

## Contract Mode Rule (Hard Rule)

- Contract mode is an optional development mode and is disabled by default.
- Core goal:
  - reduce "requirement semantics vs runtime behavior" risk,
  - convert user intent into executable contracts before implementation.
- Trigger:
  - user explicitly requests contract mode, or
  - assistant identifies high ambiguity and asks whether to enable contract mode first.
- Exit:
  - user can exit contract mode at any time and switch to default mode.
  - before switching, assistant must summarize confirmed contract facts to avoid context loss.

### Contract Mode Workflow

1. Contract collection phase (no coding).
2. Contract confirmation phase (user confirms contract items).
3. Implementation phase (strictly follow confirmed contract).
4. Regression phase (validate through executable regression items).

- Assistant must not enter implementation before contract confirmation completes.

### Contract Input Styles

- Fill-in template mode (beginner-friendly):
  - assistant provides a template,
  - each field must include short example guidance,
  - if user asks, assistant should provide a simple filled sample for reference.
- Q&A tree mode (assistant-led):
  - ask 1-3 core questions per round,
  - each round must include estimated remaining rounds,
  - if answer is ambiguous/incomplete for implementation needs, assistant must continue follow-up questions.

### Contract Compliance Rule

- If user responses do not satisfy contract format/quality:
  - assistant must request normalized answer based on the mode format, or
  - ask whether to exit contract mode.
- Assistant must not guess and implement with insufficient contract facts under contract mode.

### Executable Regression Item Rule

- Contract mode outputs must include executable regression items.
- Each regression item must include:
  - explicit user operation step,
  - explicit expected observable result.
- Avoid abstract-only statements like "should be fine".
- Recommend at least 3 items; interaction-heavy features should use 5+ items.

### Mode Selection Communication Rule

- When user requests new feature development without explicit mode choice, assistant must ask mode selection first.
- Assistant should provide concise mode summary including:
  - target user type,
  - key benefit,
  - required user input.
- Current modes:
  - default mode (speed-first),
  - MVP mode (experiment-first),
  - contract mode (semantic-stability-first).

### Mode Metadata Rule

- Any newly added development mode must include:
  - target user type,
  - applicable scenarios,
  - required user inputs,
  - cost/benefit tradeoff summary.

## Guided Assist Rule (Hard Rule)

- Add a guided assist feature group, enabled by default, and user can explicitly disable it.
- Guided assist currently includes:
  - task startup card,
  - mode switch guard,
  - delivery impact card.

### Task Startup Card

- Trigger when:
  - assistant receives a new feature/task request,
  - requirement scope changes significantly in current thread,
  - development mode switches.
- Assistant must align requirements before coding, and explicitly report missing items.
- Startup card and pre-implementation completion checks are unified as one step.

### Mode Switch Guard

- If user requests new feature without explicit mode, assistant must ask mode selection first.
- Assistant should provide concise summary:
  - mode purpose,
  - user effort,
  - key benefit.

### Delivery Impact Card

- After implementation, assistant should provide:
  - changed modules/files scope,
  - key behavioral risks,
  - recommended regression checks,
  - lightweight quality score.
- Contract mode may skip score details because contract checks are already strict.

## Migration Mode Rule (Hard Rule)

- Add migration mode for old-code alignment to this skill.
- User input should be minimal:
  - a target file path or directory path.
- Assistant should autonomously perform migration according to current code-style rules.
- Default migration strategy is conservative:
  - do not change runtime behavior intentionally,
  - prioritize structure/readability alignment first,
  - split migration in safe steps when needed.
- If assistant detects high runtime risk during migration, assistant must pause and ask for confirmation before applying risky changes.

## Utility Placement Rule

- Frequently reused cross-module tools should be global utilities, for example:
  - `TweenUtils.ts`,
  - `ArrayUtils.ts`,
  - `ColorUtils.ts`.
- Module-specific helpers must stay in that module’s `utils/*`.
- Module-level utils are allowed to depend on same-module manager/model when this reduces unnecessary fragmentation.
- Keep external API as single-entry where practical:
  - callers should invoke one public method,
  - internal helper chain stays encapsulated inside utils implementation.

## Constant Placement Rule

- Global constants shared across modules should be placed in:
  - `{{global_const_file}}`
- Module-scoped constants should be placed in that module folder using:
  - `<ModuleName>Const.ts`
  - for example: `{{module_root}}/card/CardConst.ts`

## Temporary Test Code Rule

- Temporary or experimental code for a module must be placed under:
  - `{{module_tmp_rule}}`
- Code inside `<module>/tmp/*` is considered disposable test scaffolding.
- It may be deleted at any time and must not become a dependency of stable module runtime.
- Do not let core module logic rely on files from `<module>/tmp/*`.

## Event System Rule

- Event definition remains in a single centralized file, do not split by module.
- Unified event definition path for this project:
  - `{{event_definition_file}}`
- Event naming uses underscore style (snake-like segments):
  - module events: `card_xxx`, `parcel_xxx`, `audio_xxx`
  - common/app events: `app_xxx` or `global_xxx`
- Exception: in dedicated global event definition modules (for example `EventEnum`), long descriptive event names are acceptable when readability is improved.
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
5. Recheck that no unnecessary tiny split files were created for sub-60-line directly dependent code.

## Clarification Rule (must ask user)

If any of these are unclear, stop and ask user before proceeding:

- exact location/path for global managers in the current project,
- expected interface signatures beyond the minimum ui/event/model manager set,
- whether 300-line view limit is strict or soft,
- exceptions to naming prefixes in `<ModuleName>Enum.ts`,
- whether any manager needs temporary cross-module orchestration.

## Skill Versioning Rule (Mandatory)

- This skill must always maintain an explicit version number.
- Version format must use the current date-time timestamp:
  - `yyyyMMdd-HHmmss`
- Every skill update must bump the version to a new current timestamp.
- If newly added rules include extra user-provided constraints or special instructions, classify the change as a major update.
- Keep versioning semantics synchronized in both `SKILL.md` and `SKILL.zh-CN.md`.

## Pending Plan Items (Not Added Yet)

- Regression checklist template library (discussion pending).
- Rule conflict priority matrix (discussion pending).

## Skill Change Governance (Mandatory)

- Any future modification to this `code-style-skill` must be discussed with the user first.
- Only after the user confirms the full change plan can the skill file be updated.
- This skill uses two synchronized documents:
  - `SKILL.md` (current English-oriented master)
  - `SKILL.zh-CN.md` (Chinese simplified version)
- Any maintenance must update both files in the same change, and keep semantics consistent.
- Rule writing format requirement:
  - Keep rule body generic and stable (no heavy dependence on current concrete filenames).
  - Put concrete project file references in examples/appendix only when needed.

## Pending Plan Items Governance (Mandatory)

- Maintain a "pending plan items (not yet added)" list inside this skill.
- When proposing a new rule, assistant must check overlap against pending items:
  - same problem,
  - close problem,
  - similar intent.
- If overlap exists, assistant must explicitly state overlap relation before writing the new rule.
- Pending items can be promoted to formal rules only after user confirmation.

## Example Semantics Marking Rule (Mandatory)

- To avoid ambiguity for both AI models and human readers, all example content must be explicitly marked.
- Use these fixed labels:
  - `[RULE - NORMATIVE]` for enforceable rule statements,
  - `[EXAMPLE - NON-NORMATIVE]` for generic examples,
  - `[PROJECT EXAMPLE - NON-NORMATIVE]` for project-specific examples.
- Any project-specific path, module name, or filename used as an example must carry the project example label.
- If any example conflicts with a normative rule, the normative rule always wins.
- Do not rely on color/highlight style to convey semantics; rely on explicit text labels and section titles only.
