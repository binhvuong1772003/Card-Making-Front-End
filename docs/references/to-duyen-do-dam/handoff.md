# Tơ Duyên – Đỏ Đậm – nội dung đang đối chiếu

Nguồn: https://chungdoi.com/vi/mau-thiep/to-duyen-do-dam/demo?open=1

Local: http://localhost:3001/demo/to-duyen-do-dam

Export: `toDuyenDoDamContentDocument`, trang `invitation`. Chỉ nội dung; không bìa, popup,
nhạc hoặc dữ liệu ngân hàng/QR. Chưa tạo snapshot UNLISTED, chưa seed/xuất bản.

## Dữ liệu và kiểm tra đã làm

- Nguồn đọc qua extension của Chrome đang mở, đúng profile đã xác minh.
- `source-20261116.json`: DOM desktop 1440×1000 và mobile 390×844, có kiểm
  viewport thực trước khi lưu. Không dùng file cũ gắn nhầm tên mẫu.
- Cột desktop 900×7795.890625px; mobile 375×6239.703125px. Hệ tọa độ giữ origin
  riêng; ảnh nghiêng dùng layout size và chuỗi transform/rotate của tổ tiên.
- 110 khối native, Album 7 ảnh đúng thứ tự DOM;
  ngày lịch 2026-12-19. Text/ngày/giờ không ghép bằng khoảng trắng.
- `node-mapping.json` và `local-comparison-20261116.json`: mapping XPath,
  rect dựng từ nguồn, rect local thực ở cùng viewport và computed typography.
  Không áp ngưỡng sai số chung để che khác biệt.
- `assets.json` giữ manifest cũ; `additional-assets-20261116.json` ghi file mới,
  URL, SHA-256 và kích thước byte. Tất cả src/background/Album dùng trong bản
  dựng có file local. Chưa xác minh Cloudinary/catalog MongoDB.
- `local-desktop-20261116.png`: hero local đã xem. DOM mobile đã đọc riêng.
- `verification-20261116.json`: isPageData/validatePage đều qua, đúng một trang
  invitation, không interaction trỏ tới trang chưa có, không thiếu file local.
- Đã sửa lỗi chung TextStyle CSS chỉ đặt !important cho thuộc tính cuối:
  nay mỗi thuộc tính typography đều thắng inline style của renderer. Regression
  test đã đỏ trước sửa và xanh sau sửa (3/3).

## Chưa đạt và cần xử lý

1. **Chưa nghiệm thu tổng thể:** ảnh hero đã xem nhưng chưa so screenshot từng
   section/paint order/crop/border/bóng. Rect của ảnh đã xoay phải so bbox sau
   affine; không lấy layout width so trực tiếp với bbox source.
2. **Mobile:** số đo nguồn có đủ, nhưng registry chưa cho lưu các override sau:
   Album.spread, Calendar.size, Calendar.titleSize, Text.letterSpacing, Text.lineHeight.
   Spec giữ giá trị nguồn, export bỏ prop không hợp lệ. Chưa được gọi là khớp mobile.
3. **Album:** dùng native Album, giữ ảnh và thứ tự. Bộ điều khiển/dots/counter,
   màu nút, spread mobile và crop của renderer còn cần đối chiếu.
4. **Calendar/Map/DressCode:** native component; một số khoảng cách/font/màu nút
   do renderer hiện có quyết định. Chưa xác nhận chính xác mọi chi tiết nguồn.
5. **Guestbook:** dùng Form thật với publicList; không rải thẻ Text giả để nhận
   là dữ liệu live. Native preview chỉ có hai bản ghi mẫu, khác 9
   bản ghi đo được. Chưa test gửi/lưu lại/danh sách thật 0/1/10/>10 và co chiều cao.
6. **Countdown:** không ghi cứng số thời gian còn lại. Khối live tương ứng chưa
   có; heading được giữ, giá trị đếm chưa dựng.
7. **Motion:** tất cả artwork tĩnh; nguồn có parallax/hover/float. Không nhận là
   đã khớp keyframes. Shadows/filter/blend và glyph baseline còn cần kiểm thêm.
8. **UI/catalog:** chưa thử dựng lại từ trang trắng, tìm artwork trong catalog,
   thay ảnh/crop, lưu/mở lại hay Dùng mẫu này. Chưa upload artwork/font metadata.
9. **Bàn giao Claude sau khi phần tĩnh đạt:** bìa, mở thiệp, popup RSVP/quà,
   chuyển động; các sai khác tĩnh trên không được giấu vào mục polish.

**Trạng thái: bản nội dung local có thể mở để đối chiếu; chưa sẵn sàng nghiệm thu.**
