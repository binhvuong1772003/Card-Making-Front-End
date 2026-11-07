import type { CSSProperties, ReactNode } from "react";

// Hình minh hoạ tĩnh cho trang chủ và trang loại thiệp (bản vẽ I, L): thiệp mẫu xếp nghiêng và nền nhiều tầng nhẹ.
// Tên, ngày, địa điểm trong hình là nội dung giả để minh hoạ, không phải thiệp thật.
const SOFT_SHADOW = "0 1px 2px rgba(42,34,36,0.06), 0 10px 24px rgba(42,34,36,0.12)";
const SERIF = "var(--font-serif), Georgia, serif";

export const WeddingFront = () => (
  <span style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 5, width: "100%", height: "100%", boxSizing: "border-box", paddingBottom: 11, borderRadius: 16, background: "#FBFCF8", color: "#4B5A3F", overflow: "hidden" }}>
    <span style={{ position: "absolute", inset: 8, border: "1px solid #C4CDB8", borderRadius: "60px 60px 10px 10px" }} />
    <span style={{ position: "absolute", left: 30, top: 14, width: 72, height: 72, borderRadius: 99, background: "#EAEFE2" }} />
    <svg viewBox="0 0 84 40" width={84} height={40} style={{ position: "absolute", left: 24, top: 30 }} fill="none" stroke="#7E8C6E" strokeWidth={1.3} strokeLinecap="round" aria-hidden="true">
      <path d="M6 32C24 32 52 26 78 8" />
      <path d="M16 31c-2-8 1-13 8-14 2 8-1 13-8 14z" fill="#DCE4D0" />
      <path d="M30 28c-1-8 3-12 10-12 1 8-3 12-10 12z" fill="#DCE4D0" />
      <path d="M46 22c0-7 4-10 10-9 0 7-4 10-10 9z" fill="#DCE4D0" />
      <path d="M60 15c1-6 5-8 10-7-1 6-5 8-10 7z" fill="#DCE4D0" />
      <circle cx="10" cy="22" r="3.2" fill="#F4C9C0" stroke="#D99A8D" />
      <circle cx="38" cy="12" r="3.6" fill="#F4C9C0" stroke="#D99A8D" />
      <circle cx="64" cy="26" r="3" fill="#F4C9C0" stroke="#D99A8D" />
    </svg>
    <span style={{ position: "relative", marginTop: 62, fontSize: 6.5, letterSpacing: "0.24em" }}>TRÂN TRỌNG KÍNH MỜI</span>
    <span style={{ position: "relative", fontFamily: SERIF, fontWeight: 600, fontSize: 23, lineHeight: 1 }}>Hà &amp; Quang</span>
    <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 18, height: 1, background: "#C4CDB8" }} />
      <span style={{ width: 4, height: 4, transform: "rotate(45deg)", background: "#C4A56A" }} />
      <span style={{ width: 18, height: 1, background: "#C4CDB8" }} />
    </span>
    <span style={{ position: "relative", fontSize: 7.5, letterSpacing: "0.2em" }}>03 · 11 · 2026</span>
    <span style={{ position: "relative", fontSize: 7, opacity: 0.8 }}>Nhà hàng Hoa Sen</span>
    <span style={{ position: "relative", marginTop: 2, padding: "3px 12px", borderRadius: 99, background: "#4B5A3F", color: "#FFFFFF", fontSize: 7, fontWeight: 600 }}>Xác nhận tham dự</span>
  </span>
);

export const BirthdayFront = () => (
  <span style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 5, width: "100%", height: "100%", boxSizing: "border-box", paddingBottom: 12, borderRadius: 16, background: "#FFF9EC", color: "#5A3A12", overflow: "hidden" }}>
    <svg viewBox="0 0 132 24" width={132} height={24} style={{ position: "absolute", left: 0, top: 0 }} aria-hidden="true">
      <path d="M0 2Q66 16 132 2" fill="none" stroke="#C9A97A" strokeWidth={1.2} />
      <path d="M12 4.5l9 0-4.5 12z" fill="#E8604A" />
      <path d="M36 8.5l9 0-4.5 12z" fill="#F2C14E" />
      <path d="M60 11l9 0-4.5 12z" fill="#2F8F83" />
      <path d="M84 9.5l9 0-4.5 12z" fill="#C2456B" />
      <path d="M108 6l9 0-4.5 12z" fill="#3F6FD1" />
    </svg>
    <svg viewBox="0 0 54 78" width={54} height={78} style={{ position: "absolute", right: 6, top: 22 }} fill="none" aria-hidden="true">
      <path d="M14 40C14 56 22 62 26 76M40 38C40 54 34 62 30 76M26 36C26 52 28 62 28 76" stroke="#B9ABAE" strokeWidth={1} />
      <ellipse cx="14" cy="22" rx="11" ry="14" fill="#E8604A" />
      <ellipse cx="40" cy="20" rx="10" ry="13" fill="#2F8F83" />
      <ellipse cx="27" cy="14" rx="10" ry="13" fill="#F2C14E" />
    </svg>
    {[[12, 40, 6, 6, "99px", "#F2C14E", 0], [20, 138, 8, 3, "2px", "#C2456B", 30], [104, 132, 7, 3, "2px", "#2F8F83", -25], [8, 92, 5, 5, "99px", "#E8604A", 0], [108, 98, 5, 5, "99px", "#3F6FD1", 0]].map(([x, y, w, h, r, color, rot]) => (
      <span key={`${x}-${y}`} style={{ position: "absolute", left: x as number, top: y as number, width: w as number, height: h as number, borderRadius: r as string, background: color as string, transform: `rotate(${rot}deg)` }} />
    ))}
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: 66, height: 66, borderRadius: 99, background: "#E8604A", color: "#FFFFFF", fontWeight: 700, fontSize: 34, boxShadow: "0 0 0 4px #FFF9EC, 0 0 0 5.5px #F2B8A8" }}>5</span>
    <span style={{ position: "relative", marginTop: 6, fontSize: 7, letterSpacing: "0.14em" }}>MỜI BẠN ĐẾN DỰ TIỆC</span>
    <span style={{ position: "relative", fontWeight: 700, fontSize: 14, lineHeight: 1.1 }}>Bơ tròn 5 tuổi</span>
    <span style={{ position: "relative", fontSize: 7.5, opacity: 0.85 }}>Chủ nhật · 15:00</span>
    <span style={{ position: "relative", marginTop: 3, padding: "3px 12px", borderRadius: 99, background: "#E8604A", color: "#FFFFFF", fontSize: 7, fontWeight: 600 }}>Tôi sẽ đến</span>
  </span>
);

export const EventFront = () => (
  <span style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-end", gap: 5, width: "100%", height: "100%", boxSizing: "border-box", padding: 14, borderRadius: 16, backgroundColor: "#1F2A44", backgroundImage: "radial-gradient(rgba(127,178,255,0.42) 1px, transparent 1.3px)", backgroundSize: "11px 11px", color: "#FFFFFF", overflow: "hidden" }}>
    <span style={{ position: "absolute", right: -26, top: -26, width: 96, height: 96, borderRadius: 99, background: "rgba(127,178,255,0.22)" }} />
    <span style={{ position: "absolute", right: 10, top: 12, padding: "2px 8px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.5)", fontSize: 6.5, letterSpacing: "0.16em" }}>SỰ KIỆN</span>
    <span style={{ position: "relative", fontWeight: 700, fontSize: 40, lineHeight: 0.9, letterSpacing: "-0.02em" }}>26</span>
    <span style={{ position: "relative", fontSize: 8, letterSpacing: "0.22em", color: "#9CC4FF" }}>THÁNG 12 · 18:30</span>
    <span style={{ position: "relative", marginTop: 4, fontWeight: 700, fontSize: 15, lineHeight: 1.15 }}>Họp lớp 12A</span>
    <span style={{ position: "relative", fontSize: 7.5, opacity: 0.9 }}>Nhà hàng Sông Hồng</span>
    <span style={{ position: "relative", width: "100%", borderTop: "1px dashed rgba(255,255,255,0.35)", marginTop: 6 }} />
    <span style={{ position: "relative", padding: "4px 12px", borderRadius: 99, background: "#7FB2FF", color: "#1F2A44", fontSize: 7.5, fontWeight: 700 }}>Xác nhận tham dự</span>
  </span>
);

const card = (style: CSSProperties, children?: ReactNode) => (
  <span style={{ position: "absolute", borderRadius: 16, boxShadow: SOFT_SHADOW, ...style }}>{children}</span>
);

// Ba thiệp xếp nghiêng: thiệp giữa là thiệp chính, hai thiệp phụ chỉ ló màu. Khung 262 x 184.
function Fan({ back1, back2, front }: { back1: string; back2: string; front: ReactNode }) {
  return (
    <span aria-hidden="true" style={{ position: "absolute", right: -6, top: "50%", marginTop: -92, width: 262, height: 184 }}>
      {card({ left: 0, top: 40, width: 104, height: 138, background: back1, transform: "rotate(-11deg)" })}
      {card({ left: 154, top: 34, width: 104, height: 138, background: back2, transform: "rotate(11deg)" })}
      {card({ left: 64, top: 4, width: 132, height: 176, transform: "rotate(-1.5deg)" }, front)}
    </span>
  );
}

export const WeddingFan = () => <Fan back1="#F3E9D7" back2="#F7E9E4" front={<WeddingFront />} />;
export const BirthdayFan = () => <Fan back1="#FBE3EA" back2="#E4F1EE" front={<BirthdayFront />} />;
export const EventFan = () => <Fan back1="#EDE9F8" back2="#2B2B2B" front={<EventFront />} />;

// Ba thiệp xoè quạt lớn cho khung chào ở trang chủ. Khung 470 x 270.
export function HeroArt() {
  const hero = (left: number, top: number, rotate: number, scale: number, front: ReactNode) => (
    <span style={{ position: "absolute", left, top, width: 132, height: 176, borderRadius: 16, transform: `rotate(${rotate}deg) scale(${scale})`, boxShadow: "0 2px 4px rgba(42,34,36,0.08), 0 18px 40px rgba(42,34,36,0.18)" }}>{front}</span>
  );
  return (
    <div aria-hidden="true" style={{ position: "relative", zIndex: 1, flex: "none", width: 470, height: 270, marginRight: 8 }}>
      <span style={{ position: "absolute", left: 96, top: 6, width: 250, height: 250, borderRadius: 99, background: "rgba(255,255,255,0.55)" }} />
      {hero(18, 58, -10, 1.08, <WeddingFront />)}
      {hero(168, 12, 2, 1.28, <BirthdayFront />)}
      {hero(318, 56, 10, 1.08, <EventFront />)}
    </div>
  );
}

// Nền nhiều tầng nhẹ cho thẻ loại thiệp: vài vòng tròn gần màu nền và một hoạ tiết lặp rất mờ.
const circle = (x: number, y: number, d: number, color: string, extra?: CSSProperties) => (
  <span key={`${x}-${y}-${d}`} style={{ position: "absolute", left: x, top: y, width: d, height: d, borderRadius: 99, background: color, ...extra }} />
);

export function CategoryBackdrop({ kind }: { kind: "wedding" | "birthday" | "event" }) {
  const layer: CSSProperties = { position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit", pointerEvents: "none" };
  const pattern = (id: string, size: number, children: ReactNode) => (
    <svg aria-hidden="true" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          {children}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
  if (kind === "wedding") {
    return (
      <span aria-hidden="true" style={layer}>
        {circle(-70, -80, 230, "#ECF1E4")}
        {circle(240, 110, 260, "#DBE4D0")}
        {circle(150, -60, 120, "#E8EEDF")}
        {pattern("cm-leaf", 56, <><path d="M8 36c-1-9 4-14 12-14 1 9-4 14-12 14z" fill="none" stroke="#7E8C6E" strokeOpacity={0.16} strokeWidth={1} /><path d="M34 14c-1-6 3-9 8-9 1 6-3 9-8 9z" fill="#C5D2B7" fillOpacity={0.25} /><circle cx="40" cy="38" r="2" fill="#E7B7AD" fillOpacity={0.35} /></>)}
      </span>
    );
  }
  if (kind === "birthday") {
    return (
      <span aria-hidden="true" style={layer}>
        {circle(-60, -70, 210, "#FFEBCB")}
        {circle(230, 120, 250, "#FFDDA3")}
        {circle(120, -50, 110, "#FFE8C0")}
        {pattern("cm-confetti", 54, <><circle cx="9" cy="10" r="3" fill="#E8604A" fillOpacity={0.2} /><rect x="38" y="8" width="9" height="3.4" rx="1.7" fill="#2F8F83" fillOpacity={0.2} transform="rotate(28 42 10)" /><circle cx="26" cy="34" r="2.4" fill="#3F6FD1" fillOpacity={0.2} /><rect x="4" y="30" width="8" height="3.2" rx="1.6" fill="#C2456B" fillOpacity={0.2} transform="rotate(-24 8 32)" /><rect x="40" y="36" width="8" height="3.2" rx="1.6" fill="#B8791F" fillOpacity={0.2} transform="rotate(14 44 38)" /></>)}
        <svg aria-hidden="true" viewBox="0 0 400 40" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: 26 }}>
          <path d="M0 18Q50 0 100 18T200 18T300 18T400 18V40H0z" fill="#FFD9A0" fillOpacity={0.4} />
        </svg>
      </span>
    );
  }
  return (
    <span aria-hidden="true" style={layer}>
      {pattern("cm-stripe", 48, <path d="M-4 44L44 -4M20 52L52 20M-4 20L20 -4" stroke="#9FB4EB" strokeOpacity={0.15} strokeWidth={2.5} />)}
      {circle(180, -30, 260, "transparent", { border: "1.5px solid #C3D1F3", boxSizing: "border-box" })}
      {circle(210, 0, 200, "transparent", { border: "1.5px solid #C3D1F3", boxSizing: "border-box" })}
      {circle(240, 30, 140, "#CFDBF7")}
      {circle(-50, 150, 180, "#E2E9FB")}
    </span>
  );
}
