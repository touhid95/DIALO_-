/**
 * Centralized External API & Endpoint Configuration Hub
 * 
 * GRAPHIFY NODE: ApiConfigurationHub
 * PURPOSE: Single Source of Truth for all external data providers, scrapers, and waterfall APIs.
 * 
 * HOW TO CHANGE API KEYS & ENDPOINTS:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Via Environment Variables in `app/.env.local`:
 *    - SERPER_API_KEY: Your Serper.dev API key for Google Places & Organic Search
 *    - SERPER_PLACES_URL: Override Google Places API URL (default: https://google.serper.dev/places)
 *    - SERPER_SEARCH_URL: Override Google Search API URL (default: https://google.serper.dev/search)
 *    - APOLLO_API_KEY: Your Apollo.io API key
 *    - APOLLO_BASE_URL: Override Apollo.io API base URL (default: https://api.apollo.io/api/v1)
 * 
 * 2. Or directly edit the fallback values in this file (`api-config.ts`).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface SerperConfig {
  apiKey: string;
  placesUrl: string;
  searchUrl: string;
}

export interface ApolloConfig {
  apiKey: string;
  baseUrl: string;
  contactsSearchUrl: string;
  peopleMatchUrl: string;
  mixedPeopleSearchUrl: string;
}

export const SERPER_CONFIG: SerperConfig = {
  apiKey: (
    process.env.SERPER_API_KEY ||
    "5c5aa21b0d574a48066209c779370c44b9284c6c"
  ).trim(),
  placesUrl: (
    process.env.SERPER_PLACES_URL ||
    "https://google.serper.dev/places"
  ).trim(),
  searchUrl: (
    process.env.SERPER_SEARCH_URL ||
    "https://google.serper.dev/search"
  ).trim(),
};

export const APOLLO_CONFIG: ApolloConfig = {
  apiKey: (
    process.env.APOLLO_API_KEY ||
    "GB19OqGFybJyvd0Feq-2VA"
  ).trim(),
  baseUrl: (
    process.env.APOLLO_BASE_URL ||
    "https://api.apollo.io/api/v1"
  ).trim().replace(/\/+$/, ""),
  get contactsSearchUrl() {
    return `${this.baseUrl}/contacts/search`;
  },
  get peopleMatchUrl() {
    return `${this.baseUrl}/people/match`;
  },
  get mixedPeopleSearchUrl() {
    return `${this.baseUrl}/mixed_people/search`;
  },
};

export interface CallEConfig {
  apiKey: string;
  mode: "synthetic" | "live";
  apiBaseUrl: string;
  defaultGoalId: string;
}

export const CALL_E_CONFIG: CallEConfig = {
  apiKey: (process.env.CALL_E_API_KEY || "").trim(),
  mode: ((process.env.CALL_MODE as "synthetic" | "live") || "synthetic"),
  apiBaseUrl: (process.env.CALL_E_BASE_URL || "https://api.heycall-e.com/v1").trim(),
  defaultGoalId: (process.env.CALL_E_DEFAULT_GOAL_ID || "goal_lead_qualification_v1").trim(),
};

/**
 * Helper to inspect active endpoints and whether keys are configured
 */
export function getApiEndpointsSummary() {
  return {
    serper: {
      hasKey: Boolean(SERPER_CONFIG.apiKey),
      maskedKey: SERPER_CONFIG.apiKey ? `${SERPER_CONFIG.apiKey.slice(0, 6)}...` : "NONE",
      placesUrl: SERPER_CONFIG.placesUrl,
      searchUrl: SERPER_CONFIG.searchUrl,
    },
    apollo: {
      hasKey: Boolean(APOLLO_CONFIG.apiKey),
      maskedKey: APOLLO_CONFIG.apiKey ? `${APOLLO_CONFIG.apiKey.slice(0, 6)}...` : "NONE",
      baseUrl: APOLLO_CONFIG.baseUrl,
      contactsSearchUrl: APOLLO_CONFIG.contactsSearchUrl,
    },
    calle: {
      hasKey: Boolean(CALL_E_CONFIG.apiKey),
      maskedKey: CALL_E_CONFIG.apiKey ? `${CALL_E_CONFIG.apiKey.slice(0, 6)}...` : "NONE",
      mode: CALL_E_CONFIG.mode,
      isLive: CALL_E_CONFIG.mode === "live" && Boolean(CALL_E_CONFIG.apiKey),
    },
  };
}
