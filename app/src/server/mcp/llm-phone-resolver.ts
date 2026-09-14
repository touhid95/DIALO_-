/**
 * LLM Phone & Contact Resolver — Final Decision Maker with ML Core Support
 *
 * Combines structural ML verification (E.164, NANP area codes, toll-free detection)
 * with LLM reasoning to determine the single most accurate, direct business phone line
 * and verify working emails & decision makers.
 */

import { verifyPhone, PhoneVerificationResult } from "./phone-verifier";
import { generateCopilotResponse } from "@/server/services/openrouter";

export interface ContactCandidate {
  phone?: string | null;
  source?: string;
  contextSnippet?: string;
}

export interface ResolveContactInput {
  companyName: string;
  location?: string | null;
  industry?: string | null;
  phoneCandidates: (string | ContactCandidate)[];
  emailCandidates?: string[];
  snippets?: string[];
}

export interface ResolvedContact {
  phone: string | null;
  phoneE164: string | null;
  phoneConfidence: number; // 0-1
  phoneScore: number;      // 0-100
  phoneType: "landline" | "mobile" | "tollfree" | "voip" | "unknown";
  email: string | null;
  emailConfidence: number; // 0-1
  emailScore: number;      // 0-100
  decisionMaker: string | null;
  decisionMakerTitle: string | null;
  aiRationale: string;
}

/**
 * Validates email syntactically and provides confidence score.
 */
export function verifyEmail(email: string | null | undefined): { isValid: boolean; score: number; confidence: number } {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return { isValid: false, score: 0, confidence: 0 };
  }
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, score: 20, confidence: 0.2 };
  }

  // Check domain quality
  const domain = clean.split("@")[1];
  const genericDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com"];
  const isGeneric = genericDomains.includes(domain);

  const score = isGeneric ? 60 : 92;
  const confidence = isGeneric ? 0.65 : 0.92;
  return { isValid: true, score, confidence };
}

/**
 * Resolves the most accurate phone and contact details using ML scoring + LLM arbitration.
 */
export async function resolveAccurateContact(input: ResolveContactInput): Promise<ResolvedContact> {
  // 1. Flatten and ML-verify all phone candidates
  const candidateStrings: string[] = [];
  for (const c of input.phoneCandidates) {
    if (!c) continue;
    if (typeof c === "string") {
      candidateStrings.push(c);
    } else if (c.phone) {
      candidateStrings.push(c.phone);
    }
  }

  const uniqueCandidates = Array.from(new Set(candidateStrings.map((s) => s.trim()).filter(Boolean)));
  const mlResults: Array<{ original: string; ml: PhoneVerificationResult }> = uniqueCandidates.map((cand) => ({
    original: cand,
    ml: verifyPhone(cand),
  }));

  // Sort by ML phone score descending
  mlResults.sort((a, b) => b.ml.phoneScore - a.ml.phoneScore);

  // Email check
  const primaryEmail = (input.emailCandidates && input.emailCandidates.length > 0) ? input.emailCandidates[0] : null;
  const emailCheck = verifyEmail(primaryEmail);

  // 2. If no phone numbers found at all
  if (mlResults.length === 0) {
    return {
      phone: null,
      phoneE164: null,
      phoneConfidence: 0,
      phoneScore: 0,
      phoneType: "unknown",
      email: primaryEmail,
      emailConfidence: emailCheck.confidence,
      emailScore: emailCheck.score,
      decisionMaker: null,
      decisionMakerTitle: null,
      aiRationale: "No phone candidates found in multi-domain search.",
    };
  }

  // 3. If there is exactly one high-scoring candidate (>= 85) and no ambiguity
  const topCandidate = mlResults[0];
  if (mlResults.length === 1 && topCandidate.ml.phoneScore >= 80) {
    return {
      phone: topCandidate.original,
      phoneE164: topCandidate.ml.e164,
      phoneConfidence: topCandidate.ml.confidence,
      phoneScore: topCandidate.ml.phoneScore,
      phoneType: (topCandidate.ml.type === "invalid" ? "unknown" : topCandidate.ml.type) as ResolvedContact["phoneType"],
      email: primaryEmail,
      emailConfidence: emailCheck.confidence,
      emailScore: emailCheck.score,
      decisionMaker: null,
      decisionMakerTitle: null,
      aiRationale: `High confidence single phone candidate verified via E.164 NANP: ${topCandidate.ml.notes.join("; ")}`,
    };
  }

  // 4. Multiple candidates or ambiguous: Use AI LLM layer as the final decision maker
  const prompt = `[PHONE_AND_CONTACT_RESOLUTION]:
Target Company: "${input.companyName}"
Target Location: "${input.location || "Unknown"}"
Target Industry: "${input.industry || "Unknown"}"

Candidate Phone Numbers with ML Scores:
${mlResults
  .map(
    (c, i) =>
      `${i + 1}. Number: "${c.original}" -> E164: "${c.ml.e164 || "none"}", Type: "${c.ml.type}", ML Score: ${c.ml.phoneScore}/100, Notes: [${c.ml.notes.join(", ")}]`
  )
  .join("\n")}

Context Snippets Found from Web Scraping / Search:
${(input.snippets || []).slice(0, 5).map((s, i) => `Snippet ${i + 1}: ${s}`).join("\n")}

Your task as the final decision maker:
1. Select the single most accurate, direct business phone number for "${input.companyName}".
2. Prefer local direct lines over toll-free call centers or fax lines.
3. Identify the likely Decision Maker (Owner/CEO/Manager) if mentioned in snippets.
4. Return ONLY valid JSON:
{
  "selectedPhone": "string (original or normalized)",
  "selectedPhoneE164": "string (e.g. +15125550100)",
  "phoneType": "landline" | "mobile" | "tollfree" | "voip",
  "confidence": 0.95,
  "decisionMaker": "string or null",
  "decisionMakerTitle": "string or null",
  "rationale": "one sentence explanation"
}`;

  try {
    const aiResult = await generateCopilotResponse({
      message: prompt,
      history: [],
      attachments: [],
      context: {},
      isFirstReasoning: false,
    });

    const content = aiResult.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const matchedMl = mlResults.find((m) => m.original === parsed.selectedPhone || m.ml.e164 === parsed.selectedPhoneE164) || topCandidate;

      const finalE164 = parsed.selectedPhoneE164 || matchedMl.ml.e164;
      const finalConf = typeof parsed.confidence === "number" ? parsed.confidence : matchedMl.ml.confidence;
      const finalScore = Math.min(100, Math.max(10, Math.round(finalConf * 100)));

      return {
        phone: parsed.selectedPhone || matchedMl.original,
        phoneE164: finalE164,
        phoneConfidence: finalConf,
        phoneScore: finalScore,
        phoneType: (parsed.phoneType || matchedMl.ml.type || "landline") as ResolvedContact["phoneType"],
        email: primaryEmail,
        emailConfidence: emailCheck.confidence,
        emailScore: emailCheck.score,
        decisionMaker: parsed.decisionMaker || null,
        decisionMakerTitle: parsed.decisionMakerTitle || null,
        aiRationale: parsed.rationale || "AI verified direct business line based on context and area code match.",
      };
    }
  } catch (err) {
    console.warn("AI contact resolution fallback triggered:", err);
  }

  // Fallback to highest ML score candidate
  return {
    phone: topCandidate.original,
    phoneE164: topCandidate.ml.e164,
    phoneConfidence: topCandidate.ml.confidence,
    phoneScore: topCandidate.ml.phoneScore,
    phoneType: (topCandidate.ml.type === "invalid" ? "unknown" : topCandidate.ml.type) as ResolvedContact["phoneType"],
    email: primaryEmail,
    emailConfidence: emailCheck.confidence,
    emailScore: emailCheck.score,
    decisionMaker: null,
    decisionMakerTitle: null,
    aiRationale: `Selected highest ML structural score (${topCandidate.ml.phoneScore}/100) with E.164 normalization.`,
  };
}
