import https from "https";

async function fetchUrl(url: string, headers: Record<string, string> = {}): Promise<{ status: number; text: string }> {
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
          ...headers,
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
  console.log("--- TEST 1: Yahoo Search ---");
  try {
    const y = await fetchUrl("https://search.yahoo.com/search?p=Dental+Clinics+Austin+TX");
    console.log("Yahoo Status:", y.status, "Length:", y.text.length);
    // Yahoo search results are in div.compTitle or a.fz-m
    const titles = [...y.text.matchAll(/<h3 class="title"[^>]*><a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)];
    console.log("Yahoo h3 titles found:", titles.length);
    titles.slice(0, 5).forEach((m, i) => {
      console.log(`  [Yahoo #${i + 1}] ${m[2].replace(/<[^>]+>/g, "").trim()} -> ${m[1]}`);
    });
  } catch (e: any) {
    console.log("Yahoo error:", e.message);
  }

  console.log("\n--- TEST 2: Mojeek Search ---");
  try {
    const m = await fetchUrl("https://www.mojeek.com/search?q=Dental+Clinics+Austin+TX");
    console.log("Mojeek Status:", m.status, "Length:", m.text.length);
    const mTitles = [...m.text.matchAll(/<a class="title"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)];
    console.log("Mojeek titles found:", mTitles.length);
    mTitles.slice(0, 5).forEach((item, i) => {
      console.log(`  [Mojeek #${i + 1}] ${item[2].replace(/<[^>]+>/g, "").trim()} -> ${item[1]}`);
    });
  } catch (e: any) {
    console.log("Mojeek error:", e.message);
  }
}

run();
