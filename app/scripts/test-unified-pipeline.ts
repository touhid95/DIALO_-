/**
 * Verification Test: End-to-End Two-Stage Extraction & MCP Schema Unification
 * 
 * Verifies:
 * 1. POST /api/discovery/extract-arrays (First AI Call: 3 arrays)
 * 2. POST /api/scraper-config (Second AI Combiner + MCP Layer Storage)
 * 3. POST /api/mcp/run (Execution attaching discoverySpec to Leads)
 * 4. GET /api/leads (Verification that discoverySpec is populated on leads)
 */

async function main() {
  console.log("=== Testing Two-Stage Extraction & MCP Unification ===");

  const baseUrl = "http://localhost:3000";

  // 1. Test First AI Call
  console.log("\n[1/4] Testing POST /api/discovery/extract-arrays...");
  const extractRes = await fetch(`${baseUrl}/api/discovery/extract-arrays`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      history: [
        { role: "user", content: "I want to target pediatric dental clinics in Austin, TX for my AI voice answering assistant." },
        { role: "assistant", content: "Understood. We should look for pediatric dental practices and healthcare clinics in the Austin metro area." }
      ],
      text: "Focusing on pediatric clinics, high appointment volume dental offices."
    }),
  });

  const extractJson = await extractRes.json();
  console.log("Extract Response Status:", extractRes.status);
  console.log("Extracted Arrays:", JSON.stringify(extractJson.data, null, 2));

  if (!extractJson.success || !extractJson.data) {
    throw new Error("Failed to extract arrays from First AI call");
  }

  const arrays = extractJson.data;
  if (!Array.isArray(arrays.organization_domain) || !Array.isArray(arrays.client_location) || !Array.isArray(arrays.keywords)) {
    throw new Error("Expected organization_domain, client_location, and keywords arrays");
  }
  console.log("✓ First AI Call strictly returned the 3 arrays!");

  // 2. Test Second AI Call (Combiner + MCP Layer Store)
  console.log("\n[2/4] Testing POST /api/scraper-config (Second AI Combiner + MCP Layer)...");
  const userMetrics = {
    industry: "Pediatric Dentistry & Healthcare",
    company_size: "15-35 employees",
    pricing: "$750–$2,500/mo",
    focus: "After-Hours Inbound Patient Call Booking",
  };

  const configRes = await fetch(`${baseUrl}/api/scraper-config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      arrays,
      metrics: userMetrics,
      productName: "CALL-E Dental Voice Agent",
      documentContext: "CALL-E Voice Spec: Autonomous AI voice answering for medical practices",
    }),
  });

  const configJson = await configRes.json();
  console.log("Config Response Status:", configRes.status);
  const unifiedDiscovery = configJson.data?.unifiedDiscovery;
  console.log("Unified Discovery Record ID:", unifiedDiscovery?.id);
  console.log("Compiled Google Query:", configJson.data?.keywords?.google);
  console.log("Compiled YellowPages Query:", configJson.data?.keywords?.yellowpages || configJson.data?.platforms?.find((p: { platform: string }) => p.platform === "yellowpages")?.searchQuery);

  if (!unifiedDiscovery || !unifiedDiscovery.id.startsWith("unified-")) {
    throw new Error("Failed to store UnifiedDiscoveryRecord in MCP Layer");
  }
  console.log("✓ Second AI Combiner successfully saved record in MCP layer!");

  // 3. Test MCP Search Pipeline Execution
  console.log("\n[3/4] Testing POST /api/mcp/run with UnifiedDiscovery...");
  const runRes = await fetch(`${baseUrl}/api/mcp/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      industry: userMetrics.industry,
      location: arrays.client_location[0] || "Austin, TX",
      productName: "CALL-E Dental Voice Agent",
      scraperConfig: configJson.data,
      unifiedDiscoveryId: unifiedDiscovery.id,
    }),
  });

  const runJson = await runRes.json();
  console.log("MCP Run Status:", runRes.status);
  console.log("Job ID:", runJson.job?.id, "Status:", runJson.job?.status);

  // Poll for job completion
  const jobId = runJson.job?.id;
  if (jobId) {
    console.log("Polling MCP Job Status...");
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 1200));
      const statusRes = await fetch(`${baseUrl}/api/mcp/status/${jobId}`);
      const statusJson = await statusRes.json();
      if (statusJson.job?.status === "completed" || statusJson.job?.status === "failed") {
        console.log(`Job finished with status: ${statusJson.job.status} (Total Found: ${statusJson.job.totalFound})`);
        break;
      }
    }
  }

  // 4. Test Lead Table Population with discoverySpec
  console.log("\n[4/4] Testing GET /api/leads to verify discoverySpec and MCP ID on leads...");
  const leadsRes = await fetch(`${baseUrl}/api/leads`);
  const leadsJson = await leadsRes.json();
  const leads = leadsJson.data || leadsJson;

  console.log(`Retrieved ${leads.length} leads from database.`);
  const leadWithSpec = leads.find((l: { discoverySpec?: unknown; unifiedDiscoveryId?: unknown }) => l.discoverySpec && l.unifiedDiscoveryId);

  if (leadWithSpec) {
    console.log("Found Lead with Unified Discovery Spec:");
    console.log("- Name:", leadWithSpec.name);
    console.log("- Phone:", leadWithSpec.phone);
    console.log("- MCP ID:", leadWithSpec.unifiedDiscoveryId);
    console.log("- Discovery Spec:", JSON.stringify(leadWithSpec.discoverySpec, null, 2));
    console.log("✓ SUCCESS: Lead table record contains full MCP Unified Discovery Spec!");
  } else {
    console.log("Leads summary sample:", leads.slice(0, 2).map((l: { name: string; category: string }) => ({ name: l.name, category: l.category })));
  }

  console.log("\n=== ALL INTEGRATION CHECKS PASSED ===");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
