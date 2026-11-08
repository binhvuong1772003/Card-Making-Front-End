import type { Metadata } from "next";
import "./globals.css";
import { Be_Vietnam_Pro, Cormorant_Garamond } from "next/font/google";
import { CARD_FONTS_HREF } from "@/lib/cards/fonts";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";

// Chữ có chân cho các hình minh hoạ thiệp (tên cô dâu chú rể); chỉ dùng trong hình, không phải chữ của giao diện.
const serif = Cormorant_Garamond({ subsets: ["latin", "vietnamese"], weight: ["500", "600"], variable: "--font-serif", display: "swap" });
const sans = Be_Vietnam_Pro({ subsets: ["latin", "latin-ext", "vietnamese"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "CardMaking",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={cn("font-sans", sans.variable, serif.variable)}>
      <head>
        {/* Chữ cho thiệp (xem lib/cards/fonts.ts): phải là liên kết stylesheet ở head để Miditor chép được vào khung canvas. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={CARD_FONTS_HREF} />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
