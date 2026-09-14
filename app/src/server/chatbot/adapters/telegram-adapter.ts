/**
 * Telegram Channel Adapter — STUB
 *
 * Implements the ChannelAdapter interface for the Telegram Bot API.
 * Set the following environment variable to activate:
 *
 *   TELEGRAM_BOT_TOKEN=...
 *
 * Webhook URL to register with Telegram:
 *   POST https://api.telegram.org/bot{TOKEN}/setWebhook
 *   Body: { url: "https://your-host.com/api/chatbot/webhook/telegram" }
 *
 * References:
 *   https://core.telegram.org/bots/api#getting-updates
 *   https://core.telegram.org/bots/api#sendmessage
 */

import { v4 as uuidv4 } from "uuid";
import type { ChannelAdapter, ChannelReply, NormalizedMessage } from "../types";
import { getOrCreateSessionId } from "../session-logger";

// ──────────────────────────────────────────────────────────────────────────────
// Telegram Update shape (simplified)
// ──────────────────────────────────────────────────────────────────────────────
interface TgUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; username?: string };
    chat: { id: number };
    date: number;
    text?: string;
    voice?: { file_id: string; mime_type?: string; duration?: number };
    photo?: Array<{ file_id: string; file_size?: number }>;
    document?: { file_id: string; mime_type?: string; file_name?: string };
    caption?: string;
  };
}

export class TelegramAdapter implements ChannelAdapter {
  readonly channelId = "telegram";

  private get botToken(): string {
    return process.env.TELEGRAM_BOT_TOKEN || "";
  }

  private apiUrl(method: string): string {
    return `https://api.telegram.org/bot${this.botToken}/${method}`;
  }

  async receive(rawPayload: unknown): Promise<NormalizedMessage[]> {
    const update = rawPayload as TgUpdate;
    const msg = update.message;
    if (!msg) return [];

    const userId = `tg:${msg.from.id}`;
    const sessionId = await getOrCreateSessionId(userId, this.channelId);

    let type: NormalizedMessage["type"] = "text";
    let text: string | null = msg.text || msg.caption || null;
    let media: NormalizedMessage["media"] | undefined;

    if (msg.voice) {
      type = "audio";
      // Telegram provides a file_id — resolve to a URL below
      const resolved = await this.resolveMedia(msg.voice.file_id);
      media = { url: resolved.url, mime_type: resolved.mimeType };
    } else if (msg.photo && msg.photo.length > 0) {
      type = "image";
      // Use the largest photo size (last in array)
      const largest = msg.photo[msg.photo.length - 1];
      const resolved = await this.resolveMedia(largest.file_id);
      media = { url: resolved.url, mime_type: resolved.mimeType };
    } else if (msg.document) {
      type = "document";
      const resolved = await this.resolveMedia(msg.document.file_id);
      media = { url: resolved.url, mime_type: msg.document.mime_type || "application/octet-stream" };
    }

    return [
      {
        message_id: uuidv4(),
        user_id: userId,
        channel: this.channelId,
        session_id: sessionId,
        type,
        text,
        media,
        timestamp: new Date(msg.date * 1000).toISOString(),
        raw_channel_metadata: {
          tg_message_id: msg.message_id,
          tg_chat_id: msg.chat.id,
          tg_from_id: msg.from.id,
          tg_username: msg.from.username,
        },
      },
    ];
  }

  /**
   * Send a reply back to the Telegram chat.
   * Supports MarkdownV2 (escaped by the Output Formatter).
   */
  async send(userId: string, formattedReply: ChannelReply): Promise<void> {
    if (!this.botToken) {
      console.warn("[TelegramAdapter] Missing bot token — reply not sent.");
      return;
    }

    // Extract chat_id from userId (tg:{chat_id})
    const chatId = userId.replace(/^tg:/, "");

    const res = await fetch(this.apiUrl("sendMessage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedReply.text,
        parse_mode: "MarkdownV2",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[TelegramAdapter] sendMessage failed: ${res.status} ${err}`);
    }
  }

  /**
   * Telegram resolves a file_id to a direct HTTPS URL in two steps:
   * Step 1: getFile → { file_path }
   * Step 2: https://api.telegram.org/file/bot{TOKEN}/{file_path}
   *
   * Unlike WhatsApp, no extra auth header is needed for the download URL.
   */
  async resolveMedia(fileId: string): Promise<{ url: string; mimeType: string }> {
    if (!this.botToken) {
      console.warn("[TelegramAdapter] No bot token for resolveMedia");
      return { url: "", mimeType: "application/octet-stream" };
    }

    const res = await fetch(this.apiUrl("getFile"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_id: fileId }),
    });

    if (!res.ok) {
      console.error(`[TelegramAdapter] getFile failed: ${res.status}`);
      return { url: "", mimeType: "application/octet-stream" };
    }

    const data = await res.json() as { ok: boolean; result?: { file_path: string } };
    if (!data.ok || !data.result?.file_path) {
      return { url: "", mimeType: "application/octet-stream" };
    }

    const url = `https://api.telegram.org/file/bot${this.botToken}/${data.result.file_path}`;
    // Infer mime type from file extension
    const ext = data.result.file_path.split(".").pop()?.toLowerCase() || "";
    const mimeType =
      ext === "ogg" ? "audio/ogg" :
      ext === "mp3" ? "audio/mpeg" :
      ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
      ext === "png" ? "image/png" :
      ext === "pdf" ? "application/pdf" :
      "application/octet-stream";

    return { url, mimeType };
  }
}
