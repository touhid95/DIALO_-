/**
 * Serper Places & Web Phone Waterfall Service
 * 
 * Enriches B2B leads and organizations with real, verified phone numbers via:
 * 1. Serper Google Places (Local business profile, direct phone, physical address)
 * 2. Serper Google Organic Search (Knowledge graph / contact page extraction)
 * 
 * Resolves phone numbers for target accounts when Apollo Free Tier returns 0 phone credits.
 */

import { SERPER_CONFIG } from "@/server/config/api-config";

export interface PhoneWaterfallResult {
  phone: string;
  source: "serper_places" | "serper_knowledge_graph" | "serper_search_snippet";
  address?: string;
  rating?: number;
  confidence: number;
}

export interface LeadTargetInput {
  name: string;
  domain?: string;
  location?: string;
}

/**
 * Normalizes extracted phone numbers to a consistent clean format
 */
export function formatPhoneNumber(raw: string): string {
  if (!raw) return "";
  return raw.trim().replace(/\s+/g, " ");
}

/**
 * Resolve single lead phone number via 2-tier waterfall
 */
export async function resolveLeadPhone(
  lead: LeadTargetInput,
  serperApiKey?: string
): Promise<PhoneWaterfallResult | null> {
  const apiKey = (serperApiKey || SERPER_CONFIG.apiKey).trim();

  if (!apiKey) {
    console.warn("[PhoneWaterfall] No SERPER_API_KEY configured.");
    return null;
  }

  const cleanName = lead.name.replace(/\b(Inc|LLC|Ltd|Corp)\b/gi, "").trim() || lead.name;
  const cleanLoc = lead.location?.replace(/United States/gi, "").trim() || "";

  // ─── TIER 1: Serper Google Places API ──────────────────────────────────────
  const placesQueries = [
    cleanLoc ? `${cleanName} ${cleanLoc}` : cleanName,
    cleanName,
    lead.domain ? lead.domain.replace(/\.(com|org|net|io|ai|com\.bd|org\.bd|edu)$/i, "") : "",
  ].filter(Boolean);

  for (const q of placesQueries.slice(0, 2)) {
    try {
      const res = await fetch(SERPER_CONFIG.placesUrl, {
        method: "POST",
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q,
          location: cleanLoc || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const place = data.places?.[0];
        if (place && place.phoneNumber) {
          return {
            phone: formatPhoneNumber(place.phoneNumber),
            source: "serper_places",
            address: place.address,
            rating: place.rating,
            confidence: 0.95,
          };
        }
      }
    } catch (placesErr) {
      console.warn(`[PhoneWaterfall] Places error for ${lead.name}:`, placesErr);
    }
  }

  // ─── TIER 2: Serper Organic Search Contact Snippet ───────────────────────────
  try {
    const domainPart = lead.domain ? ` OR "${lead.domain}"` : "";
    const searchQuery = `"${cleanName}"${domainPart} phone OR contact ${cleanLoc}`.trim();
    const res = await fetch(SERPER_CONFIG.searchUrl, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: searchQuery, num: 5 }),
    });

    if (res.ok) {
      const data = await res.json();

      // Check Knowledge Graph
      if (data.knowledgeGraph?.phone) {
        return {
          phone: formatPhoneNumber(data.knowledgeGraph.phone),
          source: "serper_knowledge_graph",
          confidence: 0.92,
        };
      }

      // Check Organic Snippets
      for (const org of data.organic || []) {
        const snippetText = `${org.title || ""} ${org.snippet || ""}`;
        // Matches international formats: +880 1730-333040, (512) 837-6000, 01963-207728, 02223384178, +1-512-555-0199
        const phoneMatch = snippetText.match(
          /(?:\+\d{1,3}[- ]?)?(?:\(?\d{2,4}\)?[- .]?)?\d{3,4}[- .]?\d{3,4}/
        );

        if (phoneMatch) {
          const candidate = phoneMatch[0].trim();
          const digitsOnly = candidate.replace(/\D/g, "");
          if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
            return {
              phone: formatPhoneNumber(candidate),
              source: "serper_search_snippet",
              confidence: 0.85,
            };
          }
        }
      }
    }
  } catch (searchErr) {
    console.warn(`[PhoneWaterfall] Search snippet error for ${lead.name}:`, searchErr);
  }

  return null;
}

/**
 * Concurrently resolves phone numbers for a list of leads in batches
 */
export async function resolvePhonesBatch(
  leads: LeadTargetInput[],
  concurrency = 5
): Promise<Map<string, PhoneWaterfallResult>> {
  const resultMap = new Map<string, PhoneWaterfallResult>();
  if (!leads || leads.length === 0) return resultMap;

  for (let i = 0; i < leads.length; i += concurrency) {
    const chunk = leads.slice(i, i + concurrency);
    const promises = chunk.map(async (lead) => {
      const res = await resolveLeadPhone(lead);
      if (res) {
        if (lead.domain) {
          resultMap.set(lead.domain.toLowerCase(), res);
          resultMap.set(lead.domain, res);
        }
        resultMap.set(lead.name.toLowerCase(), res);
        resultMap.set(lead.name, res);
      }
    });

    await Promise.all(promises);
  }

  return resultMap;
}

