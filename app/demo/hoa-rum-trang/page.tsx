import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { hoaRumTrangDocument } from "@/lib/cards/demos/hoa-rum-trang";

export default function Page() {
  return <InvitationContentDemo document={hoaRumTrangDocument} title="Hoa Rum - Trắng" route="/demo/hoa-rum-trang" outerBackground="#ffffff" />;
}
