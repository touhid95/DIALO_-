/**
 * Grilling Chatbot Module — Shared Types & Interfaces
 * These contracts are the backbone of the pipeline.
 * Every stage communicates through these types only.
 */

// ──────────────────────────────────────────────────────────────────────────────
// Channel Layer
// ──────────────────────────────────────────────────────────────────────────────

/**
 * The canonical shape of any message entering the pipeline,
 * regardless of which channel it arrived from.
 */
export interface NormalizedMessage {
  message_id: string;
  /** Namespaced by channel prefix: "wa:", "tg:", "web:" */
  user_id: string;
  channel: string;
  session_id: string;
  type: "text" | "audio" | "image" | "document";
  /** Actual text content (null for pure media messages) */
  text: string | null;
  media?: {
    url: string;
    mime_type: string;
    size_bytes?: number;
  };
  timestamp: string;
  /** Channel-specific fields kept for debugging — never read downstream */
  raw_channel_metadata?: Record<string, unknown>;
}

/**
 * The formatted reply sent back through a channel adapter.
 * Content is already channel-appropriate (WhatsApp-safe markup, etc.)
 */
export interface ChannelReply {
  /** Channel-formatted text, ready to send */
  text: string;
  /** Pagination: if the reply was split, this is one page */
  page?: number;
  total_pages?: number;
}

/**
 * Every channel adapter must implement this interface.
 * Channel-specific authentication and API calls live here — never downstream.
 */
export interface ChannelAdapter {
  /** Unique identifier, e.g. "web", "whatsapp", "telegram" */
  channelId: string;

  /**
   * Called by the webhook/API route when a message arrives.
   * Returns one or more NormalizedMessage objects.
   */
  receive(rawPayload: unknown): Promise<NormalizedMessage[]>;

  /**
   * Called by the Output Formatter to deliver a formatted reply
   * back to the user through this channel.
   */
  send(userId: string, formattedReply: ChannelReply): Promise<void>;

  /**
   * Downloads channel-hosted media to a URL/blob the Media Processor
   * can consume. Channel authentication lives here, never downstream.
   */
  resolveMedia(mediaRef: string): Promise<{ url: string; mimeType: string }>;
}

// ──────────────────────────────────────────────────────────────────────────────
// Media Processor Layer
// ──────────────────────────────────────────────────────────────────────────────

export type SourceType = "text" | "audio" | "image" | "document";

/**
 * Output of the Media Processor — every input modality converges to this shape.
 */
export interface ProcessedMedia {
  message_id: string;
  /** Transcribed / extracted / described text — ready for retrieval */
  resolved_text: string;
  source_type: SourceType;
  /**
   * If true, the text should be chunked and ingested into the vector store
   * as new product context (e.g. uploaded docs).
   * If false, treat as a query (e.g. voice note asking a question).
   */
  ingest_to_vector_db: boolean;
  processing_metadata?: {
    duration_sec?: number;
    confidence?: number;
    page_count?: number;
    char_count?: number;
    error?: string;
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// RAG Layer
// ──────────────────────────────────────────────────────────────────────────────

export interface Chunk {
  chunk_id: string;
  doc_id: string;
  text: string;
  /** Cosine similarity score (0-1) — only present after a query */
  score?: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Grilling Engine Layer
// ──────────────────────────────────────────────────────────────────────────────

export interface SessionTurn {
  turn_number: number;
  timestamp: string;
  /** Channel (wa, tg, web) and modality of the input */
  input_channel: string;
  input_type: SourceType;
  /** Raw user text or transcribed text */
  user_input: string;
  /** Retrieved product context chunks used this turn */
  retrieved_chunks: Chunk[];
  /** The model's hidden reasoning (stripped from user-facing reply) */
  thinking: string;
  /** The user-facing Socratic challenge or reply */
  reply: string;
  /** Whether the model judged this turn as "converged" */
  converged: boolean;
}

export interface GrillingSession {
  session_id: string;
  user_id: string;
  channel: string;
  started_at: string;
  last_active_at: string;
  status: "in-progress" | "converged" | "error";
  turns: SessionTurn[];
}

export interface GrillingResult {
  reply: string;
  thinking: string;
  retrieved_chunks: Chunk[];
  converged: boolean;
  session_id: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Pipeline Context (passed through the whole pipeline for a single message)
// ──────────────────────────────────────────────────────────────────────────────

export interface PipelineContext {
  normalized: NormalizedMessage;
  processed: ProcessedMedia;
  session: GrillingSession;
}
