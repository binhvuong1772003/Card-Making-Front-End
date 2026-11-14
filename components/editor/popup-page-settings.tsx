"use client";

import { useState } from "react";
import { normalizePopupSettings } from "@/lib/cards/page-actions";
import type { PopupSettings } from "@/lib/cards/document";
import type { CardSession } from "./card-session";
import styles from "./popup-page-settings.module.css";

const WIDTHS = [420, 640, 960];

export function PopupPageSettings({ session, pageId, readOnly }: { session: CardSession; pageId: string; readOnly: boolean }) {
  const page = session.document.pages.find(item => item.id === pageId)!;
  const value = normalizePopupSettings(page.popup);
  const [customWidth, setCustomWidth] = useState(String(value.width));
  const update = (patch: Partial<PopupSettings>) => session.setPopupSettings(page.id, normalizePopupSettings({ ...value, ...patch }));
  const preset = WIDTHS.includes(value.width) ? String(value.width) : "custom";

  return <section className={styles.panel} aria-label="Hiển thị trang dạng popup">
    <label className={styles.enable}>
      <input type="checkbox" checked={Boolean(page.popup)} disabled={readOnly} onChange={event => session.setPopupSettings(page.id, event.target.checked ? value : undefined)} />
      <span><strong>Mở trang này dạng popup</strong><small>Cài đặt áp dụng khi một thành phần mở trang này.</small></span>
    </label>
    {page.popup && <div className={styles.settings}>
      <label>Chiều rộng
        <select disabled={readOnly} value={preset} onChange={event => { if (event.target.value !== "custom") { setCustomWidth(event.target.value); update({ width: Number(event.target.value) }); } }}>
          <option value="420">Nhỏ · 420 px</option><option value="640">Vừa · 640 px</option><option value="960">Lớn · 960 px</option><option value="custom">Tuỳ chỉnh</option>
        </select>
      </label>
      {preset === "custom" && <input aria-label="Chiều rộng popup tùy chỉnh" type="number" min={280} max={1200} step={10} value={customWidth} disabled={readOnly} onChange={event => setCustomWidth(event.target.value)} onBlur={() => { const width = Number(customWidth); if (Number.isFinite(width)) { const normalized = normalizePopupSettings({ ...value, width }); update({ width: normalized.width }); setCustomWidth(String(normalized.width)); } else setCustomWidth(String(value.width)); }} />}
      <label>Hiệu ứng
        <select disabled={readOnly} value={value.effect} onChange={event => update({ effect: event.target.value as PopupSettings["effect"] })}>
          <option value="fade">Mờ dần</option><option value="slide-up">Trượt lên</option><option value="zoom">Thu phóng</option><option value="none">Không hiệu ứng</option>
        </select>
      </label>
      <label>Nền phủ
        <span className={styles.backdrop}><input aria-label="Màu nền phủ" type="color" value={value.backdropColor} disabled={readOnly} onChange={event => update({ backdropColor: event.target.value })} /><input aria-label="Độ đậm nền phủ" type="range" min={0} max={80} step={4} value={value.backdropOpacity} disabled={readOnly} onChange={event => update({ backdropOpacity: Number(event.target.value) })} /><span>{value.backdropOpacity}%</span></span>
      </label>
      <p>Trên điện thoại popup tự vừa màn hình; nội dung dài sẽ cuộn bên trong.</p>
    </div>}
  </section>;
}
