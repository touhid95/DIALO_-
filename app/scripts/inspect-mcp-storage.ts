import { prisma } from "../src/lib/db";
import { okfStore } from "../src/server/mcp/okf-store";
import { unifiedMCPStore } from "../src/server/mcp/unified-schema";
import fs from "fs";
import path from "path";

async function main() {
  console.log("=== INSPECTING MCP LAYER STORAGE ===");

  // 1. Check SQLite Database
  const leadsCount = await prisma.lead.count();
  const criteriaCount = await prisma.leadCriteria.count();
  const docsCount = await prisma.businessDocument.count();
  const tasksCount = await prisma.task.count();
  const callsCount = await prisma.call.count();

  console.log("\n[1. Database Storage (Prisma SQLite)]");
  console.log(`- Total Leads: ${leadsCount}`);
  console.log(`- Total LeadCriteria / Unified SSoT: ${criteriaCount}`);
  console.log(`- Business Documents: ${docsCount}`);
  console.log(`- Pipeline Tasks: ${tasksCount}`);
  console.log(`- Call Records: ${callsCount}`);

  // 2. Check OKF Markdown Dossiers on Disk
  const okfDir = path.join(process.cwd(), "data", "okf");
  const files = fs.existsSync(okfDir) ? fs.readdirSync(okfDir) : [];
  console.log("\n[2. File System Storage (data/okf Markdown Dossiers)]");
  console.log(`- Total Dossier Files (.md): ${files.length}`);
  if (files.length > 0) {
    console.log("- Recent Dossier Samples:");
    files.slice(0, 5).forEach((f) => console.log(`   * ${f}`));
  }

  // 3. Hydrate and check in-memory OKFStore
  await okfStore.hydrate();
  console.log("\n[3. In-Memory OKF Store]");
  console.log(`- Total Loaded Records: ${okfStore.size}`);

  const topLeads = okfStore.getTop(5);
  console.log("- Top 5 Leads by Call Readiness:");
  for (const l of topLeads) {
    console.log(
      `   * ${l.identity.name} | Phone: ${l.contact.phoneE164 || l.contact.phone || "none"} | Score: ${l.scores.total} | PhoneScore: ${l.scores.phoneScore} | Readiness: ${l.scores.callReadiness}% | Source: ${l.source}`
    );
  }

  // 4. Check LeadCriteria for Apollo SSoT in DB
  const recentCriteria = await prisma.leadCriteria.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  console.log(`\n[4. Lead Criteria / Apollo SSoT Records in DB]: ${recentCriteria.length} found`);
  for (const c of recentCriteria) {
    const json = c.criteriaJson as any;
    console.log(`   * ID: ${c.id} | Created: ${c.createdAt.toISOString()} | Has apolloPayload: ${Boolean(json?.apolloPayload)} | Focus: ${json?.userMetrics?.focus || "N/A"}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
