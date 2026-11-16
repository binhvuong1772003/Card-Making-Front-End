import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { maiLanTrangDocument } from "@/lib/cards/demos/mai-lan-trang";

export default function Page() {
  return <InvitationContentDemo document={maiLanTrangDocument} title="Mai Lan - Trắng" route="/demo/mai-lan-trang" outerBackground="#ffffff" />;
}
