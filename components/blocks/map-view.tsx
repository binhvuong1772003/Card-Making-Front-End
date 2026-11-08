"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";

// Vẽ khối Bản đồ: Google Maps nhúng thường (Maps Embed API) kèm tiêu đề, tên, địa chỉ và nút. Nền, viền, bo góc, bóng là của Miditor (nhóm
// Nền, Viền, Hiệu ứng của mọi khối), nên ở đây không có. Kiểu dáng viết thẳng (inline) vì Render đặt lại kiểu. `mode` như khối Album: "live" là
// trang thật; "edit" trong editor (không nhận chuột để chọn và kéo khối được); "static" là ảnh thu nhỏ (không tải iframe, cả lưới mẫu mà tải
// hàng chục bản đồ thì quá nặng).
export type MapMode = "live" | "edit" | "static";

export interface MapViewProps {
  name: string;
  address: string;
  showText: boolean;
  zoom: number;
  heading: string;
  divider: boolean;
  button: string;
  color: string;
  innerFrame: boolean;
  padding: number;
  mode: MapMode;
  apiKey: string | undefined;
}

const PIN = "M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24.09,24.09,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z";
const HEART = "M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40ZM128,214.8C109.74,204.16,32,155.69,32,102A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,155.61,146.24,204.15,128,214.8Z";

function Icon({ d, size }: { d: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const fill: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 };

// Chỗ của bản đồ khi chưa có gì để hiện: chưa nhập địa điểm, chưa có khoá, hoặc là ảnh thu nhỏ.
function Placeholder({ color, text }: { color: string; text: string }) {
  return (
    <div style={{ ...fill, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: "#e9e4d8", color, textAlign: "center", padding: 12, boxSizing: "border-box", fontSize: 13, lineHeight: 1.4 }}>
      <Icon d={PIN} size={28} />
      {text && <span>{text}</span>}
    </div>
  );
}

export function MapView({ name, address, showText, zoom, heading, divider, button, color, innerFrame, padding, mode, apiKey }: MapViewProps) {
  const live = mode === "live";
  const query = [name, address].map((part) => part.trim()).filter(Boolean).join(", ");
  const [active, setActive] = useState(false);
  const area = useRef<HTMLDivElement>(null);

  // Bản đồ nhúng nuốt cử chỉ một ngón tay nên trên điện thoại khách không cuộn thiệp qua nó được: bản đồ chỉ nhận chạm sau khi bấm
  // vào nó một lần, và trả lại việc cuộn khi bấm ra ngoài.
  useEffect(() => {
    if (!active) return;
    const away = (event: PointerEvent) => {
      if (!area.current?.contains(event.target as Node)) setActive(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [active]);

  let inner: ReactNode;
  if (!query) inner = <Placeholder color={color} text={mode === "edit" ? "Nhập tên và địa chỉ ở bảng bên phải" : ""} />;
  else if (!apiKey) inner = <Placeholder color={color} text={mode === "edit" ? "Chưa cấu hình khoá Google Maps (NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY)" : query} />;
  else if (mode === "static") inner = <Placeholder color={color} text="" />;
  else {
    const src = `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}&zoom=${zoom}&language=vi`;
    inner = (
      <>
        <iframe title={`Bản đồ ${query}`} src={src} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" style={{ ...fill, pointerEvents: live && active ? "auto" : "none" }} />
        {live && !active && (
          <button type="button" aria-label="Bấm để dùng bản đồ" onClick={() => setActive(true)} style={{ ...fill, background: "transparent", cursor: "pointer", padding: 0 }} />
        )}
      </>
    );
  }

  const directions = query ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}` : "";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxSizing: "border-box",
        padding,
        color,
        textAlign: "center",
        pointerEvents: live ? "auto" : "none",
      }}
    >
      {innerFrame && <span aria-hidden="true" style={{ position: "absolute", inset: 6, border: `1px solid ${color}73`, pointerEvents: "none" }} />}
      {heading.trim() && <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>{heading}</div>}
      {divider && (
        <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ flex: 1, height: 1, background: `${color}59` }} />
          <Icon d={HEART} size={12} />
          <span style={{ flex: 1, height: 1, background: `${color}59` }} />
        </div>
      )}
      <div ref={area} style={{ position: "relative", flex: 1, minHeight: 0, overflow: "hidden" }}>
        {inner}
      </div>
      {showText && (name.trim() || address.trim()) && (
        <div>
          {name.trim() && <div style={{ fontSize: 16, lineHeight: 1.3 }}>{name}</div>}
          {address.trim() && <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.8 }}>{address}</div>}
        </div>
      )}
      {button.trim() && directions && (
        <div>
          <a href={directions} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9999, background: color, color: "#fff", fontSize: 14, fontWeight: 500, padding: "8px 16px", textDecoration: "none", pointerEvents: live ? "auto" : "none" }}>
            <Icon d={PIN} size={16} />
            {button}
          </a>
        </div>
      )}
    </div>
  );
}
