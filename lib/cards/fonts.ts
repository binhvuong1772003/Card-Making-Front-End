import type { FontDef } from "@miditor/editor";

// Chữ người dùng chọn cho thiệp (chữ, nút, khối riêng). Cả mười lăm phông đều có bộ dấu tiếng Việt (đã kiểm khối `/* vietnamese */`
// trong CSS của Google Fonts). Dùng liên kết Google Fonts thường chứ không dùng `next/font`, vì tên họ chữ lưu vào thiệp phải ổn định
// (`next/font` đổi tên thành chuỗi băm), và Miditor chép các thẻ `link` kiểu stylesheet ở `<head>` vào khung canvas.
// `stack` chỉ nhận chữ, số, dấu cách, phẩy, gạch nối và nháy đơn: họ chữ có dấu cách viết `'Playfair Display'`.
export const CARD_FONTS: readonly FontDef[] = [
  { name: "Be Vietnam Pro", stack: "'Be Vietnam Pro', sans-serif", group: "Không chân" },
  { name: "Montserrat", stack: "'Montserrat', sans-serif", group: "Không chân" },
  { name: "Nunito", stack: "'Nunito', sans-serif", group: "Không chân" },
  { name: "Quicksand", stack: "'Quicksand', sans-serif", group: "Không chân" },
  { name: "Josefin Sans", stack: "'Josefin Sans', sans-serif", group: "Không chân" },
  { name: "Cormorant Garamond", stack: "'Cormorant Garamond', serif", group: "Có chân" },
  { name: "Playfair Display", stack: "'Playfair Display', serif", group: "Có chân" },
  { name: "Lora", stack: "'Lora', serif", group: "Có chân" },
  { name: "Viaoda Libre", stack: "'Viaoda Libre', serif", group: "Có chân" },
  { name: "Dancing Script", stack: "'Dancing Script', cursive", group: "Viết tay" },
  { name: "Great Vibes", stack: "'Great Vibes', cursive", group: "Viết tay" },
  { name: "The Nautigal", stack: "'The Nautigal', cursive", group: "Viết tay" },
  { name: "Ms Madi", stack: "'Ms Madi', cursive", group: "Viết tay" },
  { name: "Allura", stack: "'Allura', cursive", group: "Viết tay" },
  { name: "Pacifico", stack: "'Pacifico', cursive", group: "Viết tay" },
  { name: "Carattere", stack: "'Carattere', cursive", group: "Viết tay" },
  { name: "Pinyon Script", stack: "'Pinyon Script', cursive", group: "Viết tay" },
  { name: "Beau Rivage", stack: "'Beau Rivage', cursive", group: "Viết tay" },
  { name: "Alex Brush", stack: "'Alex Brush', cursive", group: "Viết tay" },
  { name: "Patrick Hand", stack: "'Patrick Hand', cursive", group: "Viết tay" },
  { name: "Bungee", stack: "'Bungee', system-ui, sans-serif", group: "Trang trí" },
  { name: "EB Garamond", stack: "'EB Garamond', serif", group: "Có chân" },
];

// Một yêu cầu cho cả mười lăm họ chữ; trình duyệt chỉ tải phần (latin, vietnamese...) mà chữ trên trang cần.
export const CARD_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Nunito:wght@400;600;700&family=Quicksand:wght@400;600;700&family=Josefin+Sans:wght@400;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Lora:wght@400;500;600;700&family=Viaoda+Libre&family=Dancing+Script:wght@400;600;700&family=Great+Vibes&family=The+Nautigal:wght@400;700&family=Ms+Madi&family=Pacifico&family=Allura&family=Carattere&family=Pinyon+Script&family=Beau+Rivage&family=Alex+Brush&family=Patrick+Hand&family=Bungee&family=EB+Garamond&display=swap";
