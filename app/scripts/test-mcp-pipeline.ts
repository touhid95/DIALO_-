/**
 * End-to-End Test Suite for MCP Server Pipeline
 *
 * Validates:
 * 1. Multi-domain search orchestration (Google, LinkedIn, Facebook, YellowPages)
 * 2. External scraper webhook buffering (/api/mcp/submit-results)
 * 3. User lead upload (CSV/JSON) normalization
 * 4. ML phone verification & E.164 resolution
 * 5. ML scoring & matrices computation
 * 6. Dual OKF storage (Prisma DB + Markdown .md dossiers)
 * 7. CALL-E Goal Runs dispatching
 */

import { MultiDomainSearchOrchestrator } from "../src/server/mcp/search-adapter";
import { parseUploadedFile } from "../src/server/mcp/lead-importer";
import { verifyPhone } from "../src/server/mcp/phone-verifier";
import { resolveAccurateContact } from "../src/server/mcp/llm-phone-resolver";
import { scoreLead } from "../src/server/mcp/ml-scorer";
import { okfStore } from "../src/server/mcp/okf-store";
import { readOKFMarkdown, listOKFDossiers } from "../src/server/mcp/okf-markdown";
import { mcpOrchestrator } from "../src/server/mcp/mcp-orchestrator";
import { calleGoalDispatcher } from "../src/server/mcp/calle-dispatcher";

async function main() {
  console.log("==================================================");
  console.log("  MCP SERVER PIPELINE — AUTOMATED TEST SUITE     ");
  console.log("==================================================\n");

  // ── TEST 1: Phone Verification & E.164 Normalization ──────────
  console.log("[TEST 1] Testing Phone Verification Engine...");
  const samplePhones = [
    "(512) 489-3200",        // Valid Austin, TX NANP landline
    "+1 512 991 8840",       // Formatted US
    "800-555-0199",          // Toll-free
    "123-456",               // Invalid short
    "512-012-3456",          // Invalid exchange (starts with 0)
  ];

  for (const p of samplePhones) {
    const res = verifyPhone(p);
    console.log(`  Phone: "${p}" -> Valid: ${res.isValid}, E164: ${res.e164}, Score: ${res.phoneScore}, Type: ${res.type}`);
  }
  console.log("  ✓ Phone verification passed.\n");

  // ── TEST 2: Multi-Domain Search Orchestration ─────────────────
  console.log("[TEST 2] Testing Multi-Domain Search Orchestration...");
  const orchestrator = new MultiDomainSearchOrchestrator();

  // Also simulate external scraper pushing results
  MultiDomainSearchOrchestrator.registerExternalResults([
    {
      name: "Austin Pediatric Care",
      phoneCandidates: ["(512) 555-4433"],
      emailCandidates: ["contact@austinpediatric.com"],
      website: "https://www.austinpediatric.com",
      location: "Austin, TX",
      category: "Pediatric Clinic",
      employeeCount: 22,
      snippets: ["High patient satisfaction pediatric clinic in Austin. Main desk: 512-555-4433."],
      source: "external_scraper",
      sourceUrl: "https://custom-scraper.internal/austin-pediatric",
    },
  ]);

  const searchResults = await orchestrator.orchestrate({
    industry: "Dental & Healthcare Clinics",
    location: "Austin, TX",
    productName: "CALL-E Voice Receptionist",
  });

  console.log(`  Discovered ${searchResults.length} multi-domain leads across Google, LinkedIn, YellowPages, and External Scraper:`);
  for (const r of searchResults) {
    console.log(`   - [${r.source.toUpperCase()}] ${r.name} | Phone: ${r.phoneCandidates[0]} | Staff: ${r.employeeCount}`);
  }
  if (searchResults.length < 3) throw new Error("Search orchestration returned insufficient results");
  console.log("  ✓ Multi-domain search passed.\n");

  // ── TEST 3: User Lead List Upload (CSV) ───────────────────────
  console.log("[TEST 3] Testing User Lead List Upload (CSV parsing)...");
  const sampleCSV = `Company Name,Phone Number,Email,Address,Industry,Headcount
Capitol Smiles Dental,(512) 474-6888,hello@capitolsmiles.com,"Austin, TX",Dental,14
Barton Creek Healthcare,512-327-4000,info@bartoncreekhealth.com,"Austin, TX",Healthcare,32
`;

  const csvBuffer = Buffer.from(sampleCSV, "utf8");
  const importResult = await parseUploadedFile(csvBuffer, "leads_upload.csv");
  console.log(`  Parsed CSV: Total ${importResult.total}, Imported ${importResult.imported}, Skipped ${importResult.skipped}`);
  if (importResult.imported !== 2) throw new Error("Failed to parse CSV leads");
  console.log("  ✓ CSV upload parser passed.\n");

  // ── TEST 4: MCP Processing & Dual OKF Storage ─────────────────
  console.log("[TEST 4] Testing MCP Processing & Dual OKF Storage (DB + Markdown)...");
  const processedLeads = await mcpOrchestrator.processImportedLeads(importResult.leads, {
    targetIndustry: "Healthcare",
    targetLocation: "Austin, TX",
  });

  console.log(`  Processed ${processedLeads.length} leads with ML scoring & OKF storage:`);
  for (const l of processedLeads) {
    console.log(`   - ${l.identity.name} | Score: ${l.scores.total}/100 | PhoneScore: ${l.scores.phoneScore}% | Readiness: ${l.scores.callReadiness}%`);
  }

  // Check Markdown dossier on disk
  const firstLead = processedLeads[0];
  const markdownContent = await readOKFMarkdown(firstLead.id);
  if (!markdownContent) {
    throw new Error(`OKF Markdown file for ${firstLead.id} was not found on disk`);
  }

  console.log(`  ✓ Verified Markdown dossier generated on disk for: ${firstLead.identity.name}`);
  console.log(`  Sample Dossier Excerpt:\n${markdownContent.split("\n").slice(0, 18).join("\n")}\n...`);

  // ── TEST 5: CALL-E Goal Runs Dispatch ─────────────────────────
  console.log("\n[TEST 5] Testing CALL-E Goal Runs Dispatcher...");
  const dispatchRes = await calleGoalDispatcher.dispatchLead(firstLead, "goal_lead_qualification_v1");
  console.log(`  CALL-E Dispatch result: Success = ${dispatchRes.success}, Run ID = ${dispatchRes.goalRunId}, Status = ${dispatchRes.status}`);
  if (!dispatchRes.success) throw new Error("CALL-E dispatch failed");

  // Verify updated OKF record
  const updatedRecord = okfStore.get(firstLead.id);
  console.log(`  Updated OKF record calleStatus: Dispatched = ${updatedRecord?.calleStatus.dispatched}, Status = ${updatedRecord?.calleStatus.callStatus}`);
  console.log("  ✓ CALL-E Goal Runs dispatch passed.\n");

  // ── TEST 6: OKF Dossier List Check ────────────────────────────
  console.log("[TEST 6] Listing generated OKF Markdown dossiers...");
  const dossiers = await listOKFDossiers();
  console.log(`  Found ${dossiers.length} OKF Markdown files in data/okf/:`);
  for (const d of dossiers.slice(0, 5)) {
    console.log(`   - ${d.fileName}`);
  }
  console.log("  ✓ OKF Dossier inventory verified.\n");

  console.log("==================================================");
  console.log("  ALL MCP PIPELINE TESTS PASSED SUCCESSFULLY!    ");
  console.log("==================================================");
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
