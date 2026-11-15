import type { Metadata } from "next";
import cover from "@/public/demo/song-hy/cover-do.json";
import pages from "@/public/demo/song-hy/pages-do.json";
import { normalizeCardDocument } from "@/lib/cards/document";
import { SongHyXanhDemo } from "@/components/demos/song-hy-xanh-demo";

export const metadata: Metadata = { title: "Song Hỷ Đỏ · Bản dựng thử", robots: { index: false, follow: false } };

export default function SongHyDoDemoPage() {
  const document = normalizeCardDocument({
    kind: "card",
    version: 1,
    startPageId: "cover",
    pages: [cover, pages.invitation, pages.giftDetails, pages.rsvp],
  });
  return <SongHyXanhDemo document={document} title="Song Hỷ Đỏ · Gia Huy & Quỳnh Như" route="/demo/song-hy-do" />;
}
