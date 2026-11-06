import type { Appearance } from "@miditor/editor";

// Giao diện của editor (bản vẽ F: trắng và đỏ đô, dáng mềm). Đúng các tên màu của `appearance` trong Miditor.
// Chữ là xám than ấm, đỏ đô chỉ ở nút chính, mục đang chọn, con dấu và mảng tô icon.
export const cardAppearance: Appearance = {
  scheme: "light",
  colors: {
    chrome: "#FFFFFF",
    workspace: "#F6F1F2",
    canvas: "#FFFFFF",
    soft: "#F8F2F3",
    border: "#ECE3E5",
    borderInput: "#D9CDD0",
    text: "#2A2224",
    muted: "#6E6063",
    focus: "#2F6BFF",
    danger: "#B3261E",
    accent: "#7B1E2B",
    onAccent: "#FFFFFF",
  },
  radius: "8px",
  radiusCard: "12px",
  // Biến do next/font đặt ở khung bao ngoài trang soạn thiệp (Manrope, có bộ dấu tiếng Việt).
  font: "var(--font-editor), system-ui, sans-serif",
};
