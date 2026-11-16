import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { toDuyenXanhDocument } from "@/lib/cards/demos/to-duyen-xanh";

export default function Page() {
  return <InvitationContentDemo document={toDuyenXanhDocument} title="Tơ Duyên – Xanh" route="/demo/to-duyen-xanh" outerBackground="#ffffff" />;
}
