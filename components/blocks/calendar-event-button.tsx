"use client";

import { useEffect, useRef, useState } from "react";
import { googleCalendarUrl, icsFileName, icsText, type CalendarEvent } from "@/lib/cards/calendar-event";

// Nút "Thêm vào lịch" của khối Lịch: mở một menu nhỏ có Google Calendar (liên kết mở trang tạo sự kiện đã điền sẵn) và tệp .ics (Apple
// Calendar, Outlook). Chỉ chạy ở trang thật (`live`); trong editor và ảnh thu nhỏ chỉ là hình cái nút, không nhận chuột. Màu theo hình đánh
// dấu của lịch. Menu mở lên phía trên nút để nằm trong khối, vì khối nằm dưới một thiệp dài và Render có thể cắt phần tràn ra ngoài.
export interface CalendarEventButtonProps {
  event: CalendarEvent;
  label: string;
  background: string;
  color: string;
  size: number;
  live: boolean;
}

export function CalendarEventButton({ event, label, background, color, size, live }: CalendarEventButtonProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const google = googleCalendarUrl(event);

  // Bấm ra ngoài hoặc nhấn Esc thì đóng menu.
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  const download = () => {
    const content = icsText(event);
    if (!content) return;
    const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = icsFileName(event.title);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setOpen(false);
  };

  const item = { display: "block", width: "100%", boxSizing: "border-box", padding: "10px 14px", border: 0, background: "transparent", color: "#2a2224", font: "inherit", fontSize: 14, textAlign: "left", textDecoration: "none", cursor: "pointer", whiteSpace: "nowrap" } as const;
  return (
    <div ref={root} style={{ position: "relative", display: "flex", justifyContent: "center", pointerEvents: live ? "auto" : "none" }}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={!live || !google}
        onClick={() => setOpen((value) => !value)}
        style={{ border: 0, borderRadius: 9999, background, color, font: "inherit", fontSize: Math.max(12, size * 0.85), fontWeight: 600, padding: "8px 18px", cursor: live ? "pointer" : "default" }}
      >
        {label}
      </button>
      {open && (
        <div role="menu" style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", zIndex: 5, minWidth: 190, overflow: "hidden", borderRadius: 14, background: "#fff", boxShadow: "0 8px 28px rgba(42,34,36,0.22)", border: "1px solid rgba(42,34,36,0.1)" }}>
          {google && (
            <a role="menuitem" href={google} target="_blank" rel="noopener noreferrer" style={item} onClick={() => setOpen(false)}>
              Google Calendar
            </a>
          )}
          <button type="button" role="menuitem" style={item} onClick={download}>
            Tải tệp .ics (Apple, Outlook)
          </button>
        </div>
      )}
    </div>
  );
}
