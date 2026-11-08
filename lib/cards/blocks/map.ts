import type { ComponentDef } from "@miditor/core";

// Khối Bản đồ: Google Maps nhúng thường (Maps Embed API), kèm tiêu đề, tên địa điểm, địa chỉ và nút Chỉ đường (mỗi thứ tắt được). Nền, viền,
// bo góc, bóng, độ nghiêng KHÔNG phải thuộc tính của khối: dùng các nhóm Nền, Viền, Hiệu ứng có sẵn của Miditor cho mọi khối; khối mang theo
// viền mảnh mặc định qua `defaultStyles`, và công tắc "Viền trong" vẽ thêm một đường mảnh bên trong để thành khung đôi.
// Dữ liệu thuần, không có React: CMBE nhận bản sinh ra từ đây (`npm run blocks:export`), không chép tay.
// Thuộc tính đã bỏ (trước đây là khung riêng): thiệp đã lưu có thể còn giữ chúng, CMBE bỏ chúng khi kiểm trang.
export const RETIRED_MAP_PROPS = ["borderStyle", "borderWidth", "borderColor", "radius", "filled", "fill", "shadow", "tilt", "tape"] as const;

export const mapBlock: ComponentDef = {
  label: "Bản đồ",
  category: "Thiệp cưới",
  icon: "grid",
  keywords: ["bản đồ", "map", "địa điểm", "google", "chỉ đường"],
  size: { w: 380, h: 440 },
  canContain: false,
  defaultProps: {
    name: "",
    address: "",
    showText: true,
    zoom: 16,
    heading: "Địa điểm",
    divider: true,
    button: "Chỉ đường",
    color: "#511419",
    innerFrame: true,
    padding: 14,
  },
  defaultStyles: { borderWidth: 1, borderColor: "#511419", borderRadius: 4 },
  fields: {
    name: { type: "text", label: "Tên địa điểm", maxLength: 120, group: "Địa điểm" },
    address: { type: "text", label: "Địa chỉ", maxLength: 300, multiline: true, group: "Địa điểm" },
    showText: { type: "boolean", label: "Tên, địa chỉ", group: "Địa điểm", help: "Tắt thì chỉ còn bản đồ; tên và địa chỉ vẫn dùng để tìm vị trí." },
    zoom: { type: "number", label: "Phóng", min: 10, max: 20, group: "Địa điểm", help: "Độ phóng của bản đồ, từ 10 đến 20." },
    heading: { type: "text", label: "Tiêu đề", maxLength: 60, group: "Chữ và nút", help: "Để trống thì ẩn." },
    button: { type: "text", label: "Chữ nút", maxLength: 40, group: "Chữ và nút", help: "Để trống thì ẩn nút Chỉ đường." },
    divider: { type: "boolean", label: "Đường kẻ tim", group: "Chữ và nút", help: "Đường kẻ có trái tim dưới tiêu đề." },
    innerFrame: { type: "boolean", label: "Viền trong", group: "Chữ và nút", help: "Một đường mảnh nằm trong khối, tạo khung đôi khi khối đã có viền ngoài." },
    color: { type: "color", label: "Màu chữ và nút", group: "Chữ và nút" },
    padding: { type: "number", label: "Đệm", min: 0, max: 40, unit: "px", group: "Chữ và nút", help: "Khoảng đệm giữa mép khối và bản đồ." },
  },
};
