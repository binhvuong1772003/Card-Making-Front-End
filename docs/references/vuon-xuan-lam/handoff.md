# Vườn Xuân - Lam — content draft

Source: https://chungdoi.com/vi/mau-thiep/vuon-xuan-lam/demo?open=1

Local: http://localhost:3001/demo/vuon-xuan-lam

Export: `vuonXuanLamContentDocument`, single page `invitation`; 123 native blocks, Album 5 source photos.

Page/schema/local-file validation passed. Desktop/mobile captured with actual 900px/375px columns; DOM differences in `local-comparison.json`. No complete-clone visual sign-off.

Remaining:

- 88 source mobile property overrides lack native per-device controls; typography needs refinement.
- Guestbook uses the native Form; preview rows differ from source data. Visible source countdowns use a native Countdown; targets inferred from captured duration and time are recorded in countdown-evidence.json.
- Background derivatives preserve artwork separately. Blend, exact repetition, rounded corner combinations, border-image, SVG decoration and custom photo crop still need visual refinement.
- Cover/popups/motion remain outside this content-only handoff; concurrent finishTemplate additions to routes/modules were preserved. Catalog and published snapshots are not verified by this pass.

Current routed export: `vuonXuanLamContentDocument`; pages: invitation. Concurrent enrichment preserved; local comparison records unmatched/replaced source IDs separately.

Countdown source evidence: 0 visible source timers. Native timers use Vietnam UTC+7 and inferred minute targets in `countdown-evidence.json`; exact target should be confirmed before publishing. Initial server HTML uses a deterministic placeholder until the browser mounts.

Shared fixes in this pass: CountdownView defers wall-clock reading to its effect; finish.addCountdown replaces an already measured same-event timer within 2px of its configured box. Other events/locations are preserved. Tests were seen failing first and then passed (11 focused tests). Full suite: 414 passed, 2 existing failures: editor-navigation.test.ts (adds a native custom field only to eligible built-in definitions), decoration-view.test.ts (sparkles four stars, 2s each, half a second apart).
