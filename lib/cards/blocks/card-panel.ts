import type { ComponentDef } from "@miditor/core";

// Khối "Thẻ thiệp": một khung chứa các khối khác và cắt phần tràn ra ngoài mép (như "frame" của Canva).
// Hoa, hoạ tiết đặt vào thẻ thì bị cắt ở mép thẻ như thiệp gốc, nhưng vẫn là đối tượng riêng: kéo, xoay, đổi độ mờ được.
// Khối không có thuộc tính riêng: màu nền, viền, bo góc, bóng lấy từ nhóm Nền, Viền, Hiệu ứng chung (xem `defaultStyles`).
export const cardPanelBlock: ComponentDef = {
  label: "Thẻ thiệp",
  category: "Khung",
  icon: "shape",
  keywords: ["thẻ", "khung", "frame", "cắt", "hoa", "nền thẻ", "chứa"],
  size: { w: 600, h: 420 },
  canContain: true,
  defaultProps: {},
  fields: {},
  defaultStyles: { background: "#fffaf3", borderRadius: 8, borderWidth: 1, borderColor: "#e8d9cc" },
};
