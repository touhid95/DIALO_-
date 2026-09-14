/**
 * End-to-End Verification Test for Apollo Pipeline + CALL-E Voice Call Context & Order Capture
 */

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("================================================================================");
  console.log("🚀 STARTING CALL-E CALL CONTEXT & PIPELINE END-TO-END VERIFICATION");
  console.log("================================================================================\n");

  // 1. Test Apollo Pipeline with Waterfall & Call Context Generation
  console.log("TEST 1: Calling POST /api/apollo/pipeline with target accounts...");
  const pipelinePayload = {
    searchPayload: {
      q_organization_domains_list: ["apexlogistics.com", "summitprocurement.com"],
      person_locations: ["Austin, Texas", "Dallas, Texas"],
      person_titles: ["VP Supply Chain", "Head of Procurement"],
      q_keywords: "Logistics and Freight Distribution",
      per_page: 2,
    },
  };

  const pipelineRes = await fetch(`${BASE_URL}/api/apollo/pipeline`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pipelinePayload),
  });

  if (!pipelineRes.ok) {
    throw new Error(`POST /api/apollo/pipeline failed with HTTP ${pipelineRes.status}`);
  }

  const pipelineData = await pipelineRes.json();
  console.log(`✓ Pipeline completed: HTTP ${pipelineRes.status}, success: ${pipelineData.success}`);
  console.log(`✓ Total Leads returned: ${pipelineData.leads?.length || 0}`);

  const sampleLead = pipelineData.leads?.[0];
  if (!sampleLead) {
    throw new Error("No leads returned from pipeline.");
  }

  console.log(`\nSample Lead: ${sampleLead.name}`);
  console.log(`- Phone: ${sampleLead.phone || "N/A"}`);
  console.log(`- Source: ${sampleLead.source}`);

  // Check CallContext
  if (!sampleLead.callContext) {
    throw new Error("❌ FAILED: lead.callContext is MISSING from pipeline output!");
  }
  console.log("\n✓ CallContext Bundle Verified:");
  console.log(`  • Timezone: ${sampleLead.callContext.timezone}`);
  console.log(`  • Local Time: ${sampleLead.callContext.localTimeFormatted}`);
  console.log(`  • Calling Hours Status: ${sampleLead.callContext.isWithinCallingHours ? "🟢 Within Hours" : "🟡 Outside Hours"} (${sampleLead.callContext.callingWindowMessage})`);
  console.log(`  • Readiness Score: ${sampleLead.callContext.scores.callReadiness}/100`);
  console.log(`  • Phone Accuracy: ${sampleLead.callContext.scores.phoneAccuracy}/100`);
  console.log(`  • Pain Intensity: ${sampleLead.callContext.scores.painIntensity}/100`);
  console.log(`  • Opening Icebreaker: "${sampleLead.callContext.hooks.openingHook}"`);
  console.log(`  • Qualifying Questions: ${sampleLead.callContext.hooks.qualifyingQuestions.length} generated`);
  console.log(`  • Dynamic Order Schema: ${sampleLead.callContext.orderResultSchema ? "DEFINED (Line items + quantities + delivery windows)" : "MISSING"}`);

  // 2. Test Single Lead Dispatch via POST /api/calle/dispatch
  console.log("\n--------------------------------------------------------------------------------");
  console.log("TEST 2: Dispatching Live / Synthetic CALL-E Voice Call for Target Lead...");
  const leadId = `apollo-${sampleLead.sourceId}`;
  console.log(`Target Lead ID: ${leadId}`);

  const dispatchRes = await fetch(`${BASE_URL}/api/calle/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      leadId,
      mode: "synthetic", // Test synthetic run to verify complete order handling cycle deterministically
    }),
  });

  const dispatchData = await dispatchRes.json();
  console.log(`✓ Dispatch API responded: HTTP ${dispatchRes.status}`);

  if (!dispatchData.success) {
    console.error("Dispatch response error:", dispatchData.error);
    throw new Error(`Dispatch failed: ${dispatchData.error}`);
  }

  console.log(`✓ Voice Call Status: ${dispatchData.data.status}`);
  console.log(`✓ Call ID: ${dispatchData.data.callId}`);
  console.log(`✓ Goal Run ID: ${dispatchData.data.goalRunId}`);
  console.log(`✓ Order Placed: ${dispatchData.data.orderPlaced ? "🎉 YES (Mid-Conversation Order Captured)" : "NO"}`);

  if (dispatchData.data.orderPlaced && dispatchData.data.result?.order) {
    console.log("✓ Captured Order Details:");
    console.log(`  • Items:`, JSON.stringify(dispatchData.data.result.order.items, null, 2));
    console.log(`  • Total Estimated Value: $${dispatchData.data.result.order.totalEstimatedValue} ${dispatchData.data.result.order.currency}`);
    console.log(`  • Preferred Delivery Date: ${dispatchData.data.result.order.preferredDeliveryDate}`);
    console.log(`  • Payment Method: ${dispatchData.data.result.order.paymentMethod}`);
  }

  console.log(`✓ Summary: "${dispatchData.data.result?.summary}"`);

  // 3. Test Call Log retrieval via GET /api/calls
  console.log("\n--------------------------------------------------------------------------------");
  console.log("TEST 3: Checking GET /api/calls to verify Call Log Persistence in SQLite...");
  const callsRes = await fetch(`${BASE_URL}/api/calls`);
  const callsData = await callsRes.json();

  if (!callsData.success) {
    throw new Error("Failed to fetch /api/calls");
  }

  console.log(`✓ Total Logged Calls in Database: ${callsData.data?.length || 0}`);
  const latestCall = callsData.data?.[0];
  if (latestCall) {
    console.log(`  • Latest Call ID: ${latestCall.id}`);
    console.log(`  • Target: ${latestCall.lead?.name}`);
    console.log(`  • Status: ${latestCall.status}`);
    console.log(`  • Duration: ${latestCall.duration}s`);
    console.log(`  • Qualification: ${latestCall.result?.qualification}`);
  }

  console.log("\n================================================================================");
  console.log("✅ ALL VERIFICATION TESTS PASSED SUCCESSFULLY!");
  console.log("================================================================================");
}

runTests().catch((err) => {
  console.error("\n❌ VERIFICATION TEST FAILED:", err);
  process.exit(1);
});
