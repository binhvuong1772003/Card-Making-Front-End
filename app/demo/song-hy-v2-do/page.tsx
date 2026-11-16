import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { songHyV2DoDocument } from "@/lib/cards/demos/song-hy-v2-do";

export default function Page() {
  return <InvitationContentDemo document={songHyV2DoDocument} title="Song Hỷ V2 – Đỏ" route="/demo/song-hy-v2-do" outerBackground="#ffffff" />;
}
