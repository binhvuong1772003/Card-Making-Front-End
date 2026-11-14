import type { Metadata } from "next";
import cover from "@/public/demo/song-hy/cover-mdd.json";
import pages from "@/public/demo/minimalism-do-dam/pages-mdd.json";
import { normalizeCardDocument } from "@/lib/cards/document";
import { MinimalismDoDamDemo } from "@/components/demos/minimalism-do-dam-demo";

export const metadata: Metadata = { title: "Minimalism - Đỏ Đậm · Bản dựng thử", robots: { index: false, follow: false } };

export default function MinimalismDoDamDemoPage() {
  const document = normalizeCardDocument({
    kind: "card",
    version: 1,
    startPageId: "cover",
    pages: [cover, pages.invitation, pages.rsvp, pages.giftDetails],
  });
  return <MinimalismDoDamDemo document={document} />;
}
