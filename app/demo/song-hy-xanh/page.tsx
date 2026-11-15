import type { Metadata } from "next";
import sourceCover from "@/public/demo/song-hy/cover-xanh.json";
import pages from "@/public/demo/song-hy-xanh/pages-xanh.json";
import { normalizeCardDocument, type CardPage } from "@/lib/cards/document";
import { SongHyXanhDemo } from "@/components/demos/song-hy-xanh-demo";

export const metadata: Metadata = { title: "Song Hỷ Xanh · Bản dựng thử", robots: { index: false, follow: false } };

function coverPage(): CardPage {
  const page = structuredClone(sourceCover) as unknown as CardPage;
  for (const node of page.data.root.children) {
    if (node.id === "open-name1") node.props.text = "Võ Hải Nam";
    if (node.id === "open-name2") node.props.text = "Huỳnh Khánh Linh";
    if (node.id === "open-date") node.props.text = "30 tháng 7, 2026";
    if (node.id === "open-invite") node.props.text = "Trân trọng kính mời";
  }
  return page;
}

export default function SongHyXanhDemoPage() {
  const document = normalizeCardDocument({
    kind: "card",
    version: 1,
    startPageId: "cover",
    pages: [coverPage(), pages.invitation, pages.rsvp, pages.giftDetails],
  });
  return <SongHyXanhDemo document={document} />;
}
