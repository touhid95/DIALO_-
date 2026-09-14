/**
 * RAG Chunk Store — In-Process Cosine Similarity Implementation
 *
 * A zero-dependency vector store that lives in the Node.js process memory.
 * Sufficient for demos and small document sets.
 *
 * Swap this file for a Pinecone / pgvector / Chroma client when you need
 * persistence or large-scale retrieval — the interface is identical.
 *
 * Chunking strategy:
 *   - Split text into ~600-token segments with 100-token overlap (estimated
 *     at ~4 chars/token).
 *   - Each chunk gets a bag-of-words TF-IDF style embedding vector.
 *   - Cosine similarity is used for retrieval.
 */

import { v4 as uuidv4 } from "uuid";
import type { Chunk } from "../types";

// ──────────────────────────────────────────────────────────────────────────────
// Chunking
// ──────────────────────────────────────────────────────────────────────────────

const CHUNK_CHARS = 2400;   // ~600 tokens @ 4 chars/token
const OVERLAP_CHARS = 400;  // ~100 token overlap

export function chunkText(text: string, chunkSize = CHUNK_CHARS, overlap = OVERLAP_CHARS): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 10) {
      chunks.push(chunk);
    }
    if (end >= text.length) break;
    start += chunkSize - overlap;
  }

  if (chunks.length === 0 && text.trim().length > 0) {
    chunks.push(text.trim());
  }

  return chunks;
}

// ──────────────────────────────────────────────────────────────────────────────
// Embedding — TF-IDF Bag-of-Words (no API calls)
// ──────────────────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","if","in","on","at","to","for","of","with",
  "is","it","be","as","by","we","you","this","that","are","was","were","has",
  "have","had","not","so","do","did","they","from","up","out","about","into",
  "then","than","its","be","been","will","would","could","should","may","might",
  "our","your","their","there","here","what","when","where","which","who","how",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function embed(text: string): Map<string, number> {
  const tokens = tokenize(text);
  const freq = new Map<string, number>();

  for (const t of tokens) {
    freq.set(t, (freq.get(t) || 0) + 1);
  }

  // Normalize by token count (TF)
  const total = tokens.length || 1;
  for (const [k, v] of freq) {
    freq.set(k, v / total);
  }

  return freq;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [k, va] of a) {
    const vb = b.get(k) || 0;
    dot += va * vb;
    normA += va * va;
  }

  for (const [, vb] of b) {
    normB += vb * vb;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// ──────────────────────────────────────────────────────────────────────────────
// ChunkStore
// ──────────────────────────────────────────────────────────────────────────────

interface StoredChunk {
  chunk_id: string;
  doc_id: string;
  text: string;
  vector: Map<string, number>;
  ingested_at: string;
}

class ChunkStore {
  private chunks: StoredChunk[] = [];

  /**
   * Ingest a document into the store.
   * Text is chunked, embedded, and stored.
   * Returns the number of chunks created.
   */
  ingest(docId: string, text: string): number {
    const segments = chunkText(text);

    for (const seg of segments) {
      this.chunks.push({
        chunk_id: uuidv4(),
        doc_id: docId,
        text: seg,
        vector: embed(seg),
        ingested_at: new Date().toISOString(),
      });
    }

    console.log(`[ChunkStore] Ingested ${segments.length} chunks from doc "${docId}". Total: ${this.chunks.length}`);
    return segments.length;
  }

  /**
   * Retrieve the top-k chunks most similar to a query.
   */
  query(queryText: string, k = 5): Chunk[] {
    if (this.chunks.length === 0) return [];

    const queryVec = embed(queryText);

    const scored = this.chunks
      .map((c) => ({
        chunk_id: c.chunk_id,
        doc_id: c.doc_id,
        text: c.text,
        score: cosineSimilarity(queryVec, c.vector),
      }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k);

    return scored;
  }

  /**
   * Remove all chunks belonging to a document.
   */
  remove(docId: string): void {
    const before = this.chunks.length;
    this.chunks = this.chunks.filter((c) => c.doc_id !== docId);
    console.log(`[ChunkStore] Removed ${before - this.chunks.length} chunks for doc "${docId}".`);
  }

  /** Current number of stored chunks. */
  get size(): number {
    return this.chunks.length;
  }

  /** List unique doc IDs currently in the store. */
  listDocs(): string[] {
    return [...new Set(this.chunks.map((c) => c.doc_id))];
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Singleton — persists across requests within the dev server process
// ──────────────────────────────────────────────────────────────────────────────

// Use globalThis to survive HMR in Next.js dev mode
const g = globalThis as typeof globalThis & { __chunkStore?: ChunkStore };
if (!g.__chunkStore) {
  g.__chunkStore = new ChunkStore();
}

export const chunkStore: ChunkStore = g.__chunkStore;
