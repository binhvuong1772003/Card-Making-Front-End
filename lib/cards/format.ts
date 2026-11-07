const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

// Thời điểm sửa gần nhất, viết ngắn cho thẻ thiệp: "Vừa sửa", "Sửa 5 phút trước", "Sửa hôm qua", "Sửa 12/10".
// `now` truyền vào để kiểm thử; thời điểm ở tương lai (lệch đồng hồ) coi như vừa sửa.
export function formatEdited(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diff = now.getTime() - then.getTime();
  if (diff < MIN) return "Vừa sửa";
  if (diff < HOUR) return `Sửa ${Math.floor(diff / MIN)} phút trước`;
  if (diff < DAY) return `Sửa ${Math.floor(diff / HOUR)} giờ trước`;
  if (diff < 2 * DAY) return "Sửa hôm qua";
  if (diff < 7 * DAY) return `Sửa ${Math.floor(diff / DAY)} ngày trước`;
  const day = String(then.getDate()).padStart(2, "0");
  const month = String(then.getMonth() + 1).padStart(2, "0");
  return `Sửa ${day}/${month}`;
}
