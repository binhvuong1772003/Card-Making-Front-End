import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { nhatBinhDoDocument } from "@/lib/cards/demos/nhat-binh-do";

export default function Page() {
  return <InvitationContentDemo document={nhatBinhDoDocument} title="Nhật Bình - Đỏ" route="/demo/nhat-binh-do" outerBackground="#ffffff" />;
}
