import type { Metadata } from "next";
import { Lalezar } from "next/font/google";
import "./globals.css";

const lalezar = Lalezar({
  variable: "--font-lalezar",
  subsets: ["arabic"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wordchallenge.tech"),
  applicationName: "تحدي المفردات | Word Challenge",
  title: {
    default: "تحدي المفردات | Word Challenge",
    template: "%s | تحدي المفردات"
  },
  description: "لعبة كلمات ممتعة وتنافسية للعب مع الأصدقاء والعائلة. انضم لتحدي أصدقائك في لعبة الكلمات العربية المثيرة للواقع.",
  keywords: ["لعبة كلمات", "تحدي المفردات", "لعبة جماعية", "ألعاب عربية", "Word Game", "Arabic Game"],
  authors: [{ name: "Word Challenge", url: "https://wordchallenge.tech/" }],
  openGraph: {
    title: "تحدي المفردات | Word Challenge",
    description: "لعبة كلمات ممتعة وتنافسية للعب مع الأصدقاء والعائلة. انضم لتحدي أصدقائك في لعبة الكلمات العربية المثيرة للواقع.",
    url: "https://wordchallenge.tech/",
    siteName: "تحدي المفردات",
    locale: "ar",
    type: "website",
    images: [
      {
        url: "https://wordchallenge.tech/favicon.ico",
        width: 1200,
        height: 630,
        alt: "تحدي المفردات | Word Challenge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "تحدي المفردات | Word Challenge",
    description: "لعبة كلمات ممتعة وتنافسية للعب مع الأصدقاء والعائلة. انضم لتحدي أصدقائك في لعبة الكلمات العربية المثيرة للواقع.",
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
    <html lang="ar">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playpen+Sans+Arabic:wght@100..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${lalezar.variable} antialiased font-sans`}
      >
        {children}
        <Toaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}
