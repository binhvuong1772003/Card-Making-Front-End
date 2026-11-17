# Kế hoạch viết lại: 5 mẫu nội dung thiệp còn lại → Claude hoàn thiện

> **Cho người thực hiện:** Làm tuần tự từng mẫu, dùng skill `clone-invitation` bản đã cập nhật từ diff Claude. Codex dựng trang nội dung bằng code nhưng phải dùng khối/công cụ người dùng thao tác được. Bàn giao từng mẫu đã kiểm, không đợi dựng cả năm rồi mới so. Không khởi chạy agent-team/subagent, commit hoặc xuất bản nếu chưa được yêu cầu.

**Goal:** Dựng đúng phần nội dung tĩnh của 5 mẫu còn lại, đưa artwork vào catalog và bàn giao Claude phần bìa/popup/chuyển động với số đo, asset và giới hạn rõ ràng.

**Architecture:** Mỗi mẫu xuất một `CardDocument` chỉ có trang `invitation`; route demo và snapshot nội dung dùng chung export. Tái sử dụng native blocks, viewer và pipeline tài nguyên hiện có. Bản bàn giao trong MongoDB dùng `UNLISTED`, tách khỏi snapshot xuất bản; giữ Miditor trung lập.

**Tech Stack:** CMFE Next.js/TypeScript, CardMaking blocks/CardPlayer; CMBE Prisma/MongoDB và Cloudinary.

**Spec / tài liệu dùng khi thực hiện:**
- `.claude/skills/clone-invitation/SKILL.md` (Codex dùng chung qua `~/.codex/skills/clone-invitation`).
- `.claude/skills/clone-invitation/references/repair-lessons.md` — lỗi thực tế và commit Claude sửa.
- `CMFE/AGENTS.md`, `CMFE/docs/references/invitation-cloning-guide.md`.
- Hồ sơ `*-elements.md` các mẫu trước chỉ là kinh nghiệm tham khảo. Không lấy màu, font, chiều rộng 900, y bù 104,5 hoặc cỡ popup của mẫu Nâu làm mặc định.

## 1. Danh sách thực hiện và trạng thái thật

Giữ thứ tự trong 10 mẫu đầu đã chốt ngày 15/11/2026 từ <https://chungdoi.com/vi/mau-thiep>; không lấy mẫu thứ 11 trở đi để bù. Link nội dung đã được xác nhận ở lần lập kế hoạch trước; lần viết lại này rà code/skill/schema, chưa đo DOM sống của năm mẫu.

| Thứ tự làm | # nguồn | Tên và demo nguồn | Nội dung nguồn | Tình trạng local khi rà kế hoạch |
| --- | --- | --- | --- | --- |
| 1 | 4 | [Song Hỷ V2 - Đỏ](https://chungdoi.com/vi/mau-thiep/song-hy-v2-do/demo) | https://chungdoi.com/vi/mau-thiep/song-hy-v2-do/demo?open=1 | Có seed generic; chưa có route/document nội dung riêng |
| 2 | 6 | [Tơ Duyên - Đỏ Đậm](https://chungdoi.com/vi/mau-thiep/to-duyen-do-dam/demo) | https://chungdoi.com/vi/mau-thiep/to-duyen-do-dam/demo?open=1 | Có seed generic; chưa có route/document nội dung riêng |
| 3 | 8 | [Minimalism - Nâu Đậm](https://chungdoi.com/vi/mau-thiep/minimalism-nau-dam/demo) | https://chungdoi.com/vi/mau-thiep/minimalism-nau-dam/demo?open=1 | Có seed generic; chưa có route/document nội dung riêng |
| 4 | 9 | [Cẩm Thạch - Vàng](https://chungdoi.com/vi/mau-thiep/cam-thach-vang/demo) | https://chungdoi.com/vi/mau-thiep/cam-thach-vang/demo?open=1 | Chưa có entry seed hay route/document riêng |
| 5 | 10 | [Tơ Duyên - Xanh](https://chungdoi.com/vi/mau-thiep/to-duyen-xanh/demo) | https://chungdoi.com/vi/mau-thiep/to-duyen-xanh/demo?open=1 | **Đã có seed generic**; chưa có route/document nội dung riêng |

**Bỏ qua:** Minimalism Đỏ Đậm, Minimalism Nâu, Song Hỷ Xanh, Hoa Mộc Xanh, Song Hỷ Đỏ. Chỉ đọc code/hồ sơ làm tham khảo; không dựng, seed, sắp lớp hay upload lại artwork của các mẫu đó. Entry generic trong seed không được tính là một bản clone đã làm xong.

Trước khi bắt đầu mỗi mẫu, xem lại status/diff/route vì Claude có thể vừa bổ sung bản dựng. Nếu đã có bản riêng mới, dùng bản đó và chỉ làm phần chưa được thực hiện, không tạo bản thứ hai hoặc ghi đè công việc đang diễn ra.

## 2. Ranh giới trách nhiệm

| Hạng mục | Codex phải hoàn thành | Claude nhận |
| --- | --- | --- |
| Nội dung tĩnh | Toàn bộ section nguồn thực có: hero, gia đình/lễ, gallery, tiệc/lịch, map, dress code, lịch trình, guestbook, quà, footer | Sai khác còn lại phải được ghi theo element, không nhận một bố cục còn ước lượng mà không biết |
| Hình thức | Geometry, font, màu, texture, rotation/flip, radius, thứ tự lớp và clip đã đo; desktop/mobile kiểm riêng | Đối chiếu tổng thể khi tích hợp bìa/popup/motion |
| Artwork | Toàn bộ artwork nhìn thấy của nội dung, kể cả CSS backgrounds/pseudo, icon và quà nhỏ; giữ gốc và dẫn xuất | Asset chỉ xuất hiện trong bìa/popup nếu chưa có |
| Thành phần | Dùng Album/Calendar/Map/DressCode/Form thật, hoạt động theo khả năng khối hiện có | Tính năng còn thiếu phải có mô tả điều khiển/renderer cụ thể |
| Trạng thái | Một trang nội dung mở thẳng, quà trang trí ở trạng thái tĩnh, không gắn hành động trỏ vào trang chưa tồn tại | Bìa mở, transition, RSVP/quà/QR popup, motion idle/hover/particles |
| Dữ liệu | Cloudinary + catalog MongoDB, document/snapshot nội dung nháp đồng nhất | Ghép đúng page ID vào tài liệu hoàn thiện, đồng bộ snapshot xuất bản và entry thư viện |

Không giao các lỗi tĩnh có thể đo/sửa ngay (chữ sai cỡ, hoa bị che, panel nhạt, ảnh xoay sai) thành mục “Claude polish”. Nếu thiếu nguồn hoặc công cụ, ghi đúng element, trạng thái còn thiếu và ảnh hưởng; bản đó chưa đạt mốc bàn giao đầy đủ.

## 3. Phát hiện kỹ thuật đã xác minh từ code

- `Album.spread` là **number theo px**, default 0; không dùng `true`. Đo rộng khối, phạm vi ảnh và clipping tổ tiên; không lấy 150px từ mẫu Nâu cho mọi gallery.
- Calendar có `weekLine`, `eventStyle: "Liên kết"`, `eventColor` và điều khiển riêng title/week/day/mark. Kiểu/nền/font chọn từ DOM mẫu mới.
- `lib/cards/blocks/text-style.ts` tạo CSS từ props Text; `CardPlayer` gắn ở layer `current`. Built-in Text của Miditor có thể bỏ renderer host: phải kiểm computed `letterSpacing`, `fontWeight`, `lineHeight` thật. Editor/thumbnail không mặc nhiên nhận style của player.
- `scripts/tidy-layers.ts` đang ghi nhiều mẫu và group có thể bỏ phone positions. Đợt này dùng `nameLayers` trong từng document; chỉ group khi đã kiểm giữ tọa độ/interaction/clip.
- `CMBE/prisma/schema.prisma`: `TemplateStatus` gồm `PENDING/PUBLISHED/REJECTED/UNLISTED/REMOVED`, **không có `DRAFT`**. Catalog có `PUBLISHED/RETIRED`.
- Seed reference hiện mặc định toàn bộ designs, dùng `makeDocument` gần đúng cho năm mẫu này (trừ Cẩm Thạch chưa có entry), ép `PUBLISHED` và xóa bản trùng theo title/slug. Không chạy nguyên lệnh hiện tại cho bản content-only.

## 4. Trình tự một mẫu: đo → dựng → so ngay section đó

Một tab nguồn và một tab local được tái sử dụng. DOM/XPath là cách đọc chính; screenshot chỉ dùng ở mốc đối chiếu cuối hoặc một lỗi crop/blend cụ thể. Không in full source/body ra chat.

### A. Lập hồ sơ nguồn và hệ tọa độ

- [ ] Mở trạng thái nội dung từ link ở mục 1; đợi font/ảnh, ghi viewport/zoom/scroll, root/cột/container và thứ tự section thực có.
- [ ] Tìm bằng `data-testid`, `data-landing-screenshot-id`, heading/asset; dùng `document.evaluate` khi có XPath. Lưu selector + XPath và xác nhận đúng parent.
- [ ] Đo origin trang/cột và phép đổi tọa độ, quét cả phần y âm trước hero. Khi có scale/rotate, chuẩn hóa cùng hệ qua transform chain; không trừ bbox khác hệ rồi coi là vị trí layout.
- [ ] Ghi desktop 1440×1000 và mobile 390×844, zoom 100%, làm chuẩn so local/source. Đây là viewport kiểm tra, không phải breakpoint nguồn; đọc breakpoint/crop/mobile placement riêng.

### B. Đo đủ section trước khi viết code của section

| Dữ liệu bắt buộc | Cách thu / mục đích |
| --- | --- |
| Geometry | Rect sau transform + layout width/height trước transform + center/origin và transform/rotate/scale của chuỗi tổ tiên tới container |
| Text | Chuỗi nguyên văn kể cả whitespace, font khai báo/thực tải, size/weight/line-height/letter-spacing/color/align; đo từng nhãn/ngày/giờ |
| Artwork | currentSrc/src/srcset, natural size, fit/position, alpha, flip, source SVG paths; phân biệt gallery thật với clone/thumbnail/lightbox |
| Layer | Background/gradient/ảnh CSS/pseudo `::before/after`, opacity node/parent, blend, border/radius/shadow, z-index, stacking và overflow/clip |
| Motion cho Claude | Target/selector, trạng thái idle/hover/click, keyframes/duration/easing/delay; giữ riêng transform bố cục |
| Độ tin cậy | `đã đo` / `đọc từ HTML` / `ước lượng` / `thiếu nguồn` / `chưa có điều khiển`; tách source và local |

- [ ] Thu theo section gọn ra file, không quét/in body lặp lại. Dump cũ của mẫu Nâu chỉ định vị nhanh, phải bổ sung các trường trên.
- [ ] Khi bị Cloudflare: dùng tab Chrome đã truy cập được hoặc DOM người dùng cung cấp. Nếu vẫn thiếu thì ghi phần thiếu và chuyển section/mẫu có đủ nguồn; không lặp retry cùng một cách, không bịa kích thước/asset.
- [ ] Lập mapping element → block → đường chỉnh UI → props thực hỗ trợ. Nếu prop thiếu renderer/UI, ghi rõ trước khi dùng.

### C. Lấy tài nguyên và đưa vào catalog

- [ ] Tải đúng file gốc từ element/browser đã tải; CSS background/mask/pseudo cũng vào inventory. Giữ WebP/PNG alpha, SVG thật; không vẽ lại, không bọc bitmap trong SVG để giả vector.
- [ ] So hash/asset ID để tái sử dụng tài nguyên đã có. Ảnh hero/gallery theo pipeline ảnh; artwork thuộc catalog Trang trí, có category/tags rõ.
- [ ] Dùng Cloudinary lưu file và MongoDB lưu metadata. Manifest ghi source URL → file/hash → publicId/URL → catalog ID, natural dimensions và vai trò sử dụng.
- [ ] Với blend/crop chưa có điều khiển phù hợp: lưu bản dẫn xuất kèm công thức/màu/opacity/kích thước/crop và file gốc. Ghi phần người dùng chưa chỉnh độc lập được; không flatten chữ/form/toàn thiệp.
- [ ] Kiểm pipeline `seed-decoration-catalog.ts`: upload hiện chỉ nhận png/webp. Giữ SVG gốc trong hồ sơ; nếu cần bản preview raster thì ghi là dẫn xuất, chỉ bật đổi màu khi renderer/UI thực hỗ trợ. Không tự gán tag “đổi màu”.
- [ ] Tải thử Cloudinary URL và tìm/thêm asset từ catalog editor thật. Chỉ file public local hoặc seed log không đủ.

### D. Dựng và kiểm local ngay

- [ ] Dựng outer background → cột/clip → giấy → artwork sau → panel → artwork trước → chữ/khối tương tác theo đúng source. Ngoài cột chỉ dùng trắng **nếu đã đo là trắng**.
- [ ] Gallery dùng một Album cho mỗi gallery nguồn; đo preset, ảnh/counter/nút/spread/clip và thứ tự. Hero dùng Image/PhotoFrame + Decoration riêng khi cần.
- [ ] Text/date/time là các hộp theo layout, không canh cột bằng khoảng trắng. Panel radius ở lớp vẽ/cắt thật; hoa đúng flip/rotation và vẽ trên panel khi source yêu cầu.
- [ ] Calendar/Map/DressCode/Form dùng khối sẵn có và props trong definition hiện tại. Tách màu nút/input/border, bỏ defaults nguồn không có; không dựng lịch hoặc form bằng ảnh.
- [ ] Lưu phone placements đã đo; nếu còn suy từ desktop thì đánh dấu chưa đạt mobile. Đặt tên lớp; bảo toàn IDs và clip khi group.
- [ ] So DOM nguồn/local ngay section đó ở cùng viewport/state/scale: geometry, crop, font computed, màu/blend/radius/paint order. Bảng so ghi source value, local value, kết quả; chỉ ghi sai số chấp nhận khi giải thích được rounding/scale, không dùng một ngưỡng chung che lệch layout.
- [ ] Kiểm gallery mép cột, trước hero, footer và scrollHeight cuối; artwork tràn không kéo dài trang tạo khoảng trống.

**Mốc đạt section:** có nguồn đo và native block tương ứng; không còn sai khác tĩnh chưa được giải thích. Section thiếu nguồn/renderer có lý do cụ thể và trạng thái thiếu, không được đánh dấu đã giống.

## 5. Cấu trúc file và giao diện tích hợp

Đường dẫn trong kế hoạch tính từ workspace chứa CMFE/CMBE. Mỗi document chỉ có page `invitation`, `startPageId: "invitation"`, normalize theo `lib/cards/document.ts`.

| Slug | Document mới trong `CMFE/lib/cards/demos/` | Export `CardDocument` | Route mới |
| --- | --- | --- | --- |
| `song-hy-v2-do` | `song-hy-v2-do.ts` | `songHyV2DoContentDocument` | `/demo/song-hy-v2-do` |
| `to-duyen-do-dam` | `to-duyen-do-dam.ts` | `toDuyenDoDamContentDocument` | `/demo/to-duyen-do-dam` |
| `minimalism-nau-dam` | `minimalism-nau-dam.ts` | `minimalismNauDamContentDocument` | `/demo/minimalism-nau-dam` |
| `cam-thach-vang` | `cam-thach-vang.ts` | `camThachVangContentDocument` | `/demo/cam-thach-vang` |
| `to-duyen-xanh` | `to-duyen-xanh.ts` | `toDuyenXanhContentDocument` | `/demo/to-duyen-xanh` |

- Create `CMFE/components/demos/invitation-content-demo.tsx`: viewer dùng `CardPlayer`, nhận `{ document: CardDocument; title: string; route: string; outerBackground: string }`; nút desktop/mobile và Dùng mẫu này theo viewer hiện có. Theme ngoài lấy từ mẫu đã đo, không dùng viewer màu cố định của mẫu khác. Đây là lớp hiển thị nhỏ, không thêm engine/registry mới.
- Create `CMFE/app/demo/<slug>/page.tsx`: import đúng export trên và viewer; route chỉ hiển thị document, không sửa props/geometry riêng làm seed khác demo.
- Create `CMFE/docs/references/<slug>-elements.md`: URL, origin/section order, kiểu layer, điểm riêng và trạng thái đo; có thể trỏ bảng chi tiết sang file dưới đây.
- Create `CMFE/docs/references/<slug>/measurements.json`: source/local rect và computed styles, viewport, selector/XPath, mapping node IDs, kết quả so.
- Create `CMFE/docs/references/<slug>/assets.json`: manifest ở bước C; artwork/photo/derivative phân biệt rõ.
- Create `CMFE/docs/references/<slug>/handoff.md`: kết quả và việc Claude nhận. HTML fragment chỉ lưu nếu cần tra element sau này, không bắt buộc thêm full-body dump lớn.
- Add file gốc/dẫn xuất vào `CMBE/scripts/assets/decorations/`; demo photo/fallback vào `CMFE/public/demo/<slug>/` theo đường ảnh hiện có.
- Modify `CMBE/scripts/seed-decoration-catalog.ts` cho asset thiếu, `CMFE/lib/cards/fonts.ts` chỉ khi font nguồn chưa có. Giữ file của các phiên khác.

Tạo viewer và mode seed dùng chung cùng mẫu đầu tiên. Chỉ đăng ký/import document của mẫu đã có file và đã validate; các mẫu sau bổ sung lần lượt, không import sẵn năm module chưa được tạo khiến typecheck/dry-run của mẫu đầu hỏng.

Không sửa Miditor, không đổi các document đã yêu cầu bỏ qua. Nếu thiếu điều khiển CardMaking chung, ghi vào handoff; chỉ mở rộng trong scope được giao và dùng prop/renderer chung thay vì CSS chữa riêng slug.

## 6. Task dùng chung: lưu snapshot bàn giao riêng, không đè mẫu xuất bản

**Files:** `CMBE/scripts/seed-reference-templates.ts`; test tập trung cho chọn slug/status/nơi ghi nếu thêm logic; schema giữ nguyên.

**Interface cần thêm khi triển khai (chưa phải CLI sẵn có):** `--slug=<slug> --status=UNLISTED`, tùy chọn `--dry-run`.

- [ ] Đăng ký document exports ở mục 5, thêm entry Cẩm Thạch Vàng; Tơ Duyên Xanh chỉ thay document selector của nhánh bàn giao vì đã có design entry. Không dùng palette/ornament danh sách generic làm số đo nguồn.
- [ ] Mode `UNLISTED` bắt buộc đúng một slug thuộc hàng đợi năm mẫu, dùng export nội dung tương ứng. Không fallback `makeDocument` khi thiếu import.
- [ ] Upsert bản handoff theo tags chứa cả `<slug>` và `clone-content-draft`; `status: UNLISTED`, `publishedAt: null`. Lookup này tách khỏi mẫu generic/PUBLISHED; không xóa duplicates hay thay bản xuất bản gốc.
- [ ] `--dry-run` validate document/asset mapping và báo đích create/update/ID mà không ghi; mode ghi chỉ thay ID handoff đã chọn. In slug, template ID/status và document export sau khi ghi.
- [ ] Chạy thử bằng tests hiện có/thêm test cho: từ chối thiếu/sai slug, đúng export, idempotent update bản handoff và không chạm PUBLISHED/mẫu bỏ qua; kiểm này phải xong trước lần ghi thật.
- [ ] Giữ hành vi các mode cũ cho caller hiện có; đợt này không chạy mode PUBLISHED hay seed không filter. Không tạo enum DRAFT, schema migration hoặc cơ chế phê duyệt mới.

Lệnh sau **chỉ dùng sau khi đã triển khai flags và checks trên**, từ CMBE:

```sh
npm run templates:seed-reference -- --slug=<slug> --status=UNLISTED --dry-run
npm run templates:seed-reference -- --slug=<slug> --status=UNLISTED
```

Cloudinary/catalog artwork có thể được xuất hiện trong kho Trang trí theo pipeline hiện có; snapshot thiệp chưa hoàn thiện vẫn UNLISTED. Claude tích hợp nội dung bằng page ID/export khi hoàn thiện, không lấy snapshot generic cũ để seed đè.

## 7. Năm task theo thứ tự, bàn giao ngay từng mẫu

Mỗi task dùng quy trình mục 4, file/interface mục 5 và mode bàn giao mục 6. Dùng bản trước làm ví dụ cách làm, không copy layout rồi đổi palette.

### Task 1 — Song Hỷ V2 Đỏ

**Source:** https://chungdoi.com/vi/mau-thiep/song-hy-v2-do/demo?open=1

- [ ] Đọc DOM riêng V2; phân biệt với Song Hỷ Đỏ đã dựng. Chưa chốt hình học/rèm/hoa văn/khung/chữ Hỷ từ mô tả seed.
- [ ] Thu asset, đo root/hero/khung và các section; dựng export `songHyV2DoContentDocument` theo trình tự section.
- [ ] Kiểm chữ Hỷ là asset/vector/font nào thật; crop/mask và lớp nền phải khớp element nguồn.
- [ ] Hoàn thành checklist nghiệm thu mục 8, lưu handoff rồi mới sang Task 2.

### Task 2 — Tơ Duyên Đỏ Đậm

**Source:** https://chungdoi.com/vi/mau-thiep/to-duyen-do-dam/demo?open=1

- [ ] Đọc riêng hoa/lụa/nét tơ và cấu trúc ảnh từ element; không lấy hoa Minimalism đỏ vì seed đang dùng chung.
- [ ] Đo ảnh nghiêng bằng layout size + transform tổ tiên; lấy alpha/crop/stacking của các lớp phủ.
- [ ] Dựng export `toDuyenDoDamContentDocument`, native Album; texture/blend nếu có đo và ghi cách thể hiện chỉnh được.
- [ ] Hoàn thành mục 8 và handoff trước Task 3.

### Task 3 — Minimalism Nâu Đậm

**Source:** https://chungdoi.com/vi/mau-thiep/minimalism-nau-dam/demo?open=1

- [ ] Đo nguồn riêng, không dùng palette/flower/panel size của Minimalism Nâu đã làm; kiểm hero, giấy và panel thực.
- [ ] Quét trước hero và cuối trang, transform ảnh/frame, backgrounds/pseudo, font computed và cấu trúc ngày/giờ.
- [ ] Dựng export `minimalismNauDamContentDocument`, kiểm vùng Album tràn/clip theo cột nguồn.
- [ ] Hoàn thành mục 8 và handoff trước Task 4.

### Task 4 — Cẩm Thạch Vàng

**Source:** https://chungdoi.com/vi/mau-thiep/cam-thach-vang/demo?open=1

- [ ] Tạo hồ sơ/entry mới; lấy nền/hoa văn/texture từ element thật. Tên mẫu không đủ để suy loại màu hay chất liệu.
- [ ] HTML trích xuất trước ghi Album 9 ảnh; xác nhận lại thứ tự/gallery thật và preset từ DOM, loại ảnh clone/thumbnail.
- [ ] Dựng export `camThachVangContentDocument`; đo toàn bộ số hàng lịch trình và section nguồn, không áp năm hàng mẫu Nâu.
- [ ] Hoàn thành mục 8 và handoff trước Task 5.

### Task 5 — Tơ Duyên Xanh

**Source:** https://chungdoi.com/vi/mau-thiep/to-duyen-xanh/demo?open=1

- [ ] Dùng lại kết quả về công cụ ở Task 2; artwork/layout/palette phải đo riêng từ nguồn Xanh.
- [ ] Thu đúng ảnh hoa/lụa/nền, không đổi màu hoa Đỏ Đậm để giả artwork; deduplicate chỉ khi hash/file thật trùng.
- [ ] Dựng export `toDuyenXanhContentDocument`; thay bản generic trong đường bàn giao UNLISTED, giữ mẫu xuất bản cũ.
- [ ] Hoàn thành mục 8 và chốt danh sách ID/route/handoff của đủ năm mẫu.

## 8. Checklist nghiệm thu từng mẫu — Codex chịu trách nhiệm

- [ ] **Đúng nguồn:** mọi section và artwork nội dung được kiểm kê; không bỏ chữ y âm, CSS backgrounds/pseudo, hoa/lá cạnh panel, mini gifts hoặc footer.
- [ ] **Đúng lớp/chất liệu:** outer/cột/giấy/panel đo riêng, alpha/blend/rotation/flip/radius/clip và paint order không lệch chưa giải thích.
- [ ] **Đúng chữ:** font thực tải, weight/spacing/line-height computed khớp; `18:00`, thứ/ngày/tháng/năm không đè, tiếng Việt/tên dài không tràn. Lưu khác biệt player/editor/thumbnail nếu có.
- [ ] **Đúng ảnh:** Album đúng số/thứ tự/preset/start state/spread theo px; thay một ảnh không thay cả album. Hero giữ đúng khung/crop/rotation.
- [ ] **Đúng responsive:** so DOM tại cả hai viewport; không gắn nhãn “đã đo mobile” cho layout suy từ desktop.
- [ ] **Đúng nội dung động hiện có:** Form thật chỉnh/gửi theo hệ thống; guestbook 0/1/10/>10 dùng danh sách thật co chiều cao, không dùng Text mẫu để khẳng định tính năng đã xong. Nếu khối chưa đáp ứng, ghi limitation đúng phần, không bù khoảng trắng cố định.
- [ ] **Đúng khả năng dựng lại:** thử từ trang trắng thêm các block đại diện, tìm artwork/giấy dẫn xuất trong catalog, chỉnh text/font/opacity/rotation/spread, thay ảnh rồi lưu/mở lại. Ghi rõ thao tác UI còn thiếu.
- [ ] **Đúng dữ liệu:** route dùng cùng export với snapshot UNLISTED, lấy lại snapshot kiểm page/asset; thử Dùng mẫu này từ draft/document thật. PUBLISHED của năm mẫu bỏ qua không bị sửa.
- [ ] **Đúng phạm vi:** chỉ nội dung tĩnh; không tạo bìa/popup/motion mới. Không có action trỏ tới page ID chưa tồn tại. Nhạc tắt, QR/ngân hàng nguồn không sao chép.
- [ ] **Đủ bằng chứng:** handoff có ID/route, manifest, bảng so DOM và các kiểm tra đã chạy; screenshot cuối nếu cần chỉ cho vấn đề cụ thể.

Kiểm tra khi triển khai:
- Từ CMFE: `npx tsc --noEmit`; validate `isPageData`/`validatePage` qua registry hiện có.
- Nếu sửa block/renderer chung: test đúng phần bị thay bằng Vitest; `npm run blocks:export` và xem diff `CMBE/components.json`. Không export/đổi definition chỉ vì tạo document mới.
- Logic seed mới: chạy test chọn slug/status/đích snapshot và dry-run trước khi ghi UNLISTED. Không chạy toàn bộ test nhiều lần cho các chỉnh tọa độ đơn thuần; DOM đối chiếu mới là kiểm visual chính.

**Điểm dừng:** Có thể báo `nội dung sẵn sàng bàn giao` khi các mục trong scope đạt. Mẫu thiếu source/UI/renderer ghi `còn thiếu` kèm element và tác động; không tự coi là đã đạt hoặc giấu trong mục “Claude polish”.

## 9. Phiếu bàn giao Claude cho từng mẫu

```text
Tên / slug / link nguồn:
Route local / document export / invitation page ID:
Template UNLISTED ID / ID bản xuất bản gốc nếu có:
Hồ sơ nguồn / measurements / asset manifest:
Đã xác nhận desktop / mobile:
Bảng lệch tĩnh còn lại (element, source, local, nguyên nhân):
UI/renderer còn thiếu (đường thao tác đã thử, phần không làm được):
Asset dẫn xuất và phần không chỉnh độc lập được:
Kiểm tra code/DOM/catalog/save-reopen đã chạy:
Claude nhận:
- Đo và dựng bìa riêng, hiệu ứng mở theo đúng nguồn.
- RSVP và popup quà/QR; asset chỉ có ở popup/bìa còn thiếu.
- Idle/hover/particles/scroll motion theo targets/keyframes đã ghi.
- Ghép invitation vào tài liệu hoàn thiện, giữ đúng IDs/interactions.
- Đối chiếu tổng thể khi có chuyển động, đồng bộ demo/snapshot/homepage.
Trạng thái: sẵn sàng bàn giao nội dung / còn thiếu [liệt kê].
```

**Trạng thái kế hoạch:** Đã viết lại theo skill clone và sửa chữa của Claude. Chưa triển khai năm mẫu trong lượt này; số đo nguồn, props chọn cho từng mẫu và các dấu hoàn thành sẽ được điền bằng bằng chứng thực khi thực hiện.
