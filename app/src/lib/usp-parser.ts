/**
 * Lightweight client-safe parser to detect USP, Price, and Location from free-text chat input
 * and synthesize document-driven Offer & Market Setup parameters.
 */

export interface ParsedUspInput {
  usp?: string;
  price?: string;
  location?: string;
}

export interface DynamicOfferOptions {
  uspExamples: string[];
  pricePresets: string[];
  locationPresets: string[];
  companySizeOptions: string[];
}

export interface ExtractedOffer {
  productName: string;
  usp: string;
  price: string;
  location: string;
  targetIndustry: string;
  targetCompanySize: string;
  summary: string;
  dynamicOptions: DynamicOfferOptions;
}

/**
 * Parse natural language user messages into USP, Price, and Location
 * E.g. "We offer $250 medical courier delivery in Austin with same-day guarantee"
 */
export function extractUspFromFreeText(text: string): ParsedUspInput | null {
  if (!text || text.trim().length < 5) return null;

  const result: ParsedUspInput = {};

  // Extract Price (e.g. $250, $1,200/mo, 500 usd, 200 taka, ৳500, etc.)
  const priceRegex = /(?:[৳$€£]\s*\d+(?:,\d+)*(?:\.\d+)?(?:\s*(?:k|per\s+\w+|\/mo|\/month|trial|flat|taka|bdt))?|\d+\s*(?:usd|dollars|bdt|taka|tk|euro|eur|gbp))/i;
  const priceMatch = text.match(priceRegex);
  if (priceMatch) {
    result.price = priceMatch[0].trim();
  }

  // Extract Location (e.g. "in Austin", "in Dallas, TX", "in London", "in California", "in Bangladesh")
  const locRegex = /\b(?:in|around|near|for)\s+([A-Z][a-zA-Z\s]+(?:,\s*[A-Z]{2}|,\s*[A-Z][a-zA-Z]+)?)/;
  const locMatch = text.match(locRegex);
  if (locMatch && locMatch[1]) {
    const potentialLoc = locMatch[1].trim();
    if (!["The", "A", "Our", "All", "This", "High", "Best", "Quick"].includes(potentialLoc)) {
      result.location = potentialLoc;
    }
  }

  // Extract USP: Remaining descriptive core
  let uspText = text;
  if (result.price) uspText = uspText.replace(result.price, "");
  if (result.location) uspText = uspText.replace(new RegExp(`\\b(?:in|around|near|for)\\s+${result.location}`, "i"), "");

  uspText = uspText
    .replace(/^(?:we\s+offer|i\s+offer|pitch\s+our|sell\s+our|we\s+have|our\s+usp\s+is|we\s+provide|find\s+leads\s+for)\s*/i, "")
    .replace(/[.,;]+$/, "")
    .trim();

  const isInstructionOnly = /^(?:please\s+analyze|analyze\s+this|check\s+this|read\s+this|here\s+is|look\s+at|review\s+this|attached\s+is|find\s+prospects|can\s+you)/i.test(uspText);

  if (uspText.length > 5 && !isInstructionOnly) {
    result.usp = uspText;
  }

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Clean a file name or markdown heading into a human-readable title
 * E.g. "bangladesh_news_rss.md" -> "Bangladesh News RSS"
 */
function cleanDocTitle(docName?: string): string {
  if (!docName) return "";
  const nameWithoutExt = docName.replace(/\.[^/.]+$/, "");
  return nameWithoutExt
    .replace(/[-_]+/g, " ")
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())
    .replace(/\bRss\b/gi, "RSS")
    .replace(/\bApi\b/gi, "API")
    .replace(/\bAi\b/gi, "AI")
    .replace(/\bB2b\b/gi, "B2B")
    .trim();
}

/**
 * Extract markdown bullets, numbered lists, or feature statements directly from doc text
 */
function extractBulletsAndFeatures(docText: string): string[] {
  if (!docText) return [];
  const lines = docText.split(/\r?\n/);
  const candidates: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    // Match bullet points like - Feature or * Feature
    if (/^[-*•]\s+(.+)/.test(line)) {
      const match = line.replace(/^[-*•]\s+/, "").replace(/[*_#`]/g, "").trim();
      if (match.length >= 15 && match.length <= 130 && !match.toLowerCase().startsWith("http")) {
        candidates.push(match);
      }
    }
    // Match numbered points like 1. Feature
    else if (/^\d+\.\s+(.+)/.test(line)) {
      const match = line.replace(/^\d+\.\s+/, "").replace(/[*_#`]/g, "").trim();
      if (match.length >= 15 && match.length <= 130 && !match.toLowerCase().startsWith("http")) {
        candidates.push(match);
      }
    }
  }
  return candidates;
}

/**
 * Dynamically synthesize Offer & Market Setup parameters directly from an uploaded document
 * and/or conversation text in < 5ms.
 */
export function extractOfferFromDocumentOrChat(input: {
  text?: string;
  docName?: string;
  docText?: string;
}): ExtractedOffer {
  const userText = (input.text || "").trim();
  const docName = input.docName || "";
  const docText = (input.docText || "").slice(0, 8000);

  // Extract explicit markdown H1 if available
  let title = cleanDocTitle(docName);
  const h1Match = docText.match(/^#\s+(.+)$/m);
  if (h1Match && h1Match[1]) {
    const candidateH1 = h1Match[1].replace(/[*_`]/g, "").trim();
    if (candidateH1.length >= 4 && candidateH1.length <= 60) {
      title = candidateH1;
    }
  }
  if (!title) {
    title = "B2B Product Solution";
  }

  const corpus = `${userText} ${docName} ${docText}`.toLowerCase();

  // 1. Detect Location & Presets
  let detectedLocation = "Austin, TX";
  let locationPresets = ["Austin, TX", "Dallas, TX", "Houston, TX", "Miami, FL", "Nationwide (US)"];

  if (corpus.includes("bangladesh") || corpus.includes("dhaka") || corpus.includes("chittagong") || corpus.includes("sylhet") || corpus.includes("bcs")) {
    detectedLocation = "Dhaka, Bangladesh";
    locationPresets = ["Dhaka, Bangladesh", "Chittagong, Bangladesh", "South Asia", "Global Remote"];
  } else if (corpus.includes("london") || corpus.includes("uk") || corpus.includes("united kingdom") || corpus.includes("britain") || corpus.includes("england")) {
    detectedLocation = "London, UK";
    locationPresets = ["London, UK", "Manchester, UK", "Birmingham, UK", "United Kingdom (Nationwide)"];
  } else if (corpus.includes("miami") || corpus.includes("florida") || corpus.includes("orlando") || corpus.includes("tampa")) {
    detectedLocation = "Miami, FL";
    locationPresets = ["Miami, FL", "Fort Lauderdale, FL", "Tampa, FL", "Florida (Statewide)"];
  } else if (corpus.includes("new york") || corpus.includes("nyc") || corpus.includes("brooklyn") || corpus.includes("manhattan")) {
    detectedLocation = "New York, NY";
    locationPresets = ["New York, NY", "Brooklyn, NY", "Jersey City, NJ", "Tri-State Area"];
  } else if (corpus.includes("california") || corpus.includes("los angeles") || corpus.includes("san francisco") || corpus.includes("bay area")) {
    detectedLocation = "Los Angeles, CA";
    locationPresets = ["Los Angeles, CA", "San Francisco, CA", "San Diego, CA", "California (Statewide)"];
  } else if (corpus.includes("chicago") || corpus.includes("illinois")) {
    detectedLocation = "Chicago, IL";
    locationPresets = ["Chicago, IL", "Naperville, IL", "Schaumburg, IL", "Midwest (US)"];
  } else if (corpus.includes("atlanta") || corpus.includes("georgia")) {
    detectedLocation = "Atlanta, GA";
    locationPresets = ["Atlanta, GA", "Alpharetta, GA", "Marietta, GA", "Southeast (US)"];
  } else if (corpus.includes("dallas") || corpus.includes("fort worth") || corpus.includes("plano")) {
    detectedLocation = "Dallas, TX";
    locationPresets = ["Dallas, TX", "Fort Worth, TX", "Plano, TX", "Texas (Statewide)"];
  } else if (corpus.includes("houston")) {
    detectedLocation = "Houston, TX";
    locationPresets = ["Houston, TX", "Sugar Land, TX", "The Woodlands, TX", "Texas (Statewide)"];
  } else if (corpus.includes("toronto") || corpus.includes("canada") || corpus.includes("ontario")) {
    detectedLocation = "Toronto, Canada";
    locationPresets = ["Toronto, Canada", "Vancouver, Canada", "Montreal, Canada", "Canada (Nationwide)"];
  } else if (corpus.includes("berlin") || corpus.includes("germany") || corpus.includes("munich")) {
    detectedLocation = "Berlin, Germany";
    locationPresets = ["Berlin, Germany", "Munich, Germany", "Frankfurt, Germany", "Europe (DACH)"];
  }

  // Check if free text explicitly had a location
  const freeTextParsed = extractUspFromFreeText(userText);
  if (freeTextParsed?.location) {
    detectedLocation = freeTextParsed.location;
    if (!locationPresets.includes(detectedLocation)) {
      locationPresets.unshift(detectedLocation);
    }
  }

  // 2. Extract Document Feature Bullets
  const docFeatures = extractBulletsAndFeatures(docText);

  // 3. Detect Vertical / Industry & Synthesize Tailored USPs + Pricing
  let targetIndustry = "Commercial B2B Services";
  let primaryUsp = `Turnkey ${title} engineered for rapid operational deployment`;
  let uspExamples: string[] = [
    `Turnkey ${title} engineered for rapid operational deployment`,
    `Cost-efficient B2B service delivery with dedicated account management and 24/7 support`,
    `Performance-guaranteed pilot package with zero long-term commitment`,
  ];
  let price = "$500 trial";
  let pricePresets = ["$250 trial", "$500 trial", "$1,500/mo", "$3,500 enterprise"];
  let targetCompanySize = "11–50 employees";
  let summary = `Product documentation for ${title} analyzed and ready for market targeting.`;

  // Branch A: News / RSS / Media / Feed / Syndication / Publishing
  if (
    corpus.includes("news") ||
    corpus.includes("rss") ||
    corpus.includes("media") ||
    corpus.includes("feed") ||
    corpus.includes("syndicat") ||
    corpus.includes("journalis") ||
    corpus.includes("publish") ||
    corpus.includes("article")
  ) {
    targetIndustry = "Digital Media & News Publishing";
    primaryUsp = `Automated real-time ${title} feed syndication for digital publishers & media agencies`;
    uspExamples = [
      `Automated real-time ${title} feed syndication for digital publishers & media agencies`,
      `Curated multilingual news aggregation API with full article metadata & webhook alerts`,
      `Low-latency breaking news intelligence pipeline with 99.9% uptime SLA`,
    ];
    price = "$199/mo API access";
    pricePresets = ["$99/mo starter", "$199/mo API access", "$499/mo agency tier", "$1,200/mo enterprise"];
    targetCompanySize = "11–50 employees";
    summary = `Automated news syndication and real-time content aggregation pipeline for digital media agencies and publishers.`;
  }
  // Branch B: Medical / Healthcare / Dental / Clinic
  else if (
    corpus.includes("medical") ||
    corpus.includes("clinic") ||
    corpus.includes("dental") ||
    corpus.includes("patient") ||
    corpus.includes("healthcare") ||
    corpus.includes("doctor")
  ) {
    targetIndustry = "Healthcare & Medical Practices";
    primaryUsp = corpus.includes("courier") || corpus.includes("delivery")
      ? "Guaranteed 24-hour medical courier with live temperature telemetry"
      : "AI receptionist answering 100% of clinic calls with real-time EMR booking";
    uspExamples = [
      "Guaranteed 24-hour medical courier with live temperature telemetry",
      "AI receptionist answering 100% of clinic calls with real-time EMR booking",
      "Turnkey clinical intake automation reducing patient check-in wait times by 60%",
    ];
    price = "$250 trial pack";
    pricePresets = ["$250 trial", "$500/mo", "$1,500/mo", "$3,500 enterprise"];
    targetCompanySize = "5–25 staff";
    summary = `Healthcare practice automation and specialized medical logistics workflow.`;
  }
  // Branch C: Marketing / Agency / SEO / Advertising
  else if (
    corpus.includes("marketing") ||
    corpus.includes("seo") ||
    corpus.includes("agency") ||
    corpus.includes("advertising") ||
    corpus.includes("growth") ||
    corpus.includes("lead generation")
  ) {
    targetIndustry = "Digital Marketing & Advertising Agencies";
    primaryUsp = `Performance-based inbound lead generation delivering verified executive appointments`;
    uspExamples = [
      `Performance-based inbound lead generation delivering verified executive appointments`,
      `Full-funnel SEO & programmatic content engine delivering 3x qualified pipeline`,
      `Turnkey multichannel ad acquisition with guaranteed ROAS benchmarks`,
    ];
    price = "$1,500/mo retainer";
    pricePresets = ["$750 pilot", "$1,500/mo retainer", "$3,000/mo scale", "$7,500 enterprise"];
    targetCompanySize = "10–50 employees";
    summary = `Digital marketing and automated lead generation pipeline for commercial growth.`;
  }
  // Branch D: Real Estate / Property / Architecture
  else if (
    corpus.includes("real estate") ||
    corpus.includes("realtor") ||
    corpus.includes("property") ||
    corpus.includes("broker") ||
    corpus.includes("leasing")
  ) {
    targetIndustry = "Real Estate & Commercial Brokerage";
    primaryUsp = `Automated buyer & tenant inquiry qualification with instant MLS tour scheduling`;
    uspExamples = [
      `Automated buyer & tenant inquiry qualification with instant MLS tour scheduling`,
      `Commercial off-market property intelligence with direct owner contact matching`,
      `Turnkey virtual leasing assistant operating 24/7 with zero missed leads`,
    ];
    price = "$450/mo per agent";
    pricePresets = ["$250 trial", "$450/mo", "$1,200/mo team", "$2,800/mo brokerage"];
    targetCompanySize = "5–25 staff";
    summary = `Real estate broker workflow automation and commercial property lead intelligence.`;
  }
  // Branch E: Cyber Security / IT / Compliance
  else if (
    corpus.includes("security") ||
    corpus.includes("cyber") ||
    corpus.includes("soc2") ||
    corpus.includes("compliance") ||
    corpus.includes("devops")
  ) {
    targetIndustry = "Cybersecurity & IT Infrastructure";
    primaryUsp = `Continuous SOC2/HIPAA compliance telemetry with real-time automated penetration testing`;
    uspExamples = [
      `Continuous SOC2/HIPAA compliance telemetry with real-time automated penetration testing`,
      `24/7 Managed SOC and zero-day threat detection with 15-minute incident SLA`,
      `Automated cloud posture hardening reducing audit preparation from months to hours`,
    ];
    price = "$990/mo base";
    pricePresets = ["$490/mo starter", "$990/mo base", "$2,500/mo enterprise", "Custom quote"];
    targetCompanySize = "20–100 employees";
    summary = `Enterprise cybersecurity, continuous compliance monitoring, and automated threat detection.`;
  }
  // Branch F: B2B SaaS / AI / Software / Tech / API
  else if (
    corpus.includes("saas") ||
    corpus.includes("software") ||
    corpus.includes("ai voice") ||
    corpus.includes("platform") ||
    corpus.includes("cloud") ||
    corpus.includes("api")
  ) {
    targetIndustry = "B2B SaaS & Cloud Platforms";
    primaryUsp = `Autonomous AI agent delivering 10x speed on inbound B2B qualification`;
    uspExamples = [
      `Autonomous AI agent delivering 10x speed on inbound B2B qualification`,
      `Real-time API infrastructure with 99.99% SLA and instant multi-region deployment`,
      `Turnkey data integration connecting legacy systems to automated cloud workflows`,
    ];
    price = "$499/mo team tier";
    pricePresets = ["$199/mo starter", "$499/mo team tier", "$1,500/mo business", "$4,500 enterprise"];
    targetCompanySize = "20–100 staff";
    summary = `Autonomous software and automated data infrastructure platform.`;
  }
  // Branch G: Logistics / Freight / Trucking / Courier / Warehouse
  else if (
    corpus.includes("freight") ||
    corpus.includes("logistics") ||
    corpus.includes("trucking") ||
    corpus.includes("warehouse") ||
    corpus.includes("courier") ||
    corpus.includes("dispatch")
  ) {
    targetIndustry = "Logistics & Freight Transportation";
    primaryUsp = `Guaranteed same-day regional freight dispatch with live GPS tracking and zero hidden fees`;
    uspExamples = [
      `Guaranteed same-day regional freight dispatch with live GPS tracking and zero hidden fees`,
      `Next-day freight distribution with dedicated fleet capacity and automated proof of delivery`,
      `End-to-end cold-chain logistics ensuring 100% temperature compliance`,
    ];
    price = "$500 pilot run";
    pricePresets = ["$250 trial", "$500 pilot run", "$1,800/mo route", "$5,000/mo fleet"];
    targetCompanySize = "20–50 employees";
    summary = `Regional freight transport, fleet dispatch, and logistics fulfillment.`;
  }
  // Branch H: Legal / Law / CPA / Accounting / Tax
  else if (
    corpus.includes("legal") ||
    corpus.includes("law") ||
    corpus.includes("attorney") ||
    corpus.includes("cpa") ||
    corpus.includes("tax") ||
    corpus.includes("accounting")
  ) {
    targetIndustry = "Legal & Accounting Professional Services";
    primaryUsp = `Specialized commercial contract compliance and fractional counsel with 2-hour response SLA`;
    uspExamples = [
      `Specialized commercial contract compliance and fractional counsel with 2-hour response SLA`,
      `Full-cycle corporate tax advisory and automated bookkeeping with guaranteed audit defense`,
      `White-glove executive legal triage for high-growth commercial enterprises`,
    ];
    price = "$1,200/mo retainer";
    pricePresets = ["$500 trial review", "$1,200/mo retainer", "$3,500/mo partner advisory", "Custom enterprise"];
    targetCompanySize = "5–25 staff";
    summary = `Professional legal counsel, corporate accounting, and business advisory services.`;
  }
  // Branch I: Construction / Roofing / Trades / HVAC
  else if (
    corpus.includes("roof") ||
    corpus.includes("contractor") ||
    corpus.includes("hvac") ||
    corpus.includes("construction") ||
    corpus.includes("plumb")
  ) {
    targetIndustry = "Commercial Contracting & Trades";
    primaryUsp = `Commercial grade preventive inspections with same-day emergency dispatch guarantee`;
    uspExamples = [
      `Commercial grade preventive inspections with same-day emergency dispatch guarantee`,
      `Turnkey commercial installation with licensed master technicians and 10-year warranty`,
      `Automated facilities maintenance contract reducing emergency downtime by 40%`,
    ];
    price = "$500 diagnostic & report";
    pricePresets = ["$500 diagnostic", "$1,500/mo maintenance", "$3,500 project pilot", "$10K+ commercial"];
    targetCompanySize = "10–50 employees";
    summary = `Commercial trade maintenance, contracting, and facility repair services.`;
  }
  // Branch J: Education / BCS / Test Prep / Coaching / Academies / Students
  else if (
    corpus.includes("bcs") ||
    corpus.includes("exam") ||
    corpus.includes("coaching") ||
    corpus.includes("cadre") ||
    corpus.includes("admission") ||
    corpus.includes("student") ||
    corpus.includes("academy") ||
    corpus.includes("training") ||
    corpus.includes("edtech") ||
    corpus.includes("study") ||
    corpus.includes("tutoring")
  ) {
    targetIndustry = "Education & Exam Prep Coaching Academies";
    primaryUsp = `Comprehensive exam preparation notes and curated question banks for BCS & competitive exam candidates`;
    uspExamples = [
      `Comprehensive exam preparation notes and curated question banks for BCS & competitive exam candidates`,
      `Turnkey batch enrollment and digital study materials for coaching academies`,
      `Exclusive subject-wise model tests and performance analytics for civil service aspirants`,
    ];
    price = corpus.includes("bdt") || corpus.includes("taka") || corpus.includes("৳") ? "৳500 BDT / subject" : "$50 / student license";
    pricePresets = corpus.includes("bdt") || corpus.includes("taka") || corpus.includes("৳")
      ? ["৳200 BDT starter", "৳500 BDT complete pack", "৳1,500 BDT academy license", "৳5,000 BDT institutional"]
      : ["$25 trial", "$50 / student license", "$250 academy pack", "$1,000 institutional"];
    targetCompanySize = "5–25 staff";
    summary = `Educational exam preparation, coaching academy materials, and student candidate assessment tools.`;
  }

  // 4. Ingest Direct Document Features into USP Chips
  if (docFeatures.length > 0) {
    primaryUsp = docFeatures[0];
    uspExamples = [...docFeatures.slice(0, 3), primaryUsp];
    // Deduplicate
    uspExamples = Array.from(new Set(uspExamples)).slice(0, 4);
  }

  // 5. Ingest Pricing from Document or Free Text
  const docPriceMatch = docText.match(/(\$\s*\d+(?:,\d+)*(?:\.\d+)?(?:\s*(?:k|per\s+\w+|\/mo|\/month|trial|flat))?|\d+\s*(?:usd|dollars|bdt|tk|euro|eur|gbp))/i);
  if (docPriceMatch && !freeTextParsed?.price) {
    price = docPriceMatch[0].trim();
    if (!pricePresets.includes(price)) {
      pricePresets.unshift(price);
    }
  }

  // If the user's free text provided an explicit price, adopt it
  if (freeTextParsed?.price) {
    price = freeTextParsed.price;
    if (!pricePresets.includes(price)) {
      pricePresets.unshift(price);
    }
  }

  // If the user's free text provided an explicit USP, adopt it
  if (freeTextParsed?.usp && (!docName || userText.toLowerCase().includes("usp") || userText.toLowerCase().includes("we offer"))) {
    primaryUsp = freeTextParsed.usp;
    if (!uspExamples.includes(primaryUsp)) {
      uspExamples.unshift(primaryUsp);
    }
  }

  return {
    productName: title,
    usp: primaryUsp,
    price,
    location: detectedLocation,
    targetIndustry,
    targetCompanySize,
    summary,
    dynamicOptions: {
      uspExamples: uspExamples.slice(0, 4),
      pricePresets: pricePresets.slice(0, 4),
      locationPresets: locationPresets.slice(0, 5),
      companySizeOptions: [
        "Any (AI Auto-Detect)",
        "1–10 employees",
        "11–50 employees",
        "51–200 employees",
        "200+ employees",
      ],
    },
  };
}
