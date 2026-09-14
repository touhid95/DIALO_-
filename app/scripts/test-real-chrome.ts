import puppeteer from "puppeteer-core";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const page = await browser.newPage();
  await page.goto("https://www.google.com/search?q=Dental+Clinics+Austin+TX");
  await new Promise((r) => setTimeout(r, 1500));

  const title = await page.title();
  const url = page.url();
  console.log("GOOGLE LANDING URL:", url);
  console.log("GOOGLE LANDING TITLE:", title);

  const text = await page.evaluate(() => document.body.innerText.slice(0, 300));
  console.log("GOOGLE BODY TEXT:", text);

  await browser.close();
}

run().catch(console.error);
