import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { hoangKimIiDoDocument } from "@/lib/cards/demos/hoang-kim-ii-do";

export default function Page() {
  return <InvitationContentDemo document={hoangKimIiDoDocument} title="Hoàng Kim II - Đỏ" route="/demo/hoang-kim-ii-do" outerBackground="#ffffff" />;
}
