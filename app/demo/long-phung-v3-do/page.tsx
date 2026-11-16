import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { longPhungV3DoDocument } from "@/lib/cards/demos/long-phung-v3-do";

export default function Page() {
  return <InvitationContentDemo document={longPhungV3DoDocument} title="Long Phụng V3 - Đỏ" route="/demo/long-phung-v3-do" outerBackground="#ffffff" />;
}
