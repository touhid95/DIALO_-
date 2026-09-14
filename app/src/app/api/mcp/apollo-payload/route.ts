import { NextRequest, NextResponse } from "next/server";
import { unifiedMCPStore } from "@/server/mcp/unified-schema";

export async function GET(request: NextRequest) {
  try {
    const orgId = "00000000-0000-0000-0000-000000000001";
    const record = unifiedMCPStore.getLatestRecord(orgId);

    if (!record || !record.apolloPayload) {
      return NextResponse.json({
        success: false,
        message: "No Apollo API payload found in MCP Layer yet. Please synthesize your intake first.",
        status: "empty",
      });
    }

    return NextResponse.json({
      success: true,
      data: record.apolloPayload,
      unifiedDiscoveryId: record.id,
      generatedAt: record.generatedAt,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
