import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { anhDaoHongDocument } from "@/lib/cards/demos/anh-dao-hong";

export default function Page() {
  return <InvitationContentDemo document={anhDaoHongDocument} title="Anh Đào - Hồng" route="/demo/anh-dao-hong" outerBackground="#ffffff" />;
}
