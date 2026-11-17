import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { hoaTinhDoDocument } from "@/lib/cards/demos/hoa-tinh-do";

export default function Page() {
  return <InvitationContentDemo document={hoaTinhDoDocument} title="Hoạ Tình - Đỏ" route="/demo/hoa-tinh-do" outerBackground="#ffffff" />;
}
