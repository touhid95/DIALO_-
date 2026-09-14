import { NextRequest, NextResponse } from "next/server";
import { calleGoalDispatcher } from "@/server/mcp/calle-dispatcher";
import { CALL_E_CONFIG } from "@/server/config/api-config";
import { mcpLogger } from "@/server/mcp/mcp-logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { leadId, goalId, mode } = body;

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: "Missing required 'leadId' in dispatch request." },
        { status: 400 }
      );
    }

    const effectiveGoalId = goalId || "goal_lead_qualification_v1";
    const forceMode = mode === "live" || mode === "synthetic" ? mode : undefined;

    mcpLogger.info(
      "CALLE",
      `[API /api/calle/dispatch] Triggering dispatch for lead ${leadId} (mode: ${forceMode || CALL_E_CONFIG.mode})...`
    );

    const dispatchResult = await calleGoalDispatcher.dispatchLead(
      leadId,
      effectiveGoalId,
      { forceMode }
    );

    if (!dispatchResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: dispatchResult.error || "Failed to dispatch CALL-E voice call.",
          data: dispatchResult,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dispatchResult,
      message: dispatchResult.orderPlaced
        ? "Call completed and B2B purchase/trial order captured mid-conversation!"
        : "CALL-E voice call completed successfully.",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    mcpLogger.error("CALLE", `[API /api/calle/dispatch] Unexpected error: ${msg}`);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    config: {
      mode: CALL_E_CONFIG.mode,
      hasApiKey: Boolean(process.env.CALL_E_API_KEY || CALL_E_CONFIG.apiKey),
      apiBaseUrl: CALL_E_CONFIG.apiBaseUrl,
    },
  });
}
