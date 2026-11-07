import { cn } from "@/lib/utils";
import { initials } from "@/lib/cards/initials";

export type SealState = "saved" | "pending" | "error";

// Con dấu trạng thái của thiệp (điểm nhấn của khung): đã lưu = viền đỏ đô, đang lưu hoặc chưa lưu = viền đứt, lỗi = viền đỏ báo lỗi.
// Chỉ là hình; chữ trạng thái do chính Miditor đọc ra qua `status`, nên con dấu có nhãn riêng cho trình đọc màn hình.
export function StatusSeal({ title, state, label }: { title: string; state: SealState; label: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-[30px] flex-none items-center justify-center rounded-[9px] border-[1.5px] text-[11px] font-bold tracking-wide",
        state === "error" && "border-destructive text-destructive",
        state === "pending" && "border-dashed border-muted-foreground text-muted-foreground",
        state === "saved" && "-rotate-2 border-primary text-primary",
      )}
    >
      {initials(title)}
    </span>
  );
}
