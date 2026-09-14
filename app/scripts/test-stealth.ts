import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

async function run() {
  console.log("=== LAUNCHING REAL CHROME WITH PUPPETEER STEALTH ===");
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--window-size=1280,900",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log("Navigating to Google Search with Stealth...");
  await page.goto("https://www.google.com/search?q=Dentist+Austin+TX+clinic", {
    waitUntil: "domcontentloaded",
    timeout: 25000,
  });

  await new Promise((r) => setTimeout(r, 2000));

  const url = page.url();
  const title = await page.title();
  console.log("Stealth URL:", url);
  console.log("Stealth Title:", title);

  // Extract organic search cards
  const results = await page.evaluate(() => {
    const leads: Array<{ name: string; url: string; snippet: string }> = [];
    // Select all links with h3 inside
    const h3s = Array.from(document.querySelectorAll("h3"));
    h3s.forEach((h3) => {
      const a = h3.closest("a");
      const text = h3.textContent?.trim() || "";
      const href = a?.getAttribute("href") || "";
      if (text && href.startsWith("http") && !href.includes("google.com")) {
        leads.push({ name: text, url: href, snippet: "" });
      }
    });
    return leads;
  });

  console.log(`\nDiscovered ${results.length} REAL business leads directly from Google!`);
  results.slice(0, 5).forEach((lead, i) => {
    console.log(`[Google Lead #${i + 1}]`);
    console.log("  Name:   ", lead.name);
    console.log("  Website:", lead.url);
  });

  await browser.close();
}

run().catch(console.error);
