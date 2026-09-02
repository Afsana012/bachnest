import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "BachNest | Modern Bachelor Living & Accommodation",
    template: "%s | BachNest",
  },
  description:
    "Find verified bachelor apartments, sublets, flatshares, and compatible roommates with smart compatibility scoring and emergency safety features.",
  keywords: [
    "bachelor accommodation",
    "roommate finder",
    "flatshare",
    "student housing",
    "sublet",
    "BachNest",
  ],
  authors: [{ name: "BachNest Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bachnest.com",
    title: "BachNest | Modern Bachelor Living & Accommodation",
    description:
      "Find verified bachelor accommodations and compatible roommates with verified safety and seamless tenancy management.",
    siteName: "BachNest",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
