import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { renTheuTrangDocument } from "@/lib/cards/demos/ren-theu-trang";

export default function Page() {
  return <InvitationContentDemo document={renTheuTrangDocument} title="Ren Thêu - Trắng" route="/demo/ren-theu-trang" outerBackground="#ffffff" />;
}
