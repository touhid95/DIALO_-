import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Flex } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const robotoFlex = Roboto_Flex({
  subsets: ["latin"],
  variable: "--font-roboto-flex",
  display: "swap",
  axes: ["wdth", "opsz", "GRAD"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F8FA" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "DIAL-O — Autonomous Lead Intelligence & CALL-E Voice Copilot",
  description:
    "Autonomous lead discovery, multimodal criteria ingestion, evidence-based qualification, and live CALL-E voice calls.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DIAL-O",
  },
  icons: {
    icon: "/images/logo.svg",
    apple: "/images/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoFlex.variable}`}>
      <head>
        {/* Early platform detection to apply platform-ios, platform-android, or platform-browser before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var ua = navigator.userAgent || "";
                  var platform = navigator.platform || "";
                  var isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
                  var isAndroid = /Android/.test(ua);
                  var doc = document.documentElement;
                  if (isIOS) {
                    doc.classList.add('platform-ios');
                  } else if (isAndroid) {
                    doc.classList.add('platform-android');
                  } else {
                    doc.classList.add('platform-browser');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&display=swap" />
        <link rel="preload" href="/fonts/sf-pro/sf-pro-display-300.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/sf-pro/sf-pro-display-700.woff" as="font" type="font/woff" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/sf-pro/sf-pro-display-100.woff" as="font" type="font/woff" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased bg-black text-white selection:bg-[#00FFFF] selection:text-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
