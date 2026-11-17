import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { thanhDiepXanhDocument } from "@/lib/cards/demos/thanh-diep-xanh";

export default function Page() {
  return <InvitationContentDemo document={thanhDiepXanhDocument} title="Thanh Diệp - Xanh" route="/demo/thanh-diep-xanh" outerBackground="#ffffff" />;
}
