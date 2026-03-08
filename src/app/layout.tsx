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
  title: "স্টাইলঘর | বাংলাদেশের ফ্যামিলি ফ্যাশন মার্কেটপ্লেস",
  description: "স্টাইলঘর থেকে বাচ্চা থেকে বড় সবার পোশাক, জুতো আর এক্সেসরিজ এক জায়গায়—দ্রুত ডেলিভারি ও বিশ্বস্ত মানের নিশ্চয়তায়।",
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
