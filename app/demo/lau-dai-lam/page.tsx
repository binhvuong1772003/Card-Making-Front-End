import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { lauDaiLamDocument } from "@/lib/cards/demos/lau-dai-lam";

export default function Page() {
  return <InvitationContentDemo document={lauDaiLamDocument} title="Lâu Đài - Lam" route="/demo/lau-dai-lam" outerBackground="#ffffff" />;
}
