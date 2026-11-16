# Song Hỷ V2 – Đỏ: bản nội dung đang làm

Nguồn: https://chungdoi.com/vi/mau-thiep/song-hy-v2-do/demo?open=1

Route: http://localhost:3001/demo/song-hy-v2-do

Export: `songHyV2DoContentDocument`, trang `invitation`. Có 123 khối native,
không lấy bố cục từ `remaining-content.ts`. Chưa tạo snapshot UNLISTED.

## Bằng chứng mới

- Chrome extension nối vào trình duyệt đang mở. Menu profile xác nhận email
  người dùng yêu cầu. Không gọi Chrome DevTools MCP hoặc mở Chrome riêng.
- `source-20261116.json`: DOM nguồn ở 1440×1000 và 390×844, bao gồm XPath,
  kích thước layout/rect, computed styles, transforms, border-image và pseudo.
  Loại dialog/popup cùng QR khỏi dữ liệu lưu. Gallery đang tự chạy khi đo;
  rect ảnh là trạng thái tại thời điểm capture, không phải một trạng thái đứng yên.
- `node-mapping.json`: mapping khối → XPath. `desktop-comparison-20261116.json`:
  số đo DOM local sau khi dựng, cùng viewport desktop. Text inline dùng line box
  suy từ ink rect và line-height; chưa xác nhận từng baseline/line wrap.
- `local-desktop-20261116.png`: ảnh kiểm tra hero bản nháp.
- 3 panel nguồn là CSS `border-image`, slice `270 240 fill`; dựng 6 PNG dẫn xuất
  theo kích thước desktop/mobile riêng. Giữ file nguồn và công thức trong scripts.
- Lấy thêm bao lì xì và 3 file font từ inventory asset của tab thật; đã copy bằng
  code. Manifest ghi hash asset mới. Chưa upload/kiểm catalog Cloudinary/MongoDB.

## Kiểm tra và sai khác chưa giải quyết

- TypeScript và validation cấu trúc được chạy; xem kết quả lần cuối trong
  `verification-20261116.json`. Các kiểm tra này không chứng minh giống nguồn.
- Viewer chọn device desktop rõ ràng để tránh scale theo bước 16px khi canvas
  gần ngưỡng 960px. DOM local xác nhận cột đúng 900px; không bù tọa độ theo slug.
- **Typography còn lệch:** computed line-height local có giá trị khác nguồn.
  Cần kiểm đường render Text/child và spacing/word-spacing/baseline; chưa đạt.
- **Mobile chưa đạt:** có số đo nguồn độc lập nhưng nhiều props không có
  `perDevice` trong registry: Decoration.src, Calendar typography, DressCode
  swatch size/gap, Text lineHeight/letterSpacing. Không đưa phoneProps không hợp
  lệ vào document; giữ số gốc trong measured.json. Nền panel mobile đang chưa
  được chọn khi phát vì src không có điều khiển riêng cho điện thoại.
- Hero dùng PhotoFrame và maskPath ghép từ hai rounded rect của SVG nguồn;
  ảnh thay được. Preset này chưa chọn lại được từ catalog hình dạng UI.
  Cần kiểm crop và biên khung, không coi maskPath là đã thử dựng lại từ trắng.
- Album có 9 ảnh theo đúng thứ tự DOM, một khối Album, tắt autoplay theo scope.
  Native renderer có màu nút/counter/cách crop riêng; chưa đối chiếu hoàn tất.
- Lịch/Map/DressCode/Form là native blocks. Chưa kiểm tương tác save/reopen,
  thay ảnh trong editor, danh sách 0/1/10/>10 lời chúc hoặc gửi form thật.
  Preview Form đang hiện 2 lời mẫu mặc dù bản nháp yêu cầu 8; chiều cao và
  giao diện field/list cần xử lý. Preview cố ý không gửi dữ liệu lên trang nguồn.
- Countdown nguồn chưa có component tương ứng: giữ heading nhưng bỏ con số
  đếm ngược chạy theo thời gian thay vì ghi cứng một thời điểm thành tính năng.
- Native RSVP có nhãn/nền nhưng chưa gắn action; không trỏ tới popup chưa có.
- Quà mừng hiện là artwork tĩnh. Chưa hoàn tất bố cục hai bao, ngôi sao và bóng.
- Lớp/clip theo section, footer, tổng chiều cao và vị trí động guestbook còn
  cần so. Không seed/xuất bản bản nháp hiện tại.

## Bốn mẫu tiếp theo

Khi mở Tơ Duyên Đỏ Đậm trên chính profile này, trang chuyển sang xác minh
Cloudflare, Ray ID `a5b326f1ae372f3e`; chưa có DOM nội dung mới. Tab được giữ
để người dùng xử lý xác minh. Không đánh dấu bốn mẫu sau đã đo/dựng trong lượt này.

## Cập nhật 2026-11-16: bìa, popup, quà, sổ lưu bút

Export đầy đủ: `songHyV2DoDocument` (bìa → thiệp → popup `gift-details` → popup `rsvp`), route `/demo/song-hy-v2-do`,
seed `npm run templates:seed-reference -- --slug=song-hy-v2-do` (đã chạy, chỉ mẫu này).

- Bìa: chủ đề `shv2` trong `scripts/make-song-hy-covers.ts` (`npx tsx scripts/make-song-hy-covers.ts shv2`). Nền #420000, thẻ 600x420 #8c0000 r8,
  hai ảnh 囍 402x396 mờ 15% cắt theo thẻ, con dấu ảnh `double-happiness-light.webp` 52px có quầng #ffe8a4, tên Carattere 36px,
  "&" Ms Madi 20px, ngày/Thân Mời Lora 18px, nút 140x48 #ffe8a4. Vị trí dọc khớp số đo (-91/-60/-26/14/46/93/154).
- Popup quà mừng (hộp 576x453, đầu #ffe8a4, thân #5a0000, một cột QR 192px): QR và số tài khoản là dữ liệu giả; gốc cũng chỉ có một cột.
- Popup xác nhận tham dự: dùng bộ câu hỏi dựng sẵn của khối Form, nút #920002. Gốc là hộp trắng 448px chung của nền tảng
  (hai lựa chọn dạng thẻ, bo 12px); Form hiện có ba lựa chọn và kiểu ô khác, chưa đạt.
- Quà mừng: bao trước/sau nảy lên khi rê chuột (nhóm `qua`), bốn ngôi sao là Decoration chớp lệch pha (0/0,6/1,2/1,7s); bấm bao hoặc "Nhấn để mở" mở popup.
  Hiệu ứng nhàn rỗi chỉ có ở Decoration nên ✦ bản đo được thay bằng `sparkle.svg`.
- Sổ lưu bút: Form chỉ giữ phần nhập (`previewSampleCount: 0`), 8 lời chúc mẫu bằng Shape/Text (thẻ 492x85, bước 96,7px; điện thoại bước 105,6px là ước lượng, chưa đo).
- Typography desktop: 30 khối Text đã so với số đo nguồn (cỡ, độ đậm, line-height, giãn chữ) khớp; chỉ khác tên phông thay thế (`Fraunces Soft`, `Ms Madi Ampersand`).
  Giãn chữ chạy ở trình phát/xem trước, chưa vẽ trong editor và ảnh thu nhỏ.

Còn thiếu: **không có khối Đếm ngược** (gốc là một dòng "N ngày G giờ P phút S giây" chạy theo giờ; bản dựng chỉ có tiêu đề),
bìa và số đo điện thoại chưa đo độc lập, popup RSVP chưa giống hộp gốc, QR/tài khoản giả.

**Trạng thái: nội dung và popup sẵn sàng xem; chưa phải clone hoàn tất.**
