# Song Hỷ Xanh source element notes

Source page: <https://chungdoi.com/vi/mau-thiep/song-hy-xanh/demo>

Shared workflow: [Quy trình clone thiệp](invitation-cloning-guide.md). This file keeps the source-specific evidence; the shared guide combines the lessons from this template and Minimalism Đỏ Đậm.

The absolute XPath values below were supplied by the user. They identify useful starting points in the current page DOM, but can change if the site inserts or rearranges wrappers. Re-check each element on the live source page before cloning it.

## First-page seal emblem

XPath:

```text
/html/body/div[3]/div[2]/div/div[2]/div/div[1]/div
```

This selects the inner emblem inside the round seal near the top center of the first-page card. The inspected element uses the image as a CSS mask so the mark can be recolored:

```html
<div
  style="background-color:#1F3A25;opacity:0.9;
    -webkit-mask-image:url('/images/themes/songlong-red/chinese_happiness.webp');
    -webkit-mask-size:contain;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center;
    mask-image:url('/images/themes/songlong-red/chinese_happiness.webp');
    mask-size:contain;mask-repeat:no-repeat;mask-position:center"
  class="jsx-353cb38c53e4a74a w-8 h-8">
</div>
```

The image is 177×176 px. The surrounding seal is 56×56 px, centered horizontally, with a pale green radial gradient (`#e8f0e4` to `#cad2c6`), a green-tinted shadow (`rgba(232,240,228,.5)`), an inset highlight, and a 2 s ease-in-out `seal-pulse` animation. The local demo currently uses the user's supplied 177×176 PNG as an embedded mask in `public/demo/song-hy/seal-xanh.svg`; the source WebP URL returned 403 when fetched directly.

## Two large Song Hỷ marks on the first-page card

XPath:

```text
/html/body/div[3]/div[2]/div/div[2]/div/div[2]/div[1]
```

This selects the card panel containing two low-opacity, rotated Song Hỷ images. The user supplied this element markup:

```html
<div style="background:#1F3A25;border:1px solid rgba(232, 240, 228, 0.15);clip-path:inset(0 round 8px)"
  class="jsx-353cb38c53e4a74a absolute inset-0 rounded-lg overflow-hidden">
  <img src="/images/themes/song-hy-red/chu-hy.webp" alt="" aria-hidden="true"
    class="jsx-353cb38c53e4a74a absolute pointer-events-none w-[220px] md:w-[300px] -top-[65px] -left-[124px] md:-top-[104px] md:-left-[130px] opacity-[0.15] rotate-[30deg] md:rotate-[30deg]">
  <img src="/images/themes/song-hy-red/chu-hy.webp" alt="" aria-hidden="true"
    class="jsx-353cb38c53e4a74a absolute pointer-events-none w-[220px] md:w-[300px] -bottom-[39px] -right-[156px] md:-bottom-[104px] md:-right-[143px] opacity-[0.15] -rotate-[-30deg] md:-rotate-[-30deg]">
</div>
```

Keep both images as separate editable decorations in the local card. Preserve the panel clipping and rounded corners so the marks do not extend beyond the card.

## Capture checklist for future elements

Use the capture record in the [shared guide](invitation-cloning-guide.md#mẫu-ghi-nhận-cho-một-section-mới). Add the source evidence here and map each element to its editable node, user-facing controls and catalog entry. Record whether the local demo and the published template snapshot both contain the change.

## Lessons and current reproducibility limits

- The center seal and the two large corner marks are different artwork assets, with different sizing and styling. A font glyph `囍` does not reproduce either asset reliably.
- The source center emblem is a 32×32 px mask painted `#1F3A25` at opacity 0.9 inside a 56×56 px seal. Preserve the difference between the original file's gold color and the green color applied by the mask.
- The local seal SVG combines the emblem and its circular background. Users can reuse the decoration, resize/move it and choose its idle effect, but this does not expose separate circle, gradient and emblem color controls. Do not describe the composite asset as fully editable.
- “Thở nhẹ” is now an editor idle-effect option; the static state is “Không”. The local pulse amplitude was chosen locally, not recorded from the source keyframes. Exact motion matching still requires measuring those keyframes.
- A file in `public/demo/` or a code-defined preset does not establish that it is available through the MongoDB decoration catalog. Verify the running catalog before claiming DB synchronization.
- The demo combines `public/demo/song-hy/cover-xanh.json` and `public/demo/song-hy-xanh/pages-xanh.json` in `app/demo/song-hy-xanh/page.tsx`; that route also replaces sample names and invitation text. Confirm the same final content reaches the gallery snapshot and cards created from it.

## Idle effects measured on 14/11/2026

- **"Mở thiệp" button**: link 140×48, background `#e8f0e4`, shadow `rgba(232,240,228,.35) 0 4px 14px`, `overflow: hidden`, fully rounded. Inside it a 32×48 absolute `div` runs `shine` 3s ease-in-out infinite (`left` -100% → 100% by 50%, then rests), gradient transparent → white 40% → transparent. Local: Decoration `open-button-shine` (140×48, `idleEffect: "Ánh sáng quét"`) over `button-xanh.svg`.
- **Seal (56×56)**: `seal-pulse` 2s ease-in-out infinite, scale 1 → 1.06 → 1, shadow `0 4px 20px` → `0 6px 35px` in `#e8f0e4` at 50%, radial gradient `#e8f0e4` → `#cad2c6` at 30% 30%. Local: `open-seal` with `idleEffect: "Thở nhẹ"` (scale 1.06). Not matched: the shadow does not breathe, it stays at the node's fixed shadow.
- On opening the source runs `seal-break` (scale 1 → 1.15 → 1.05 → 0, rotate 5° → -3° → 15°, brightness up to 2, opacity to 0). Local uses "Thu nhỏ rồi biến mất", an approximation not yet measured against this keyframe.

## Invitation hero measured on 14/11/2026

Source selector: `[data-showcase-root] > header`. No user-supplied XPath was provided for this section. Source desktop column is 900 px including its 1 px border; the header content is 898 px wide and 939.625 px tall. Coordinates below are relative to the header content.

| Element | Source DOM measurement |
| --- | --- |
| Dark green half-circle | Original `sunburst.svg` is a plain circle; 872×872, x=13, y=-436, clipped by header overflow. CSS filter: `hue-rotate(100deg) saturate(.6) brightness(.7)`. It is fully opaque. |
| Welcome | Top padding 52 px, Cormorant Garamond 14 px, tracking `.35em`, line-height 21 px. |
| Names | Centers x=220.25 and 677.75; role y=100.75, 14 px Avenir Next; name y=125.75, 23 px Big Caslon/Baskerville. |
| Center Hỷ | x=407.5, y=89, 83×83. Source `chu-hy.webp` has `hue-rotate(100deg) saturate(.7)`. |
| Portrait | x=263, y=257, 372×625.625. Image source ends in `eb107c431fdd4c8d8e292f587e30bf3532753b3b4562fd7f21fa1254a42363b1.webp`. `object-fit: cover`, centered, `rounded-t-full` with a circular crown. |
| Curved title | x=263, y=237, box 372×186. SVG viewBox `0 0 286 143`, path `M -6.84 143 A 149.84 149.84 0 0 1 292.84 143`; font 18, tracking `.22em`, centered on the path. |
| Two stars | `/images/themes/song-hy-green/star.webp`, 16×16 in SVG coordinates at (17.4807,42.0322) and (252.5193,42.0323), opacity .9. |

Local mapping: `sunburst` is an editable ellipse; `hero-couple` is a PhotoFrame with the arch shape; `hero-curved` is a CurvedText with “Dạng cung: Nửa tròn”, radius 104.78%, spacing .22em. `hero-welcome` uses the same text block with bend 0 and spacing .35em. Stars remain separate decorations. The Hỷ decoration has “Tô màu đơn sắc” enabled and a separate color control.

### White surround and paper edge checked on 14/11/2026

The source preview's outer wrapper is white. Its centered 900px card column is warm paper (`#fff7eb`) with a faint 1px outer border (`#1F3A2522`). The local document had a 960px root filled with the same warm paper behind a smaller 900px paper shape, so a cream band sat outside the border and made the edge look inset. The local fix sets the invitation page root to white and keeps the 900px paper shape cream with a 1px `#e1ded1` border, the solid-color equivalent for the source's translucent border over cream. The white page gutters now blend into the surrounding white canvas. Miditor stores six-digit hex colors only, so don't copy the source's eight-digit alpha hex directly.

The local ellipse fill `#0d2a0c` was sampled from the rendered source screenshot; the Hỷ tint `#d8efd5` approximates the source filter. These are not raw background colors read from the source CSS. Desktop rendered bounds can also differ slightly due to the player's existing responsive scaling. Source mobile responsive classes were recorded from markup; a live source mobile viewport measurement was not confirmed in this pass.

Catalog imports added: `ref-songhy-green-star` and `ref-songhy-source-emblem`, files on Cloudinary and records in MongoDB. System template `6af2ae0201f9a3d9d6d84e7e` was updated from version 8 to 9 with the normalized four-page demo document, then through version 17 for the white surround, border, measured typography, reception layout, Dress Code row, and guestbook fields. Backups for this local session are in `/tmp/cardmaking-hero-review/template-before.json`, `/tmp/cardmaking-hero-review/template-before-white-outer.json`, `/tmp/cardmaking-hero-review/template-before-supported-border.json`, `/tmp/cardmaking-hero-review/template-before-typography.json`, `/tmp/cardmaking-hero-review/template-before-typography-v2.json`, and `/tmp/cardmaking-hero-review/template-before-reception-layout.json`.

Controls are available in the block definitions and shared renderers. Rebuilding the entire hero from a blank page through the editor has not been exercised in this pass; do not describe that manual workflow as verified.

### Family information typography checked on 14/11/2026

Computed styles on the source DOM:

| Text | Font | Size | Weight | Letter spacing | Line height | Other |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| `Trưởng Nam`, `Út Nữ` | Avenir Next | 14px | 300 | normal | 21px | `0 1px 4px #1f3a25` shadow |
| `Ông Bà` | Baskerville | 15px | 300 | normal | 22.5px | — |
| Parent names | Baskerville | 15px | 600 | normal | 22.5px | — |
| Addresses | Baskerville | 13px | 300 | normal | 16.25px | — |
| Family announcement | Baskerville | 20px | 300 | 1px | 30px | — |

The local Text blocks previously exposed only the bold toggle, which rendered these as 400/700. The shared Text renderer now honors optional `fontWeight`, `letterSpacing`, `lineHeight`, and subtle `textShadow` properties, with matching controls in the neutral Text block definition. The selected template text uses those measured values. The local demo was checked against the source DOM: all shown computed text styles now match, including the address line height and role-label shadow. Font stacks and sizes already matched.

### Guestbook form measurements checked on 14/11/2026

Source DOM at desktop: form width 600px with transparent background and no outer frame; input width 550px × 50px; message textarea 550px × 122px. Fields use transparent fill, a 1px light-gray border, 8px radius, Roboto 300 at 16px/24px, and gray text. The submit button is green `#1f3a25`, white Roboto 500 at 16px/24px, approximately 166px × 48px. The source form's accent color is separate from its field text and border colors.

The local guestbook block now stores field text and border colors separately from its button/text accent, and the template snapshot removes the default outer frame. Recheck its rendered state after changes; page validation alone does not prove live sizing, focus appearance, or color matching.
