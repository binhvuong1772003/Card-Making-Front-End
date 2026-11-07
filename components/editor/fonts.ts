import { Be_Vietnam_Pro } from "next/font/google";

// Phông của editor: Be Vietnam Pro, thiết kế riêng cho tiếng Việt. `variable` dùng trong `appearance.font`.
export const editorFont = Be_Vietnam_Pro({ subsets: ["latin", "latin-ext", "vietnamese"], weight: ["400", "500", "600", "700"], variable: "--font-editor", display: "swap" });
