# Song Long - Xanh — content draft

Source: https://chungdoi.com/vi/mau-thiep/song-long-xanh/demo?open=1

Local: http://localhost:3001/demo/song-long-xanh

Export: `songLongXanhContentDocument`, single page `invitation`; 155 native blocks, Album 6 source photos.

Page/schema/local-file validation passed. Desktop/mobile captured with actual 900px/375px columns; DOM differences in `local-comparison.json`. No complete-clone visual sign-off.

Remaining:

- 90 source mobile property overrides lack native per-device controls; typography needs refinement.
- Guestbook uses the native Form; preview sample count and visual rows differ from source. Countdown is not frozen into static fake numbers; native countdown remains pending.
- Background derivatives preserve artwork separately. Blend, exact repetition, rounded corner combinations, border-image, SVG decoration and custom photo crop still need visual refinement.
- Cover/popups/motion remain outside this content-only handoff. Cloudinary/Mongo asset catalog and published template snapshot are not uploaded or verified.

Source-capture caution: 8 nodes have zero opacity in the captured state (b310-122, b310-126, b310-127, b310-128, b310-129, b310-130, b310-131, b310-132). Inspect entrance/scroll animation end-state before visual sign-off.
