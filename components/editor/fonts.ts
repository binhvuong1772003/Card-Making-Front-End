import { Manrope } from "next/font/google";

// Phông của editor: Manrope, kèm bộ dấu tiếng Việt. `variable` dùng trong `appearance.font`.
export const editorFont = Manrope({ subsets: ["latin", "vietnamese"], variable: "--font-editor", display: "swap" });
