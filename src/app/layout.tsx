import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/providers/ClientProviders";
import Chatbot from "@/components/layout/Chatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NewsScript AI | Viral News-to-Script Platform",
  description: "Aggregate trending news across multiple categories and instantly generate high-engagement scripts for YouTube, Reels, and news channels using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
        <ClientProviders>
          {children}
          <Chatbot />
        </ClientProviders>
      </body>
    </html>
  );
}

