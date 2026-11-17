# Bàn giao 5 mẫu còn lại — Claude kiểm tra sau khi có bản local

Phạm vi theo [kế hoạch clone](../../superpowers/plans/2026-11-15-first-ten-invitation-content-handoff.md): chỉ trang nội dung; không dựng lại năm mẫu đã có. Mỗi route local dưới đây là đích dự kiến, chưa được tạo cho đến khi có số đo DOM và asset của đúng mẫu.

| Thứ tự / tên | DOM nguồn | Route local dự kiến | Trạng thái |
| --- | --- | --- | --- |
| 4 — Song Hỷ V2 - Đỏ | [Mở demo](https://chungdoi.com/vi/mau-thiep/song-hy-v2-do/demo?open=1) | `/demo/song-hy-v2-do` | Có bản nội dung nháp 123 khối native, số đo nguồn desktop/mobile mới và bảng so DOM local. Còn lệch typography, mobile và tương tác; chưa nghiệm thu/catalog/snapshot. Xem `../song-hy-v2-do/handoff.md`. |
| 6 — Tơ Duyên - Đỏ Đậm | [Mở demo](https://chungdoi.com/vi/mau-thiep/to-duyen-do-dam/demo?open=1) | `/demo/to-duyen-do-dam` | Đã có bản nội dung 110 khối, Album 7 ảnh, số đo desktop/mobile và bảng so DOM; chưa nghiệm thu. |
| 8 — Minimalism - Nâu Đậm | [Mở demo](https://chungdoi.com/vi/mau-thiep/minimalism-nau-dam/demo?open=1) | `/demo/minimalism-nau-dam` | Đã có bản nội dung 149 khối, Album 10 ảnh, giấy multiply dẫn xuất và đủ 8 artwork quà; chưa nghiệm thu. File đo cũ gắn nhầm nguồn không được dùng. |
| 9 — Cẩm Thạch - Vàng | [Mở demo](https://chungdoi.com/vi/mau-thiep/cam-thach-vang/demo?open=1) | `/demo/cam-thach-vang` | Đã có bản nội dung 129 khối, Album 9 ảnh, medallion lịch trình và đủ artwork quà; chưa nghiệm thu. |
| 10 — Tơ Duyên - Xanh | [Mở demo](https://chungdoi.com/vi/mau-thiep/to-duyen-xanh/demo?open=1) | `/demo/to-duyen-xanh` | Đã có bản nội dung 110 khối, Album 7 ảnh, cặp bao lì xì; chưa nghiệm thu. |

## Trạng thái bàn giao hiện tại

Chưa chuyển năm mẫu cho Claude hoàn thiện. Cả bốn mẫu còn lại đã có document/route nội dung riêng từ DOM mới, chưa đạt nghiệm thu tổng thể. Handoff và giới hạn nằm trong `../<slug>/handoff.md`; ảnh tổng hợp là `remaining-previews.png`. Không dùng document generic từ `makeDocument` làm bản clone.

Khi bàn giao thật, Claude sẽ nhận đối chiếu nguồn/local và khả năng chỉnh bằng editor, rồi hoàn thiện bìa, popup, chuyển động và đồng bộ snapshot theo checklist trong plan. Bản UNLISTED chỉ được tạo sau khi document nội dung đã đo, route và asset catalog qua kiểm tra; dry-run hiện từ chối các export còn thiếu.

## Kiểm tra dữ liệu đã lưu

- [evidence-audit.json](evidence-audit.json) đối chiếu URL bên trong từng file với slug dự kiến và ghi các trường còn thiếu. Chỉ kiểm dữ liệu đã lưu, không phải lần đo nguồn mới.
- `song-hy-v2-do-elements-measured.json` thực tế là Tơ Duyên Xanh; `minimalism-nau-dam-elements-measured.json` thực tế là Tơ Duyên Đỏ Đậm. Không dùng chúng cho mẫu được ghi trên tên file. Giữ nguyên dữ liệu gốc để truy vết.
- Năm manifest `../<slug>/assets.json` đã có SHA-256, kích thước tự nhiên, định dạng và alpha. Cả 88 bản ghi đều có file local đọc được, dung lượng khớp manifest cũ. Điều này chưa xác minh thứ tự ảnh trên nguồn, Cloudinary hoặc catalog MongoDB.
- `lib/cards/demos/remaining-content.ts` vẫn là bản nháp gần đúng, không đủ điều kiện nối vào route hoặc seed handoff. Không coi entry generic là bản clone hoàn chỉnh.

**Cập nhật lần tiếp tục:** cả bốn nguồn đã đọc được trên Chrome thật, không dùng Chrome DevTools MCP. Đã đo nguồn và đọc local ở desktop 1440×1000/mobile 390×844, tạo route nội dung riêng, lấy bổ sung artwork qua Browser rồi ghi/copy file bằng code. Bốn document đều qua isPageData/validatePage và kiểm file local. Còn khoảng cách renderer/UI mobile, guestbook và nghiệm thu tĩnh theo từng section; chưa có catalog/snapshot UNLISTED. Bộ test TextStyle mới qua 3/3; suite tổng 385/387, hai lỗi ở `decoration-view.test.ts` và `editor-navigation.test.ts` cần theo dõi riêng. Song Hỷ V2 đang có thay đổi bìa/popup cùng lúc trong file TS; không dùng file đó làm template cho generator bốn mẫu nữa.
