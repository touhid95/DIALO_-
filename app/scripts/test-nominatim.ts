import https from "https";

async function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: "GET",
        headers: {
          "User-Agent": "LeadIntel-Scraper/1.0 (contact@leadintel.app)",
          "Accept": "application/json",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ error: "Invalid JSON", text: data });
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function run() {
  console.log("=== TESTING OPEN REAL BUSINESS DATABASE (NOMINATIM / OSM) ===");
  const url = "https://nominatim.openstreetmap.org/search?q=dental+clinic+in+Austin+TX&format=json&addressdetails=1&extratags=1&limit=10";
  const data = await fetchJson(url);
  
  if (Array.isArray(data)) {
    console.log(`Found ${data.length} 100% REAL registered businesses:`);
    data.slice(0, 5).forEach((item: any, i: number) => {
      console.log(`\n[Real Business #${i + 1}]`);
      console.log(`  Name:     ${item.name || item.display_name.split(",")[0]}`);
      console.log(`  Address:  ${item.display_name}`);
      console.log(`  Type:     ${item.type}`);
      console.log(`  Phone:    ${item.extratags?.phone || item.extratags?.["contact:phone"] || "N/A"}`);
      console.log(`  Website:  ${item.extratags?.website || item.extratags?.["contact:website"] || "N/A"}`);
    });
  } else {
    console.log("Response:", data);
  }
}

run().catch(console.error);
