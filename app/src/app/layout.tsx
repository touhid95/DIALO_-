import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DIAL O — Autonomous Lead Intelligence & CALL-E Voice Copilot",
  description:
    "Autonomous lead discovery, multimodal criteria ingestion, evidence-based qualification, and live CALL-E voice calls.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-black text-white selection:bg-[#00FFFF] selection:text-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
