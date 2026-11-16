import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { songHacDoDocument } from "@/lib/cards/demos/song-hac-do";

export default function Page() {
  return <InvitationContentDemo document={songHacDoDocument} title="Song Hạc - Đỏ" route="/demo/song-hac-do" outerBackground="#ffffff" />;
}
