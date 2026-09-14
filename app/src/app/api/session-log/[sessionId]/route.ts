import { NextRequest, NextResponse } from "next/server";
import { readSessionLog, listSessionIds } from "@/server/chatbot/session-logger";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 }
      );
    }

    if (sessionId === "all" || sessionId === "list") {
      const sessions = await listSessionIds();
      return NextResponse.json({ success: true, sessions });
    }

    const logContent = await readSessionLog(sessionId);

    if (!logContent) {
      return NextResponse.json(
        { success: false, error: `Session log for '${sessionId}' not found.` },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const format = url.searchParams.get("format");
    const download = url.searchParams.get("download");

    if (format === "json") {
      return NextResponse.json({
        success: true,
        sessionId,
        content: logContent,
      });
    }

    const headers = new Headers();
    headers.set("Content-Type", "text/markdown; charset=utf-8");

    if (download === "true") {
      headers.set(
        "Content-Disposition",
        `attachment; filename="session_${sessionId}.md"`
      );
    }

    return new NextResponse(logContent, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[SessionLog API] Error reading session log:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error reading session log." },
      { status: 500 }
    );
  }
}
