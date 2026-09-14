declare module "@call-e/calle" {
  export interface CallEConfig {
    apiKey: string;
    baseUrl?: string;
  }

  // ─── Goal Runs API (Stable @call-e/calle@0.7.0) ─────────────

  export interface GoalRunInput {
    goalId: string;
    phone: string;
    variables?: Record<string, unknown>;
    idempotencyKey?: string;
  }

  export interface GoalRunObject {
    id: string;
    goalId: string;
    phone: string;
    status: "queued" | "in_progress" | "completed" | "failed";
    result?: Record<string, unknown>;
    createdAt: string;
    completedAt?: string;
  }

  export interface GoalObject {
    id: string;
    name: string;
    description?: string;
    status: string;
  }

  // ─── One-Shot Calls API (Legacy / Request-scoped) ────────────

  export interface CallCreateInput {
    task: string;
    recipients: Array<{ phones: string[] }>;
    resultSchema?: Record<string, unknown>;
  }

  export interface CallCreateOptions {
    idempotencyKey?: string;
  }

  export interface CallObject {
    id: string;
    status: string;
    result?: Record<string, unknown>;
  }

  // ─── Main Client ─────────────────────────────────────────────

  export class CallE {
    constructor(config: CallEConfig);
    
    // Goal Runs API surface
    goals: {
      list(options?: { limit?: number; cursor?: string }): Promise<{ data: GoalObject[] }>;
      get(id: string): Promise<GoalObject>;
      run(input: GoalRunInput): Promise<GoalRunObject>;
      getRun(id: string): Promise<GoalRunObject>;
      waitForResult(runId: string, options?: { timeoutMs?: number; intervalMs?: number }): Promise<GoalRunObject>;
      runAndWait(input: GoalRunInput, options?: { timeoutMs?: number; intervalMs?: number }): Promise<GoalRunObject>;
    };

    // Calls API surface
    calls: {
      create(input: CallCreateInput, options?: CallCreateOptions): Promise<CallObject>;
      get(id: string): Promise<CallObject>;
      waitForResult(id: string, options?: { timeoutMs?: number; intervalMs?: number }): Promise<CallObject>;
    };
  }
}
