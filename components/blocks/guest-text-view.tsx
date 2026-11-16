export type GuestTextViewProps = {
  text: string;
  size: number;
  color: string;
  font: string;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
};

// Rỗng thì không vẽ gì: trang công khai không có khách và chủ thiệp để trống chữ dự phòng.
export function GuestTextView({ text, size, color, font, bold, italic, align }: GuestTextViewProps) {
  if (!text) return null;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center", overflow: "visible" }}>
      <p suppressHydrationWarning style={{ margin: 0, maxWidth: "100%", color, fontFamily: font || "inherit", fontSize: size, fontWeight: bold ? 700 : 400, fontStyle: italic ? "italic" : "normal", lineHeight: 1.5, textAlign: align, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{text}</p>
    </div>
  );
}
