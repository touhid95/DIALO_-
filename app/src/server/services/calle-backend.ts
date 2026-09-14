// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { CalleClient as BaseCalleClient } from "@call-e/calle";
import * as CallePkg from "@call-e/calle";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CalleClient: any = BaseCalleClient || (CallePkg as any).CalleClient || (CallePkg as any).default?.CalleClient;


export interface LeadInput {
  name: string;
  phone: string;
  companyName?: string;
  category?: string;
  location?: string;
  decisionMaker?: string;
  notesOrEvidence?: string[];
  hypothesis?: string;
}

export interface CallOptions {
  apiKey?: string;
  baseUrl?: string; // Default: https://api.heycall-e.com
  companyName?: string;
  customQuestions?: string[];
  timeoutMs?: number; // Default: 180,000 (3 mins)
  pollIntervalMs?: number; // Default: 2,000 (2 secs)
}

export interface CallResult {
  callId: string;
  status: "completed" | "failed" | "in_progress";
  structuredResult?: {
    decision_maker_reached?: boolean;
    need_confirmed?: boolean;
    current_solution?: string;
    pain_points?: string;
    interest_level?: "high" | "medium" | "low" | "none";
    next_action?: string;
    additional_notes?: string;
    [key: string]: unknown;
  };
  transcript?: string;
}

/**
 * 1. Formats the natural-language prompt given to the AI caller
 */
export function buildCalleTaskPrompt(lead: LeadInput, options?: CallOptions): string {
  const callingOnBehalfOf = options?.companyName || "our company";
  const persona = lead.decisionMaker ? ` (${lead.decisionMaker})` : "";

  const questions = options?.customQuestions && options.customQuestions.length > 0
    ? options.customQuestions
    : [
        "Who currently handles incoming calls?",
        "Do you experience missed calls during busy periods?",
        "What happens with after-hours calls?",
        "Are you currently considering any solutions to improve call handling?",
        "Who would make the decision about adopting a new solution?",
      ];

  const questionsFormatted = questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
  const evidenceFormatted = lead.notesOrEvidence?.length
    ? lead.notesOrEvidence.map((e) => `- ${e}`).join("\n")
    : "- No previous context";

  return `You are an AI phone agent calling on behalf of ${callingOnBehalfOf}.

Call ${lead.name}${persona} at ${lead.phone}.

Objective:
Determine whether ${lead.name} currently has difficulty handling inbound calls and whether they would be interested in an AI-powered phone answering solution.

Context:
- Category: ${lead.category || "Business"}
- Location: ${lead.location || "N/A"}
${lead.hypothesis ? `- Hypothesis: ${lead.hypothesis}` : ""}

Background Context:
${evidenceFormatted}

Questions to ask:
${questionsFormatted}

Constraints:
- Do not make purchases or financial commitments
- Do not misrepresent identity
- Do not claim uncertain information as fact
- Be professional, polite, and conversational

After the conversation, return structured answers for each question asked.`;
}

/**
 * 2. Defines the structured schema returned by CALL-E after the call
 */
export function getCalleResultSchema(): Record<string, unknown> {
  return {
    type: "object",
    required: ["decision_maker_reached", "need_confirmed"],
    properties: {
      decision_maker_reached: {
        type: "boolean",
        description: "Whether a relevant decision maker was reached",
      },
      need_confirmed: {
        type: "boolean",
        description: "Whether the business confirmed a need for the solution",
      },
      current_solution: {
        type: "string",
        description: "How the business currently handles this problem",
      },
      pain_points: {
        type: "string",
        description: "Specific pain points mentioned by the recipient",
      },
      interest_level: {
        type: "string",
        enum: ["high", "medium", "low", "none"],
        description: "Level of interest in a solution",
      },
      next_action: {
        type: "string",
        description: "Recommended next step",
      },
      additional_notes: {
        type: "string",
        description: "Any other relevant information gathered",
      },
    },
    additionalProperties: false,
  };
}

/**
 * 3. Main execution function: Hands the lead directly to the CALL-E SDK
 */
export async function callLeadWithCalle(
  lead: LeadInput,
  options: CallOptions = {}
): Promise<CallResult> {
  const apiKey = options.apiKey || process.env.CALL_E_API_KEY || process.env.CALLE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing CALLE_API_KEY / CALL_E_API_KEY. Please pass it in options or set in process.env.");
  }

  // Initialize SDK Client
  const client = new CalleClient({
    apiKey,
    baseUrl: options.baseUrl || "https://api.heycall-e.com",
  });

  // Prepare task and schema from lead details
  const taskPrompt = buildCalleTaskPrompt(lead, options);
  const resultSchema = getCalleResultSchema();

  // Trigger call and wait for completion
  const call = await client.calls.createAndWait(
    {
      task: taskPrompt,
      recipients: [{ phones: [lead.phone] }],
      resultSchema,
    },
    {
      timeoutMs: options.timeoutMs ?? 180_000,
      intervalMs: options.pollIntervalMs ?? 2_000,
    }
  );

  // Extract transcript from call events
  let transcript = "";
  try {
    const events = await client.calls.listEvents(call.id, { limit: 100 });
    transcript = ((events as any).data || [])
      .filter((e: any) => e.message?.includes("Bot is speaking:") || e.message?.includes("Callee said:"))
      .map((e: any) => {
        const isBot = e.message?.includes("Bot is speaking:");
        const text = e.message?.replace("Bot is speaking: ", "").replace("Callee said: ", "") || "";
        return `${isBot ? "🤖 BOT" : "📱 LEAD"}: ${text}`;
      })
      .join("\n");
  } catch {
    // Event listing is optional if transcript is not needed
  }

  return {
    callId: call.id,
    status: call.status === "completed" ? "completed" : "failed",
    structuredResult: call.structuredResult as CallResult["structuredResult"],
    transcript,
  };
}
