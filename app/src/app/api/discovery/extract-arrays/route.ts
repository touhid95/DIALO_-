import { NextRequest, NextResponse } from "next/server";
import { generateDirectJSON } from "@/server/services/openrouter";
import { LLMArrayExtractionSchema, LLMArrayExtraction } from "@/server/mcp/unified-schema";
import { domainResolver } from "@/server/services/domain-resolver";

// ─── Intelligent Geographic Expander (~20 granular sub-locations) ───────────
function expandLocationsToDetailedMetro(baseLocation: string): string[] {
  const lower = baseLocation.toLowerCase();

  if (lower.includes("austin")) {
    return [
      "Austin, TX (Downtown / Central)",
      "Round Rock, TX",
      "Cedar Park, TX",
      "Pflugerville, TX",
      "Georgetown, TX",
      "Buda, TX",
      "Kyle, TX",
      "Lakeway, TX",
      "Leander, TX",
      "West Lake Hills, TX",
      "Bee Cave, TX",
      "San Marcos, TX",
      "The Domain / North Austin, TX",
      "South Congress / SoCo, TX",
      "East Austin, TX",
      "Travis County, TX",
      "Williamson County, TX",
      "Hays County, TX",
      "Bastrop, TX",
      "Dripping Springs, TX",
    ];
  }

  if (lower.includes("dallas") || lower.includes("fort worth") || lower.includes("dfw")) {
    return [
      "Dallas, TX (Downtown / Uptown)",
      "Fort Worth, TX",
      "Arlington, TX",
      "Plano, TX",
      "Irving, TX",
      "Frisco, TX",
      "McKinney, TX",
      "Garland, TX",
      "Grand Prairie, TX",
      "Denton, TX",
      "Richardson, TX",
      "Carrollton, TX",
      "Lewisville, TX",
      "Allen, TX",
      "Flower Mound, TX",
      "Grapevine, TX",
      "Southlake, TX",
      "Dallas County, TX",
      "Tarrant County, TX",
      "Collin County, TX",
    ];
  }

  if (lower.includes("houston")) {
    return [
      "Houston, TX (Downtown / Galleria)",
      "The Woodlands, TX",
      "Sugar Land, TX",
      "Katy, TX",
      "Pearland, TX",
      "League City, TX",
      "Pasadena, TX",
      "Baytown, TX",
      "Conroe, TX",
      "Missouri City, TX",
      "Friendswood, TX",
      "Spring, TX",
      "Tomball, TX",
      "Cypress, TX",
      "Humble, TX",
      "Memorial / West Houston, TX",
      "Harris County, TX",
      "Fort Bend County, TX",
      "Montgomery County, TX",
      "Galveston, TX",
    ];
  }

  if (lower.includes("new york") || lower.includes("nyc") || lower.includes("manhattan")) {
    return [
      "Manhattan, NY (Midtown / Downtown)",
      "Brooklyn, NY (Williamsburg / DUMBO)",
      "Queens, NY (Astoria / Long Island City)",
      "The Bronx, NY",
      "Staten Island, NY",
      "Upper East Side, Manhattan, NY",
      "Upper West Side, Manhattan, NY",
      "Financial District, Manhattan, NY",
      "Greenwich Village / SoHo, NY",
      "Flushing, Queens, NY",
      "White Plains, NY",
      "Yonkers, NY",
      "Jersey City, NJ",
      "Hoboken, NJ",
      "New Rochelle, NY",
      "Garden City, Long Island, NY",
      "Great Neck, NY",
      "New York County, NY",
      "Kings County, NY",
      "Queens County, NY",
    ];
  }

  if (lower.includes("miami") || lower.includes("florida")) {
    return [
      "Miami, FL (Downtown / Brickell)",
      "Miami Beach, FL",
      "Coral Gables, FL",
      "Doral, FL",
      "Hialeah, FL",
      "Aventura, FL",
      "Fort Lauderdale, FL",
      "Hollywood, FL",
      "Boca Raton, FL",
      "Pompano Beach, FL",
      "Kendall, FL",
      "Coconut Grove, FL",
      "Wynwood / Design District, FL",
      "Sunny Isles Beach, FL",
      "Homestead, FL",
      "Pembroke Pines, FL",
      "Miami-Dade County, FL",
      "Broward County, FL",
      "Palm Beach County, FL",
      "Key Biscayne, FL",
    ];
  }

  // Generic expansion for any other city / region
  const cleanCity = baseLocation.replace(/,\s*[A-Z]{2}$/i, "").trim() || "Metro Area";
  const statePart = baseLocation.match(/,\s*([A-Z]{2})/i)?.[1] || "";
  const suffix = statePart ? `, ${statePart.toUpperCase()}` : "";

  return [
    `${cleanCity} (Downtown / Central)${suffix}`,
    `${cleanCity} (North Suburbs)${suffix}`,
    `${cleanCity} (South District)${suffix}`,
    `${cleanCity} (East Corridor)${suffix}`,
    `${cleanCity} (West Hills / Heights)${suffix}`,
    `${cleanCity} Metro Suburb 1${suffix}`,
    `${cleanCity} Metro Suburb 2${suffix}`,
    `${cleanCity} Commercial District${suffix}`,
    `${cleanCity} Medical Center District${suffix}`,
    `${cleanCity} Financial District${suffix}`,
    `${cleanCity} Outer Beltway East${suffix}`,
    `${cleanCity} Outer Beltway West${suffix}`,
    `${cleanCity} Tech / Innovation Park${suffix}`,
    `${cleanCity} Greater County North${suffix}`,
    `${cleanCity} Greater County South${suffix}`,
    `${cleanCity} Regional Center A${suffix}`,
    `${cleanCity} Regional Center B${suffix}`,
    `${cleanCity} Neighboring Township${suffix}`,
    `${cleanCity} Metropolitan Zone${suffix}`,
    `${cleanCity} Greater Metro Area${suffix}`,
  ];
}

// ─── Real Industry Authority Domains (No Hallucinations) ────────────────────
function getRealIndustryAuthorityDomains(industry: string, extractedDomains: string[]): string[] {
  // If the user/LLM already provided real domains from transcript, prioritize them
  const validUserDomains = extractedDomains.filter((d) =>
    d &&
    !d.includes("target-") &&
    !d.includes("temp-") &&
    !d.includes("example.com") &&
    d.includes(".") &&
    d.length > 4
  );

  if (validUserDomains.length > 0) {
    return Array.from(new Set(validUserDomains));
  }

  const lower = industry.toLowerCase();
  if (lower.includes("dent") || lower.includes("health") || lower.includes("clinic") || lower.includes("doctor")) {
    return [
      "healthgrades.com",
      "zocdoc.com",
      "ada.org",
      "yelp.com",
      "yellowpages.com",
      "carecredit.com",
    ];
  }

  if (lower.includes("roof") || lower.includes("home service") || lower.includes("contract")) {
    return [
      "angi.com",
      "homeadvisor.com",
      "bbb.org",
      "yelp.com",
      "yellowpages.com",
      "nrca.net",
    ];
  }

  if (lower.includes("saas") || lower.includes("tech") || lower.includes("software")) {
    return [
      "g2.com",
      "capterra.com",
      "clutch.co",
      "crunchbase.com",
      "producthunt.com",
    ];
  }

  if (lower.includes("legal") || lower.includes("law")) {
    return [
      "avvo.com",
      "martindale.com",
      "findlaw.com",
      "justia.com",
      "lawyers.com",
    ];
  }

  return [
    "yellowpages.com",
    "yelp.com",
    "bbb.org",
    "dnb.com",
    "chamberofcommerce.com",
  ];
}

// ─── Intelligent Multi-Word Keywords ────────────────────────────────────────
function getIntelligentServiceKeywords(industry: string, product: string, extractedKeywords: string[]): string[] {
  // Clean extracted keywords of junk, punctuation, or generic filler tokens
  const junkTokens = new Set(["target", "product:", "prompt", "grabber", "string", "item", "leads", "details"]);
  const validExtracted = extractedKeywords
    .map((k) => k.replace(/[:.,;!?"']/g, "").trim())
    .filter((k) => k.length > 3 && !junkTokens.has(k.toLowerCase()));

  if (validExtracted.length >= 8) {
    return Array.from(new Set(validExtracted)).slice(0, 15);
  }

  const lower = (industry + " " + product).toLowerCase();

  if (lower.includes("dent") || lower.includes("pediatric")) {
    return [
      "pediatric dentistry clinic",
      "children emergency tooth repair",
      "pediatric dental sedation specialist",
      "infant tongue tie treatment",
      "after-hours emergency dentist",
      "orthodontic teeth alignment consultation",
      "dental practice appointment scheduling",
      "invisalign certified dentist",
      "family dental care practice",
      "board certified pediatric dentist",
      "nitrous oxide dental sedation",
      "preventive pediatric teeth cleaning",
    ];
  }

  if (lower.includes("roof") || lower.includes("home service")) {
    return [
      "commercial flat roof repair",
      "tpo roofing contractor",
      "emergency roof storm damage restoration",
      "commercial roof replacement quote",
      "industrial roof coating specialist",
      "metal roofing installation services",
      "licensed commercial roofing inspector",
      "facility roof preventative maintenance",
    ];
  }

  if (lower.includes("saas") || lower.includes("tech") || lower.includes("voice")) {
    return [
      "autonomous inbound phone qualification",
      "ai voice answering agent for clinics",
      "automated patient appointment booking software",
      "24/7 medical after-hours answering service",
      "b2b lead qualification voice agent",
      "hipaa compliant voice ai assistant",
      "missed call conversion voice bot",
      "inbound phone routing automation",
    ];
  }

  return [
    `${industry} commercial services`,
    `${industry} consultation booking`,
    `${industry} licensed specialist`,
    `top rated ${industry} providers`,
    `emergency ${industry} appointment`,
    `commercial ${industry} client services`,
    `${industry} corporate office`,
    `${product} service implementation`,
  ];
}

/**
 * POST /api/discovery/extract-arrays
 * 
 * First AI Call: Strictly extracts three arrays from uploaded documents or user text:
 *  - organization_domain: Real target domains or verified industry directories (NO fake strings)
 *  - client_location: Detailed array of ~20 granular sub-locations
 *  - keywords: 10-15 intelligent multi-word commercial intent keywords
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const text = typeof body.text === "string" ? body.text : "";
    const history = Array.isArray(body.history) ? body.history : [];
    const transcript = history
      .map((h: { role: string; content: string }) => `${h.role.toUpperCase()}: ${h.content}`)
      .join("\n\n");

    const fullContext = [
      transcript ? `CONVERSATION TRANSCRIPT (FULL HISTORY):\n${transcript.slice(-4000)}` : "",
      text ? `LATEST TARGETING CONTEXT:\n${text.slice(0, 2000)}` : "",
    ].filter(Boolean).join("\n\n");

    if (!fullContext.trim()) {
      return NextResponse.json(
        { success: false, error: "Conversation history or context text is required for extraction." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a Senior B2B Lead Intelligence Specialist and Geographic Market Expansion Engine.
Your task is to analyze the conversation transcript and business context, and extract strictly THREE rich, intelligent arrays:

1. "organization_domain":
- Extract REAL company web domains, competitor domains, or customer sites mentioned in the text (e.g. "austinkidsdentistry.com").
- If NO specific company web domains were explicitly stated by the user, provide 4-6 real, verified industry authority directory and association domains where these leads are listed and discovered (e.g. for Dental/Healthcare: ["healthgrades.com", "zocdoc.com", "ada.org", "yelp.com", "yellowpages.com"]).
- CRITICAL: NEVER invent or hallucinate fake domains like "target-austintx.com".

2. "client_location":
- A detailed, comprehensive array of EXACTLY 18 to 22 granular sub-locations for the target market.
- Include the primary central city/metro, all major surrounding suburban municipalities, prominent commercial/business districts, neighborhoods, and regional counties.
- For example, if target is Austin, TX, return ~20 locations: ["Austin, TX (Downtown/Central)", "Round Rock, TX", "Cedar Park, TX", "Pflugerville, TX", "Georgetown, TX", "Buda, TX", "Kyle, TX", "Lakeway, TX", "Leander, TX", "West Lake Hills, TX", "Bee Cave, TX", "San Marcos, TX", "The Domain / North Austin, TX", "South Congress, TX", "East Austin, TX", "Travis County, TX", "Williamson County, TX", "Hays County, TX", "Bastrop, TX", "Dripping Springs, TX"].

3. "keywords":
- An array of 10 to 15 intelligent, multi-word commercial intent search queries, high-value service offerings, clinical/business procedures, and buyer qualification terms.
- For example for Dental: ["pediatric dentistry clinic", "children emergency tooth repair", "pediatric dental sedation specialist", "infant tongue tie treatment", "after-hours emergency dentist", "orthodontic teeth alignment consultation", "dental practice appointment scheduling", "invisalign certified dentist", "family dental care practice", "board certified pediatric dentist"].
- NEVER include single generic filler tokens like "Target", "Product:", "Prompt", or punctuation.

Output strictly valid JSON with these 3 keys:
{
  "organization_domain": ["string"],
  "client_location": ["string"],
  "keywords": ["string"]
}
JSON only. Absolutely no conversational text or markdown fences.`;

    const userPrompt = `Extract the 3 targeting arrays from this context:\n\n${fullContext}`;

    let extracted: LLMArrayExtraction = {
      organization_domain: [],
      client_location: [],
      keywords: [],
    };

    try {
      const parsed = await generateDirectJSON<LLMArrayExtraction>({
        systemPrompt,
        userPrompt,
        maxTokens: 1800,
      });

      if (parsed) {
        const validated = LLMArrayExtractionSchema.safeParse(parsed);
        if (validated.success) {
          extracted = validated.data;
        }
      }
    } catch (aiErr) {
      console.warn("[extract-arrays] Direct AI JSON generation error:", aiErr);
    }

    // Determine base location & industry from context for enhancement/expansion
    const lowerContext = fullContext.toLowerCase();
    let baseLoc = "Austin, TX";
    if (lowerContext.includes("dallas") || lowerContext.includes("fort worth")) baseLoc = "Dallas, TX";
    else if (lowerContext.includes("houston")) baseLoc = "Houston, TX";
    else if (lowerContext.includes("miami")) baseLoc = "Miami, FL";
    else if (lowerContext.includes("new york") || lowerContext.includes("nyc")) baseLoc = "New York, NY";
    else if (extracted.client_location.length > 0) baseLoc = extracted.client_location[0];

    let industry = "Dental & Healthcare Clinics";
    if (lowerContext.includes("roof") || lowerContext.includes("contract")) industry = "Commercial Roofing & Home Services";
    else if (lowerContext.includes("saas") || lowerContext.includes("software")) industry = "B2B SaaS / Tech";
    else if (lowerContext.includes("legal") || lowerContext.includes("law")) industry = "Legal & Law Firms";

    // 1. Ensure client_location has ~20 granular sub-locations
    if (extracted.client_location.length < 15) {
      extracted.client_location = expandLocationsToDetailedMetro(baseLoc);
    }

    // 2. Resolve organization_domain strictly via the API domain resolver (100% verified real domains, zero LLM hallucinations)
    extracted.organization_domain = await domainResolver.resolveDomains({
      industry,
      location: baseLoc,
      keywords: extracted.keywords,
      maxDomains: 15,
    });

    // 3. Ensure keywords are intelligent multi-word phrases
    extracted.keywords = getIntelligentServiceKeywords(industry, text, extracted.keywords);

    return NextResponse.json({
      success: true,
      data: extracted,
    });
  } catch (error) {
    console.error("POST /api/discovery/extract-arrays error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during array extraction." },
      { status: 500 }
    );
  }
}

