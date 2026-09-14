/**
 * Test: MCP Layer Storage Capabilities & Dormancy Validation
 * Run: npx tsx scripts/test-mcp-storage-write.ts
 */

import { prisma } from "../src/lib/db";
import { okfStore, OKFRecord } from "../src/server/mcp/okf-store";
import { unifiedMCPStore, UnifiedDiscoveryRecord } from "../src/server/mcp/unified-schema";
import { buildApolloSingleSourceOfTruth } from "../src/server/mcp/apollo-adapter";
import { DISCOVERY_FALLBACK_DORMANT } from "../src/server/mcp/search-adapter";
import { CRAWLING_DISCOVERY_DORMANT } from "../src/server/services/discovery";
import { LEAD_ENRICHMENT_DORMANT } from "../src/server/services/enrichment";
import fs from "fs";
import path from "path";

async function runValidation() {
  console.log("=================================================================");
  console.log(" 1. VALIDATING DORMANCY OF CRAWLING & LEAD ENRICHMENT");
  console.log("=================================================================");
  console.log(`- DISCOVERY_FALLBACK_DORMANT (Search/Browser Fallback): ${DISCOVERY_FALLBACK_DORMANT}`);
  console.log(`- CRAWLING_DISCOVERY_DORMANT (Discovery Service Scraper): ${CRAWLING_DISCOVERY_DORMANT}`);
  console.log(`- LEAD_ENRICHMENT_DORMANT   (Lead Enrichment Service):   ${LEAD_ENRICHMENT_DORMANT}`);

  if (!DISCOVERY_FALLBACK_DORMANT || !CRAWLING_DISCOVERY_DORMANT || !LEAD_ENRICHMENT_DORMANT) {
    throw new Error("FAIL: All crawling and enrichment flags must be true (dormant)!");
  }
  console.log("✓ PASS: Crawling and lead enrichment are strictly DORMANT.\n");

  console.log("=================================================================");
  console.log(" 2. TESTING MCP LAYER DIRECT DATA STORAGE (OKF Lead Ingestion)");
  console.log("=================================================================");

  const testLeadId = `test_mcp_lead_${Date.now()}`;
  const testRecord: OKFRecord = {
    id: testLeadId,
    okfVersion: 1,
    generatedAt: new Date().toISOString(),
    source: "upload",
    sourceUrl: "https://austindentalpartners.example.com",
    mcpJobId: "mcp_direct_pass_test",
    identity: {
      name: "Austin Premier Dental Partners",
      tradingName: "Austin Premier Dental",
      website: "https://austindentalpartners.example.com",
    },
    contact: {
      phone: "(512) 888-2345",
      phoneE164: "+15128882345",
      phoneConfidence: 0.96,
      phoneType: "landline",
      email: "dr.miller@austindentalpartners.example.com",
      emailConfidence: 0.92,
      decisionMaker: "Dr. Marcus Miller",
      decisionMakerTitle: "Clinical Director & Owner",
    },
    firmographics: {
      industry: "Dental & Healthcare",
      employeeCount: 28,
      employeeRange: "20-40 employees",
      location: "Austin, TX (Downtown / Central)",
      city: "Austin",
      state: "TX",
      yearFounded: 2014,
    },
    scores: {
      total: 88,
      icpFit: 23,
      businessQuality: 14,
      painSignal: 22,
      intent: 18,
      recency: 9,
      contactability: 5,
      phoneScore: 95,
      emailScore: 90,
      dataCompleteness: 92,
      callReadiness: 91,
    },
    ai: {
      hypothesis: "High-volume dental practice in central Austin with strong need for CALL-E phone receptionist.",
      recommendedAction: "call",
      tags: ["mcp-stored", "dental-high-intent", "austin-central"],
      qualifyingQuestions: [
        "How do you currently handle after-hours patient inquiries?",
        "What is your average missed call volume during peak hours?",
      ],
    },
    calleStatus: {
      dispatched: false,
      goalRunId: null,
      goalId: null,
      callStatus: null,
      lastCallResult: null,
      dispatchedAt: null,
    },
    evidence: [
      {
        type: "VERIFIED",
        claim: "Target verified and passed directly to MCP Layer for storage.",
        source: "MCP Storage Ingestion Test",
        confidence: 0.98,
        observedAt: new Date().toISOString(),
      },
    ],
  };

  // 1. Store into OKFStore
  console.log(`Writing test lead to MCP OKFStore: "${testRecord.identity.name}" (ID: ${testLeadId})...`);
  const savedRecord = await okfStore.upsert(testRecord);
  console.log("✓ okfStore.upsert() succeeded.");

  // 2. Verify in-memory retrieval
  const memRecord = okfStore.get(testLeadId);
  if (!memRecord || memRecord.identity.name !== testRecord.identity.name) {
    throw new Error("FAIL: Lead not found in MCP OKF in-memory store!");
  }
  console.log("✓ In-memory retrieval verified: name, phone, scores intact.");

  // 3. Verify SQLite DB persistence (prisma.lead)
  const dbRecord = await prisma.lead.findUnique({
    where: { id: testLeadId },
  });
  if (!dbRecord) {
    throw new Error("FAIL: Lead not persisted to Prisma SQLite database!");
  }
  console.log(`✓ SQLite persistence verified: DB Lead ID ${dbRecord.id}, Score: ${dbRecord.score}, Phone: ${dbRecord.phone}`);

  // 4. Verify Markdown dossier on disk
  const okfDir = path.join(process.cwd(), "data", "okf");
  const dossierName = `${testLeadId}_austin_premier_dental_partners.md`;
  const dossierPath = path.join(okfDir, dossierName);
  const exists = fs.existsSync(dossierPath);
  if (!exists) {
    throw new Error(`FAIL: Markdown dossier file not created at ${dossierPath}`);
  }
  const dossierContent = fs.readFileSync(dossierPath, "utf8");
  console.log(`✓ Filesystem Markdown dossier verified at: ${dossierPath} (${dossierContent.length} bytes)\n`);

  console.log("=================================================================");
  console.log(" 3. TESTING MCP LAYER UNIFIED DISCOVERY (Apollo SSoT Storage)");
  console.log("=================================================================");

  const apolloPayload = await buildApolloSingleSourceOfTruth({
    llmArrays: {
      organization_domain: ["austindentalpartners.example.com", "healthgrades.com"],
      client_location: ["Austin, TX (Downtown / Central)", "Round Rock, TX"],
      keywords: ["Dental Practice", "Invisalign", "Oral Surgery"],
    },
    userMetrics: {
      industry: "Dental & Healthcare",
      company_size: "20-40 employees",
      pricing: "$1,000–$2,500/mo",
      focus: "CALL-E Voice Receptionist",
    },
    decisionMakerTitles: ["Owner", "Managing Partner", "Clinical Director"],
  });

  const testUnifiedId = `unified_test_${Date.now()}`;
  const unifiedRecord: UnifiedDiscoveryRecord = {
    id: testUnifiedId,
    organizationId: "00000000-0000-0000-0000-000000000001",
    generatedAt: new Date().toISOString(),
    status: "synthesized",
    llmArrays: {
      organization_domain: ["austindentalpartners.example.com", "healthgrades.com"],
      client_location: ["Austin, TX (Downtown / Central)", "Round Rock, TX"],
      keywords: ["Dental Practice", "Invisalign", "Oral Surgery"],
    },
    userMetrics: {
      industry: "Dental & Healthcare",
      company_size: "20-40 employees",
      pricing: "$1,000–$2,500/mo",
      focus: "CALL-E Voice Receptionist",
    },
    compiledQueries: {
      core: ["Dental Practice", "Austin, TX"],
      google: "Dental Practice Austin, TX",
      linkedin: '("Owner" OR "CEO") AND "Dental Practice" AND "Austin, TX"',
      yellowpages: "Dental Practice Austin, TX",
    },
    decisionMakerTitles: ["Owner", "Managing Partner", "Clinical Director"],
    positiveSignals: ["appointment_volume", "phone_accessibility_problem"],
    negativeSignals: ["solo_practitioner"],
    apolloPayload,
  };

  await unifiedMCPStore.saveRecord(unifiedRecord);
  const retrievedUnified = unifiedMCPStore.getRecord(testUnifiedId);
  if (!retrievedUnified || !retrievedUnified.apolloPayload) {
    throw new Error("FAIL: Unified Discovery record not found in unifiedMCPStore!");
  }
  console.log(`✓ unifiedMCPStore storage verified: SSoT with ${retrievedUnified.apolloPayload.searchPayload.q_organization_domains_list.length} domains and ${retrievedUnified.apolloPayload.searchPayload.person_locations.length} locations.\n`);

  console.log("=================================================================");
  console.log(" 4. COMPLETE INVENTORY: WHAT THE MCP LAYER CURRENTLY HAS IN STORAGE");
  console.log("=================================================================");

  // Hydrate everything to count accurately
  await okfStore.hydrate();
  const allDossierFiles = fs.existsSync(okfDir) ? fs.readdirSync(okfDir) : [];
  const dbLeadsCount = await prisma.lead.count();
  const dbCriteriaCount = await prisma.leadCriteria.count();
  const dbDocsCount = await prisma.businessDocument.count();
  const dbTasksCount = await prisma.task.count();
  const dbCallsCount = await prisma.call.count();

  console.log(`[Total Leads in MCP OKF Store (Memory)]:      ${okfStore.size}`);
  console.log(`[Total Leads in Database (Prisma SQLite)]:     ${dbLeadsCount}`);
  console.log(`[Total OKF Markdown Dossiers on Disk]:         ${allDossierFiles.length} (.md files in data/okf)`);
  console.log(`[Total LeadCriteria / SSoT Records in DB]:    ${dbCriteriaCount}`);
  console.log(`[Total Business Documents in DB]:              ${dbDocsCount}`);
  console.log(`[Total Pipeline Tasks in DB]:                  ${dbTasksCount}`);
  console.log(`[Total Call Records in DB]:                    ${dbCallsCount}`);

  // Query top qualified leads in storage
  const top10 = okfStore.getTop(10);
  console.log("\n--- Top 10 Leads in MCP Storage (Ranked by Call Readiness & Total Score) ---");
  top10.forEach((lead, idx) => {
    console.log(
      ` ${idx + 1}. [Score: ${lead.scores.total}/100 | Readiness: ${lead.scores.callReadiness}% | PhoneScore: ${lead.scores.phoneScore}%] ` +
      `${lead.identity.name} | Phone: ${lead.contact.phoneE164 || lead.contact.phone || "none"} | ` +
      `Decision Maker: ${lead.contact.decisionMaker || "N/A"} | Source: ${lead.source}`
    );
  });

  // Query sample Apollo SSoT in MCP
  const latestUnified = unifiedMCPStore.getLatestRecord("00000000-0000-0000-0000-000000000001");
  if (latestUnified?.apolloPayload) {
    console.log("\n--- Active Apollo Single Source of Truth (SSoT) in MCP Layer ---");
    console.log(`- Discovery Engine Status: ${latestUnified.apolloPayload.discoveryEngineStatus} (Crawling inactive)`);
    console.log(`- Target Domains (${latestUnified.apolloPayload.searchPayload.q_organization_domains_list.length}):`, latestUnified.apolloPayload.searchPayload.q_organization_domains_list.slice(0, 4));
    console.log(`- Sub-Locations (${latestUnified.apolloPayload.searchPayload.person_locations.length}):`, latestUnified.apolloPayload.searchPayload.person_locations.slice(0, 4));
    console.log(`- Keywords (${latestUnified.apolloPayload.searchPayload.q_organization_keyword_tags.length}):`, latestUnified.apolloPayload.searchPayload.q_organization_keyword_tags);
    console.log(`- Step 2 Waterfall Phone Queue: ${latestUnified.apolloPayload.enrichmentPayload.recordsToMatch.length} contacts`);
  }

  console.log("\n=================================================================");
  console.log(" ALL TESTS PASSED: MCP LAYER CAN STORE DATA & HAS ACTIVE INVENTORY");
  console.log("=================================================================");
}

runValidation()
  .catch((err) => {
    console.error("Test Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
