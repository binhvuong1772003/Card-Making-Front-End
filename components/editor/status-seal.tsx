import { initials } from "@/lib/cards/initials";

export type SealState = "saved" | "pending" | "error";

// Con dấu trạng thái của thiệp (điểm nhấn của khung): đã lưu = viền đỏ đô, đang lưu hoặc chưa lưu = viền đứt, lỗi = viền đỏ báo lỗi.
// Chỉ là hình; chữ trạng thái do chính Miditor đọc ra qua `status`, nên con dấu có nhãn riêng cho trình đọc màn hình.
export function StatusSeal({ title, state, label }: { title: string; state: SealState; label: string }) {
  const color = state === "error" ? "var(--miditor-danger)" : state === "pending" ? "var(--miditor-muted)" : "var(--miditor-accent)";
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      style={{
        flex: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 30,
        boxSizing: "border-box",
        border: `1.5px ${state === "pending" ? "dashed" : "solid"} ${color}`,
        borderRadius: 9,
        color,
        transform: state === "saved" ? "rotate(-2deg)" : undefined,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.02em",
      }}
    >
      {initials(title)}
    </span>
  );
}
