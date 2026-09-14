/**
 * Session Logger
 *
 * Manages per-session Markdown log files stored in prisma/sessions/.
 * Every turn is appended after it completes — crash-safe by design.
 *
 * File path: prisma/sessions/session_<id>.md
 *
 * Also manages session ID assignment / resumption based on an idle timeout.
 * Default idle timeout: 30 minutes of inactivity → new session.
 */

import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { GrillingSession, SessionTurn } from "./types";

// ──────────────────────────────────────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────────────────────────────────────

const SESSIONS_DIR = path.resolve(process.cwd(), "prisma", "sessions");
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

async function ensureSessionsDir(): Promise<void> {
  await fs.mkdir(SESSIONS_DIR, { recursive: true });
}

function sessionFilePath(sessionId: string): string {
  return path.join(SESSIONS_DIR, `session_${sessionId}.md`);
}

// ──────────────────────────────────────────────────────────────────────────────
// In-process session cache (avoids reading disk on every request)
// ──────────────────────────────────────────────────────────────────────────────

const g = globalThis as typeof globalThis & {
  __grillingSessions?: Map<string, GrillingSession>;
  __userLastSession?: Map<string, { sessionId: string; lastActive: number }>;
};

if (!g.__grillingSessions) g.__grillingSessions = new Map();
if (!g.__userLastSession) g.__userLastSession = new Map();

const sessionCache = g.__grillingSessions;
const userLastSession = g.__userLastSession;

// ──────────────────────────────────────────────────────────────────────────────
// Session ID assignment
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Get or create a session ID for a user.
 * Resumes the previous session if within the idle timeout,
 * otherwise starts a fresh session.
 */
export async function getOrCreateSessionId(userId: string, channel: string): Promise<string> {
  const lastEntry = userLastSession.get(userId);
  const now = Date.now();

  if (lastEntry && now - lastEntry.lastActive < IDLE_TIMEOUT_MS) {
    // Resume existing session
    userLastSession.set(userId, { sessionId: lastEntry.sessionId, lastActive: now });
    return lastEntry.sessionId;
  }

  // New session
  const sessionId = uuidv4();
  const session: GrillingSession = {
    session_id: sessionId,
    user_id: userId,
    channel,
    started_at: new Date().toISOString(),
    last_active_at: new Date().toISOString(),
    status: "in-progress",
    turns: [],
  };

  sessionCache.set(sessionId, session);
  userLastSession.set(userId, { sessionId, lastActive: now });

  await writeSessionHeader(session);
  return sessionId;
}

/**
 * Load a session from cache or from disk.
 * Returns null if the session does not exist.
 */
export async function loadSession(sessionId: string): Promise<GrillingSession | null> {
  if (sessionCache.has(sessionId)) {
    return sessionCache.get(sessionId)!;
  }

  // Not in cache — try disk (for resuming after restart)
  // We store turns in-memory only for simplicity; on restart session history
  // is lost from memory but the Markdown log is preserved on disk.
  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Markdown file operations
// ──────────────────────────────────────────────────────────────────────────────

async function writeSessionHeader(session: GrillingSession): Promise<void> {
  await ensureSessionsDir();

  const header = `# Grilling Session: ${session.session_id}
**User:** ${session.user_id}
**Channel:** ${session.channel}
**Started:** ${session.started_at}
**Status:** ${session.status}

---

## Retrieved Product Context

_Context will be appended as documents are ingested._

---

## Conversation History

`;

  try {
    await fs.writeFile(sessionFilePath(session.session_id), header, "utf-8");
  } catch (err) {
    console.error("[SessionLogger] Failed to write session header:", err);
  }
}

/**
 * Append a completed turn to the session's Markdown log.
 * Also updates the in-memory session cache.
 * Never throws — storage failures are logged, not propagated.
 */
export async function appendTurn(sessionId: string, turn: SessionTurn): Promise<void> {
  // Update in-memory cache
  const session = sessionCache.get(sessionId);
  if (session) {
    session.turns.push(turn);
    session.last_active_at = new Date().toISOString();
    if (turn.converged) session.status = "converged";
  }

  // Update user's last active timestamp
  if (session) {
    const existing = userLastSession.get(session.user_id);
    if (existing) {
      userLastSession.set(session.user_id, { ...existing, lastActive: Date.now() });
    }
  }

  // Append to Markdown file
  const turnMd = formatTurnMarkdown(turn);

  try {
    await ensureSessionsDir();
    await fs.appendFile(sessionFilePath(sessionId), turnMd, "utf-8");
  } catch (err) {
    console.error("[SessionLogger] Failed to append turn:", err);
    // Non-fatal — never block the user-facing reply on storage sync
  }
}

function formatTurnMarkdown(turn: SessionTurn): string {
  const chunks = turn.retrieved_chunks.length > 0
    ? turn.retrieved_chunks
        .map((c, i) => `  - **Chunk ${i + 1}** (score: ${c.score?.toFixed(3) || "N/A"}): *${c.doc_id}* — ${c.text.slice(0, 200).replace(/\n/g, " ")}...`)
        .join("\n")
    : "  _No chunks retrieved._";

  return `### Turn ${turn.turn_number} — ${turn.timestamp}

**Input Channel:** ${turn.input_channel} (${turn.input_type})

**User:** ${turn.user_input}

**Retrieved Context:**
${chunks}

**AI Reasoning (hidden from user):**
<details>
<summary>thinking</summary>

${turn.thinking || "_No thinking block captured._"}

</details>

**AI Response:** ${turn.reply}

**Converged:** ${turn.converged ? "✅ Yes" : "🔄 No"}

---

`;
}

/**
 * Update the status line in the session header on disk.
 * Best-effort — does not crash on failure.
 */
export async function markSessionConverged(sessionId: string): Promise<void> {
  const session = sessionCache.get(sessionId);
  if (session) {
    session.status = "converged";
  }

  try {
    const filePath = sessionFilePath(sessionId);
    const content = await fs.readFile(filePath, "utf-8");
    const updated = content.replace("**Status:** in-progress", "**Status:** converged");
    await fs.writeFile(filePath, updated, "utf-8");
  } catch {
    // Non-fatal
  }
}

/**
 * Return the raw Markdown content of a session log.
 */
export async function readSessionLog(sessionId: string): Promise<string | null> {
  try {
    return await fs.readFile(sessionFilePath(sessionId), "utf-8");
  } catch {
    return null;
  }
}

/**
 * List all session IDs that have log files on disk.
 */
export async function listSessionIds(): Promise<string[]> {
  try {
    await ensureSessionsDir();
    const files = await fs.readdir(SESSIONS_DIR);
    return files
      .filter((f) => f.startsWith("session_") && f.endsWith(".md"))
      .map((f) => f.replace("session_", "").replace(".md", ""));
  } catch {
    return [];
  }
}
