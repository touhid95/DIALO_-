/**
 * Orchestrator Service — Main Pipeline Engine
 * 
 * Coordinates the full agentic workflow:
 * CREATED → PLANNING → DISCOVERING → ENRICHING → SCORING → READY_FOR_REVIEW
 * 
 * And for calls:
 * READY_FOR_REVIEW → CALLING → ANALYZING → COMPLETED
 * 
 * Emits events at each stage and handles errors with proper state transitions.
 */

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { TaskProgress } from "@/lib/types";
import { extractBusinessProfile, generateQuestionnaire, convertToCriteria } from "./planner";
import { CRAWLING_DISCOVERY_DORMANT, createDiscoveryProvider } from "./discovery";
import { LEAD_ENRICHMENT_DORMANT, createEnrichmentProvider } from "./enrichment";
import { scoreLead } from "./scoring";
import { generateCallBrief, briefToCalleTask, generateResultSchema } from "./call-brief";
import { createPhoneAgent } from "./phone-agent";
import { synthesizeCallResult } from "./synthesis";
import { generateIdempotencyKey } from "@/lib/utils";
import { broadcastEvent } from "./event-bus";
import { okfStore, OKFRecord } from "@/server/mcp/okf-store";
import { unifiedMCPStore, UnifiedDiscoveryRecord } from "@/server/mcp/unified-schema";
import { buildApolloSingleSourceOfTruth } from "@/server/mcp/apollo-adapter";
import { mcpLogger } from "@/server/mcp/mcp-logger";

/**
 * Run the full lead discovery pipeline for a task
 */
export async function runPipeline(taskId: string, organizationId: string): Promise<void> {
  try {
    // ─── PLANNING PHASE ───────────────────────────────────────
    await updateTaskStatus(taskId, "PLANNING");
    await emitEvent(organizationId, taskId, "task.planning_started", {});

    // Get the task goal
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error(`Task ${taskId} not found`);

    // Extract business profile from goal text
    const profile = await extractBusinessProfile(task.goal);
    
    // Store business profile
    await prisma.businessProfile.create({
      data: {
        organizationId,
        profileJson: profile as unknown as Prisma.InputJsonValue,
        version: 1,
      },
    });

    // Generate questionnaire
    const questionnaire = await generateQuestionnaire(profile);

    // Convert to criteria
    const criteria = await convertToCriteria(questionnaire);

    // Store criteria
    await prisma.leadCriteria.create({
      data: {
        organizationId,
        criteriaJson: criteria as unknown as Prisma.InputJsonValue,
        version: 1,
      },
    });

    await emitEvent(organizationId, taskId, "task.planning_completed", {
      profile,
      questionnaire,
      criteria,
    });

    // ─── MCP LAYER DATA PASS-THROUGH (PLANNING STAGE) ──────────
    const locationStr = criteria.location ? `${criteria.location.city || "Austin"}, ${criteria.location.state || "TX"}` : "Austin, TX";
    const industryStr = Array.isArray(criteria.industry) ? criteria.industry.join(", ") : (criteria.industry || "General B2B");

    try {
      const apolloPayload = await buildApolloSingleSourceOfTruth({
        llmArrays: {
          organization_domain: [],
          client_location: [locationStr],
          keywords: [industryStr, ...(criteria.requiredSignals || [])],
        },
        userMetrics: {
          industry: industryStr,
          company_size: `${criteria.minEmployees || 10}-${criteria.maxEmployees || 50} employees`,
          pricing: "$1,000–$3,000/mo",
          focus: "CALL-E Voice Outreach",
        },
        decisionMakerTitles: ["Owner", "Managing Partner", "CEO"],
      });

      const unifiedRecord: UnifiedDiscoveryRecord = {
        id: `unified-${taskId}`,
        organizationId,
        taskId,
        generatedAt: new Date().toISOString(),
        status: "synthesized",
        llmArrays: {
          organization_domain: [],
          client_location: [locationStr],
          keywords: [industryStr, ...(criteria.requiredSignals || [])],
        },
        userMetrics: {
          industry: industryStr,
          company_size: `${criteria.minEmployees || 10}-${criteria.maxEmployees || 50} employees`,
          pricing: "$1,000–$3,000/mo",
          focus: "CALL-E Voice Outreach",
        },
        compiledQueries: {
          core: [industryStr, locationStr],
          google: `${industryStr} ${locationStr}`,
          linkedin: `("Owner" OR "CEO") AND "${industryStr}" AND "${locationStr}"`,
          yellowpages: `${industryStr} ${locationStr}`,
        },
        decisionMakerTitles: ["Owner", "Managing Partner", "CEO"],
        positiveSignals: criteria.requiredSignals || [],
        negativeSignals: criteria.excluded || [],
        apolloPayload,
      };

      await unifiedMCPStore.saveRecord(unifiedRecord);
      mcpLogger.success("OKF_STORE", `Passed criteria for task ${taskId} directly to MCP Unified Store (Apollo SSoT ready).`);
    } catch (mcpErr) {
      console.warn("[Orchestrator] MCP Unified Store sync notice:", mcpErr);
    }

    // ─── DISCOVERY PHASE (CRAWLING STATUS: DORMANT) ───────────
    await updateTaskStatus(taskId, "DISCOVERING");
    if (CRAWLING_DISCOVERY_DORMANT) {
      mcpLogger.info(
        "ORCHESTRATOR",
        `[Crawling: DORMANT] External crawling & discovery scraping are dormant. Bypassed web crawlers; criteria routed directly to MCP layer.`
      );
      await emitEvent(organizationId, taskId, "task.discovering", {
        dormant: true,
        message: "Crawling is DORMANT. Bypassed web scraping; criteria routed directly to MCP layer.",
      });
    } else {
      await emitEvent(organizationId, taskId, "task.discovering", {});
    }

    const discoveryProvider = createDiscoveryProvider();
    const rawLeads = await discoveryProvider.search({
      industry: criteria.industry,
      location: criteria.location,
      minEmployees: criteria.minEmployees,
      maxEmployees: criteria.maxEmployees,
      requiredSignals: criteria.requiredSignals,
      excluded: criteria.excluded,
    });

    // Store discovered leads
    const createdLeads = [];
    for (const raw of rawLeads) {
      const lead = await prisma.lead.create({
        data: {
          organizationId,
          taskId,
          name: raw.name,
          phone: raw.phone,
          website: raw.website,
          location: raw.location,
          category: raw.category,
          status: "DISCOVERED",
          qualification: "PENDING",
          decisionMaker: raw.decisionMaker,
          employeeCount: raw.employeeCount,
          profileJson: (raw.metadata as unknown as Prisma.InputJsonValue) || {},
        },
      });
      createdLeads.push(lead);
      await emitEvent(organizationId, taskId, "lead.discovered", { leadId: lead.id, name: raw.name });
    }

    await updateProgress(taskId, { discovered: createdLeads.length });

    // ─── ENRICHMENT PHASE (LEAD ENRICHMENT STATUS: DORMANT) ────
    await updateTaskStatus(taskId, "ENRICHING");
    if (LEAD_ENRICHMENT_DORMANT) {
      mcpLogger.info(
        "ORCHESTRATOR",
        `[Lead Enrichment: DORMANT] Secondary lead enrichment is dormant. Passing raw lead data directly to MCP Layer OKF Store.`
      );
      await emitEvent(organizationId, taskId, "task.enriching", {
        dormant: true,
        message: "Lead enrichment is DORMANT. Raw data passed directly to MCP Layer OKF Store.",
      });
    } else {
      await emitEvent(organizationId, taskId, "task.enriching", {});
    }

    const enrichmentProvider = createEnrichmentProvider();
    
    for (const lead of createdLeads) {
      const rawLead = rawLeads.find((r) => r.name === lead.name);
      if (!rawLead) continue;

      // Enrich the lead (or return clean wrapper when dormant)
      const enrichment = await enrichmentProvider.enrich(rawLead);

      // Update lead with enrichment data
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: "ENRICHED",
          profileJson: {
            ...((lead.profileJson as Record<string, unknown>) || {}),
            enrichment,
          },
        },
      });

      // Pass directly to the MCP Layer OKF Store
      try {
        const okfRecord: OKFRecord = {
          id: lead.id,
          okfVersion: 1,
          generatedAt: new Date().toISOString(),
          source: "search",
          sourceUrl: lead.website || null,
          mcpJobId: taskId,
          identity: {
            name: lead.name,
            tradingName: null,
            website: lead.website || null,
          },
          contact: {
            phone: lead.phone,
            phoneE164: lead.phone,
            phoneConfidence: lead.phone ? 0.85 : 0,
            phoneType: "landline",
            email: null,
            emailConfidence: 0,
            decisionMaker: lead.decisionMaker,
            decisionMakerTitle: null,
          },
          firmographics: {
            industry: lead.category || industryStr,
            employeeCount: lead.employeeCount,
            employeeRange: lead.employeeCount ? `${lead.employeeCount}` : null,
            location: lead.location || locationStr,
            city: lead.location?.split(",")[0]?.trim() || null,
            state: lead.location?.split(",")[1]?.trim() || null,
            yearFounded: null,
          },
          scores: {
            total: 75,
            icpFit: 20,
            businessQuality: 12,
            painSignal: 18,
            intent: 15,
            recency: 5,
            contactability: 5,
            phoneScore: lead.phone ? 80 : 0,
            emailScore: 0,
            dataCompleteness: 70,
            callReadiness: lead.phone ? 78 : 0,
          },
          ai: {
            hypothesis: `Target practice in ${locationStr} for CALL-E outreach.`,
            recommendedAction: lead.phone ? "call" : "research",
            tags: ["pipeline-routed", industryStr],
            qualifyingQuestions: ["What is your after-hours answering workflow?"],
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
              type: "OBSERVED",
              claim: `Lead criteria matched: ${criteria.industry} in ${criteria.location}`,
              source: "MCP Pipeline",
              confidence: 0.9,
              observedAt: new Date().toISOString(),
            },
          ],
        };

        await okfStore.upsert(okfRecord);
      } catch (okfErr) {
        console.warn("[Orchestrator] Error syncing lead to MCP OKF Store:", okfErr);
      }

      // Get and store evidence
      const evidenceItems = enrichmentProvider.getEvidenceForLead(lead.name);
      for (const ev of evidenceItems) {
        await prisma.evidence.create({
          data: {
            leadId: lead.id,
            type: ev.type,
            claim: ev.claim,
            source: ev.source,
            sourceReference: ev.sourceReference,
            observedAt: new Date(ev.observedAt),
            confidence: ev.confidence,
          },
        });
      }

      await emitEvent(organizationId, taskId, "lead.enriched", { leadId: lead.id, name: lead.name });
    }

    await updateProgress(taskId, {
      discovered: createdLeads.length,
      enriched: createdLeads.length,
    });

    // ─── SCORING PHASE ────────────────────────────────────────
    await updateTaskStatus(taskId, "SCORING");
    await emitEvent(organizationId, taskId, "task.scoring", {});

    let qualifiedCount = 0;

    for (const lead of createdLeads) {
      // Get evidence for this lead
      const evidence = await prisma.evidence.findMany({
        where: { leadId: lead.id },
      });

      const evidenceItems = evidence.map((e) => ({
        type: e.type as "OBSERVED" | "INFERRED" | "VERIFIED",
        claim: e.claim,
        source: e.source,
        sourceReference: e.sourceReference || undefined,
        observedAt: e.observedAt.toISOString(),
        confidence: e.confidence || undefined,
      }));

      // Score the lead
      const score = await scoreLead({
        name: lead.name,
        category: lead.category || undefined,
        location: lead.location || undefined,
        employeeCount: lead.employeeCount || undefined,
        decisionMaker: lead.decisionMaker || undefined,
        phone: lead.phone || undefined,
        website: lead.website || undefined,
        evidence: evidenceItems,
        criteria: {
          industry: criteria.industry,
          minEmployees: criteria.minEmployees,
          maxEmployees: criteria.maxEmployees,
          requiredSignals: criteria.requiredSignals,
        },
      });

      // Update lead with score
      const qualification = score.score >= 60 ? "POTENTIAL" : "PENDING";
      if (qualification === "POTENTIAL") qualifiedCount++;

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          score: score.score,
          scoreComponents: score.components as unknown as Prisma.InputJsonValue,
          status: "SCORED",
          qualification,
          hypothesis: score.hypothesis,
          recommendedAction: score.recommendedAction,
        },
      });

      await emitEvent(organizationId, taskId, "lead.scored", {
        leadId: lead.id,
        name: lead.name,
        score: score.score,
      });
    }

    await updateProgress(taskId, {
      discovered: createdLeads.length,
      enriched: createdLeads.length,
      scored: createdLeads.length,
      qualified: qualifiedCount,
    });

    // ─── READY FOR REVIEW ─────────────────────────────────────
    await updateTaskStatus(taskId, "READY_FOR_REVIEW");
    await emitEvent(organizationId, taskId, "task.ready_for_review", {
      totalLeads: createdLeads.length,
      qualifiedLeads: qualifiedCount,
    });

  } catch (error) {
    console.error(`Pipeline failed for task ${taskId}:`, error);
    await updateTaskStatus(taskId, "FAILED", (error as Error).message);
    await emitEvent(organizationId, taskId, "task.failed", {
      error: (error as Error).message,
    });
  }
}

/**
 * Execute a call for a specific lead
 */
export async function executeCall(
  callId: string,
  leadId: string,
  organizationId: string
): Promise<void> {
  try {
    // Get lead and evidence
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { evidence: true },
    });
    if (!lead) throw new Error(`Lead ${leadId} not found`);
    if (!lead.phone) throw new Error(`Lead ${leadId} has no phone number`);

    // Get criteria
    const criteriaRecord = await prisma.leadCriteria.findFirst({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });

    const callQuestions = (criteriaRecord?.criteriaJson as Record<string, unknown>)?.callQuestions as string[] || [];

    // Generate call brief
    const brief = await generateCallBrief({
      leadName: lead.name,
      phone: lead.phone,
      location: lead.location || undefined,
      category: lead.category || undefined,
      evidence: lead.evidence.map((e) => ({
        type: e.type as "OBSERVED" | "INFERRED" | "VERIFIED",
        claim: e.claim,
        source: e.source,
        sourceReference: e.sourceReference || undefined,
        observedAt: e.observedAt.toISOString(),
        confidence: e.confidence || undefined,
      })),
      hypothesis: lead.hypothesis || "",
      callQuestions,
      clientDescription: "AI-powered receptionist and phone answering solution provider",
    });

    // Update call with brief
    await prisma.call.update({
      where: { id: callId },
      data: {
        briefJson: brief as unknown as Prisma.InputJsonValue,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: { status: "CALLING" },
    });

    await emitEvent(organizationId, lead.taskId || undefined, "call.started", {
      callId,
      leadId,
      leadName: lead.name,
    });

    // Create the CALL-E task
    const calleTask = briefToCalleTask(brief);
    const resultSchema = generateResultSchema();

    // Execute the call
    const phoneAgent = createPhoneAgent();
    const result = await phoneAgent.createCall({
      leadId,
      organizationId,
      phone: lead.phone,
      task: calleTask,
      resultSchema,
      metadata: { leadName: lead.name, leadId, organizationId },
      idempotencyKey: generateIdempotencyKey("call", organizationId, leadId),
    });

    // Update call record
    await prisma.call.update({
      where: { id: callId },
      data: {
        calleCallId: result.id,
        status: result.status === "completed" ? "COMPLETED" : "FAILED",
        duration: result.duration,
        completedAt: new Date(),
      },
    });

    if (result.status === "completed" && result.structuredResult) {
      // Synthesize the result
      const synthesis = await synthesizeCallResult(
        lead.name,
        result.structuredResult,
        lead.hypothesis || ""
      );

      // Store call result
      await prisma.callResult.create({
        data: {
          callId,
          structuredResult: (result.structuredResult || {}) as unknown as Prisma.InputJsonValue,
          summary: synthesis.summary,
          confidence: 0.85,
          qualifiedResult: synthesis.qualification,
        },
      });

      // Add VERIFIED evidence from call
      for (const fact of synthesis.verifiedFacts) {
        await prisma.evidence.create({
          data: {
            leadId,
            type: "VERIFIED",
            claim: fact,
            source: "calle_call",
            sourceReference: result.id,
            observedAt: new Date(),
            confidence: 0.90,
          },
        });
      }

      // Update lead qualification
      const qualificationMap: Record<string, "VERIFIED" | "NOT_QUALIFIED" | "NEEDS_FOLLOW_UP" | "PENDING"> = {
        qualified: "VERIFIED",
        not_qualified: "NOT_QUALIFIED",
        needs_follow_up: "NEEDS_FOLLOW_UP",
        inconclusive: "PENDING",
      };

      await prisma.lead.update({
        where: { id: leadId },
        data: {
          status: "CALLED",
          qualification: qualificationMap[synthesis.qualification] || "PENDING",
          recommendedAction: synthesis.nextAction,
        },
      });

      await emitEvent(organizationId, lead.taskId || undefined, "call.completed", {
        callId,
        leadId,
        leadName: lead.name,
        qualification: synthesis.qualification,
        summary: synthesis.summary,
      });

      await emitEvent(organizationId, lead.taskId || undefined, "result.created", {
        callId,
        leadId,
        qualification: synthesis.qualification,
      });

    } else {
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: "SCORED", qualification: "PENDING" },
      });

      await emitEvent(organizationId, lead.taskId || undefined, "call.failed", {
        callId,
        leadId,
        leadName: lead.name,
      });
    }

  } catch (error) {
    console.error(`Call execution failed for call ${callId}:`, error);

    await prisma.call.update({
      where: { id: callId },
      data: { status: "FAILED", completedAt: new Date() },
    });

    await emitEvent(organizationId, undefined, "call.failed", {
      callId,
      leadId,
      error: (error as Error).message,
    });
  }
}

// ─── Helpers ──────────────────────────────────────────────────

async function updateTaskStatus(
  taskId: string,
  status: "PLANNING" | "DISCOVERING" | "ENRICHING" | "SCORING" | "READY_FOR_REVIEW" | "CALLING" | "ANALYZING" | "COMPLETED" | "FAILED" | "CANCELLED",
  errorMessage?: string
): Promise<void> {
  await prisma.task.update({
    where: { id: taskId },
    data: {
      status,
      error: errorMessage || null,
    },
  });
}

async function updateProgress(taskId: string, progress: Partial<TaskProgress>): Promise<void> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  const currentProgress = (task?.progressJson as Record<string, unknown>) || {};
  
  await prisma.task.update({
    where: { id: taskId },
    data: {
      progressJson: { ...currentProgress, ...progress },
    },
  });
}

async function emitEvent(
  organizationId: string,
  taskId: string | undefined,
  type: string,
  data: Record<string, unknown>
): Promise<void> {
  await prisma.event.create({
    data: {
      organizationId,
      taskId: taskId || null,
      type,
      data: data as unknown as Prisma.InputJsonValue,
    },
  });

  // Broadcast via WebSocket
  broadcastEvent({
    type: type as import("@/lib/types").WSEventType,
    organizationId,
    taskId,
    data,
    timestamp: new Date().toISOString(),
  });
}
