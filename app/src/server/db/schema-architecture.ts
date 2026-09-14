/**
 * Database Architecture & Stage Routing Graph Specification
 * 
 * Provides an explicit code-level knowledge map of the application's
 * database entities (Prisma SQLite models), lifecycle stage state machines,
 * and API route read/write interactions.
 * 
 * This file acts as the primary architectural bridge for Graphify AST extraction.
 */

// ─── 1. DATABASE ENTITY MODELS ───────────────────────────────────────────────

/**
 * Tenant root model isolating all data per company or organization.
 */
export class OrganizationEntity {
  id!: string;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;

  // Has-many relations
  members?: OrganizationMemberEntity[];
  businessDocuments?: BusinessDocumentEntity[];
  businessProfiles?: BusinessProfileEntity[];
  leadCriteria?: LeadCriteriaEntity[];
  unifiedDiscoveries?: UnifiedDiscoveryRecordEntity[];
  tasks?: TaskEntity[];
  leads?: LeadEntity[];
  calls?: CallEntity[];
  events?: EventEntity[];
  auditLogs?: AuditLogEntity[];
}

/**
 * User membership and role assignments within an organization.
 */
export class OrganizationMemberEntity {
  id!: string;
  organizationId!: string;
  userId!: string;
  role!: "owner" | "admin" | "member";
  createdAt!: Date;

  // Belongs-to relation
  organization?: OrganizationEntity;
}

/**
 * Uploaded pitch decks, solution specs, or PDF/DOCX documents for LLM analysis.
 */
export class BusinessDocumentEntity {
  id!: string;
  organizationId!: string;
  filename!: string;
  storagePath!: string;
  mimeType!: string;
  extractedText?: string;
  fileSize?: number;
  createdAt!: Date;

  organization?: OrganizationEntity;
}

/**
 * Extracted company offering, market position, and target audience summary.
 */
export class BusinessProfileEntity {
  id!: string;
  organizationId!: string;
  profileJson!: {
    name?: string;
    industry?: string;
    serviceOffering?: string;
    targetAudience?: string;
    geography?: string;
    estimatedSize?: string;
  };
  version!: number;
  createdAt!: Date;

  organization?: OrganizationEntity;
}

/**
 * Search filters, industry keywords, and headcount constraints extracted by AI Copilot.
 */
export class LeadCriteriaEntity {
  id!: string;
  organizationId!: string;
  criteriaJson!: {
    industry?: string[];
    location?: { city?: string; state?: string; radiusMiles?: number };
    minEmployees?: number;
    maxEmployees?: number;
    requiredSignals?: string[];
    excluded?: string[];
  };
  version!: number;
  createdAt!: Date;

  organization?: OrganizationEntity;
}

/**
 * Unified Discovery Record in the MCP Layer.
 * Bridges:
 * 1. Pure LLM Array Extraction (organization_domain, client_location, keywords)
 * 2. Chatbot Interface User Questionnaire Metrics (industry, company_size, pricing, focus)
 * 3. Second AI Combiner Synthesis (compiled multi-platform boolean search queries)
 * Stored directly in the MCP layer (unifiedMCPStore) and synced to Prisma LeadCriteria.
 */
export class UnifiedDiscoveryRecordEntity {
  id!: string;
  organizationId!: string;
  taskId?: string;
  generatedAt!: Date;
  status!: "draft" | "synthesized" | "dispatched" | "completed";

  // 1. First LLM Array Extractions
  llmArrays!: {
    organization_domain: string[];
    client_location: string[];
    keywords: string[];
  };

  // 2. Chatbot User Question Metrics
  userMetrics!: {
    industry: string;
    company_size: string;
    pricing: string;
    focus: string;
  };

  // 3. Second AI Synthesis Outputs
  compiledQueries!: {
    core: string[];
    google: string;
    linkedin: string;
    yellowpages: string;
    facebook?: string;
  };
  decisionMakerTitles!: string[];
  positiveSignals!: string[];
  negativeSignals!: string[];

  organization?: OrganizationEntity;
}

/**
 * Async discovery background job state machine.
 * Transitions: CREATED → PLANNING → DISCOVERING → ENRICHING → SCORING → READY_FOR_REVIEW | FAILED
 */
export class TaskEntity {
  id!: string;
  organizationId!: string;
  status!: "CREATED" | "PLANNING" | "DISCOVERING" | "ENRICHING" | "SCORING" | "READY_FOR_REVIEW" | "FAILED";
  goal!: string;
  progressJson?: {
    discovered?: number;
    enriched?: number;
    scored?: number;
    total?: number;
  };
  error?: string;
  createdAt!: Date;
  updatedAt!: Date;

  organization?: OrganizationEntity;
  leads?: LeadEntity[];
  events?: EventEntity[];
}

/**
 * Discovered business prospect, clinic, or target account.
 * Status: DISCOVERED → ENRICHED → SCORED → CONTACTED
 * Qualification: PENDING → QUALIFIED | DISQUALIFIED | NEEDS_MORE_DATA
 */
export class LeadEntity {
  id!: string;
  organizationId!: string;
  taskId?: string;
  name!: string;
  phone?: string;
  website?: string;
  location?: string;
  category?: string;
  score!: number; // 0 - 100
  scoreComponents?: {
    industryFit?: number;
    locationMatch?: number;
    employeeFit?: number;
    signalScore?: number;
    contactAvailability?: number;
  };
  status!: "DISCOVERED" | "ENRICHED" | "SCORED" | "CONTACTED";
  qualification!: "PENDING" | "QUALIFIED" | "DISQUALIFIED" | "NEEDS_MORE_DATA";
  hypothesis?: string;
  recommendedAction?: string;
  decisionMaker?: string;
  employeeCount?: number;
  profileJson?: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;

  organization?: OrganizationEntity;
  task?: TaskEntity;
  evidence?: EvidenceEntity[];
  calls?: CallEntity[];
}

/**
 * Atomic verified claim or observed fact supporting lead scoring and qualification.
 */
export class EvidenceEntity {
  id!: string;
  leadId!: string;
  type!: "OBSERVED" | "INFERRED" | "VERIFIED";
  claim!: string;
  source!: string;
  sourceReference?: string;
  observedAt!: Date;
  confidence?: number;

  lead?: LeadEntity;
}

/**
 * Voice outreach qualification interaction orchestrated through CALL-E.
 * Status: PENDING → IN_PROGRESS → COMPLETED | FAILED
 */
export class CallEntity {
  id!: string;
  organizationId!: string;
  leadId!: string;
  calleCallId?: string;
  idempotencyKey!: string;
  status!: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  taskJson?: Record<string, unknown>;
  briefJson?: {
    goal?: string;
    questionsToAsk?: string[];
    qualificationThresholds?: Record<string, unknown>;
  };
  duration?: number;
  startedAt?: Date;
  completedAt?: Date;
  createdAt!: Date;

  organization?: OrganizationEntity;
  lead?: LeadEntity;
  result?: CallResultEntity;
}

/**
 * Structured post-call analysis, confidence score, and qualification verdict.
 */
export class CallResultEntity {
  id!: string;
  callId!: string;
  structuredResult?: Record<string, unknown>;
  summary?: string;
  confidence?: number;
  qualifiedResult?: "QUALIFIED" | "DISQUALIFIED" | "NEEDS_FOLLOW_UP";
  createdAt!: Date;

  call?: CallEntity;
}

/**
 * Realtime telemetry and audit event stream.
 */
export class EventEntity {
  id!: string;
  organizationId!: string;
  taskId?: string;
  type!: string; // e.g. "task.planning_started", "lead.discovered", "call.completed"
  data!: Record<string, unknown>;
  createdAt!: Date;

  organization?: OrganizationEntity;
  task?: TaskEntity;
}

export class AuditLogEntity {
  id!: string;
  organizationId!: string;
  action!: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
  createdAt!: Date;

  organization?: OrganizationEntity;
}


// ─── 2. PIPELINE LIFECYCLE STAGES ───────────────────────────────────────────

/**
 * Stage 1: Document Upload & Context Ingestion
 * Handled by: POST /api/documents
 */
export class Stage1_DocumentIngestion {
  static readonly sourceRoute = "POST /api/documents";
  static readonly targetEntities = [BusinessDocumentEntity, OrganizationEntity];

  process(doc: BusinessDocumentEntity): { ingested: boolean; textLength: number } {
    return { ingested: !!doc.extractedText, textLength: doc.extractedText?.length || 0 };
  }
}

/**
 * Stage 2: Copilot Interaction & Search Strategy Synthesis
 * Handled by: POST /api/chat, POST /api/scraper-config
 */
export class Stage2_CopilotStrategySynthesis {
  static readonly sourceRoutes = ["POST /api/chat", "POST /api/scraper-config"];
  static readonly readEntities = [BusinessDocumentEntity, LeadCriteriaEntity, LeadEntity];
  static readonly writtenEntities = [BusinessProfileEntity, LeadCriteriaEntity];

  synthesize(profile: BusinessProfileEntity, criteria: LeadCriteriaEntity) {
    return { profileVersion: profile.version, criteriaReady: !!criteria.criteriaJson };
  }
}

/**
 * Stage 3: Lead Discovery & Extraction
 * Handled by: POST /api/tasks -> orchestrator.runPipeline()
 */
export class Stage3_LeadDiscovery {
  static readonly sourceRoute = "POST /api/tasks";
  static readonly transition = "CREATED -> PLANNING -> DISCOVERING";
  static readonly writtenEntities = [TaskEntity, LeadEntity, EventEntity];

  execute(task: TaskEntity, criteria: LeadCriteriaEntity): LeadEntity[] {
    return [];
  }
}

/**
 * Stage 4: Enrichment, Fact Gathering & Scoring
 * Handled by: orchestrator.runPipeline() (Enrichment -> Scoring)
 */
export class Stage4_EnrichmentAndScoring {
  static readonly transition = "DISCOVERING -> ENRICHING -> SCORING -> READY_FOR_REVIEW";
  static readonly writtenEntities = [LeadEntity, EvidenceEntity, EventEntity];

  score(lead: LeadEntity, evidenceList: EvidenceEntity[]): { score: number; status: LeadEntity["status"] } {
    return { score: lead.score, status: "SCORED" };
  }
}

/**
 * Stage 5: CALL-E Voice Qualification & Analysis
 * Handled by: POST /api/leads/[id]/call, GET /api/calls/[id]
 */
export class Stage5_VoiceQualification {
  static readonly sourceRoutes = ["POST /api/leads/[id]/call", "GET /api/calls/[id]"];
  static readonly transition = "PENDING -> IN_PROGRESS -> COMPLETED";
  static readonly writtenEntities = [CallEntity, CallResultEntity, EvidenceEntity, LeadEntity];

  evaluateCall(call: CallEntity, result: CallResultEntity): { qualified: boolean } {
    return { qualified: result.qualifiedResult === "QUALIFIED" };
  }
}

/**
 * Stage 6: Realtime Dashboard Telemetry & Event Streaming
 * Handled by: GET /api/leads, GET /api/calls, GET /api/tasks/[id]/events
 */
export class Stage6_DashboardTelemetry {
  static readonly sourceRoutes = [
    "GET /api/leads",
    "GET /api/calls",
    "GET /api/tasks/[id]/events",
    "GET /api/tasks"
  ];
  static readonly readEntities = [LeadEntity, CallEntity, EventEntity, TaskEntity];

  queryLeads(filters: { scoreMin?: number; status?: string }) {
    return { activeView: true };
  }
}


// ─── 3. SYSTEM ROUTE & TABLE INTERACTION MAP ────────────────────────────────

export interface RouteBinding {
  endpoint: string;
  httpMethod: "GET" | "POST" | "PATCH" | "DELETE";
  stage: string;
  readsTables: string[];
  writesTables: string[];
}

export const SYSTEM_ROUTE_INTERACTION_MAP: RouteBinding[] = [
  {
    endpoint: "/api/documents",
    httpMethod: "POST",
    stage: "Stage 1: Document Ingestion",
    readsTables: ["organizations"],
    writesTables: ["organizations", "business_documents"],
  },
  {
    endpoint: "/api/chat",
    httpMethod: "POST",
    stage: "Stage 2: Copilot Strategy",
    readsTables: ["leads", "lead_criteria", "tasks", "calls"],
    writesTables: ["business_profiles", "lead_criteria"],
  },
  {
    endpoint: "/api/discovery/extract-arrays",
    httpMethod: "POST",
    stage: "Stage 2: First AI Array Extraction (3 arrays: Organization Domain, client_location, keywords)",
    readsTables: ["business_documents"],
    writesTables: [],
  },
  {
    endpoint: "/api/scraper-config",
    httpMethod: "POST",
    stage: "Stage 2: Second AI Combiner & Unified Discovery MCP Store",
    readsTables: ["business_documents"],
    writesTables: ["lead_criteria"],
  },
  {
    endpoint: "/api/mcp/run",
    httpMethod: "POST",
    stage: "Stage 3: MCP Search Execution & Multi-Platform Discovery",
    readsTables: ["lead_criteria"],
    writesTables: ["leads", "evidence"],
  },
  {
    endpoint: "/api/tasks",
    httpMethod: "POST",
    stage: "Stage 3 & 4: Pipeline Orchestration",
    readsTables: ["organizations"],
    writesTables: ["organizations", "tasks", "business_profiles", "lead_criteria", "leads", "evidence", "events"],
  },
  {
    endpoint: "/api/tasks/[id]",
    httpMethod: "GET",
    stage: "Stage 3 & 4: Task Progress Monitoring",
    readsTables: ["tasks"],
    writesTables: [],
  },
  {
    endpoint: "/api/tasks/[id]/leads",
    httpMethod: "GET",
    stage: "Stage 4: Discovered Account Retrieval",
    readsTables: ["leads", "evidence"],
    writesTables: [],
  },
  {
    endpoint: "/api/leads",
    httpMethod: "GET",
    stage: "Stage 6: Realtime Lead Grid",
    readsTables: ["leads", "evidence", "calls"],
    writesTables: [],
  },
  {
    endpoint: "/api/leads/[id]/call",
    httpMethod: "POST",
    stage: "Stage 5: Voice Qualification Trigger",
    readsTables: ["leads", "lead_criteria"],
    writesTables: ["calls", "call_results", "evidence", "leads"],
  },
  {
    endpoint: "/api/calls",
    httpMethod: "GET",
    stage: "Stage 6: Call History Log",
    readsTables: ["calls", "call_results", "leads"],
    writesTables: [],
  },
  {
    endpoint: "/api/calls/[id]",
    httpMethod: "GET",
    stage: "Stage 5 & 6: Call Transcript & Result Inspection",
    readsTables: ["calls", "call_results"],
    writesTables: [],
  },
  {
    endpoint: "/api/tasks/[id]/events",
    httpMethod: "GET",
    stage: "Stage 6: Realtime SSE/Event Bus",
    readsTables: ["events"],
    writesTables: [],
  },
];
