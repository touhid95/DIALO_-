import { NextRequest, NextResponse } from "next/server";
import { calleGoalDispatcher } from "@/server/mcp/calle-dispatcher";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const minScore = typeof body.minScore === "number" ? body.minScore : 60;
    const maxCalls = typeof body.maxCalls === "number" ? body.maxCalls : 10;
    const goalId = body.goalId || "goal_lead_qualification_v1";

    const result = await calleGoalDispatcher.batchDispatch({
      minScore,
      maxCalls,
      goalId,
    });

    return NextResponse.json({
      success: true,
      message: `Dispatched ${result.dispatched} calls out of ${result.totalTargeted} targeted leads.`,
      result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
