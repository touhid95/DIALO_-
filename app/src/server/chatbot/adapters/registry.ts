/**
 * Channel Adapter Registry
 *
 * Maps channel IDs to their adapter instances.
 * To add a new channel:
 *   1. Create a new file implementing ChannelAdapter
 *   2. Import it here and add one entry to the map
 *   No other files need to change.
 */

import type { ChannelAdapter } from "../types";
import { WebAdapter } from "./web-adapter";
import { WhatsAppAdapter } from "./whatsapp-adapter";
import { TelegramAdapter } from "./telegram-adapter";

const registry = new Map<string, ChannelAdapter>([
  ["web", new WebAdapter()],
  ["whatsapp", new WhatsAppAdapter()],
  ["telegram", new TelegramAdapter()],
]);

/**
 * Look up a channel adapter by its channel ID.
 * Returns undefined if the channel is not registered.
 */
export function getAdapter(channelId: string): ChannelAdapter | undefined {
  return registry.get(channelId);
}

/**
 * List all registered channel IDs.
 */
export function listChannels(): string[] {
  return Array.from(registry.keys());
}
