# 10 mẫu nội dung tiếp theo – thiết kế phạm vi

Yêu cầu người dùng: tìm thêm 10 mẫu, viết kế hoạch rồi tự thực hiện giống đợt vừa làm.
Lấy đúng vị trí 11–20 của listing đã đọc từ Chrome profile hiện hữu; manifest đóng băng URL/title/order.
Dựng từng trang nội dung tĩnh bằng native blocks CardMaking; giữ ảnh, chữ, panel, artwork tách và chỉnh được.
Đọc DOM desktop/mobile riêng, kiểm đúng URL/viewport, dùng asset nguồn, ghi mapping và kiểm local.
Không lấy makeDocument/đổi palette làm clone; không flatten toàn thiệp. Không sao chép QR/ngân hàng, tracker hoặc tự bật nhạc.

## Cách thực hiện

Tái sử dụng compiler document và phương pháp đo đã có, nhưng mỗi mẫu có hồ sơ/số đo/asset riêng.
Không copy layout mẫu trước. Đọc số đo thay vì nhìn thumbnail để đoán. Không cần tạo editor/renderer mới hay đổi Miditor.
Đợt này tạo 10 draft nội dung để đối chiếu; thiếu UI/renderer ghi element và tác động, không nhận là hoàn thiện.
Bìa/popup/motion nằm ngoài phạm vi như đợt trước. Catalog/snapshot chỉ ghi khi đạt gate hiện có, không chạy seed xuất bản mặc định.

## Lựa chọn và quyết định

- Phương án chọn: giữ pipeline native + measured DOM. Phù hợp yêu cầu “giống vừa làm”, tận dụng renderer/UI hiện có.
- Không chọn ảnh nguyên trang: không sửa được chữ/ảnh/form. Không chọn seed generic: không có bằng chứng giống nguồn.
- Tự thực hiện trong phiên theo chỉ dẫn người dùng, không dừng hỏi lại để duyệt bước thường lệ; không agent-team, commit/push/publish.
- Giữ mọi thay đổi đang có và các template cũ, kể cả bản được phiên khác tích hợp bìa/popup.

## Tiêu chí trạng thái

Đã đo: có URL, XPath, geometry/layout size/transform chain, typography, lớp/clip/background/pseudo, asset và viewport.
Đã dựng: có export content-only và route dùng cùng export; native Album/Calendar/Map/Form/DressCode; asset local đọc được.
Đã kiểm cấu trúc: isPageData + validatePage + asset-path validation + TypeScript qua.
Đã đối chiếu: có DOM local cùng viewport và bảng sai khác, ảnh đối chiếu khi cần.
Chỉ gọi hoàn thiện khi visual/editor/catalog/save-reopen phù hợp scope thật sự đạt; nếu không, ghi draft và các giới hạn.
