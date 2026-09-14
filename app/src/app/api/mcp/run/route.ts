import { NextRequest, NextResponse } from "next/server";
import { mcpOrchestrator } from "@/server/mcp/mcp-orchestrator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const industry = body.industry || body.scraperConfig?.targetFilter?.industries?.[0] || "Dental & Healthcare";
    const location = body.location || body.scraperConfig?.targetFilter?.location || "Austin, TX";
    const productName = body.productName || body.scraperConfig?.productContext?.name || "CALL-E Voice Agent";

    const job = await mcpOrchestrator.runSearchPipeline(
      {
        industry,
        location,
        productName,
        scraperConfig: body.scraperConfig,
        keywords: body.scraperConfig?.keywords || body.keywords,
        unifiedDiscoveryId: body.unifiedDiscoveryId || body.scraperConfig?.unifiedDiscovery?.id,
        discoverySpec: body.discoverySpec || (body.scraperConfig?.unifiedDiscovery ? {
          targetDomains: body.scraperConfig.unifiedDiscovery.llmArrays.organization_domain,
          targetLocations: body.scraperConfig.unifiedDiscovery.llmArrays.client_location,
          keywords: body.scraperConfig.unifiedDiscovery.llmArrays.keywords,
          targetIndustry: body.scraperConfig.unifiedDiscovery.userMetrics.industry,
          targetCompanySize: body.scraperConfig.unifiedDiscovery.userMetrics.company_size,
          targetPricing: body.scraperConfig.unifiedDiscovery.userMetrics.pricing,
          outreachGoal: body.scraperConfig.unifiedDiscovery.userMetrics.focus,
        } : undefined),
      },
      {
        autoDispatchCalle: Boolean(body.autoDispatchCalle),
        minScoreToCall: body.minScoreToCall ?? 60,
        calleGoalId: body.calleGoalId,
      }
    );

    return NextResponse.json({
      success: true,
      message: "MCP Search Pipeline started",
      job,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
