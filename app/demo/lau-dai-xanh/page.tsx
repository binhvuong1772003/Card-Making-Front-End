import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { lauDaiXanhDocument } from "@/lib/cards/demos/lau-dai-xanh";

export default function Page() {
  return <InvitationContentDemo document={lauDaiXanhDocument} title="Lâu Đài - Xanh" route="/demo/lau-dai-xanh" outerBackground="#ffffff" />;
}
