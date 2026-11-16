import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { longPhungDoDocument } from "@/lib/cards/demos/long-phung-do";

export default function Page() {
  return <InvitationContentDemo document={longPhungDoDocument} title="Long Phụng - Đỏ" route="/demo/long-phung-do" outerBackground="#ffffff" />;
}
