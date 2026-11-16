import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { minimalismNauDamDocument } from "@/lib/cards/demos/minimalism-nau-dam";

export default function Page() {
  return <InvitationContentDemo document={minimalismNauDamDocument} title="Minimalism – Nâu Đậm" route="/demo/minimalism-nau-dam" outerBackground="#ffffff" />;
}
