import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { minimalismXanhDocument } from "@/lib/cards/demos/minimalism-xanh";

export default function Page() {
  return <InvitationContentDemo document={minimalismXanhDocument} title="Minimalism - Xanh" route="/demo/minimalism-xanh" outerBackground="#ffffff" />;
}
