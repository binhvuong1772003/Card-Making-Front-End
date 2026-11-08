import type { ComponentDef } from "@miditor/core";

// Khối Sổ lưu bút: khách gửi lời chúc, các lời chúc đang hiện nằm ngay dưới form. Có thể bật duyệt trước: lời chúc mới chờ chủ thiệp duyệt
// mới hiện. CMBE (`responses.config.ts`) đọc công tắc duyệt từ BẢN ĐÃ XUẤT BẢN, không tin khách. Tên loại khối và tên thuộc tính là hợp
// đồng với backend: đổi bên nào phải đổi bên kia.
// Dữ liệu thuần, không có React: CMBE nhận bản sinh ra từ đây (`npm run blocks:export`), không chép tay.
// Nền, viền, bo góc, bóng KHÔNG phải thuộc tính của khối: dùng các nhóm Nền, Viền, Hiệu ứng có sẵn của Miditor cho mọi khối; khối mang
// theo viền mảnh mặc định qua `defaultStyles`.
export const guestbookBlock: ComponentDef = {
  label: "Sổ lưu bút",
  category: "Thiệp cưới",
  icon: "text",
  keywords: ["lưu bút", "guestbook", "lời chúc", "chúc mừng", "sổ"],
  size: { w: 380, h: 640 },
  canContain: false,
  defaultProps: {
    heading: "Sổ lưu bút",
    intro: "Gửi vài dòng chúc mừng. Lời chúc hiện công khai trên thiệp cho mọi người cùng đọc.",
    button: "Gửi lời chúc",
    moderation: false,
    pageSize: 5,
    color: "#511419",
    padding: 16,
  },
  defaultStyles: { borderWidth: 1, borderColor: "#511419", borderRadius: 4 },
  fields: {
    heading: { type: "text", label: "Tiêu đề", maxLength: 80, group: "Nội dung" },
    intro: { type: "text", label: "Lời dẫn", maxLength: 300, multiline: true, group: "Nội dung", help: "Để trống thì ẩn." },
    button: { type: "text", label: "Chữ nút", maxLength: 40, group: "Nội dung" },
    moderation: { type: "boolean", label: "Duyệt trước", group: "Duyệt", help: "Bật thì lời chúc mới chờ chủ thiệp duyệt mới hiện." },
    pageSize: { type: "number", label: "Số lời", min: 3, max: 20, group: "Duyệt", help: "Số lời chúc mỗi lần tải." },
    color: { type: "color", label: "Màu chữ và nút", group: "Giao diện" },
    padding: { type: "number", label: "Đệm", min: 0, max: 40, unit: "px", group: "Giao diện" },
  },
};
