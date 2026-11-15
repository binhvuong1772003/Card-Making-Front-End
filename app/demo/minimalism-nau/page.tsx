import type { Metadata } from "next";
import { normalizeCardDocument } from "@/lib/cards/document";
import { minimalismNauDemoDocument } from "@/lib/cards/demos/minimalism-nau";
import { MinimalismNauDemo } from "@/components/demos/minimalism-nau-demo";

export const metadata: Metadata = { title: "Minimalism - Nâu · Bản dựng thử", robots: { index: false, follow: false } };

export default function MinimalismNauDemoPage() {
  return <MinimalismNauDemo document={normalizeCardDocument(minimalismNauDemoDocument)} />;
}
