import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { toDuyenDoDamDocument } from "@/lib/cards/demos/to-duyen-do-dam";

export default function Page() {
  return <InvitationContentDemo document={toDuyenDoDamDocument} title="Tơ Duyên – Đỏ Đậm" route="/demo/to-duyen-do-dam" outerBackground="#ffffff" />;
}
