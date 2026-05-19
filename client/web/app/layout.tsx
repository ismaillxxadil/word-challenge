import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Playpen_Sans_Arabic } from "next/font/google";
import "./globals.css";

const playpenSansArabic = Playpen_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-lalezar",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wordchallenge.tech"),
  applicationName: "تحدي المفردات",
  title: {
    default: "تحدي المفردات",
    template: "%s | تحدي المفردات",
  },
  description:
    "لعبة كلمات ممتعة وتنافسية للعب مع الأصدقاء. انضم لتحدي أصدقائك في لعبة الكلمات العربية المثيرة للواقع.",
  keywords: [
    "لعبة كلمات",
    "تحدي المفردات",
    "لعبة جماعية",
    "ألعاب عربية",
    "تحدي الكلمات"
  ],
  authors: [{ name: "Word Challenge", url: "https://wordchallenge.tech/" }],
  openGraph: {
    title: "تحدي المفردات ",
    description:
      "لعبة كلمات ممتعة وتنافسية للعب مع الأصدقاء. انضم لتحدي أصدقائك في لعبة الكلمات العربية المثيرة للواقع.",
    url: "https://wordchallenge.tech/",
    siteName: "تحدي المفردات",
    locale: "ar",
    type: "website",
    images: [
      {
        url: "https://wordchallenge.tech/favicon.ico",
        width: 1200,
        height: 630,
        alt: "تحدي المفردات ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "تحدي المفردات ",
    description:
      "لعبة كلمات ممتعة وتنافسية للعب مع الأصدقاء. انضم لتحدي أصدقائك في لعبة الكلمات العربية المثيرة للواقع.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" className={playpenSansArabic.variable}>
      <body className="antialiased font-sans">
        {children}
        <Toaster position="top-center" richColors theme="dark" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
