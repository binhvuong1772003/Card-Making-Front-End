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
