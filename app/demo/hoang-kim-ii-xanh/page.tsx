import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { hoangKimIiXanhDocument } from "@/lib/cards/demos/hoang-kim-ii-xanh";

export default function Page() {
  return <InvitationContentDemo document={hoangKimIiXanhDocument} title="Hoàng Kim II - Xanh" route="/demo/hoang-kim-ii-xanh" outerBackground="#ffffff" />;
}
