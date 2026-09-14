import https from "https";

async function fetchUrl(url: string): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode || 0, text: data }));
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function unwrapBingUrl(url: string): string {
  try {
    const uMatch = url.match(/[?&]u=a1([a-zA-Z0-9_-]+)/);
    if (uMatch) {
      let b64 = uMatch[1].replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4 !== 0) b64 += "=";
      return Buffer.from(b64, "base64").toString("utf-8");
    }
  } catch (e) {}
  return url;
}

async function run() {
  const url = "https://www.bing.com/search?q=Austin+dental+clinic+dentist&mkt=en-us&setlang=en";
  const b = await fetchUrl(url);

  const h2Regex = /<h2[^>]*><a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a><\/h2>/g;
  const matches = [...b.text.matchAll(h2Regex)];

  matches.forEach((m, i) => {
    const rawHref = m[1];
    const rawTitle = m[2].replace(/<[^>]+>/g, "").trim();
    const unwrapped = unwrapBingUrl(rawHref);
    console.log(`[Result #${i + 1}]`);
    console.log("  Title:    ", rawTitle);
    console.log("  Website:  ", unwrapped);
  });
}

run();
