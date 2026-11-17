import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { toDuyenHongContentDocument } from "@/lib/cards/demos/to-duyen-hong";

export default function Page() {
  return <InvitationContentDemo document={toDuyenHongContentDocument} title="Tơ Duyên - Hồng" route="/demo/to-duyen-hong" outerBackground="#ffffff" />;
}
