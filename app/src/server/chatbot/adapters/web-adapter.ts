/**
 * Web Channel Adapter
 *
 * Translates the existing web chat panel's FormData / JSON request payload
 * into a NormalizedMessage. This is the concrete adapter used by /api/chat.
 *
 * No external API calls — media is already resolved (base64 data URLs or
 * extracted text) by the time it arrives at this adapter.
 */

import { v4 as uuidv4 } from "uuid";
import type { ChannelAdapter, ChannelReply, NormalizedMessage } from "../types";
import { getOrCreateSessionId } from "../session-logger";

export interface WebRawPayload {
  message: string;
  userId?: string;
  sessionId?: string;
  /** Pre-extracted attachments from the API route */
  resolvedAttachments?: Array<{
    type: "image" | "pdf" | "document" | "audio";
    name: string;
    /** For images: base64 data URL */
    dataUrl?: string;
    /** For docs/PDFs: extracted text */
    text?: string;
  }>;
}

export class WebAdapter implements ChannelAdapter {
  readonly channelId = "web";

  async receive(rawPayload: unknown): Promise<NormalizedMessage[]> {
    const payload = rawPayload as WebRawPayload;
    const userId = payload.userId || "web:anonymous";
    const namespacedUserId = userId.startsWith("web:") ? userId : `web:${userId}`;
    const sessionId = payload.sessionId || (await getOrCreateSessionId(namespacedUserId, this.channelId));

    const messages: NormalizedMessage[] = [];

    // If there are media attachments, emit them first as separate messages
    if (payload.resolvedAttachments && payload.resolvedAttachments.length > 0) {
      for (const att of payload.resolvedAttachments) {
        const msgType =
          att.type === "image" ? "image" :
          att.type === "audio" ? "audio" : "document";

        messages.push({
          message_id: uuidv4(),
          user_id: namespacedUserId,
          channel: this.channelId,
          session_id: sessionId,
          type: msgType,
          text: att.text || null,
          media: att.dataUrl
            ? { url: att.dataUrl, mime_type: att.type === "image" ? "image/jpeg" : "application/octet-stream" }
            : undefined,
          timestamp: new Date().toISOString(),
          raw_channel_metadata: { name: att.name },
        });
      }
    }

    // Emit the text message (may be empty if message is blank)
    if (payload.message?.trim()) {
      messages.push({
        message_id: uuidv4(),
        user_id: namespacedUserId,
        channel: this.channelId,
        session_id: sessionId,
        type: "text",
        text: payload.message.trim(),
        timestamp: new Date().toISOString(),
        raw_channel_metadata: {},
      });
    }

    // Guarantee at least one message with the text (even if empty) so callers
    // can always get the session_id back.
    if (messages.length === 0) {
      messages.push({
        message_id: uuidv4(),
        user_id: namespacedUserId,
        channel: this.channelId,
        session_id: sessionId,
        type: "text",
        text: null,
        timestamp: new Date().toISOString(),
        raw_channel_metadata: {},
      });
    }

    return messages;
  }

  /**
   * For the web adapter, "sending" means returning data through the HTTP
   * response — nothing to do here. The API route handles the response.
   */
  async send(_userId: string, _formattedReply: ChannelReply): Promise<void> {
    // No-op: web replies are returned synchronously via the HTTP response
  }

  /**
   * Web media is already resolved (base64 or extracted text) before
   * reaching the adapter — this method is a no-op for the web channel.
   */
  async resolveMedia(_mediaRef: string): Promise<{ url: string; mimeType: string }> {
    return { url: _mediaRef, mimeType: "application/octet-stream" };
  }
}
