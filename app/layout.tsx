/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
import type { Metadata, Viewport } from "next";
import { DM_Sans, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { TEXT_SIZE_SCRIPT } from "@/lib/textSize";
import FloatingButtons from "@/components/FloatingButtons";

// Main font for the whole app
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

// Hindi font. Not preloaded, so it only downloads when Hindi text is on screen.
const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  display: "swap",
  preload: false,
});

// Tab title stays plain: no health details in page titles
export const metadata: Metadata = {
  title: "LaterUp",
  description: "A private wellness companion for midlife.",
};

export const viewport: Viewport = {
  themeColor: "#FAF5EE",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${notoDevanagari.variable} h-full`}
      suppressHydrationWarning // the text size script below may set data-text-size first
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEXT_SIZE_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <FloatingButtons />
      </body>
    </html>
  );
}
