import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { songLongXanhDocument } from "@/lib/cards/demos/song-long-xanh";

export default function Page() {
  return <InvitationContentDemo document={songLongXanhDocument} title="Song Long - Xanh" route="/demo/song-long-xanh" outerBackground="#ffffff" />;
}
