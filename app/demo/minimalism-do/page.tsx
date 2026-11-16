import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { minimalismDoDocument } from "@/lib/cards/demos/minimalism-do";

export default function Page() {
  return <InvitationContentDemo document={minimalismDoDocument} title="Minimalism - Đỏ" route="/demo/minimalism-do" outerBackground="#ffffff" />;
}
