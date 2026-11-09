# Multipage Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. This document authorizes no execution by itself.

**Goal:** Cho phép tự thiết kế nhiều trang trong một thiệp, gắn thành phần chuyển trang và xem toàn bộ tại cùng URL.

**Architecture:** CardMaking lưu `CardDocument` gồm nhiều `CardPage`, mỗi trang chứa một `PageData` Miditor hiện có. Một session editor quản lý toàn thiệp và một hàng đợi lưu; runtime dùng chung cho preview/publication. Miditor chỉ bổ sung API chung để flush nội dung và kích hoạt node, không biết khái niệm thiệp/trang đích.

**Tech Stack:** Next.js 16, React 19, TypeScript, Miditor editor/render, BE TypeScript hiện có, Vitest, CSS transitions.

**Spec:** `docs/superpowers/specs/2026-11-09-multipage-cards-design.md`.


**Execution status:** Completed 2026-11-09 with Luna-first subagents; see [verification](2026-11-09-multipage-cards-verification.md). Changes are committed separately by feature in FE, BE and Miditor. No actual remote save/publication was performed.

## Global Constraints

- 1–50 trang; tên sau khi trim dài 1–80 ký tự; page ID khớp `^[A-Za-z0-9_-]{1,40}$`; tổng document tối đa 800 KiB.
- Hiệu ứng: `none`, `fade`, `slide-left`, `slide-right`, `slide-up`, `zoom`; mặc định `fade`, 450 ms; khoảng 100–1200 ms, `none` là 0 ms.
- Không thêm thư viện hoạt ảnh; không đổi `@miditor/core` thành bộ quản lý nhiều trang; không Prisma migration nếu cột document JSON hiện tại đủ.
- Một URL công khai; dữ liệu cũ được đọc thành một trang và chỉ ghi vỏ mới khi người dùng lưu.
- Giữ desktop/phone layout, sửa căn giữa public hiện có và mọi thay đổi đã được người dùng yêu cầu trước đó.
- Cả ba checkout đang có thay đổi khác: ghi baseline trước khi làm, không reset/stash hoặc gom chúng vào commit mới. Commit chọn đúng hunk tính năng sau từng task nếu có thể tách an toàn.
- Đọc AGENTS.md và hướng dẫn Next đi kèm phiên bản cài đặt trước khi sửa code. Dùng Impeccable/UI UX Pro Max khi thực hiện giao diện, agent-browser khi kiểm tra trình duyệt.

## Review Focus

1. Input đang gõ và callback debounce đến trễ khi đổi trang: không mất chữ hoặc ghi nhầm trang (task 3–4).
2. Node ID được tái sử dụng sau xóa/undo: không nhận binding từ node cũ (task 4).
3. Form được nhân bản và trang đổi thứ tự: phản hồi cũ không bị đổi khóa hoặc trộn sang form khác (task 1–2, 4).
4. Back/Forward trong Next.js và trang dài/ngắn: giữ route state, focus và vị trí cuộn hợp lý (task 6).
5. Client cũ, snapshot cũ và tài nguyên chỉ xuất hiện ở trang sau: không mất trang hoặc bị dọn ảnh đang dùng (task 2, 7).

## Repository / file map

- **FE**: `/Users/doubleb/Documents/code mới/CardMaking/CMFE`.
- **BE**: `/Users/doubleb/Documents/code mới/CardMaking/CMBE`.
- **Miditor**: `/Users/doubleb/Documents/code mới/MiDito`.
- Các đường dẫn task có tiền tố FE/BE/Miditor được tính từ root tương ứng.
- FE `lib/cards/document.ts`: contract, normalize đọc cũ, tiện ích trang thuần.
- FE `components/editor/card-session.ts`: trạng thái toàn thiệp, lịch sử từng trang và single saver.
- FE `components/editor/pages-panel.tsx`, `page-interaction-panel.tsx`: quản lý trang / chỉnh liên kết.
- FE `components/cards/card-player.tsx`, `card-player.module.css`: runtime, lịch sử và hoạt ảnh.
- BE `src/modules/cards/card-document.ts`: kiểm tra vỏ; `page-document.ts` tiếp tục kiểm tra một PageData.
- Miditor editor/controller: flush; render: tương tác node tổng quát.

## Task 1: Contract và chuyển dữ liệu cũ

**Files:** Create FE `lib/cards/document.ts`, `lib/cards/document.test.ts`; BE `src/modules/cards/card-document.ts`, `test/card-document.test.ts`. Reuse BE `src/modules/cards/page-document.ts`, `src/modules/responses/form-id.ts`.

**Interfaces:** Produces identical structural types `CardDocument`, `CardPage`, `PageNavigation`, `PageTransition` from spec. FE `normalizeCardDocument(input: unknown): CardDocument`; BE `parseCardDocument(input: unknown): CardDocument`. FE `getStartPage(document: CardDocument): CardPage`. No cross-repo import or new shared package.

- [ ] Write fixture tests: `legacy_page_keeps_root_and_form_keys` asserts wrapper ID `page-1`, unchanged node IDs/assets/layout and materialized legacy form keys; `empty_document_has_one_page`; `normalizing_twice_is_stable`.
- [ ] Write parser cases asserting rejection of 0/51 pages, duplicate IDs, missing start/target/source, version 2, blank/81-character name, duplicate form IDs, invalid transition/time and >800 KiB. Cycles pass; self-target passes.
- [ ] Run FE `npm test -- lib/cards/document.test.ts` and BE `npm test -- test/card-document.test.ts`; expect new tests to fail before implementation.
- [ ] Implement wrapper normalization and per-page delegation to existing PageData upgrades/validators. New envelopes reject duplicate global form IDs rather than silently renaming; legacy documents retain legacy response keys.
- [ ] Re-run both commands; expect all cases pass. Review contract parity and selectively commit `feat: define multipage card documents`.

## Task 2: BE persistence, publications, templates và responses

**Depends on:** 1.

**Files:** Modify BE `src/modules/cards/cards.service.ts`, `src/modules/publishing/publishing.service.ts`, `src/modules/gallery/gallery.service.ts`, `src/modules/gallery/template-images.ts`, `src/modules/responses/responses.service.ts`, `src/modules/responses/responses.config.ts`; inspect/reuse `src/modules/assets/assets.sweep.ts`. Tests BE `test/cards-save.test.ts`, `test/publishing.test.ts`, `test/responses.test.ts`, `test/gallery.test.ts`, `test/sweep.test.ts`.

**Interfaces:** Consumes `parseCardDocument`. Produces existing save/publish/template/response endpoints with unchanged response shapes, now preserving full CardDocument. Response `blockId` continues to carry globally unique form ID. Validation errors use existing error format with actionable reason.

- [ ] Add tests `save_keeps_all_pages_and_checks_revision`, `legacy_client_cannot_flatten_multipage_card`, `restore_keeps_start_page_and_links`, `forms_on_different_pages_receive_separate_responses`, `template_copy_keeps_every_page`, `sweep_keeps_asset_used_only_on_second_page`.
- [ ] Run BE `npm test -- test/cards-save.test.ts test/publishing.test.ts test/responses.test.ts test/gallery.test.ts test/sweep.test.ts`; expect new behavior assertions to fail.
- [ ] Change save/publish/restore validation to whole-document parser. Reject a legacy PageData write when the stored document already uses the new envelope; preserve optimistic revision behavior and publication version limits.
- [ ] Traverse all design pages in every relevant published snapshot for response form lookup. Preserve prior-version form references and existing keys; reject ambiguous duplicate keys. Verify generic template image replacement and asset traversal recurse through the envelope before changing them.
- [ ] Run targeted tests and `npm run build` in BE; expect pass. Selectively commit `feat: persist and publish multipage cards`.

## Task 3: Miditor flush và tương tác node tổng quát

**Depends on:** none; contract with task 4/6 below is fixed.

**Files:** Modify Miditor `packages/editor/src/control-api.ts`, `packages/editor/src/controller.ts`, `packages/editor/src/Editor.tsx`, editor barrel export if needed; `packages/render/src/Render.tsx`, render types/exports owning RenderProps. Tests `packages/editor/src/controller.test.ts`, `packages/render/src/Render.test.tsx`, `packages/render/src/action.test.tsx`. FE `package.json`, `package-lock.json`, `vendor/`.

**Interfaces:** Produces `EditorApi.flush(): PageData | null` and controller forwarding: null if unattached, otherwise latest draft committed and pending onChange delivered synchronously, independent of onSave/status. Also produces `EditorApi.checkpoint(): PageData | null`: flush first, then push a distinct immutable present snapshot as one history step without changing page content, returning the actual stored snapshot. This generic host checkpoint lets app-owned state follow history without adding fields to PageData. Produces `RenderProps.nodeActions?: Readonly<Record<string, { label: string; onActivate: () => void }>>` with no page-domain types.

- [ ] Add `flush_commits_pending_field_without_onSave`, `flush_delivers_debounced_change_once`, `unattached_flush_returns_null`, `checkpoint_has_distinct_identity_and_undo_redo_step`, `node_action_supports_enter_space`, `native_input_is_not_intercepted`, `closest_binding_activates_once`, `host_binding_overrides_same_button_href` tests.
- [ ] Run Miditor `pnpm test packages/editor/src/controller.test.ts packages/render/src/Render.test.tsx packages/render/src/action.test.tsx`; expect new tests fail.
- [ ] Implement flush using existing document/draft/notifier primitives; do not change existing `save()` semantics. Implement checkpoint through the existing history command layer; include its store command files and tests in this task. Implement accessible node activation at RenderNode, never nested buttons and never interception of interactive descendants. Only host-provided bindings enable this behavior.
- [ ] Run targeted tests, `pnpm typecheck`, `pnpm --filter @miditor/editor build`, `pnpm --filter @miditor/render build`; expect pass.
- [ ] Pack editor/render under new unique `*-multipage-*.tgz` names, update FE dependencies and overrides to these files, install. Verify installed editor/render dist checksums match built package contents; retry package-manager install if stale. Do not patch installed bundles by hand or replace unrelated core pack.
- [ ] Selectively commit library change and FE pack/dependency change with clear separate ownership.

## Task 4: Session editor, autosave và lịch sử trang

**Depends on:** 1, 3.

**Files:** Create FE `components/editor/card-session.ts`, `components/editor/card-session.test.ts`. Modify FE `components/editor/card-editor.tsx`, `components/editor/card-header.tsx`, `lib/cards/api.ts`; reuse `lib/cards/card-saver.ts`, `lib/cards/saver.ts`.

**Interfaces:** `createCardSession(document: CardDocument, saver: { changed(document: CardDocument): void; idle(): Promise<void> }): CardSession`. Session exposes `document`, `activePageId`, `receivePage(pageId: string, data: PageData): void`, `switchPage(pageId: string, flush: () => PageData | null): void`, `flushAndSave(flush: () => PageData | null): Promise<void>`, `addPage(): string`, `duplicatePage(pageId: string): string`, `renamePage(pageId: string, name: string): void`, `reorderPages(ids: string[]): void`, `setStartPage(pageId: string): void`, `deletePage(pageId: string): void`, `undoDelete(): void`, `setInteraction(nodeId: string, action: PageNavigation | null): void`. Expose a subscription/snapshot adapter matching the existing React pattern, with immutable snapshots.

- [ ] Add pure session tests: pending flush writes old page before switch; old-page delayed callback updates only that page; one aggregate saver receives both pages; save failure preserves local data and rejects publish; duplicate/self-link/form IDs; deletion/startpage/inbound bindings/undo; reorder does not change form IDs.
- [ ] Add `undo_restores_node_binding`, `reused_node_id_has_no_old_binding`, `switch_preserves_page_history` tests. Use per-page Miditor history plus matching interaction snapshots, not a new global editor history engine.
- [ ] Run FE `npm test -- components/editor/card-session.test.ts`; expect fail.
- [ ] Implement session with explicit page-bound callbacks and captured page IDs. Flush before switching, deleting, previewing and publishing. Remount EditorProvider keyed by page ID, restore its saved history; save callback flush-on-unmount must not revive a deleted page.
- [ ] Map each immutable history PageData object to its interaction snapshot using a per-page WeakMap. On an interaction edit call `checkpoint()` and associate the returned snapshot with the updated bindings; do not put extra fields into strict PageMeta. On normal content edits inherit current bindings, filtering deleted nodes; revisiting a known snapshot restores its exact bindings. Before remount capture history snapshots plus their bindings; after opening, pair those supplied snapshots with the actual restored history objects in order and re-register the associations. Never infer undo from stack length or node ID alone. Test equal-content checkpoints, history trimming and remount alias registration.
- [ ] Materialize fresh globally unique form IDs for added/duplicated forms by comparing against prior nodes; existing IDs remain stable. Duplicate page rekeys forms and remaps self-links. Block removal clears current bindings while historical snapshot retains them.
- [ ] Use one `createCardSaver<CardDocument>`; header awaits `flushAndSave`, prevents publish on pending/failed save and checks content across all pages. Prevent switching if active flush cannot complete.
- [ ] Re-run session tests plus existing saver tests; expect pass. Selectively commit `feat: manage multipage editor sessions`.

## Task 5: Panel Trang và tương tác trong editor

**Depends on:** 4.

**Files:** Create FE `components/editor/pages-panel.tsx`, `components/editor/page-interaction-panel.tsx` and adjacent style modules only if needed. Modify FE `components/editor/card-editor.tsx`, `components/editor/card-header.tsx`; use existing sidebar/config extension points. Test FE `components/editor/page-actions.test.ts` for eligibility/validation helpers.

**Interfaces:** PagesPanel consumes CardSession plus active selection state. PageInteractionPanel consumes page list, selected node and `setInteraction`; produces no runtime navigation. Pure `canNavigateFrom(node: TreeNode): boolean` refuses form/native-interactive containers and unsupported root nodes.

- [ ] Test eligibility for image/text/shape/button/group, nested form rejection, missing target and duration normalization via `npm test -- components/editor/page-actions.test.ts`; first expect fail, then implement minimal helpers and expect pass.
- [ ] Build compact page thumbnails/name/start badge, clear active state and add menu. Reuse existing drag reorder primitives with keyboard move controls. Rename inline; make start-page action explicit; prevent deleting last page and exceeding 50 pages.
- [ ] Add target picker, six effects, duration control and remove-link action under Tương tác. Provide explicit preview/test action. Never follow links on canvas click. Use existing visual tokens, visible focus, descriptive icon-button labels and no competing floating controls over page content.
- [ ] Add delete confirmation with actual inbound-link count; show Hoàn tác restoring full deletion snapshot. Warn about unreachable pages at publish without blocking intentional hidden pages.
- [ ] Browser-check page CRUD, keyboard ordering, selection, phone layout toggle and a long page at current sidebar width; no clipped labels or horizontal overflow. Selectively commit `feat: add page management and navigation controls`.

## Task 6: Runtime chung, chuyển động, lịch sử và form draft

**Depends on:** 1, 3.

**Files:** Create FE `components/cards/card-player.tsx`, `components/cards/card-player.module.css`, `lib/cards/page-navigation.ts`, `lib/cards/page-navigation.test.ts`, `components/blocks/form-drafts.tsx`. Modify FE `components/blocks/form-view.tsx` to consume optional draft provider; preserve standalone behavior.

**Interfaces:** `CardPlayer({ document: CardDocument, mode: "preview" | "published", historyKey: string }): ReactNode`; `historyKey` is stable slug/card identity and preview/publication separated. `FormDraftProvider` stores `Record<formId, Answers>` in memory for the mounted player. `useFormDraft(formId: string)` returns optional draft and setter; no automatic submit or new persistent storage.

- [ ] Write navigation tests for ignored rapid activation, self-target no-op, reduced-motion instant completion, transition cancel cleanup, popstate no re-push, state merge preserving Next fields, independent historyKey, forward-top/back-restored-scroll. Run FE `npm test -- lib/cards/page-navigation.test.ts`; expect fail.
- [ ] Implement navigation state machine and CSS for the six effects; only current/outgoing pages mounted. Initial render is deterministic start page. Outgoing inert/aria-hidden; incoming focus after completion; scroll restoration handled after layout. Temporary stage sizing handles long-to-short transitions without horizontal overflow.
- [ ] Resolve eligible page bindings into nodeActions with target page names as accessible labels. Preserve nested native controls and host binding precedence. Merge namespace into history.state; add scoped popstate listener and clean up; reload starts at startPageId.
- [ ] Add draft provider above page lifetimes and adapt FormView values hydration/change. Keep submitted-state localStorage key and response request behavior; provider absent keeps current standalone behavior.
- [ ] Run navigation tests; expect pass. Browser-check keyboard activation, reduced motion, rapid clicks, Back/Forward, long/short pages and partially completed forms. Selectively commit `feat: play multipage cards with accessible transitions`.

## Task 7: Nối mọi nơi đọc thiệp và giữ tương thích

**Depends on:** 2, 5, 6.

**Files:** Modify FE `app/thiep/[slug]/page.tsx`, `app/thiep/[slug]/published-card.module.css`, `lib/publications/public-page.ts`, `components/cards/card-preview.tsx`, `components/gallery/page-thumb.tsx`, `components/gallery/template-view.tsx`, `components/gallery/template-card.tsx`, `components/admin/admin-page.tsx`, `lib/templates/api.ts`, `components/demos/wedding-demo.tsx`, `lib/cards/publish-form.ts`. Create FE `lib/cards/document-consumers.test.ts`.

**Interfaces:** Public fetch/template API boundaries normalize once to CardDocument. Thumbnail and SEO use `getStartPage`; title falls back to card title/current existing metadata rules. Editor/template creation/restoration retain all pages. Preview and publication both render CardPlayer.

- [ ] Add fixtures covering legacy published snapshot, new document with page 2-only image/form, start page not first, template copy and demo save. Assert consumers never flatten all-pages payload to the thumbnail page. Run `npm test -- lib/cards/document-consumers.test.ts`; expect fail.
- [ ] Replace only whole-card PageData assumptions at boundaries; keep `.root` in components deliberately operating on the active PageData. Update validation copy to distinguish document errors from slug errors.
- [ ] Reuse public centering/phone scaling wrapper for player. Ensure inherited container sizing remains correct; validate desktop/phone after transitions. Existing Hoa Mộc Xanh demo stays functional and saves as one page unless user adds pages.
- [ ] Run consumer tests and FE `npm run build`; expect pass. Selectively commit `feat: integrate multipage preview templates and publications`.

## Task 8: Nghiệm thu, rollout và bàn giao

**Depends on:** 1–7.

**Files:** Create FE `docs/superpowers/plans/2026-11-09-multipage-cards-verification.md`; update spec status only after verification. No broad refactor.

- [ ] Capture checksums/package versions and review selective diffs in all three repos. Re-run relevant FE/BE suites and Miditor checks; run FE `npm run lint` and builds for FE/BE. Report baseline failures separately, never claim them fixed without evidence.
- [ ] Browser walkthrough on local BE/FE: create 3 pages → type then switch immediately → duplicate/reorder/rename → choose page 2 as start → link pages with all effects → save/reload → preview → publish → reload public link. Verify route remains unchanged and two-browser-tab stale revision is rejected.
- [ ] Check widths 320, 375, 390, 768, 1440 px; phone/desktop layouts; balanced white margins; no horizontal overflow; long-to-short and short-to-long switching. Check keyboard-only and reduced motion.
- [ ] Test distinct forms on two pages, partially completed values on return, duplicate form/page identity, response submission, delete referenced page + Undo, restoring a published version and creating a template. Confirm old one-page public link and Hoa Mộc Xanh demo still work.
- [ ] Record actual results, residual limitations and screenshots in verification doc. Any acceptance failure blocks completion; do not hide it behind a green build.
- [ ] Rollout BE dual-read first, then new FE/Miditor packs. Once envelopes are saved, rollback must retain dual-read BE and compatible public reader; do not deploy a legacy-only writer/reader over multipage documents. No destructive database migration.

## Self-review / handoff

Coverage: data/legacy (1–2), save/history (3–4), authoring (5), runtime/accessibility/forms (6), consumers (7), regression/rollout (8). Five review-focus cases are pinned to the owning task. PageNavigation signatures and effect limits match spec; publication versions remain separate from pages. No implementation or test run is claimed by this plan.

PageMeta has a strict title/description/image schema: the plan deliberately keeps interaction history outside it and adds a generic checkpoint API instead (tasks 3–4). The eight tasks form one end-to-end feature and should be delivered together; deploying authoring ahead of the compatible BE/public runtime is unsafe.
