# Kế hoạch clone Hoa Mộc Xanh

Nguồn: https://chungdoi.com/vi/mau-thiep/hoa-moc-xanh/demo  
Quy trình chung: [invitation-cloning-guide.md](invitation-cloning-guide.md)  
DOM/XPath của mẫu: [hoa-moc-xanh-elements.md](hoa-moc-xanh-elements.md)

## Đã triển khai

- Đọc HTML người dùng dán và lưu XPath cùng CSS/asset quan sát được. DOM xác nhận đây là một trang cuộn dài có hero ảnh đôi, không có bìa mở riêng.
- Dựng trang thiệp bằng `Text`, `Shape`, `Image`, `Decoration`, `Album`, `Calendar`, `Map`, `Form`, `DressCode` và `CardPanel`; cột giấy 900px đặt giữa nền trắng.
- Đồng bộ màu nền/chữ, màu dress code, thông tin ảnh đôi và thứ tự section theo DOM. Bổ sung font Pattaya vào kho để giữ phần chữ viết tay có thể chọn trong editor.
- Khối album có điều khiển `Ảnh bắt đầu`, hiện coverflow 8 ảnh theo trạng thái 1/8 của DOM mới nhất, transition 1.1 giây và cùng các offset/rotation/scale/opacity đã ghi trong nguồn.
- Tách 12 lớp hoa thành Decoration riêng theo kích thước/vị trí/góc/opacity trong element; thêm điều khiển lật ngang để khớp hai lớp mirror.
- Giữ ảnh ghép hộp quà nhỏ trong thư viện; bảy ảnh riêng trong DOM đã được xác định nhưng máy chủ trả HTTP 403 khi tải trực tiếp, nên chưa đưa từng ảnh vào MongoDB/Cloudinary.
- Cập nhật snapshot mẫu Hoa Mộc Xanh trong MongoDB qua `templates:seed-reference --slug=hoa-moc-xanh`.

## Còn thiếu để gọi là bản khớp mẫu

- HTML không có `getBoundingClientRect()`, nên tọa độ tuyệt đối/viewport của từng section chưa được xác minh. Các `x/y` hiện tại là bản dựng local.
- Nguồn có 7 hộp quà nhỏ là 7 ảnh riêng; catalog hiện có ảnh ghép cũ. Chưa thể chỉnh từng hộp cho tới khi lấy được file nguồn.
- Snapshot transform hoa không cho biết keyframes, duration, easing hay chu kỳ parallax; chưa khẳng định chuyển động local giống nguồn.
- Chưa đối chiếu screenshot local và source ở cùng viewport, cũng chưa kiểm tra bằng thao tác editor từ trang trắng.

## Đường dẫn dữ liệu

- Demo: `lib/cards/demos/hoa-moc-xanh.ts`.
- Template thư viện: seed riêng slug `hoa-moc-xanh` từ đúng `hoaMocXanhDemoDocument`.
- Catalog mới: các ID `ref-hoa-moc-green-flowers`, `ref-hoa-moc-green-floral-band`, `ref-hoa-moc-green-gift`, `ref-hoa-moc-green-gift-mini-orbit`.
- Nguồn và giới hạn asset local: `public/demo/hoa-moc-xanh/SOURCES.md`.

## Kiểm tra đã làm

FE/BE TypeScript typecheck, ESLint các file FE liên quan, và `git diff --check` đều đạt. Không chạy test suite. Chưa hoàn tất kiểm tra bằng mắt và thao tác người dùng; các mục chưa đo nêu phía trên vẫn còn mở.
