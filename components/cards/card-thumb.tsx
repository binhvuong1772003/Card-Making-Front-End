import { initials } from "@/lib/cards/initials";
import { THUMB_TONE, type Occasion } from "@/lib/cards/occasions";

// Ảnh thu nhỏ tạm của thiệp: ô màu theo dịp với chữ cái đầu tên (chưa có ảnh chụp thiệp).
// Khi có ảnh thật (dựng bằng Render của Miditor) thì thay ở đây, các nơi dùng không đổi.
export function CardThumb({ title, occasion, className }: { title: string; occasion: Occasion; className?: string }) {
  const tone = THUMB_TONE[occasion];
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{ background: tone.bg, color: tone.ink, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.75rem" }}
    >
      {initials(title)}
    </span>
  );
}
