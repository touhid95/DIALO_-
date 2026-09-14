/**
 * MCP Central Orchestrator
 *
 * Coordinates:
 *  1. Multi-domain search scraping (Google, LinkedIn, Facebook, YellowPages)
 *  2. User uploaded lead parsing (CSV, XLSX, JSON)
 *  3. Accurate phone verification (ML structural analysis + LLM decision maker)
 *  4. ML scoring & rule-based matrices
 *  5. Dual OKF storage (Postgres/Prisma DB + clean Markdown .md files)
 *  6. CALL-E Goal Runs dispatching
 */

import { MultiDomainSearchOrchestrator, DomainSearchQuery, DomainSearchResult, DISCOVERY_FALLBACK_DORMANT } from "./search-adapter";
import { resolveAccurateContact } from "./llm-phone-resolver";
import { scoreLead } from "./ml-scorer";
import { okfStore, OKFRecord } from "./okf-store";
import { unifiedMCPStore, UnifiedDiscoveryRecord } from "./unified-schema";
import { buildApolloSingleSourceOfTruth } from "./apollo-adapter";
import { calleGoalDispatcher } from "./calle-dispatcher";
import { mcpLogger } from "./mcp-logger";
import type { RawImportedLead } from "./lead-importer";

export interface McpRunOptions {
  autoDispatchCalle?: boolean;
  minScoreToCall?: number;
  calleGoalId?: string;
  maxLeadsToProcess?: number;
}

export interface McpJobStatus {
  id: string;
  status: "idle" | "searching" | "enriching" | "scoring" | "storing" | "completed" | "failed";
  progress: number; // 0-100
  stage: string;
  totalFound: number;
  totalScored: number;
  totalDispatched: number;
  error?: string;
  startedAt: string;
  completedAt?: string;
  leadIds: string[];
}

class McpOrchestrator {
  private searchAdapter = new MultiDomainSearchOrchestrator();
  private jobs = new Map<string, McpJobStatus>();

  getJob(jobId: string): McpJobStatus | undefined {
    return this.jobs.get(jobId);
  }

  listJobs(): McpJobStatus[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  /**
   * Runs the full MCP pipeline from search criteria
   */
  async runSearchPipeline(query: DomainSearchQuery, options: McpRunOptions = {}): Promise<McpJobStatus> {
    const jobId = `mcp_job_${crypto.randomUUID().slice(0, 8)}`;
    const status: McpJobStatus = {
      id: jobId,
      status: "searching",
      progress: 10,
      stage: "Orchestrating multi-domain search (Google, LinkedIn, YellowPages)...",
      totalFound: 0,
      totalScored: 0,
      totalDispatched: 0,
      startedAt: new Date().toISOString(),
      leadIds: [],
    };
    this.jobs.set(jobId, status);

    // Run async in background
    (async () => {
      try {
        mcpLogger.info("ORCHESTRATOR", `Kicking off MCP Search Job ${jobId} for "${query.industry}" in "${query.location}"`);

        // 1. Search
        if (DISCOVERY_FALLBACK_DORMANT) {
          mcpLogger.info("ORCHESTRATOR", `[Discovery Engine Fallback: DORMANT] External scraping bypassed. Storing data directly in the MCP Layer.`);
          
          try {
            const spec = query.discoverySpec;
            const targetDomains = spec?.targetDomains || [];
            const targetLocations = spec?.targetLocations || [query.location];
            const keywords = spec?.keywords || (query.keywords?.core ? query.keywords.core : [query.industry]);

            const apolloPayload = await buildApolloSingleSourceOfTruth({
              llmArrays: {
                organization_domain: targetDomains,
                client_location: targetLocations,
                keywords,
              },
              userMetrics: {
                industry: spec?.targetIndustry || query.industry,
                company_size: spec?.targetCompanySize || query.targetCompanySize || "20-40 employees",
                pricing: spec?.targetPricing || "$500–$2,000/mo",
                focus: spec?.outreachGoal || query.productName || "Apollo API SSoT",
              },
              decisionMakerTitles: ["Owner", "Managing Partner", "CEO", "Director"],
            });

            const unifiedRec: UnifiedDiscoveryRecord = {
              id: query.unifiedDiscoveryId || `unified-${jobId}`,
              organizationId: "00000000-0000-0000-0000-000000000001",
              generatedAt: new Date().toISOString(),
              status: "synthesized",
              llmArrays: {
                organization_domain: targetDomains,
                client_location: targetLocations,
                keywords,
              },
              userMetrics: {
                industry: spec?.targetIndustry || query.industry,
                company_size: spec?.targetCompanySize || query.targetCompanySize || "20-40 employees",
                pricing: spec?.targetPricing || "$500–$2,000/mo",
                focus: spec?.outreachGoal || query.productName || "Apollo API SSoT",
              },
              compiledQueries: {
                core: keywords,
                google: query.keywords?.google || `${query.industry} ${query.location}`,
                linkedin: query.keywords?.linkedin || `("Owner" OR "CEO") AND "${query.industry}"`,
                yellowpages: `${query.industry} ${query.location}`,
                facebook: query.keywords?.facebook,
              },
              decisionMakerTitles: ["Owner", "Managing Partner", "CEO", "Director"],
              positiveSignals: [],
              negativeSignals: [],
              apolloPayload,
            };

            await unifiedMCPStore.saveRecord(unifiedRec);
            mcpLogger.success("OKF_STORE", `Preserved & stored Apollo SSoT in MCP Layer (${targetDomains.length} domains, ${targetLocations.length} locations).`);
          } catch (storageErr) {
            mcpLogger.warn("ORCHESTRATOR", `MCP Layer storage note: ${storageErr instanceof Error ? storageErr.message : String(storageErr)}`);
          }

          status.stage = "Discovery Engine Fallback is DORMANT. External scraping bypassed; criteria stored directly in MCP Layer for Apollo SSoT.";
          status.progress = 100;
          status.status = "completed";
          status.completedAt = new Date().toISOString();
          return;
        }

        const rawResults = await this.searchAdapter.orchestrate(query);
        status.totalFound = rawResults.length;
        status.progress = 35;
        status.stage = `Discovered ${rawResults.length} raw business candidates. Resolving contacts via ML & AI...`;
        mcpLogger.success("ORCHESTRATOR", `Discovered ${rawResults.length} candidates from multi-domain search.`);

        // 2. Process each lead
        const records = await this.processRawCandidates(rawResults, {
          source: "search",
          mcpJobId: jobId,
          query,
        });

        status.leadIds = records.map((r) => r.id);
        status.totalScored = records.length;
        status.progress = 85;
        status.stage = "Saved to OKF Markdown dossier and database.";
        mcpLogger.success("ORCHESTRATOR", `Successfully stored ${records.length} OKF dossiers & database records.`);

        // 3. Optional CALL-E dispatch
        if (options.autoDispatchCalle) {
          status.stage = "Dispatching qualified leads to CALL-E Goal Runs...";
          mcpLogger.info("CALLE", `Auto-dispatching qualified leads (score >= ${options.minScoreToCall ?? 60}) to CALL-E`);
          const dispatchRes = await calleGoalDispatcher.batchDispatch({
            goalId: options.calleGoalId,
            minScore: options.minScoreToCall ?? 60,
          });
          status.totalDispatched = dispatchRes.dispatched;
          mcpLogger.success("CALLE", `Dispatched ${dispatchRes.dispatched} calls to CALL-E`);
        }

        status.progress = 100;
        status.status = "completed";
        status.stage = `Pipeline completed. ${records.length} leads stored in OKF format.`;
        status.completedAt = new Date().toISOString();
        mcpLogger.success("ORCHESTRATOR", `Job ${jobId} finished successfully.`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        status.status = "failed";
        status.error = msg;
        status.stage = `Pipeline failed: ${msg}`;
        mcpLogger.error("ORCHESTRATOR", `Job ${jobId} failed: ${msg}`);
      }
    })();

    return status;
  }

  /**
   * Processes imported leads uploaded by user as a distinct dataset
   */
  async processImportedLeads(
    importedLeads: RawImportedLead[],
    options: { mcpJobId?: string; targetIndustry?: string; targetLocation?: string } = {}
  ): Promise<OKFRecord[]> {
    const records: OKFRecord[] = [];

    for (const item of importedLeads) {
      // 1. Phone & Contact Resolution
      const contact = await resolveAccurateContact({
        companyName: item.name,
        location: item.location,
        industry: item.category || options.targetIndustry,
        phoneCandidates: item.phone ? [item.phone] : [],
        emailCandidates: item.email ? [item.email] : [],
      });

      // 2. ML Scoring
      const scoring = scoreLead(
        {
          name: item.name,
          website: item.website,
          location: item.location,
          category: item.category || options.targetIndustry,
          employeeCount: item.employeeCount,
        },
        contact,
        {
          targetIndustry: options.targetIndustry,
          targetLocation: options.targetLocation,
        }
      );

      // 3. Create OKFRecord with source: "upload"
      const record: OKFRecord = {
        id: crypto.randomUUID(),
        okfVersion: 1,
        generatedAt: new Date().toISOString(),
        source: "upload",
        sourceUrl: null,
        mcpJobId: options.mcpJobId || null,

        identity: {
          name: item.name,
          tradingName: null,
          website: item.website,
        },

        contact: {
          phone: contact.phone,
          phoneE164: contact.phoneE164,
          phoneConfidence: contact.phoneConfidence,
          phoneType: (contact.phoneType === "tollfree" ? "landline" : contact.phoneType) as OKFRecord["contact"]["phoneType"],
          email: contact.email,
          emailConfidence: contact.emailConfidence,
          decisionMaker: item.decisionMaker || contact.decisionMaker,
          decisionMakerTitle: item.decisionMakerTitle || contact.decisionMakerTitle,
        },

        firmographics: {
          industry: item.category || options.targetIndustry || "General B2B",
          employeeCount: item.employeeCount,
          employeeRange: item.employeeCount ? `${item.employeeCount}` : null,
          location: item.location || options.targetLocation || "United States",
          city: item.location?.split(",")[0]?.trim() || null,
          state: item.location?.split(",")[1]?.trim() || null,
          yearFounded: null,
        },

        scores: scoring.scores,
        ai: {
          hypothesis: scoring.hypothesis,
          recommendedAction: scoring.recommendedAction,
          tags: [...scoring.tags, "user-uploaded"],
          qualifyingQuestions: scoring.qualifyingQuestions,
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
            claim: `Lead list entry uploaded by user: ${item.name}`,
            source: "User Uploaded CSV/XLSX",
            confidence: 0.95,
            observedAt: new Date().toISOString(),
          },
        ],
      };

      await okfStore.upsert(record);
      records.push(record);
    }

    return records;
  }

  /**
   * Internal helper to normalize and score raw search candidates
   */
  private async processRawCandidates(
    results: DomainSearchResult[],
    meta: { source: "search" | "upload"; mcpJobId: string; query: DomainSearchQuery }
  ): Promise<OKFRecord[]> {
    const records: OKFRecord[] = [];

    for (const raw of results) {
      mcpLogger.info("PHONE_VERIFIER", `Resolving phone accuracy for: "${raw.name}" (Candidates: ${raw.phoneCandidates.join(", ") || "none"})`);
      // 1. Phone & Contact Resolution via ML + LLM
      const contact = await resolveAccurateContact({
        companyName: raw.name,
        location: raw.location,
        industry: raw.category || meta.query.industry,
        phoneCandidates: raw.phoneCandidates,
        emailCandidates: raw.emailCandidates,
        snippets: raw.snippets,
      });
      mcpLogger.success("PHONE_VERIFIER", `Resolved contact for "${raw.name}": Phone ${contact.phoneE164 || contact.phone || "none"} (Acc: ${contact.phoneScore}%), Email: ${contact.email || "none"}`);

      // 2. ML Scoring
      const scoring = scoreLead(
        {
          name: raw.name,
          website: raw.website,
          location: raw.location,
          category: raw.category || meta.query.industry,
          employeeCount: raw.employeeCount,
          snippets: raw.snippets,
        },
        contact,
        {
          targetIndustry: meta.query.industry,
          targetLocation: meta.query.location,
          productName: meta.query.productName,
        }
      );
      mcpLogger.info("ML_SCORING", `Scored "${raw.name}": Score ${scoring.scores.total}/100 | Readiness: ${scoring.scores.callReadiness}% | Action: ${scoring.recommendedAction.toUpperCase()}`);

      // 3. OKF Envelope
      const record: OKFRecord = {
        id: crypto.randomUUID(),
        okfVersion: 1,
        generatedAt: new Date().toISOString(),
        source: meta.source,
        sourceUrl: raw.sourceUrl,
        mcpJobId: meta.mcpJobId,
        unifiedDiscoveryId: meta.query.unifiedDiscoveryId || null,
        discoverySpec: meta.query.discoverySpec,

        identity: {
          name: raw.name,
          tradingName: null,
          website: raw.website,
        },

        contact: {
          phone: contact.phone,
          phoneE164: contact.phoneE164,
          phoneConfidence: contact.phoneConfidence,
          phoneType: (contact.phoneType === "tollfree" ? "landline" : contact.phoneType) as OKFRecord["contact"]["phoneType"],
          email: contact.email,
          emailConfidence: contact.emailConfidence,
          decisionMaker: contact.decisionMaker,
          decisionMakerTitle: contact.decisionMakerTitle,
        },

        firmographics: {
          industry: raw.category || meta.query.industry,
          employeeCount: raw.employeeCount,
          employeeRange: raw.employeeCount ? `${raw.employeeCount}` : null,
          location: raw.location || meta.query.location,
          city: raw.location?.split(",")[0]?.trim() || null,
          state: raw.location?.split(",")[1]?.trim() || null,
          yearFounded: null,
        },

        scores: scoring.scores,
        ai: {
          hypothesis: scoring.hypothesis,
          recommendedAction: scoring.recommendedAction,
          tags: [...scoring.tags, `scraped-${raw.source}`],
          qualifyingQuestions: scoring.qualifyingQuestions,
        },

        calleStatus: {
          dispatched: false,
          goalRunId: null,
          goalId: null,
          callStatus: null,
          lastCallResult: null,
          dispatchedAt: null,
        },

        evidence: raw.snippets.map((snip) => ({
          type: "OBSERVED",
          claim: snip,
          source: raw.source.toUpperCase(),
          confidence: 0.88,
          observedAt: new Date().toISOString(),
        })),
      };

      await okfStore.upsert(record);
      mcpLogger.success("OKF_STORE", `Saved OKF record & dossier for "${record.identity.name}"`);
      records.push(record);
    }

    return records;
  }
}

export const mcpOrchestrator = new McpOrchestrator();
