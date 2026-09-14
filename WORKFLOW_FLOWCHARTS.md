# Visual System Flowcharts — Architecture & Orchestration

This document provides visual flowcharts mapping the system lifecycle, decision branches, database state transitions, and API routing.

---

## 1. Master End-to-End Orchestration Flowchart

```mermaid
flowchart TD
    classDef userAction fill:#2563eb,stroke:#1d4ed8,color:#ffffff,stroke-width:2px;
    classDef apiRoute fill:#0284c7,stroke:#0369a1,color:#ffffff,stroke-width:2px;
    classDef engine fill:#7c3aed,stroke:#6d28d9,color:#ffffff,stroke-width:2px;
    classDef db fill:#059669,stroke:#047857,color:#ffffff,stroke-width:2px;
    classDef decision fill:#d97706,stroke:#b45309,color:#ffffff,stroke-width:2px;

    %% STAGE 1
    Start([User starts in Dashboard]):::userAction --> Upload[Upload Pitch Deck / Spec]:::userAction
    Upload --> DocRoute[POST /api/documents]:::apiRoute
    DocRoute --> Extractor[mammoth / pdf-parse]:::engine
    Extractor --> DB_Doc[(business_documents)]:::db

    %% STAGE 2
    DB_Doc --> CopilotIntake[Copilot Chat: Input ICP & 3 Questions]:::userAction
    CopilotIntake --> ConfigRoute[POST /api/scraper-config]:::apiRoute
    ConfigRoute --> LLM_Synth[LLM Keyword Synthesis Engine]:::engine
    LLM_Synth --> DB_Criteria[(lead_criteria & business_profiles)]:::db

    %% STAGE 3 — DUAL PATH: DORMANT FALLBACK SCRAPING vs ACTIVE MCP APOLLO SSoT
    DB_Criteria --> MCP_Hub[MCP Convergence Hub: apollo-adapter]:::engine
    MCP_Hub --> ApolloSSoT[Apollo API Input: Single Source of Truth]:::engine
    ApolloSSoT --> ApolloSearch[Apollo API: Mixed People / Company Search]:::engine

    subgraph Discovery_Phase [Discovery Engine Fallback Chain — STATUS: DORMANT / BYPASSED]
        Orchestrator[Orchestrator: runPipeline]:::engine
        Orchestrator -.->|Dormant / Inactive| TryNominatim[1. Nominatim OpenStreetMap]:::engine
        TryNominatim -.-> CheckResults{Found Leads?}:::decision
        CheckResults -.->|Yes| Harvested[Extract Business Name, Phone, Address]:::engine
        CheckResults -.->|No / Low| TryCrawlee[2. Crawlee Directory Scraper]:::engine
        TryCrawlee -.-> CheckCrawlee{Anti-Bot / Blocked?}:::decision
        CheckCrawlee -.->|Yes| TryChrome[3. Stealth Headless Chromium]:::engine
        CheckCrawlee -.->|No| Harvested
        TryChrome -.-> Harvested
    end

    ApolloSearch --> DB_LeadsInit[(leads: status = DISCOVERED)]:::db

    %% STAGE 4
    subgraph Enrichment_Scoring [Enrichment & Multi-Factor Scoring]
        DB_LeadsInit --> Enricher[Domain Metadata & Signal Gathering]:::engine
        Enricher --> DB_Evidence[(evidence: type = OBSERVED)]:::db
        DB_Evidence --> ScoringEngine[Scoring Engine: Industry, Geo, Size, Phone, Signals]:::engine
        ScoringEngine --> ScoreDecision{Score >= 60?}:::decision
        ScoreDecision -- Yes --> MarkQual[(leads: SCORED, QUALIFIED)]:::db
        ScoreDecision -- No (40-59) --> MarkReview[(leads: SCORED, NEEDS_MORE_DATA)]:::db
        ScoreDecision -- No (< 40) --> MarkDisqual[(leads: SCORED, DISQUALIFIED)]:::db
    end

    MarkQual --> TaskReady[(tasks: status = READY_FOR_REVIEW)]:::db

    %% STAGE 5
    TaskReady --> UserTriggerCall[User triggers call or Auto-Queue]:::userAction
    UserTriggerCall --> CallRoute[POST /api/leads/:id/call]:::apiRoute
    CallRoute --> BriefGen[Call Brief Synthesizer: 3 Target Questions]:::engine
    BriefGen --> DB_CallInit[(calls: status = PENDING -> IN_PROGRESS)]:::db

    subgraph Voice_Execution [CALL-E Voice Execution]
        DB_CallInit --> Dispatcher[CALL-E Dispatcher: Synthetic Simulator or Live API]:::engine
        Dispatcher --> CallConducted[Phone Call Conducted with Receptionist]:::engine
        CallConducted --> TranscriptAnalysis[Synthesize Outcomes & Confidence]:::engine
    end

    TranscriptAnalysis --> DB_CallResult[(call_results)]:::db
    TranscriptAnalysis --> DB_EvidenceCall[(evidence: type = VERIFIED)]:::db
    TranscriptAnalysis --> CallVerdict{Outcome Qualified?}:::decision
    CallVerdict -- Yes --> LeadWon[(leads: status = CONTACTED, QUALIFIED)]:::db
    CallVerdict -- No --> LeadLost[(leads: status = CONTACTED, DISQUALIFIED)]:::db

    LeadWon --> DB_CallDone[(calls: status = COMPLETED)]:::db
    LeadLost --> DB_CallDone

    %% STAGE 6
    DB_CallDone --> Telemetry[Realtime Dashboard Polling: GET /api/leads & /api/calls]:::apiRoute
    Telemetry --> UI_Update([Live Dashboard Grid Updated]):::userAction
```

---

## 2. Database State Machine Flowchart

```mermaid
stateDiagram-v2
    [*] --> TaskCreated: POST /api/tasks

    state "Task: CREATED" as TaskCreated
    state "Task: PLANNING" as TaskPlanning
    state "Task: DISCOVERING" as TaskDiscovering
    state "Task: ENRICHING" as TaskEnriching
    state "Task: SCORING" as TaskScoring
    state "Task: READY_FOR_REVIEW" as TaskReview
    state "Task: FAILED" as TaskFailed

    TaskCreated --> TaskPlanning: Extract profile & questionnaire
    TaskPlanning --> TaskDiscovering: Criteria compiled
    TaskDiscovering --> TaskEnriching: Raw accounts harvested
    TaskEnriching --> TaskScoring: Domain facts gathered
    TaskScoring --> TaskReview: 0-100 score computed
    TaskDiscovering --> TaskFailed: Network / Timeout error
    TaskPlanning --> TaskFailed: Invalid prompt goal

    state "Lead: DISCOVERED" as LeadDiscovered
    state "Lead: ENRICHED" as LeadEnriched
    state "Lead: SCORED" as LeadScored
    state "Lead: CONTACTED" as LeadContacted

    TaskDiscovering --> LeadDiscovered: Insert into leads
    TaskEnriching --> LeadEnriched: Attach observed evidence
    TaskScoring --> LeadScored: Attach score components

    state "Call: PENDING" as CallPending
    state "Call: IN_PROGRESS" as CallInProgress
    state "Call: COMPLETED" as CallCompleted
    state "Call: FAILED" as CallFailed

    LeadScored --> CallPending: User clicks Call Lead
    CallPending --> CallInProgress: Dialing destination phone
    CallInProgress --> CallCompleted: Analysis saved & verified evidence added
    CallInProgress --> CallFailed: Busy / Unreachable / Dropped
    CallCompleted --> LeadContacted: Update qualification verdict
```

---

## 3. Data Flow & Routing Interaction Matrix

```mermaid
flowchart LR
    subgraph Client [Frontend UI]
        U1[Upload Modal]
        U2[Chat Panel]
        U3[Task Trigger]
        U4[Lead Table]
        U5[Call Trigger]
    end

    subgraph API [API Endpoints]
        R1["POST /api/documents"]
        R2["POST /api/chat"]
        R3["POST /api/scraper-config"]
        R4["POST /api/tasks"]
        R5["GET /api/leads"]
        R6["POST /api/leads/:id/call"]
        R7["GET /api/calls"]
    end

    subgraph DB [Database Tables]
        T_Doc[(business_documents)]
        T_Prof[(business_profiles)]
        T_Crit[(lead_criteria)]
        T_Task[(tasks)]
        T_Lead[(leads)]
        T_Evid[(evidence)]
        T_Call[(calls)]
        T_Res[(call_results)]
    end

    U1 --> R1 --> T_Doc
    U2 --> R2 --> T_Prof & T_Crit
    U2 --> R3 --> T_Crit
    U3 --> R4 --> T_Task & T_Lead & T_Evid
    U4 --> R5
    T_Lead & T_Evid -.-> R5
    U5 --> R6 --> T_Call & T_Res & T_Evid & T_Lead
    T_Call & T_Res -.-> R7
```

---

## 5. MCP Layer Database Architecture & Schema Unification Flowchart

This section illustrates the **MCP Layer** storage architecture, bridging the first LLM 3-array extraction with the user's chatbot questionnaire metrics, storing data into `unifiedMCPStore` and SQLite via Prisma without triggering automated searches.

### A. Two-Stage MCP Schema Unification Flowchart

```mermaid
flowchart TD
    classDef aiCall fill:#4f46e5,stroke:#4338ca,color:#ffffff,stroke-width:2px;
    classDef userUI fill:#2563eb,stroke:#1d4ed8,color:#ffffff,stroke-width:2px;
    classDef mcpStore fill:#059669,stroke:#047857,color:#ffffff,stroke-width:2px;
    classDef sqliteDB fill:#0891b2,stroke:#0e7490,color:#ffffff,stroke-width:2px;

    %% STAGE 1: First AI Call
    subgraph Stage1 ["Stage 1: First AI Call (3 Strict Arrays)"]
        Transcript["Chat History & Business Context"] --> ExtractAPI["POST /api/discovery/extract-arrays<br/>(generateDirectJSON: maxTokens 2048)"]:::aiCall
        ExtractAPI --> OutArrays["Extracted 3 Arrays:<br/>1. organization_domain (4-6 Verified Directory Domains)<br/>2. client_location (20 Granular Sub-Locations)<br/>3. keywords (10-15 Intelligent Commercial Phrases)"]:::aiCall
    end

    %% STAGE 2: Chatbot Questionnaire
    subgraph Stage2 ["Stage 2: Chatbot Interface Questions"]
        UserAnswers["User Answers in Interactive Cards"]:::userUI --> UserMetrics["Questionnaire Metrics:<br/>• Target Industry (e.g. Dental & Healthcare)<br/>• Target Company Size (e.g. 20-40 employees)<br/>• Pricing / Deal Size (e.g. $500–$2,000/mo)<br/>• Outreach Goal (e.g. Inbound Qualification)"]:::userUI
    end

    %% STAGE 3: Second AI Combiner & MCP Layer Storage
    subgraph Stage3 ["Stage 3: Second AI Combiner & MCP Layer Storage"]
        OutArrays --> CombinerAPI["POST /api/scraper-config<br/>(Second AI Combiner)"]:::aiCall
        UserMetrics --> CombinerAPI
        CombinerAPI --> Synthesis["Synthesize Multi-Platform Booleans:<br/>• Google Search Boolean<br/>• LinkedIn Sales Navigator<br/>• YellowPages Directory Query"]:::aiCall
        Synthesis --> MCPRecord["Create UnifiedDiscoveryRecord<br/>(ID: unified-timestamp-hash)"]:::mcpStore
        MCPRecord --> MCPMemory["MCP Layer: unifiedMCPStore<br/>(In-Memory Map)"]:::mcpStore
        MCPRecord --> SQLite_Crit[(Prisma: LeadCriteria Table<br/>criteriaJson = UnifiedDiscoveryRecord)]:::sqliteDB
    end

    %% CONFIRMATION
    SQLite_Crit --> StoredConfirm["✓ Stored in MCP Layer & Database<br/>(No External Search or Apollo Committed)"]:::mcpStore
```

---

### B. MCP Layer Database Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    UnifiedDiscoveryRecord ||--o{ LeadCriteria : "persists to"
    UnifiedDiscoveryRecord ||--o{ OKFRecord : "referenced by unifiedDiscoveryId"
    OKFRecord ||--|| Lead : "persists to profileJson"
    Lead ||--o{ Evidence : "has citations"
    Lead ||--o{ Call : "has call logs"
    Call ||--|| CallResult : "evaluates to"

    UnifiedDiscoveryRecord {
        string id PK "unified-timestamp-hash"
        string organizationId FK
        string generatedAt "ISO timestamp"
        string status "synthesized | draft"
        json llmArrays "3 Arrays: domains, 20 locations, keywords"
        json userMetrics "4 Metrics: industry, size, pricing, focus"
        json compiledQueries "google, linkedin, yellowpages"
        json decisionMakerTitles "string[]"
        json positiveSignals "string[]"
        json negativeSignals "string[]"
    }

    LeadCriteria {
        string id PK "UUID"
        string organizationId FK
        json criteriaJson "UnifiedDiscoveryRecord payload"
        int version "1"
        datetime createdAt
    }

    OKFRecord {
        string id PK "UUID"
        string unifiedDiscoveryId FK "Points to UnifiedDiscoveryRecord"
        json discoverySpec "7 combined metrics copy"
        json identity "name, website, tradingName"
        json contact "phoneE164, email, decisionMaker"
        json firmographics "industry, employeeCount, location"
        json scores "total, phoneScore, callReadiness"
        json ai "hypothesis, recommendedAction, tags"
        json evidence "claims, sources, confidence"
    }

    Lead {
        string id PK "UUID"
        string organizationId FK
        string name
        string phone
        string website
        string location
        string category
        int score
        string status "DISCOVERED | SCORED | CONTACTED"
        string qualification "QUALIFIED | NEEDS_MORE_DATA | DISQUALIFIED"
        json profileJson "Full OKFRecord envelope"
        datetime createdAt
        datetime updatedAt
    }

    Evidence {
        string id PK "UUID"
        string leadId FK
        string type "OBSERVED | VERIFIED | INFERRED"
        string claim
        string source
        float confidence
    }

    Call {
        string id PK "UUID"
        string leadId FK
        string status "PENDING | IN_PROGRESS | COMPLETED"
        string targetPhone
    }

    CallResult {
        string id PK "UUID"
        string callId FK
        string qualifiedResult "QUALIFIED | DISQUALIFIED"
        string summary
    }
```

---

### C. Storage-Only Policy vs. Optional Discovery

```mermaid
flowchart LR
    classDef action fill:#2563eb,stroke:#1d4ed8,color:#ffffff,stroke-width:2px;
    classDef store fill:#059669,stroke:#047857,color:#ffffff,stroke-width:2px;
    classDef opt fill:#d97706,stroke:#b45309,color:#ffffff,stroke-width:2px;

    UserClick["User clicks 'Synthesize & Store in MCP Layer'"]:::action --> SaveOnly["1. Combine Inputs<br/>2. Store in unifiedMCPStore<br/>3. Sync to SQLite LeadCriteria"]:::store
    SaveOnly --> Stop["STOP & CONFIRM:<br/>Data safely stored.<br/>Zero searches executed."]:::store
    Stop -. Optional User Action .-> ManualRun["User explicitly clicks<br/>'Run Discovery Pipeline'<br/>(POST /api/mcp/run)"]:::opt
    ManualRun --> PopulateLeads["Populates Leads with discoverySpec<br/>in OKFStore and Lead table"]:::action
```

---

## 6. MCP Layer Single Source of Truth for Apollo API Input

### A. Data Interaction Architecture inside the MCP Layer

All data streams converge inside the MCP Layer (`unifiedMCPStore`, `okfStore`, and Prisma database) to form the unified **Single Source of Truth** for Apollo API search and contact enrichment:

```mermaid
flowchart TD
    classDef input fill:#3b82f6,stroke:#1d4ed8,color:#ffffff,stroke-width:2px;
    classDef mcp fill:#6366f1,stroke:#4338ca,color:#ffffff,stroke-width:2px;
    classDef dormant fill:#64748b,stroke:#475569,color:#ffffff,stroke-dasharray: 4 4;
    classDef apollo fill:#059669,stroke:#047857,color:#ffffff,stroke-width:2px;

    subgraph External_Inputs [External Data Streams]
        UploadLeads["User Uploaded Leads<br/>(CSV / XLSX / JSON)"]:::input
        UploadDocs["User Uploaded Documents<br/>(PDF / DOCX / TXT)"]:::input
        FirstLLM["First LLM Call (3 Arrays)<br/>• Verified Domains<br/>• 20 Granular Sub-Locations<br/>• Commercial Keywords"]:::input
        IntakeQuestions["Chatbot Interface Questionnaire<br/>• Target Industry<br/>• Target Company Size<br/>• Deal Size / Pricing<br/>• Outreach Goal"]:::input
    end

    subgraph MCP_Core [MCP Layer Convergence Hub - Happenings Happen Here]
        UploadLeads --> OKF_Data["okfStore & Lead Records"]:::mcp
        UploadDocs --> Doc_Data["prisma.businessDocument"]:::mcp
        FirstLLM --> Unified_Data["unifiedMCPStore"]:::mcp
        IntakeQuestions --> Unified_Data

        OKF_Data <-->|"Cross-Correlate Existing Domains & Missing Phone Contacts"| MCP_Bridge["MCP Apollo Bridge Engine<br/>(apollo-adapter.ts)"]:::mcp
        Doc_Data <-->|"Extract Domain Vocabulary"| MCP_Bridge
        Unified_Data <-->|"Supply Arrays & Normalized Metrics"| MCP_Bridge

        MCP_Bridge --> ApolloSSoT["Apollo API Input Specification<br/>(Single Source of Truth)"]:::mcp
    end

    subgraph Dormant_Fallback [Discovery Engine Fallback — DORMANT]
        DormantScraper["Nominatim $\\rightarrow$ Crawlee $\\rightarrow$ Chromium<br/>STATUS: DORMANT / BYPASSED<br/>(Web crawling inactive for now)"]:::dormant
    end

    subgraph Apollo_Endpoints [Apollo API Direct Ingestion]
        ApolloSSoT -->|"Search Payload"| ApolloMixedSearch["POST /v1/mixed_people/search<br/>• Domains (LLM + Uploads)<br/>• 20 Granular Locations<br/>• Keyword Tags<br/>• Employee Bands"]:::apollo
        ApolloSSoT -->|"Enrichment Payload"| ApolloPeopleMatch["POST /v1/people/match<br/>• Uploaded Leads Needing Phones<br/>• Waterfall Phone Reveal"]:::apollo
    end
```

### B. Single Source of Truth Payload Structure

```json
{
  "generatedAt": "2026-09-13T02:35:00.000Z",
  "source": "mcp_unified_layer",
  "status": "ready",
  "discoveryEngineStatus": "DORMANT",
  "searchPayload": {
    "q_organization_domains_list": [
      "healthgrades.com",
      "zocdoc.com",
      "ada.org",
      "austindentalcare.com"
    ],
    "person_locations": [
      "Austin, Texas, United States",
      "Round Rock, Texas, United States",
      "Cedar Park, Texas, United States",
      "Pflugerville, Texas, United States",
      "Georgetown, Texas, United States",
      "West Lake Hills, Texas, United States",
      "Lakeway, Texas, United States",
      "Leander, Texas, United States",
      "Bee Cave, Texas, United States",
      "Buda, Texas, United States",
      "Kyle, Texas, United States",
      "San Marcos, Texas, United States",
      "Dripping Springs, Texas, United States",
      "Bastrop, Texas, United States",
      "Travis County, Texas, United States",
      "Williamson County, Texas, United States",
      "Hays County, Texas, United States"
    ],
    "q_organization_keyword_tags": [
      "Dentist",
      "Dental Clinic",
      "Orthodontics",
      "Dental & Healthcare Clinics",
      "CALL-E Phone Qualification"
    ],
    "organization_num_employees_ranges": [
      "11,20",
      "21,50"
    ],
    "person_titles": [
      "Owner",
      "CEO",
      "Founder",
      "Practice Manager",
      "Managing Partner",
      "Clinical Director",
      "Operations Manager"
    ],
    "q_keywords": "Dental & Healthcare Clinics Dentist Dental Clinic",
    "page": 1,
    "per_page": 25
  },
  "enrichmentPayload": {
    "recordsToMatch": [
      {
        "organization_name": "Austin Dental Arts",
        "domain": "austindentalarts.com",
        "source": "user_upload"
      }
    ],
    "reveal_phone_number": true,
    "run_waterfall_phone": true,
    "webhook_url": "http://localhost:3000/api/apollo/webhook"
  },
  "stats": {
    "totalTargetDomains": 4,
    "totalTargetLocations": 17,
    "totalKeywords": 5,
    "uploadedLeadsReferenced": 190,
    "uploadedDocsReferenced": 1
  }
}
```

