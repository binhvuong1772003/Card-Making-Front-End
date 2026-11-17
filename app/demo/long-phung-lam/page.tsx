import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { longPhungLamDocument } from "@/lib/cards/demos/long-phung-lam";

export default function Page() {
  return <InvitationContentDemo document={longPhungLamDocument} title="Long Phụng - Lam" route="/demo/long-phung-lam" outerBackground="#ffffff" />;
}
