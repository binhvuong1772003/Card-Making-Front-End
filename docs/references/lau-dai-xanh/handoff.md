# Lâu Đài - Xanh — content draft

Source: https://chungdoi.com/vi/mau-thiep/lau-dai-xanh/demo?open=1

Local: http://localhost:3001/demo/lau-dai-xanh

Export: `lauDaiXanhContentDocument`, single page `invitation`; 129 native blocks, Album 5 source photos.

Page/schema/local-file validation passed. Desktop/mobile captured with actual 900px/375px columns; DOM differences in `local-comparison.json`. No complete-clone visual sign-off.

Remaining:

- 73 source mobile property overrides lack native per-device controls; typography needs refinement.
- Guestbook uses the native Form; preview sample count and visual rows differ from source. Countdown is not frozen into static fake numbers; native countdown remains pending.
- Background derivatives preserve artwork separately. Blend, exact repetition, rounded corner combinations, border-image, SVG decoration and custom photo crop still need visual refinement.
- Cover/popups/motion remain outside this content-only handoff. Cloudinary/Mongo asset catalog and published template snapshot are not uploaded or verified.
- Source asymmetric grid has unequal cells; native AlbumGrid uses equal cells

Source-capture caution: 7 nodes have zero opacity in the captured state (b32-104, b32-105, b32-106, b32-107, b32-108, b32-109, b32-110). Inspect entrance/scroll animation end-state before visual sign-off.
