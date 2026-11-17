"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { CardPlayer } from "@/components/cards/card-player";
import type { CardDocument } from "@/lib/cards/document";
import { cardsApi } from "@/lib/cards/api";
import { isApiError } from "@/lib/api";
import { hoaMocXanhDemoDocument } from "@/lib/cards/demos/hoa-moc-xanh";
import styles from "./wedding-demo.module.css";

const WeddingDemoEditor = dynamic(() => import("./wedding-demo-editor"), { ssr: false, loading: () => <p className={styles.loading}>Đang mở trình biên tập…</p> });

export function WeddingDemo() {
  const [draft, setDraft] = useState<CardDocument>(hoaMocXanhDemoDocument);
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const draftId = useRef<string | null>(null);
  const router = useRouter();
  const flush = useRef<(() => CardDocument) | null>(null);
  const ready = useCallback((callback: (() => CardDocument) | null) => { flush.current = callback; }, []);
  const toggleEditing = () => {
    if (editing && flush.current) setDraft(flush.current());
    setEditing(!editing);
  };

  async function save() {
    setSaving(true);
    setError("");
    setNeedsLogin(false);
    try {
      draftId.current ??= await cardsApi.create("Hoa Mộc Xanh · Minh Quân & Thu Hà", "WEDDING");
      const card = await cardsApi.get(draftId.current);
      await cardsApi.save(card.id, card.revision, flush.current?.() ?? draft);
      router.push(`/cards/${card.id}`);
    } catch (err) {
      if (isApiError(err, "UNAUTHENTICATED")) {
        setNeedsLogin(true);
        setError("Đăng nhập để lưu bản này vào thiệp của bạn.");
      } else setError(err instanceof Error ? err.message : "Chưa lưu được thiệp. Bạn thử lại nhé.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.root}>
      <header className={styles.toolbar}>
        <div className={styles.title}><strong>Hoa Mộc Xanh</strong><span>Thiệp cưới mẫu · Có thể chỉnh sửa</span></div>
        <div className={styles.actions}>
          {!editing && <button type="button" aria-pressed={phone} onClick={() => setPhone(!phone)}>{phone ? "Khổ máy tính" : "Khổ điện thoại"}</button>}
          <button type="button" aria-pressed={editing} onClick={toggleEditing}>{editing ? "Xem thiệp" : "Chỉnh sửa"}</button>
          <button type="button" className={styles.save} disabled={saving} onClick={() => void save()}>{saving ? "Đang lưu…" : "Lưu thành thiệp"}</button>
        </div>
      </header>
      {error && <div className={styles.notice} role="status">{error} {needsLogin && <Link href="/login?returnTo=%2Fdemo%2Fhoa-moc-xanh">Đăng nhập</Link>}</div>}
      {editing ? <WeddingDemoEditor data={draft} onChange={setDraft} onFlushReady={ready} /> : (
        <main className={`${styles.preview} ${phone ? styles.phone : ""}`}>
          <CardPlayer document={draft} mode="preview" historyKey="demo:hoa-moc-xanh" />
        </main>
      )}
    </div>
  );
}
