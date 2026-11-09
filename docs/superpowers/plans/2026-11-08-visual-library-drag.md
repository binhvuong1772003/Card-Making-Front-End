# Visual Library Drag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Requested implementer: **Luna (`gpt-6-luna`)**. Do not substitute another implementation model without telling the user.

**Status:** Implemented; the visual drag and shared placement checks pass.

**Goal:** Drag the actual photo or frame preview out of its library, enlarge it smoothly on entering the paper, and drop exactly the object and placement shown in the preview.

**Architecture:** Extend Miditor's existing pointer drag, placement, and drop pipeline. Give its ghost optional visual content and derive its on-paper rectangle from the same geometry used by the final drop. Wire the CardMaking frame thumbnails and Miditor's image library into that pipeline. Do not create a second drag manager or patch installed bundles.

**Tech Stack:** React, TypeScript, CSS transitions; existing Miditor placement/permissions/history; existing Vitest and Playwright.

**Spec:** The agreed behavior and acceptance criteria below are the task specification. The user requested this plan first; implementation has not started.

## Repositories and existing evidence

- CardMaking: `/Users/doubleb/Documents/code mới/CardMaking/CMFE`.
- Miditor source: `/Users/doubleb/Documents/code mới/MiDito` (currently clean).
- CMFE imports packed local `@miditor/*` dependencies, not live Miditor source. A source change must be built, packed, and installed to appear in CardMaking.
- `CMFE/components/editor/elements-panel.tsx`: frame thumbnail uses sky/cloud/hill SVG clipped by `cutStyle(frameGeometry(shape))`; card starts `drag.press(event, type, label)`.
- `MiDito/packages/editor/src/host-tool.tsx`: `HostToolDrag.press` accepts only event, kind, label. Extend compatibly with an optional fourth options argument.
- `MiDito/packages/editor/src/useBlockDrag.tsx`: existing 4px drag threshold, window listeners, Esc/cancel handling, click suppression, text/icon ghost.
- `MiDito/packages/editor/src/StartPanel.tsx`: adapts host drag; `ImagesTool` currently adds images by click only and uses `pictureSize`/`fitPicture`.
- `MiDito/packages/editor/src/ImagesPanel.tsx`: image button only calls `onAdd(image)`; preserve search/folder navigation.
- `MiDito/packages/editor/src/Editor.tsx`: `landingFor`, `dragFromLibrary`, `dropFromLibrary` select the accepting parent and map screen coordinates to local coordinates.
- `MiDito/packages/editor/src/drop-place.ts` and `store/structure.ts`: `localPoint`, `placeAt`, and `dropBlock` determine actual fitted dimensions and clamped placement.

## Agreed interaction

1. Grab a frame or image thumbnail. After the existing drag threshold, its actual artwork follows the pointer. The text label and surrounding thumbnail tile do not travel with it.
2. Before entering valid paper, the visual is the thumbnail's size. Keep its proportions, clipping/mask, image crop, and initial grab anchor.
3. Over an accepting paper/container, resize smoothly to the exact dimensions the inserted object will have, multiplied by the editor's current zoom. This is a change from thumbnail size to document size, not a fixed enlargement factor. Target transition: 180ms ease-out, disabled for reduced motion. Pointer movement itself follows immediately without easing or lag.
4. Moving back off paper restores thumbnail size. Preview stays above the panels/canvas and never intercepts hit testing.
5. Dropping over a valid target inserts exactly once, using the preview's rectangle and actual image URL or frame shape. The handoff must not jump or change dimensions. Existing bounds clamping, nesting/Alt behavior, permissions, phone restrictions and undo remain authoritative.
6. Esc, pointer cancellation, unmount, or dropping outside valid paper leaves no inserted block or ghost. A normal click and keyboard activation retain existing behavior.
7. Scope: add images as independent Image blocks. Dropping an image into an existing frame to replace its contents is a separate feature and is not included.

## Task 1 — Visual drag and shared placement in Miditor

Writable scope: `packages/editor/src/useBlockDrag.tsx`, `host-tool.tsx`, `StartPanel.tsx`, `Editor.tsx`, `BlocksPanel.module.css`, `drop-place.ts`, their targeted tests, and public exports/API snapshots only if required.

- [ ] Read repository instructions and existing drag/drop tests before editing.
- [ ] Add optional visual drag options to `HostToolDrag.press(event, kind, label, options?)`: preview React content, unscaled preview width/height, and optional `NewNodeOverrides`. Keep the existing three-argument call supported. Keep preview metadata separate from serializable block properties.
- [ ] Capture the visual thumbnail's rectangle and normalized grab point at pointer-down. Pass these through the existing drag session, rather than cloning the entire labeled card.
- [ ] Extend the existing move callback with optional placement feedback (target screen rectangle and document size), so the ghost can use the editor's landing decision. Pass overrides to preview resolution as well as drop resolution.
- [ ] Extract/reuse a pure placement calculation for preview and drop: resolve the same parent, registry defaults/overrides, container dimensions, zoom, clamping and normalized grab anchor. Preserve old center-on-pointer behavior when no custom anchor is supplied. Respect the current rotated-parent fallback rather than pretending unrotated coordinate conversion is valid there.
- [ ] Render supplied artwork in the existing ghost path, using a root portal if needed to avoid clipping or transformed ancestor coordinates. Use `pointer-events:none`, `aria-hidden`, no interactive descendants and no duplicate ghost. Retain label fallback for callers without visual previews.
- [ ] Apply the 180ms transition only to visual size/scale; keep pointer position immediate. Reuse existing drag threshold, cancellation, listener cleanup and click suppression. No saved document/history updates during hover.
- [ ] Add focused tests for preview/drop placement agreement at multiple zooms and paper edges, old API compatibility, cancellation cleanup and exactly-once insertion. Extend existing fixtures rather than introducing a new drag dependency.
- [ ] Run `pnpm typecheck` and the relevant Vitest tests for placement, host tool and structure/drop behavior. Verify an actual pointer drag in the playground, including crossing into/out of the canvas iframe.

## Task 2 — Make library images draggable through the same pipeline

Depends on Task 1. Writable scope: `packages/editor/src/ImagesPanel.tsx`, `StartPanel.tsx`, `images.ts`/`upload-image.ts` only if a small reusable preparation helper is needed, targeted tests and a targeted e2e case.

- [ ] Connect image pointer-down to the same visual drag session. Supply the photo preview without its surrounding tile, `src`/`alt` overrides, and its proportional insertion size from existing `fitPicture`.
- [ ] Reuse known image width/height and dimensions discovered by the loaded thumbnail. Account for a thumbnail URL whose aspect ratio differs from the original. If original dimensions require async loading, cache the result and guard against a stale/cancelled drag; never insert after a cancelled gesture resolves.
- [ ] Prevent native browser image dragging (`draggable={false}`) so only the custom preview appears. Keep click-to-add, keyboard behavior, folder buttons and search working. Suppress the click after an actual drag.
- [ ] Exercise portrait, landscape, missing-dimension and failed-image cases. Verify actual full-resolution image URL, aspect ratio and one undo entry after a successful drop.
- [ ] Run targeted tests and typecheck; build the editor package with its existing build command. Pack it to a new artifact filename, preserving existing installed packs.

## Task 3 — Integrate the frame artwork and packed editor into CardMaking

Depends on Tasks 1–2. Writable scope: `CMFE/components/editor/elements-panel.tsx`, `CMFE/package.json`, the existing CMFE lockfile, and one versioned editor pack under `CMFE/vendor/`.

- [ ] Install the newly built editor pack through the package manager and point its dependency at the project-local pack. Do not modify `node_modules` by hand or overwrite `/Users/doubleb/miditor-packs` globally. Leave core/render package versions alone unless a verified compatibility issue requires expanding scope.
- [ ] Reuse/extract the existing frame SVG/shape preview inside `elements-panel.tsx` for both the thumbnail and dragged artwork. The preview must retain its clipped shape and exclude the tile background, name, arrows and hover border.
- [ ] Pass the preview content, measured artwork size and frame defaults to the new drag options. Frames continue to insert their actual type/shape, with no demo SVG or sample URL saved as the user's image.
- [ ] Keep carousel, arrow position/appearance, smooth paging, two items per page, six-item preview limit and full-list view unchanged. Preserve existing form-preset click behavior and unrelated block fallbacks.
- [ ] Run `npm exec tsc -- --noEmit`, `git diff --check`, and the Impeccable detector on the changed panel. Do not add tests that merely duplicate constants or CSS declarations.
- [ ] Use the agent-browser skill to check the running CardMaking editor. Capture the frame at thumbnail size, over paper at actual zoomed size, and after drop; repeat with a real library image. Check 50%, 100%, 150% zoom, paper edges, leaving/re-entering paper, cancel, outside drop, normal click, rapid repeated drags, and a carousel page beyond the first.

## Review focus / completion evidence

- Preview and inserted rectangle agree, including edge clamping and zoom; normalized grab anchor does not produce a jump.
- No duplicate native image ghost, text badge, or label tile in visual frame/image drags.
- Cross-iframe pointer movement and hit testing work; root overlay does not block landing detection.
- Unknown image dimensions never cause a late insertion after cancellation or a mismatched image ratio.
- No duplicate add, lost permissions/phone restrictions, leaked listeners, sample image saved in a frame, or hover-only undo/history entries.
- Existing dirty CMFE work must be preserved: `elements-panel.tsx`, `photo-frame.ts`, `photo-frame.test.ts`. Do not revert it, commit it as part of another feature, or touch CMBE.
- Report touched files per repo, exact targeted checks and results, and actual before/over-paper/after-drop captures. Mark the work incomplete if only Miditor source changes but CMFE still runs the old packed editor.

## Handoff

Requested worker: Luna (`gpt-6-luna`). Plan only in this turn. At implementation time execute Tasks 1–3 in order across their respective repositories, with the above path boundaries; do not parallelize dependent changes.
