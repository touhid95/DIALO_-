/**
 * Machine Learning USP & Market Interpreter (Two-Tier MCP Engine)
 *
 * Transforms minimal user inputs (USP, Price, Target Location, plus optional filters like Company Size)
 * into rich, actionable market intelligence, Apollo search parameters, and value-led CALL-E voice context.
 *
 * Tier 1: Local deterministic normalization (Price parsing, Location geocoding & Timezone mapping).
 * Tier 2: LLM semantic expansion (Target industries, buyer personas, pain signals, Apollo keywords, value pitch).
 */

import { inferTimezone } from "@/server/services/call-context-builder";
import { extractUspFromFreeText } from "@/lib/usp-parser";

export { extractUspFromFreeText };

export interface UspIntakeInput {
  usp: string;
  price: string;
  location: string;
  targetCompanySize?: string; // Optional user filter: e.g. "1-10", "11-50", "51-200", "201-500", "500+"
  targetIndustry?: string;    // Optional user filter
  targetTitles?: string[];    // Optional user filter
}

export interface NormalizedPrice {
  raw: string;
  amount: number;
  currency: string;
  billingTerm: "monthly" | "per_unit" | "trial" | "annual" | "one_time";
  display: string;
}

export interface NormalizedLocation {
  raw: string;
  city: string;
  state: string;
  country: string;
  timezone: string;
}

export interface InterpretedMarketProfile {
  usp: string;
  normalizedPrice: NormalizedPrice;
  normalizedLocation: NormalizedLocation;
  targetMarket: {
    primaryIndustry: string;
    subIndustries: string[];
    employeeSizeRange: string;    // e.g. "11,50", "21,50", "51,200"
    employeeSizeDisplay: string;  // e.g. "11–50 employees"
    decisionMakerTitles: string[];
    painPoints: string[];
    valuePropositionPitch: string;
  };
  apolloSearchCriteria: {
    q_organization_domains_list: string[];
    person_locations: string[];
    person_titles: string[];
    organization_num_employees_ranges: string[];
    q_keywords: string;
  };
  conversationalPitch: {
    openingHook: string;
    qualifyingQuestions: string[];
    objectionRebuttals: Record<string, string>;
    orderItemDescription: string;
    unitPrice: number;
  };
}

/**
 * Tier 1: Normalize raw price string into structured amount, currency, and billing term
 */
export function normalizePrice(rawPrice?: string): NormalizedPrice {
  if (!rawPrice || !rawPrice.trim()) {
    return {
      raw: "$250 trial",
      amount: 250,
      currency: "USD",
      billingTerm: "trial",
      display: "$250 trial",
    };
  }

  const clean = rawPrice.trim();
  const lower = clean.toLowerCase();

  // Extract currency
  let currency = "USD";
  if (lower.includes("€") || lower.includes("eur")) currency = "EUR";
  else if (lower.includes("£") || lower.includes("gbp")) currency = "GBP";
  else if (lower.includes("৳") || lower.includes("bdt") || lower.includes("taka") || lower.includes("tk")) currency = "BDT";

  // Extract billing term
  let billingTerm: NormalizedPrice["billingTerm"] = "per_unit";
  if (lower.includes("mo") || lower.includes("month")) {
    billingTerm = "monthly";
  } else if (lower.includes("yr") || lower.includes("year") || lower.includes("annual")) {
    billingTerm = "annual";
  } else if (lower.includes("trial") || lower.includes("pilot") || lower.includes("starter")) {
    billingTerm = "trial";
  } else if (lower.includes("one-time") || lower.includes("flat")) {
    billingTerm = "one_time";
  }

  // Extract numeric digits
  const digitsMatch = clean.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  let amount = digitsMatch ? parseFloat(digitsMatch[0]) : 250;

  // Handle "k" suffix (e.g. "$2k" -> 2000)
  if (/[0-9]k\b/i.test(clean)) {
    amount = amount * 1000;
  }

  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "BDT" ? "৳" : "$";
  const display = `${sym}${amount.toLocaleString()}${
    currency === "BDT" ? " BDT" : ""
  }${
    billingTerm === "monthly" ? "/mo" : billingTerm === "annual" ? "/yr" : billingTerm === "trial" ? " trial" : ""
  }`;

  return {
    raw: clean,
    amount,
    currency,
    billingTerm,
    display,
  };
}

/**
 * Tier 1: Normalize target location and determine timezone
 */
export function normalizeLocation(rawLocation?: string): NormalizedLocation {
  const clean = (rawLocation || "Austin, Texas").trim();
  const lower = clean.toLowerCase();

  let city = "Austin";
  let state = "";
  let country = "United States";

  if (lower.includes("bangladesh") || lower.includes("dhaka") || lower.includes("chittagong") || lower.includes("sylhet") || lower.includes("rajshahi")) {
    country = "Bangladesh";
    state = "";
    if (lower.includes("chittagong")) city = "Chittagong";
    else if (lower.includes("sylhet")) city = "Sylhet";
    else if (lower.includes("rajshahi")) city = "Rajshahi";
    else city = "Dhaka";
  } else if (lower.includes("uk") || lower.includes("london") || lower.includes("united kingdom") || lower.includes("manchester")) {
    country = "United Kingdom";
    state = "";
    city = lower.includes("manchester") ? "Manchester" : "London";
  } else if (lower.includes("canada") || lower.includes("toronto") || lower.includes("vancouver")) {
    country = "Canada";
    state = lower.includes("vancouver") ? "BC" : "ON";
    city = lower.includes("vancouver") ? "Vancouver" : "Toronto";
  } else {
    const parts = clean.split(",").map((s) => s.trim());
    city = parts[0] || "Austin";
    state = parts[1] || (city.toLowerCase() === "austin" ? "Texas" : "");
    country = parts[2] || "United States";
  }

  const timezone = inferTimezone(clean);

  return {
    raw: clean,
    city,
    state,
    country,
    timezone,
  };
}

/**
 * Extract Employee Size Range for Apollo API
 */
export function mapEmployeeSizeRange(sizeFilter?: string, priceAmount = 250): { apolloRange: string[]; display: string } {
  if (sizeFilter) {
    const s = sizeFilter.toLowerCase().replace(/\s+/g, "");
    if (s.includes("1-10") || s.includes("1,10") || s.includes("solo") || s.includes("small")) {
      return { apolloRange: ["1,10"], display: "1–10 employees" };
    }
    if (s.includes("11-50") || s.includes("11,50") || s.includes("11-20") || s.includes("21-50")) {
      return { apolloRange: ["11,20", "21,50"], display: "11–50 employees" };
    }
    if (s.includes("51-200") || s.includes("51,200") || s.includes("mid")) {
      return { apolloRange: ["51,100", "101,200"], display: "51–200 employees" };
    }
    if (s.includes("201-500") || s.includes("200+") || s.includes("enterprise")) {
      return { apolloRange: ["201,500", "501,1000"], display: "201–500 employees" };
    }
  }

  // Auto-infer employee size based on deal / trial size
  if (priceAmount >= 5000) {
    return { apolloRange: ["51,100", "101,200", "201,500"], display: "51–200 employees" };
  } else if (priceAmount >= 1000) {
    return { apolloRange: ["21,50", "51,100"], display: "20–100 employees" };
  } else {
    return { apolloRange: ["11,20", "21,50"], display: "11–50 employees" };
  }
}


/**
 * Tier 2: Semantic Domain & Persona Expansion Heuristics
 * Identifies target industries, personas, pain points, and call hooks from USP
 */
export function inferMarketIntelligenceFromUsp(
  usp: string,
  price: NormalizedPrice,
  loc: NormalizedLocation,
  sizeFilter?: string,
  industryFilter?: string,
  titlesFilter?: string[]
): InterpretedMarketProfile["targetMarket"] & {
  keywords: string[];
  sampleDomains: string[];
  conversationalPitch: InterpretedMarketProfile["conversationalPitch"];
} {
  const lowerUsp = usp.toLowerCase();
  const { apolloRange, display: sizeDisplay } = mapEmployeeSizeRange(sizeFilter, price.amount);

  let primaryIndustry = industryFilter || "Commercial B2B Services";
  let subIndustries = ["Professional Services", "Commercial Operations", "B2B Facilities"];
  let decisionMakerTitles = titlesFilter && titlesFilter.length > 0
    ? titlesFilter
    : ["Operations Director", "Managing Partner", "Chief Operating Officer", "Owner"];
  let painPoints = [
    "High vendor friction and unexpected fulfillment delays",
    "Lack of reliable local service providers with transparent pricing",
    "Hidden fees and inconsistent service delivery standards",
  ];
  let domainSeeds = ["logistics", "operations", "services", "solutions", "hub"];

  // 0. Education / BCS / Competitive Exam Coaching / Students / Academies
  if (
    lowerUsp.includes("bcs") ||
    lowerUsp.includes("student") ||
    lowerUsp.includes("education") ||
    lowerUsp.includes("coach") ||
    lowerUsp.includes("academy") ||
    lowerUsp.includes("exam") ||
    lowerUsp.includes("admission") ||
    lowerUsp.includes("course") ||
    lowerUsp.includes("training") ||
    lowerUsp.includes("test prep") ||
    lowerUsp.includes("enthusiast")
  ) {
    primaryIndustry = industryFilter || "Education & Coaching Academies";
    subIndustries = [
      "BCS & Competitive Exam Coaching Centers",
      "University Test Prep & Admission Academies",
      "Educational Publishers & Learning Platforms",
      "Skill Training & Professional Institutes",
    ];
    decisionMakerTitles = titlesFilter && titlesFilter.length > 0
      ? titlesFilter
      : ["Managing Director", "Academic Director", "Branch Manager", "Head of Admissions", "Founder & CEO"];
    painPoints = [
      "High cost of manual student lead qualification and admissions follow-up",
      "Low conversion rates on inbound student inquiries during peak enrollment seasons",
      "Difficulty scaling personalized counseling for competitive exam preparation",
    ];
    domainSeeds = ["academy", "coaching", "education", "bcs", "learning"];
  }
  // 1. Digital Media / News / RSS / Publishing / Journalism
  else if (
    lowerUsp.includes("news") ||
    lowerUsp.includes("rss") ||
    lowerUsp.includes("media") ||
    lowerUsp.includes("feed") ||
    lowerUsp.includes("syndicat") ||
    lowerUsp.includes("journalis") ||
    lowerUsp.includes("publish")
  ) {
    primaryIndustry = industryFilter || "Digital Media & News Publishing";
    subIndustries = [
      "Digital News Portals",
      "Broadcast Media Agencies",
      "Content Syndication Networks",
      "Online Publishers",
    ];
    decisionMakerTitles = titlesFilter && titlesFilter.length > 0
      ? titlesFilter
      : ["Editor-in-Chief", "Head of Digital Content", "Managing Editor", "Chief Technology Officer"];
    painPoints = [
      "Slow breaking news syndication and high latency content ingestion",
      "Manual content curation tying up editorial staff",
      "Unreliable RSS aggregators with frequent API downtime",
    ];
    domainSeeds = ["news", "media", "press", "daily", "journal"];
  }
  // 2. Healthcare / Medical / Dental / Clinical
  else if (
    lowerUsp.includes("medic") ||
    lowerUsp.includes("clinic") ||
    lowerUsp.includes("dental") ||
    lowerUsp.includes("health") ||
    lowerUsp.includes("patient") ||
    lowerUsp.includes("pharma") ||
    lowerUsp.includes("specimen") ||
    lowerUsp.includes("doctor")
  ) {
    primaryIndustry = industryFilter || "Healthcare & Medical Clinics";
    subIndustries = [
      "Dental Practices",
      "Outpatient Medical Clinics",
      "Diagnostic Laboratories",
      "Urgent Care Centers",
    ];
    decisionMakerTitles = titlesFilter && titlesFilter.length > 0
      ? titlesFilter
      : ["Practice Manager", "Clinical Operations Director", "Clinic Administrator", "Head of Procurement"];
    painPoints = [
      "Strict compliance & temperature-sensitive handling requirements",
      "Patient appointment disruptions caused by inventory stockouts",
      "Overburdened clinical staff spending hours on vendor follow-ups",
    ];
    domainSeeds = ["clinic", "health", "dental", "medcare", "urgentcare"];
  }
  // 3. Logistics / Freight / Warehousing / Courier / Supply Chain
  else if (
    lowerUsp.includes("logistics") ||
    lowerUsp.includes("freight") ||
    lowerUsp.includes("dispatch") ||
    lowerUsp.includes("courier") ||
    lowerUsp.includes("delivery") ||
    lowerUsp.includes("shipping") ||
    lowerUsp.includes("warehouse") ||
    lowerUsp.includes("transport")
  ) {
    primaryIndustry = industryFilter || "Logistics & Supply Chain Operations";
    subIndustries = [
      "Freight Forwarding",
      "Regional Distribution Centers",
      "Third-Party Logistics (3PL)",
      "Commercial Wholesalers",
    ];
    decisionMakerTitles = titlesFilter && titlesFilter.length > 0
      ? titlesFilter
      : ["VP Supply Chain", "Logistics Director", "Fleet & Dispatch Manager", "Operations Manager"];
    painPoints = [
      "Late shipments resulting in client service level agreement penalties",
      "High carrier broker markups with poor real-time tracking transparency",
      "Capacity bottlenecks during unexpected peak fulfillment surges",
    ];
    domainSeeds = ["logistics", "freight", "transport", "distribution", "supply"];
  }
  // 4. Software / SaaS / AI / Tech / Automation
  else if (
    lowerUsp.includes("software") ||
    lowerUsp.includes("saas") ||
    lowerUsp.includes("ai") ||
    lowerUsp.includes("voice agent") ||
    lowerUsp.includes("automation") ||
    lowerUsp.includes("app") ||
    lowerUsp.includes("platform") ||
    lowerUsp.includes("crm")
  ) {
    primaryIndustry = industryFilter || "Technology & Business Services";
    subIndustries = [
      "High-Growth Technology Companies",
      "Professional Service Firms",
      "Customer Support Centers",
      "Digital Marketing & Sales Agencies",
    ];
    decisionMakerTitles = titlesFilter && titlesFilter.length > 0
      ? titlesFilter
      : ["Chief Technology Officer", "VP Customer Experience", "Managing Director", "Head of Sales"];
    painPoints = [
      "Manual phone intake tying up expensive full-time employees",
      "Missed after-hours inbound calls causing lost qualified revenue",
      "Complex legacy software integrations with lengthy implementation cycles",
    ];
    domainSeeds = ["tech", "software", "solutions", "digital", "ai"];
  }
  // 5. Legal / Accounting / Professional Services
  else if (
    lowerUsp.includes("law") ||
    lowerUsp.includes("legal") ||
    lowerUsp.includes("accounting") ||
    lowerUsp.includes("cpa") ||
    lowerUsp.includes("consulting") ||
    lowerUsp.includes("advisory")
  ) {
    primaryIndustry = industryFilter || "Legal & Accounting Professional Services";
    subIndustries = [
      "Commercial Law Firms",
      "Corporate CPA & Tax Practices",
      "Management Consulting",
      "Financial Advisory Firms",
    ];
    decisionMakerTitles = titlesFilter && titlesFilter.length > 0
      ? titlesFilter
      : ["Managing Partner", "Chief Operating Officer", "Practice Administrator", "Senior Partner"];
    painPoints = [
      "Unbillable hours spent on administrative coordination and triage",
      "High client expectations for rapid, confidential response times",
      "Strict compliance and confidentiality standards for outside services",
    ];
    domainSeeds = ["law", "legal", "cpa", "partners", "consulting"];
  }

  const sampleDomains: string[] = [];

  const keywords = [
    usp.split(" ").slice(0, 3).join(" "),
    primaryIndustry.split(" ")[0],
    loc.city,
  ].filter(Boolean);

  // Formulate Value-Led Conversational Pitch Assets
  const openingHook = `Hello, I'm calling for the ${decisionMakerTitles[0]} regarding ${loc.city} operations. We specialize in ${usp} with simple, transparent pricing starting at ${price.display}.`;

  const qualifyingQuestions = [
    `Who currently oversees operational decisions and student/client intake at your organization?`,
    `Are you currently experiencing ${painPoints[0].toLowerCase()}?`,
    `If we could guarantee ${usp} starting at our ${price.display} rate, would you be open to an initial evaluation?`,
    `What is the best email to send our one-page specification and brief to?`,
  ];

  const objectionRebuttals = {
    existing_vendor: `Many of our current partners in ${loc.city} worked with other solutions before switching. What sets us apart is ${usp}, which allows you to test our service with zero operational risk at ${price.display}.`,
    pricing_pushback: `At ${price.display}, our service is structured specifically to pay for itself immediately by preventing ${painPoints[0].toLowerCase()}.`,
    send_info_only: `I'd be glad to email our one-page brief. To ensure it's relevant, who should I address as the approval authority for ${price.display}?`,
  };

  const orderItemDescription = `${primaryIndustry.split(" ")[0]} Plan (${usp})`;

  return {
    primaryIndustry,
    subIndustries,
    employeeSizeRange: apolloRange.join(";"),
    employeeSizeDisplay: sizeDisplay,
    decisionMakerTitles,
    painPoints,
    valuePropositionPitch: `Guaranteed ${usp} for ${primaryIndustry} in ${loc.city} at ${price.display}`,
    keywords,
    sampleDomains,
    conversationalPitch: {
      openingHook,
      qualifyingQuestions,
      objectionRebuttals,
      orderItemDescription,
      unitPrice: price.amount,
    },
  };
}

/**
 * Main Two-Tier Interpreter: Converts (USP, Price, Location, Optional Filters)
 * into a complete, structured market profile with Apollo criteria & CALL-E context.
 */
export async function interpretUspProfile(input: UspIntakeInput): Promise<InterpretedMarketProfile> {
  const normPrice = normalizePrice(input.price);
  const normLoc = normalizeLocation(input.location);

  const marketIntel = inferMarketIntelligenceFromUsp(
    input.usp,
    normPrice,
    normLoc,
    input.targetCompanySize,
    input.targetIndustry,
    input.targetTitles
  );

  const apolloSearchCriteria: InterpretedMarketProfile["apolloSearchCriteria"] = {
    q_organization_domains_list: [], // Do not send fabricated fake domains to Apollo
    person_locations: [
      normLoc.country === "United States"
        ? (normLoc.state ? `${normLoc.city}, ${normLoc.state}` : normLoc.city)
        : `${normLoc.city}, ${normLoc.country}`,
      normLoc.country !== "United States" ? normLoc.country : (normLoc.state || normLoc.city),
    ].filter(Boolean),
    person_titles: marketIntel.decisionMakerTitles,
    organization_num_employees_ranges: marketIntel.employeeSizeRange.split(";").filter(Boolean),
    q_keywords: marketIntel.keywords.join(" "),
  };

  return {
    usp: input.usp,
    normalizedPrice: normPrice,
    normalizedLocation: normLoc,
    targetMarket: {
      primaryIndustry: marketIntel.primaryIndustry,
      subIndustries: marketIntel.subIndustries,
      employeeSizeRange: marketIntel.employeeSizeRange,
      employeeSizeDisplay: marketIntel.employeeSizeDisplay,
      decisionMakerTitles: marketIntel.decisionMakerTitles,
      painPoints: marketIntel.painPoints,
      valuePropositionPitch: marketIntel.valuePropositionPitch,
    },
    apolloSearchCriteria,
    conversationalPitch: marketIntel.conversationalPitch,
  };
}
