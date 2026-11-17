# Hoa Mộc Xanh — element notes

Nguồn: `https://chungdoi.com/vi/mau-thiep/hoa-moc-xanh/demo`  
Cách đọc: HTML người dùng dán ngày 14/11/2026. Chỉ dùng phần DOM hiển thị; bỏ tracker, dữ liệu nhúng, thông tin thanh toán và nội dung ẩn. XPath dưới đây thuộc đúng bản DOM đã dán, có thể đổi nếu website thêm wrapper.

## Cấu trúc trang

Đây là một thiệp cuộn dài. DOM có một `header` hero, sau đó là các section trong cùng một cột giấy. Không có trang bìa riêng và không có nút “Mở thiệp” ở đầu.

| Vị trí | XPath trong bản DOM | Vai trò |
| --- | --- | --- |
| Cột thiệp | `/html/body/div[3]/div/div[1]/main/div/div` | `max-w-[480px] md:max-w-[900px]`, nền `rgb(255,250,247)`, chữ `rgb(48,83,15)`, `overflow-hidden`, viền xanh nhạt ở desktop |
| Tiêu đề gia đình | `/html/body/div[3]/div/div[1]/main/div/div/h2[1]` | `THÔNG TIN LỄ CƯỚI` |
| Hero | `/html/body/div[3]/div/div[1]/main/div/div/header` | `pt-[210px] md:pt-[330px]`, `min-h-[840px] md:min-h-[900px]`; nội dung ảnh đôi |
| Ảnh đôi | `/html/body/div[3]/div/div[1]/main/div/div/header/div[3]` | Khung `320×440` trên mobile, `500×640` từ md; ảnh dọc 2:3, tấm thứ nhất nghiêng `-17deg`, tấm sau `13deg` |
| Tên cô dâu/chú rể | `/html/body/div[3]/div/div[1]/main/div/div/div[6]/h3[1]` và `/html/body/div[3]/div/div[1]/main/div/div/div[6]/h3[2]` | EB Garamond, 64px desktop trong inline style; tên và vai trò thành từng node |
| Album | `/html/body/div[3]/div/div[1]/main/div/div/div[14]` | Cột tối đa `390px / 560px`; khung `340px / 520px`; 8 ảnh, coverflow 3D, transition `1100ms`, chỉ số `1 / 8` trong DOM mới nhất |
| Tiêu đề tiệc | `/html/body/div[3]/div/div[1]/main/div/div/h2[2]` | `THÔNG TIN TIỆC CƯỚI` |
| Địa điểm | `/html/body/div[3]/div/div[1]/main/div/div/div[18]/section/div[1]/h3` | Tiêu đề địa điểm và map nằm trong cùng section |
| Dress code | `/html/body/div[3]/div/div[1]/main/div/div/div[19]` | Ba swatch tròn: `#224327`, `#4a6b4f`, `#c2e3c7`; 40px mobile, 48px desktop |
| Lịch trình | `/html/body/div[3]/div/div[1]/main/div/div/div[20]` | Grid ba cột `1fr 16px 1fr`, đường dọc và chấm giữa; 5 hàng |
| Sổ lưu bút | `/html/body/div[3]/div/div[1]/main/div/div/section` | Form và danh sách lời chúc cùng section; font Baskerville; không chừa một danh sách rỗng có chiều cao cố định |
| Hộp quà | `/html/body/div[3]/div/div[1]/main/div/div/div[21]/button/div/div[2]` | Cụm 7 ảnh hộp quà nhỏ và hộp quà chính; mỗi ảnh là một `img` riêng với kích thước, góc và z-index riêng |
| Cuối thiệp | `/html/body/div[3]/div/div[1]/main/div/div/footer` | Lời cảm ơn; nguồn có nhãn thương hiệu riêng, không sao chép vào bản CardMaking |

Thứ tự nội dung quan sát được: hero ảnh đôi → thông tin hai gia đình → lời báo tin và tên cô dâu/chú rể → ngày làm lễ → album → thông tin tiệc/lịch → xác nhận tham dự → địa điểm/bản đồ → dress code → lịch trình → sổ lưu bút → hộp quà/popup → lời cảm ơn.

## Màu, chữ và tài nguyên

- Nền cột giấy: `#fffaf7`; nền ngoài cột: trắng; màu chữ chính: `#30530f`.
- Tiêu đề section dùng Times New Roman, 24px, đậm, letter-spacing 1px. Nội dung dùng `Baskerville, "Times New Roman", ChungDoiIndic, serif`.
- Tên trên hero dùng Playfair Display; tên lớn trong phần báo tin dùng EB Garamond; chữ viết tay của ngày dùng font script. Link font tải được trong HTML gồm Playfair Display, Lora và Pattaya.
- Hoa dùng `/images/themes/boho-floral-green/flower.webp`; dải trang trí dùng `/images/themes/boho-floral-green/decoration_bar.webp`.
- Có 12 lớp hoa nền cùng trỏ đến `flower.webp`, nhưng mỗi lớp có vị trí, kích thước, góc xoay và opacity riêng. Hai lớp lật ngang cũng có điều khiển riêng trong editor.
- Album dùng 8 ảnh trong `https://assets.chungdoi.com/photo-library/design/`; bản local có `photo-1.webp`…`photo-8.webp`.
- Hộp quà chính dùng `/images/giftbox/boho_floral_green.webp`. Bảy hộp nhỏ có ảnh riêng dưới `/images/giftbox/mini/` (`porcelain_brown`, `silk_flora_brown`, `floral_fiesta_yellow`, `glass_garden_blue`, `chateau_blue`, `baroque_gold`, `royal_v2_purple`); DOM ghi vị trí, kích thước, góc xoay và z-index từng hộp. Catalog hiện vẫn giữ ảnh ghép cũ. Direct fetch ảnh mini trả HTTP 403 nên chưa có file để lưu riêng vào Cloudinary/MongoDB.

## Ranh giới số đo

Màu, tên font khai báo, text hiển thị, thứ tự section, kích thước do class Tailwind quy định và URL ảnh ở trên được đọc trực tiếp từ DOM/style người dùng gửi. File HTML không chứa `getBoundingClientRect()` nên toạ độ tuyệt đối của mọi section, kích thước viewport/zoom lúc chụp, transform animation cuối cùng và keyframes chưa được xác minh. Các toạ độ `x/y` trong `lib/cards/demos/hoa-moc-xanh.ts` là bố trí local, không phải số đo nguồn. Transform hoa inline là trạng thái tại một thời điểm, không đủ để suy ra chu kỳ parallax.

Mỗi ảnh album là phần tử riêng trong coverflow. Ở màn hình desktop, ảnh hoạt động có `scale(1)`; các ảnh lân cận lần lượt dùng dịch ngang ±60/120/180/240%, xoay Y ±45/90/135/180deg và opacity giảm; transition 1100ms. Khối `Album` local dùng cùng các khoảng dịch, độ lùi, góc xoay, scale, opacity và transition 1.1s; DOM mới nhất chụp trạng thái 1/8 và `Ảnh bắt đầu` đã đặt thành 1.

## Khả năng chỉnh sửa còn thiếu

- Cụm 7 hộp nhỏ còn là ảnh ghép; cần lấy được 7 file ảnh nguồn để lưu riêng vào catalog và dựng thành các Decoration độc lập.
- Khối `Album` tái hiện coverflow 8 ảnh, trạng thái đầu 1/8, và cho đổi trạng thái qua `Ảnh bắt đầu`.
- Các transform hoa trong HTML chỉ là snapshot; bản local cho bật/tắt trôi nhẹ nhưng chưa thể khẳng định parallax giống khi thiếu keyframes/duration nguồn.
- Chưa đo được keyframes parallax và motion của hoa từ HTML snapshot; cần đọc trạng thái animation thực tế để thêm đúng điều khiển/bản tĩnh.
