---
name: code-style-skill
description: Enforces this project's highest-priority coding conventions: MVC-style module structure, minimal ui/event/model managers when missing, module naming and folder standards, utility placement, and project git workflow constraints. Use for any code creation, refactor, module setup, or git-related operation in this repository.
version: 20260421-140736
---

# 代码习惯skill（项目级）

## Priority

- Treat this skill as highest priority for this repository.
- Apply these conventions before adding new business logic.
- After installing this skill, assistant must run a priority compliance self-check before normal execution.

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
  - `{{browser_mcp_server}}`
  - `{{trace_tool_root}}`
  - `{{trace_runtime_dir}}`
  - `{{trace_schema_ref}}`
  - `{{log_polling_channel}}`
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
  - `{{browser_mcp_server}} = browsermcp`
  - `{{trace_tool_root}} = assets/src/core/tmpTrace`
  - `{{trace_runtime_dir}} = assets/src/core/tmpTrace/tmp`
  - `{{trace_schema_ref}} = assets/src/core/tmpTrace/TmpTraceEnum.ts`
  - `{{log_polling_channel}} = IDE terminal output`

## Core Architecture Rule

- Enforce single-responsibility module boundaries first.
- Prefer MVC-style separation for feature modules, but do not force every module to have model/view.
- Infrastructure modules (for example: `{{infra_module_alias}}/*`) may only contain necessary infrastructure code.
- Avoid creating structural folders/classes without business value.

## Game Flow Module Rule (Hard Rule)

- Game rules, game progression, and win/lose resolution must be placed in an independent flow module.
- Module naming may use equivalent naming styles (for example: `{{flow_module_alias}}/*` or `gameFlow/*`), but one project must use one naming style consistently.
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
  - If no global UI manager and no reusable UI base component exist, create a minimal `UIManager.<ext>`.
  - Minimum interfaces:
    - `open(uiKey, data?)`
    - `close(uiKey?)`
    - `closeAll()`
    - `curui` (the last opened UI instance, for debugging and console access)
  - Additional methods are allowed later when UI flow becomes more complex.

- **Event manager**
  - If no global event manager exists, create a minimal `EventManager.<ext>`.
  - Minimum interfaces:
    - `on(event, handler, target?)`
    - `off(event, handler?, target?)`
    - `emit(event, payload?)`
    - `once(event, handler, target?)`
  - Custom events must be registrable and usable across modules.

- **Model manager**
  - If no global model manager exists, create a minimal `ModelManager.<ext>`.
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
- `{{module_root}}/feature/FeatureEnum.<ext>`

For another module, keep the same structure with module name replacement.

- Important:
  - This is a recommended structure, not a mandatory requirement that every module must include all layers.
  - Do not add empty model/view layers just to satisfy structure.

## Enum/Type/Interface Naming Rule

Inside `<ModuleName>Enum.<ext>`, follow:

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

- Do not create standalone `*Service.<ext>` files or `service/*` directories by default.
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
  1. single entry integration (`Mvp<Feature>Entry.<ext>` as the only integration entry),
  2. explicit feature flag (can be disabled without changing main flow behavior),
  3. no core contract pollution (do not modify shared contracts in `{{infra_module_alias}}/*` or `{{flow_module_alias}}/*` during MVP stage unless user explicitly requests).

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

### Contract Sub-Mode User Brief (Mandatory)

- When contract mode starts, assistant should provide a concise two-mode brief to users before collecting contracts:
  - **Template mode**
    - positioning/owner: user-led structured filling,
    - interaction rhythm: fewer rounds, larger information per round,
    - suitable users/scenes: clearer requirements, users preferring direct structured input.
  - **Q&A mode**
    - positioning/owner: assistant-led question tree,
    - interaction rhythm: 1-3 questions per round with remaining-round estimate,
    - suitable users/scenes: beginners, ambiguous/complex interaction features.
- Keep this brief concise; avoid excessive mode details in first prompt.

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

- Add a guided assist feature group, disabled by default, and user can explicitly enable it.
- Guided assist currently includes:
  - task startup card,
  - mode switch guard,
  - delivery impact card,
  - tmp trace guidance,
  - auto toolchain flow.

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

### Tmp Trace Guidance

- `tmp` trace is disabled by default.
- User can explicitly enable `tmp` trace.
- When user enables guided assist, `tmp` trace must be enabled as well.

## Guided Assist Auto Toolchain Rule (Mandatory)

- When and only when guided assist is enabled, assistant must run auto toolchain flow.
- Toolchain checklist is a solution reference, not a fixed implementation binding.
- Core target is result alignment:
  - user-observed runtime test results,
  - assistant-observed outputs collected from toolchain.
- Assistant must build runtime profile first:
  - project type (`web` / `u3d` / `other`),
  - primary language,
  - runtime environment.
- If runtime profile is uncertain, assistant must ask user for one confirmation before proceeding.

### Auto Toolchain Trigger Rule (Dual Trigger)

- Auto toolchain flow is triggered by either:
  - first time guided assist is enabled in current project,
  - user explicitly requests: `自动工具链流程检查`.
- If last check is still within a valid window and runtime environment has not changed, assistant may reuse the latest receipt and ask whether to force rerun.

### Recommended Skills Bundle Prompt Rule (Mandatory)

- Maintain a "guided-assist recommended skills bundle" (referred to as `skills bundle`).
- Trigger points (either condition):
  - right after first-time installation/loading of `code-style-skill`,
  - when user enables guided assist.
- After trigger, assistant must:
  - check whether each item in the `skills bundle` is installed,
  - report missing items (if any),
  - ask user whether to install missing skills.
- If user agrees, assistant should auto-install and run minimum usability checks under the Toolchain Priority Rule, then provide an installation receipt.
- If user declines, assistant should continue current task and must not block development flow.

### [PROJECT EXAMPLE - NON-NORMATIVE] Guided-Assist Recommended Skills Bundle

- `find-skills`
- `skill-creator`
- `tmux`
- `readme-i18n`
- `refactor`
- `requesting-code-review`
- `tavily-research`
- `agent-browser`

### Toolchain Alignment Receipt Rule

- After each auto toolchain run, assistant must output a toolchain alignment receipt with:
  - detected runtime profile,
  - selected environment checklist,
  - per-step status (`ready | pending | blocked`),
  - fallback path if triggered,
  - whether current task can continue.
- If any primary chain fails, assistant must automatically fallback to `tmp/*` structured trace chain and continue current task.

### Auto Toolchain Delivery Responsibility Rule

- Once auto toolchain trigger rule is activated, assistant must execute checklist steps around the "result alignment" target and must not default core toolchain problems to user-side manual handling.
- During checklist check or checklist implementation, assistant must enforce a fixed loop:
  - `check -> auto implement -> debug validate`.
- For each checklist step, assistant must complete a closed loop:
  - environment check,
  - tool selection,
  - auto install/integration,
  - required code implementation,
  - minimal debugging validation,
  - automatic fallback.
- Assistant may request user intervention only when externally blocked (for example permissions, accounts, system policy), and must provide blocker reason, minimum user action, and the next automatic step after intervention.

### Tool Implementation Isolation Directory Rule

- If checklist delivery needs new scripts/code, assistant should place implementation under isolated tooling directories by default to avoid polluting business modules.
- Recommended tooling directory:
  - `skillTools/*`
- If project already has an equivalent tooling directory, assistant should reuse it first.
- Each tool directory under `skillTools/*` must include a `.md` file with at least bilingual (English + Chinese) purpose description.
- If a tool script is not directly executable by double click, assistant must provide an entry launcher (for example `.bat`) for local startup.
- All new files generated by auto toolchain runs must stay inside the corresponding tool directory under `skillTools/*` by default.
- Do not write generated toolchain artifacts into business directories by default (for example `src/*`, `assets/src/*`, `resources/*`).
- Recommended runtime artifact path:
  - `skillTools/<tool>/runtime/*`

### Toolchain Delivery Disclosure Rule

- When checklist delivery introduces new tools or code, assistant must provide a delivery receipt including:
  - added tools/scripts list,
  - directory paths,
  - minimal start method,
  - minimal debug method,
  - minimal stop method,
  - mapping to checklist steps (for example `WEB-3`, `WEB-4`).
- The receipt should remain concise, executable, and reproducible.

### Auto Toolchain Generated Files Receipt Rule

- After each auto toolchain run, assistant must output a generated-files receipt including:
  - generated file list,
  - file directories,
  - whether all generated files are inside `skillTools/*`.
- If any generated file is outside `skillTools/*`, assistant must:
  - mark it non-compliant,
  - fix the path immediately,
  - output corrected paths in the same receipt.

### Auto Start After Successful Check Rule

- After `auto toolchain flow check` completes and the chain is confirmed runnable, assistant must directly start corresponding tools (for example execute `.bat` launchers in terminal).
- After auto start, assistant must report:
  - started tools list,
  - executed entry commands,
  - runtime status (`running | completed | failed`).

### Toolchain Step Semantic Metadata Rule

- Every step in any environment checklist (`web` / `u3d` / future) must include:
  - `StepId`
  - `Goal`
  - `Intent`
  - `RecommendedTools`
  - `ExpectedOutput`
  - `Acceptance`
  - `Fallback`
- If any field is missing, assistant must not mark that step as `ready`.
- Checklist remains a solution reference (not fixed implementation), but semantic fields must stay complete, executable, and verifiable.

### Template AI-Understanding-First Rule

- Any newly created or maintained template in this skill must follow the "AI-understanding-first" principle by default.
- Template scope includes but is not limited to:
  - requirement templates,
  - toolchain checklist templates,
  - receipt templates,
  - acceptance templates,
  - regression templates,
  - migration templates.
- Template design must prioritize:
  - explicit and machine-decidable fields,
  - traceable steps and states,
  - comparable expected vs observed,
  - locatable failure cause and fallback path.
- For dual-use templates (human reading + AI execution), prioritize AI parseability first, then optimize readability.
- If key fields are ambiguous, missing, or non-decidable, assistant must clarify or complete them before marking done.

### [EXAMPLE - NON-NORMATIVE] Unified Toolchain Step Template

```md
- StepId: <ENV-X>
- Goal: <problem solved by this step>
- Intent: <why this step exists / guiding idea>
- RecommendedTools:
  - <tool or capability A>
  - <tool or capability B>
- ExpectedOutput:
  - <artifact/output 1>
  - <artifact/output 2>
- Acceptance:
  - <minimum check 1>
  - <minimum check 2>
- Fallback:
  - <fallback path when failed>
```

### Sequential Readiness Gate Rule

- Each environment checklist must define an ordered sequence (`Step-1 ... Step-N`).
- Assistant must execute and validate in order; no skipping is allowed.
- Assistant must echo per step:
  - step id and name,
  - status (`ready | pending | blocked`),
  - minimal verifiable evidence summary,
  - fallback path if failed.
- Assistant may move to next step only when current step is `ready`.
- If any step is `pending` or `blocked`, overall checklist status must be `not ready`.
- Overall checklist can be marked `ready` only when all steps are `ready`.

### [EXAMPLE - NON-NORMATIVE] Web Toolchain Checklist (5-step)

- `StepId`: `WEB-1`
  - `Goal`: establish a browser runtime observability entry point
  - `Intent`: open AI-to-runtime data channel first
  - `RecommendedTools`: `{{browser_mcp_server}}`, browser extension connection capability
  - `ExpectedOutput`: page snapshot readable, console logs readable
  - `Acceptance`: `browser_snapshot` succeeds, `browser_get_console_logs` succeeds
  - `Fallback`: if connectivity fails, move to `WEB-2`
- `StepId`: `WEB-2`
  - `Goal`: keep tasks unblocked on primary chain failure
  - `Intent`: use `tmp/*` as stable fallback evidence chain
  - `RecommendedTools`: `TmpTraceManager.<ext>`, `TmpTraceEnum.<ext>`
  - `ExpectedOutput`: structured `tmp/*` trace is writable, current task continues
  - `Acceptance`: at least one structured trace record is written, fallback path shown in receipt
  - `Fallback`: if write fails, report blocker and request minimum user intervention
- `StepId`: `WEB-3`
  - `Goal`: persist browser logs into project-local consumable data files
  - `Intent`: unify user-observed and AI-observed evidence source
  - `RecommendedTools`: browser log read capability, local bridge process (`Node.js` preferred)
  - `ExpectedOutput`: continuous append writes into `{{trace_runtime_dir}}/*.jsonl`
  - `Acceptance`: stable continuous writes, fields match trace schema, searchable by `sessionId/unitId`
  - `Fallback`: keep `WEB-2` chain active and continue task
- `StepId`: `WEB-4`
  - `Goal`: auto-poll and incrementally print logs in IDE terminal
  - `Intent`: maintain alignment without occupying agent chat window
  - `RecommendedTools`: local poll script (`Node.js` preferred), IDE terminal background process
  - `ExpectedOutput`: auto polling running, incremental log output, start/stop controllable
  - `Acceptance`: polling process remains stable, printed output matches persisted logs, start/stop is reproducible
  - `Fallback`: switch to manual polling while keeping `WEB-3/WEB-2` chain available
- `StepId`: `WEB-5`
  - `Goal`: convert runtime evidence into acceptance-board conclusions
  - `Intent`: keep requirement checklist, tmpTrace mapping, and runtime evidence aligned in one place
  - `RecommendedTools`: acceptance board generator/updater, runtime analyzer, trace mapping validator
  - `ExpectedOutput`: `skillTools/web/acceptance_board/Game_acceptance_board.md` with AI acceptance writeback
  - `Acceptance`: each requirement item has `aiState/evidenceRef/note` and can be located by `unitId/stepId/traceFile`
  - `Fallback`: if analysis fails, use manual recovery input (trace mapping hints) and rerun analysis

### [EXAMPLE - NON-NORMATIVE] Web Toolchain Implementation Notes (Stability Guidance)

- Path guidance:
  - `WEB-3` output is recommended under `skillTools/web/runtime/*.jsonl`.
  - Avoid default writes into business directories (for example `src/*`).
- Dedupe guidance:
  - Recommend `dedupe=false` by default for visible append behavior on each run.
  - Enable dedupe explicitly only when needed.
- Startup guidance:
  - `WEB-4` should be launched via `.bat` in a new terminal window for persistent polling.
  - Avoid short-lived same-terminal runs that exit quickly.
- Stop guidance:
  - Provide a paired stop script (for example `stop_web4_poll.bat`) to clean polling processes.
- Minimum verification guidance:
  - After start: verify poller process exists.
  - After stop: verify poller process returns to zero.
- Receipt guidance:
  - Output generated files and directories after each run, and confirm artifacts remain under `skillTools/*`.

## [RULE - NORMATIVE] WEB-5: Acceptance Toolchain Step

- `StepId`: `WEB-5`
  - `Goal`: consolidate requirement checklist, tmpTrace mapping, and runtime evidence into one acceptance board with executable conclusions.
  - `Intent`: enforce a closed loop of `requirement alignment -> development mapping -> acceptance writeback` and prevent workflow drift.
  - `RecommendedTools`: acceptance board generator/updater, runtime analyzer, trace mapping validator.
  - `ExpectedOutput`: `skillTools/web/acceptance_board/Game_acceptance_board.md` (primary board) with AI acceptance writeback.
  - `Acceptance`: each requirement has unique `itemId + unitId`, mapping fields are complete (`unitId/stepId/traceFile`), and `aiState/evidenceRef/note` are writable.
  - `Fallback`: if auto analysis fails, enter a manual recovery input path (user provides trace mapping hints) and retry automatically.

## [RULE - NORMATIVE] Acceptance Four-Stage Closed-Loop (Highest Priority)

- Acceptance is a prerequisite dependency for downstream workflow. If any stage is incomplete, all following stages must be blocked.
- Fixed stage order:
  1. Requirement stage
  2. Development stage
  3. Demo stage
  4. Acceptance stage

### Requirement stage (blocking gate)

- At stage end, the following file must exist:
  - `skillTools/web/acceptance_board/Game_acceptance_board.md`
- If missing:
  - immediately pause downstream workflow,
  - report the failure reason,
  - mark status as `blocked`,
  - do not enter development/demo/acceptance stages until fixed.

### Development stage (blocking gate)

- At stage end, requirement items must be mapped to tmpTrace:
  - `itemId -> unitId -> stepId -> traceFile`
- If mapping is incomplete:
  - immediately pause downstream workflow,
  - report the failure reason,
  - trigger recovery: ask user for `tmpTrace_trace_file` path/name,
  - auto-complete mapping and run recheck after user input,
  - do not enter demo/acceptance stages until recheck passes.

### Demo stage (auto execution)

- After feature development completes, assistant should auto-start the web toolchain; if user explicitly starts demo stage, assistant should start immediately as well.
- All web runtime artifacts must be written under:
  - `skillTools/web/runtime/*`
- If any artifact is outside this directory:
  - mark as non-compliant and fix path first,
  - continue stage flow only after path correction.

### Acceptance stage (user explicit trigger)

- Assistant can start acceptance analysis only when user explicitly says "start acceptance stage".
- Analysis must cover:
  - all available data under `skillTools/web/runtime/*`,
  - and write back results to `Game_acceptance_board.md`.
- If analysis/writeback fails:
  - report failure reason,
  - support `reanalyze` and allow repeated retries until success or user stop.

## [RULE - NORMATIVE] `Game_acceptance_board.md` Generation Rules

- Primary board path:
  - `skillTools/web/acceptance_board/Game_acceptance_board.md`
- Do not derive requirements by reverse-scanning tmpTrace files; requirement source must be the requirement-stage confirmed checklist.
- Required sections:
  - `Meta`
  - `Requirement List`
  - `Trace Mapping`
  - `User Acceptance`
  - `AI Acceptance`
  - `Summary`

### Required `Meta` fields

- `feature`
- `generatedAt`
- `requirementSource`
- `runtimeDataRoot` (fixed to `skillTools/web/runtime/*`)
- `Notes`

### Minimum `Notes` content in `Meta`

- board purpose and single source-of-truth note (requirement-stage checklist),
- user check/view operation notes,
- preview/edit shortcut hints (optional but recommended),
- markdown plugin hint (optional but recommended).

### Requirement and mapping field requirements

- Each `Requirement List` item must include:
  - `itemId`
  - Chinese requirement text
  - `unitId`
- Each `Trace Mapping` item must include:
  - `itemId`
  - `unitId`
  - `stepId`
  - `traceFile`

### AI acceptance field requirements

- Each `AI Acceptance` item must include:
  - `aiState` (`✅ | ❌ | ⏳`)
  - `evidenceRef`
  - `note` (failure reason or missing-evidence note)

## [RULE - NORMATIVE] Acceptance Tool Responsibilities

- Acceptance tooling responsibilities are fixed:
  1. Requirement stage: generate and initialize `Game_acceptance_board.md`,
  2. Development stage: maintain and validate requirement-to-tmpTrace mappings,
  3. Acceptance stage: analyze `skillTools/web/runtime/*` and write back AI acceptance results.
- Primary output carrier for acceptance conclusions:
  - update `Game_acceptance_board.md` directly.
- Additional detailed reports are allowed:
  - place them under `skillTools/web/acceptance_board/*`,
  - but they must not replace the primary board.

## [RULE - NORMATIVE] WEB-5 Tool Delivery Description Requirements

- When WEB-5 introduces or updates tools, tool documentation must include at least:
  - purpose,
  - input sources (which files/directories are read),
  - output artifacts (which files/directories are written),
  - startup method,
  - minimum validation method,
  - retry/rerun method,
  - stop method (if persistent process exists).
- WEB-5 documentation completeness must stay at the same level as WEB-1~WEB-4.

### [EXAMPLE - NON-NORMATIVE] U3D Toolchain Checklist (4-step)

- `StepId`: `U3D-1`
  - `Goal`: establish Unity structured trace output
  - `Intent`: avoid relying only on unstructured console text
  - `RecommendedTools`: Unity trace manager, structured schema (AI-understanding-first)
  - `ExpectedOutput`: structured trace records can be produced
  - `Acceptance`: key flows produce `sessionId/unitId/stepId` records
  - `Fallback`: fallback to minimal text logs + manual mapping
- `StepId`: `U3D-2`
  - `Goal`: unify Editor/Player logs into AI-readable stream
  - `Intent`: normalize multi-source runtime logs to reduce diagnosis ambiguity
  - `RecommendedTools`: local bridge process (`Node.js` preferred), Unity log sources
  - `ExpectedOutput`: unified stream or unified persisted log file
  - `Acceptance`: both log sources are collected and source-tagged
  - `Fallback`: keep structured trace as primary chain
- `StepId`: `U3D-3`
  - `Goal`: IDE auto polling + incremental print
  - `Intent`: near-real-time sync from user actions to AI-visible evidence
  - `RecommendedTools`: local polling script, IDE terminal process
  - `ExpectedOutput`: incremental output with controllable lifecycle
  - `Acceptance`: stable polling, printed output consistent with source logs
  - `Fallback`: switch to manual polling commands
- `StepId`: `U3D-4`
  - `Goal`: preserve continuity when primary chain fails
  - `Intent`: maintain minimum usable alignment chain at all times
  - `RecommendedTools`: `tmp/*` structured trace chain, fallback receipt mechanism
  - `ExpectedOutput`: automatic fallback succeeds, current task continues
  - `Acceptance`: minimum acceptance can still be completed after fallback
  - `Fallback`: if fallback fails, report blocker and minimum user action

## Collaboration Tiering And Closed-Loop Rule (Hard Rule)

- This rule applies to all development modes (default / MVP / contract).
- Define user collaboration tiers:
  - no development experience,
  - some development experience,
  - strong development experience.
- Tier source:
  - assistant may suggest a tier based on requirement quality and terminology,
  - final tier is user-confirmed.
- First-time setup may ask user tier directly.
- User may switch tier at any time; new tier policy applies immediately.
- Default tier when user does not specify: **some development experience**.

### Closed-Loop Execution Policy

- Closed-loop means: after requirement alignment, assistant should continue implementation without frequent mid-build interruptions.
- Runtime correctness is non-negotiable baseline in all tiers.
- Assistant must not sacrifice runtime correctness to satisfy style rules.

### Tier Policies

- No development experience:
  - closed-loop disabled,
  - allow in-process clarification using plain language.
- Some development experience:
  - closed-loop enabled,
  - interruption whitelist disabled by default,
  - decision priority: runtime correctness -> feature completeness -> other details.
- Strong development experience:
  - strict pre-implementation alignment required,
  - closed-loop enabled,
  - interruption whitelist enabled,
  - decision priority: follow code-style conventions without breaking runtime correctness.

### Interruption Whitelist (when enabled)

- Allowed interrupt cases only:
  - irreversible/high-risk operations,
  - missing mandatory external inputs (credentials/permissions/keys),
  - requirement conflict that changes core behavior.
- Non-whitelist issues should be deferred to delivery notes as optional follow-ups.

### Non-Blocking Issue Deferral Rule

- During implementation, non-blocking issues should not interrupt coding flow.
- Assistant should continue execution and defer these items to post-delivery notes.
- Deferred items should be listed as:
  - optional follow-up improvements, or
  - pending confirmations when behavior is not blocked.

### Tier Switch Echo (Recommended)

- When tier changes, assistant should briefly echo:
  - closed-loop status,
  - whitelist status,
  - active decision priority.

### Relation With Contract Mode

- Contract mode handles pre-build requirement formalization.
- Tier + closed-loop rule governs implementation-stage interruption behavior.

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

### Migration Acceptance Rule

- After migration work, assistant must provide migration acceptance notes including:
  - structure change summary,
  - runtime-behavior invariance statement,
  - high-risk points (if any),
  - recommended regression checks.

## Utility Placement Rule

- Frequently reused cross-module tools should be global utilities, for example:
  - `TweenUtils.<ext>`,
  - `ArrayUtils.<ext>`,
  - `ColorUtils.<ext>`.
- Module-specific helpers must stay in that module’s `utils/*`.
- Module-level utils are allowed to depend on same-module manager/model when this reduces unnecessary fragmentation.
- Keep external API as single-entry where practical:
  - callers should invoke one public method,
  - internal helper chain stays encapsulated inside utils implementation.

## Constant Placement Rule

- Global constants shared across modules should be placed in:
  - `{{global_const_file}}`
- Module-scoped constants should be placed in that module folder using:
  - `<ModuleName>Const.<ext>`
  - for example: `{{module_root}}/card/CardConst.<ext>`

## Temporary Test Code Rule

- Temporary or experimental code for a module must be placed under:
  - `{{module_tmp_rule}}`
- Code inside `<module>/tmp/*` is considered disposable test scaffolding.
- It may be deleted at any time and must not become a dependency of stable module runtime.
- Do not let core module logic rely on files from `<module>/tmp/*`.
- If user explicitly requests deleting files/directories under `tmp/`, assistant may clean them immediately.
- For assistant-initiated cleanup, `{{trace_runtime_dir}}/*` does not follow the "delete anytime" rule and must follow Tmp Trace cleanup rules below.

## Tmp Trace Rule (Hard Rule)

- When tmp trace workflow is used, standard trace call files must be centralized under:
  - `{{trace_runtime_dir}}/*`
- Assistant must provide two options:
  - user specifies the `<tmp trace>` utility directory,
  - create `<tmp trace>` utilities (user may specify directory; if omitted, assistant defaults to `{{trace_runtime_dir}}/*`).
- If user does not specify a directory and a usable tmpTrace implementation already exists in project, assistant must reuse existing directory/implementation first to avoid duplicate creation.
- A "usable tmpTrace implementation" must satisfy at least:
  - `TmpTraceEnum.<ext>` exists (or equivalent naming),
  - `TmpTraceManager.<ext>` exists (or equivalent naming),
  - manager exposes minimum interfaces: archive, update, delete.
- If user-specified directory does not exist, assistant should create it automatically and echo final created path in delivery notes.
- Runtime trace output files should be centralized under:
  - `{{trace_runtime_dir}}/*.jsonl`
- Do not delete the trace file before user explicitly confirms feature acceptance.
- Trace creation can be skipped only for:
  - pure copy/text change,
  - pure static asset replacement,
  - no logic change.

### Utility Minimum Structure Rule

- tmp trace utilities must include at least these two core files (or equivalent naming files):
  - `TmpTraceEnum.<ext>`: defines trace data structures, and its field model must follow the "AI-understanding-first" principle.
  - `TmpTraceManager.<ext>`: defines trace interfaces (must cover at least archive, update, delete).
- `<ext>` must follow the project's primary language/file conventions (for example `ts`, `js`, `cs`, `lua`).
- Recommended trace call filename:
  - `tmpTrace_<FlowName>__<EntryFile>.<ext>`
- Recommended `unitId`:
  - `<FlowName>_<EntryFile>_Uxx`
- Recommended `stepId`:
  - `<FlowName>_<EntryFile>_Uxx_<Step>`

### Trace Call File Responsibility Rule

- `tmpTrace_<...>.<ext>` should only:
  - package trace payload,
  - send payload via `TmpTraceManager`.
- Do not place business decision logic in this file (state checks, dedupe checks, flow branching).

### Runtime Write Rule

- Once `TmpTraceManager` is called, default behavior must be:
  - write trace records,
  - output trace logs to console.
- Write strategy:
  - state-change driven first,
  - high-frequency flows use `100ms` sampling fallback,
  - do not write indiscriminately every frame.
- Consecutive repeated logs for the same `unitId` should be deduped or throttled.
- Single trace file size limit is `5MB`; use rolling split when exceeded.

### Data Structure Rule (AI-readable)

- The "AI-understanding-first" principle is a baseline for all templates; in `<tmp trace>` data structures, it is a strengthened scenario prioritizing AI ability to reconstruct execution chains, locate root-cause paths, and align acceptance checklists.
- Data structures may reference existing project trace schema semantics (for example `{{trace_schema_ref}}`) and can be extended equivalently when needed.
- Minimum acceptance checks for "AI-understanding-first":
  - execution chain can be reconstructed (step order and upstream/downstream relation),
  - expected vs observed can be compared,
  - root-cause path can be traced (key decisions and reasons).
- Trace records must use structured fields with the minimum set:
  - `sessionId`
  - `feature`
  - `unitId`
  - `seq` (global increasing sequence)
  - `phase` (`enter | state | exit | error`)
  - `action`
  - `effect`
  - `status` (`ok | fail`)
  - `ts`
  - `payload` (optional, bounded length)
- One log record must describe only one core event.

### Minimal Unit Split Rule

- Default trace unit split must align with completion checklist items (`unitId`).
- Each `unitId` must include all three:
  - explicit input action,
  - explicit state change,
  - explicit observable result.
- If a unit fails or is ambiguous, add finer logs only inside that unit using binary split.
- Do not increase log density globally without focus.

### Cleanup Rule

- Manual cleanup by user:
  - if user explicitly specifies files/directories under `{{trace_runtime_dir}}/*`, clean immediately.
- Assistant-initiated cleanup is allowed only when all conditions are satisfied:
  - user explicitly confirms feature acceptance,
  - minimum regression set passes,
  - delivery archive is completed (key nodes + checklist mapping),
  - no blocker-level unresolved issue remains.
- For assistant-initiated cleanup, use silent retention by default: keep for `1 iteration`, then clean.

### Browser Runtime Guidance Rule (Web Profile Detail)

- Under guided assist auto toolchain flow, when runtime profile is `web`, assistant should execute `WEB-1` then `WEB-2` in order.
- For web runtime, assistant should directly perform `{{browser_mcp_server}}` setup and first connectivity self-check without a second confirmation step.
- If `{{browser_mcp_server}}` setup or connectivity self-check fails, assistant must execute `WEB-2` fallback to `tmp/*` file trace workflow and continue current task.
- `WEB-3` and `WEB-4` may remain `pending` until implemented, but overall web checklist cannot be marked `ready` before sequential gate is fully satisfied.

### Completion Checklist Mapping Rule

- Every new feature must output a completion checklist.
- Each checklist item must bind one unique `unitId`.
- Trace records must cover all `unitId`s.
- Acceptance conclusion must be based on dual evidence:
  - checklist item status,
  - trace evidence for corresponding `unitId`.

## Toolchain Priority Rule (Mandatory)

- Toolchain selection and implementation order is fixed:
  1. Prefer widely adopted/mature MCPs, skills, or tools on the web.
  2. If step 1 is unavailable, search GitHub for high-star MCPs/skills/tools.
  3. If step 1 and 2 are unavailable, reuse project-local tools.
  4. After selecting a solution, assistant must auto-connect and complete baseline debugging validation.
  5. If still missing, create new tooling implementation with language priority: `Node.js > Python`.

### External Tool Admission Gate

- An external option is considered usable only if it is:
  - installable,
  - runnable,
  - license-compatible for current project,
  - environment-compatible.
- If an option fails admission, assistant must explain rejection reasons before moving to next priority level.

### Auto-Execution And Fallback

- Once a usable toolchain is identified, assistant should auto-execute integration and minimal debugging instead of primarily asking users to do manual setup.
- In browser scenarios, after `{{browser_mcp_server}}` connectivity is healthy, assistant should auto-complete linkage checks and log-chain initialization.
- If auto-execution fails, assistant must automatically fallback to a backup chain and continue the task (for example fallback to local `tmp/*` trace chain).

### Runtime And Token Cost Constraints

- High-frequency logs must be sampled/throttled (for example `100ms`).
- Consecutive repeated logs for the same `unitId` should be deduped or down-sampled.
- Local collection/terminal printing alone should not be treated as model token consumption.
- Token consumption occurs when AI reads/analyzes log content.

### Delivery Closure And Receipt

- Toolchain delivery must include:
  - adopted solution and selected priority layer,
  - rejected options and reasons,
  - connectivity and baseline debugging results,
  - fallback path (if triggered),
  - reproducible start/stop instructions.

## Toolchain Generalization Rule (Mandatory)

- Toolchain rules in this skill must be cross-engine compatible, and must not bind to a single engine, single MCP server name, or fixed script implementation.
- Rule body should define execution chain and acceptance criteria only, not hardcoded project implementation details.
- Toolchain execution must follow an environment-adaptive flow:
  1. environment identification (runtime and stack),
  2. capability probing (MCP/skill/project tools/log channels),
  3. priority-based selection + automatic connection validation,
  4. automatic fallback on failure.
- Normative rule text must avoid hardcoded project tool names/paths; use placeholders instead.
- Project-specific names/paths/implementations must be documented only under `[PROJECT EXAMPLE - NON-NORMATIVE]`.

## Event System Rule

- Event definition remains in a single centralized file, do not split by module.
- Unified event definition path for this project:
  - `{{event_definition_file}}`
- Event naming uses underscore style (snake-like segments):
  - module events: `card_xxx`, `parcel_xxx`, `audio_xxx`
  - common/app events: `app_xxx` or `global_xxx`
- Exception: in dedicated global event definition modules, long descriptive event names are acceptable when readability is improved (see project-profile examples).
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
- exceptions to naming prefixes in `<ModuleName>Enum.<ext>`,
- whether any manager needs temporary cross-module orchestration.

## Skill Versioning Rule (Mandatory)

- This skill must always maintain an explicit version number.
- Version format must use the current date-time timestamp:
  - `yyyyMMdd-HHmmss`
- Every skill update must bump the version to a new current timestamp.
- If newly added rules include extra user-provided constraints or special instructions, classify the change as a major update.
- Keep versioning semantics synchronized in both `SKILL.md` and `SKILL.zh-CN.md`.

## Skill Change History File Rule (Mandatory)

- Maintain dedicated bilingual history files in the same directory:
  - `SKILL.history.md`
  - `SKILL.history.zh-CN.md`
- Every skill version update must append one concise history entry.
- Each history entry must include at least:
  - `version`,
  - `time`,
  - `type` (`add | update | delete | refactor`),
  - `scope`,
  - short `summary`.
- History entries in both language files must be synchronized in the same change and keep semantic consistency.
- Any skill change without history update is non-compliant delivery.

## Skill Remote Update Source Rule (Mandatory)

- `code-style-skill` must maintain a remote update source so assistant can reuse and update this skill in other projects.
- Assistant should check the remote skill version before applying project-local updates in a new project context.
- Minimum remote-check items:
  - remote accessibility,
  - required file completeness (`SKILL.md`, `SKILL.zh-CN.md`, `SKILL.history*`, `SKILL.pending*`),
  - local vs remote version comparison.
- If remote update is available, assistant must report:
  - planned file update list,
  - version change,
  - local customization overwrite risk.
- If remote source is unreachable or check fails, assistant must:
  - report failure reason,
  - continue with local version,
  - avoid blocking current feature development task.
- [PROJECT EXAMPLE - NON-NORMATIVE] Remote update source:
  - `https://github.com/l395624064/plantCard_Demo01/tree/main/.cursor/skills/code-style-skill`

## Skill Priority Compliance Self-Check Rule (Mandatory)

- On skill installation, assistant must first run a priority compliance self-check.
- Self-check target:
  - assistant behavior must follow `code-style-skill` as the first project rule source during execution.
- If assistant detects behavior conflict with this skill, assistant must:
  - stop further execution,
  - report conflict points and impact,
  - request user confirmation before proceeding.
- Platform/system/model internal priority settings may be non-editable; this rule requires compliance at assistant execution behavior level.

## Skill Change Governance (Mandatory)

- Any future modification to this `code-style-skill` must be discussed with the user first.
- Only after user inputs "确认加入" can the skill file be updated.
- This skill uses two synchronized documents:
  - `SKILL.md` (current English-oriented master)
  - `SKILL.zh-CN.md` (Chinese simplified version)
- Any maintenance must update both files in the same change, and keep semantics consistent.
- Rule writing format requirement:
  - Keep rule body generic and stable (no heavy dependence on current concrete filenames).
  - Put concrete project file references in examples/appendix only when needed.

## Final Consolidation Governance Rule (Mandatory)

- Before final-consolidation output, assistant must complete R3 scan:
  - overlap scan,
  - conflict scan,
  - near-duplicate semantic merge suggestions.
- Assistant must not output a final review draft before R3 results are reported.
- Final consolidation can be triggered by either:
  - user explicitly requests final consolidation, or
  - assistant asks whether to enter final consolidation and user agrees.
- After entering final consolidation stage, new items are frozen by default;
  - only when user explicitly asks to continue changes, assistant may return to draft stage.
- Final consolidation output must be two-step:
  - change list (add/modify/delete),
  - final review draft.
- Assistant can write to skill only when user inputs "确认加入";
  - other confirmations (for example "ok", "looks good", "approved") must not trigger write.
- After write, assistant must provide a write receipt including:
  - written items list,
  - conflict resolution summary,
  - version change,
  - not-written items moved to pending plan.
- Execution order is fixed:
  - `R3 scan -> R1 final consolidation -> R2 keyword confirmation -> write -> receipt`.

## Pending Plan Items Governance (Mandatory)

- Maintain dedicated bilingual pending-plan files instead of placing pending items inside this skill:
  - `SKILL.pending.md` (same directory),
  - `SKILL.pending.zh-CN.md` (same directory).
- Any pending item update must synchronize both files in the same change with consistent semantics.
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
