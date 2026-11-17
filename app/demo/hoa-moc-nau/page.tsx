import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { hoaMocNauDocument } from "@/lib/cards/demos/hoa-moc-nau";

export default function Page() {
  return <InvitationContentDemo document={hoaMocNauDocument} title="Hoa Mộc - Nâu" route="/demo/hoa-moc-nau" outerBackground="#ffffff" />;
}
