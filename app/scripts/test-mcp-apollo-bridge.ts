/**
 * Test: MCP Layer Convergence & Apollo API Single Source of Truth Synthesis
 * Run: npx tsx scripts/test-mcp-apollo-bridge.ts
 */

import { buildApolloSingleSourceOfTruth } from "../src/server/mcp/apollo-adapter";
import { unifiedMCPStore } from "../src/server/mcp/unified-schema";
import { DISCOVERY_FALLBACK_DORMANT } from "../src/server/mcp/search-adapter";

async function runTest() {
  console.log("===============================================================");
  console.log("TEST 1: Verifying Discovery Engine Fallback is DORMANT");
  console.log("===============================================================");
  console.log(`[Dormancy Status] DISCOVERY_FALLBACK_DORMANT = ${DISCOVERY_FALLBACK_DORMANT}`);
  if (!DISCOVERY_FALLBACK_DORMANT) {
    throw new Error("FAIL: DISCOVERY_FALLBACK_DORMANT should be true!");
  }
  console.log("✓ PASS: Discovery Engine Fallback chain is strictly DORMANT.\n");

  console.log("===============================================================");
  console.log("TEST 2: Testing MCP Layer Data Convergence (Apollo SSoT)");
  console.log("===============================================================");

  const sampleLLMArrays = {
    organization_domain: [
      "healthgrades.com",
      "zocdoc.com",
      "ada.org",
      "austindentalcare.com",
    ],
    client_location: [
      "Austin, TX (Downtown / Central)",
      "Round Rock, TX",
      "Cedar Park, TX",
      "Pflugerville, TX",
      "Georgetown, TX",
      "Buda, TX",
      "Kyle, TX",
      "Lakeway, TX",
      "Leander, TX",
      "West Lake Hills, TX",
      "Bee Cave, TX",
      "San Marcos, TX",
      "The Domain / North Austin, TX",
      "South Congress / SoCo, TX",
      "East Austin, TX",
      "Travis County, TX",
      "Williamson County, TX",
      "Hays County, TX",
      "Bastrop, TX",
      "Dripping Springs, TX",
    ],
    keywords: [
      "Dentist",
      "Dental Clinic",
      "Cosmetic Dentistry",
      "Invisalign Provider",
      "Pediatric Dentist",
      "Oral Surgeon",
      "Implant Specialist",
    ],
  };

  const sampleMetrics = {
    industry: "Dental & Healthcare Clinics",
    company_size: "20–40 employees",
    pricing: "$500–$2,000/mo",
    focus: "CALL-E Phone Qualification",
  };

  const apolloSSoT = await buildApolloSingleSourceOfTruth({
    llmArrays: sampleLLMArrays,
    userMetrics: sampleMetrics,
    decisionMakerTitles: ["Owner", "Lead Dentist", "Practice Manager", "Clinical Director"],
  });

  console.log("[Apollo SSoT Generated]");
  console.log(`- Source: ${apolloSSoT.source}`);
  console.log(`- Discovery Engine: ${apolloSSoT.discoveryEngineStatus}`);
  console.log(`- Target Domains (${apolloSSoT.searchPayload.q_organization_domains_list.length}):`, apolloSSoT.searchPayload.q_organization_domains_list);
  console.log(`- Target Locations (${apolloSSoT.searchPayload.person_locations.length}):`, apolloSSoT.searchPayload.person_locations.slice(0, 4), "...and more");
  console.log(`- Employee Ranges:`, apolloSSoT.searchPayload.organization_num_employees_ranges);
  console.log(`- Decision Maker Titles:`, apolloSSoT.searchPayload.person_titles);
  console.log(`- Keyword Tags:`, apolloSSoT.searchPayload.q_organization_keyword_tags);
  console.log(`- Enrichment Records Queued:`, apolloSSoT.enrichmentPayload.recordsToMatch.length);

  // Assertions
  if (apolloSSoT.searchPayload.q_organization_domains_list.length === 0) {
    throw new Error("FAIL: Target domains list is empty");
  }
  if (apolloSSoT.searchPayload.person_locations.length < 15) {
    throw new Error("FAIL: Person locations should contain ~20 granular sub-locations");
  }
  if (!apolloSSoT.searchPayload.organization_num_employees_ranges.includes("11,20")) {
    throw new Error("FAIL: Employee ranges did not map 20-40 employees correctly");
  }
  if (apolloSSoT.discoveryEngineStatus !== "DORMANT") {
    throw new Error("FAIL: Discovery engine status should be DORMANT");
  }

  console.log("\n✓ PASS: All Apollo API Single Source of Truth assertions passed.\n");

  console.log("===============================================================");
  console.log("TEST 3: Saving into unifiedMCPStore and verifying retrieval");
  console.log("===============================================================");

  const recordId = `unified_test_${Date.now()}`;
  await unifiedMCPStore.saveRecord({
    id: recordId,
    organizationId: "00000000-0000-0000-0000-000000000001",
    generatedAt: new Date().toISOString(),
    status: "synthesized",
    llmArrays: sampleLLMArrays,
    userMetrics: sampleMetrics,
    compiledQueries: {
      core: sampleLLMArrays.keywords,
      google: "test query",
      linkedin: "test query",
      yellowpages: "test query",
    },
    decisionMakerTitles: ["Owner", "CEO"],
    positiveSignals: ["Active phone"],
    negativeSignals: ["Corporate"],
    apolloPayload: apolloSSoT,
  });

  const retrieved = unifiedMCPStore.getRecord(recordId);
  if (!retrieved || !retrieved.apolloPayload) {
    throw new Error("FAIL: Could not retrieve saved record from unifiedMCPStore");
  }

  console.log(`✓ PASS: Stored and retrieved record ${retrieved.id} with complete Apollo SSoT.`);
  console.log("===============================================================");
  console.log("ALL MCP APOLLO BRIDGE TESTS PASSED!");
  console.log("===============================================================");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
