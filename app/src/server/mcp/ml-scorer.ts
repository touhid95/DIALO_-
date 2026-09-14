/**
 * Enhanced ML & Rule-Based Lead Scorer
 *
 * Evaluates raw or imported leads against target criteria:
 *  - ICP Fit (25 pts)
 *  - Business Quality (15 pts)
 *  - Pain Signal (25 pts)
 *  - Intent (20 pts)
 *  - Recency (10 pts)
 *  - Contactability (5 pts)
 *  + phoneScore (0-100)
 *  + emailScore (0-100)
 *  + dataCompleteness (0-100)
 *  + callReadiness (0-100)
 */

import type { OKFScores } from "./okf-store";
import type { ResolvedContact } from "./llm-phone-resolver";

export interface ScoringContext {
  targetIndustry?: string;
  targetLocation?: string;
  targetSizeRange?: { min: number; max: number };
  productName?: string;
  productPricing?: string;
}

export interface ScoredResult {
  scores: OKFScores;
  hypothesis: string;
  recommendedAction: "call" | "research" | "follow_up" | "skip";
  tags: string[];
  qualifyingQuestions: string[];
}

export function scoreLead(
  lead: {
    name: string;
    website?: string | null;
    location?: string | null;
    category?: string | null;
    employeeCount?: number | null;
    snippets?: string[];
  },
  contact: ResolvedContact,
  context: ScoringContext = {}
): ScoredResult {
  let icpFit = 16;
  let businessQuality = 10;
  let painSignal = 18;
  let intent = 12;
  const recency = 8;
  let contactability = 3;

  const tags: string[] = [];

  // 1. ICP Fit calculation
  if (context.targetIndustry && lead.category) {
    if (lead.category.toLowerCase().includes(context.targetIndustry.toLowerCase()) ||
        context.targetIndustry.toLowerCase().includes(lead.category.toLowerCase())) {
      icpFit += 5;
      tags.push("target-industry");
    }
  }

  if (context.targetSizeRange && lead.employeeCount) {
    if (lead.employeeCount >= context.targetSizeRange.min && lead.employeeCount <= context.targetSizeRange.max) {
      icpFit += 4;
      tags.push("ideal-headcount");
    }
  }

  icpFit = Math.min(25, icpFit);

  // 2. Business Quality
  if (lead.website && lead.website.startsWith("http")) {
    businessQuality += 3;
    tags.push("verified-web");
  }
  if (contact.decisionMaker) {
    businessQuality += 2;
    tags.push("decision-maker-found");
  }
  businessQuality = Math.min(15, businessQuality);

  // 3. Pain Signal
  const snippetText = (lead.snippets || []).join(" ").toLowerCase();
  if (snippetText.includes("receptionist") || snippetText.includes("phone") || snippetText.includes("call") || snippetText.includes("appointments")) {
    painSignal += 4;
    tags.push("high-call-volume");
  }
  painSignal = Math.min(25, painSignal);

  // 4. Contactability
  if (contact.phoneScore >= 80) {
    contactability = 5;
    tags.push("direct-phone-verified");
  } else if (contact.phoneScore >= 50) {
    contactability = 4;
  } else {
    contactability = 1;
  }

  // Calculate Data Completeness (0-100)
  const fields = [
    !!lead.name,
    !!contact.phone,
    !!contact.email,
    !!lead.website,
    !!lead.location,
    !!contact.decisionMaker,
    !!lead.employeeCount,
  ];
  const dataCompleteness = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  // Total Score (0-100)
  const total = Math.min(100, icpFit + businessQuality + painSignal + intent + recency + contactability);

  // Call Readiness (0-100): composite of phoneScore + total score + contactability
  const callReadiness = Math.round(
    total * 0.45 + contact.phoneScore * 0.45 + (contactability / 5) * 10
  );

  // Recommended Action
  let recommendedAction: ScoredResult["recommendedAction"] = "research";
  if (callReadiness >= 65 && contact.phoneScore >= 70) {
    recommendedAction = "call";
  } else if (total >= 60) {
    recommendedAction = "follow_up";
  } else if (total < 40) {
    recommendedAction = "skip";
  }

  const scores: OKFScores = {
    total,
    icpFit,
    businessQuality,
    painSignal,
    intent,
    recency,
    contactability,
    phoneScore: contact.phoneScore,
    emailScore: contact.emailScore,
    dataCompleteness,
    callReadiness,
  };

  const hypothesis = `${lead.name} operates in ${lead.category || "their market"} with ${lead.employeeCount || "estimated 15-40"} staff in ${lead.location || "local area"}. Phone accuracy is ${contact.phoneScore}%, indicating a high probability of reaching a decision maker directly for ${context.productName || "voice qualification"}.`;

  const qualifyingQuestions = [
    `How many incoming customer calls does ${lead.name} receive daily?`,
    "What percentage of after-hours calls currently go to voicemail?",
    `Is ${contact.decisionMaker || "the operations leader"} currently evaluating automated phone receptionist solutions?`,
  ];

  return {
    scores,
    hypothesis,
    recommendedAction,
    tags,
    qualifyingQuestions,
  };
}
