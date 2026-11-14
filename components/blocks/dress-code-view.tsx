"use client";

export type DressCodeViewProps = {
  heading: string;
  subtitle: string;
  headingColor: string;
  subtitleColor: string;
  shape: "circle" | "square" | "diamond";
  size: number;
  gap: number;
  colors: string[];
};

export function DressCodeView({ heading, subtitle, headingColor, subtitleColor, shape, size, gap, colors }: DressCodeViewProps) {
  const swatchStyle = shape === "circle"
    ? { borderRadius: "50%" }
    : shape === "square"
      ? { borderRadius: 8 }
      : { borderRadius: 4, transform: "rotate(45deg) scale(.72)" };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16, boxSizing: "border-box", textAlign: "center", overflow: "visible" }}>
      {heading && <h3 style={{ margin: 0, color: headingColor, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 23, fontWeight: 700, lineHeight: 1.2 }}>{heading}</h3>}
      {subtitle && <p style={{ margin: -6, color: subtitleColor, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 15, lineHeight: 1.4 }}>{subtitle}</p>}
      <div role="list" aria-label="Mẫu màu trang phục" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap, maxWidth: "100%", padding: 8, boxSizing: "border-box" }}>
        {colors.map((color, index) => <div key={index} role="listitem" aria-label={`Màu ${index + 1}: ${color}`} style={{ width: size, height: size, flex: `0 0 ${size}px`, display: "grid", placeItems: "center" }}>
          <span aria-hidden="true" style={{ width: "100%", height: "100%", display: "block", background: color, boxSizing: "border-box", border: "1px solid rgba(32,59,41,.18)", boxShadow: "0 3px 6px rgba(32,40,29,.14)", ...swatchStyle }} />
        </div>)}
      </div>
    </div>
  );
}
