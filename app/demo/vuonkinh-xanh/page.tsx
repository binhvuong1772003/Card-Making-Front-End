import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { vuonkinhXanhDocument } from "@/lib/cards/demos/vuonkinh-xanh";

export default function Page() {
  return <InvitationContentDemo document={vuonkinhXanhDocument} title="Vườn Kính - Xanh" route="/demo/vuonkinh-xanh" outerBackground="#ffffff" />;
}
