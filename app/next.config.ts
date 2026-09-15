import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: [
    "pdf-parse",
    "pdfjs-dist",
    "@napi-rs/canvas",
    "mammoth",
    "crawlee",
    "@crawlee/cheerio",
    "@crawlee/core",
    "@crawlee/browser-pool",
    "@crawlee/puppeteer",
    "@crawlee/playwright"
  ],
};

export default nextConfig;
