"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CardPlayer } from "@/components/cards/card-player";
import type { CardDocument } from "@/lib/cards/document";
import { cardsApi } from "@/lib/cards/api";
import { isApiError } from "@/lib/api";

type InvitationContentDemoProps = {
  document: CardDocument;
  title: string;
  route: string;
  outerBackground: string;
};

/** Preview and copy the same content document that will be saved in the handoff snapshot. */
export function InvitationContentDemo({ document, title, route, outerBackground }: InvitationContentDemoProps) {
  const router = useRouter();
  const [phone, setPhone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const draftId = useRef<string | null>(null);
  const savingRef = useRef(false);

  async function handleUseTemplate() {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      draftId.current ??= await cardsApi.create(title, "WEDDING");
      const card = await cardsApi.get(draftId.current);
      await cardsApi.save(card.id, card.revision, document);
      router.push(`/cards/${card.id}`);
    } catch (cause) {
      if (isApiError(cause, "UNAUTHENTICATED")) {
        router.push(`/login?returnTo=${encodeURIComponent(route)}`);
      } else {
        setError(cause instanceof Error ? cause.message : "Chưa tạo được bản thiệp. Thử lại nhé.");
      }
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden" style={{ background: outerBackground }}>
      <CardPlayer
        document={document}
        mode="preview"
        historyKey={`demo:${route}:${phone ? "phone" : "desktop"}`}
        device={phone ? "phone" : "desktop"}
        immersive={!phone}
      />
      <nav aria-label={`Tùy chọn mẫu ${title}`} className="fixed bottom-5 right-5 z-[120] flex max-w-[calc(100%-2.5rem)] flex-wrap items-center justify-end gap-2 rounded-2xl border border-stone-300 bg-white p-1.5 text-sm text-stone-900 shadow-lg">
        <button type="button" aria-pressed={phone} onClick={() => setPhone(value => !value)} className="rounded-full px-3 py-2 font-medium hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
          {phone ? "Xem máy tính" : "Xem điện thoại"}
        </button>
        <button type="button" disabled={saving} onClick={() => void handleUseTemplate()} className="rounded-full bg-stone-900 px-4 py-2 font-semibold text-white hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 disabled:opacity-60">
          {saving ? "Đang tạo thiệp…" : "Dùng mẫu này"}
        </button>
      </nav>
      {error && <p role="status" className="fixed bottom-24 left-1/2 z-[121] w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-lg bg-white px-4 py-2 text-sm text-red-800 shadow-lg">{error}</p>}
    </main>
  );
}
