import { NextRequest, NextResponse } from "next/server";
import { okfStore, OKFRecord } from "@/server/mcp/okf-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source"); // "search" | "upload" | "all"
    const minScore = searchParams.get("minScore") ? parseInt(searchParams.get("minScore")!, 10) : undefined;
    const minPhoneScore = searchParams.get("minPhoneScore") ? parseInt(searchParams.get("minPhoneScore")!, 10) : undefined;
    const location = searchParams.get("location") || undefined;
    const industry = searchParams.get("industry") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 100;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    // Hydrate store from DB if empty
    if (okfStore.size === 0) {
      await okfStore.hydrate();
    }

    const { records, total } = okfStore.query({
      source: source && source !== "all" ? (source as OKFRecord["source"]) : undefined,
      minScore,
      minPhoneScore,
      location,
      industry,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      total,
      count: records.length,
      data: records,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawItems = Array.isArray(body) ? body : (body.leads ? body.leads : [body]);

    if (rawItems.length === 0 || !rawItems[0]?.name) {
      return NextResponse.json(
        { success: false, error: "Invalid payload. Provide at least one lead with 'name'." },
        { status: 400 }
      );
    }

    const savedRecords: OKFRecord[] = [];

    for (const item of rawItems) {
      const id = item.id || crypto.randomUUID();
      const phone = item.phone || item.contact?.phone || null;
      const phoneE164 = item.phoneE164 || item.contact?.phoneE164 || phone;
      const location = item.location || item.firmographics?.location || "United States";
      const industry = item.industry || item.category || item.firmographics?.industry || "General B2B";

      const record: OKFRecord = {
        id,
        okfVersion: 1,
        generatedAt: new Date().toISOString(),
        source: item.source || "upload",
        sourceUrl: item.website || item.sourceUrl || null,
        mcpJobId: item.mcpJobId || null,
        unifiedDiscoveryId: item.unifiedDiscoveryId || null,
        discoverySpec: item.discoverySpec,

        identity: {
          name: item.name,
          tradingName: item.tradingName || null,
          website: item.website || null,
        },

        contact: {
          phone,
          phoneE164,
          phoneConfidence: item.contact?.phoneConfidence ?? (phone ? 0.9 : 0),
          phoneType: item.contact?.phoneType ?? (phone ? "landline" : "unknown"),
          email: item.email || item.contact?.email || null,
          emailConfidence: item.contact?.emailConfidence ?? (item.email ? 0.85 : 0),
          decisionMaker: item.decisionMaker || item.contact?.decisionMaker || null,
          decisionMakerTitle: item.decisionMakerTitle || item.contact?.decisionMakerTitle || null,
        },

        firmographics: {
          industry,
          employeeCount: item.employeeCount ?? item.firmographics?.employeeCount ?? null,
          employeeRange: item.employeeRange ?? item.firmographics?.employeeRange ?? (item.employeeCount ? `${item.employeeCount}` : null),
          location,
          city: item.city || location.split(",")[0]?.trim() || null,
          state: item.state || location.split(",")[1]?.trim() || null,
          yearFounded: item.yearFounded ?? null,
        },

        scores: {
          total: item.scores?.total ?? (item.score ?? 75),
          icpFit: item.scores?.icpFit ?? 20,
          businessQuality: item.scores?.businessQuality ?? 12,
          painSignal: item.scores?.painSignal ?? 18,
          intent: item.scores?.intent ?? 15,
          recency: item.scores?.recency ?? 5,
          contactability: item.scores?.contactability ?? 5,
          phoneScore: item.scores?.phoneScore ?? (phone ? 85 : 0),
          emailScore: item.scores?.emailScore ?? (item.email ? 80 : 0),
          dataCompleteness: item.scores?.dataCompleteness ?? 75,
          callReadiness: item.scores?.callReadiness ?? (phone ? 80 : 0),
        },

        ai: {
          hypothesis: item.ai?.hypothesis || `Target business passed directly into MCP Layer: ${item.name}`,
          recommendedAction: item.ai?.recommendedAction || (phone ? "call" : "research"),
          tags: item.ai?.tags || ["mcp-direct-pass", industry],
          qualifyingQuestions: item.ai?.qualifyingQuestions || ["What is your primary phone outreach workflow?"],
        },

        calleStatus: item.calleStatus || {
          dispatched: false,
          goalRunId: null,
          goalId: null,
          callStatus: null,
          lastCallResult: null,
          dispatchedAt: null,
        },

        evidence: item.evidence || [
          {
            type: "OBSERVED",
            claim: `Lead directly ingested into MCP layer: ${item.name}`,
            source: "MCP Layer Ingestion",
            confidence: 0.95,
            observedAt: new Date().toISOString(),
          },
        ],
      };

      await okfStore.upsert(record);
      savedRecords.push(record);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully stored ${savedRecords.length} lead(s) in MCP Layer (Prisma DB + Markdown Dossiers)`,
      count: savedRecords.length,
      data: savedRecords,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

