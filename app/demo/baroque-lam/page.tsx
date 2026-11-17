import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { baroqueLamDocument } from "@/lib/cards/demos/baroque-lam";

export default function Page() {
  return <InvitationContentDemo document={baroqueLamDocument} title="Baroque - Lam" route="/demo/baroque-lam" outerBackground="#ffffff" />;
}
