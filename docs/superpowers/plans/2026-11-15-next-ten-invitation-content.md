# Kế hoạch dựng 10 mẫu thiệp tiếp theo

> Thực hiện tuần tự trong phiên theo yêu cầu người dùng: viết kế hoạch rồi triển khai. Không gọi subagent, commit, push hay xuất bản.

**Goal:** Tìm và dựng trang nội dung của 10 mẫu mới số 11–20 bằng số đo và artwork nguồn, có route local và hồ sơ đối chiếu.

**Architecture:** Mỗi slug có measured JSON, export CardDocument một page invitation, route demo, source/assets/mapping/handoff riêng. Dùng native blocks và viewer hiện có; không thay bản cũ, không sửa Miditor.

**Tech Stack:** Chrome Browser/Computer Use, Next.js/TypeScript, CardMaking/Miditor native blocks, Python/Node cho file và kiểm tra.

**Spec:** `../specs/2026-11-15-next-ten-invitation-content-design.md`

## Global constraints

- Chrome profile đã xác minh `binhvuong177@gmail.com`; không Chrome DevTools MCP, không Chrome mới/Playwright riêng.
- Browser dùng đọc/đo/download/kiểm UI; tạo/ghi/copy file bằng code.
- Desktop 1440×1000, mobile 390×844; kiểm viewport thực của đúng tab sau set, không lưu nhầm kích thước.
- Tái sử dụng tab nguồn và local. Đọc DOM trước, screenshot ở mốc kiểm có mục đích.
- Không seed generic, không tự xuất bản; không QR/ngân hàng/tracker/nhạc.
- Lưu thiếu sót native controls/renderer/editor/catalog đúng mức; các draft cũ không được coi là clone hoàn tất.

## Danh sách đã xác minh trên listing

| # | Mẫu | Slug / export | Nguồn nội dung |
|---|---|---|---|
| 11 | Long Phụng V3 - Đỏ | `long-phung-v3-do` / `longPhungV3DoContentDocument` | https://chungdoi.com/vi/mau-thiep/long-phung-v3-do/demo?open=1 |
| 12 | Minimalism - Xanh | `minimalism-xanh` / `minimalismXanhContentDocument` | https://chungdoi.com/vi/mau-thiep/minimalism-xanh/demo?open=1 |
| 13 | Long Phụng - Đỏ | `long-phung-do` / `longPhungDoContentDocument` | https://chungdoi.com/vi/mau-thiep/long-phung-do/demo?open=1 |
| 14 | Song Long - Đỏ | `song-long-do` / `songLongDoContentDocument` | https://chungdoi.com/vi/mau-thiep/song-long-do/demo?open=1 |
| 15 | Mai Lan - Trắng | `mai-lan-trang` / `maiLanTrangContentDocument` | https://chungdoi.com/vi/mau-thiep/mai-lan-trang/demo?open=1 |
| 16 | Liên Hoa V2 - Xanh | `lien-hoa-v2-xanh` / `lienHoaV2XanhContentDocument` | https://chungdoi.com/vi/mau-thiep/lien-hoa-v2-xanh/demo?open=1 |
| 17 | Long Phụng V2 - Đỏ | `long-phung-v2-do` / `longPhungV2DoContentDocument` | https://chungdoi.com/vi/mau-thiep/long-phung-v2-do/demo?open=1 |
| 18 | Vườn Kính - Hồng | `vuonkinh-hong` / `vuonkinhHongContentDocument` | https://chungdoi.com/vi/mau-thiep/vuonkinh-hong/demo?open=1 |
| 19 | Vườn Kính - Xanh | `vuonkinh-xanh` / `vuonkinhXanhContentDocument` | https://chungdoi.com/vi/mau-thiep/vuonkinh-xanh/demo?open=1 |
| 20 | Song Phụng - Đỏ | `song-phung-do` / `songPhungDoContentDocument` | https://chungdoi.com/vi/mau-thiep/song-phung-do/demo?open=1 |

## Review focus

1. Nhầm URL hoặc viewport của tab khác: assert identity/size trước ghi source.
2. Asset lazy chưa tải/ảnh trong SVG/CSS background: kiểm inventory với DOM và file hash; download đúng element nếu inventory thiếu.
3. Ảnh xoay/mirror/ancestor transform: dùng layout size và affine, không lấy bbox xoay làm size.
4. Native controls không có perDevice/crop/clip tương ứng: giữ spec nguồn, không đưa prop lạ vào snapshot; ghi gaps.
5. Catalogue tồn tại generic nhưng chưa có clone thật: chỉ route/export mới được tính đã dựng, không seed đè PUBLISHED.

## Trình tự mỗi mẫu

Đo và nhận diện → asset capture → mapping blocks → dựng → schema/asset validation → so local → handoff.
Chỉ import/đăng ký module đã tồn tại. Nếu thiếu source/UI, không giả dữ liệu: lưu blocker cụ thể và chuyển việc độc lập có thể làm.

### Task 1: Long Phụng V3 - Đỏ

**Files:** `docs/references/long-phung-v3-do/source-20261116.json`, `assets.json`, `node-mapping.json`, `local-comparison.json`, `handoff.md`; `lib/cards/demos/long-phung-v3-do.measured.json`, `long-phung-v3-do.ts`; `app/demo/long-phung-v3-do/page.tsx`; `public/demo/long-phung-v3-do/`.

**Consumes:** https://chungdoi.com/vi/mau-thiep/long-phung-v3-do/demo?open=1 và measured-document compiler hiện có. **Produces:** `longPhungV3DoContentDocument: CardDocument`, chỉ trang `invitation`; route `/demo/long-phung-v3-do`.

- [ ] Xác minh URL/trạng thái nội dung; đo desktop/mobile đúng viewport, đủ section và lớp.
- [ ] Lấy đúng file artwork/photo/font, loại QR/ngân hàng/tracker; map source URL → local SHA-256.
- [ ] Dựng native Text/Shape/Decoration/PhotoFrame + Album/Calendar/Map/Form/DressCode tương ứng source; không palette/layout generic.
- [ ] Chạy isPageData/validatePage/kiểm file local, không prop lạ hoặc trang đích thiếu.
- [ ] Mở route cùng viewport nguồn, lưu DOM/bảng so và ghi cụ thể gaps; screenshot cuối khi cần.
- [ ] Handoff với route/export/asset mapping/tests/status thật; không đánh dấu hoàn thiện nếu còn thiếu.

### Task 2: Minimalism - Xanh

**Files:** `docs/references/minimalism-xanh/source-20261116.json`, `assets.json`, `node-mapping.json`, `local-comparison.json`, `handoff.md`; `lib/cards/demos/minimalism-xanh.measured.json`, `minimalism-xanh.ts`; `app/demo/minimalism-xanh/page.tsx`; `public/demo/minimalism-xanh/`.

**Consumes:** https://chungdoi.com/vi/mau-thiep/minimalism-xanh/demo?open=1 và measured-document compiler hiện có. **Produces:** `minimalismXanhContentDocument: CardDocument`, chỉ trang `invitation`; route `/demo/minimalism-xanh`.

- [ ] Xác minh URL/trạng thái nội dung; đo desktop/mobile đúng viewport, đủ section và lớp.
- [ ] Lấy đúng file artwork/photo/font, loại QR/ngân hàng/tracker; map source URL → local SHA-256.
- [ ] Dựng native Text/Shape/Decoration/PhotoFrame + Album/Calendar/Map/Form/DressCode tương ứng source; không palette/layout generic.
- [ ] Chạy isPageData/validatePage/kiểm file local, không prop lạ hoặc trang đích thiếu.
- [ ] Mở route cùng viewport nguồn, lưu DOM/bảng so và ghi cụ thể gaps; screenshot cuối khi cần.
- [ ] Handoff với route/export/asset mapping/tests/status thật; không đánh dấu hoàn thiện nếu còn thiếu.

### Task 3: Long Phụng - Đỏ

**Files:** `docs/references/long-phung-do/source-20261116.json`, `assets.json`, `node-mapping.json`, `local-comparison.json`, `handoff.md`; `lib/cards/demos/long-phung-do.measured.json`, `long-phung-do.ts`; `app/demo/long-phung-do/page.tsx`; `public/demo/long-phung-do/`.

**Consumes:** https://chungdoi.com/vi/mau-thiep/long-phung-do/demo?open=1 và measured-document compiler hiện có. **Produces:** `longPhungDoContentDocument: CardDocument`, chỉ trang `invitation`; route `/demo/long-phung-do`.

- [ ] Xác minh URL/trạng thái nội dung; đo desktop/mobile đúng viewport, đủ section và lớp.
- [ ] Lấy đúng file artwork/photo/font, loại QR/ngân hàng/tracker; map source URL → local SHA-256.
- [ ] Dựng native Text/Shape/Decoration/PhotoFrame + Album/Calendar/Map/Form/DressCode tương ứng source; không palette/layout generic.
- [ ] Chạy isPageData/validatePage/kiểm file local, không prop lạ hoặc trang đích thiếu.
- [ ] Mở route cùng viewport nguồn, lưu DOM/bảng so và ghi cụ thể gaps; screenshot cuối khi cần.
- [ ] Handoff với route/export/asset mapping/tests/status thật; không đánh dấu hoàn thiện nếu còn thiếu.

### Task 4: Song Long - Đỏ

**Files:** `docs/references/song-long-do/source-20261116.json`, `assets.json`, `node-mapping.json`, `local-comparison.json`, `handoff.md`; `lib/cards/demos/song-long-do.measured.json`, `song-long-do.ts`; `app/demo/song-long-do/page.tsx`; `public/demo/song-long-do/`.

**Consumes:** https://chungdoi.com/vi/mau-thiep/song-long-do/demo?open=1 và measured-document compiler hiện có. **Produces:** `songLongDoContentDocument: CardDocument`, chỉ trang `invitation`; route `/demo/song-long-do`.

- [ ] Xác minh URL/trạng thái nội dung; đo desktop/mobile đúng viewport, đủ section và lớp.
- [ ] Lấy đúng file artwork/photo/font, loại QR/ngân hàng/tracker; map source URL → local SHA-256.
- [ ] Dựng native Text/Shape/Decoration/PhotoFrame + Album/Calendar/Map/Form/DressCode tương ứng source; không palette/layout generic.
- [ ] Chạy isPageData/validatePage/kiểm file local, không prop lạ hoặc trang đích thiếu.
- [ ] Mở route cùng viewport nguồn, lưu DOM/bảng so và ghi cụ thể gaps; screenshot cuối khi cần.
- [ ] Handoff với route/export/asset mapping/tests/status thật; không đánh dấu hoàn thiện nếu còn thiếu.

### Task 5: Mai Lan - Trắng

**Files:** `docs/references/mai-lan-trang/source-20261116.json`, `assets.json`, `node-mapping.json`, `local-comparison.json`, `handoff.md`; `lib/cards/demos/mai-lan-trang.measured.json`, `mai-lan-trang.ts`; `app/demo/mai-lan-trang/page.tsx`; `public/demo/mai-lan-trang/`.

**Consumes:** https://chungdoi.com/vi/mau-thiep/mai-lan-trang/demo?open=1 và measured-document compiler hiện có. **Produces:** `maiLanTrangContentDocument: CardDocument`, chỉ trang `invitation`; route `/demo/mai-lan-trang`.

- [ ] Xác minh URL/trạng thái nội dung; đo desktop/mobile đúng viewport, đủ section và lớp.
- [ ] Lấy đúng file artwork/photo/font, loại QR/ngân hàng/tracker; map source URL → local SHA-256.
- [ ] Dựng native Text/Shape/Decoration/PhotoFrame + Album/Calendar/Map/Form/DressCode tương ứng source; không palette/layout generic.
- [ ] Chạy isPageData/validatePage/kiểm file local, không prop lạ hoặc trang đích thiếu.
- [ ] Mở route cùng viewport nguồn, lưu DOM/bảng so và ghi cụ thể gaps; screenshot cuối khi cần.
- [ ] Handoff với route/export/asset mapping/tests/status thật; không đánh dấu hoàn thiện nếu còn thiếu.

### Task 6: Liên Hoa V2 - Xanh

**Files:** `docs/references/lien-hoa-v2-xanh/source-20261116.json`, `assets.json`, `node-mapping.json`, `local-comparison.json`, `handoff.md`; `lib/cards/demos/lien-hoa-v2-xanh.measured.json`, `lien-hoa-v2-xanh.ts`; `app/demo/lien-hoa-v2-xanh/page.tsx`; `public/demo/lien-hoa-v2-xanh/`.

**Consumes:** https://chungdoi.com/vi/mau-thiep/lien-hoa-v2-xanh/demo?open=1 và measured-document compiler hiện có. **Produces:** `lienHoaV2XanhContentDocument: CardDocument`, chỉ trang `invitation`; route `/demo/lien-hoa-v2-xanh`.

- [ ] Xác minh URL/trạng thái nội dung; đo desktop/mobile đúng viewport, đủ section và lớp.
- [ ] Lấy đúng file artwork/photo/font, loại QR/ngân hàng/tracker; map source URL → local SHA-256.
- [ ] Dựng native Text/Shape/Decoration/PhotoFrame + Album/Calendar/Map/Form/DressCode tương ứng source; không palette/layout generic.
- [ ] Chạy isPageData/validatePage/kiểm file local, không prop lạ hoặc trang đích thiếu.
- [ ] Mở route cùng viewport nguồn, lưu DOM/bảng so và ghi cụ thể gaps; screenshot cuối khi cần.
- [ ] Handoff với route/export/asset mapping/tests/status thật; không đánh dấu hoàn thiện nếu còn thiếu.

### Task 7: Long Phụng V2 - Đỏ

**Files:** `docs/references/long-phung-v2-do/source-20261116.json`, `assets.json`, `node-mapping.json`, `local-comparison.json`, `handoff.md`; `lib/cards/demos/long-phung-v2-do.measured.json`, `long-phung-v2-do.ts`; `app/demo/long-phung-v2-do/page.tsx`; `public/demo/long-phung-v2-do/`.

**Consumes:** https://chungdoi.com/vi/mau-thiep/long-phung-v2-do/demo?open=1 và measured-document compiler hiện có. **Produces:** `longPhungV2DoContentDocument: CardDocument`, chỉ trang `invitation`; route `/demo/long-phung-v2-do`.

- [ ] Xác minh URL/trạng thái nội dung; đo desktop/mobile đúng viewport, đủ section và lớp.
- [ ] Lấy đúng file artwork/photo/font, loại QR/ngân hàng/tracker; map source URL → local SHA-256.
- [ ] Dựng native Text/Shape/Decoration/PhotoFrame + Album/Calendar/Map/Form/DressCode tương ứng source; không palette/layout generic.
- [ ] Chạy isPageData/validatePage/kiểm file local, không prop lạ hoặc trang đích thiếu.
- [ ] Mở route cùng viewport nguồn, lưu DOM/bảng so và ghi cụ thể gaps; screenshot cuối khi cần.
- [ ] Handoff với route/export/asset mapping/tests/status thật; không đánh dấu hoàn thiện nếu còn thiếu.

### Task 8: Vườn Kính - Hồng

**Files:** `docs/references/vuonkinh-hong/source-20261116.json`, `assets.json`, `node-mapping.json`, `local-comparison.json`, `handoff.md`; `lib/cards/demos/vuonkinh-hong.measured.json`, `vuonkinh-hong.ts`; `app/demo/vuonkinh-hong/page.tsx`; `public/demo/vuonkinh-hong/`.

**Consumes:** https://chungdoi.com/vi/mau-thiep/vuonkinh-hong/demo?open=1 và measured-document compiler hiện có. **Produces:** `vuonkinhHongContentDocument: CardDocument`, chỉ trang `invitation`; route `/demo/vuonkinh-hong`.

- [ ] Xác minh URL/trạng thái nội dung; đo desktop/mobile đúng viewport, đủ section và lớp.
- [ ] Lấy đúng file artwork/photo/font, loại QR/ngân hàng/tracker; map source URL → local SHA-256.
- [ ] Dựng native Text/Shape/Decoration/PhotoFrame + Album/Calendar/Map/Form/DressCode tương ứng source; không palette/layout generic.
- [ ] Chạy isPageData/validatePage/kiểm file local, không prop lạ hoặc trang đích thiếu.
- [ ] Mở route cùng viewport nguồn, lưu DOM/bảng so và ghi cụ thể gaps; screenshot cuối khi cần.
- [ ] Handoff với route/export/asset mapping/tests/status thật; không đánh dấu hoàn thiện nếu còn thiếu.

### Task 9: Vườn Kính - Xanh

**Files:** `docs/references/vuonkinh-xanh/source-20261116.json`, `assets.json`, `node-mapping.json`, `local-comparison.json`, `handoff.md`; `lib/cards/demos/vuonkinh-xanh.measured.json`, `vuonkinh-xanh.ts`; `app/demo/vuonkinh-xanh/page.tsx`; `public/demo/vuonkinh-xanh/`.

**Consumes:** https://chungdoi.com/vi/mau-thiep/vuonkinh-xanh/demo?open=1 và measured-document compiler hiện có. **Produces:** `vuonkinhXanhContentDocument: CardDocument`, chỉ trang `invitation`; route `/demo/vuonkinh-xanh`.

- [ ] Xác minh URL/trạng thái nội dung; đo desktop/mobile đúng viewport, đủ section và lớp.
- [ ] Lấy đúng file artwork/photo/font, loại QR/ngân hàng/tracker; map source URL → local SHA-256.
- [ ] Dựng native Text/Shape/Decoration/PhotoFrame + Album/Calendar/Map/Form/DressCode tương ứng source; không palette/layout generic.
- [ ] Chạy isPageData/validatePage/kiểm file local, không prop lạ hoặc trang đích thiếu.
- [ ] Mở route cùng viewport nguồn, lưu DOM/bảng so và ghi cụ thể gaps; screenshot cuối khi cần.
- [ ] Handoff với route/export/asset mapping/tests/status thật; không đánh dấu hoàn thiện nếu còn thiếu.

### Task 10: Song Phụng - Đỏ

**Files:** `docs/references/song-phung-do/source-20261116.json`, `assets.json`, `node-mapping.json`, `local-comparison.json`, `handoff.md`; `lib/cards/demos/song-phung-do.measured.json`, `song-phung-do.ts`; `app/demo/song-phung-do/page.tsx`; `public/demo/song-phung-do/`.

**Consumes:** https://chungdoi.com/vi/mau-thiep/song-phung-do/demo?open=1 và measured-document compiler hiện có. **Produces:** `songPhungDoContentDocument: CardDocument`, chỉ trang `invitation`; route `/demo/song-phung-do`.

- [ ] Xác minh URL/trạng thái nội dung; đo desktop/mobile đúng viewport, đủ section và lớp.
- [ ] Lấy đúng file artwork/photo/font, loại QR/ngân hàng/tracker; map source URL → local SHA-256.
- [ ] Dựng native Text/Shape/Decoration/PhotoFrame + Album/Calendar/Map/Form/DressCode tương ứng source; không palette/layout generic.
- [ ] Chạy isPageData/validatePage/kiểm file local, không prop lạ hoặc trang đích thiếu.
- [ ] Mở route cùng viewport nguồn, lưu DOM/bảng so và ghi cụ thể gaps; screenshot cuối khi cần.
- [ ] Handoff với route/export/asset mapping/tests/status thật; không đánh dấu hoàn thiện nếu còn thiếu.

## Kiểm cuối và bàn giao

- [ ] `npx tsc --noEmit`: exit 0.
- [ ] Validation cả 10 export: page shape/native props/assets đúng. Một mẫu chưa có file thì không fallback.
- [ ] Kiểm lỗi test đúng phạm vi thay đổi; suite cũ hiện có 2 test lỗi, ghi tên/trạng thái thực nếu còn.
- [ ] Bảng 10 mẫu có nguồn/route/count/status và preview thật, không thumbnail nguồn thay local.
- [ ] Giữ template cũ và published snapshots; chưa có gate catalog/visual thì không tạo UNLISTED/publish.

## Ledger

- Listing/URL của 10 mẫu đã được đọc từ Chrome thật, chưa có route/doc riêng lúc lập kế hoạch.
- Ruling: thực hiện luôn như yêu cầu người dùng; không dừng duyệt kế hoạch. Native blocks + DOM là cách đã thống nhất ở đợt trước.
- Ruling: dùng template compiler được lưu riêng, không đọc file Song Hỷ V2 đang bị chỉnh đồng thời làm scaffold.
- Chưa task nào được đánh dấu xong tại thời điểm lập kế hoạch.

## Execution checkpoint — 2026-11-16

- All ten independently measured and assembled: 1,120 native blocks; ten new routes and content-only exports. Existing clone slugs excluded; see `../../references/clone-handoffs/next-ten-progress.md`.
- Source assets imported with SHA-256 mappings; URL-escaped filenames normalized after browser caught broken artwork.
- Local desktop 1440×1000/mobile 390×844 captures: all columns 900px/375px. All ten pass isPageData, validatePage and local-file checks. Typecheck exit 0.
- Review index: http://localhost:3001/demo/next-ten — browser confirmed 10 links, zero broken preview images.
- Working drafts, not completed clone sign-off: per-template handoffs record mobile typography/control limits, guestbook/countdown, texture/crop/mask and catalog gaps. Cover/popups/motion outside this handoff.
- Google asset downloads declined; excluded Google inventory and used native Map with venue address.
- No publication, seed, commit, push or Miditor changes in this batch.
