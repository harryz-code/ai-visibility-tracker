import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AVT — AI Visibility Tracker",
  description:
    "Measure how brands appear in AI assistant answers with statistical rigor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-semibold tracking-tight text-zinc-900">
              AVT
            </Link>
            <nav className="flex gap-6 text-sm text-zinc-600">
              <Link href="/report" className="hover:text-zinc-900">
                Free report
              </Link>
              <Link href="/dashboard" className="hover:text-zinc-900">
                Dashboard
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
