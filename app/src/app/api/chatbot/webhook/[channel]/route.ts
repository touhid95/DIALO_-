import { NextRequest, NextResponse } from "next/server";
import { getAdapter, listChannels } from "@/server/chatbot/adapters/registry";
import { processMedia } from "@/server/chatbot/media-processor";
import { chunkStore } from "@/server/chatbot/rag/chunk-store";
import { runGrillingTurn } from "@/server/chatbot/grilling-engine";
import { appendTurn, markSessionConverged } from "@/server/chatbot/session-logger";
import { formatAll } from "@/server/chatbot/output-formatter";
import type { SessionTurn } from "@/server/chatbot/types";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ channel: string }> }
) {
  const { channel } = await context.params;

  // WhatsApp Webhook verification handshake (Meta Graph API)
  if (channel === "whatsapp") {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === "subscribe" && token && (!expectedToken || token === expectedToken)) {
      return new NextResponse(challenge || "", { status: 200 });
    }
    return new NextResponse("Forbidden", { status: 403 });
  }

  const adapter = getAdapter(channel);
  if (!adapter) {
    return NextResponse.json(
      {
        success: false,
        error: `Channel '${channel}' not found. Supported: ${listChannels().join(", ")}`,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    channel,
    status: "active",
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ channel: string }> }
) {
  const { channel } = await context.params;
  const adapter = getAdapter(channel);

  if (!adapter) {
    return NextResponse.json(
      {
        success: false,
        error: `Channel '${channel}' not found. Supported: ${listChannels().join(", ")}`,
      },
      { status: 404 }
    );
  }

  try {
    const rawPayload = await request.json();
    const normalizedMsgs = await adapter.receive(rawPayload);

    // Process incoming normalized messages
    for (const msg of normalizedMsgs) {
      const activeSessionId = msg.session_id;
      let resolvedText = msg.text || "";

      if (msg.type !== "text") {
        const processed = await processMedia(msg);
        if (processed) {
          if (processed.ingest_to_vector_db && processed.resolved_text) {
            const docId = (msg.raw_channel_metadata?.name as string) || `doc-${Date.now()}`;
            chunkStore.ingest(docId, processed.resolved_text);
            const replies = formatAll(
              channel,
              `✅ Document received and ingested: \`${docId}\`. Make your pitch or share an assumption to test.`
            );
            for (const r of replies) {
              await adapter.send(msg.user_id, r);
            }
            continue;
          } else if (processed.resolved_text) {
            resolvedText = processed.resolved_text;
          }
        }
      }

      if (!resolvedText.trim()) continue;

      // Run Grilling Reasoning
      const result = await runGrillingTurn(resolvedText, activeSessionId, channel);

      // Log turn
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const turn = (result as any)._turn as SessionTurn | undefined;
      if (turn) {
        await appendTurn(activeSessionId, turn);
        if (result.converged) {
          await markSessionConverged(activeSessionId);
        }
      }

      // Format reply according to channel rules and send
      const replies = formatAll(channel, result.reply);
      for (const r of replies) {
        await adapter.send(msg.user_id, r);
      }
    }

    return NextResponse.json({ success: true, processed: normalizedMsgs.length });
  } catch (err) {
    console.error(`[Webhook ${channel}] Error processing webhook:`, err);
    // WhatsApp and Telegram expect 200 OK to stop retrying even if processing encountered an error
    return NextResponse.json(
      { success: false, error: "Internal processing error" },
      { status: 200 }
    );
  }
}
