import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { baroqueV2DoDamDocument } from "@/lib/cards/demos/baroque-v2-do-dam";

export default function Page() {
  return <InvitationContentDemo document={baroqueV2DoDamDocument} title="Baroque V2 - Đỏ Đậm" route="/demo/baroque-v2-do-dam" outerBackground="#ffffff" />;
}
