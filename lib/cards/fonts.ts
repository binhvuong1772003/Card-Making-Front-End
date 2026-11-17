import type { FontDef } from "@miditor/editor";
import sourceFonts from "./source-fonts.json";

// Chữ người dùng chọn cho thiệp (chữ, nút, khối riêng). Dùng liên kết Google Fonts thường chứ không dùng `next/font`, vì tên họ chữ lưu vào thiệp phải ổn định
// (`next/font` đổi tên thành chuỗi băm), và Miditor chép các thẻ `link` kiểu stylesheet ở `<head>` vào khung canvas.
// `stack` chỉ nhận chữ, số, dấu cách, phẩy, gạch nối và nháy đơn: họ chữ có dấu cách viết `'Playfair Display'`.
export const CARD_FONTS: readonly FontDef[] = [
  ...sourceFonts,
  { name: "Be Vietnam Pro", stack: "'Be Vietnam Pro', sans-serif", group: "Không chân" },
  { name: "Montserrat", stack: "'Montserrat', sans-serif", group: "Không chân" },
  { name: "Nunito", stack: "'Nunito', sans-serif", group: "Không chân" },
  { name: "Quicksand", stack: "'Quicksand', sans-serif", group: "Không chân" },
  { name: "Josefin Sans", stack: "'Josefin Sans', sans-serif", group: "Không chân" },
  { name: "Avenir Next", stack: "'Avenir Next', sans-serif", group: "Không chân" },
  { name: "Cormorant Garamond", stack: "'Cormorant Garamond', serif", group: "Có chân" },
  { name: "EB Garamond", stack: "'EB Garamond', serif", group: "Có chân" },
  { name: "Baskerville", stack: "'Baskerville', 'Libre Baskerville', 'Times New Roman', serif", group: "Có chân" },
  { name: "Big Caslon", stack: "'Big Caslon', Baskerville, 'Times New Roman', serif", group: "Có chân" },
  { name: "Times New Roman", stack: "'Times New Roman', 'Baskerville', serif", group: "Có chân" },
  { name: "Playfair Display", stack: "'Playfair Display', serif", group: "Có chân" },
  { name: "Lora", stack: "'Lora', serif", group: "Có chân" },
  { name: "Fraunces Soft", stack: "'Fraunces Soft', serif", group: "Có chân" },
  { name: "Carattere", stack: "'Carattere', cursive", group: "Viết tay" },
  { name: "Ms Madi Ampersand", stack: "'Ms Madi Ampersand', cursive", group: "Viết tay" },
  { name: "Pattaya", stack: "'Pattaya', cursive", group: "Viết tay" },
  { name: "Viaoda Libre", stack: "'Viaoda Libre', serif", group: "Có chân" },
  { name: "Dancing Script", stack: "'Dancing Script', cursive", group: "Viết tay" },
  { name: "Great Vibes", stack: "'Great Vibes', cursive", group: "Viết tay" },
  { name: "The Nautigal", stack: "'The Nautigal', cursive", group: "Viết tay" },
  { name: "Ms Madi", stack: "'Ms Madi', cursive", group: "Viết tay" },
  { name: "Pinyon Script", stack: "'Pinyon Script', cursive", group: "Viết tay" },
  { name: "Beau Rivage", stack: "'Beau Rivage', cursive", group: "Viết tay" },
  { name: "Alex Brush", stack: "'Alex Brush', cursive", group: "Viết tay" },
  { name: "Bungee", stack: "'Bungee', system-ui, sans-serif", group: "Trang trí" },
  { name: "Patrick Hand", stack: "'Patrick Hand', cursive", group: "Viết tay" },
  { name: "Allura", stack: "'Allura', cursive", group: "Viết tay" },
  { name: "Pacifico", stack: "'Pacifico', cursive", group: "Viết tay" },
];

// Baskerville ưu tiên font hệ thống theo mẫu, rồi dùng Libre Baskerville nếu máy không có font đó.
export const CARD_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Nunito:wght@400;600;700&family=Quicksand:wght@400;600;700&family=Josefin+Sans:wght@400;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=EB+Garamond:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Playfair+Display:wght@400;500;600;700&family=Lora:wght@400;500;600;700&family=Viaoda+Libre&family=Dancing+Script:wght@400;600;700&family=Great+Vibes&family=The+Nautigal:wght@400;700&family=Ms+Madi&family=Alex+Brush&family=Bungee&family=Patrick+Hand&family=Pinyon+Script&family=Beau+Rivage&family=Pacifico&family=Allura&family=Pattaya&display=swap";
