import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { vuonXuanDoDocument } from "@/lib/cards/demos/vuon-xuan-do";

export default function Page() {
  return <InvitationContentDemo document={vuonXuanDoDocument} title="Vườn Xuân - Đỏ" route="/demo/vuon-xuan-do" outerBackground="#ffffff" />;
}
