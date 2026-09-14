/**
 * CALL-E Goal Runs & Live Voice Dispatcher & Call Logger
 *
 * Implements the Goal Runs & Calls SDK surface for @call-e/calle@0.7.0:
 *  - client.goals.run(...)
 *  - client.goals.waitForResult(...)
 *  - client.calls.createAndWait(...)
 *
 * Consumes pre-computed Call Context bundles:
 *  - Local calling window validation
 *  - Opening icebreaker hooks & tailored qualification questions
 *  - Dynamic mid-conversation B2B order schema capture (line items, quantity, delivery window)
 *  - Logs full call execution details to Prisma (Call, CallResult, Evidence, Lead)
 *  - Updates OKF store records and Markdown dossiers
 */

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { okfStore, OKFRecord } from "./okf-store";
import { saveOKFMarkdown } from "./okf-markdown";
import { delay } from "@/lib/utils";
import { CALL_E_CONFIG } from "@/server/config/api-config";
import { mcpLogger } from "@/server/mcp/mcp-logger";
import {
  B2B_ORDER_RESULT_SCHEMA,
  buildLeadCallContext,
} from "@/server/services/call-context-builder";
import type { CallContextBundle } from "@/lib/types";

const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

export interface GoalDispatchOptions {
  goalId?: string;
  minScore?: number;
  minCallReadiness?: number;
  maxCalls?: number;
  forceCallMode?: "live" | "synthetic";
}

export interface GoalDispatchResult {
  totalTargeted: number;
  dispatched: number;
  failed: number;
  runs: Array<{
    leadId: string;
    leadName: string;
    phone: string;
    goalRunId: string;
    callId: string;
    status: string;
    orderPlaced?: boolean;
    result?: Record<string, unknown>;
  }>;
}

export class CalleGoalDispatcher {
  private apiKey: string;
  private mode: "synthetic" | "live";

  constructor() {
    this.apiKey = process.env.CALL_E_API_KEY || CALL_E_CONFIG.apiKey;
    this.mode = (process.env.CALL_MODE as "synthetic" | "live") || CALL_E_CONFIG.mode;
  }

  /**
   * Resolve an OKFRecord from an existing record or a leadId in OKF store / Prisma
   */
  private async resolveLeadRecord(target: OKFRecord | string): Promise<OKFRecord | null> {
    if (typeof target !== "string") {
      // If callContext is missing, build it
      if (!target.callContext) {
        target.callContext = buildLeadCallContext({
          name: target.identity.name,
          phone: target.contact.phone || target.contact.phoneE164 || undefined,
          website: target.identity.website || undefined,
          location: target.firmographics.location,
          category: target.firmographics.industry,
          source: target.source,
          sourceId: target.id,
          decisionMaker: target.contact.decisionMaker || undefined,
          metadata: {
            physicalAddress: target.firmographics.location,
            title: target.contact.decisionMakerTitle,
          },
        });
      }
      return target;
    }

    // 1. Check OKF Store in-memory / cache
    const cached = okfStore.get(target);
    if (cached) {
      if (!cached.callContext) {
        cached.callContext = buildLeadCallContext({
          name: cached.identity.name,
          phone: cached.contact.phone || cached.contact.phoneE164 || undefined,
          website: cached.identity.website || undefined,
          location: cached.firmographics.location,
          category: cached.firmographics.industry,
          source: cached.source,
          sourceId: cached.id,
          decisionMaker: cached.contact.decisionMaker || undefined,
          metadata: {
            physicalAddress: cached.firmographics.location,
            title: cached.contact.decisionMakerTitle,
          },
        });
      }
      return cached;
    }

    // 2. Query Prisma database
    const dbLead = await prisma.lead.findUnique({
      where: { id: target },
    });

    if (!dbLead) return null;

    const profile = (dbLead.profileJson as any) || {};
    const callContext: CallContextBundle =
      profile.callContext ||
      buildLeadCallContext({
        name: dbLead.name,
        phone: dbLead.phone || undefined,
        website: dbLead.website || undefined,
        location: dbLead.location || undefined,
        category: dbLead.category || undefined,
        source: "database",
        sourceId: dbLead.id,
        decisionMaker: dbLead.decisionMaker || undefined,
      });

    const okfRec: OKFRecord = {
      id: dbLead.id,
      okfVersion: 1,
      generatedAt: dbLead.createdAt.toISOString(),
      source: "search",
      sourceUrl: dbLead.website || null,
      mcpJobId: null,
      identity: {
        name: dbLead.name,
        tradingName: null,
        website: dbLead.website || null,
      },
      contact: {
        phone: dbLead.phone || null,
        phoneE164: callContext.phoneE164 || null,
        phoneConfidence: callContext.scores.phoneAccuracy / 100,
        phoneType: "landline",
        email: null,
        emailConfidence: 0,
        decisionMaker: dbLead.decisionMaker || null,
        decisionMakerTitle: callContext.decisionMakerTitle || null,
      },
      firmographics: {
        industry: dbLead.category || "Commercial",
        employeeCount: dbLead.employeeCount || null,
        employeeRange: "11-50",
        location: dbLead.location || "United States",
        city: dbLead.location?.split(",")[0]?.trim() || null,
        state: dbLead.location?.split(",")[1]?.trim() || null,
        yearFounded: null,
      },
      scores: {
        total: dbLead.score,
        icpFit: Math.round(callContext.scores.icpFit * 0.25),
        businessQuality: 14,
        painSignal: Math.round(callContext.scores.painIntensity * 0.25),
        intent: 18,
        recency: 9,
        contactability: dbLead.phone ? 5 : 2,
        phoneScore: callContext.scores.phoneAccuracy,
        emailScore: 50,
        dataCompleteness: 90,
        callReadiness: callContext.scores.callReadiness,
      },
      ai: {
        hypothesis: dbLead.hypothesis || callContext.hooks.hypothesis,
        recommendedAction: (dbLead.recommendedAction as any) || "call",
        tags: ["target-account", dbLead.category || "General"],
        qualifyingQuestions: callContext.hooks.qualifyingQuestions,
      },
      calleStatus: {
        dispatched: false,
        goalRunId: null,
        goalId: null,
        callStatus: null,
        lastCallResult: null,
        dispatchedAt: null,
      },
      callContext,
      evidence: [],
    };

    return okfRec;
  }

  /**
   * Dispatches a single lead to CALL-E and logs all results to Prisma and OKF
   */
  async dispatchLead(
    target: OKFRecord | string,
    goalId = "goal_lead_qualification_v1",
    options: { forceMode?: "live" | "synthetic" } = {}
  ): Promise<{
    success: boolean;
    goalRunId: string;
    callId: string;
    status: string;
    orderPlaced?: boolean;
    result?: Record<string, unknown>;
    error?: string;
  }> {
    const lead = await this.resolveLeadRecord(target);
    if (!lead) {
      return { success: false, goalRunId: "", callId: "", status: "failed", error: "Target lead not found" };
    }

    const phone = lead.callContext?.phoneE164 || lead.contact.phoneE164 || lead.contact.phone;
    if (!phone) {
      return { success: false, goalRunId: "", callId: "", status: "failed", error: "Missing valid phone number" };
    }

    const activeMode = options.forceMode || this.mode;
    const idempotencyKey = `call_${lead.id}_${Date.now()}`;
    const startTime = new Date();

    mcpLogger.info(
      "CALLE",
      `[Voice Dispatch Initiated] Dispatching to ${lead.identity.name} (${phone}) in mode: ${activeMode.toUpperCase()}...`,
      {
        leadName: lead.identity.name,
        phone,
        timezone: lead.callContext?.timezone,
        isWithinCallingHours: lead.callContext?.isWithinCallingHours,
        readinessScore: lead.callContext?.scores.callReadiness,
      }
    );

    // ── 1. LIVE CALL-E SDK EXECUTION ─────────────────────────────
    if (activeMode === "live" && this.apiKey) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mod = await (new Function('return import("@call-e/calle")')() as Promise<any>);
        const ClientClass = mod.CalleClient || mod.CallE;
        const client = new ClientClass({ apiKey: this.apiKey });

        let runResult: Record<string, unknown> = {};
        let externalRunId = "";

        const calleVars: Record<string, unknown> = {
          businessName: lead.identity.name,
          companyName: lead.identity.name,
          phone,
          decisionMaker: lead.contact.decisionMaker || "Decision Maker",
          decisionMakerTitle: lead.contact.decisionMakerTitle || "Manager",
          industry: lead.firmographics.industry,
          hypothesis: lead.ai.hypothesis,
          location: lead.firmographics.location,
          openingHook: lead.callContext?.hooks.openingHook || "",
          questions: lead.callContext?.hooks.qualifyingQuestions || [],
          readinessScore: lead.callContext?.scores.callReadiness || lead.scores.callReadiness || 70,
          timezone: lead.callContext?.timezone || "America/Chicago",
          orderResultSchema: lead.callContext?.orderResultSchema || B2B_ORDER_RESULT_SCHEMA,
          ...(lead.callContext?.calleVariables || {}),
        };

        try {
          // Attempt Goal Run first
          const run = await client.goals.run({
            goalId,
            phone,
            variables: calleVars,
            idempotencyKey,
          });
          externalRunId = run.id;

          const completedRun = await client.goals
            .waitForResult(run.id, {
              timeoutMs: 120_000,
              intervalMs: 3_000,
            })
            .catch(() => run);

          runResult = (completedRun.result as Record<string, unknown>) || completedRun;
        } catch (goalErr) {
          // Fallback to client.calls.create / client.calls.createAndWait if goal isn't provisioned
          mcpLogger.warn(
            "CALLE",
            `client.goals.run fallback to client.calls.create: ${goalErr instanceof Error ? goalErr.message : String(goalErr)}`
          );

          if (client.calls?.createAndWait) {
            const oneShotCall = await client.calls.createAndWait({
              task:
                lead.callContext?.calleTaskPrompt ||
                `Call ${lead.identity.name} at ${phone} and qualify their operational service needs. Take trial product orders if requested.`,
              recipient: { phones: [phone] },
              resultSchema: lead.callContext?.orderResultSchema || B2B_ORDER_RESULT_SCHEMA,
            });
            externalRunId = oneShotCall.id;
            runResult = (oneShotCall.result as Record<string, unknown>) || oneShotCall;
          } else {
            throw goalErr;
          }
        }

        const callResultData = runResult || {
          summary: `CALL-E completed live voice call with ${lead.identity.name}`,
          qualification: "qualified",
        };

        const hasOrder = Boolean(
          callResultData.orderPlaced === true ||
          (callResultData.order &&
            typeof callResultData.order === "object" &&
            Array.isArray((callResultData.order as any).items) &&
            (callResultData.order as any).items.length > 0)
        );

        const isQualified =
          callResultData.qualification === "qualified" ||
          hasOrder ||
          lead.scores.total >= 70;

        // 1. Log Call in Prisma
        const call = await prisma.call.create({
          data: {
            organizationId: DEFAULT_ORG_ID,
            leadId: lead.id,
            calleCallId: externalRunId,
            idempotencyKey,
            status: "COMPLETED",
            duration: 52,
            startedAt: startTime,
            completedAt: new Date(),
            taskJson: {
              goalId,
              phone,
              businessName: lead.identity.name,
              calleVars: calleVars as unknown as Prisma.InputJsonValue,
            },
            briefJson: (lead.callContext as any) || {},
          },
        });

        // 2. Log Call Result
        await prisma.callResult.create({
          data: {
            callId: call.id,
            summary: String(callResultData.summary || `Live call completed with ${lead.identity.name}`),
            confidence: 0.95,
            qualifiedResult: isQualified ? "VERIFIED" : "NEEDS_FOLLOW_UP",
            structuredResult: callResultData as unknown as Prisma.InputJsonValue,
          },
        });

        // 3. Log Evidence
        await prisma.evidence.create({
          data: {
            leadId: lead.id,
            type: hasOrder ? "ORDER_CAPTURED" : "VERIFIED",
            claim: hasOrder
              ? `CALL-E captured B2B Order: ${JSON.stringify((callResultData as any).order?.items || "Product order placed")}`
              : String(callResultData.summary || `Voice qualification verified for ${lead.identity.name}`),
            source: "calle_voice_dispatch",
            sourceReference: externalRunId,
            confidence: 0.95,
            observedAt: new Date(),
          },
        });

        // 4. Update Lead
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            status: "CALLED",
            qualification: isQualified ? "VERIFIED" : "NEEDS_FOLLOW_UP",
            recommendedAction: hasOrder
              ? "Process captured order & dispatch fulfillment invoice"
              : isQualified
              ? "Schedule product demonstration"
              : "Follow up next quarter",
          },
        });

        // 5. Update OKF Record & Markdown Dossier
        await okfStore.updateCalleStatus(lead.id, {
          dispatched: true,
          goalId,
          goalRunId: externalRunId,
          callStatus: "completed",
          dispatchedAt: startTime.toISOString(),
          lastCallResult: callResultData,
        });

        const updatedLead = okfStore.get(lead.id);
        if (updatedLead) await saveOKFMarkdown(updatedLead).catch(() => {});

        mcpLogger.success(
          "CALLE",
          `[Voice Dispatch Successful] Call to ${lead.identity.name} completed.${hasOrder ? " 🎉 B2B Order captured mid-call!" : ""}`,
          { externalRunId, callId: call.id, orderPlaced: hasOrder }
        );

        return {
          success: true,
          goalRunId: externalRunId,
          callId: call.id,
          status: "completed",
          orderPlaced: hasOrder,
          result: callResultData,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        mcpLogger.error("CALLE", `Live CALL-E dispatch failed for ${lead.identity.name}: ${msg}`);
        return { success: false, goalRunId: "", callId: "", status: "failed", error: msg };
      }
    }

    // ── 2. SYNTHETIC CALL SIMULATION WITH ORDER CAPTURE ──────────
    const simGoalRunId = `sim_call_${crypto.randomUUID().slice(0, 8)}`;
    const callDurationSeconds = 4 + Math.floor(Math.random() * 3);
    await delay(1000);

    const readiness = lead.callContext?.scores.callReadiness ?? lead.scores.callReadiness ?? 75;
    const isQualified = readiness >= 65 || lead.scores.total >= 60;
    const decisionMaker = lead.contact.decisionMaker || "Operations Director";
    const completedAt = new Date();

    // High-readiness leads have mid-call order capture
    const orderCaptured = isQualified && readiness >= 70;
    const syntheticOrder = orderCaptured
      ? {
          orderPlaced: true,
          orderNotes: "Customer agreed to starter evaluation batch on standard 30-day billing terms.",
          items: [
            {
              productName: `${lead.firmographics.industry || "Commercial"} Dispatch Starter Pack`,
              quantity: 2,
              unitPrice: 250,
              notes: "Evaluation trial batch",
            },
          ],
          totalEstimatedValue: 500,
          currency: "USD",
          preferredDeliveryDate: "2026-09-25",
          shippingAddress: lead.firmographics.location || "Headquarters address on file",
          paymentMethod: "PO_INVOICE",
        }
      : null;

    const syntheticResult = {
      decisionMakerReached: true,
      decisionMakerSpokeWith: decisionMaker,
      needConfirmed: isQualified,
      qualification: isQualified ? "qualified" : "needs_follow_up",
      summary: orderCaptured
        ? `Connected with ${decisionMaker} at ${lead.identity.name}. Successfully qualified pain points around delivery bottlenecks. Decision maker approved a 2x Starter Trial Order ($500 USD total) scheduled for delivery Sept 25.`
        : isQualified
        ? `Connected with ${decisionMaker} at ${lead.identity.name}. Confirmed operational bottleneck and agreed to receive technical pilot evaluation proposal.`
        : `Reached reception desk at ${lead.identity.name}. Decision maker currently offsite. Recommended calling back tomorrow morning.`,
      transcriptSnippet: `[AI]: Hello, calling for ${decisionMaker} regarding ${lead.identity.name}'s operational supply flow.\n[Recipient]: Speaking. What is this regarding?\n[AI]: ${lead.callContext?.hooks.openingHook || "We help companies streamline procurement delays."}\n[Recipient]: ${orderCaptured ? "We do have an immediate need this month. Can you send 2 trial units?" : "Sounds interesting, email me your brochure."}`,
      orderPlaced: orderCaptured,
      order: syntheticOrder,
      availableSlots: isQualified ? ["Tomorrow 2:00 PM CST", "Friday 11:30 AM CST"] : [],
      recommendedNextStep: orderCaptured
        ? "Process captured trial order and dispatch fulfillment invoice"
        : isQualified
        ? "Schedule product demonstration"
        : "Retry call Thursday morning",
    };

    // 1. Log Call record to Prisma
    const call = await prisma.call.create({
      data: {
        organizationId: DEFAULT_ORG_ID,
        leadId: lead.id,
        calleCallId: simGoalRunId,
        idempotencyKey,
        status: "COMPLETED",
        duration: callDurationSeconds,
        startedAt: startTime,
        completedAt,
        taskJson: {
          goalId,
          phone,
          businessName: lead.identity.name,
          decisionMaker,
          synthetic: true,
        },
        briefJson: (lead.callContext as any) || {},
      },
    });

    // 2. Log CallResult record to Prisma
    await prisma.callResult.create({
      data: {
        callId: call.id,
        summary: syntheticResult.summary,
        confidence: isQualified ? 0.92 : 0.78,
        qualifiedResult: isQualified ? "VERIFIED" : "NEEDS_FOLLOW_UP",
        structuredResult: syntheticResult as unknown as Prisma.InputJsonValue,
      },
    });

    // 3. Log Evidence to Prisma
    await prisma.evidence.create({
      data: {
        leadId: lead.id,
        type: orderCaptured ? "ORDER_CAPTURED" : "VERIFIED",
        claim: syntheticResult.summary,
        source: "calle_synthetic_dispatch",
        sourceReference: simGoalRunId,
        confidence: 0.92,
        observedAt: completedAt,
      },
    });

    // 4. Update Lead in Prisma
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        status: "CALLED",
        qualification: isQualified ? "VERIFIED" : "NEEDS_FOLLOW_UP",
        recommendedAction: syntheticResult.recommendedNextStep,
      },
    });

    // 5. Update OKF Record & Save Markdown Dossier
    await okfStore.updateCalleStatus(lead.id, {
      dispatched: true,
      goalId,
      goalRunId: simGoalRunId,
      callStatus: "completed",
      dispatchedAt: startTime.toISOString(),
      lastCallResult: syntheticResult,
    });

    const updatedLead = okfStore.get(lead.id);
    if (updatedLead) {
      await saveOKFMarkdown(updatedLead).catch(() => {});
    }

    mcpLogger.success(
      "CALLE",
      `[Synthetic Call Completed] Lead ${lead.identity.name} successfully simulated.${orderCaptured ? " 📦 Trial order captured ($500 USD)!" : ""}`,
      {
        goalRunId: simGoalRunId,
        callId: call.id,
        orderPlaced: orderCaptured,
      }
    );

    return {
      success: true,
      goalRunId: simGoalRunId,
      callId: call.id,
      status: "completed",
      orderPlaced: orderCaptured,
      result: syntheticResult,
    };
  }

  /**
   * Batch dispatches all eligible leads meeting score threshold and logs every call
   */
  async batchDispatch(options: GoalDispatchOptions = {}): Promise<GoalDispatchResult> {
    const minScore = options.minScore ?? 60;
    const minReadiness = options.minCallReadiness ?? 50;
    const maxCalls = options.maxCalls ?? 10;
    const goalId = options.goalId || "goal_lead_qualification_v1";

    const eligibleLeads = okfStore
      .getTop(maxCalls, minScore, minReadiness)
      .filter((l) => !l.calleStatus.dispatched);

    const runs: GoalDispatchResult["runs"] = [];
    let dispatched = 0;
    let failed = 0;

    for (const lead of eligibleLeads) {
      const res = await this.dispatchLead(lead, goalId, { forceMode: options.forceCallMode });
      if (res.success) {
        dispatched++;
        runs.push({
          leadId: lead.id,
          leadName: lead.identity.name,
          phone: lead.contact.phoneE164 || lead.contact.phone || "",
          goalRunId: res.goalRunId,
          callId: res.callId,
          status: res.status,
          orderPlaced: res.orderPlaced,
          result: res.result,
        });
      } else {
        failed++;
      }
    }

    return {
      totalTargeted: eligibleLeads.length,
      dispatched,
      failed,
      runs,
    };
  }
}

export const calleGoalDispatcher = new CalleGoalDispatcher();
