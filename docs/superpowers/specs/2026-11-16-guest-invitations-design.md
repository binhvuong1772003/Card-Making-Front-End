# Khách mời: link riêng cho từng khách, tên và lời chào riêng

Ngày 16/11/2026. Người dùng đã chốt hướng "bản đầy đủ, giống chungdoi, có trang quản lý khách" trong chat.

## Ý định

Chủ thiệp có một danh sách khách. Mỗi khách có một link riêng; khách mở link thì thiệp hiện đúng tên mình ("Thân mời Anh Nam") và lời chào riêng nếu chủ thiệp có đặt. Tên khách điền sẵn vào form xác nhận tham dự và sổ lưu bút, và chủ thiệp biết khách nào đã mở, đã xác nhận.

Chữ "Thân mời + tên" không gắn cứng vào bìa: là một khối đặt ở bất kỳ trang nào (bìa, thiệp, popup), nhiều khối cũng được.

## Mục tiêu

- Danh sách khách theo thiệp, thêm một hoặc dán nhiều dòng, sửa, xoá, tìm.
- Link riêng mỗi khách, không lộ tên trong đường dẫn, không đoán được.
- Khối "Khách mời" hiện tên, lời chào riêng hoặc lời mời riêng, có chữ dự phòng khi không có khách.
- Form `Form` điền sẵn tên khách và ghi phản hồi theo khách.
- Trang quản lý: sao chép link từng khách, tải danh sách link, xem ai đã mở và đã xác nhận.

## Không làm (lần này)

- Gửi tin qua email, Zalo hay SMS từ hệ thống.
- Nhóm khách, bàn tiệc, số khách đi cùng.
- Giới hạn lượt xem theo khách (chungdoi có `viewLimitExceeded` gắn gói dùng thử; CardMaking chưa có gói).
- Nhập khách từ file Excel (dán nhiều dòng là đủ).

## Điều tránh (anti-goals)

- Tên khách nằm trong link hoặc trong trang HTML công khai không có mã. Không có API công khai nào liệt kê khách.
- Làm hỏng cache của trang công khai: tên khách chỉ được nạp phía trình duyệt sau khi trang tải.

## Cách chungdoi làm (đọc từ mã phía trình duyệt, 16/11)

Mỗi khách có `guestCode`; server đổi ra `guestName`; trang nhận thêm `customGreeting`, `customInviteMessage`. Bìa phong bì nhận cả ba, nút xác nhận tham dự nhận `guestCode` và `guestName`, sổ lưu bút nhận `guestName`. Chủ thiệp có trang `/guests`; đường dẫn `/xem-khach/` là route riêng. Chưa mở được link khách thật nên dạng link của họ là suy đoán.

## Thiết kế

### Dữ liệu (CMBE, Prisma + MongoDB)

Mô hình `Guest`, thuộc Card (không thuộc một bản xuất bản, để một danh sách dùng cho cả 5 bản):

| Trường | Ý nghĩa |
| --- | --- |
| `id`, `cardId` | khoá, quan hệ tới `Card` |
| `code` | mã công khai, duy nhất toàn hệ thống, 8 ký tự base32 bỏ chữ dễ nhầm (0/O, 1/I/L): khoảng 40 bit |
| `name` | tên hiển thị, tối đa 80 ký tự |
| `greeting` | lời chào riêng, không bắt buộc, tối đa 200 |
| `inviteMessage` | lời mời riêng, không bắt buộc, tối đa 400 |
| `openCount`, `firstOpenedAt`, `lastOpenedAt` | theo dõi mở link |
| `createdAt`, `updatedAt` | |

`FormResponse` thêm `guestId` (không bắt buộc, không là quan hệ, để xoá khách không chặn). Giới hạn 500 khách mỗi thiệp, 200 khách mỗi lần thêm hàng loạt.

Module: `src/modules/cards/guests/` (theo mẫu `responses/`: `cards` là nơi duy nhất ghi; có `guests.service.ts`, `guests.routes.ts`, `guests.graphql`, `guests.resolvers.ts`, `guests.schema.ts`).

### API

Công khai (REST, có giới hạn tốc độ, như `responses.routes.ts`):

- `GET /publications/:slug/guest/:code` trả `{ name, greeting, inviteMessage }` của đúng khách đó, hoặc 404 như nhau cho mã sai và mã của thiệp khác.
- `POST /publications/:slug/guest/:code/open` ghi lượt mở; trình duyệt gọi tối đa một lần mỗi phiên (`sessionStorage`).
- `POST /:slug/forms` nhận thêm `guestCode` (không bắt buộc); nếu hợp lệ thì lưu `guestId`.

Chủ thiệp và biên tập viên (GraphQL, như trang Phản hồi; người xem không thấy): `cardGuests(cardId, search, after)`, `addGuests(cardId, entries)`, `updateGuest(id, ...)`, `deleteGuest(id)`; kèm trạng thái "đã xác nhận" lấy từ `FormResponse.guestId`.

### Giao diện (CMFE)

- Link khách: `/thiep/<slug>?g=<mã>`. Trang công khai đọc `g` phía trình duyệt (trong `CardPlayer`/một component client), gọi API công khai, rồi đưa `guest: { name, greeting, inviteMessage }` vào `metadata`. Trang thêm `rel="canonical"` về link không có `g`.
- Khối `GuestText` (nhóm "Thiệp cưới", tên "Khách mời"): thuộc tính `field` (Tên khách / Lời chào riêng / Lời mời riêng), `prefix` ("Thân mời"), `fallback` (chữ khi không có khách; để trống thì ẩn cả khối), phông, cỡ, màu, căn lề. Ở editor, xem thử và ảnh thu nhỏ hiện tên mẫu "Anh Nam".
- `Form`: thuộc tính `fillGuestName` điền sẵn ô tên (ô `nameFieldId` của sổ lưu bút, hoặc ô đầu tiên kiểu chữ ngắn của form xác nhận); gửi kèm `guestCode`.
- Trang `/cards/[id]/guests` (cùng khung với `/cards/[id]/responses`, lối vào ở menu ⋯ và cạnh nút Xuất bản): bảng khách (tên, lời chào, đã mở, số lần, lần cuối, đã xác nhận), ô tìm, thêm một khách, dán nhiều dòng ("Tên" hoặc "Tên | lời chào", mỗi dòng một khách), sửa, xoá có xác nhận, sao chép link từng khách, chọn bản xuất bản để dựng link, tải danh sách `Tên, Link` (CSV).
- Năm mẫu đã làm: bìa đổi "Thân Mời" thành khối Khách mời (chữ dự phòng "Thân Mời").

### Thứ tự làm

1. CMBE: mô hình, service, route công khai, GraphQL cho chủ thiệp, test (Mongo trong bộ nhớ).
2. CMFE: client API, khối `GuestText`, nối `?g=` vào trang công khai.
3. `Form`: điền sẵn tên và `guestCode`; CMBE lưu `guestId`.
4. Trang quản lý khách và lối vào.
5. Đổi bìa năm mẫu dùng khối mới, seed lại.

## Các quyết định của mình (người dùng đọc và sửa)

- Khách thuộc Card, không thuộc bản xuất bản.
- Mã 8 ký tự, link dùng `?g=`, không dùng đường dẫn con (giữ trang `/thiep/[slug]` một route).
- Một khối `GuestText` với ô chọn `field`, không tách ba khối.
- Đọc `g` phía trình duyệt (đổi lại: thoáng thấy chữ dự phòng trước khi tên hiện).
- Giới hạn 500 khách/thiệp, 200 khách/lần thêm.
- Lượt mở ghi một lần mỗi phiên; không tính bot.
- CMBE có tài liệu kiến trúc ở artifact "CMBE system": thêm `cards/guests` là lệch tài liệu, nên cần cập nhật tài liệu đó (mình chưa sửa).

## Để người làm quyết

Màu và bố cục chi tiết của trang quản lý (theo khung đỏ đô của trang Phản hồi); chữ hiển thị của các thông báo lỗi.
