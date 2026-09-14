/**
 * Unified Discovery Schema & MCP Storage Contract
 * 
 * Defines the unified data model bridging:
 *  1. Pure LLM Array Extraction (organization_domain, client_location, keywords)
 *  2. Chatbot Interface User Questionnaire Metrics (industry, company_size, pricing, focus)
 *  3. Second AI Combiner Synthesis (compiled boolean search queries)
 * 
 * Stored directly in the MCP layer as the primary discovery source of truth.
 */

import { z } from "zod";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// ─── 1. Zod Schemas & Types ──────────────────────────────────────────────────

/**
 * Output strictly extracted by the first LLM call
 */
export const LLMArrayExtractionSchema = z.object({
  organization_domain: z.array(z.string()).default([]),
  client_location: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

export type LLMArrayExtraction = z.infer<typeof LLMArrayExtractionSchema>;

/**
 * Metrics provided by the user via chatbot interface questions
 */
export const UserQuestionMetricsSchema = z.object({
  industry: z.string().default("General B2B"),
  company_size: z.string().default("20-40 employees"),
  pricing: z.string().default("$500–$2,000/mo"),
  focus: z.string().default("Lead qualification & Outreach"),
});

export type UserQuestionMetrics = z.infer<typeof UserQuestionMetricsSchema>;

/**
 * Apollo API Input Specification — The Definitive Single Source of Truth
 * Compiled inside the MCP layer by combining:
 *  - User-Uploaded Leads (CSV/XLSX/JSON)
 *  - User-Uploaded Documents (PDF/DOCX/TXT)
 *  - First LLM Output Arrays (Domains, 20 Locations, Keywords)
 *  - Chatbot Questionnaire Metrics (Industry, Size, Pricing, Focus)
 */
export interface ApolloInputSpecification {
  generatedAt: string;
  source: "mcp_unified_layer";
  status: "ready" | "dispatched";
  discoveryEngineStatus: "DORMANT";
  
  // Direct input payload for Apollo Search (Mixed People & Mixed Companies endpoints)
  searchPayload: {
    q_organization_domains_list: string[];
    person_locations: string[];
    q_organization_keyword_tags: string[];
    organization_num_employees_ranges: string[];
    person_titles: string[];
    q_keywords: string;
    page: number;
    per_page: number;
  };

  // Direct input payload for Apollo Enrichment / Match (Step 2 Waterfall phone reveal)
  enrichmentPayload: {
    recordsToMatch: Array<{
      first_name?: string;
      last_name?: string;
      organization_name: string;
      domain?: string;
      raw_phone?: string;
      email?: string;
      source: "user_upload" | "mcp_dossier";
    }>;
    reveal_phone_number: boolean;
    run_waterfall_phone: boolean;
    webhook_url?: string;
  };

  // Telemetry and cross-correlation statistics
  stats: {
    totalTargetDomains: number;
    totalTargetLocations: number;
    totalKeywords: number;
    uploadedLeadsReferenced: number;
    uploadedDocsReferenced: number;
  };
}

/**
 * Full Unified Discovery Record in the MCP Layer
 */
export interface UnifiedDiscoveryRecord {
  id: string;
  organizationId: string;
  taskId?: string;
  generatedAt: string;
  status: "draft" | "synthesized" | "dispatched" | "completed";
  
  // 1. First LLM Array Extractions
  llmArrays: LLMArrayExtraction;

  // 2. Chatbot User Question Metrics
  userMetrics: UserQuestionMetrics;

  // 3. Second AI Synthesis Outputs
  compiledQueries: {
    core: string[];
    google: string;
    linkedin: string;
    yellowpages: string;
    facebook?: string;
  };
  decisionMakerTitles: string[];
  positiveSignals: string[];
  negativeSignals: string[];

  // 4. Single Source of Truth for Apollo API Input
  apolloPayload?: ApolloInputSpecification;
  
  // Telemetry metadata
  metadata?: Record<string, unknown>;
}

// ─── 2. In-Memory & Persistent MCP Store ─────────────────────────────────────

class UnifiedMCPStore {
  private records = new Map<string, UnifiedDiscoveryRecord>();

  /**
   * Save or update a Unified Discovery Record in the MCP store and sync with Prisma
   */
  async saveRecord(record: UnifiedDiscoveryRecord): Promise<UnifiedDiscoveryRecord> {
    this.records.set(record.id, record);

    // Sync with Prisma LeadCriteria for durability
    try {
      await prisma.leadCriteria.create({
        data: {
          organizationId: record.organizationId,
          criteriaJson: record as unknown as Prisma.InputJsonValue,
          version: 1,
        },
      });
    } catch (err) {
      console.warn("[UnifiedMCPStore] Could not persist to Prisma LeadCriteria:", err);
    }

    return record;
  }

  /**
   * Retrieve a Unified Discovery Record by ID
   */
  getRecord(id: string): UnifiedDiscoveryRecord | undefined {
    return this.records.get(id);
  }

  /**
   * Get the most recent Unified Discovery Record for an organization
   */
  getLatestRecord(organizationId: string): UnifiedDiscoveryRecord | undefined {
    const list = Array.from(this.records.values())
      .filter((r) => r.organizationId === organizationId)
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
    return list[0];
  }

  /**
   * List all stored records
   */
  getAll(): UnifiedDiscoveryRecord[] {
    return Array.from(this.records.values());
  }

  /**
   * Clear in-memory records (useful for test resets)
   */
  clear(): void {
    this.records.clear();
  }
}

export const unifiedMCPStore = new UnifiedMCPStore();
