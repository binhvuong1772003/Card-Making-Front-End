# Liên Hoa V2 - Xanh — content draft

Source: https://chungdoi.com/vi/mau-thiep/lien-hoa-v2-xanh/demo?open=1

Local: http://localhost:3001/demo/lien-hoa-v2-xanh

Export: `lienHoaV2XanhContentDocument`, page `invitation`. 115 native nodes; Album 6 photos.

Structure and local-file validation passed. Desktop/mobile DOM and screenshots captured, geometry differences in `local-comparison.json`. This is a working content draft, not a completed clone or published template.

Remaining:

- Mobile typography: 63 source property overrides lack native per-device controls.
- Native Album controls and preview guestbook sample count differ from source. Countdown text not frozen into a fake static value; native countdown remains pending.
- Cover, popup and motion are outside this content handoff. Assets/font files are local, not verified in Cloudinary/Mongo catalog.
- CSS background derivatives preserve artwork separately; color-dodge, repeat positioning and mobile texture stretch still need visual refinement.
- Hero SVG/photo mask converted to native PhotoFrame where measured; custom mask not yet a reusable editor catalog preset.
- Source font 460px exceeds editable Text maximum 400px; clamped and needs native scale control
