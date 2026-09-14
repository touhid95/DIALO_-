/**
 * Output Formatter
 *
 * Converts the reasoning engine's canonical Markdown reply into
 * a channel-appropriate formatted string.
 *
 * The reasoning engine always outputs standard Markdown.
 * This module is the only place that knows about channel formatting rules.
 *
 * Adding a new channel = adding one case here. Never touch the reasoning engine.
 */

import type { ChannelReply } from "./types";

const WA_MAX_CHARS = 4096;

// ──────────────────────────────────────────────────────────────────────────────
// Channel-specific converters
// ──────────────────────────────────────────────────────────────────────────────

/**
 * WhatsApp formatting rules:
 * - **bold** → *bold*
 * - _italic_ stays _italic_
 * - ~~strikethrough~~ → ~strikethrough~
 * - No HTML, no headers (# stripped), no tables
 * - Max 4096 characters per message
 */
function formatForWhatsApp(md: string): ChannelReply[] {
  let text = md
    // Strip headers
    .replace(/^#{1,6}\s+/gm, "")
    // Convert **bold** → *bold*
    .replace(/\*\*(.+?)\*\*/g, "*$1*")
    // Convert ~~strike~~ → ~strike~
    .replace(/~~(.+?)~~/g, "~$1~")
    // Remove table rows (lines containing |)
    .replace(/^\|.+\|$/gm, "")
    // Remove table separator lines
    .replace(/^\|[-:| ]+\|$/gm, "")
    // Remove HTML tags
    .replace(/<[^>]+>/g, "")
    // Collapse 3+ newlines to 2
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Paginate if over 4096 chars
  const pages: ChannelReply[] = [];
  let page = 1;

  while (text.length > 0) {
    const chunk = text.slice(0, WA_MAX_CHARS);
    const remainder = text.slice(WA_MAX_CHARS);
    pages.push({
      text: chunk,
      page,
      total_pages: Math.ceil((text.length + chunk.length) / WA_MAX_CHARS) || 1,
    });
    text = remainder;
    page++;
  }

  return pages.length > 0 ? pages : [{ text: "", page: 1, total_pages: 1 }];
}

/**
 * Telegram MarkdownV2 requires escaping reserved characters outside of
 * formatting tokens. Supports most Markdown including bold, italic, code.
 *
 * Reserved chars: _ * [ ] ( ) ~ ` > # + - = | { } . !
 */
function escapeTelegramV2(text: string): string {
  // Only escape chars that are NOT part of Markdown formatting sequences
  // Simple approach: escape dots, exclamation marks, dashes, etc. globally
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, "\\$1");
}

function formatForTelegram(md: string): ChannelReply {
  // Convert to MarkdownV2
  let text = md
    // Escape reserved chars first (before we add formatting)
    .replace(/([[\]()~`>#+\-=|{}.!])/g, "\\$1")
    // Telegram uses *bold*, _italic_, `code`, ```code block```
    // Standard **bold** already has * so after escaping fix them
    .replace(/\*\*(.+?)\*\*/g, "*$1*");

  // Telegram max is 4096 chars — truncate with ellipsis if needed
  if (text.length > 4096) {
    text = text.slice(0, 4090) + "\\.\\.\\.";
  }

  return { text };
}

/**
 * Web widget: pass canonical Markdown through unchanged.
 * The frontend renders full Markdown.
 */
function formatForWeb(md: string): ChannelReply {
  return { text: md };
}

// ──────────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Format a canonical Markdown reply for the given channel.
 * For multi-page channels (WhatsApp), returns the first page only
 * as the primary reply; additional pages should be sent separately.
 */
export function format(channelId: string, canonicalMarkdown: string): ChannelReply {
  switch (channelId) {
    case "whatsapp":
      return formatForWhatsApp(canonicalMarkdown)[0];
    case "telegram":
      return formatForTelegram(canonicalMarkdown);
    case "web":
    default:
      return formatForWeb(canonicalMarkdown);
  }
}

/**
 * For paginated channels (WhatsApp), returns all pages.
 */
export function formatAll(channelId: string, canonicalMarkdown: string): ChannelReply[] {
  if (channelId === "whatsapp") {
    return formatForWhatsApp(canonicalMarkdown);
  }
  return [format(channelId, canonicalMarkdown)];
}

/**
 * Strip <thinking>...</thinking> blocks from a response and return both parts.
 */
export function extractThinking(raw: string): { thinking: string; reply: string } {
  const thinkMatch = raw.match(/<thinking>([\s\S]*?)<\/thinking>/i);
  const thinking = thinkMatch ? thinkMatch[1].trim() : "";
  const reply = raw
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .trim();

  return { thinking, reply };
}
