import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { lienHoaV2XanhDocument } from "@/lib/cards/demos/lien-hoa-v2-xanh";

export default function Page() {
  return <InvitationContentDemo document={lienHoaV2XanhDocument} title="Liên Hoa V2 - Xanh" route="/demo/lien-hoa-v2-xanh" outerBackground="#ffffff" />;
}
