"use client";

import type { CardSession } from "./card-session";
import styles from "./page-layout-settings.module.css";

// Bố cục của một trang: "Cột giữa" (cột 960 px giữa màn hình, như trước) hoặc "Toàn màn hình" (trang phủ hết bề ngang).
// Khung soạn của editor luôn rộng 960 px, nên trang toàn màn hình chỉ thấy đúng ở "Xem trước".
export function PageLayoutSettings({ session, pageId, readOnly }: { session: CardSession; pageId: string; readOnly: boolean }) {
  const page = session.document.pages.find(item => item.id === pageId)!;
  const full = page.layout === "full";
  return <section className={styles.panel} aria-label="Bố cục trang">
    <p className={styles.title}>Bố cục trang</p>
    <div className={styles.choices} role="group" aria-label="Chọn bố cục trang">
      <button type="button" className={styles.choice} aria-pressed={!full} disabled={readOnly} onClick={() => session.setPageLayout(page.id, undefined)}>Cột giữa</button>
      <button type="button" className={styles.choice} aria-pressed={full} disabled={readOnly} onClick={() => session.setPageLayout(page.id, "full")}>Toàn màn hình</button>
    </div>
    <p className={styles.note}>{full
      ? "Trang phủ hết bề ngang màn hình. Khung soạn vẫn rộng 960 px: khối neo phải sẽ dính mép phải màn hình thật, khối neo giữa vẫn ở giữa. Xem trước để thấy đúng."
      : "Trang nằm trong cột 960 px ở giữa màn hình."}</p>
  </section>;
}
