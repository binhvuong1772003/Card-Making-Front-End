# Kế hoạch code: thư viện thiệp, xuất bản, thư viện công khai, admin

Bản thiết kế: bảng Design (https://claude.ai/artifact/1G5j6ijo1mV4gfzkzbGous), các bản G đến M. Trạng thái: kế hoạch và bốn quyết định đã được duyệt (2026-11-07); tài liệu "CMBE system" đã sửa cho khớp; đang code từ bước 0.

## Hiện trạng (đã kiểm trong mã)

- CMBE đã có model `Publication` (slug, bản chụp) và `Template` (bản chụp đóng băng để dùng làm mẫu, `status` PUBLISHED, UNLISTED, REMOVED, `useCount`, `category`, `tags`). Thiết kế gốc: dùng mẫu = tạo Card mới từ snapshot, từ đó hai bên độc lập.
- Thư mục `modules/publications` và `cards/publishing` chỉ là khung rỗng (một dòng chú thích). Chưa có xuất bản, chưa có thư viện, chưa có admin.
- `Card` chưa có trường dịp (cưới, sinh nhật, sự kiện), `User` chưa có vai trò admin, `TemplateStatus` chưa có chờ duyệt và từ chối.
- CMFE: `/` là trang chủ mẫu, `/cards/[id]` là editor. Chưa có `/cards`, chưa dùng Phosphor ngoài editor, ảnh thu nhỏ của thiệp chỉ là chữ cái đầu.

## Thay đổi cần sửa tài liệu "CMBE system" trước (quy tắc của CMBE: sửa tài liệu rồi hỏi)

1. `TemplateStatus` thêm `PENDING`, `REJECTED`; `Template` thêm `rejectReason`, `reviewedAt`, `reviewedById`.
2. `User.role` (`USER` | `ADMIN`).
3. `Card.occasion` (`WEDDING` | `BIRTHDAY` | `EVENT` | `OTHER`), gán lúc tạo thiệp từ ô chọn dịp.
4. `Publication.listInGallery` (bật "Hiện trong thư viện công khai").

## Quyết định (đã duyệt)

- **Ảnh khi dùng làm mẫu:** lúc admin duyệt, sao chép ảnh của thiệp sang thư mục dùng chung `cardmaking/templates/<templateId>` (một lần, phía backend, cần secret). Bản chụp của mẫu trỏ vào thư mục này; người dùng mẫu giữ nguyên địa chỉ đó. Sau này job dọn ảnh coi thư mục này là được bảo vệ. Không phải sao chép ảnh mỗi lần dùng.
- **Sửa sau khi được duyệt:** bản đang hiện giữ nguyên; xuất bản lại với công tắc bật tạo một bản chụp mới ở trạng thái chờ duyệt (`version` + 1). Duyệt xong thì thay bản đang hiện.
- **Ảnh thu nhỏ:** bản đầu dựng thu nhỏ bằng `Render` của Miditor (phần đầu trang, có lười tải), chưa sinh ảnh; ảnh thật làm sau nếu chậm.
- **Admin:** cột `User.role`, đặt qua script cấp quyền (đọc `ADMIN_EMAILS` lúc chạy script), không có giao diện cấp quyền.

## Các bước (mỗi bước một nhánh, kiểm thử trước khi gộp)

0. **[xong] Nền chung (CMFE).** Cài `@phosphor-icons/react`, đổi `iconLibrary` của shadcn; gom token mềm (bo góc 12 đến 28, bóng nhẹ) thành lớp dùng chung cho các trang ngoài editor; khung chung (cột trái, đầu trang có ô tìm) dùng cho `/`, `/cards`, thư viện.
1. **[xong] Trang quản lý thiệp `/cards` (bản G, H).** Backend: `Card.occasion`, truy vấn danh sách có trạng thái xuất bản, tìm theo tên, lọc theo dịp; `duplicateCard`. Frontend: lưới và danh sách, chip lọc, menu ⋯, đổi tên, xoá có xác nhận. Ô chọn dịp ở trang chủ tạo thiệp kèm dịp.
2. **[xong] Xuất bản và xem trước (bản K, một phần).** Backend: `publishCard` (slug duy nhất, bản chụp), `unpublishCard`, kiểm slug. Frontend: hộp thoại xuất bản, nút Xem trước, trang công khai `/thiep/[slug]` dựng phía server bằng `Render`, con dấu "đã xuất bản" ở editor.
3. **[xong] Thư viện công khai, phần backend.** Gửi duyệt (từ xuất bản có bật công tắc), danh sách mẫu đã duyệt theo loại có phân trang con trỏ, `useTemplate` (tạo Card từ bản chụp, `sourceTemplateId`, `useCount`), sao chép ảnh sang thư mục mẫu lúc duyệt, vai trò admin, duyệt và từ chối kèm lý do.
4. **[xong] Trang chủ, loại thiệp, xem một thiệp (bản I, J, L), công tắc thư viện trong hộp thoại xuất bản, chọn dịp khi tạo.** Frontend: khám phá theo loại, các kệ, trang loại có lọc phong cách (cần nhãn `tags`, hoặc bỏ hàng này), hộp xem thiệp, Dùng làm mẫu.
5. **[xong] Trang admin (bản M).** Hàng chờ, chi tiết, Duyệt, Từ chối kèm lý do, Gỡ khỏi thư viện.
6. **[xong, trừ hạn mức ảnh theo người dùng] Củng cố.** Kiểm tra `PageData` phía server (`@miditor/core`), giới hạn tải ảnh và dọn ảnh mồ côi (đã hoãn), giới hạn tốc độ cho các endpoint mới, kiểm thử luồng đầy đủ (xuất bản, gửi duyệt, duyệt, dùng làm mẫu).

## Ngoài phạm vi lần này

Gợi ý theo thuật toán; thêm loại thiệp ngoài ba dịp; cộng tác thời gian thực; thùng rác; chia sẻ cho người khác (đã có model, chưa có giao diện).
