import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { songPhungDoDocument } from "@/lib/cards/demos/song-phung-do";

export default function Page() {
  return <InvitationContentDemo document={songPhungDoDocument} title="Song Phụng - Đỏ" route="/demo/song-phung-do" outerBackground="#ffffff" />;
}
