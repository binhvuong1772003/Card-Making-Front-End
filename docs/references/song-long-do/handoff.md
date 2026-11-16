# Song Long - Đỏ — content draft

Source: https://chungdoi.com/vi/mau-thiep/song-long-do/demo?open=1

Local: http://localhost:3001/demo/song-long-do

Export: `songLongDoContentDocument`, page `invitation`. 132 native nodes; Album 15 photos.

Structure and local-file validation passed. Desktop/mobile DOM and screenshots captured, geometry differences in `local-comparison.json`. This is a working content draft, not a completed clone or published template.

Remaining:

- Mobile typography: 72 source property overrides lack native per-device controls.
- Native Album controls and preview guestbook sample count differ from source. Countdown text not frozen into a fake static value; native countdown remains pending.
- Cover, popup and motion are outside this content handoff. Assets/font files are local, not verified in Cloudinary/Mongo catalog.
- CSS background derivatives preserve artwork separately; color-dodge, repeat positioning and mobile texture stretch still need visual refinement.
- Hero SVG/photo mask converted to native PhotoFrame where measured; custom mask not yet a reusable editor catalog preset.
