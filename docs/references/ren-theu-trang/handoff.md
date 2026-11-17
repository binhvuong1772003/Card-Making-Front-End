# Ren Thêu - Trắng — content draft

Source: https://chungdoi.com/vi/mau-thiep/ren-theu-trang/demo?open=1

Local: http://localhost:3001/demo/ren-theu-trang

Export: `renTheuTrangContentDocument`, single page `invitation`; 136 native blocks, Album 8 source photos.

Page/schema/local-file validation passed. Desktop/mobile captured with actual 900px/375px columns; DOM differences in `local-comparison.json`. No complete-clone visual sign-off.

Remaining:

- 95 source mobile property overrides lack native per-device controls; typography needs refinement.
- Guestbook uses the native Form; preview sample count and visual rows differ from source. Countdown is not frozen into static fake numbers; native countdown remains pending.
- Background derivatives preserve artwork separately. Blend, exact repetition, rounded corner combinations, border-image, SVG decoration and custom photo crop still need visual refinement.
- Cover/popups/motion remain outside this content-only handoff. Cloudinary/Mongo asset catalog and published template snapshot are not uploaded or verified.

Source-capture caution: 7 nodes have zero opacity in the captured state (b31-112, b31-113, b31-114, b31-115, b31-116, b31-117, b31-118). Inspect entrance/scroll animation end-state before visual sign-off.
