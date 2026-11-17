# Neutral Editor Boundary Implementation Plan

> For agentic workers: use executing-plans / subagent-driven-development. User requested redesign to keep independent Miditor small and neutral; Luna-first implementation remains the preference.

**Status:** Implemented and verified. See [verification](2026-11-09-neutral-editor-verification.md). Changes are not committed.

**Goal:** Remove empty history checkpoints from Miditor while preserving CardMaking navigation Undo/Redo.
**Architecture:** Use existing config.components / customFields extension. CardMaking injects an app-only navigation property into editor snapshots; native custom-field changes already create ordinary content history steps. CardMaking encodes/decodes at the editor boundary so persisted CardDocument v1 is unchanged. No external interaction timeline or new library API.
**Tech Stack:** Current TypeScript/React/Miditor/Vitest, no new dependencies.
**Spec:** Requirements and decisions below supersede the checkpoint mechanism in the prior multipage spec.

## Constraints and design

- Miditor retains only generic flush() and optional renderer nodeActions; it does not know cards, page lists, page IDs, transitions, persistence or external business history.
- Delete checkpoint() across editor API/controller/body/store/tests and notifier.remember() that existed solely to suppress checkpoint notifications. Keep existing save/flush behavior.
- CardMaking registers cmNavigation as an existing custom field on eligible built-in and custom component definitions via editor-only config. Normal host custom-field onChange performs the edit and native Undo/Redo; no blank snapshots or synthetic metadata revisions.
- Persisted CardPage.data stays clean PageData; CardPage.interactions remains the sole persisted navigation map. No BE change, migration or duplicate persisted source of truth.
- On opening editor, encode each eligible node with cmNavigation = its persisted action or explicit null. Explicit null is essential for Undo of the first binding. Newly added eligible blocks have null default.
- On every editor change, decode props to interactions, strip cmNavigation recursively before saving, retain unrelated props/styles/phone data. Ignore dangling targets and ineligible nodes. Copying nodes carries links naturally; duplicating pages remaps self-links through existing persisted-map logic.
- Preserve form IDs, old documents, native per-page history, flush/switch behavior, permissions, delete Undo, and live preview/publication.
- Do not modify generic exported CardMaking block definitions or generated BE registry; editor-only overrides extend existing definitions without modifying Miditor core.
- Use existing feature checkouts, preserve AGENTS.md edits and unused archives. No reset/stash, commit/push or database write.

## Files and tasks

### 1. App-only codec and session
- [ ] Create lib/cards/editor-navigation.ts and .test.ts. Exports NAVIGATION_PROP='cmNavigation', navigationComponents:Registry, toEditorPage(page:CardPage):PageData, fromEditorPage(data:PageData,pages:CardPage[]):Pick<CardPage,'data'|'interactions'>.
- [ ] Test native registry validation; explicit null on initial/unbound/new blocks; unchanged encoded/decoded document; no private field in saved data; nested groups; invalid/deleted targets; unrelated values and existing interactions survive.
- [ ] Modify components/editor/card-session.ts/.test.ts to decode native snapshots instead of binding WeakMap/checkpoint/setInteraction. Preserve canonical form/identity maps only where required. History aliases no longer synchronize external binding snapshots.
- [ ] Tests: first link edit→Undo→Redo, link deletion, node deletion→Undo, reused node IDs, duplicate/self-link/forms, switching/remount history, delayed callbacks and existing page-deletion rules. Run npm test -- lib/cards/editor-navigation.test.ts components/editor/card-session.test.ts.

### 2. Simplify Miditor
- [ ] Remove checkpoint and notifier.remember without changing unrelated code, including tests that only exercised these removed facilities. Keep flush/controller and existing generic render events.
- [ ] Run focused controller/document/notifier tests and pnpm typecheck; build editor and pack under a unique neutral-editor filename. Root installs and verifies archive checksums.

### 3. Integrate existing custom field in CardMaking
- [ ] Use navigationComponents in editor config and register the CardMaking navigation input with customFields. Input gets value/onChange/nodeId/readOnly from Miditor's existing CustomFieldProps and renders existing interaction controls/preview.
- [ ] Remove standalone InteractionControls/checkpoint call and extra right-panel history plumbing. Pass toEditorPage at keyed provider mount, retain raw native snapshots in initialHistory, decode on changes.
- [ ] Verify native toolbar, keyboard Undo/Redo and page switching keep action state. Keep all routing/targets/effects in CardMaking.

### 4. Verify and document
- [ ] FE tests, lint and build; library targeted tests/typecheck/build; grep runtime source and installed declarations to ensure no checkpoint/remember references remain.
- [ ] Browser local demo only: bind node, edit effect, Undo/Redo via toolbar and keyboard, delete/undo, switch pages and return, preview click and new block creation. No DB writes.
- [ ] Update prior design with a short superseded note and record actual results. Keep diffs smaller than the removed workaround; no new history engine.

## Review focus

1. Initial null value must be in native snapshots so Undo removes the first action.
2. Private props must never leak into persisted PageData, previews, public payloads or BE validation.
3. Page remount/history restore must keep native props, normalized form IDs and node lifetimes intact.
4. Application field registration must not mutate builtInRegistry or cardDefinitions or export application machinery into Miditor.
5. Cleared/dangling actions must not resurrect when callbacks arrive or nodes reuse IDs.
