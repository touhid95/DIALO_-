/**
 * Grilling Engine — Socratic Reasoning
 *
 * Implements the "Grilling" system prompt strategy:
 *   1. Internal <thinking> block (hidden from user, saved to session log)
 *   2. Socratic challenge — pick one flaw, ask a sharp question
 *   3. Convergence — guide to conclusion only when challenges are answered
 *
 * Uses the OpenRouter API with fallback model chain.
 * Retrieves relevant context from the in-process ChunkStore (RAG).
 */

import type { Chunk, GrillingResult, SessionTurn } from "./types";
import { chunkStore } from "./rag/chunk-store";
import { extractThinking } from "./output-formatter";
import { loadSession } from "./session-logger";

// ──────────────────────────────────────────────────────────────────────────────
// System Prompt
// ──────────────────────────────────────────────────────────────────────────────

const GRILLING_SYSTEM_PROMPT = `You are an elite, highly critical Product Strategy Analyst. Your goal is to "grill" the user using the Socratic method to pressure-test their product logic, features, and assumptions based on the retrieved documentation.

Follow these strict rules for every turn:

1. INTERNAL REASONING: Before you respond, write out your step-by-step thinking inside a <thinking> block. Analyze what the user said against the retrieved context, identify contradictions, gaps, and weak assumptions, then formulate your strategy.

2. SOCRATIC CHALLENGE: Do not agree easily. Pick ONE critical flaw or assumption in what the user said and ask a sharp, targeted, challenging question. Be specific — reference actual details from the retrieved context when contradicting the user.

3. CONVERGENCE: Only guide the conversation toward a final conclusion when the user has successfully answered your core challenges with solid logic and evidence. When converging, explicitly state that the reasoning holds up.

4. FORMAT: After the </thinking> block, write your reply in clean Markdown. Use **bold** for emphasis. Be concise and direct — no fluff.

5. CONVERGENCE SIGNAL: If you believe the user has addressed all challenges satisfactorily, end your reply with exactly: [CONVERGED]`;

// ──────────────────────────────────────────────────────────────────────────────
// OpenRouter call (reuses the same retry logic)
// ──────────────────────────────────────────────────────────────────────────────

interface OrchestratorMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callLLM(messages: OrchestratorMessage[]): Promise<string | null> {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  // NVIDIA NIM path
  if (apiKey.startsWith("nvapi-")) {
    const nimModel = process.env.NVIDIA_MODEL || "nvidia/nemotron-3.5-lightning-30b-a3b";
    try {
      console.log(`[GrillingEngine] Calling NVIDIA NIM with ${nimModel}...`);
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: nimModel,
          messages,
          temperature: 0.7,
          top_p: 0.95,
          max_tokens: 700,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const msg = data.choices?.[0]?.message;
        const content = msg?.content || "";
        const reasoning = msg?.reasoning_content || "";

        // If Nemotron provided native reasoning_content and content doesn't already have <thinking>
        if (reasoning && !content.includes("<thinking>")) {
          return `<thinking>\n${reasoning.trim()}\n</thinking>\n\n${content.trim()}`;
        }
        return content;
      } else {
        const errText = await res.text();
        console.warn(`[GrillingEngine] NVIDIA NIM error HTTP ${res.status}: ${errText.slice(0, 150)}`);
      }
    } catch (err) {
      console.warn("[GrillingEngine] NVIDIA NIM call failed:", err);
    }
  }

  // OpenRouter fallback chain
  const modelsToTry = [
    process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    "google/gemini-2.5-flash",
    "meta-llama/llama-3.3-70b-instruct:free",
  ];

  for (const model of modelsToTry) {
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
          model,
          messages,
          max_tokens: 2000,
        }),
      });

      if (!res.ok) {
        console.warn(`[GrillingEngine] Model ${model} HTTP ${res.status} — trying backup`);
        continue;
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content && typeof content === "string") {
        console.log(`[GrillingEngine] Got response from ${model} (${content.length} chars)`);
        return content;
      }
    } catch (err) {
      console.warn(`[GrillingEngine] Model ${model} error:`, err);
    }
  }

  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Fallback (no API key or all models failed)
// ──────────────────────────────────────────────────────────────────────────────

function fallbackGrillingResponse(userInput: string, chunks: Chunk[]): string {
  if (chunks.length === 0) {
    return `<thinking>
No product context has been ingested yet. I need documentation to grill effectively. Asking the user to provide some.
</thinking>

**Before I can challenge your assumptions, I need context.**

No product documentation has been uploaded to this session yet. Please upload a PDF, DOCX, or paste relevant product information, and I'll start pressure-testing your logic against it.

What are you trying to validate today?`;
  }

  const firstChunk = chunks[0].text.slice(0, 300);
  return `<thinking>
The user said: "${userInput.slice(0, 150)}..."
Retrieved context includes: "${firstChunk}..."
Identifying a potential contradiction or gap to challenge.
</thinking>

**Let me challenge that.**

Based on the documentation you've shared, there's a tension worth examining: you're making an assumption that isn't directly supported by the retrieved context.

**Here's my challenge:** ${userInput.length > 50 ? `You claim "${userInput.slice(0, 80)}..." — but` : "But"} what specific evidence from your product documentation supports this? The retrieved context suggests a different constraint.

Walk me through the reasoning. If it holds up, I'll concede — but I need to see the logic first.`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Grilling Engine
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Run the grilling reasoning pipeline for a single turn.
 *
 * @param userInput - The resolved text from the user (after media processing)
 * @param sessionId - The current session ID (for loading history)
 * @param channel - The channel ID (for context)
 */
export async function runGrillingTurn(
  userInput: string,
  sessionId: string,
  channel: string
): Promise<GrillingResult> {

  // 1. RAG retrieval
  const retrievedChunks = chunkStore.query(userInput, 5);

  // 2. Build context block from retrieved chunks
  const contextBlock = retrievedChunks.length > 0
    ? `## Retrieved Product Context\n\n${retrievedChunks
        .map((c, i) => `**[Source ${i + 1}: ${c.doc_id}]** (relevance: ${c.score?.toFixed(2)})\n${c.text}`)
        .join("\n\n---\n\n")}`
    : "## Retrieved Product Context\n\n*No relevant context found in uploaded documents.*";

  // 3. Load session history for continuity
  const session = await loadSession(sessionId);
  const historyMessages: OrchestratorMessage[] = [];

  if (session && session.turns.length > 0) {
    // Include last 6 turns for context
    const recentTurns = session.turns.slice(-6);
    for (const turn of recentTurns) {
      historyMessages.push({ role: "user", content: turn.user_input });
      historyMessages.push({ role: "assistant", content: turn.reply });
    }
  }

  // 4. Assemble messages
  const messages: OrchestratorMessage[] = [
    { role: "system", content: GRILLING_SYSTEM_PROMPT },
    {
      role: "system",
      content: contextBlock,
    },
    ...historyMessages,
    {
      role: "user",
      content: userInput,
    },
  ];

  // 5. Call the LLM
  let rawResponse = await callLLM(messages);

  if (!rawResponse) {
    rawResponse = fallbackGrillingResponse(userInput, retrievedChunks);
  }

  // 6. Strip <thinking> block
  const { thinking, reply } = extractThinking(rawResponse);

  // 7. Detect convergence signal
  const converged = reply.includes("[CONVERGED]");
  const cleanReply = reply.replace("[CONVERGED]", "").trim();

  // 8. Build the turn record
  const session2 = await loadSession(sessionId);
  const turnNumber = (session2?.turns.length || 0) + 1;

  const turn: SessionTurn = {
    turn_number: turnNumber,
    timestamp: new Date().toISOString(),
    input_channel: channel,
    input_type: "text",
    user_input: userInput,
    retrieved_chunks: retrievedChunks,
    thinking,
    reply: cleanReply,
    converged,
  };

  return {
    reply: cleanReply,
    thinking,
    retrieved_chunks: retrievedChunks,
    converged,
    session_id: sessionId,
    // @ts-expect-error — pass turn for the caller to log
    _turn: turn,
  };
}
