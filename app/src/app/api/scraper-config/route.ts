/**
 * POST /api/scraper-config
 *
 * Accepts the compiled market + product intake data.
 * Returns a fully structured scraper configuration payload
 * that any scraper implementation can consume directly.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateCopilotResponse } from "@/server/services/openrouter";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScraperKeywords {
  core: string[];
  google: string;
  linkedin: string;
  facebook: string;
}

export interface ScraperTargetFilter {
  employeeRange: { min: number; max: number };
  industries: string[];
  location: string;
  decisionMakerTitles: string[];
  positiveSignals: string[];
  negativeSignals: string[];
}

export interface ScraperPlatformConfig {
  platform: "google" | "linkedin" | "facebook" | "crunchbase" | "yellowpages";
  enabled: boolean;
  searchQuery: string;
  maxResults: number;
  delayBetweenRequests: number;
  headers: Record<string, string>;
  selectors?: {
    resultContainer?: string;
    companyName?: string;
    url?: string;
    phone?: string;
    email?: string;
  };
}

export interface ScraperConfigResponse {
  generatedAt: string;
  jobLabel: string;
  keywords: ScraperKeywords;
  targetFilter: ScraperTargetFilter;
  platforms: ScraperPlatformConfig[];
  productContext: {
    name: string;
    pricing: string;
    targetCompanySize: string;
    estimatedDealSize: "SMB" | "Mid-Market" | "Enterprise";
  };
  meta: {
    priority: "high" | "medium" | "low";
    retryOnFail: boolean;
    outputFormat: "json" | "csv";
    webhookUrl: string | null;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseSizeRange(sizeStr: string): { min: number; max: number } {
  const nums = sizeStr.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length >= 2) return { min: nums[0], max: nums[1] };
  if (nums.length === 1) return { min: nums[0], max: nums[0] * 3 };
  return { min: 10, max: 100 };
}

function estimateDealSize(pricing: string): "SMB" | "Mid-Market" | "Enterprise" {
  const lower = pricing.toLowerCase();
  if (lower.includes("enterprise") || lower.includes("10k")) return "Enterprise";
  if (lower.includes("2,000") || lower.includes("2k") || lower.includes("5,000")) return "Mid-Market";
  return "SMB";
}

// ─── POST Handler ─────────────────────────────────────────────────────────────

import { unifiedMCPStore, UnifiedDiscoveryRecord } from "@/server/mcp/okf-store";
import { buildApolloSingleSourceOfTruth } from "@/server/mcp/apollo-adapter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Support both new unified arrays + metrics and legacy market + product
    const arrays = body.arrays ?? {
      organization_domain: Array.isArray(body.organization_domain) ? body.organization_domain : [],
      client_location: Array.isArray(body.client_location) ? body.client_location : [],
      keywords: Array.isArray(body.keywords) ? body.keywords : [],
    };

    const metrics = body.metrics ?? {
      industry: body.market?.industry ?? "General B2B",
      company_size: body.product?.companySize ?? body.market?.size ?? "20-40 employees",
      pricing: body.product?.pricing ?? "$500–$2,000/mo",
      focus: body.market?.focus ?? "Lead qualification & Phone Outreach",
    };

    const market = body.market ?? {
      location: arrays.client_location[0] ?? "Austin, TX",
      industry: metrics.industry,
      size: metrics.company_size,
      focus: metrics.focus,
    };

    const product = body.product ?? {
      name: body.productName || metrics.focus || "Lead Qualification Solution",
      companySize: metrics.company_size,
      pricing: metrics.pricing,
    };

    const documentContext: string = body.documentContext ?? "";
    const firstReasoning: string = body.firstReasoning ?? "";

    // 2. Second AI Combiner Prompt — Marries LLM Arrays + User Question Metrics
    const prompt = `[SECOND_AI_CALL_UNIFIED_COMBINER]:
You are the Lead Discovery Synthesis Engine. Combine the initial LLM array extractions with the user's questionnaire metrics into a unified search strategy.

1. INITIAL LLM ARRAY EXTRACTIONS:
- Organization Domains: ${JSON.stringify(arrays.organization_domain.length ? arrays.organization_domain : ["targetclinics.com", "localpractices.org"])}
- Client Locations: ${JSON.stringify(arrays.client_location.length ? arrays.client_location : [market.location ?? "Austin, TX"])}
- Core Keywords: ${JSON.stringify(arrays.keywords.length ? arrays.keywords : ["Healthcare", "Clinics"])}
${documentContext ? `Context: ${documentContext.slice(0, 300)}` : ""}

2. USER QUESTIONNAIRE METRICS (From Chatbot Interface):
- Target Industry: ${metrics.industry}
- Target Company Size: ${metrics.company_size}
- Product Pricing: ${metrics.pricing}
- Outreach Focus: ${metrics.focus}
${firstReasoning ? `\nStrategy Notes: ${firstReasoning.slice(0, 200)}` : ""}

Synthesize BOTH inputs into the definitive search queries for Google, LinkedIn, and directory scrapers.
Return ONLY valid JSON with these keys:
{
  "searchKeywords": ["phrase1","phrase2","phrase3","phrase4","phrase5"],
  "googleKeywords": "...",
  "linkedinKeywords": "...",
  "facebookKeywords": "...",
  "yellowpagesKeywords": "...",
  "decisionMakerTitles": ["title1","title2","title3"],
  "positiveSignals": ["signal1","signal2"],
  "negativeSignals": ["signal1","signal2"]
}
JSON only. No markdown.`;

    let aiKeywords: Record<string, unknown> = {};

    try {
      const aiResult = await generateCopilotResponse({
        message: prompt,
        history: [],
        attachments: [],
        context: {},
        isFirstReasoning: false,
      });
      const raw = aiResult.content ?? "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) aiKeywords = JSON.parse(jsonMatch[0]);
    } catch (aiErr) {
      console.warn("AI keyword generation failed, using fallback:", aiErr);
    }

    // Fallback
    const prod = product.name as string;
    const loc = (market.location as string) ?? "United States";
    const ind = (market.industry as string) ?? "businesses";
    const size = (product.companySize as string) ?? "20-40 employees";

    const keywords: ScraperKeywords = {
      core: (aiKeywords.searchKeywords as string[]) ?? [
        `${prod} for ${ind}`,
        `best ${prod} software`,
        `${prod} pricing ${size}`,
        `${prod} demo`,
        `${ind} software solution ${loc}`,
      ],
      google: (aiKeywords.googleKeywords as string) ??
        `"${prod}" (site:clutch.co OR site:g2.com OR site:yelp.com OR site:yellowpages.com) "${ind}" "${loc}"`,
      linkedin: (aiKeywords.linkedinKeywords as string) ??
        `("Owner" OR "CEO" OR "Operations Manager") AND "${ind.split("&")[0].trim()}"`,
      facebook: (aiKeywords.facebookKeywords as string) ??
        `${ind} owners ${loc} business networking`,
    };

    const sizeRange = parseSizeRange(size);

    const targetFilter: ScraperTargetFilter = {
      employeeRange: sizeRange,
      industries: [market.industry as string ?? "General B2B"],
      location: loc,
      decisionMakerTitles: (aiKeywords.decisionMakerTitles as string[]) ?? [
        "Owner", "CEO", "Operations Manager", "Practice Manager", "Director",
      ],
      positiveSignals: (aiKeywords.positiveSignals as string[]) ?? [
        `${sizeRange.min}-${sizeRange.max} employees`,
        "Active website",
        "Phone number listed",
      ],
      negativeSignals: (aiKeywords.negativeSignals as string[]) ?? [
        "franchise chain",
        "corporate headquartered",
        "500+ employees",
      ],
    };

    const platforms: ScraperPlatformConfig[] = [
      {
        platform: "google",
        enabled: true,
        searchQuery: keywords.google,
        maxResults: 100,
        delayBetweenRequests: 2000,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        selectors: {
          resultContainer: "div.g",
          companyName: "h3",
          url: "a[href]",
        },
      },
      {
        platform: "linkedin",
        enabled: true,
        searchQuery: keywords.linkedin,
        maxResults: 100,
        delayBetweenRequests: 3000,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        selectors: {
          resultContainer: ".entity-result",
          companyName: ".entity-result__title-text",
          url: "a.app-aware-link",
        },
      },
      {
        platform: "facebook",
        enabled: true,
        searchQuery: keywords.facebook,
        maxResults: 50,
        delayBetweenRequests: 4000,
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
      },
      {
        platform: "yellowpages",
        enabled: true,
        searchQuery: `${ind} ${loc}`,
        maxResults: 100,
        delayBetweenRequests: 1500,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        selectors: {
          resultContainer: ".search-results .result",
          companyName: ".business-name",
          url: "a.business-name",
          phone: ".phones.phone.primary",
        },
      },
    ];

    // 3. MCP Layer Data Convergence: Synthesize Single Source of Truth for Apollo API
    const apolloPayload = await buildApolloSingleSourceOfTruth({
      llmArrays: {
        organization_domain: arrays.organization_domain,
        client_location: arrays.client_location,
        keywords: arrays.keywords,
      },
      userMetrics: {
        industry: metrics.industry,
        company_size: metrics.company_size,
        pricing: metrics.pricing,
        focus: metrics.focus,
      },
      decisionMakerTitles: targetFilter.decisionMakerTitles,
      documentContext,
    });

    // 4. Save UnifiedDiscoveryRecord in the MCP Store
    const unifiedRecord: UnifiedDiscoveryRecord = {
      id: `unified-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      organizationId: "00000000-0000-0000-0000-000000000001",
      generatedAt: new Date().toISOString(),
      status: "synthesized",
      llmArrays: {
        organization_domain: arrays.organization_domain,
        client_location: arrays.client_location,
        keywords: arrays.keywords,
      },
      userMetrics: {
        industry: metrics.industry,
        company_size: metrics.company_size,
        pricing: metrics.pricing,
        focus: metrics.focus,
      },
      compiledQueries: {
        core: keywords.core,
        google: keywords.google,
        linkedin: keywords.linkedin,
        yellowpages: `${ind} ${loc}`,
        facebook: keywords.facebook,
      },
      decisionMakerTitles: targetFilter.decisionMakerTitles,
      positiveSignals: targetFilter.positiveSignals,
      negativeSignals: targetFilter.negativeSignals,
      apolloPayload,
    };

    await unifiedMCPStore.saveRecord(unifiedRecord);

    const response: ScraperConfigResponse & { 
      unifiedDiscovery: UnifiedDiscoveryRecord;
      apolloPayload: typeof apolloPayload;
    } = {
      generatedAt: new Date().toISOString(),
      jobLabel: `${prod} -> ${ind} in ${loc} (${size})`,
      keywords,
      targetFilter,
      platforms,
      productContext: {
        name: prod,
        pricing: product.pricing as string ?? "unknown",
        targetCompanySize: size,
        estimatedDealSize: estimateDealSize(product.pricing as string ?? ""),
      },
      meta: {
        priority: "high",
        retryOnFail: true,
        outputFormat: "json",
        webhookUrl: null,
      },
      unifiedDiscovery: unifiedRecord,
      apolloPayload,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("POST /api/scraper-config error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// ─── GET — Schema documentation ──────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/scraper-config",
    description: "Accepts compiled market + product intake. Returns full scraper configuration.",
    requestBody: {
      market: {
        location: "string  — e.g. 'Austin, TX'",
        industry: "string  — e.g. 'Dental & Healthcare Clinics'",
        size: "string  — e.g. '5-25 staff'",
        focus: "string  — e.g. 'CALL-E Phone Qualification'",
      },
      product: {
        name: "string  — e.g. 'AI Voice Agent (CALL-E)'  [REQUIRED]",
        companySize: "string  — e.g. '20-40 employees'",
        pricing: "string  — e.g. '$500-$2,000/mo'",
      },
      firstReasoning: "string (optional) — paste First Reasoning output for richer keywords",
    },
    responseShape: {
      generatedAt: "ISO timestamp",
      jobLabel: "Human-readable job name",
      keywords: {
        core: "string[]  — plain phrases for any search engine",
        google: "string   — Google search string with site:/intitle: operators",
        linkedin: "string   — LinkedIn Sales Navigator boolean string",
        facebook: "string   — Facebook Groups/Pages search query",
      },
      targetFilter: {
        employeeRange: "{ min, max }  — numeric employee count window",
        industries: "string[]",
        location: "string",
        decisionMakerTitles: "string[]  — job titles to target",
        positiveSignals: "string[]  — keywords that flag a good lead",
        negativeSignals: "string[]  — keywords to disqualify",
      },
      platforms: "ScraperPlatformConfig[]  — one object per platform (google/linkedin/facebook/yellowpages)",
      productContext: "{ name, pricing, targetCompanySize, estimatedDealSize }",
      meta: "{ priority, retryOnFail, outputFormat, webhookUrl }",
    },
    exampleRequest: {
      market: { location: "Austin, TX", industry: "Dental & Healthcare Clinics", size: "5-25 staff", focus: "CALL-E Phone Qualification" },
      product: { name: "AI Voice Agent (CALL-E)", companySize: "20-40 employees", pricing: "$500-$2,000/mo" },
    },
  });
}
