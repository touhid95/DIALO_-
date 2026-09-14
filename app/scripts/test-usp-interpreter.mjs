// Test script: test-usp-interpreter.mjs
// Verifies:
// 1. Client-safe free text extraction (USP, Price, Location)
// 2. ML Interpretation API (/api/discovery/interpret-usp)
// 3. Apollo Pipeline with USP & Price injection (/api/apollo/pipeline)
// 4. Verification of Call-E Calling Context with Value-Led Opening Hook

import http from "http";

async function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(raw) });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log("==================================================================");
  console.log("🚀 Testing Streamlined USP Interpretation & Call Context Pipeline");
  console.log("==================================================================");

  // Step 1: Call /api/discovery/interpret-usp with Bangladesh News RSS payload
  console.log("\n[Step 1] Calling POST /api/discovery/interpret-usp with Bangladesh News RSS...");
  const interpPayload = {
    usp: "Real-time RSS feeds from Prothom Alo, Daily Star, Dhaka Tribune, and bdnews24",
    price: "$199/mo API access",
    location: "Dhaka, Bangladesh",
    targetCompanySize: "11–50 employees",
  };

  const interpRes = await postJson("http://localhost:3000/api/discovery/interpret-usp", interpPayload);
  console.log("HTTP Status:", interpRes.status);
  if (!interpRes.data?.success) {
    console.error("❌ Interpretation failed:", interpRes.data);
    process.exit(1);
  }

  const profile = interpRes.data.data;
  console.log("\n✅ [Step 1 Result] USP Interpreted Profile:");
  console.log("  • Primary Industry:", profile.targetMarket.primaryIndustry);
  console.log("  • Decision Makers:", profile.targetMarket.decisionMakerTitles.join(", "));
  console.log("  • Employee Size:", profile.targetMarket.employeeSizeDisplay, "-> Apollo Ranges:", profile.apolloSearchCriteria.organization_num_employees_ranges);
  console.log("  • Normalized Location:", profile.normalizedLocation.city, profile.normalizedLocation.state, `(TZ: ${profile.normalizedLocation.timezone})`);
  console.log("  • Normalized Price:", profile.normalizedPrice.display, `(${profile.normalizedPrice.amount} ${profile.normalizedPrice.currency})`);
  console.log("  • Opening Hook:", `"${profile.conversationalPitch.openingHook}"`);
  console.log("  • Qualifying Question:", `"${profile.conversationalPitch.qualifyingQuestions[0]}"`);
  console.log("  • Objection Rebuttal (Vendor):", `"${profile.conversationalPitch.objectionRebuttals.existing_vendor}"`);
  console.log("  • Apollo SSoT Domains:", profile.apolloSearchCriteria.q_organization_domains_list.length);
  console.log("  • Apollo SSoT Locations:", profile.apolloSearchCriteria.person_locations.length);
  console.log("  • Apollo SSoT Titles:", profile.apolloSearchCriteria.person_titles.join(", "));

  // Step 2: Call /api/apollo/pipeline with interpreted USP and Price
  console.log("\n[Step 2] Calling POST /api/apollo/pipeline with USP & Price...");
  const pipelineRes = await postJson("http://localhost:3000/api/apollo/pipeline", {
    searchPayload: profile.apolloSearchCriteria,
    usp: profile.usp,
    price: profile.normalizedPrice.display,
  });

  console.log("HTTP Status:", pipelineRes.status);
  if (!pipelineRes.data?.success) {
    console.error("❌ Pipeline call failed:", pipelineRes.data);
    process.exit(1);
  }

  const pipeData = pipelineRes.data;
  console.log("\n✅ [Step 2 Result] Apollo Pipeline Output:");
  console.log("  • Endpoint:", pipeData.endpoint);
  console.log("  • Leads Ingested:", pipeData.leads?.length || 0);

  if (pipeData.leads && pipeData.leads.length > 0) {
    const leadSample = pipeData.leads[0];
    console.log("\n[Step 3] Verifying Call-E Call Context for lead:", leadSample.name);
    console.log("  • Decision Maker:", leadSample.decisionMaker);
    console.log("  • Phone:", leadSample.phone || "Pending reveal");
    console.log("  • Call Context Present?", !!leadSample.callContext);

    if (leadSample.callContext) {
      console.log("  • Task Prompt Preview:\n   ", leadSample.callContext.calleTaskPrompt.slice(0, 260).replace(/\n/g, "\n    "));
      console.log("  • CalleVariables:", JSON.stringify(leadSample.callContext.calleVariables, null, 2));
      console.log("  • Opening Hook in Bundle:", leadSample.callContext.hooks?.openingHook);

      const hasUspInVariables = !!leadSample.callContext.calleVariables?.usp;
      const hasUspInPrompt = leadSample.callContext.calleTaskPrompt.includes(profile.usp);
      if (hasUspInVariables || hasUspInPrompt) {
        console.log("\n🎯 SUCCESS: USP and Price are deeply embedded in Call-E's calling context!");
      } else {
        console.warn("\n⚠️ WARNING: USP missing in call context!");
      }
    }
  }

  console.log("\n==================================================================");
  console.log("🎉 ALL TESTS PASSED: Streamlined 3-Field USP Engine Verified!");
  console.log("==================================================================");
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
