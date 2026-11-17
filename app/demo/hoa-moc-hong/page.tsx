import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { hoaMocHongDocument } from "@/lib/cards/demos/hoa-moc-hong";

export default function Page() {
  return <InvitationContentDemo document={hoaMocHongDocument} title="Hoa Mộc - Hồng" route="/demo/hoa-moc-hong" outerBackground="#ffffff" />;
}
