import type { Metadata } from "next";
import { Lalezar, Cairo } from "next/font/google";
import "./globals.css";

const lalezar = Lalezar({
  variable: "--font-lalezar",
  subsets: ["arabic"],
  weight: "400",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "تحدي المفردات",
  description: "لعبة كلمات ممتعة وتنافسية للعب مع الأصدقاء والعائلة.",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar">
      <body
        className={`${lalezar.variable} ${cairo.variable} antialiased font-sans`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
