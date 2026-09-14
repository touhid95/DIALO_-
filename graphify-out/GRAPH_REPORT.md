# Graph Report - NEW_FILE  (2026-09-14)

## Corpus Check
- 236 files · ~181,267 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 930 nodes · 1881 edges · 63 communities (40 shown, 14 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 57 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App Src Server
- App Src Server
- App Src Server
- App Package Dependencies
- App Dial Src
- App Package Devdependencies
- App Tsconfig Compileroptions
- App Src Server
- Apollo Engine Fixed
- App Src Server
- App Src Lib
- App Src Server
- Apollo Engine Fixed
- Apollo Engine Fixed
- Apollo Engine Fixed
- App Src Server
- App Src Mcp
- Apollo Engine Fixed
- App Src Server
- App Mcp Src
- Calle App Src
- Apollo Engine Fixed
- Mcp App Src
- App Src Server
- App Src Server
- App Src Session
- App Src Server
- App Src Server
- Mcp App Src
- Apollo Engine Fixed
- App Src Apollo
- App Src Lib
- App Src Server
- Apollo Engine Fixed
- App Src Server
- App Src Mcp
- App Src Chatbot
- App Src Server
- Scripts Test Api
- App Mcp Src
- App Src Layout
- App Scripts Test
- App Scripts Test
- Prisma App Seed
- App Scripts Test
- App Scripts Test
- App Scripts Test
- App Scripts Test
- App Scripts Test
- Scripts Test Live
- App Eslint Config
- App Next Config
- Config App Postcss
- App Scripts Verify

## God Nodes (most connected - your core abstractions)
1. `ApolloClient` - 50 edges
2. `ApolloConfig` - 36 edges
3. `prisma` - 23 edges
4. `McpLogger` - 20 edges
5. `OKFStore` - 20 edges
6. `delay()` - 19 edges
7. `compilerOptions` - 16 edges
8. `runTestSuite()` - 15 edges
9. `buildApolloSingleSourceOfTruth()` - 15 edges
10. `runPipeline()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `cmd_discover()` --uses--> `ApolloHttpError`  [INFERRED]
  app/apollo_engine_fixed/apollo_engine_fixed/cli_dispatch.py → app/apollo_engine_fixed/apollo_engine_fixed/apollo_client.py
- `cmd_health()` --uses--> `ApolloHttpError`  [INFERRED]
  app/apollo_engine_fixed/apollo_engine_fixed/cli_dispatch.py → app/apollo_engine_fixed/apollo_engine_fixed/apollo_client.py
- `run_lookup()` --uses--> `ApolloClient`  [INFERRED]
  app/apollo_engine_fixed/apollo_engine_fixed/lookup.py → app/apollo_engine_fixed/apollo_engine_fixed/apollo_client.py
- `search_contacts()` --uses--> `ApolloClient`  [INFERRED]
  app/apollo_engine_fixed/apollo_engine_fixed/lookup.py → app/apollo_engine_fixed/apollo_engine_fixed/apollo_client.py
- `check_phone_enrichment_status()` --uses--> `ApolloClient`  [INFERRED]
  app/apollo_engine_fixed/apollo_engine_fixed/monitor.py → app/apollo_engine_fixed/apollo_engine_fixed/apollo_client.py

## Import Cycles
- None detected.

## Communities (63 total, 14 thin omitted)

### Community 0 - "App Src Server"
Cohesion: 0.05
Nodes (25): runTest(), runValidation(), expandLocationsToDetailedMetro(), getIntelligentServiceKeywords(), POST(), dynamic, globalForPrisma, prisma (+17 more)

### Community 1 - "App Src Server"
Cohesion: 0.06
Nodes (31): ApolloSearchPayload, POST(), CallContextBundle, CallContextHooks, CallContextScores, APOLLO_CONFIG, ApolloConfig, CALL_E_CONFIG (+23 more)

### Community 2 - "App Src Server"
Cohesion: 0.07
Nodes (42): POST(), estimateDealSize(), parseSizeRange(), POST(), ScraperConfigResponse, ScraperKeywords, ScraperPlatformConfig, ScraperTargetFilter (+34 more)

### Community 3 - "App Package Dependencies"
Cohesion: 0.04
Nodes (45): dependencies, @call-e/calle, class-variance-authority, clsx, crawlee, date-fns, framer-motion, lucide-react (+37 more)

### Community 4 - "App Dial Src"
Cohesion: 0.08
Nodes (25): AboutArchitectureSection(), PIPELINE_STAGES, PipelineStage, CallModal(), CallModalProps, CallSimulationResult, CallStage, CallLogItem (+17 more)

### Community 5 - "App Package Devdependencies"
Cohesion: 0.06
Nodes (34): devDependencies, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, @types/node, @types/pdf-parse (+26 more)

### Community 6 - "App Tsconfig Compileroptions"
Cohesion: 0.07
Nodes (29): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+21 more)

### Community 7 - "App Src Server"
Cohesion: 0.11
Nodes (10): TelegramAdapter, TgUpdate, WebAdapter, WebRawPayload, TODO: resolve audio media URL before passing downstream, WaEntry, WhatsAppAdapter, ChannelAdapter (+2 more)

### Community 8 - "Apollo Engine Fixed"
Cohesion: 0.15
Nodes (24): cmd_agent(), cmd_discover(), cmd_health(), cmd_poll(), cmd_show(), cmd_status(), cmd_webhook(), print_record() (+16 more)

### Community 9 - "App Src Server"
Cohesion: 0.07
Nodes (21): AuditLogEntity, BusinessDocumentEntity, BusinessProfileEntity, CallEntity, CallResultEntity, EventEntity, EvidenceEntity, LeadCriteriaEntity (+13 more)

### Community 10 - "App Src Lib"
Cohesion: 0.09
Nodes (24): ApiResponse, BusinessProfile, BusinessProfileSchema, CallBriefSchema, CallStructuredResult, CallStructuredResultSchema, CallSynthesis, CallSynthesisSchema (+16 more)

### Community 11 - "App Src Server"
Cohesion: 0.12
Nodes (17): CallBrief, EvidenceItem, LeadDiscoveryProvider, LeadEnrichment, LeadEnrichmentProvider, RawLead, SearchCriteria, delay() (+9 more)

### Community 12 - "Apollo Engine Fixed"
Cohesion: 0.19
Nodes (15): ApolloClient, ApolloHttpError, Thin HTTP transport for the Apollo.io v1 API. Uses the `x-api-key` header…, activate, cmd_poll depends on get() returning a parsed dict even on 4xx so it can check…, test_api_key_mirrored_into_body_and_header(), test_get_falls_back_to_text_for_non_json_error_body(), test_get_parses_json_body_on_error_status() (+7 more)

### Community 13 - "Apollo Engine Fixed"
Cohesion: 0.24
Nodes (22): ApolloConfig, activate, test_discover_blocks_on_placeholder_webhook_url(), test_discover_blocks_without_api_key(), test_full_discover_flow_harvests_and_dispatches(), activate, record(), test_build_agent_payload_filters_falsy_contact_ids() (+14 more)

### Community 14 - "Apollo Engine Fixed"
Cohesion: 0.17
Nodes (22): check_phone_enrichment_status(), EnrichmentStatus, extract_webhook_payload(), fetch_webhook_result_show(), normalize_phones(), parse_enrichment_status(), poll_enrichment_statuses(), ApolloConfig (+14 more)

### Community 15 - "App Src Server"
Cohesion: 0.23
Nodes (19): runTestSuite(), CreateTaskSchema, POST(), briefToCalleTask(), generateCallBrief(), generateResultSchema(), createDiscoveryProvider(), createEnrichmentProvider() (+11 more)

### Community 16 - "App Src Mcp"
Cohesion: 0.14
Nodes (11): main(), POST(), crawleeConfig, CrawleeSearchAdapter, cleanBusinessName(), DomainSearchResult, extractEmailsFromText(), extractPhonesFromText() (+3 more)

### Community 17 - "Apollo Engine Fixed"
Cohesion: 0.23
Nodes (18): Apollo.io API v1 endpoint catalogue. The alternative extraction engine is built…, build_contacts_payload(), contact_matches_client_filters(), filter_by_phone_flag(), filter_targets(), has_direct_phone_yes(), normalize_contact(), ApolloConfig (+10 more)

### Community 18 - "App Src Server"
Cohesion: 0.16
Nodes (12): CreateCallInput, PhoneAgent, PhoneCallResult, buildCalleTaskPrompt(), callLeadWithCalle(), CallOptions, CallResult, getCalleResultSchema() (+4 more)

### Community 19 - "App Mcp Src"
Cohesion: 0.17
Nodes (15): ContactCandidate, resolveAccurateContact(), ResolveContactInput, ResolvedContact, verifyEmail(), ScoredResult, ScoringContext, OKFScores (+7 more)

### Community 20 - "Calle App Src"
Cohesion: 0.11
Nodes (9): @call-e/calle, CallCreateInput, CallCreateOptions, CallE, CallEConfig, CallObject, GoalObject, GoalRunInput (+1 more)

### Community 21 - "Apollo Engine Fixed"
Cohesion: 0.21
Nodes (12): FakeHandler, test_handle_payload_empty_people_list(), test_handle_payload_writes_jsonl(), test_is_authorized_checks_fallback_header(), test_is_authorized_checks_signature_header(), test_is_authorized_no_secret_configured_allows_all(), test_is_authorized_rejects_missing_header_when_secret_required(), ApolloWebhookHandler (+4 more)

### Community 22 - "Mcp App Src"
Cohesion: 0.19
Nodes (6): RawImportedLead, McpJobStatus, McpOrchestrator, McpRunOptions, scoreLead(), DomainSearchQuery

### Community 23 - "App Src Server"
Cohesion: 0.24
Nodes (9): runQA(), CalleGoalDispatcher, ensureDir(), listOKFDossiers(), OKF_DIR, readOKFMarkdown(), saveOKFMarkdown(), serializeOKFToMarkdown() (+1 more)

### Community 24 - "App Src Server"
Cohesion: 0.22
Nodes (12): webAdapter, callLLM(), fallbackGrillingResponse(), OrchestratorMessage, runGrillingTurn(), extractThinking(), loadSession(), GrillingResult (+4 more)

### Community 25 - "App Src Session"
Cohesion: 0.27
Nodes (13): POST(), GET(), appendTurn(), ensureSessionsDir(), formatTurnMarkdown(), g, getOrCreateSessionId(), listSessionIds() (+5 more)

### Community 26 - "App Src Server"
Cohesion: 0.21
Nodes (12): POST(), UPLOAD_DIR, cleanExtractedText(), extractPdfText(), extractTextFromPdfRaw(), unescapePdfString(), describeImage(), extractDocumentText() (+4 more)

### Community 27 - "App Src Server"
Cohesion: 0.19
Nodes (9): ChunkStore, chunkText(), cosineSimilarity(), embed(), g, STOP_WORDS, StoredChunk, tokenize() (+1 more)

### Community 29 - "Apollo Engine Fixed"
Cohesion: 0.23
Nodes (9): _bool_env(), _list_env(), load_config(), Configuration for the alternative Apollo extraction engine. TRIGGER_MODE…, make_cfg(), activate, Synthetic scenario: Apollo returns a 404 'result_pending' JSON body twice, then…, test_poll_should_wait_through_pending_then_resolve() (+1 more)

### Community 30 - "App Src Apollo"
Cohesion: 0.24
Nodes (3): ApolloContactSearchResult, ApolloSearchResponse, ApolloService

### Community 32 - "App Src Server"
Cohesion: 0.31
Nodes (10): LeadScore, ScoreComponents, generateHypothesis(), scoreBusinessQuality(), scoreContactability(), scoreIcpFit(), scoreIntent(), scoreLead() (+2 more)

### Community 33 - "Apollo Engine Fixed"
Cohesion: 0.33
Nodes (9): ContactRecord, write_phones() is called once per completed person/request across discover(),…, BUG: write_targets() used to call record.get("person_id") etc, but the only…, Each discover() run reflects a fresh Step-1 result, so a full overwrite (not…, reload_store(), test_append_jsonl_actually_appends(), test_write_phones_called_twice_accumulates_both_batches(), test_write_targets_accepts_contact_record_objects() (+1 more)

### Community 34 - "App Src Server"
Cohesion: 0.25
Nodes (5): dynamic, WSEvent, EventHandler, subscribe(), subscribers

### Community 35 - "App Src Mcp"
Cohesion: 0.39
Nodes (7): POST(), extractValue(), findMatchingKey(), ImportResult, normalizeRows(), parseEmployeeCount(), parseUploadedFile()

### Community 36 - "App Src Chatbot"
Cohesion: 0.57
Nodes (5): GET(), POST(), getAdapter(), listChannels(), registry

### Community 37 - "App Src Server"
Cohesion: 0.52
Nodes (5): format(), formatAll(), formatForTelegram(), formatForWeb(), formatForWhatsApp()

### Community 38 - "Scripts Test Api"
Cohesion: 0.48
Nodes (6): envPath, run(), testApollo(), testCalleSdk(), testSerperPlaces(), testSerperSearch()

### Community 40 - "App Src Layout"
Cohesion: 0.40
Nodes (3): inter, metadata, Providers()

### Community 41 - "App Scripts Test"
Cohesion: 0.70
Nodes (4): run(), testApolloContacts(), testApolloMixedPeople(), testSerperPlaces()

### Community 42 - "App Scripts Test"
Cohesion: 0.83
Nodes (3): fetchUrl(), run(), unwrapBingUrl()

## Knowledge Gaps
- **205 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+200 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 343 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `prisma` connect `App Src Server` to `App Src Server`, `App Src Server`, `App Src Server`, `App Src Mcp`, `App Src Server`, `App Src Server`, `App Src Server`, `App Src Lib`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `McpLogger` connect `Mcp App Src` to `App Src Server`, `App Src Server`, `App Src Server`, `App Src Server`, `App Src Mcp`, `Mcp App Src`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `OKFStore` connect `App Src Server` to `App Src Server`, `App Src Server`, `App Src Server`, `App Mcp Src`, `Mcp App Src`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `ApolloClient` (e.g. with `run_lookup()` and `search_contacts()`) actually correct?**
  _`ApolloClient` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 21 inferred relationships involving `ApolloConfig` (e.g. with `build_contacts_payload()` and `contact_matches_client_filters()`) actually correct?**
  _`ApolloConfig` has 21 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _205 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Src Server` be split into smaller, more focused modules?**
  _Cohesion score 0.05499735589635114 - nodes in this community are weakly interconnected._