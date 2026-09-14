import { NextRequest, NextResponse } from "next/server";
import { mcpLogger, McpLogEntry } from "@/server/mcp/mcp-logger";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as McpLogEntry["category"] | null;
  const level = searchParams.get("level") as McpLogEntry["level"] | null;
  const limit = parseInt(searchParams.get("limit") || "100", 10);
  const since = searchParams.get("since") || undefined;

  const logs = mcpLogger.getLogs({
    category: category || undefined,
    level: level || undefined,
    limit,
    since,
  });

  return NextResponse.json({
    success: true,
    total: logs.length,
    logs,
  });
}
