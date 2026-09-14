/**
 * POST /api/chat — Multimodal AI Copilot + Grilling mode endpoint
 *
 * Modes:
 *   mode: "copilot" (default) — existing OpenRouter ICP / Lead Intelligence path
 *   mode: "grilling"          — new Socratic grilling pipeline with RAG
 *
 * Accepts multipart/form-data or JSON.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  generateCopilotResponse,
  ChatAttachment,
  ChatContext,
} from "@/server/services/openrouter";

// Grilling pipeline modules
import { WebAdapter } from "@/server/chatbot/adapters/web-adapter";
import { processMedia } from "@/server/chatbot/media-processor";
import { chunkStore } from "@/server/chatbot/rag/chunk-store";
import { runGrillingTurn } from "@/server/chatbot/grilling-engine";
import { appendTurn, markSessionConverged } from "@/server/chatbot/session-logger";
import type { SessionTurn } from "@/server/chatbot/types";

const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";
const webAdapter = new WebAdapter();

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let message = "";
    let taskId: string | undefined;
    let leadId: string | undefined;
    let mode: "copilot" | "grilling" = "copilot";
    let sessionId: string | undefined;
    let isFirstReasoning = false;
    const attachments: ChatAttachment[] = [];
    let history: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];

    // ──────────────────────────────────────────────────────────────────────────
    // 1. Parse request body
    // ──────────────────────────────────────────────────────────────────────────

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      message = (formData.get("message") as string) || "";
      taskId = (formData.get("taskId") as string) || undefined;
      leadId = (formData.get("leadId") as string) || undefined;
      mode = ((formData.get("mode") as string) || "copilot") as "copilot" | "grilling";
      sessionId = (formData.get("sessionId") as string) || undefined;
      isFirstReasoning = formData.get("isFirstReasoning") === "true";

      const historyRaw = formData.get("history") as string | null;
      if (historyRaw) {
        try { history = JSON.parse(historyRaw); } catch {}
      }

      // Process uploaded files
      const files = formData.getAll("files") as File[];
      for (const file of files) {
        if (!file || typeof file.arrayBuffer !== "function") continue;
        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = file.type || "";
        const fileName = file.name || "attachment";
        const ext = fileName.split(".").pop()?.toLowerCase() || "";

        if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) {
          const base64 = buffer.toString("base64");
          const safeMime = mimeType || (ext === "png" ? "image/png" : "image/jpeg");
          attachments.push({
            type: "image",
            name: fileName,
            dataUrl: `data:${safeMime};base64,${base64}`,
          });
        } else if (mimeType === "application/pdf" || ext === "pdf") {
          let extractedText = "";
          try {
            const { extractPdfText } = await import("@/lib/pdf");
            extractedText = await extractPdfText(buffer);
          } catch (pdfErr) {
            console.error("PDF parse error:", pdfErr);
            extractedText = "[Text extraction from PDF encountered an error]";
          }
          attachments.push({ type: "pdf", name: fileName, text: extractedText.trim() });
        } else if (ext === "docx") {
          let extractedText = "";
          try {
            const mammoth = await import("mammoth");
            const res = await mammoth.extractRawText({ buffer });
            extractedText = res.value || "";
          } catch (docxErr) {
            console.error("DOCX parse error:", docxErr);
            extractedText = "[Text extraction from DOCX failed]";
          }
          attachments.push({ type: "document", name: fileName, text: extractedText.trim() });
        } else {
          const text = buffer.toString("utf-8");
          attachments.push({ type: "document", name: fileName, text: text.trim() });
        }
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let body: any = {};
      try {
        body = await request.json();
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid or malformed JSON body." },
          { status: 400 }
        );
      }
      message = body.message || "";
      taskId = body.taskId;
      leadId = body.leadId;
      mode = body.mode || "copilot";
      sessionId = body.sessionId;
      history = body.history || [];
      if (body.isFirstReasoning !== undefined) {
        isFirstReasoning = !!body.isFirstReasoning;
      }
      if (Array.isArray(body.attachments)) {
        for (const att of body.attachments) attachments.push(att);
      }
    }

    if (!message && attachments.length === 0) {
      return NextResponse.json(
        { success: false, error: "A message or attachment is required." },
        { status: 400 }
      );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. GRILLING MODE pipeline
    // ──────────────────────────────────────────────────────────────────────────

    if (mode === "grilling") {
      // Build resolved attachments list for the web adapter
      const resolvedAttachments = attachments.map((att) => ({
        type: att.type as "image" | "pdf" | "document" | "audio",
        name: att.name,
        dataUrl: att.dataUrl,
        text: att.text,
      }));

      // Normalize via web adapter (assigns/resumes session)
      const normalizedMsgs = await webAdapter.receive({
        message,
        sessionId,
        resolvedAttachments,
      });

      if (normalizedMsgs.length === 0) {
        return NextResponse.json({ success: false, error: "Empty message" }, { status: 400 });
      }

      const activeSessionId = normalizedMsgs[0].session_id;
      let resolvedText = message;
      let ingestDocs: string[] = [];

      // Process media messages (documents, images)
      for (const normalized of normalizedMsgs) {
        const processed = await processMedia(normalized);
        if (!processed) continue;

        if (processed.ingest_to_vector_db && processed.resolved_text) {
          // Ingest document into chunk store
          const docId = (normalized.raw_channel_metadata?.name as string) || `doc-${Date.now()}`;
          chunkStore.ingest(docId, processed.resolved_text);
          ingestDocs.push(docId);
        } else if (processed.resolved_text && normalized.type !== "text") {
          // Use media description as the query
          resolvedText = processed.resolved_text;
        }
      }

      // If we only ingested docs (no text query), ask the user for their first challenge
      if (!resolvedText.trim() && ingestDocs.length > 0) {
        const docNames = ingestDocs.join(", ");
        return NextResponse.json({
          success: true,
          data: {
            role: "assistant",
            mode: "grilling",
            content: `✅ **Document ingested:** \`${docNames}\` (${chunkStore.size} chunks indexed)\n\nI've read through your product documentation. **Now, make your pitch.** What claim, assumption, or decision do you want me to pressure-test?`,
            thinking: "",
            retrieved_chunks: [],
            session_id: activeSessionId,
            converged: false,
          },
        });
      }

      // Run grilling reasoning
      const result = await runGrillingTurn(resolvedText, activeSessionId, "web");

      // Log the turn (the engine returns it as _turn)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const turn = (result as any)._turn as SessionTurn | undefined;
      if (turn) {
        await appendTurn(activeSessionId, turn);
        if (result.converged) {
          await markSessionConverged(activeSessionId);
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          role: "assistant",
          mode: "grilling",
          content: result.reply,
          thinking: result.thinking,
          retrieved_chunks: result.retrieved_chunks,
          session_id: activeSessionId,
          converged: result.converged,
          ingested_docs: ingestDocs,
          chunk_store_size: chunkStore.size,
        },
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. COPILOT MODE (original path — untouched)
    // ──────────────────────────────────────────────────────────────────────────

    const context: ChatContext = {};

    if (leadId) {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: {
          evidence: { take: 6 },
          calls: { include: { result: true }, take: 1, orderBy: { createdAt: "desc" } },
        },
      });

      if (lead) {
        context.leadId = lead.id;
        context.leadName = lead.name;
        context.leadScore = lead.score ?? undefined;
        context.leadHypothesis = lead.hypothesis ?? undefined;
        context.leadEvidence = lead.evidence.map((e) => e.claim);
        if (lead.calls[0]?.result?.summary) {
          context.callSummary = lead.calls[0].result.summary;
        }
      }
    }

    const criteria = await prisma.leadCriteria.findFirst({
      where: { organizationId: DEFAULT_ORG_ID },
      orderBy: { createdAt: "desc" },
    });
    if (criteria?.criteriaJson) {
      context.currentCriteria = criteria.criteriaJson as Record<string, unknown>;
    }

    try {
      context.taskCount = await prisma.task.count({ where: { organizationId: DEFAULT_ORG_ID } });
      context.leadCount = await prisma.lead.count({ where: { organizationId: DEFAULT_ORG_ID } });
      context.callCount = await prisma.call.count({ where: { organizationId: DEFAULT_ORG_ID } });
    } catch {}

    const copilotResult = await generateCopilotResponse({
      message: message || "Please analyze the attached document / image.",
      history,
      attachments,
      context,
      isFirstReasoning,
    });

    return NextResponse.json({
      success: true,
      data: {
        role: "assistant",
        mode: "copilot",
        content: copilotResult.content,
        thinking: copilotResult.thinking,
        isFirstReasoning: copilotResult.isFirstReasoning,
        businessProfile: copilotResult.businessProfile,
        clarifications: copilotResult.clarifications,
        suggestedReplies: copilotResult.suggestedReplies,
        extractedCriteria: copilotResult.extractedCriteria,
        actions: copilotResult.actions || [],
        questionnaireSuggestions: copilotResult.questionnaireSuggestions,
        extractedOffer: copilotResult.extractedOffer,
      },
    });
  } catch (error) {
    console.error("POST /api/chat error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error occurred while processing chat." },
      { status: 500 }
    );
  }
}
