import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { longPhungXanhDocument } from "@/lib/cards/demos/long-phung-xanh";

export default function Page() {
  return <InvitationContentDemo document={longPhungXanhDocument} title="Long Phụng - Xanh" route="/demo/long-phung-xanh" outerBackground="#ffffff" />;
}
