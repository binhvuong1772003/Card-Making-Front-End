import type { Metadata } from "next";
import { WeddingDemo } from "@/components/demos/wedding-demo";
import { editorFont } from "@/components/editor/fonts";

export const metadata: Metadata = { title: "Hoa Mộc Xanh · Bản dựng thử", robots: { index: false, follow: false } };

export default function HoaMocXanhDemoPage() {
  return <div className={editorFont.variable}><WeddingDemo /></div>;
}
