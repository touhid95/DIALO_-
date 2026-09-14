/**
 * Media Processor
 *
 * Converts non-text modalities into text, then routes to retrieval or query.
 *
 * Input type   → Processing                        → ingest_to_vector_db
 * ──────────────────────────────────────────────────────────────────────
 * audio        → STT (Whisper via OpenRouter)       → false (treat as query)
 * image        → Vision description (OpenRouter)    → false (treat as query)
 * document     → pdf-parse / mammoth extraction     → true  (ingest to store)
 * text         → Pass-through                       → false
 *
 * Processing failures short-circuit here — they never enter the reasoning stage.
 */

import type { NormalizedMessage, ProcessedMedia } from "./types";

// ──────────────────────────────────────────────────────────────────────────────
// Audio — Speech to Text
// ──────────────────────────────────────────────────────────────────────────────

async function transcribeAudio(mediaUrl: string, _mimeType: string): Promise<string> {
  // If it's a data URL (web adapter base64), we can't call Whisper directly.
  // Return a placeholder — replace with Deepgram / Whisper API when you have
  // an STT API key.
  if (!mediaUrl || mediaUrl.startsWith("data:")) {
    return "[Audio message received — speech-to-text not yet configured. Please type your question.]";
  }

  // TODO: Wire up OpenAI Whisper API or Deepgram
  // const formData = new FormData();
  // formData.append("file", await fetch(mediaUrl).then(r => r.blob()), "audio.ogg");
  // formData.append("model", "whisper-1");
  // const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  //   body: formData,
  // });
  // const data = await res.json();
  // return data.text || "[Transcription failed]";

  return "[Audio transcription not yet configured — set OPENAI_API_KEY or DEEPGRAM_API_KEY]";
}

// ──────────────────────────────────────────────────────────────────────────────
// Image — Vision Description
// ──────────────────────────────────────────────────────────────────────────────

async function describeImage(mediaUrl: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || !mediaUrl) {
    return "[Image received — vision description not configured]";
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Lead Intelligence Grilling Bot",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe this image in detail, focusing on any text, diagrams, product information, or business-relevant content. Be thorough and accurate.",
              },
              { type: "image_url", image_url: { url: mediaUrl } },
            ],
          },
        ],
        max_tokens: 800,
      }),
    });

    if (!res.ok) return "[Image analysis failed]";
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "[Image analysis returned empty]";
  } catch (err) {
    console.error("[MediaProcessor] describeImage error:", err);
    return "[Image analysis error]";
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Document — Text Extraction (PDF / DOCX)
// ──────────────────────────────────────────────────────────────────────────────

async function extractDocumentText(mediaUrl: string, mimeType: string): Promise<string> {
  if (!mediaUrl) return "[Document URL missing]";

  try {
    // Fetch the raw bytes
    let buffer: Buffer;

    if (mediaUrl.startsWith("data:")) {
      // Base64 data URL
      const base64Part = mediaUrl.split(",")[1];
      buffer = Buffer.from(base64Part, "base64");
    } else {
      const res = await fetch(mediaUrl);
      if (!res.ok) return "[Document download failed]";
      buffer = Buffer.from(await res.arrayBuffer());
    }

    const isPdf =
      mimeType === "application/pdf" ||
      mimeType.includes("pdf");
    const isDocx =
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType.includes("docx");

    if (isPdf) {
      const { extractPdfText } = await import("@/lib/pdf");
      const text = await extractPdfText(buffer);
      return text.trim() || "[PDF had no extractable text]";
    }

    if (isDocx) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return result.value?.trim() || "[DOCX had no extractable text]";
    }

    // Fallback: try to read as UTF-8 text
    return buffer.toString("utf-8").trim();
  } catch (err) {
    console.error("[MediaProcessor] extractDocumentText error:", err);
    return "[Document extraction failed]";
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Processor
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Process a NormalizedMessage into a ProcessedMedia.
 * Every modality converges to { resolved_text, ingest_to_vector_db }.
 *
 * Returns null if the message cannot be processed (e.g. empty).
 */
export async function processMedia(msg: NormalizedMessage): Promise<ProcessedMedia | null> {
  const start = Date.now();

  // Pure text — pass through
  if (msg.type === "text") {
    if (!msg.text?.trim()) return null;
    return {
      message_id: msg.message_id,
      resolved_text: msg.text.trim(),
      source_type: "text",
      ingest_to_vector_db: false,
      processing_metadata: { char_count: msg.text.length },
    };
  }

  // Audio — transcribe
  if (msg.type === "audio") {
    const transcribed = await transcribeAudio(
      msg.media?.url || "",
      msg.media?.mime_type || "audio/ogg"
    );
    return {
      message_id: msg.message_id,
      resolved_text: transcribed,
      source_type: "audio",
      ingest_to_vector_db: false,
      processing_metadata: { duration_sec: Math.round((Date.now() - start) / 1000) },
    };
  }

  // Image — describe
  if (msg.type === "image") {
    // Use the data URL directly if available (web channel), or the media URL
    const imageUrl = msg.media?.url || "";
    const description = await describeImage(imageUrl);
    // Also prepend any caption the user sent
    const resolved = msg.text ? `${msg.text}\n\n${description}` : description;
    return {
      message_id: msg.message_id,
      resolved_text: resolved,
      source_type: "image",
      ingest_to_vector_db: false,
      processing_metadata: { duration_sec: Math.round((Date.now() - start) / 1000) },
    };
  }

  // Document / PDF / DOCX — extract and ingest to vector store
  if (msg.type === "document") {
    // If text is already extracted (web channel), use it directly
    const extracted = msg.text || await extractDocumentText(
      msg.media?.url || "",
      msg.media?.mime_type || "application/octet-stream"
    );

    return {
      message_id: msg.message_id,
      resolved_text: extracted,
      source_type: "document",
      ingest_to_vector_db: true,
      processing_metadata: {
        char_count: extracted.length,
        duration_sec: Math.round((Date.now() - start) / 1000),
      },
    };
  }

  return null;
}
