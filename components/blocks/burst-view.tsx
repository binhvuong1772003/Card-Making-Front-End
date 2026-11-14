import type { BurstConfig } from "@/lib/cards/blocks/burst";

// Khối Pháo không vẽ gì trên trang thật (trình phát tự bắn khi mở thiệp); trong editor chỉ hiện một nhãn nét đứt để tìm thấy và chọn được.
export function BurstView({ config, editing }: { config: BurstConfig; editing: boolean }) {
  if (!editing) return null;
  return (
    <div style={{ width: "100%", height: "100%", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: "1px dashed rgb(110 110 110 / 55%)", borderRadius: 6, background: "rgb(255 255 255 / 70%)", font: "600 12px/1.2 system-ui, sans-serif", color: "rgb(70 70 70)" }}>
      <span style={{ fontSize: 16 }} aria-hidden="true">{config.char || "·"}</span>Pháo ×{config.count}
    </div>
  );
}
