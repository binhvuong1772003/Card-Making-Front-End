import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { minimalismLamDamDocument } from "@/lib/cards/demos/minimalism-lam-dam";

export default function Page() {
  return <InvitationContentDemo document={minimalismLamDamDocument} title="Minimalism - Lam Đậm" route="/demo/minimalism-lam-dam" outerBackground="#ffffff" />;
}
