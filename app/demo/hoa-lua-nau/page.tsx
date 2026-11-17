import { InvitationContentDemo } from "@/components/demos/invitation-content-demo";
import { hoaLuaNauDocument } from "@/lib/cards/demos/hoa-lua-nau";

export default function Page() {
  return <InvitationContentDemo document={hoaLuaNauDocument} title="Hoa Lụa - Nâu" route="/demo/hoa-lua-nau" outerBackground="#ffffff" />;
}
