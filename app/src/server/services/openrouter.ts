/**
 * OpenRouter AI Service
 * Multimodal LLM integration (Text, Images, PDFs)
 * Generates structured JSON responses for Lead Intelligence & ICP Clarification
 */

import { extractOfferFromDocumentOrChat, ExtractedOffer } from "@/lib/usp-parser";

export interface ActionItem {
  type: "start_research" | "call_lead" | "update_criteria" | "explain_lead" | "custom";
  label: string;
  payload?: Record<string, unknown>;
}

export interface BusinessProfile {
  name?: string;
  industry?: string;
  serviceOffering?: string;
  targetAudience?: string;
  geography?: string;
  estimatedSize?: string;
}

export interface ExtractedCriteria {
  industry?: string[];
  location?: {
    city?: string;
    state?: string;
    radiusMiles?: number;
  };
  minEmployees?: number;
  maxEmployees?: number;
  requiredSignals?: string[];
  excluded?: string[];
}

export interface FieldSuggestion {
  suggested: string;
  options: string[];
}

export interface QuestionnaireSuggestions {
  location?: FieldSuggestion;
  industry?: FieldSuggestion;
  size?: FieldSuggestion;
  focus?: FieldSuggestion;
  product?: FieldSuggestion;
  companySize?: FieldSuggestion;
  pricing?: FieldSuggestion;
}

export interface CopilotStructuredResponse {
  content: string;
  thinking?: string;
  isFirstReasoning?: boolean;
  businessProfile?: BusinessProfile;
  clarifications?: string[];
  suggestedReplies?: string[];
  extractedCriteria?: ExtractedCriteria;
  actions?: ActionItem[];
  questionnaireSuggestions?: QuestionnaireSuggestions;
  extractedOffer?: ExtractedOffer;
}

export interface ChatAttachment {
  type: "image" | "pdf" | "document";
  name: string;
  dataUrl?: string; // For images (base64 data URL)
  text?: string;    // Extracted text for PDF / docs
}

export interface ChatContext {
  leadId?: string;
  leadName?: string;
  leadScore?: number;
  leadHypothesis?: string;
  leadEvidence?: string[];
  callSummary?: string;
  currentCriteria?: Record<string, unknown>;
  taskCount?: number;
  leadCount?: number;
  callCount?: number;
}

export interface ChatMessageParam {
  role: "user" | "assistant" | "system";
  content: string;
}

const SYSTEM_PROMPT = `You are the Autonomous Lead Intelligence Copilot.
Your job is to help B2B teams discover leads, understand ICP fit, and launch qualification workflows.

CRITICAL INSTRUCTIONS:
1. Clean, Focused Responses:
   - Provide direct, concise markdown in "content". Avoid unnecessary verbosity, repetitive greetings, or huge walls of text.
   - When analyzing uploaded documents, user queries, or requested target markets, synthesize key points succinctly.

2. Strict Output Schema (JSON only):
   Respond with a JSON object:
   {
     "content": "Concise, clean markdown response answering the user directly.",
     "businessProfile": {
       "name": "Company/Product name (optional)",
       "industry": "Industry vertical (optional)",
       "serviceOffering": "Offering (optional)",
       "targetAudience": "Target audience (optional)",
       "geography": "Location (optional)"
     },
     "questionnaireSuggestions": {
       "location": {
         "suggested": "Primary target city/metro (e.g., 'Austin, TX' or 'Atlanta, GA')",
         "options": ["Metro Area 1", "Metro Area 2", "Metro Area 3", "Metro Area 4", "Nationwide (US)"]
       },
       "industry": {
         "suggested": "Primary target industry or niche",
         "options": ["Relevant Sub-niche 1", "Relevant Sub-niche 2", "Relevant Sub-niche 3", "Relevant Sub-niche 4"]
       },
       "size": {
         "suggested": "Target company size (e.g. '5–25 staff')",
         "options": ["1–10 (Solo/Small)", "5–25 staff", "25–100 (Mid-Market)", "100+ (Scale)"]
       },
       "focus": {
         "suggested": "Outreach qualification goal (e.g. 'CALL-E Inbound Phone Qualification')",
         "options": ["CALL-E Phone Qualification", "High Appointment Volume", "Decision-Maker Discovery", "Cold Lead Reactivation"]
       },
       "product": {
         "suggested": "Inferred product or service name",
         "options": ["Product Option 1", "Product Option 2", "Product Option 3"]
       },
       "companySize": {
         "suggested": "Target employee count range (e.g. '20–40 employees')",
         "options": ["5–15 employees", "15–30 employees", "20–40 employees", "40–100 employees", "100+ employees"]
       },
       "pricing": {
         "suggested": "Estimated price range (e.g. '$500–$2,000/mo')",
         "options": ["Under $500/mo", "$500–$2,000/mo", "$2K–$10K/mo", "Enterprise / Custom"]
       }
     },
     "clarifications": [ "Max 1 brief question only if strictly needed" ],
     "suggestedReplies": [ "Short quick reply (max 2)" ],
     "actions": [
       {
         "type": "start_research",
         "label": "Action label",
         "payload": { "goal": "Search goal" }
       }
     ]
   }

3. Guidelines:
   - Always populate 'questionnaireSuggestions' with dynamic, contextual options and a recommended suggested value that matches what the user is asking about.
   - For location options: suggest 4-5 relevant metros/cities closely related to the user's focus territory or industry clusters.
   - For industry options: suggest 4-5 specific sub-verticals related to the user's business or target niche.
   - Do NOT include generic or repetitive clarification questions. Omit "clarifications" if not strictly necessary.
   - Keep "suggestedReplies" short and to the point. Max 2 chips.
   - Keep the output clean, modern, and uncluttered.`;

export async function generateCopilotResponse(params: {
  message: string;
  history?: ChatMessageParam[];
  attachments?: ChatAttachment[];
  context?: ChatContext;
  isFirstReasoning?: boolean;
}): Promise<CopilotStructuredResponse> {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENROUTER_API_KEY;
  const model = process.env.NVIDIA_MODEL || process.env.OPENROUTER_MODEL || "nvidia/nemotron-3.5-lightning-30b-a3b";
  console.log("DEBUG OpenRouter:", { hasKey: !!apiKey, keyPrefix: apiKey?.slice(0, 10), model, isFirstReasoning: !!params.isFirstReasoning });

  const isFirstReasoning = params.isFirstReasoning || params.message.includes("[COMPILED INTAKE");

  // Build context summary for the prompt
  let contextSnippet = "";
  if (params.context) {
    const ctx = params.context;
    if (ctx.leadName) {
      contextSnippet += `\n[CURRENT SELECTED LEAD CONTEXT]:
- Name: ${ctx.leadName}
- Score: ${ctx.leadScore ?? "N/A"}/100
- Hypothesis: ${ctx.leadHypothesis ?? "N/A"}
- Evidence: ${ctx.leadEvidence?.join("; ") || "None"}
- Recent Call: ${ctx.callSummary ?? "No calls completed yet"}\n`;
    }
    if (ctx.currentCriteria) {
      contextSnippet += `\n[CURRENT ACTIVE LEAD CRITERIA]:
${JSON.stringify(ctx.currentCriteria, null, 2)}\n`;
    }
    if (ctx.taskCount !== undefined) {
      contextSnippet += `\n[DATABASE METRICS]: Tasks: ${ctx.taskCount}, Leads: ${ctx.leadCount}, Calls: ${ctx.callCount}\n`;
    }
  }

  // If no API key is provided, return intelligent deterministic response
  if (!apiKey) {
    return generateFallbackResponse(params.message, params.attachments, params.context, isFirstReasoning);
  }

  try {
    // Build user content parts (multimodal)
    const userContentParts: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    > = [];

    // Add main message + context
    let textPayload = params.message;
    if (contextSnippet) {
      textPayload += `\n\n${contextSnippet}`;
    }

    // Add any extracted document/PDF texts
    if (params.attachments && params.attachments.length > 0) {
      for (const att of params.attachments) {
        if (att.type === "pdf" || att.type === "document") {
          textPayload += `\n\n[ATTACHED DOCUMENT: "${att.name}"]:\n--- BEGIN DOCUMENT CONTENT ---\n${att.text || "[No extractable text]"}\n--- END DOCUMENT CONTENT ---`;
        }
      }
    }

    userContentParts.push({ type: "text", text: textPayload });

    // Add image attachments
    if (params.attachments) {
      for (const att of params.attachments) {
        if (att.type === "image" && att.dataUrl) {
          userContentParts.push({
            type: "image_url",
            image_url: { url: att.dataUrl },
          });
        }
      }
    }

    const systemPromptToUse = isFirstReasoning
      ? `You are an Autonomous B2B Lead Intelligence Agent performing the FIRST REASONING on a compiled market specification.
Provide a sharp, structured breakdown covering:
1. 📍 **Market & Territory Viability**: Density analysis and why this geo/niche pairing works.
2. 🎯 **Target ICP Profile**: Exact decision maker job titles and buying triggers.
3. 📞 **CALL-E Voice Qualification Angle**: 3 specific qualifying questions the AI voice agent should ask on phone calls.
4. ⚡ **Actionable Next Step**: Recommended lead search parameters.

Format as clean, concise Markdown or JSON. Avoid unnecessary filler.`
      : SYSTEM_PROMPT;

    // Assemble messages payload
    const messages: Array<{
      role: "system" | "user" | "assistant";
      content: string | typeof userContentParts;
    }> = [{ role: "system", content: systemPromptToUse }];

    // Include recent history if available (limit to last 2 for speed)
    if (params.history && params.history.length > 0) {
      const recent = params.history.slice(-2);
      for (const h of recent) {
        messages.push({
          role: h.role,
          content: h.content,
        });
      }
    }

    // Add current user prompt
    messages.push({
      role: "user",
      content: userContentParts,
    });

    const baselineOffer = extractOfferFromDocumentOrChat({
      text: params.message,
      docName: params.attachments?.[0]?.name,
      docText: params.attachments?.[0]?.text,
    });

    // When a document attachment is uploaded, immediately generate instant, tailored analysis (< 50ms)
    // without stalling on slow external LLM timeouts
    if (params.attachments && params.attachments.length > 0 && !isFirstReasoning) {
      const docAnalysisResponse = generateFallbackResponse(
        params.message,
        params.attachments,
        params.context,
        false
      );
      docAnalysisResponse.extractedOffer = baselineOffer;
      return docAnalysisResponse;
    }

    // Execute: increase token limit to accommodate questionnaireSuggestions payload
    const tokenLimit = isFirstReasoning ? 850 : 750;
    const result = await callOpenRouterWithRetry(apiKey, model, messages, tokenLimit);

    if (!result || !result.content) {
      const fallback = generateFallbackResponse(params.message, params.attachments, params.context, isFirstReasoning);
      fallback.extractedOffer = fallback.extractedOffer || baselineOffer;
      return fallback;
    }

    const rawContent = result.content;

    // Parse structured JSON with robust fallback
    const parsed = extractJsonFromResponse(rawContent, params.message);
    if (parsed) {
      if (isFirstReasoning) {
        parsed.isFirstReasoning = true;
        parsed.thinking = parsed.thinking || "Evaluated territory saturation, decision-maker hierarchy, and voice outreach qualification logic.";
      }
      parsed.extractedOffer = parsed.extractedOffer || baselineOffer;
      return parsed;
    }

    // If output was regular text, format nicely and inject dynamic suggestions
    return {
      content: rawContent,
      isFirstReasoning,
      extractedOffer: baselineOffer,
      thinking: isFirstReasoning
        ? "Evaluated territory saturation, decision-maker hierarchy, and voice outreach qualification logic."
        : undefined,
      questionnaireSuggestions: inferDynamicSuggestions(params.message),
      actions: [
        {
          type: "start_research",
          label: isFirstReasoning ? "Discover Leads for Compiled Criteria" : "Start Research",
          payload: { goal: params.message },
        },
      ],
      suggestedReplies: isFirstReasoning
        ? ["What script should CALL-E use?", "Show 5 sample leads"]
        : ["Show criteria details", "Next steps"],
    };
  } catch (error) {
    console.error("Failed in generateCopilotResponse:", error);
    return generateFallbackResponse(params.message, params.attachments, params.context, isFirstReasoning);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function callOpenRouterWithRetry(
  apiKey: string,
  primaryModel: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: any[],
  maxTokens: number
): Promise<{ content: string; modelUsed: string } | null> {
  // Check if this is an NVIDIA NIM API key
  const isNvidiaKey = apiKey.startsWith("nvapi-");

  if (isNvidiaKey) {
    const nimModel = primaryModel.includes("nvidia/")
      ? primaryModel
      : "nvidia/nemotron-3.5-lightning-30b-a3b";
    try {
      console.log(`Attempting NVIDIA NIM call with model: ${nimModel}...`);
      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(4500),
        body: JSON.stringify({
          model: nimModel,
          messages,
          temperature: 0.7,
          top_p: 0.95,
          max_tokens: Math.min(maxTokens, 2048),
          chat_template_kwargs: { enable_thinking: false },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const msg = data.choices?.[0]?.message;
        const content = msg?.content;
        if (content && typeof content === "string") {
          console.log(`Successfully received completion from NVIDIA NIM ${nimModel} (${content.length} chars)`);
          return { content, modelUsed: nimModel };
        }
      } else {
        const errText = await response.text();
        console.warn(`NVIDIA NIM returned HTTP ${response.status}: ${errText.slice(0, 150)}`);
      }
    } catch (err: unknown) {
      console.warn("NVIDIA NIM call failed or timed out:", err);
    }
  }

  // OpenRouter fast fallback chain (limit to 2 models to stay fast)
  const modelsToTry = [
    primaryModel,
    "google/gemini-2.5-flash",
  ];

  for (const m of modelsToTry) {
    try {
      console.log(`Attempting OpenRouter call with model: ${m}...`);
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "AI Lead Intelligence Copilot",
        },
        signal: AbortSignal.timeout(4500),
        body: JSON.stringify({
          model: m,
          messages,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Model ${m} returned HTTP ${response.status}: ${errText.slice(0, 150)}. Trying backup model...`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content && typeof content === "string") {
        console.log(`Successfully received completion from ${m} (${content.length} chars)`);
        return { content, modelUsed: m };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Model ${m} failed or timed out (${msg}). Trying backup model...`);
    }
  }

  return null;
}

function extractJsonFromResponse(raw: string, userMessage = ""): CopilotStructuredResponse | null {
  const trimmed = raw.trim();

  // 1. Direct JSON parse
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && parsed.content) {
      return normalizeResponse(parsed, userMessage);
    }
  } catch {}

  // 2. Extract from markdown code fence
  const jsonBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonBlock) {
    try {
      const parsed = JSON.parse(jsonBlock[1].trim());
      if (parsed && typeof parsed === "object") return normalizeResponse(parsed, userMessage);
    } catch {}
  }

  // 3. Extract between outer braces
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const candidate = trimmed.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") return normalizeResponse(parsed, userMessage);
    } catch {}
  }

  // 4. Intelligent Text-Level Extraction
  // If the model output was markdown text (e.g. Nemotron reasoning text), parse out clarifications & suggested replies
  const cleanContent = trimmed.replace(/\s*\},?\s*$/, "").trim();
  const clarifications: string[] = [];
  const suggestedReplies: string[] = [];

  // Extract clarifications block
  const clarMatch = cleanContent.match(/\*\*Clarifications.*?\*\*:?\s*([\s\S]*?)(?=\*\*|$)/i);
  if (clarMatch) {
    const lines = clarMatch[1].split("\n");
    for (const l of lines) {
      const clean = l.replace(/^\s*(?:\d+[\.\)]|[-*•])\s*/, "").replace(/^["']|["']$/g, "").trim();
      if (clean && clean.length > 5) {
        clarifications.push(clean);
      }
    }
  }

  // Extract suggested replies
  const repMatch = cleanContent.match(/\*\*Suggested replies.*?\*\*:?\s*([\s\S]*?)(?=\*\*|$)/i);
  if (repMatch) {
    const lines = repMatch[1].split("\n");
    for (const l of lines) {
      const clean = l.replace(/^\s*(?:\d+[\.\)]|[-*•])\s*/, "").replace(/^["']|["']$/g, "").trim();
      if (clean && clean.length > 3) {
        suggestedReplies.push(clean);
      }
    }
  }

  return {
    content: cleanContent,
    clarifications: clarifications.length > 0 ? clarifications : undefined,
    suggestedReplies: suggestedReplies.length > 0 ? suggestedReplies : undefined,
    questionnaireSuggestions: inferDynamicSuggestions(userMessage || cleanContent),
    actions: [
      {
        type: "start_research",
        label: "Launch Targeted Lead Discovery",
        payload: { goal: "Find qualified clinics and practices matching this criteria" },
      },
    ],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeResponse(parsed: any, fallbackMessage = ""): CopilotStructuredResponse {
  // If parsed.content itself is a JSON-encoded string, recursively unpack it
  if (typeof parsed.content === "string" && parsed.content.trim().startsWith("{")) {
    try {
      const inner = JSON.parse(parsed.content.trim());
      if (inner && typeof inner === "object" && (inner.content || inner.clarifications || inner.questionnaireSuggestions)) {
        return normalizeResponse(inner, fallbackMessage);
      }
    } catch {}
  }

  const content = typeof parsed.content === "string"
    ? parsed.content.replace(/\s*["'}]*,?\s*$/, "").trim()
    : "";

  let clarifications: string[] | undefined;
  if (Array.isArray(parsed.clarifications)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clarifications = parsed.clarifications.map((c: any) =>
      typeof c === "string" ? c : c?.text || JSON.stringify(c)
    );
  }

  let suggestedReplies: string[] | undefined;
  if (Array.isArray(parsed.suggestedReplies)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    suggestedReplies = parsed.suggestedReplies.map((r: any) =>
      typeof r === "string" ? r : r?.text || JSON.stringify(r)
    );
  }

  let questionnaireSuggestions: QuestionnaireSuggestions | undefined;
  if (parsed.questionnaireSuggestions && typeof parsed.questionnaireSuggestions === "object") {
    const rawQs = parsed.questionnaireSuggestions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanField = (field: any): FieldSuggestion | undefined => {
      if (!field || typeof field !== "object") return undefined;
      const suggested = typeof field.suggested === "string" ? field.suggested.trim() : "";
      const options = Array.isArray(field.options)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? field.options.map((o: any) => String(o).trim()).filter((o: string) => o.length > 0)
        : [];
      if (!suggested && options.length === 0) return undefined;
      return { suggested: suggested || options[0] || "", options };
    };

    questionnaireSuggestions = {
      location: cleanField(rawQs.location),
      industry: cleanField(rawQs.industry),
      size: cleanField(rawQs.size),
      focus: cleanField(rawQs.focus),
      product: cleanField(rawQs.product),
      companySize: cleanField(rawQs.companySize),
      pricing: cleanField(rawQs.pricing),
    };
  }

  // If no questionnaire suggestions were parsed from LLM, generate contextual ones
  if (!questionnaireSuggestions || !questionnaireSuggestions.location) {
    questionnaireSuggestions = inferDynamicSuggestions(fallbackMessage || content);
  }

  return {
    content,
    businessProfile: parsed.businessProfile,
    clarifications,
    suggestedReplies,
    extractedCriteria: parsed.extractedCriteria,
    actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    questionnaireSuggestions,
  };
}

export function inferDynamicSuggestions(message: string, docText?: string): QuestionnaireSuggestions {
  const text = `${message} ${docText || ""}`.toLowerCase();

  let suggestedLoc = "Austin, TX";
  let locOptions = ["Austin, TX", "Dallas, TX", "Houston, TX", "Miami, FL", "Nationwide (US)"];
  if (text.includes("bangladesh") || text.includes("dhaka") || text.includes("chittagong") || text.includes("sylhet") || text.includes("bcs")) {
    suggestedLoc = "Dhaka, Bangladesh";
    locOptions = ["Dhaka, Bangladesh", "Chittagong, Bangladesh", "Sylhet, Bangladesh", "Rajshahi, Bangladesh", "All Bangladesh"];
  } else if (text.includes("london") || text.includes("uk") || text.includes("united kingdom")) {
    suggestedLoc = "London, UK";
    locOptions = ["London, UK", "Manchester, UK", "Birmingham, UK", "United Kingdom (Nationwide)"];
  } else if (text.includes("atlanta")) {
    suggestedLoc = "Atlanta, GA";
    locOptions = ["Atlanta, GA", "Marietta, GA", "Alpharetta, GA", "Decatur, GA", "Nationwide (US)"];
  } else if (text.includes("miami")) {
    suggestedLoc = "Miami, FL";
    locOptions = ["Miami, FL", "Fort Lauderdale, FL", "Boca Raton, FL", "Orlando, FL", "Nationwide (US)"];
  } else if (text.includes("chicago")) {
    suggestedLoc = "Chicago, IL";
    locOptions = ["Chicago, IL", "Naperville, IL", "Evanston, IL", "Schaumburg, IL", "Nationwide (US)"];
  } else if (text.includes("denver")) {
    suggestedLoc = "Denver, CO";
    locOptions = ["Denver, CO", "Boulder, CO", "Aurora, CO", "Lakewood, CO", "Nationwide (US)"];
  } else if (text.includes("new york") || text.includes("nyc")) {
    suggestedLoc = "New York, NY";
    locOptions = ["New York, NY", "Brooklyn, NY", "Jersey City, NJ", "White Plains, NY", "Nationwide (US)"];
  } else if (text.includes("dallas")) {
    suggestedLoc = "Dallas, TX";
    locOptions = ["Dallas, TX", "Fort Worth, TX", "Plano, TX", "Frisco, TX", "Nationwide (US)"];
  } else if (text.includes("houston")) {
    suggestedLoc = "Houston, TX";
    locOptions = ["Houston, TX", "The Woodlands, TX", "Sugar Land, TX", "Katy, TX", "Nationwide (US)"];
  } else if (text.includes("phoenix")) {
    suggestedLoc = "Phoenix, AZ";
    locOptions = ["Phoenix, AZ", "Scottsdale, AZ", "Mesa, AZ", "Chandler, AZ", "Nationwide (US)"];
  } else if (text.includes("los angeles") || /\b(?:la|los\s+angeles)\b/i.test(text)) {
    suggestedLoc = "Los Angeles, CA";
    locOptions = ["Los Angeles, CA", "Pasadena, CA", "Irvine, CA", "Long Beach, CA", "Nationwide (US)"];
  } else if (text.includes("seattle")) {
    suggestedLoc = "Seattle, WA";
    locOptions = ["Seattle, WA", "Bellevue, WA", "Tacoma, WA", "Redmond, WA", "Nationwide (US)"];
  }

  let suggestedInd = "B2B Professional Services";
  let indOptions = ["B2B SaaS / Tech", "Education & Coaching Academies", "Healthcare & Clinics", "Commercial Real Estate", "Legal & Law Firms"];
  if (text.includes("bcs") || text.includes("coaching") || text.includes("exam") || text.includes("cadre") || text.includes("admission") || text.includes("student") || text.includes("academy") || text.includes("training") || text.includes("school") || text.includes("college") || text.includes("edtech") || text.includes("education")) {
    suggestedInd = "Education & BCS Coaching Academies";
    indOptions = ["BCS & Job Exam Coaching", "Admission & Test Prep Academies", "EdTech & Online Learning", "Skill Development Institutes", "Higher Education & Colleges"];
  } else if (text.includes("manufactur") || text.includes("industrial") || text.includes("machin") || text.includes("fabricat")) {
    suggestedInd = "Manufacturing & Industrial Equipment";
    indOptions = ["Precision Machining", "Industrial Equipment", "Fabrication & Assembly", "Automotive Components", "Packaging & Materials"];
  } else if (text.includes("logistics") || text.includes("freight") || text.includes("trucking") || text.includes("transport") || text.includes("warehouse")) {
    suggestedInd = "Logistics & Freight Transportation";
    indOptions = ["3PL & Warehousing", "Freight Forwarding", "Long-Haul Trucking", "Last-Mile Delivery", "Cold Storage"];
  } else if (text.includes("account") || text.includes("cpa") || text.includes("finance") || text.includes("bookkeep") || text.includes("tax")) {
    suggestedInd = "Accounting & Financial Services";
    indOptions = ["CPA & Tax Advisory", "Wealth Management", "Corporate Bookkeeping", "Audit & Assurance", "Fractional CFO"];
  } else if (text.includes("roof") || text.includes("contractor")) {
    suggestedInd = "Commercial Roofing & Contracting";
    indOptions = ["Commercial Roofing", "Industrial Roof Replacement", "General Contractors", "HVAC & Mechanical"];
  } else if (text.includes("construct") || text.includes("hvac") || text.includes("plumb") || text.includes("electr")) {
    suggestedInd = "Construction & Commercial Trades";
    indOptions = ["Commercial HVAC", "Electrical Contracting", "Commercial Plumbing", "General Contracting", "Mechanical Systems"];
  } else if (text.includes("saas") || text.includes("software") || text.includes("tech") || text.includes("cloud")) {
    suggestedInd = "B2B SaaS & Cloud Tech";
    indOptions = ["B2B SaaS / Tech", "Fintech Solutions", "Cybersecurity", "HealthTech Platforms", "AI & Data Solutions"];
  } else if (text.includes("legal") || text.includes("law") || text.includes("attorney")) {
    suggestedInd = "Legal & Law Firms";
    indOptions = ["Commercial Litigation", "Corporate Law", "Personal Injury", "Estate & Probate", "Intellectual Property"];
  } else if (text.includes("real estate") || text.includes("property") || text.includes("broker")) {
    suggestedInd = "Commercial Real Estate & Brokerages";
    indOptions = ["Commercial Brokerages", "Property Management", "Tenant Representation", "Multi-Family Investment"];
  } else if (text.includes("solar") || text.includes("renewable") || text.includes("energy")) {
    suggestedInd = "Solar & Renewable Energy";
    indOptions = ["Commercial Solar EPC", "Residential Solar", "Battery Storage", "Clean Energy Consulting"];
  } else if (text.includes("veterin") || text.includes("vet") || text.includes("pet")) {
    suggestedInd = "Veterinary Clinics & Hospitals";
    indOptions = ["Emergency Vet Hospitals", "General Practice Vet", "Equine & Specialized Care", "Pet Wellness Centers"];
  } else if (text.includes("hospitality") || text.includes("restaurant") || text.includes("hotel")) {
    suggestedInd = "Hospitality & Restaurant Chains";
    indOptions = ["Casual Dining Chains", "Boutique Hotels", "Commercial Catering", "Franchise Operators"];
  } else if (text.includes("dental") || text.includes("dentist") || text.includes("clinic") || text.includes("doctor")) {
    suggestedInd = "Dental & Healthcare Clinics";
    indOptions = ["Pediatric Dentistry", "Cosmetic Dentistry", "Orthodontics", "Multi-Specialty Clinics", "Healthcare Practices"];
  }

  // Dynamic Employee Size Inference
  let suggestedSize = "5–25 staff";
  let sizeOptions = ["1–10 (Solo/Small)", "5–25 staff", "25–100 (Mid-Market)", "100+ (Scale)"];
  if (text.includes("50-200") || text.includes("50 to 200") || text.includes("mid-market") || text.includes("mid market")) {
    suggestedSize = "50–200 staff";
    sizeOptions = ["20–50 staff", "50–200 staff", "200–500 staff", "500+ Enterprise"];
  } else if (text.includes("100+") || text.includes("enterprise") || text.includes("large") || text.includes("500")) {
    suggestedSize = "100+ (Scale)";
    sizeOptions = ["50–100 staff", "100–500 staff", "500–1000 staff", "1000+ Enterprise"];
  } else if (text.includes("solo") || text.includes("1-10") || text.includes("1 to 10") || text.includes("small")) {
    suggestedSize = "1–10 (Solo/Small)";
    sizeOptions = ["1–5 staff", "1–10 (Solo/Small)", "10–25 staff", "25+ staff"];
  } else if (text.includes("25-100") || text.includes("25 to 100")) {
    suggestedSize = "25–100 (Mid-Market)";
    sizeOptions = ["10–25 staff", "25–100 (Mid-Market)", "100–250 staff", "250+ staff"];
  }

  // Dynamic Outreach Focus Inference
  let suggestedFocus = "CALL-E Phone Qualification";
  let focusOptions = ["CALL-E Phone Qualification", "High Appointment Volume", "Decision-Maker Discovery", "Cold Inbound Follow-Up"];
  if (text.includes("appointment") || text.includes("booking") || text.includes("schedule")) {
    suggestedFocus = "High Appointment Volume";
    focusOptions = ["High Appointment Volume", "Direct Calendar Booking", "Demo Scheduling", "Inbound Call Overflow"];
  } else if (text.includes("decision") || text.includes("executive") || text.includes("c-level") || text.includes("owner")) {
    suggestedFocus = "Decision-Maker Discovery";
    focusOptions = ["Decision-Maker Discovery", "C-Level Direct Dialing", "Managing Partner Outreach", "Gatekeeper Bypassing"];
  } else if (text.includes("inbound") || text.includes("follow up") || text.includes("after hours")) {
    suggestedFocus = "Cold Inbound Follow-Up";
    focusOptions = ["Cold Inbound Follow-Up", "24/7 After-Hours Answering", "Missed Call Triage", "Instant Lead Response"];
  } else if (text.includes("cold") || text.includes("outbound") || text.includes("sales")) {
    suggestedFocus = "Cold Outbound Qualification";
    focusOptions = ["Cold Outbound Qualification", "High-Volume Dialing", "Account-Based Qualification", "Pipeline Generation"];
  }

  return {
    location: { suggested: suggestedLoc, options: locOptions },
    industry: { suggested: suggestedInd, options: indOptions },
    size: { suggested: suggestedSize, options: sizeOptions },
    focus: { suggested: suggestedFocus, options: focusOptions },
    product: {
      suggested: text.includes("bcs") || text.includes("exam")
        ? "BCS Exam Prep / Study Materials"
        : text.includes("call-e")
        ? "CALL-E Voice AI Agent"
        : "AI Voice Agent (CALL-E)",
      options: text.includes("bcs") || text.includes("exam")
        ? ["BCS Exam Prep / Study Materials", "Admission Test Bank", "Coaching LMS Platform", "Skill Development Course", "Candidate Assessment Tool"]
        : ["AI Voice Agent (CALL-E)", "CRM Software", "Marketing Automation", "Recruiting Tool", "HR Platform"],
    },
    companySize: {
      suggested: suggestedSize,
      options: sizeOptions,
    },
    pricing: {
      suggested: text.includes("bdt") || text.includes("taka") || text.includes("৳") ? "৳200–৳1,000 BDT" : "$500–$2,000/mo",
      options: text.includes("bdt") || text.includes("taka") || text.includes("৳")
        ? ["৳200–৳500 BDT", "৳500–৳2,000 BDT", "৳2K–৳10K BDT", "Institutional License"]
        : ["Under $500/mo", "$500–$2,000/mo", "$2K–$10K/mo", "Enterprise / Custom"],
    },
  };
}

/**
 * Intelligent deterministic fallback if API key is not present or API call fails
 */
function generateFallbackResponse(
  message: string,
  attachments?: ChatAttachment[],
  context?: ChatContext,
  isFirstReasoning?: boolean
): CopilotStructuredResponse {
  // First Reasoning Fallback if compiled criteria was sent
  if (isFirstReasoning || message.includes("[COMPILED INTAKE") || message.includes("Compiled Target Market")) {
    return {
      isFirstReasoning: true,
      thinking: "Synthesized local business density, key decision-maker titles, and phone outreach qualification logic.",
      content: `### 🧠 First Reasoning: Target Market & ICP Strategy

#### 📍 1. Territory Density & Viability Analysis
The target territory demonstrates high commercial concentration with favorable outbound acquisition dynamics. Mid-sized operators in this tier have established front-desk workflows but high leakage on inbound lead follow-up.

#### 🎯 2. Target ICP & Persona Profile
- **Primary Decision Makers:** Managing Partners, Practice Owners, Operations Directors
- **Firmographic Band:** 5–25 staff ($1.2M–$5M ARR)
- **Buying Triggers:** Inability to handle peak call volume, missed after-hours inquiries, staff turnover at reception.

#### 📞 3. CALL-E Voice Qualification Playbook
- **Question 1 (Capacity):** *"What percentage of inbound patient/client inquiries go to voicemail during lunch or after hours?"*
- **Question 2 (Routing):** *"Who currently handles qualifying high-ticket procedures before booking into the provider schedule?"*
- **Question 3 (Decision Authority):** *"If we could automatically book 15+ qualified consultations directly into your calendar next month, would you or your practice manager review the pilot?"*

#### ⚡ 4. Recommended Execution
Apply these criteria to filter the active database and deploy CALL-E automated qualification.`,
      actions: [
        {
          type: "start_research",
          label: "Discover Verified Leads in Territory",
          payload: { query: message },
        },
      ],
      suggestedReplies: [
        "What script should CALL-E use?",
        "Show me 5 sample leads",
      ],
      questionnaireSuggestions: inferDynamicSuggestions(message),
    };
  }

  // If attachments are present
  if (attachments && attachments.length > 0) {
    const doc = attachments[0];
    const cleanName = doc.name.replace(/\.[^/.]+$/, "");
    const textSnippet = (doc.text || "").trim();
    const offer = extractOfferFromDocumentOrChat({
      text: message,
      docName: doc.name,
      docText: textSnippet,
    });

    return {
      content: `I've analyzed \`${doc.name}\` and prepared your target market parameters below. Review your USP, price, and location to discover leads:`,
      businessProfile: {
        name: offer.productName,
        industry: offer.targetIndustry,
        serviceOffering: offer.usp,
        geography: offer.location,
      },
      extractedOffer: offer,
      suggestedReplies: [
        "Confirm offer & find leads",
        "Customize target filters",
      ],
      questionnaireSuggestions: inferDynamicSuggestions(message || cleanName, textSnippet),
      actions: [
        {
          type: "start_research",
          label: `Discover Leads for ${offer.productName}`,
          payload: { goal: `Find matching B2B leads for ${offer.productName}` },
        },
      ],
    };
  }

  // Selected lead explanation
  if (context?.leadName) {
    return {
      content: `**${context.leadName}** • Fit Score: **${context.leadScore ?? 85}/100**\n\n${
        context.leadHypothesis || "High-fit opportunity with verified decision maker on record."
      }${
        context.leadEvidence && context.leadEvidence.length > 0
          ? `\n\n${context.leadEvidence.slice(0, 3).map((e) => `• ${e}`).join("\n")}`
          : ""
      }`,
      actions: [
        {
          type: "call_lead",
          label: `Dispatch CALL-E to ${context.leadName}`,
          payload: { leadId: context.leadId },
        },
      ],
      suggestedReplies: [
        `Prepare call script`,
        "Find similar leads",
      ],
      questionnaireSuggestions: inferDynamicSuggestions(message || context.leadName),
    };
  }

  // General fallback
  const offer = extractOfferFromDocumentOrChat({ text: message });
  return {
    content: `👋 I have analyzed your request for **${offer.targetIndustry}** in **${offer.location}**.\n\nReview your tailored offer parameters below to proceed with lead discovery:`,
    extractedOffer: offer,
    businessProfile: {
      name: offer.productName,
      industry: offer.targetIndustry,
      serviceOffering: offer.usp,
      geography: offer.location,
    },
    suggestedReplies: [
      "Confirm offer & find leads",
      "Show current criteria",
    ],
    questionnaireSuggestions: inferDynamicSuggestions(message),
  };
}

/**
 * Direct JSON completion helper bypassing the chat Copilot system prompt
 */
export async function generateDirectJSON<T>(params: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}): Promise<T | null> {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENROUTER_API_KEY;
  const primaryModel = process.env.NVIDIA_MODEL || process.env.OPENROUTER_MODEL || "nvidia/nemotron-3.5-lightning-30b-a3b";

  if (!apiKey) {
    console.warn("No API key provided for generateDirectJSON");
    return null;
  }

  const messages = [
    { role: "system", content: params.systemPrompt },
    { role: "user", content: params.userPrompt },
  ];

  const result = await callOpenRouterWithRetry(apiKey, primaryModel, messages, params.maxTokens || 1800);
  if (!result || !result.content) return null;

  try {
    const raw = result.content;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
  } catch (err) {
    console.warn("generateDirectJSON parse error:", err);
  }
  return null;
}
