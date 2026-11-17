# Thiệp nhiều trang — thiết kế đề xuất

Ngày: 2026-11-09. Trạng thái: đã triển khai; bằng chứng kiểm tra trong ../plans/2026-11-09-multipage-cards-verification.md.

> Lịch sử tương tác hiện dùng custom field riêng của CardMaking và Undo/Redo chuẩn của Miditor. Cơ chế checkpoint/snapshot liên kết bên ngoài đã được thay bằng [thiết kế giữ Miditor trung lập](../plans/2026-11-09-neutral-editor.md); định dạng lưu bên dưới giữ nguyên.

## Trải nghiệm người dùng

Một thiệp có nhiều trang ngang hàng. Người dùng có thể dùng trang đầu làm phong bì, lời chào, ảnh hoặc bất kỳ nội dung nào; hệ thống không gán vai trò bìa cố định. Mỗi trang tiếp tục hỗ trợ bố cục máy tính và điện thoại, chiều dài riêng, các khối hiện có và kéo thả hiện tại. Một thiệp một trang dài vẫn hoạt động. Trang mới bắt đầu với minHeight 640 px trên máy tính và phoneMinHeight 812 px; người dùng tiếp tục chỉnh chiều cao riêng.

Trong editor, mục **Trang** mở danh sách thumbnail, tên trang và dấu trang bắt đầu. Người dùng thêm, nhân bản, đổi tên, kéo sắp xếp, xóa và chọn trang đang sửa. Danh sách trang tách khỏi danh sách lớp của trang hiện tại. Chuyển trang phải lưu cả nội dung đang gõ, không mất lịch sử sửa của từng trang.

Chọn một thành phần rồi mở **Tương tác → Chuyển đến trang**: chọn trang đích, hiệu ứng và thời lượng. Khi thiết kế, bấm thành phần vẫn để chọn/sửa; chỉ chạy điều hướng trong **Xem trước** và thiệp xuất bản. Cho phép text, ảnh, shape, button và nhóm không chứa điều khiển biểu mẫu. Không chiếm thao tác nhập/gửi form hoặc các điều khiển tương tác lồng bên trong.

Thiệp xuất bản vẫn có một URL. Mở URL vào trang bắt đầu; bấm thành phần có liên kết sẽ đổi trang tại chỗ. Nút Back/Forward của trình duyệt quay theo lịch sử vừa xem; tải lại mở lại trang bắt đầu. Có thể tạo nhánh và quay về trang trước bằng liên kết do người thiết kế đặt.

Ví dụ: trang 1 là ảnh và nút “Mở thiệp” → trang 2 là nội dung cưới → nút “Gửi lời chúc” mở trang 3. Đây chỉ là mẫu sử dụng, không phải cấu trúc bắt buộc.

## Dữ liệu

CardMaking quản lý vỏ document; mỗi trang giữ nguyên `PageData` của Miditor. Không đổi `@miditor/core` thành bộ quản lý nhiều trang.

```ts
type PageTransition = "none" | "fade" | "slide-left" | "slide-right" | "slide-up" | "zoom";
type PageNavigation = {
  type: "go-to-page";
  targetPageId: string;
  transition: PageTransition;
  durationMs: number;
};
type CardPage = {
  id: string;
  name: string;
  data: PageData;
  interactions: Record<string, PageNavigation>; // khóa là node.id trong trang
};
type CardDocument = {
  kind: "card";
  version: 1;
  startPageId: string;
  pages: CardPage[];
};
```

`version` là phiên bản vỏ thiệp; `PageData.schemaVersion` giữ ý nghĩa hiện tại. Node ID chỉ cần duy nhất trong một trang. Form ID phải duy nhất trong toàn thiệp, vì phản hồi hiện được nhận theo form ID.

Các giới hạn đề xuất cho lần đầu: 1–50 trang; tên sau khi trim dài 1–80 ký tự; page ID khớp `^[A-Za-z0-9_-]{1,40}$`; tổng document tối đa 800 KiB như hiện tại. Hiệu ứng mặc định `fade`, 450 ms; thời lượng hiệu ứng 100–1200 ms, riêng `none` là 0 ms. Không thêm thư viện hoạt ảnh.

BE kiểm tra toàn bộ trang, ID trùng, trang bắt đầu, nguồn/đích liên kết, hiệu ứng và form ID. Liên kết vòng được phép; liên kết đến chính trang là thao tác không đổi trang. Trang không đi tới được từ trang bắt đầu chỉ cảnh báo khi xuất bản, vì có thể được giữ làm phương án khác.

## Tương thích và tính toàn vẹn

- Thiệp cũ `PageData` được bọc thành một trang ID ổn định `page-1`; document rỗng tạo một trang trống theo cấu hình hiện tại. Không chuyển đổi hàng loạt database; ghi định dạng mới ở lần người dùng lưu tiếp theo.
- Bản xuất bản cũ tiếp tục xem được. Lưu, nhân bản thiệp, template, ảnh thumbnail, khôi phục phiên bản xuất bản và dọn tài nguyên phải hiểu toàn bộ document. Phiên bản xuất bản và trang thiết kế là hai khái niệm riêng.
- Không cho client cũ ghi một `PageData` đè lên thiệp đã có vỏ nhiều trang. Trả lỗi yêu cầu tải lại; không làm mất các trang còn lại.
- Thêm/nhân bản form hoặc nhân bản trang tạo form ID mới. Form cũ giữ khóa đang có phản hồi; sắp xếp trang không đổi khóa. BE từ chối form ID trùng trong vỏ mới, không âm thầm đổi ID mà FE không biết.
- Nhân bản trang giữ node ID theo phạm vi trang; liên kết về chính trang gốc chuyển về bản sao, liên kết khác giữ đích. Chọn trang bắt đầu khác không đổi thứ tự.
- Không xóa trang cuối. Xóa trang có liên kết trỏ tới cần hộp xác nhận nêu số liên kết bị gỡ. Nếu xóa trang bắt đầu, chọn trang còn lại gần vị trí đó. Có **Hoàn tác** khôi phục trang, liên kết và trang bắt đầu.
- Undo/redo nội dung theo từng trang. Metadata tương tác lưu theo snapshot lịch sử của trang để xóa/undo node không làm mất liên kết hoặc gắn liên kết nhầm vào ID được tái sử dụng. Thay đổi tương tác có bước undo riêng trong cùng lịch sử trang.
- Một hàng đợi lưu cho toàn thiệp, dùng revision hiện có; callback trễ của trang cũ không được ghi vào trang mới. Xem trước/xuất bản phải flush nội dung đang gõ và chờ lưu xong; lỗi lưu giữ bản sửa tại editor và chặn xuất bản dữ liệu cũ.

## Runtime và khả năng sử dụng

- Xem trước và xuất bản dùng chung một bộ chạy trang. HTML ban đầu hiển thị trang bắt đầu để không trắng lúc tải.
- Chỉ mount trang đang xem và trang đang thoát trong thời gian hoạt ảnh. Các lần bấm tiếp khi đang chuyển bị bỏ qua; kết thúc/cancel luôn trả runtime về trạng thái có thể thao tác.
- `prefers-reduced-motion` bỏ hoạt ảnh. Trang thoát không nhận focus/click và bị ẩn khỏi trình đọc màn hình. Khi xong, focus vùng trang mới không gây cuộn ngoài ý muốn.
- Chuyển tới trang mới cuộn lên đầu. Back/Forward khôi phục vị trí cuộn đã ghi cho trang đó. Merge trường điều hướng riêng vào `history.state`, giữ state Next.js; không push lại khi xử lý popstate.
- Giữ dữ liệu form chưa gửi trong bộ nhớ theo form ID khi rời trang và quay lại. Điều hướng không tự gửi form. Trạng thái đã gửi theo cơ chế hiện tại vẫn được giữ.
- Thành phần điều hướng dùng được bằng bàn phím, có tên truy cập. Không tạo button lồng button; binding điều hướng của node có ưu tiên rõ ràng với href/action sẵn có trên chính button đó.
- Giữ căn giữa và tỷ lệ điện thoại đã sửa; trang dài/ngắn chuyển nhau không gây tràn ngang hoặc để lộ trang sau. Không mount đồng thời tất cả bản đồ, album và form của 50 trang.

## Phạm vi lần đầu

Bao gồm quản lý trang, tương tác đến trang bất kỳ, sáu hiệu ứng, xem trước/xuất bản và tương thích dữ liệu cũ. Chưa gồm nhạc, tự chuyển theo thời gian, hiệu ứng phong bì 3D, điều kiện phân nhánh theo câu trả lời, URL riêng từng trang hoặc mã JavaScript do người dùng nhập.

## Tiêu chí nghiệm thu

1. Tạo thiệp ba trang, sắp xếp/nhân bản, chọn trang bắt đầu, gắn hai nút chuyển trang; lưu và tải lại giữ nguyên.
2. Gõ nội dung rồi đổi trang ngay; quay lại không mất chữ; undo/redo không ảnh hưởng trang khác.
3. Xem trước và link công khai có cùng trang bắt đầu, liên kết, hiệu ứng và bố cục desktop/mobile.
4. Form các trang không lẫn phản hồi; câu trả lời đang nhập còn nguyên khi quay lại.
5. Thiệp cũ, template, khôi phục phiên bản và ảnh ở trang thứ hai trở đi đều hoạt động.
6. Không có thao tác chuyển trang khi đang chọn/sửa trong editor; runtime dùng được bằng bàn phím và chế độ giảm chuyển động.
