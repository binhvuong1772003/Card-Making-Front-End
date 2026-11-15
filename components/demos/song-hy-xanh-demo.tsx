"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardPlayer } from "@/components/cards/card-player";
import type { CardDocument } from "@/lib/cards/document";
import { cardsApi } from "@/lib/cards/api";
import { isApiError } from "@/lib/api";

export function SongHyXanhDemo({ document, title = "Song Hỷ Xanh · Võ Hải Nam & Huỳnh Khánh Linh", route = "/demo/song-hy-xanh" }: { document: CardDocument; title?: string; route?: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function useTemplate() {
    setSaving(true);
    setError("");
    try {
      const id = await cardsApi.create(title, "WEDDING");
      const card = await cardsApi.get(id);
      await cardsApi.save(id, card.revision, document);
      router.push(`/cards/${id}`);
    } catch (cause) {
      if (isApiError(cause, "UNAUTHENTICATED")) {
        router.push(`/login?returnTo=${encodeURIComponent(route)}`);
        return;
      }
      setError(cause instanceof Error ? cause.message : "Chưa lưu được mẫu thiệp. Thử lại nhé.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-white">
      <CardPlayer document={document} mode="preview" historyKey={`demo:song-hy-xanh:${phone ? "phone" : "desktop"}`} device={phone ? "phone" : undefined} immersive={!phone} />
      <nav aria-label="Tùy chọn mẫu thiệp" className="fixed bottom-5 right-5 z-[120] flex items-center gap-2 rounded-full border border-[#c8d4c3] bg-[#fff7eb] p-1.5 text-sm text-[#1f3a25] shadow-lg">
        <button type="button" onClick={() => setPhone(value => !value)} className="rounded-full px-3 py-2 font-medium hover:bg-[#e8f0e4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f3a25]">
          {phone ? "Xem máy tính" : "Xem điện thoại"}
        </button>
        <span className="h-5 w-px bg-[#c8d4c3]" aria-hidden="true" />
        <button type="button" disabled={saving} onClick={() => void useTemplate()} className="rounded-full bg-[#1f3a25] px-4 py-2 font-semibold text-[#e8f0e4] hover:bg-[#294b30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f3a25] disabled:opacity-60">
          {saving ? "Đang tạo thiệp…" : "Dùng mẫu này"}
        </button>
      </nav>
      {error && <p role="status" className="fixed bottom-[4.5rem] left-1/2 z-[121] -translate-x-1/2 rounded-lg bg-white px-4 py-2 text-sm text-red-800 shadow-lg">{error}</p>}
    </main>
  );
}
