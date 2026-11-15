# Minimalism Nâu Content Page Implementation Plan

> **For agentic workers:** Implement this plan in CardMaking using native CardMaking blocks and the existing asset pipeline. Do not build the opening cover or add template-specific behavior to Miditor. Steps use checkbox syntax for handoff tracking.

**Goal:** Acquire the artwork from Minimalism Nâu and create its opened invitation content page as a reusable, editable CardMaking template.

**Architecture:** Use the existing `CardDocument` and generic `Text`, `Shape`, `Image`, `Decoration`, `Album`, `Calendar`, `Map` and `Form` blocks. This clone has one content page and no popups. Save decorative files in Cloudinary, catalog metadata in MongoDB, and seed the template under the existing `minimalism-nau` slug.

**Tech Stack:** Next.js/React/TypeScript in CMFE; existing Miditor blocks; existing CMBE Cloudinary and MongoDB decoration catalog.

**Spec:** `docs/superpowers/specs/2026-11-14-minimalism-nau-content-page-design.md`.

## Global constraints

- Build the opened invitation content page only; no cover page or opening transition.
- Do not create popup pages or popup interactions; keep this task to the invitation page.
- Keep Miditor neutral and leave its package/API unchanged.
- Use the source assets; do not redraw artwork or wrap WebP files in SVG as a substitute for vectorization.
- Keep decorations independently replaceable; put the eight gallery photos into the source-matching Album block, not eight scattered photo frames.
- Do not copy payment QR payloads, autoplay music, trackers, chat widget or source brand footer.
- Do not overwrite user-created cards when updating the `minimalism-nau` gallery template.

## Review focus

- Missing or blocked source files: retry through the rendered source page, then record any unresolved asset rather than substituting a different illustration.
- Background artwork and panel texture overlap: confirm stacking, alpha, blend mode and clipping.
- Small gift images: store and seed seven distinct assets, not a single composite.
- Responsive layout: compare the same source/local viewport and keep measured source values separate from estimates.
- User-editability: verify the page is composed from existing controls rather than CSS tied to the slug.

---

### Task 1: Capture the content-page source and asset set

**Files:**
- Modify `docs/references/minimalism-nau-elements.md` if new measurements/assets are discovered.
- Source: user-provided body attachment and `https://chungdoi.com/vi/mau-thiep/minimalism-nau/demo`.

- [x] Open the invitation content state in the existing source tab; use `[data-testid="minimalism-brown-template"]` and the named `data-landing-screenshot-id` sections, not the separately pasted cover snippet.
- [ ] Record desktop and mobile section rectangles. Desktop headings, panels, photos and computed typography are captured; the current Chrome control surface did not allow a mobile viewport resize.
- [x] Inventory the 17 decorative WebP files and 8 photo-library images; distinguish the dynamic QR images from artwork.
- [x] Save the asset inventory and label measured desktop geometry separately from mobile/photo-placement estimates.

**Deliverable:** A source manifest that can identify every page asset and layout measurement without guessing.

### Task 2: Store reusable artwork in Cloudinary and MongoDB

**Files:**
- Modify `CMBE/scripts/seed-decoration-catalog.ts`.
- Add verified artwork under `CMBE/scripts/assets/decorations/`.
- Reuse the existing Cloudinary upload and `decorativeAsset` upsert flow.

- [x] Retrieve each file from the source page in-browser when a direct request is blocked. Preserve transparency and original image dimensions.
- [x] Add individual catalog records for foliage, house backdrop, flower cluster, paper texture/note, avatar frame, gate/cake/water icons, the main gift and all seven gift minis.
- [x] Upload the decorative files to Cloudinary and upsert MongoDB metadata with unique stable IDs and `PUBLISHED` status.
- [x] Keep the eight album/lead photos in the demo photo asset path; do not mix them into the decoration catalog.
- [x] Verify all 17 source decorations and eight photos exist locally; exclude both payment QR URLs as dynamic content.

**Deliverable:** All requested artwork can be found in CardMaking’s asset catalog, including the seven small gifts as separate items.

### Task 3: Assemble the invitation content page with native blocks

**Files:**
- Create `CMFE/lib/cards/demos/minimalism-nau.ts` following `lib/cards/demos/hoa-moc-xanh.ts` and the existing `CardDocument` shape.
- Create `CMFE/app/demo/minimalism-nau/page.tsx` and `CMFE/components/demos/minimalism-nau-demo.tsx` following the existing template demo route pattern.
- Modify the `minimalism-nau` entry in `CMBE/scripts/seed-reference-templates.ts` to use the source-specific content document rather than the generic approximation.

- [x] Create one `invitation` page with no opening cover, “Mở thiệp” control or popup pages.
- [x] Build the hero from a replaceable PhotoFrame, separate avatar-frame/flower/leaf Decorations and editable text blocks.
- [x] Create the wedding details, photo collage, reception/calendar/RSVP, venue/map, dress code, schedule, guestbook, gift section and footer using existing blocks.
- [x] Use one editable Album block for the 8 source gallery photos; keep the hero PhotoFrame and 7 mini gifts separate.
- [x] Give non-text layers readable editor names without grouping away their phone positions.
- [x] Use the existing floral float control and keep music disabled.
- [x] Exclude QR/payment information and popup behavior; gift artwork stays as editable decoration on the page.

**Deliverable:** One editable invitation content page; text, photos, artwork and section elements use CardMaking blocks.

### Task 4: Connect the gallery and verify the editor flow

**Files:**
- Modify `CMFE` gallery/demo registration using the existing `minimalism-nau` slug.
- Run the existing reference-template seed command for `minimalism-nau` after verifying it targets only the template record.

- [x] Add `/demo/minimalism-nau`; preview and “Dùng mẫu này” use the same document and create a normal editable card.
- [x] Run `npm run templates:seed-reference -- --slug=minimalism-nau`; it updates the reference template by its slug tag.
- [ ] In CardMaking, open the template, move and hide a flower, replace the hero photo, edit a text block, and confirm that each of the seven gift minis can be selected separately.
- [ ] Compare the preview with the source at the recorded desktop/mobile viewports; fix stacking, crops, fonts and measured geometry before handing off.
- [x] Record remaining estimated placements and unmeasured mobile geometry in the reference notes.

**Deliverable:** The gallery template, demo route and editor all point to the same content-only invitation document.

## Handoff

Desktop source inspection, decoration import, editable document generation, demo route and reference-template seed are complete. Visual editor verification and mobile layout refinement remain open.
