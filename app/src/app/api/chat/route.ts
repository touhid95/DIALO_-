/**
 * POST /api/chat — Multimodal AI Copilot endpoint powered by OpenRouter
 * Processes text, images, and PDFs
 * Inquires for business clarifications and returns structured JSON output
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  generateCopilotResponse,
  ChatAttachment,
  ChatContext,
} from "@/server/services/openrouter";

const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let message = "";
    let taskId: string | undefined;
    let leadId: string | undefined;
    const attachments: ChatAttachment[] = [];
    let history: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      message = (formData.get("message") as string) || "";
      taskId = (formData.get("taskId") as string) || undefined;
      leadId = (formData.get("leadId") as string) || undefined;
      
      const historyRaw = formData.get("history") as string | null;
      if (historyRaw) {
        try {
          history = JSON.parse(historyRaw);
        } catch (e) {
          console.warn("Failed to parse history from form data:", e);
        }
      }

      // Process uploaded files
      const files = formData.getAll("files") as File[];
      for (const file of files) {
        if (!file || typeof file.arrayBuffer !== "function") continue;
        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = file.type || "";
        const fileName = file.name || "attachment";
        const ext = fileName.split(".").pop()?.toLowerCase() || "";

        // Check if image
        if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) {
          const base64 = buffer.toString("base64");
          const safeMime = mimeType || (ext === "png" ? "image/png" : "image/jpeg");
          attachments.push({
            type: "image",
            name: fileName,
            dataUrl: `data:${safeMime};base64,${base64}`,
          });
        }
        // Check if PDF
        else if (mimeType === "application/pdf" || ext === "pdf") {
          let extractedText = "";
          try {
            const pdfModule = await import("pdf-parse");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pdfParse = (pdfModule as any).default || pdfModule;
            const pdfData = await pdfParse(buffer);
            extractedText = pdfData.text || "";
          } catch (pdfErr) {
            console.error("PDF parse error in chat:", pdfErr);
            extractedText = "[Text extraction from PDF encountered an error]";
          }

          attachments.push({
            type: "pdf",
            name: fileName,
            text: extractedText.trim(),
          });
        }
        // Check if Word DOCX
        else if (ext === "docx") {
          let extractedText = "";
          try {
            const mammoth = await import("mammoth");
            const res = await mammoth.extractRawText({ buffer });
            extractedText = res.value || "";
          } catch (docxErr) {
            console.error("DOCX parse error in chat:", docxErr);
            extractedText = "[Text extraction from DOCX failed]";
          }

          attachments.push({
            type: "document",
            name: fileName,
            text: extractedText.trim(),
          });
        }
        // Plain text or Markdown
        else {
          const text = buffer.toString("utf-8");
          attachments.push({
            type: "document",
            name: fileName,
            text: text.trim(),
          });
        }
      }
    } else {
      // JSON body
      const body = await request.json();
      message = body.message || "";
      taskId = body.taskId;
      leadId = body.leadId;
      history = body.history || [];

      if (Array.isArray(body.attachments)) {
        for (const att of body.attachments) {
          attachments.push(att);
        }
      }
    }

    if (!message && attachments.length === 0) {
      return NextResponse.json(
        { success: false, error: "A message or attachment is required." },
        { status: 400 }
      );
    }

    // Context gathering
    const context: ChatContext = {};

    // 1. Lead context
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

    // 2. Active criteria context
    const criteria = await prisma.leadCriteria.findFirst({
      where: { organizationId: DEFAULT_ORG_ID },
      orderBy: { createdAt: "desc" },
    });
    if (criteria?.criteriaJson) {
      context.currentCriteria = criteria.criteriaJson as Record<string, unknown>;
    }

    // 3. Database metrics
    try {
      context.taskCount = await prisma.task.count({ where: { organizationId: DEFAULT_ORG_ID } });
      context.leadCount = await prisma.lead.count({ where: { organizationId: DEFAULT_ORG_ID } });
      context.callCount = await prisma.call.count({ where: { organizationId: DEFAULT_ORG_ID } });
    } catch {
      // Ignore count errors
    }

    // Call OpenRouter multimodal service
    const copilotResult = await generateCopilotResponse({
      message: message || "Please analyze the attached document / image and identify the ideal customer profile and business type.",
      history,
      attachments,
      context,
    });

    return NextResponse.json({
      success: true,
      data: {
        role: "assistant",
        content: copilotResult.content,
        businessProfile: copilotResult.businessProfile,
        clarifications: copilotResult.clarifications,
        suggestedReplies: copilotResult.suggestedReplies,
        extractedCriteria: copilotResult.extractedCriteria,
        actions: copilotResult.actions || [],
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
