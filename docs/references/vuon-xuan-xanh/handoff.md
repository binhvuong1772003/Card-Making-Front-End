# Vườn Xuân - Xanh — content draft

Source: https://chungdoi.com/vi/mau-thiep/vuon-xuan-xanh/demo?open=1

Local: http://localhost:3001/demo/vuon-xuan-xanh

Export: `vuonXuanXanhContentDocument`, single page `invitation`; 102 native blocks, Album 12 source photos.

Page/schema/local-file validation passed. Desktop/mobile captured with actual 900px/375px columns; DOM differences in `local-comparison.json`. No complete-clone visual sign-off.

Remaining:

- 63 source mobile property overrides lack native per-device controls; typography needs refinement.
- Guestbook uses the native Form; preview sample count and visual rows differ from source. Countdown is not frozen into static fake numbers; native countdown remains pending.
- Background derivatives preserve artwork separately. Blend, exact repetition, rounded corner combinations, border-image, SVG decoration and custom photo crop still need visual refinement.
- Cover/popups/motion remain outside this content-only handoff. Cloudinary/Mongo asset catalog and published template snapshot are not uploaded or verified.

Source-capture caution: 7 nodes have zero opacity in the captured state (b38-077, b38-078, b38-079, b38-080, b38-081, b38-082, b38-083). Inspect entrance/scroll animation end-state before visual sign-off.
