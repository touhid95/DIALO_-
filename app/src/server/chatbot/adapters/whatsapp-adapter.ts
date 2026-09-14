/**
 * WhatsApp Channel Adapter — STUB
 *
 * Implements the full ChannelAdapter interface for the WhatsApp Business
 * Cloud API (Meta). Set the following environment variables to activate:
 *
 *   WHATSAPP_PHONE_NUMBER_ID=...
 *   WHATSAPP_ACCESS_TOKEN=...
 *   WHATSAPP_VERIFY_TOKEN=...  (for webhook verification)
 *
 * Webhook URL to register with Meta:
 *   POST https://your-host.com/api/chatbot/webhook/whatsapp
 *
 * References:
 *   https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
 *   https://developers.facebook.com/docs/whatsapp/cloud-api/messages
 */

import { v4 as uuidv4 } from "uuid";
import type { ChannelAdapter, ChannelReply, NormalizedMessage } from "../types";
import { getOrCreateSessionId } from "../session-logger";

// ──────────────────────────────────────────────────────────────────────────────
// WhatsApp webhook payload shape (simplified)
// ──────────────────────────────────────────────────────────────────────────────
interface WaEntry {
  changes: Array<{
    value: {
      messages?: Array<{
        id: string;
        from: string;
        type: string;
        timestamp: string;
        text?: { body: string };
        audio?: { id: string; mime_type: string };
        image?: { id: string; mime_type: string; caption?: string };
        document?: { id: string; mime_type: string; filename?: string };
        interactive?: { type: string; button_reply?: { id: string; title: string } };
      }>;
    };
  }>;
}

export class WhatsAppAdapter implements ChannelAdapter {
  readonly channelId = "whatsapp";

  private get phoneNumberId(): string {
    return process.env.WHATSAPP_PHONE_NUMBER_ID || "";
  }

  private get accessToken(): string {
    return process.env.WHATSAPP_ACCESS_TOKEN || "";
  }

  async receive(rawPayload: unknown): Promise<NormalizedMessage[]> {
    const payload = rawPayload as { entry?: WaEntry[] };
    const messages: NormalizedMessage[] = [];

    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        for (const msg of change.value?.messages || []) {
          const userId = `wa:${msg.from}`;
          const sessionId = await getOrCreateSessionId(userId, this.channelId);

          let type: NormalizedMessage["type"] = "text";
          let text: string | null = null;
          let media: NormalizedMessage["media"] | undefined;

          switch (msg.type) {
            case "text":
              type = "text";
              text = msg.text?.body || null;
              break;

            case "audio": {
              type = "audio";
              // TODO: resolve audio media URL before passing downstream
              const audioResolved = await this.resolveMedia(msg.audio!.id);
              media = { url: audioResolved.url, mime_type: audioResolved.mimeType };
              break;
            }

            case "image": {
              type = "image";
              text = msg.image?.caption || null;
              const imgResolved = await this.resolveMedia(msg.image!.id);
              media = { url: imgResolved.url, mime_type: imgResolved.mimeType };
              break;
            }

            case "document": {
              type = "document";
              const docResolved = await this.resolveMedia(msg.document!.id);
              media = { url: docResolved.url, mime_type: docResolved.mimeType };
              break;
            }

            case "interactive":
              type = "text";
              text = msg.interactive?.button_reply?.title || null;
              break;

            default:
              continue; // Skip unsupported types
          }

          messages.push({
            message_id: uuidv4(),
            user_id: userId,
            channel: this.channelId,
            session_id: sessionId,
            type,
            text,
            media,
            timestamp: new Date(parseInt(msg.timestamp) * 1000).toISOString(),
            raw_channel_metadata: { wa_message_id: msg.id, from: msg.from },
          });
        }
      }
    }

    return messages;
  }

  /**
   * Send a formatted reply back to the WhatsApp user.
   * WhatsApp restrictions applied by the Output Formatter before this is called:
   *   - *bold* (not **bold**)
   *   - No headers, no tables
   *   - Max 4096 chars (paginated by Output Formatter)
   */
  async send(userId: string, formattedReply: ChannelReply): Promise<void> {
    if (!this.accessToken || !this.phoneNumberId) {
      console.warn("[WhatsAppAdapter] Missing credentials — reply not sent:", formattedReply.text.slice(0, 80));
      return;
    }

    // Strip the "wa:" prefix to get the raw phone number
    const to = userId.replace(/^wa:/, "");

    const url = `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`;
    const body = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: formattedReply.text },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[WhatsAppAdapter] send() failed: ${res.status} ${err}`);
    }
  }

  /**
   * Resolves a WhatsApp media ID to a temporary download URL.
   * WhatsApp media IDs expire — always fetch fresh.
   *
   * Step 1: GET /v20.0/{media-id} → { url }
   * Step 2: GET {url} with Bearer token → binary blob
   * (The Media Processor will download it after receiving the URL.)
   */
  async resolveMedia(mediaId: string): Promise<{ url: string; mimeType: string }> {
    if (!this.accessToken) {
      console.warn("[WhatsAppAdapter] No access token for resolveMedia");
      return { url: "", mimeType: "application/octet-stream" };
    }

    // Step 1 — get the temporary download URL from the media ID
    const metaRes = await fetch(`https://graph.facebook.com/v20.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (!metaRes.ok) {
      console.error(`[WhatsAppAdapter] resolveMedia meta fetch failed: ${metaRes.status}`);
      return { url: "", mimeType: "application/octet-stream" };
    }

    const meta = await metaRes.json() as { url?: string; mime_type?: string };
    return {
      url: meta.url || "",
      mimeType: meta.mime_type || "application/octet-stream",
    };
  }
}
