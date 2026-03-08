import type { Metadata } from "next";
import { Noto_Sans_Bengali, Noto_Serif_Bengali, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ToastViewport } from "@/components/ui/toast";
import { ReduxProvider } from "@/lib/store/provider";

const notoSansBangla = Noto_Sans_Bengali({
  variable: "--font-bangla-sans",
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600", "700"],
});

const notoSerifBangla = Noto_Serif_Bengali({
  variable: "--font-bangla-serif",
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-english-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "স্বাদবাজার | বাংলাদেশের অনলাইন স্বাদের ঠিকানা",
  description: "বাংলাদেশের জনপ্রিয় আঞ্চলিক স্বাদ, মসলা ও দৈনন্দিন মালের নির্ভরযোগ্য ই-কমার্স।",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className={`${notoSansBangla.variable} ${notoSerifBangla.variable} ${spaceGrotesk.variable} antialiased`}>
        <ReduxProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <ToastViewport />
        </ReduxProvider>
      </body>
    </html>
  );
}
