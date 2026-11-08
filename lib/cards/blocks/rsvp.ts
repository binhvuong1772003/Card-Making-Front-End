import type { ComponentDef } from "@miditor/core";

// Khối Xác nhận tham dự: khách điền tên, chọn Có / Không đến / Chưa chắc, tuỳ chọn số khách, điện thoại, lời nhắn. Cấu hình của form nằm
// trong chính khối này và đi theo BẢN ĐÃ XUẤT BẢN: CMBE (`responses.config.ts`) đọc hạn, số khách tối đa và các câu hỏi từ đó, không tin
// khách. Tên loại khối và tên thuộc tính là hợp đồng với backend: đổi bên nào phải đổi bên kia.
// Dữ liệu thuần, không có React: CMBE nhận bản sinh ra từ đây (`npm run blocks:export`), không chép tay.
// Nền, viền, bo góc, bóng KHÔNG phải thuộc tính của khối: dùng các nhóm Nền, Viền, Hiệu ứng có sẵn của Miditor cho mọi khối; khối mang
// theo viền mảnh mặc định qua `defaultStyles`.
export const rsvpBlock: ComponentDef = {
  label: "Xác nhận tham dự",
  category: "Thiệp cưới",
  icon: "heart",
  keywords: ["xác nhận", "rsvp", "tham dự", "mời", "khách", "đến"],
  size: { w: 380, h: 560 },
  canContain: false,
  defaultProps: {
    heading: "Bạn sẽ đến chứ?",
    intro: "Cô dâu chú rể rất mong có bạn.",
    button: "Gửi xác nhận",
    askGuests: true,
    askPhone: false,
    askNote: true,
    askMaybe: true,
    deadline: "",
    maxGuests: 4,
    color: "#511419",
    padding: 16,
  },
  defaultStyles: { borderWidth: 1, borderColor: "#511419", borderRadius: 4 },
  fields: {
    heading: { type: "text", label: "Tiêu đề", maxLength: 80, group: "Nội dung" },
    intro: { type: "text", label: "Lời mời", maxLength: 300, multiline: true, group: "Nội dung", help: "Để trống thì ẩn." },
    button: { type: "text", label: "Chữ nút", maxLength: 40, group: "Nội dung" },
    askGuests: { type: "boolean", label: "Hỏi số khách", group: "Câu hỏi", help: "Chỉ hỏi khi khách chọn Có." },
    askPhone: { type: "boolean", label: "Hỏi điện thoại", group: "Câu hỏi", help: "Chỉ hỏi khi khách chọn Có hoặc Chưa chắc." },
    askNote: { type: "boolean", label: "Hỏi lời nhắn", group: "Câu hỏi" },
    askMaybe: { type: "boolean", label: "Có “Chưa chắc”", group: "Câu hỏi", help: "Tắt thì khách chỉ chọn được Có hoặc Không đến." },
    deadline: { type: "custom", kind: "date", label: "Hạn xác nhận", group: "Hạn và giới hạn", help: "Form đóng sau hết ngày này theo giờ Việt Nam. Để trống thì không có hạn." },
    maxGuests: { type: "number", label: "Khách", min: 1, max: 20, group: "Hạn và giới hạn", help: "Số khách tối đa mỗi lần gửi, tính cả người điền." },
    color: { type: "color", label: "Màu chữ và nút", group: "Giao diện" },
    padding: { type: "number", label: "Đệm", min: 0, max: 40, unit: "px", group: "Giao diện" },
  },
};
