# Trang thiệp mở dạng popup

## Thiết kế đã thống nhất
Một trang thiệp bình thường có thể được mở như popup. Người dùng tự thiết kế nội dung bằng các khối hiện có, bao gồm ảnh QR; không có mẫu QR cố định và không phát sinh loại trang riêng.

Trang đích giữ cài đặt popup. Khi không chọn khối, bảng thuộc tính bên phải hiển thị mục “Hiển thị dạng popup”: chiều rộng Nhỏ 420 px / Vừa 640 px / Lớn 960 px / Tuỳ chỉnh 280–1200 px; hiệu ứng Không / Mờ dần / Trượt lên / Thu phóng; màu và độ đậm nền phủ. Mặc định 640 px, mờ dần. Chiều cao theo nội dung, quá màn hình thì cuộn bên trong. Điện thoại chừa lề 16 px mỗi bên. Không tự thay đổi toạ độ khối khi đổi kích thước.

Khối nguồn có mục “Khi bấm”: chuyển trang hoặc mở popup, rồi chọn trang đích. Mở popup không chuyển route, không thay trang nền. Đóng bằng nút đóng, Escape hoặc bấm nền phủ; trả focus về nguồn, giữ vị trí cuộn nền và dữ liệu form. Popup không xếp chồng: mở popup khác thì thay nội dung; chuyển trang thì đóng popup.

## Phạm vi bản dùng thử
- Bổ sung thiết lập, thao tác mở popup, xem trước và thiệp công khai.
- Thêm trang mừng cưới minh hoạ trong demo Hoa Mộc Xanh và liên kết hộp quà hiện tại để thử trực tiếp. Ảnh QR minh hoạ phải ghi rõ không dùng chuyển tiền.
- Chưa thêm chuyển động hộp quà; đây là phần riêng sau cơ chế popup.
- FE/BE cùng kiểm tra dữ liệu và giữ tương thích thiệp cũ. Không ghi vào cơ sở dữ liệu thật khi kiểm tra.
- Không sửa Miditor, không thêm thư viện và không commit các thay đổi chưa được yêu cầu.

## Các cách đã cân nhắc
1. Hộp QR cố định: không đáp ứng khả năng tự thiết kế nên bỏ.
2. Trang nội dung hiện có được mở dạng popup: lựa chọn người dùng đã đồng ý; dùng lại editor, renderer và khối.
3. Loại trang popup riêng: chưa cần, tránh giới hạn cách tái sử dụng trang.

## Kiểm tra
Roundtrip thiết lập và thao tác qua FE/BE; từ chối giá trị sai; trang cũ và liên kết chuyển trang vẫn hoạt động. Xem popup trên máy tính/điện thoại, cuộn nội dung dài, đóng/mở, focus bàn phím, giảm chuyển động, bảo toàn form và vị trí trang nền. Không làm thay đổi luồng lưu và xuất bản.
