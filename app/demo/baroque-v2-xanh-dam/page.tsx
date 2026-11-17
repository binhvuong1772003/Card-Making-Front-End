import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { baroqueV2XanhDamDocument } from "@/lib/cards/demos/baroque-v2-xanh-dam";

export default function Page() {
  return <InvitationContentDemo document={baroqueV2XanhDamDocument} title="Baroque V2 - Xanh Đậm" route="/demo/baroque-v2-xanh-dam" outerBackground="#ffffff" />;
}
