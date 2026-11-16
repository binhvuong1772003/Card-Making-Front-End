import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { hoangKimDoDocument } from "@/lib/cards/demos/hoang-kim-do";

export default function Page() {
  return <InvitationContentDemo document={hoangKimDoDocument} title="Hoàng Kim - Đỏ" route="/demo/hoang-kim-do" outerBackground="#ffffff" />;
}
