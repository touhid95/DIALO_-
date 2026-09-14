/**
 * Quick Verification Script for API Keys and Endpoints
 * 
 * Usage:
 *   node scripts/test-api-config.mjs
 */

import fs from 'fs';
import path from 'path';

// Load app/.env.local if exists
const envPath = path.resolve('app/.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val;
    }
  }
}

const SERPER_API_KEY = process.env.SERPER_API_KEY || "5c5aa21b0d574a48066209c779370c44b9284c6c";
const SERPER_PLACES_URL = process.env.SERPER_PLACES_URL || "https://google.serper.dev/places";
const SERPER_SEARCH_URL = process.env.SERPER_SEARCH_URL || "https://google.serper.dev/search";

const APOLLO_API_KEY = process.env.APOLLO_API_KEY || "GB19OqGFybJyvd0Feq-2VA";
const APOLLO_BASE_URL = process.env.APOLLO_BASE_URL || "https://api.apollo.io/api/v1";

const CALL_MODE = process.env.CALL_MODE || "synthetic";
const CALL_E_API_KEY = process.env.CALL_E_API_KEY || "";

console.log("=================================================================");
console.log("       EXTERNAL API KEYS & ENDPOINTS HEALTH VERIFIER             ");
console.log("=================================================================\n");

console.log("[Configuration Loaded]");
console.log(`- Serper Key:       ${SERPER_API_KEY ? SERPER_API_KEY.slice(0, 8) + '...' : 'MISSING'}`);
console.log(`- Serper Places:    ${SERPER_PLACES_URL}`);
console.log(`- Serper Search:    ${SERPER_SEARCH_URL}`);
console.log(`- Apollo Key:       ${APOLLO_API_KEY ? APOLLO_API_KEY.slice(0, 6) + '...' : 'MISSING'}`);
console.log(`- Apollo Base URL:  ${APOLLO_BASE_URL}`);
console.log(`- CALL-E Mode:      ${CALL_MODE}`);
console.log(`- CALL-E Key:       ${CALL_E_API_KEY ? CALL_E_API_KEY.slice(0, 6) + '...' : 'NONE (Simulator active)'}\n`);

async function testSerperPlaces() {
  process.stdout.write("1. Testing Serper Places Endpoint... ");
  const start = Date.now();
  try {
    const res = await fetch(SERPER_PLACES_URL, {
      method: "POST",
      headers: { "X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: "Dental Home Dhaka Bangladesh" }),
    });
    const elapsed = Date.now() - start;
    if (res.ok) {
      const data = await res.json();
      const place = data.places?.[0];
      console.log(`✅ OK (${elapsed}ms) - Resolved: "${place?.title}" (${place?.phoneNumber || 'No phone'})`);
    } else {
      console.log(`❌ HTTP ${res.status} (${elapsed}ms)`);
    }
  } catch (err) {
    console.log(`❌ Network Error: ${err.message}`);
  }
}

async function testSerperSearch() {
  process.stdout.write("2. Testing Serper Search Endpoint... ");
  const start = Date.now();
  try {
    const res = await fetch(SERPER_SEARCH_URL, {
      method: "POST",
      headers: { "X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: "Centrallawbd contact phone", num: 1 }),
    });
    const elapsed = Date.now() - start;
    if (res.ok) {
      const data = await res.json();
      console.log(`✅ OK (${elapsed}ms) - Returned ${data.organic?.length || 0} organic results`);
    } else {
      console.log(`❌ HTTP ${res.status} (${elapsed}ms)`);
    }
  } catch (err) {
    console.log(`❌ Network Error: ${err.message}`);
  }
}

async function testApollo() {
  process.stdout.write("3. Testing Apollo Contacts Search Endpoint... ");
  const start = Date.now();
  try {
    const res = await fetch(`${APOLLO_BASE_URL}/contacts/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": APOLLO_API_KEY },
      body: JSON.stringify({ api_key: APOLLO_API_KEY, page: 1, per_page: 1 }),
    });
    const elapsed = Date.now() - start;
    if (res.ok) {
      const data = await res.json();
      console.log(`✅ OK (${elapsed}ms) - API Reachable, total_entries: ${data.pagination?.total_entries ?? 0}`);
    } else {
      console.log(`⚠️ HTTP ${res.status} (${elapsed}ms)`);
    }
  } catch (err) {
    console.log(`❌ Network Error: ${err.message}`);
  }
}

async function testCalleSdk() {
  process.stdout.write("4. Testing CALL-E SDK Package (@call-e/calle)... ");
  try {
    const { CalleClient } = await import('../app/node_modules/@call-e/calle/dist/index.js');
    const client = new CalleClient({ apiKey: CALL_E_API_KEY || "smoke-test" });
    const hasGoals = typeof client.goals?.run === 'function';
    const hasCalls = typeof client.calls?.create === 'function';
    if (hasGoals && hasCalls) {
      console.log(`✅ OK - Installed & Verified (@call-e/calle@0.7.0, Goals & Calls APIs ready)`);
    } else {
      console.log(`⚠️ Installed, but unexpected method signature`);
    }
  } catch (err) {
    console.log(`❌ Import Failed: ${err.message}`);
  }
}

async function run() {
  await testSerperPlaces();
  await testSerperSearch();
  await testApollo();
  await testCalleSdk();
  console.log("\nAll checks completed.");
}

run();
