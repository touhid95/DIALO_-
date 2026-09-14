/**
 * Apollo.io Integration Service
 * 
 * Provides integration with Apollo.io API v1.
 * Configured specifically for Free Tier accounts:
 * - Uses POST /api/v1/contacts/search (0 credits)
 * - Uses GET /api/v1/auth/health
 * - Strictly avoids /api/v1/people/show and /api/v1/people/match (blocked on Free Tier)
 */

import type { RawLead } from "@/lib/types";

const APOLLO_BASE_URL = "https://api.apollo.io/api/v1";

export interface ApolloContactSearchResult {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  title?: string;
  organization_name?: string;
  has_direct_phone?: string;
  phone_numbers?: Array<{
    raw_number?: string;
    sanitized_number?: string;
    type?: string;
    status?: string;
  }>;
  account?: {
    name?: string;
    primary_domain?: string;
  };
  organization?: {
    name?: string;
    primary_domain?: string;
  };
  city?: string;
  state?: string;
  country?: string;
}

export interface ApolloSearchResponse {
  contacts: ApolloContactSearchResult[];
  pagination?: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

export class ApolloService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = (apiKey || process.env.APOLLO_API_KEY || "GB19OqGFybJyvd0Feq-2VA").trim();
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "x-api-key": this.apiKey,
    };
  }

  /**
   * Check connection health with Apollo API
   */
  async checkHealth(): Promise<{
    healthy: boolean;
    endpoint: string;
    totalContacts?: number;
    error?: string;
  }> {
    if (!this.apiKey) {
      return { healthy: false, endpoint: "none", error: "Missing APOLLO_API_KEY" };
    }

    try {
      // 1. Check contacts/search (0 credits)
      const res = await fetch(`${APOLLO_BASE_URL}/contacts/search`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ api_key: this.apiKey, per_page: 1 }),
      });

      if (res.ok) {
        const data = (await res.json()) as ApolloSearchResponse;
        return {
          healthy: true,
          endpoint: "/api/v1/contacts/search",
          totalContacts: data.pagination?.total_entries ?? data.contacts?.length ?? 0,
        };
      }

      // 2. Fallback to auth/health
      const healthRes = await fetch(`${APOLLO_BASE_URL}/auth/health?api_key=${this.apiKey}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (healthRes.ok) {
        return { healthy: true, endpoint: "/api/v1/auth/health" };
      }

      return {
        healthy: false,
        endpoint: "/api/v1/contacts/search",
        error: `Apollo API returned status ${res.status}: ${await res.text()}`,
      };
    } catch (err) {
      return {
        healthy: false,
        endpoint: "network",
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Search contacts database using Free Tier contacts/search endpoint (0 credits).
   * Strictly avoids /people/show or /people/match.
   */
  async searchContacts(options: {
    keywords?: string;
    page?: number;
    perPage?: number;
    clientLocations?: string[];
  }): Promise<{ leads: RawLead[]; totalEntries: number }> {
    const { keywords = "Dentist, Dental", page = 1, perPage = 25, clientLocations = [] } = options;

    const bodyPayload: Record<string, unknown> = {
      api_key: this.apiKey,
      page,
      per_page: perPage,
    };

    if (keywords) {
      bodyPayload.q_keywords = keywords;
    }

    const res = await fetch(`${APOLLO_BASE_URL}/contacts/search`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(bodyPayload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Apollo contacts/search failed (HTTP ${res.status}): ${errorText}`);
    }

    const data = (await res.json()) as ApolloSearchResponse;
    const contacts = data.contacts || [];

    // Client-side location filtering if requested
    const filteredContacts = clientLocations.length > 0
      ? contacts.filter((c) => {
          const locText = `${c.city || ""} ${c.state || ""} ${c.country || ""}`.toLowerCase();
          return clientLocations.some((loc) => locText.includes(loc.toLowerCase()));
        })
      : contacts;

    // Normalize to RawLead[]
    const leads: RawLead[] = filteredContacts.map((contact) => {
      const orgName =
        contact.organization_name ||
        contact.organization?.name ||
        contact.account?.name ||
        "Unknown Practice";

      const website =
        contact.organization?.primary_domain ||
        contact.account?.primary_domain ||
        undefined;

      const phone =
        contact.phone_numbers?.[0]?.sanitized_number ||
        contact.phone_numbers?.[0]?.raw_number ||
        undefined;

      const locParts = [contact.city, contact.state, contact.country].filter(Boolean);
      const location = locParts.length > 0 ? locParts.join(", ") : undefined;

      const decisionMaker =
        contact.first_name || contact.last_name
          ? `${contact.first_name || ""} ${contact.last_name || ""}`.trim() +
            (contact.title ? ` (${contact.title})` : "")
          : contact.title || undefined;

      return {
        name: orgName,
        phone,
        website: website ? (website.startsWith("http") ? website : `https://${website}`) : undefined,
        location,
        category: "Dental Practice",
        source: "apollo_free_tier",
        sourceId: contact.id,
        decisionMaker,
        metadata: {
          hasDirectPhone: contact.has_direct_phone,
          title: contact.title,
          apolloContactId: contact.id,
        },
      };
    });

    return {
      leads,
      totalEntries: data.pagination?.total_entries ?? leads.length,
    };
  }
}

export const apolloService = new ApolloService();
