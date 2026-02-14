import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Noto_Serif_Thai } from "next/font/google";

import "./globals.css";

const _playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const _inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const _notoSerifThai = Noto_Serif_Thai({
  subsets: ["thai"],
  variable: "--font-noto-serif-thai",
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Happy Valentine's Day 💕",
  description: "A special Valentine's Day message just for you ❤️",
  openGraph: {
    title: "Happy Valentine's Day 💕",
    description: "Someone has a special Valentine's message for you ❤️",
    type: "website",
    locale: "th_TH",
  },
  twitter: {
    card: "summary",
    title: "Happy Valentine's Day 💕",
    description: "Someone has a special Valentine's message for you ❤️",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#1a0a0d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${_playfair.variable} ${_inter.variable} ${_notoSerifThai.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
