# code-style-skill History

## 20260417-141826

- version: `20260417-141826`
- time: `2026-04-17`
- type: `update`
- scope:
  - guided assist auto toolchain
  - toolchain step semantic metadata
  - template AI-understanding-first baseline
- summary:
  - Added mandatory loop `check -> auto implement -> debug validate`.
  - Switched tool implementation recommendation to `skillTools/*`.
  - Required bilingual tool docs and launcher entry for non-direct scripts.

## 20260417-143748

- version: `20260417-143748`
- time: `2026-04-17`
- type: `add`
- scope:
  - skill history governance
  - priority compliance self-check
- summary:
  - Added `SKILL.history.md` as mandatory change log file.
  - Added mandatory priority compliance self-check after skill installation.
  - Clarified compliance at assistant execution behavior level.

## 20260417-144219

- version: `20260417-144219`
- time: `2026-04-17`
- type: `update`
- scope:
  - bilingual history and pending governance
  - pending governance rule
- summary:
  - Added mandatory bilingual files for history and pending (`*.md` + `*.zh-CN.md`).
  - Required synchronized same-change updates for both language versions.

## 20260417-152706

- version: `20260417-152706`
- time: `2026-04-17`
- type: `update`
- scope:
  - auto toolchain artifact isolation
  - generated files receipt
  - auto start after successful check
- summary:
  - Enforced that auto-toolchain generated files stay under `skillTools/*` by default.
  - Added mandatory generated-files receipt with non-compliance auto-fix.
  - Added auto-start rule after successful auto toolchain flow check.

## 20260417-172742

- version: `20260417-172742`
- time: `2026-04-17`
- type: `update`
- scope:
  - web toolchain implementation notes
  - non-normative stability guidance
- summary:
  - Added Web Toolchain Implementation Notes (Stability Guidance) under web checklist examples.
  - Captured path, dedupe, startup, stop, verification, and receipt references for reuse.

## 20260420-165407

- version: `20260420-165407`
- time: `2026-04-20`
- type: `update`
- scope:
  - WEB-5 acceptance toolchain step
  - acceptance four-stage blocking loop
  - Game_acceptance_board generation rules
  - acceptance tool responsibilities
- summary:
  - Added `WEB-5` to include acceptance board generation, runtime analysis, and writeback in the web toolchain.
  - Upgraded acceptance four-stage flow to highest-priority blocking gates; any stage failure must pause downstream workflow and report causes.
  - Defined path, required fields, mapping fields, and AI acceptance fields for `Game_acceptance_board.md`.

## 20260420-180328

- version: `20260420-180328`
- time: `2026-04-20`
- type: `update`
- scope:
  - skill remote update source
  - cross-project skill sync precheck
- summary:
  - Added mandatory remote update source rule for `code-style-skill` reuse across projects.
  - Defined minimum remote-check items, update receipt requirements, and failure fallback behavior.
  - Added project example remote source URL for this skill.
