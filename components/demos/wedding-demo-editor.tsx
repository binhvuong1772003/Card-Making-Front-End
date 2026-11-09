"use client";
import { CardEditor } from "@/components/editor/card-editor";
import type { CardDocument } from "@/lib/cards/document";
import type { CardDetail } from "@/lib/cards/api";
export default function WeddingDemoEditor({ data, onChange, onFlushReady }: { data: CardDocument; onChange: (data: CardDocument) => void; onFlushReady: (flush: (() => CardDocument) | null) => void }) {
  const card: CardDetail = { id: "demo-hoa-moc-xanh", title: "Hoa Mộc Xanh", revision: 0, role: "OWNER", document: data as unknown as Record<string, unknown> };
  return <div style={{ height: "calc(100dvh - 68px)" }}><CardEditor card={card} onDocumentChange={onChange} onFlushReady={onFlushReady} /></div>;
}
