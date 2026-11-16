import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { songLongDoDocument } from "@/lib/cards/demos/song-long-do";

export default function Page() {
  return <InvitationContentDemo document={songLongDoDocument} title="Song Long - Đỏ" route="/demo/song-long-do" outerBackground="#ffffff" />;
}
