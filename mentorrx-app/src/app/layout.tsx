import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "MentorRx — Healthcare & Pharma Mentorship Marketplace",
    template: "%s | MentorRx",
  },
  description:
    "Connect with top Healthcare & Pharma mentors. Book 1-on-1 sessions with Medical Affairs, MSL, Regulatory, and Clinical experts.",
  keywords: [
    "healthcare mentorship",
    "pharma mentor",
    "MSL career",
    "medical affairs mentor",
    "regulatory affairs coaching",
    "clinical research mentor",
  ],
  openGraph: {
    title: "MentorRx — Healthcare & Pharma Mentorship",
    description: "Book sessions with top Healthcare & Pharma professionals.",
    url: "https://mentorrx.com",
    siteName: "MentorRx",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MentorRx — Healthcare & Pharma Mentorship",
    description: "Book sessions with top Healthcare & Pharma professionals.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
