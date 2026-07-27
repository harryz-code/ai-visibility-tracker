import type { Metadata } from "next";
import { Space_Grotesk, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "AVT — AI Visibility Tracker",
  description:
    "Measure how brands appear in AI assistant answers with statistical rigor.",
  icons: {
    icon: [
      { url: "/brand/favicon-32.svg", type: "image/svg+xml", sizes: "32x32" },
      { url: "/brand/favicon-16.svg", type: "image/svg+xml", sizes: "16x16" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.svg", sizes: "180x180" }],
  },
  openGraph: {
    images: [{ url: "/brand/og-default.svg", width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${space.variable} ${hanken.variable} ${jetbrains.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
