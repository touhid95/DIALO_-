/**
 * OKF Store — Object Knowledge Framework
 *
 * Stores every lead as a richly-structured OKF Record optimised for:
 *  - Dashboard accuracy    (all fields typed and validated)
 *  - AI search             (tag-indexed, hypothesis text, score-ranked)
 *  - CALL-E dispatch       (phone confidence + callReadiness gate)
 *  - Deduplication         (phone E164 + name+location fingerprint)
 *
 * Persistence: Prisma Lead model (profileJson holds the full OKF envelope).
 * In-memory layer: Map<id, OKFRecord> for sub-millisecond reads.
 */

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { saveOKFMarkdown } from "./okf-markdown";
import type { CallContextBundle } from "@/lib/types";

const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OKFContactInfo {
  phone: string | null;
  phoneE164: string | null;
  phoneConfidence: number; // 0-1
  phoneType: "landline" | "mobile" | "voip" | "unknown";
  email: string | null;
  emailConfidence: number; // 0-1
  decisionMaker: string | null;
  decisionMakerTitle: string | null;
}

export interface OKFFirmographics {
  industry: string;
  employeeCount: number | null;
  employeeRange: string | null;
  location: string;
  city: string | null;
  state: string | null;
  yearFounded: number | null;
}

export interface OKFScores {
  total: number;           // 0-100
  icpFit: number;          // 0-25
  businessQuality: number; // 0-15
  painSignal: number;      // 0-25
  intent: number;          // 0-20
  recency: number;         // 0-10
  contactability: number;  // 0-5
  phoneScore: number;      // 0-100  (NEW)
  emailScore: number;      // 0-100  (NEW)
  dataCompleteness: number;// 0-100  (NEW)
  callReadiness: number;   // 0-100  (NEW composite)
}

export interface OKFCalleStatus {
  dispatched: boolean;
  goalRunId: string | null;
  goalId: string | null;
  callStatus: "pending" | "in_progress" | "completed" | "failed" | null;
  lastCallResult: Record<string, unknown> | null;
  dispatchedAt: string | null;
}

export interface OKFRecord {
  id: string;
  okfVersion: number;
  generatedAt: string;
  source: "search" | "upload" | "manual";
  sourceUrl: string | null;
  mcpJobId: string | null;
  unifiedDiscoveryId?: string | null;
  discoverySpec?: {
    targetDomains: string[];
    targetLocations: string[];
    keywords: string[];
    targetIndustry: string;
    targetCompanySize: string;
    targetPricing: string;
    outreachGoal: string;
  };

  identity: {
    name: string;
    tradingName: string | null;
    website: string | null;
  };

  contact: OKFContactInfo;
  firmographics: OKFFirmographics;
  scores: OKFScores;

  ai: {
    hypothesis: string;
    recommendedAction: "call" | "research" | "follow_up" | "skip";
    tags: string[];
    qualifyingQuestions: string[];
  };

  calleStatus: OKFCalleStatus;
  callContext?: CallContextBundle;

  evidence: Array<{
    type: string;
    claim: string;
    source: string;
    confidence: number;
    observedAt: string;
  }>;
}

// ─── Fingerprint for deduplication ───────────────────────────────────────────

function fingerprint(r: Partial<OKFRecord> & { identity: { name: string }; contact: { phoneE164?: string | null }; firmographics: { location: string } }): string {
  const phone = r.contact?.phoneE164 ?? "";
  if (phone) return `phone:${phone}`;
  const name = r.identity.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const loc = r.firmographics.location.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  return `name:${name}:${loc}`;
}

// ─── In-memory store ──────────────────────────────────────────────────────────

class OKFStore {
  private records = new Map<string, OKFRecord>();
  private fingerprintIndex = new Map<string, string>(); // fingerprint → id

  /** Upsert (create or update) a record. Returns the stored record. */
  async upsert(record: OKFRecord): Promise<OKFRecord> {
    const fp = fingerprint(record);
    const existingId = this.fingerprintIndex.get(fp);

    if (existingId && this.records.has(existingId)) {
      // Merge: keep higher score, update contact if better phone confidence
      const existing = this.records.get(existingId)!;
      const merged: OKFRecord = {
        ...existing,
        ...record,
        id: existing.id,
        okfVersion: existing.okfVersion + 1,
        generatedAt: existing.generatedAt,
        contact: record.contact.phoneConfidence >= existing.contact.phoneConfidence
          ? record.contact
          : existing.contact,
        scores: record.scores.total > existing.scores.total ? record.scores : existing.scores,
        evidence: [...existing.evidence, ...record.evidence.filter(
          (e) => !existing.evidence.some((ee) => ee.claim === e.claim)
        )],
      };
      this.records.set(existing.id, merged);
      await this._persist(merged);
      return merged;
    }

    this.records.set(record.id, record);
    this.fingerprintIndex.set(fp, record.id);
    await this._persist(record);
    return record;
  }

  /** Get single record by ID */
  get(id: string): OKFRecord | undefined {
    return this.records.get(id);
  }

  /** Get top N records by callReadiness + total score */
  getTop(n = 100, minScore = 0, minCallReadiness = 0): OKFRecord[] {
    return [...this.records.values()]
      .filter((r) => r.scores.total >= minScore && r.scores.callReadiness >= minCallReadiness)
      .sort((a, b) => b.scores.callReadiness - a.scores.callReadiness || b.scores.total - a.scores.total)
      .slice(0, n);
  }

  /** Query with filters */
  query(opts: {
    source?: OKFRecord["source"];
    minScore?: number;
    minPhoneScore?: number;
    location?: string;
    industry?: string;
    recommended?: string;
    mcpJobId?: string;
    limit?: number;
    offset?: number;
  }): { records: OKFRecord[]; total: number } {
    let results = [...this.records.values()];

    if (opts.source) results = results.filter((r) => r.source === opts.source);
    if (opts.minScore) results = results.filter((r) => r.scores.total >= opts.minScore!);
    if (opts.minPhoneScore) results = results.filter((r) => r.scores.phoneScore >= opts.minPhoneScore!);
    if (opts.location) results = results.filter((r) => r.firmographics.location.toLowerCase().includes(opts.location!.toLowerCase()));
    if (opts.industry) results = results.filter((r) => r.firmographics.industry.toLowerCase().includes(opts.industry!.toLowerCase()));
    if (opts.recommended) results = results.filter((r) => r.ai.recommendedAction === opts.recommended);
    if (opts.mcpJobId) results = results.filter((r) => r.mcpJobId === opts.mcpJobId);

    results.sort((a, b) => b.scores.callReadiness - a.scores.callReadiness);

    const total = results.length;
    const offset = opts.offset ?? 0;
    const limit = opts.limit ?? 50;
    return { records: results.slice(offset, offset + limit), total };
  }

  /** Get CALL-E ready payload for a lead */
  toCallePayload(id: string): { phone: string; name: string; decisionMaker: string | null; hypothesis: string } | null {
    const r = this.records.get(id);
    if (!r || !r.contact.phoneE164) return null;
    return {
      phone: r.contact.phoneE164,
      name: r.identity.name,
      decisionMaker: r.contact.decisionMaker,
      hypothesis: r.ai.hypothesis,
    };
  }

  /** Update CALL-E dispatch status */
  async updateCalleStatus(id: string, status: Partial<OKFCalleStatus>): Promise<void> {
    const r = this.records.get(id);
    if (!r) return;
    const updated = { ...r, calleStatus: { ...r.calleStatus, ...status } };
    this.records.set(id, updated);
    await this._persist(updated);
  }

  get size(): number {
    return this.records.size;
  }

  /** Load all OKF leads from Prisma on startup */
  async hydrate(): Promise<void> {
    const leads = await prisma.lead.findMany({
      where: { organizationId: DEFAULT_ORG_ID },
      include: { evidence: true },
      take: 2000,
    });

    for (const lead of leads) {
      try {
        const profile = lead.profileJson as Record<string, unknown> | null;
        if (profile && profile.okfVersion) {
          // Already full OKF record
          const r = profile as unknown as OKFRecord;
          this.records.set(r.id, r);
          this.fingerprintIndex.set(fingerprint(r), r.id);
        } else {
          // Legacy lead — convert to basic OKF record
          const r = legacyToOKF(lead);
          this.records.set(r.id, r);
          this.fingerprintIndex.set(fingerprint(r), r.id);
        }
      } catch {
        // skip malformed
      }
    }
  }

  /** Persist OKF record back to Prisma and write Markdown dossier */
  private async _persist(r: OKFRecord): Promise<void> {
    try {
      await prisma.lead.upsert({
        where: { id: r.id },
        create: {
          id: r.id,
          organizationId: DEFAULT_ORG_ID,
          name: r.identity.name,
          phone: r.contact.phoneE164 ?? r.contact.phone ?? undefined,
          website: r.identity.website ?? undefined,
          location: r.firmographics.location,
          category: r.firmographics.industry,
          score: r.scores.total,
          scoreComponents: r.scores as unknown as Prisma.InputJsonValue,
          hypothesis: r.ai.hypothesis,
          recommendedAction: r.ai.recommendedAction,
          decisionMaker: r.contact.decisionMaker ?? undefined,
          employeeCount: r.firmographics.employeeCount ?? undefined,
          profileJson: r as unknown as Prisma.InputJsonValue,
        },
        update: {
          phone: r.contact.phoneE164 ?? r.contact.phone ?? undefined,
          score: r.scores.total,
          scoreComponents: r.scores as unknown as Prisma.InputJsonValue,
          hypothesis: r.ai.hypothesis,
          recommendedAction: r.ai.recommendedAction,
          profileJson: r as unknown as Prisma.InputJsonValue,
          updatedAt: new Date(),
        },
      });

      // Dual persistence: Write clean Markdown dossier (.md) for AI RAG / searching
      await saveOKFMarkdown(r).catch((err) => {
        console.warn("[OKF] Markdown dossier write failed:", err);
      });
    } catch (err) {
      console.warn("[OKF] Persist failed:", err);
    }
  }
}

// ─── Legacy Lead → OKF conversion ────────────────────────────────────────────

function legacyToOKF(lead: {
  id: string;
  name: string;
  phone?: string | null;
  website?: string | null;
  location?: string | null;
  category?: string | null;
  score: number;
  hypothesis?: string | null;
  recommendedAction?: string | null;
  decisionMaker?: string | null;
  employeeCount?: number | null;
  evidence?: Array<{ type: string; claim: string; source: string; confidence?: number | null; observedAt: Date }>;
}): OKFRecord {
  return {
    id: lead.id,
    okfVersion: 1,
    generatedAt: new Date().toISOString(),
    source: "manual",
    sourceUrl: null,
    mcpJobId: null,
    identity: { name: lead.name, tradingName: null, website: lead.website ?? null },
    contact: {
      phone: lead.phone ?? null,
      phoneE164: normalizePhone(lead.phone ?? null),
      phoneConfidence: lead.phone ? 0.6 : 0,
      phoneType: "unknown",
      email: null,
      emailConfidence: 0,
      decisionMaker: lead.decisionMaker ?? null,
      decisionMakerTitle: null,
    },
    firmographics: {
      industry: lead.category ?? "Unknown",
      employeeCount: lead.employeeCount ?? null,
      employeeRange: lead.employeeCount ? `${lead.employeeCount}` : null,
      location: lead.location ?? "Unknown",
      city: lead.location?.split(",")[0]?.trim() ?? null,
      state: lead.location?.split(",")[1]?.trim() ?? null,
      yearFounded: null,
    },
    scores: {
      total: lead.score,
      icpFit: 0, businessQuality: 0, painSignal: 0, intent: 0, recency: 0, contactability: 0,
      phoneScore: lead.phone ? 60 : 0,
      emailScore: 0,
      dataCompleteness: calcCompleteness(lead),
      callReadiness: lead.phone ? Math.round((lead.score + 60) / 2) : 0,
    },
    ai: {
      hypothesis: lead.hypothesis ?? "No hypothesis available.",
      recommendedAction: (lead.recommendedAction ?? "research") as OKFRecord["ai"]["recommendedAction"],
      tags: [],
      qualifyingQuestions: [],
    },
    calleStatus: { dispatched: false, goalRunId: null, goalId: null, callStatus: null, lastCallResult: null, dispatchedAt: null },
    evidence: (lead.evidence ?? []).map((e) => ({
      type: e.type,
      claim: e.claim,
      source: e.source,
      confidence: e.confidence ?? 0.7,
      observedAt: e.observedAt?.toISOString() ?? new Date().toISOString(),
    })),
  };
}

function calcCompleteness(lead: { name: string; phone?: string | null; website?: string | null; location?: string | null; decisionMaker?: string | null; employeeCount?: number | null }): number {
  const fields = [!!lead.name, !!lead.phone, !!lead.website, !!lead.location, !!lead.decisionMaker, !!lead.employeeCount];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export function normalizePhone(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits[0] === "1") return `+${digits}`;
  if (digits.length > 7 && digits.length <= 15) return `+${digits}`;
  return null;
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const okfStore = new OKFStore();
export * from "./unified-schema";
