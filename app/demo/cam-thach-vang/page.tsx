import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { camThachVangDocument } from "@/lib/cards/demos/cam-thach-vang";

export default function Page() {
  return <InvitationContentDemo document={camThachVangDocument} title="Cẩm Thạch – Vàng" route="/demo/cam-thach-vang" outerBackground="#ffffff" />;
}
