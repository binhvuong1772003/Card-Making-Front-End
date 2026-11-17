import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { chibiRedDocument } from "@/lib/cards/demos/chibi-red";

export default function Page() {
  return <InvitationContentDemo document={chibiRedDocument} title="Chibi - Đỏ" route="/demo/chibi-red" outerBackground="#ffffff" />;
}
