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

async function run() {
  console.log("=== TESTING YELLOWPAGES LIVE FETCH ===");
  const yp = await fetchUrl("https://www.yellowpages.com/austin-tx/dentists");
  console.log("YP Status:", yp.status, "Length:", yp.text.length);
  const bizMatches = [...yp.text.matchAll(/class="business-name"[^>]*><span>([\s\S]*?)<\/span>/g)].map(m => m[1]);
  console.log("YP Businesses found:", bizMatches.length);
  console.log("Sample YP Businesses:", bizMatches.slice(0, 10));

  const phoneMatches = [...yp.text.matchAll(/class="phones phone primary"[^>]*>([\s\S]*?)<\/div>/g)].map(m => m[1]);
  console.log("YP Phones found:", phoneMatches.length);
  console.log("Sample YP Phones:", phoneMatches.slice(0, 10));
}

run();
