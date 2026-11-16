import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { vuonXuanXanhDocument } from "@/lib/cards/demos/vuon-xuan-xanh";

export default function Page() {
  return <InvitationContentDemo document={vuonXuanXanhDocument} title="Vườn Xuân - Xanh" route="/demo/vuon-xuan-xanh" outerBackground="#ffffff" />;
}
