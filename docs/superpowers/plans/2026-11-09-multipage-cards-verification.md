# Multipage cards — verification

Date: 2026-11-09. Implementation uses Luna subagents for backend, Miditor, editor UI, runtime, independent review and browser QA; root owns integration.

> This report records the initial multipage implementation. The history integration has since been redesigned using existing custom fields; see [Neutral Editor Boundary](2026-11-09-neutral-editor.md) and its verification report for current checks.

## Delivered

- App-owned versioned CardDocument with 1–50 equal design pages, independent desktop/phone layouts and selected start page.
- Page management: actual thumbnails, add/duplicate/rename, pointer/keyboard ordering, delete confirmation with inbound-link count and Undo.
- Node navigation with six CSS effects, duration controls and an explicit preview. Canvas clicks continue to select/edit.
- One aggregate autosave queue with revision protection, synchronous draft flush, per-page edit history, fresh form identities and history-aware interaction snapshots.
- Shared SSR-compatible player in preview/publication/templates/admin/demo. Legacy one-page records remain readable; copy paths preserve whole stored JSON. Legacy client writes cannot flatten an envelope.
- Scoped browser history, focus landmarks, reduced motion, bounded current/outgoing layers, saved form drafts and responsive centering.

## Tests and checks

Final FE run: 35 test files / 283 tests passed; lint: zero errors and one existing warning. Earlier checks: Miditor 135 focused tests, package builds and typecheck passed; revision B package contents matched installed dist checksums. Root found and fixed the bound-wrapper click filter before final installation.

Final BE run: 7 focused files / 110 tests passed (parser, saves, publications, responses, gallery, sweep and card library); backend build passed. A regression caused by validating trusted legacy copy inputs was removed; empty and legacy raw draft copies retain previous behavior.

Final FE production build passed after removing the temporary QA route. FE lint has zero errors and one pre-existing unused-variable warning in lib/cards/forms/fields.ts. Existing album callback dependencies were corrected to satisfy the React compiler without changing behavior.

## Browser evidence

- Local Hoa Mộc Xanh demo: added a page, immediately switched while a property was being typed, returned and verified the value; page panel stayed selected across page remounts.
- Added a Button binding, set page 2 as the start page and previewed. Initial browser failure was traced with hit testing to an auto-height stage measuring 960×0. Stage content measurement plus auto-height fallback fixed it; mouse click then changed pages and Back restored without a new history push.
- New blank pages start at minHeight 640 / phoneMinHeight 812. Existing auto-height pages remain automatic, with runtime measurement; explicitly shorter pages retain their authored height.
- Separate three-page fixture: mouse, Enter and Space activation; same URL; at most two layers during animation, one afterward; reduced motion skips animation; fields entered on pages 2/3 remain separate when returning. No form was submitted.
- Browser fixture widths 320, 375, 390, 768 and 1440 px had no horizontal overflow. At 1440 viewport / 1425 client width the 960 px card had balanced 232.5 px margins.
- Existing public Hoa Mộc Xanh URL loaded with its title, album, map, calendar and public form controls.
- Browser Back and Forward restore recorded positions; fresh link navigation starts at the top. Natural browser flow recorded page 2 at scrollY 900 and page 3 at 300, without injecting history state; Back restored 900 and Forward restored 300.

Screenshots and detailed worker/review evidence are in the git-ignored plan workspace `.superpowers/sdd/2026-11-09-multipage-cards/`.

## Data and environment boundaries

The configured database host is non-local. No test user, card, publication or response was written there. Backend persistence/publish/response checks use the repository test environment; browser QA uses a parser-validated fixture through a temporary local Next route, removed after QA. An actual authenticated save-and-publish against the configured database has not been exercised by this change.

Existing dirty work in FE/BE/Miditor was preserved, with baseline status/patches captured before execution. Changes are committed separately by feature; no stash, reset, push or external publication was performed.

## Deployment / rollback

Deploy compatible BE validation first, then FE and the unique Miditor packs. Once envelopes have been saved, retain a compatible whole-document reader/writer on rollback. There is no destructive schema migration. Existing one-page publications retain their stored format until the next user save.

## Implementation decisions

- Reused current feature checkouts and captured dirty baselines rather than resetting or stashing existing work; separate writable scopes allowed the user-approved parallel Luna workers. If a scope boundary was wrong, baselines allow selective recovery.
- Used native subagents after the agent-team submission schema rejected the supplied plan; no server-side run was started.
- Used captured baseline blobs for selective staging where earlier work and multipage changes shared a file. Commits separate independently working features and fixes, including their required dependency packs.
- Applied the spec’s saved-scroll rule to both browser Back and Forward; fresh link navigation starts at the top. If a different interaction is desired, only the player scroll policy changes.
- Preserved raw trusted JSON copies for duplicate/template creation; whole-document validation remains at save/publish/restore. This retains old blank-card copying behavior without flattening new envelopes.
- Retained the git-ignored evidence workspace for test reports and screenshots referenced above. The temporary runtime QA route was removed.
