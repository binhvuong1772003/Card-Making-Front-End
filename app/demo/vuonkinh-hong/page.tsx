import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { vuonkinhHongDocument } from "@/lib/cards/demos/vuonkinh-hong";

export default function Page() {
  return <InvitationContentDemo document={vuonkinhHongDocument} title="Vườn Kính - Hồng" route="/demo/vuonkinh-hong" outerBackground="#ffffff" />;
}
