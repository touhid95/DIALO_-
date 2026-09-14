import { NextRequest, NextResponse } from "next/server";
import { mcpOrchestrator } from "@/server/mcp/mcp-orchestrator";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = mcpOrchestrator.getJob(jobId);

  if (!job) {
    return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, job });
}
