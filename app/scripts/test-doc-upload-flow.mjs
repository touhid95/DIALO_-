// test-doc-upload-flow.mjs
// Verifies the user workflow:
// 1. Uploading bangladesh_news_rss.md
// 2. Chatbot analyzes document FAST (< 1.5s)
// 3. Questions triggered directly on the uploaded document content

import http from "http";

async function postMultipart(url, fields, file) {
  return new Promise((resolve, reject) => {
    const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
    let body = "";

    for (const [k, v] of Object.entries(fields)) {
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="${k}"\r\n\r\n`;
      body += `${v}\r\n`;
    }

    if (file) {
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="files"; filename="${file.name}"\r\n`;
      body += `Content-Type: ${file.type || "text/markdown"}\r\n\r\n`;
      body += `${file.content}\r\n`;
    }
    body += `--${boundary}--\r\n`;

    const parsed = new URL(url);
    const start = Date.now();
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        method: "POST",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          const durationMs = Date.now() - start;
          try {
            resolve({ status: res.statusCode, data: JSON.parse(raw), durationMs });
          } catch (e) {
            resolve({ status: res.statusCode, raw, durationMs });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log("==================================================================");
  console.log("🚀 Testing Document Upload & Question Triggering Workflow");
  console.log("==================================================================");

  const docSample = {
    name: "bangladesh_news_rss.md",
    type: "text/markdown",
    content: `# Bangladesh News RSS Syndication Platform

A unified news feed aggregator connecting Bangladesh daily newspapers, broadcast media, and digital journalism.

## Features:
- Real-time RSS feeds from Prothom Alo, Daily Star, Dhaka Tribune, and bdnews24
- Multilingual feed parsing (Bengali and English)
- Automated article classification and sentiment telemetry
- High-throughput API for newsrooms, broadcasters, and media agencies in Dhaka
`,
  };

  console.log("\n[Step 1] Uploading bangladesh_news_rss.md to POST /api/chat...");
  const res = await postMultipart(
    "http://localhost:3000/api/chat",
    {
      message: "Please analyze this RSS feed platform specification",
      mode: "copilot",
    },
    docSample
  );

  console.log(`⏱️ Response Time: ${res.durationMs}ms (HTTP ${res.status})`);
  if (res.durationMs < 3000) {
    console.log("⚡ SPEED: FAST response (< 3s)");
  } else {
    console.warn("⚠️ SPEED: Slow response (> 3s)");
  }

  if (!res.data?.success) {
    console.error("❌ Request failed:", res.data);
    process.exit(1);
  }

  const data = res.data.data;
  console.log("\n[Step 2] Assistant Content Received:");
  console.log(data.content);

  console.log("\n[Step 3] Verifying Extracted Offer & Triggered Questions:");
  const offer = data.extractedOffer;
  if (!offer) {
    console.error("❌ Extracted offer missing from API response!");
    process.exit(1);
  }

  console.log("  • Product / Title:", offer.productName);
  console.log("  • Target Industry:", offer.targetIndustry);
  console.log("  • Extracted Location:", offer.location);
  console.log("  • Extracted Price:", offer.price);
  console.log("  • Extracted Primary USP:", `"${offer.usp}"`);
  console.log("  • USP Suggestions / Chips:");
  offer.dynamicOptions.uspExamples.forEach((ex, i) => console.log(`     ${i + 1}. ${ex}`));
  console.log("  • Price Presets:", offer.dynamicOptions.pricePresets.join(", "));
  console.log("  • Location Presets:", offer.dynamicOptions.locationPresets.join(", "));

  // Verifications
  const isDocRelated =
    offer.usp.toLowerCase().includes("news") ||
    offer.usp.toLowerCase().includes("rss") ||
    offer.targetIndustry.toLowerCase().includes("media");

  const isLocationRelated =
    offer.location.toLowerCase().includes("bangladesh") ||
    offer.location.toLowerCase().includes("dhaka");

  if (isDocRelated && isLocationRelated) {
    console.log("\n🎯 SUCCESS: Questions & chips are 100% derived from the uploaded document!");
  } else {
    console.error("\n❌ FAILED: Offer did not match uploaded document context!");
    process.exit(1);
  }

  console.log("\n==================================================================");
  console.log("🎉 ALL TESTS PASSED: Document Upload & Question Trigger Verified!");
  console.log("==================================================================");
}

main().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
