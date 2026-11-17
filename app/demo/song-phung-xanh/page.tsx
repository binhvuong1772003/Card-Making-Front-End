import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { songPhungXanhDocument } from "@/lib/cards/demos/song-phung-xanh";

export default function Page() {
  return <InvitationContentDemo document={songPhungXanhDocument} title="Song Phụng - Xanh" route="/demo/song-phung-xanh" outerBackground="#ffffff" />;
}
