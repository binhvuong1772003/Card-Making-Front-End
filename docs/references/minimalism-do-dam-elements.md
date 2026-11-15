# Minimalism Đỏ Đậm: đúc kết và nguồn đối chiếu

Nguồn: <https://chungdoi.com/vi/mau-thiep/minimalism-do-dam/demo>.

Áp dụng [quy trình clone chung](invitation-cloning-guide.md). Ghi chú này tổng hợp phản hồi của người dùng và file đã dựng; không thay thế việc đo lại element nguồn. Chưa có XPath cụ thể của mẫu này trong hồ sơ hiện tại, vì vậy không suy đoán hoặc tự điền XPath.

## Những điểm đã khiến bản dựng phải sửa nhiều lần

| Phần | Đúc kết để lần sau tránh lặp lại |
| --- | --- |
| Bìa | Nguồn là thẻ mời trên nền đỏ, có nút mở và chuyển cảnh; phong bì chứa ảnh là phần đầu của trang nội dung. Phải lập sơ đồ trang trước. |
| Màu panel và góc | Màu đỏ từng bị nhạt, góc vẫn vuông dù đã sửa. Kiểm tra asset thực sự render, opacity, texture phủ, radius và snapshot đang được xem. |
| Hoa | Vẽ lại hoặc lấy sai file làm khác nét. Đọc asset nguồn, đo phần hoa nhìn thấy, rotation, flip, offset, opacity và clipping; hoa bìa khác vị trí với hoa cạnh panel. |
| Nền | Giấy trơn/texture khác không tạo được chất liệu nguồn. Dùng đúng texture hoặc ảnh nền tổng hợp nguồn; ghi rõ hoa/bóng nào nằm sẵn trong nền. |
| Font | Font gần giống làm thay nét và xuống dòng. Xác định font thật, thêm vào kho font và kiểm tra nó tải trên mọi chế độ. |
| Dấu tim | Bóng/nền hoặc khung cắt tạo cảm giác đập vuông; nhịp quá mạnh không khớp yêu cầu nhẹ nhàng. Đọc đúng phần scale và tránh motion nhúng trong SVG chạy chồng motion của hệ thống. |
| Nút mở | Vệt sáng quét là một lớp có clipping theo pill, không phải đổi màu toàn nút. Cần giữ cả thời gian quét lẫn khoảng nghỉ. |
| Lịch trình/lịch | Phải đọc cấu trúc cột, vị trí đường nối/chấm, icon, kiểu đánh dấu ngày và nút bên ngoài lịch; thay bằng preset gần giống chưa đủ. |
| Dress code | Các vòng tròn từng bị nền giấy phủ ngang hoặc có bóng vuông. Kiểm tra thứ tự lớp, hình dạng và nền của wrapper. |
| Sổ lưu bút | Nền, chữ, form và danh sách là các phần riêng. Không giữ nhãn/đoạn giới thiệu dư khi nguồn dùng placeholder; không chừa chiều cao cố định cho danh sách lời chúc. |
| Quà mừng | Mẫu dùng cặp bao lì xì hoa đỏ, không phải hộp quà xanh. Giữ bản cũ trong thư viện như biến thể; dùng asset và hover/motion đúng biến thể cho mẫu này. |
| Mẫu trên trang chủ | Demo mới và snapshot cũ có thể khác nhau. Phải kiểm tra đúng mẫu trong homepage popup và thiệp tạo qua “Dùng mẫu này”. |

## Hồ sơ local để tìm lại

Các đường dẫn sau tính từ `CMFE/`, trừ mục ghi rõ `CMBE/`:

| Phần | File |
| --- | --- |
| Trang demo ghép tài liệu | `app/demo/minimalism-do-dam/page.tsx` |
| Hành động dùng mẫu và màn demo | `components/demos/minimalism-do-dam-demo.tsx` |
| Generator bìa dùng chung | `scripts/make-song-hy-covers.ts` |
| Generator nội dung và popup | `scripts/make-minimalism-pages.ts` |
| Tài liệu bìa/nội dung được route demo đọc | `public/demo/song-hy/cover-mdd.json`, `public/demo/minimalism-do-dam/pages-mdd.json` |
| Artwork | `public/demo/minimalism-do-dam/` và asset bìa trong `public/demo/song-hy/` |
| Chuyển ảnh sang vỏ SVG | `scripts/convert-minimalism-assets-to-svg.ts` — nhúng WebP base64, không vector hóa ảnh |
| Font trong editor | `lib/cards/fonts.ts` |
| Hiệu ứng trang trí | `components/blocks/decoration-view.tsx`, `lib/cards/blocks/decoration.ts` |
| Form và phần lời chúc | `components/blocks/form-view.tsx`, `lib/cards/blocks/form.ts` |
| Player/chuyển trang | `components/cards/card-player.tsx`, `components/cards/card-player.module.css` |
| Nhập catalog trang trí | `CMBE/scripts/seed-decoration-catalog.ts` |
| Script dựng snapshot tham chiếu | `CMBE/scripts/seed-reference-templates.ts` |

Các script trên là điểm truy vết, không phải cam kết chúng cùng dùng một tài liệu hay đã được chạy để đồng bộ DB. Đọc luồng dữ liệu trước khi cập nhật snapshot.

## Thông số đang có và giới hạn bằng chứng

- Generator nội dung hiện dùng panel đỏ `#481015`, chữ kem `#ece4d8`, panel chính rộng 560 px và radius 16 px. Đây là giá trị **local hiện tại**; cần đối chiếu computed styles nguồn trước khi coi là thông số chuẩn.
- Generator bìa có ghi chú nguồn về hoa cao 280 px, opacity 0,8, xoay 25 độ và cắt theo thẻ bo 8 px. Giữ ghi chú này làm điểm tìm lại, rồi kiểm tra theo breakpoint nguồn.
- File hoa local sử dụng ảnh WebP nhúng trong SVG; không được tuyên bố người dùng chỉnh được từng cánh hoa hoặc màu vector.
- Nền `papernote-background.webp` chứa sẵn giấy/bóng/cụm hoa. Cần phân biệt khả năng thêm/xoay cả nền với khả năng sửa riêng từng phần bên trong.
- Còn các xử lý CSS theo ID trong renderer/form của bản dựng hiện tại. Chúng không chứng minh một người có thể tạo thiết kế bất kỳ bằng editor. Trước khi xác nhận dựng lại đầy đủ, phải thử từ trang trắng và ghi những điều khiển chưa có.

Giữ các điểm chưa đo hoặc chưa thử dưới dạng giới hạn mở; không coi việc bổ sung tài liệu này là đã sửa chúng.

## Red envelope pair: measured hover and idle effects (14/11/2026)

Source: `/images/envelope/minimalism_darkred.webp` (one 420×659 envelope drawn twice, saved locally as `public/demo/minimalism-do-dam/envelope-single.webp`; local study asset only). Button 250×357, envelope box 190×275, 48px below it for the hint "Nhấn để mở".

- Back layer: flipped, `translateX(20%) translateY(-10%) scale(-0.8, 0.8) rotate(-15deg)`, origin 50% 100%, bob 5.2s (0 → -7px). Hover adds `rotate` sway 2.2s infinite: 0, -1°, 2°, -2.5°, 1.5° at 0/20/40/60/80%.
- Front layer: `rotate: -10deg`, origin 50% 92%, bob 3s (translate -15% 0 → -15% -7px). Hover adds grow 0.35s forwards (scale 1 → 1.12) then wave 1.1s infinite after 0.35s: ±6°, 4.5°, -3°, 1.5°.
- Shadow ellipse 125×11, black 45%, blur 4px; four gold ✦ sparkles; hint text pulse.
- Local: Decoration with `motionStyle: "Cặp bao lì xì"` (one block, two layers, effects built in) and the animated preset "Cặp bao lì xì đỏ" in the Trang trí tab. Not matched: the shadow pulse keyframes were not read (uses the gift-box shadow pulse), sparkle glyph assumed `✦`. The catalog still holds the old flat pair image; the new single image is served from the app's `public/`, not Cloudinary.
