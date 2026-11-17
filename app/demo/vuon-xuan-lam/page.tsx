import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { vuonXuanLamDocument } from "@/lib/cards/demos/vuon-xuan-lam";

export default function Page() {
  return <InvitationContentDemo document={vuonXuanLamDocument} title="Vườn Xuân - Lam" route="/demo/vuon-xuan-lam" outerBackground="#ffffff" />;
}
