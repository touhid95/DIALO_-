# Graph Report - NEW_FILE  (2026-09-13)

## Corpus Check
- Large corpus: 502 files · ~408,471 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 4521 nodes · 8865 edges · 245 communities (179 shown, 44 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 469 edges (avg confidence: 0.94)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Spiders Test Session
- Spiders Templates Test
- Test Spiders Tests
- Parser Core Custom
- Scheduler Test Spiders
- Parser Selector Test
- Checkpoint Test Spiders
- Spider Spiders Test
- Test Spiders Robotstxt
- Test Tests Mcp
- Fetchers Test Requests
- Proxy Test Rotation
- Engines Browsers Base
- Shell Cli Test
- Test Request Tests
- Parser Shell Core
- Page Test Engines
- Test Tests Mcp
- Apollo Api Testing
- Test Attributes Tests
- Apollo Engine Fixed
- Test Tests Fetchers
- Core Test Tests
- Websearch Test Tests
- Apollo Engine Fixed
- Test Spiders Throttle
- Test Checkpoint Force
- Test Spiders Result
- Stealth Fetchers Test
- Engines Toolbelt Convertor
- Test Tests Spiders
- Test Session Tests
- Sitemap Spiders Test
- App Src Components
- Core Mcpserver Fetch
- Apollo Engine Fixed
- Apollo Engine Fixed
- App Tsconfig Compileroptions
- Core Translator Xpath
- Test Tests Fetchers
- App Src Server
- Integrations Scra Tests
- Spiders Test Result
- App Src Mcp
- App Src Server
- Test Tests Spiders
- App Src Mcp
- App Src Lib
- Spider Spiders Test
- Lookup Apollo Api
- Proxy Rotation Test
- Test Engine Tests
- Test Feed Tests
- App Package Devdependencies
- App Src Mcp
- Trigger Apollo Api
- Test Async Dynamic
- Test Tests Fetchers
- Test Async Tests
- Apollo Engine Fixed
- App Src Server
- Api Testing Apollo
- Engines Static Asyncsessionlogic
- Cache Spiders Test
- Test Response Handling
- Parser Test Advanced
- App Src Server
- Test Session Async
- Test Tests Fetchers
- App Mcp Src
- Test Tests Fetchers
- Test Tests Mcp
- App Package Dependencies
- Test Tests Fetchers
- Test Tests Fetchers
- Test Tests Spiders
- Core Mcpserver Session
- App Src Server
- Engines Browsers Base
- Test List Tests
- Utils Core Spider
- Cli Test Tests
- Shell Test Core
- Result Test Spiders
- Spiders Templates Feed
- Test Tests Spiders
- Test Tests Spiders
- Mcp App Src
- Calle App Src
- Core Test Storage
- Test Tests Fetchers
- Test Impersonate List
- App Src Server
- App Src Server
- Engines Static Configurationlogic
- Apollo Api Testing
- Core Storage Test
- Cli Test Tests
- Test Tests Fetchers
- Test Page Tests
- Engines Browsers Controllers
- Spiders Result Itemlist
- Test Tests Fetchers
- Test Args Tests
- Test Tests Parser
- Test Spider Tests
- App Src Api
- App Src Server
- App Src Session
- App Src Server
- App Src Server
- App Src Server
- Test Tests Mcp
- Core Storage Test
- Parser Selector Css
- Test Filter Selectors
- Cli Test Tests
- Test Tests Mcp
- Test Tests Fetchers
- Tests Spiders Test
- Test Tests Spiders
- Mcp App Src
- Cli Http Options
- Engines Browsers Base
- Benchmarks Test Bs4
- Core Mixins Selectorsgeneration
- Test Tests Mcp
- Test Ancestor Tests
- Test Find Similar
- Test Spiders Engine
- Test Spiders Throttle
- Server Repository Description
- Test Tests Mcp
- Test Tests Fetchers
- Test Tests Fetchers
- Test Tests Parser
- Test Tests Spiders
- Test Tests Spiders
- App Package Scripts
- App Src Lib
- Cli Test Tests
- Test Tests Mcp
- Test Tests Spiders
- App Src Server
- Core Mcpserver Basemodel
- Test Tests Mcp
- Core Storage Sqlitestoragesystem
- Core Test Storage
- Request Spiders Convert
- Test Tests Parser
- Test Tests Parser
- Parser Test Tests
- Cli Test Tests
- Spiders Templates Shopify
- Spiders Templates Site
- Test Tests Fetchers
- Test Impersonate List
- Test Response Markdown
- Test Tests Spiders
- App Src Chatbot
- App Src Server
- Test Tests Parser
- Test Tests Parser
- Tests Spiders Test
- App Src Layout
- Core Test Tests
- Test Tests Fetchers
- Parser Test Tests
- Test Tests Spiders
- Test Tests Spiders
- Test Engines Toolbelt
- Webhook Api Testing
- Config Apollo Api
- Utils Core Storagetools
- Engines Toolbelt Custom
- Parser Selector Getall
- Tests Fetchers Test
- Test Tests Fetchers
- Test Tests Parser
- Test Tests Parser
- Test Tests Parser
- Test Tests Parser
- Test Tests Parser
- Test Tests Spiders
- Test Tests Spiders
- App Scripts Test
- Apollo Api Testing
- Tests Parser Test
- Tests Parser Test
- Test Tests Spiders
- Test Tests Spiders
- Apollo Engine Fixed
- Prisma App Seed
- App Scripts Test
- App Scripts Test
- App Scripts Test
- Apollo Api Testing
- Test Tests Parser
- Scripts Test Live
- Apollo Engine Fixed
- App Eslint Config
- App Next Config
- Clsx App Package
- App Package Mammoth
- Next App Package
- Prisma Client App
- Puppeteer Core App
- Puppeteer Extra App
- React Dom App
- Tanstack React Query
- Uuid App Package
- App Package Dependencies
- Zod App Package
- Config App Postcss
- Apollo Api Testing
- Engines Toolbelt Dos
- Integrations Init
- Spiders Engine Crawlerengine
- Tests Init
- Test Spider Tests
- Test Spider Tests
- Test Spider Tests
- Pkg

## God Nodes (most connected - your core abstractions)
1. `Selector` - 150 edges
2. `Request` - 144 edges
3. `Response` - 112 edges
4. `SessionManager` - 85 edges
5. `LinkExtractor` - 74 edges
6. `TextHandler` - 71 edges
7. `ApolloClient` - 69 edges
8. `_make_engine()` - 67 edges
9. `ApolloConfig` - 65 edges
10. `ScraplingMCPServer` - 65 edges

## Surprising Connections (you probably didn't know these)
- `cmd_discover()` --uses--> `ApolloHttpError`  [INFERRED]
  app/apollo_engine_fixed/apollo_engine_fixed/cli_dispatch.py → Scrapling-main/Apollo_api_testing/apollo_client.py
- `cmd_agent()` --uses--> `ApolloClient`  [INFERRED]
  app/apollo_engine_fixed/apollo_engine_fixed/cli_dispatch.py → Scrapling-main/Apollo_api_testing/apollo_client.py
- `cmd_discover()` --uses--> `ApolloClient`  [INFERRED]
  app/apollo_engine_fixed/apollo_engine_fixed/cli_dispatch.py → Scrapling-main/Apollo_api_testing/apollo_client.py
- `cmd_poll()` --uses--> `ApolloClient`  [INFERRED]
  app/apollo_engine_fixed/apollo_engine_fixed/cli_dispatch.py → Scrapling-main/Apollo_api_testing/apollo_client.py
- `cmd_show()` --uses--> `ApolloClient`  [INFERRED]
  app/apollo_engine_fixed/apollo_engine_fixed/cli_dispatch.py → Scrapling-main/Apollo_api_testing/apollo_client.py

## Import Cycles
- 3-file cycle: `Scrapling-main/Scrapling-main/scrapling/spiders/request.py -> Scrapling-main/Scrapling-main/scrapling/spiders/spider.py -> Scrapling-main/Scrapling-main/scrapling/spiders/session.py -> Scrapling-main/Scrapling-main/scrapling/spiders/request.py`
- 3-file cycle: `Scrapling-main/Scrapling-main/scrapling/engines/toolbelt/custom.py -> Scrapling-main/Scrapling-main/scrapling/spiders/request.py -> Scrapling-main/Scrapling-main/scrapling/spiders/spider.py -> Scrapling-main/Scrapling-main/scrapling/engines/toolbelt/custom.py`
- 5-file cycle: `Scrapling-main/Scrapling-main/scrapling/engines/static.py -> Scrapling-main/Scrapling-main/scrapling/engines/toolbelt/custom.py -> Scrapling-main/Scrapling-main/scrapling/spiders/request.py -> Scrapling-main/Scrapling-main/scrapling/spiders/spider.py -> Scrapling-main/Scrapling-main/scrapling/spiders/session.py -> Scrapling-main/Scrapling-main/scrapling/engines/static.py`
- 5-file cycle: `Scrapling-main/Scrapling-main/scrapling/engines/toolbelt/convertor.py -> Scrapling-main/Scrapling-main/scrapling/engines/toolbelt/custom.py -> Scrapling-main/Scrapling-main/scrapling/spiders/request.py -> Scrapling-main/Scrapling-main/scrapling/spiders/spider.py -> Scrapling-main/Scrapling-main/scrapling/spiders/session.py -> Scrapling-main/Scrapling-main/scrapling/engines/toolbelt/convertor.py`

## Communities (245 total, 44 thin omitted)

### Community 0 - "Spiders Test Session"
Cohesion: 0.02
Nodes (82): CapacityLimiter, CrawlerEngine, AsyncPath, Path, Resolve the effective download delay for a domain. Takes the max of the…, Get or create a per-domain concurrency limiter if enabled, otherwise use the…, Normalize request fields before enqueueing. Resolves empty sid to the session…, Dispatch response to the request's callback and process yielded items/requests. (+74 more)

### Community 1 - "Spiders Templates Test"
Cohesion: 0.05
Nodes (51): Protego, Example 4: Python - Spider (auto-crawling framework) Scrapes ALL pages of…, Type definitions for type checking purposes., Functions related to custom types or type checking, A class that gets the status text of the response status code. Reference:…, This class is returned by all engines as a way to unify the response type…, Return the raw body of the response as bytes., Response (+43 more)

### Community 2 - "Test Spiders Tests"
Cohesion: 0.05
Nodes (38): PatternInput, _compile_patterns(), LinkExtractor, Any, Pattern, Extracts and filters URLs from a `Response` (or a single URL via `matches`).…, Return absolute, filtered, deduped URLs from `response`., URL-only filter (no response extraction). Applies… (+30 more)

### Community 3 - "Parser Core Custom"
Cohesion: 0.03
Nodes (37): Any, Pattern, slice, SupportsIndex, Return a sorted version of the string, Return a new version of the string after removing all white spaces and…, Return JSON response if the response is jsonable otherwise throw error, Apply the given regex to text and return the first match if found, otherwise… (+29 more)

### Community 4 - "Scheduler Test Spiders"
Cohesion: 0.04
Nodes (48): Priority queue with URL deduplication. (heapq) Higher priority requests are…, Add a request to the queue., Get the next request to process (stays tracked until complete())., Mark a request as finished so it stops being tracked for checkpoints., Create a snapshot of the current state for checkpoints., Restore scheduler state from checkpoint data. :param data: CheckpointData…, Scheduler, asyncio (+40 more)

### Community 5 - "Parser Selector Test"
Cohesion: 0.04
Nodes (38): _ElementUnicodeResult, HtmlElement, Find elements that are in the same tree depth in the page with the same tag…, The main class that works as a wrapper for the HTML input data. Using this…, Find elements that its text content fully/partially matches input. :param text:…, Find elements that its text content matches the input regex pattern. :param…, Return True if the given element is a result of a string expression Examples:…, Used internally to convert a single HtmlElement or text node to Selector… (+30 more)

### Community 6 - "Checkpoint Test Spiders"
Cohesion: 0.05
Nodes (47): CheckpointData, CheckpointManager, AsyncPath, Path, Container for checkpoint state., Manages saving and loading checkpoint state to/from disk., Check if a checkpoint exists., Save checkpoint data to disk atomically. (+39 more)

### Community 7 - "Spider Spiders Test"
Cohesion: 0.03
Nodes (44): QuotesSpider, ABC, Any, Exception, Generate initial requests to start the crawl. By default, this generates…, Default callback for processing responses, Called before crawling starts. Override for setup logic. :param resuming: It's…, Called after crawling finishes. Override for cleanup logic. (+36 more)

### Community 8 - "Test Spiders Robotstxt"
Cohesion: 0.08
Nodes (22): Manages fetching, parsing, and caching of robots.txt files., Check if a URL can be fetched according to the domain's robots.txt. :param url:…, Return both crawl-delay and request-rate in a single parser lookup. :param url:…, Pre-warm the robots.txt cache for a list of seed URLs concurrently. :param…, RobotsTxtManager, make_fetch_fn(), MockResponse, asyncio (+14 more)

### Community 9 - "Test Tests Mcp"
Cohesion: 0.04
Nodes (36): AccessToken, Verifies requests against a single shared bearer token., _StaticTokenVerifier, asyncio, use_class_based_httpbin, Test MCP server functionality, Test the make_request tool method with a default GET, Test the make_request tool method with a POST body (+28 more)

### Community 10 - "Fetchers Test Requests"
Cohesion: 0.06
Nodes (37): Example 1: Python - FetcherSession (persistent HTTP session with Chrome TLS…, Example 2: Python - DynamicSession (Playwright browser automation, visible)…, Example 3: Python - StealthySession (Patchright stealth browser, visible)…, DataRequestParams, GetRequestParams, RequestsSession, BaseFetcher, DynamicFetcher (+29 more)

### Community 11 - "Proxy Test Rotation"
Cohesion: 0.04
Nodes (38): RotationStrategy, _get_proxy_key(), ProxyRotator, ProxyType, Return the total number of configured proxies., Generate a unique key for a proxy (for dicts it's server plus username)., A thread-safe proxy rotator with pluggable rotation strategies. Supports: -…, Initialize the proxy rotator. :param proxies: List of proxy URLs or Playwright-… (+30 more)

### Community 12 - "Engines Browsers Base"
Cohesion: 0.06
Nodes (30): AsyncSession, BaseSessionMixin, DynamicSessionMixin, Initialize the browser context., Get statistics about the current page pool, Close every open tab in the session's pool. The next request opens a fresh tab., Get statistics about the current page pool, Detect the type of Cloudflare challenge present in the provided page content.… (+22 more)

### Community 13 - "Shell Cli Test"
Cohesion: 0.05
Nodes (38): ArgumentParser, __build_browser_kwargs(), __BuildRequest(), fetch(), __ParseExtractArguments(), __ParseJSONData(), Any, Parse JSON string into a Python object (+30 more)

### Community 14 - "Test Request Tests"
Cohesion: 0.03
Nodes (35): Tests for the Request class., Test Request initialization and basic attributes., Test Request copy functionality., Test that copy creates a new independent request., Test creating a request with just a URL., Test that modifying copied meta doesn't affect original., Test Request comparison operators., Test less than comparison by priority. (+27 more)

### Community 15 - "Parser Shell Core"
Cohesion: 0.04
Nodes (32): CustomShell, Unpack TypedDict from Unpack[TypedDict] annotations in **kwargs and reconstruct…, A custom IPython shell with minimal dependencies, Initialize application components, Create a custom banner for the shell, Update the current page and add to pages history, Create a wrapper that preserves function signature but updates page, Create a namespace with application-specific objects (+24 more)

### Community 16 - "Page Test Engines"
Cohesion: 0.06
Nodes (26): PageInfo, PagePool, AsyncPage, SyncPage, Get the total number of pages, Get the number of busy pages, Information about the page and its current state, Mark the page as busy (+18 more)

### Community 17 - "Test Tests Mcp"
Cohesion: 0.06
Nodes (26): MCPServer, Build the DNS-rebinding protection settings for the streamable-http transport., Build the MCPServer with all tools registered and the optional authentication…, Serve the MCP server. :param http: Serve over the streamable-http transport…, Create a Scrapling MCP server. :param executable_path: Optional global…, ScraplingMCPServer, fixture, Test custom browser executable path plumbing in the MCP browser tools (+18 more)

### Community 18 - "Apollo Api Testing"
Cohesion: 0.09
Nodes (42): cmd_agent(), cmd_discover(), cmd_health(), cmd_poll(), cmd_show(), cmd_status(), cmd_webhook(), print_record() (+34 more)

### Community 19 - "Test Attributes Tests"
Cohesion: 0.04
Nodes (23): AttributesHandler, A read-only mapping to use instead of the standard dictionary for the speed…, Search current attributes by values and return a dictionary of each matching…, Convert current attributes to JSON bytes if the attributes are JSON…, fixture, Test JSON parsing error handling, Test json_string property, Test search_values method (+15 more)

### Community 20 - "Apollo Engine Fixed"
Cohesion: 0.10
Nodes (44): cmd_agent(), cmd_discover(), cmd_poll(), cmd_show(), cmd_status(), cmd_webhook(), print_record(), Command dispatch for the Apollo extraction engine CLI. The real logic lives in… (+36 more)

### Community 21 - "Test Tests Fetchers"
Cohesion: 0.06
Nodes (27): DynamicSession, A Browser session manager with page pooling., Create a browser for this instance and context., A Stealthy Browser session manager with page pooling., Create a browser for this instance and context., StealthySession, fixture, use_class_based_httpbin (+19 more)

### Community 22 - "Core Test Tests"
Cohesion: 0.04
Nodes (27): Test headers with multiple colons, Test headers with extra whitespace, Test cookie parsing functionality, Test parsing with cookies disabled, Test parsing empty header lines, Test Request namedtuple functionality, Test creating Request namedtuple, Test parsing a simple cookie (+19 more)

### Community 23 - "Websearch Test Tests"
Cohesion: 0.09
Nodes (25): clean_spaces(), _decode_redirect_url(), _enrich_items(), _error(), _extract_phone(), _match_first_phone(), _normalize_phone(), _parse_bing() (+17 more)

### Community 24 - "Apollo Engine Fixed"
Cohesion: 0.11
Nodes (24): ApolloClient, ApolloHttpError, Thin HTTP transport for the Apollo.io v1 API. Uses the `x-api-key` header…, cmd_health(), activate, cmd_poll depends on get() returning a parsed dict even on 4xx so it can check…, test_api_key_mirrored_into_body_and_header(), test_get_falls_back_to_text_for_non_json_error_body() (+16 more)

### Community 25 - "Test Spiders Throttle"
Cohesion: 0.08
Nodes (16): AutoThrottle, Drop every learned delay., Adjusts the per-domain delay from the observed response latency, so the spider…, :param start_delay: The delay used for the first request to a domain. :param…, Return the current delay for a domain, starting it at `start_delay` the first…, Feed a finished request back into the throttle and return the domain's new…, Test the doubling that kicks in when a website blocks us, Blocks are often served fast, so latency alone would never slow the spider down (+8 more)

### Community 26 - "Test Checkpoint Force"
Cohesion: 0.08
Nodes (17): _LogCounterStub, _make_engine(), MockResponse, MockSession, Any, anyio, Verify checkpoint is saved BEFORE cancel_scope.cancel() on force-stop., Core regression test: force-stop must save checkpoint, not delete it. (+9 more)

### Community 27 - "Test Spiders Result"
Cohesion: 0.09
Nodes (19): list, ItemList, A list of scraped items with export capabilities., Parse a file the test itself just wrote., Test to_xml writes one element per item with the keys as children., Scraped keys can be anything, but XML names can't, Test ItemList functionality., Control characters in scraped text would produce a file no parser can read (+11 more)

### Community 28 - "Stealth Fetchers Test"
Cohesion: 0.07
Nodes (24): AsyncStealthySession, Unpack, An async Stealthy Browser session manager with page pooling., A Browser session manager with page pooling, it's using a persistent browser…, Create a browser for this instance and context., A Browser session manager with page pooling, it's using a persistent browser…, StealthSession, Unpack (+16 more)

### Community 29 - "Engines Toolbelt Convertor"
Cohesion: 0.08
Nodes (23): async_Page, AsyncResponse, Page, Solve the cloudflare challenge displayed on the playwright page passed :param…, Opens up the browser and do your request based on your chosen options. :param…, Solve the cloudflare challenge displayed on the playwright page passed :param…, Opens up the browser and do your request based on your chosen options. :param…, AsyncPage (+15 more)

### Community 30 - "Test Tests Spiders"
Cohesion: 0.11
Nodes (13): _crawl(), _LogCounterStub, MockSession, MockSpider, Any, anyio, Exception, Test how the engine drives the throttle (+5 more)

### Community 31 - "Test Session Tests"
Cohesion: 0.07
Nodes (20): FetcherClient, FetcherSession, Creates and returns a new synchronous Fetcher Session, Closes the active synchronous session managed by this instance, if any., A factory context manager that provides configured Fetcher sessions. When this…, Creates and returns a new synchronous Fetcher Session, Creates and returns a new asynchronous Session., _SyncSessionLogic (+12 more)

### Community 32 - "Sitemap Spiders Test"
Cohesion: 0.11
Nodes (16): Any, Parse a sitemap body and return its URLs and any child sitemaps., Parsed sitemap body. `urls` holds the entries from a `<urlset>`; `sitemaps`…, A Spider that seeds a crawl from sitemap(s), and follows the rules. Override…, Override to define dispatch rules for sitemap URLs., Default callback for processing responses, Extract `Sitemap` directives from a robots.txt body via protego., SitemapResult (+8 more)

### Community 33 - "App Src Components"
Cohesion: 0.07
Nodes (28): CallData, CallLogPanel(), CallLogPanelProps, ActionItem, BusinessProfile, ChatPanel(), ChatPanelProps, DocumentContextData (+20 more)

### Community 34 - "Core Mcpserver Fetch"
Cohesion: 0.12
Nodes (23): _page_pool_size(), extraction_types, FollowRedirects, ImpersonateType, SUPPORTED_HTTP_METHODS, Make an HTTP request with any method (GET, POST, PUT, DELETE) through a…, Extract content from a response and translate it to a ResponseModel., Return a per-call executable path or the server-wide default. (+15 more)

### Community 35 - "Apollo Engine Fixed"
Cohesion: 0.16
Nodes (28): ApolloConfig, activate, test_discover_blocks_on_placeholder_webhook_url(), test_discover_blocks_without_api_key(), test_full_discover_flow_harvests_and_dispatches(), make_cfg(), activate, Synthetic scenario: Apollo returns a 404 'result_pending' JSON body twice, then… (+20 more)

### Community 36 - "Apollo Engine Fixed"
Cohesion: 0.15
Nodes (27): build_contacts_payload(), contact_matches_client_filters(), ContactRecord, filter_by_phone_flag(), filter_targets(), has_direct_phone_yes(), normalize_contact(), ApolloClient (+19 more)

### Community 37 - "App Tsconfig Compileroptions"
Cohesion: 0.07
Nodes (29): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+21 more)

### Community 38 - "Core Translator Xpath"
Cohesion: 0.11
Nodes (19): FunctionalPseudoElement, OriginalHTMLTranslator, OriginalXPathExpr, Protocol, PseudoElement, css_to_xpath(), HTMLTranslator, Any (+11 more)

### Community 39 - "Test Tests Fetchers"
Cohesion: 0.09
Nodes (18): driven_browser_version(), generate_headers(), Functions related to generating headers and fingerprints generally, Get the Chromium major version the installed automation package drives, read…, Generate real browser-like headers using browserforge's generator :param…, parametrize, Test fingerprint generation functions, Test basic header generation (+10 more)

### Community 40 - "App Src Server"
Cohesion: 0.11
Nodes (10): TelegramAdapter, TgUpdate, WebAdapter, WebRawPayload, TODO: resolve audio media URL before passing downstream, WaEntry, WhatsAppAdapter, ChannelAdapter (+2 more)

### Community 41 - "Integrations Scra Tests"
Cohesion: 0.12
Nodes (13): convert_response(), Any, Convert a Scrapy response to a Scrapling `Response` object. Can be used…, Decorator that converts the Scrapy response passed to a spider callback into a…, scrapling_response(), make_response(), asyncio, Test the decorator over all the callback kinds Scrapy supports (+5 more)

### Community 42 - "Spiders Test Result"
Cohesion: 0.09
Nodes (14): CrawlStats, Statistics for a crawl run., Access current crawl stats (works during streaming)., Test CrawlStats dataclass., Test CrawlStats default values., Test elapsed_seconds property., Test requests_per_second calculation., Test requests_per_second when elapsed is zero. (+6 more)

### Community 43 - "App Src Mcp"
Cohesion: 0.12
Nodes (13): main(), POST(), crawleeConfig, CrawleeSearchAdapter, cleanBusinessName(), DISCOVERY_FALLBACK_DORMANT, DomainSearchResult, extractEmailsFromText() (+5 more)

### Community 44 - "App Src Server"
Cohesion: 0.07
Nodes (21): AuditLogEntity, BusinessDocumentEntity, BusinessProfileEntity, CallEntity, CallResultEntity, EventEntity, EvidenceEntity, LeadCriteriaEntity (+13 more)

### Community 45 - "Test Tests Spiders"
Cohesion: 0.11
Nodes (6): ErrorSession, MockSpider, Any, Session that raises on fetch., Lightweight spider stub for engine tests., TestProcessRequest

### Community 46 - "App Src Mcp"
Cohesion: 0.12
Nodes (16): runTest(), expandLocationsToDetailedMetro(), getIntelligentServiceKeywords(), getRealIndustryAuthorityDomains(), POST(), buildApolloSingleSourceOfTruth(), BuildApolloSSoTOptions, extractCleanDomain() (+8 more)

### Community 47 - "App Src Lib"
Cohesion: 0.09
Nodes (24): ApiResponse, BusinessProfile, BusinessProfileSchema, CallBriefSchema, CallStructuredResult, CallStructuredResultSchema, CallSynthesis, CallSynthesisSchema (+16 more)

### Community 48 - "Spider Spiders Test"
Cohesion: 0.10
Nodes (16): LogRecord, LogCounterHandler, AsyncPath, Path, Initialize the spider. :param crawldir: Directory for checkpoint files. If…, A logging handler that counts log messages by level., Return counts as a dictionary with string keys., Test counting critical level messages. (+8 more)

### Community 49 - "Lookup Apollo Api"
Cohesion: 0.19
Nodes (23): build_contacts_payload(), contact_matches_client_filters(), ContactRecord, filter_by_phone_flag(), filter_targets(), has_direct_phone_yes(), normalize_contact(), ApolloClient (+15 more)

### Community 50 - "Proxy Rotation Test"
Cohesion: 0.11
Nodes (17): cyclic_rotation(), is_proxy_error(), Exception, Check if an error is proxy-related. Works for both HTTP and browser errors., Default cyclic rotation strategy - iterates through proxies sequentially,…, parametrize, Test the default cyclic_rotation strategy function, Test that cyclic_rotation returns proxies in order (+9 more)

### Community 51 - "Test Engine Tests"
Cohesion: 0.12
Nodes (7): _make_engine(), Create a CrawlerEngine wired to mock objects., TestCrawlerEngineInit, TestIsDomainAllowed, TestItemsProperty, TestRateLimiter, TestRequestPause

### Community 52 - "Test Feed Tests"
Cohesion: 0.23
Nodes (7): _collect(), _make_response(), _PriceSpider, asyncio, _RSSSpider, TestCSVFeedSpider, TestXMLFeedSpider

### Community 53 - "App Package Devdependencies"
Cohesion: 0.08
Nodes (25): devDependencies, eslint, eslint-config-next, prisma, tailwindcss, @tailwindcss/postcss, @types/node, @types/pdf-parse (+17 more)

### Community 54 - "App Src Mcp"
Cohesion: 0.11
Nodes (12): ResolvedContact, ScoredResult, ScoringContext, calcCompleteness(), fingerprint(), legacyToOKF(), normalizePhone(), OKFCalleStatus (+4 more)

### Community 55 - "Trigger Apollo Api"
Cohesion: 0.28
Nodes (21): ApolloConfig, FakeClient, record(), test_build_agent_payload(), test_build_match_payload(), test_build_sequence_payload(), test_dispatch_agent_returns_task_id_for_each_record(), test_dispatch_match_parses_request_id() (+13 more)

### Community 56 - "Test Async Dynamic"
Cohesion: 0.10
Nodes (15): AsyncDynamicSession, An async Browser session manager with page pooling, it's using a persistent…, Create a browser for this instance and context., asyncio, fixture, use_class_based_httpbin, Routes registered for one request are removed before the tab is reused, Test AsyncDynamicSession (+7 more)

### Community 57 - "Test Tests Fetchers"
Cohesion: 0.11
Nodes (15): _filter_defaults(), Filter out parameters that match their default values to reduce validation…, validate(), Test configuration validators, Test StealthConfig inherits blocked_domains, Test valid PlaywrightConfig, Test PlaywrightConfig with invalid max_pages, Test PlaywrightConfig with an invalid timeout (+7 more)

### Community 58 - "Test Async Tests"
Cohesion: 0.09
Nodes (14): asyncio, fixture, use_class_based_httpbin, Snapshot and restore the mutable class-level parser config around a test., Test if different arguments with the DELETE request break the code or not, `AsyncFetcher.configure()` must reach the Response's Selector on the HTTP path., A per-request ``selector_config`` overrides the class-level configure()., ``retries`` below 1 means "send the request once", not "send nothing". (+6 more)

### Community 59 - "Apollo Engine Fixed"
Cohesion: 0.14
Nodes (17): _bool_env(), _list_env(), load_config(), Configuration for the alternative Apollo extraction engine. TRIGGER_MODE…, FakeHandler, test_handle_payload_empty_people_list(), test_handle_payload_writes_jsonl(), test_is_authorized_checks_fallback_header() (+9 more)

### Community 60 - "App Src Server"
Cohesion: 0.23
Nodes (19): runTestSuite(), CreateTaskSchema, POST(), briefToCalleTask(), generateCallBrief(), generateResultSchema(), createDiscoveryProvider(), createEnrichmentProvider() (+11 more)

### Community 61 - "Api Testing Apollo"
Cohesion: 0.18
Nodes (23): add_to_sequence(), append_jsonl(), build_contacts_payload(), build_people_payload(), check_api_key(), contact_matches_client_filters(), discover(), enqueue_enrichment() (+15 more)

### Community 62 - "Engines Static Asyncsessionlogic"
Cohesion: 0.12
Nodes (11): Any, Unpack, Perform a GET request. Any additional keyword arguments are passed to the…, Perform a POST request. Any additional keyword arguments are passed to the…, Perform a PUT request. Any additional keyword arguments are passed to the…, Perform a DELETE request. Any additional keyword arguments are passed to the…, Perform an HTTP request using the configured session., Perform a GET request. Any additional keyword arguments are passed to the… (+3 more)

### Community 63 - "Cache Spiders Test"
Cohesion: 0.18
Nodes (10): AsyncPath, Path, Caches HTTP responses to disk for replay during spider development., ResponseCacheManager, _make_response(), anyio, Flat-dict cookies (static engine) must still round-trip as a ``dict``., Re-caching the same fingerprint must replace the stored response. Regression… (+2 more)

### Community 64 - "Test Response Handling"
Cohesion: 0.11
Nodes (16): make_async_page(), make_async_playwright_response(), make_sync_page(), make_sync_playwright_response(), asyncio, Raw response bytes should still use the charset from Content-Type., Async page.content() returns Unicode, so its encoded bytes are UTF-8., Raw response bytes should still use the charset from Content-Type. (+8 more)

### Community 65 - "Parser Test Advanced"
Cohesion: 0.08
Nodes (13): fixture, Test XPath with variables, Test CSS pseudo-elements, Test complex attribute handling, Test URL joining functionality, Test edge cases in find operations, Test text operation edge cases, Test get_all_text preserves interleaved text nodes (+5 more)

### Community 66 - "App Src Server"
Cohesion: 0.12
Nodes (20): estimateDealSize(), parseSizeRange(), POST(), ScraperConfigResponse, ScraperKeywords, ScraperPlatformConfig, ScraperTargetFilter, ActionItem (+12 more)

### Community 67 - "Test Session Async"
Cohesion: 0.11
Nodes (14): AsyncFetcherClient, _ASyncSessionLogic, Creates and returns a new asynchronous Session., Closes the active asynchronous session managed by this instance, if any., asyncio, parametrize, Test FetcherSession functionality, Test AsyncFetcherClient creation (+6 more)

### Community 68 - "Test Tests Fetchers"
Cohesion: 0.09
Nodes (13): fixture, use_class_based_httpbin, Test if different arguments with the DELETE request break the code or not, `Fetcher.configure()` must reach the Response's Selector on the HTTP path., A per-request ``selector_config`` overrides the class-level configure()., ``retries`` below 1 means "send the request once", not "send nothing"., Fixture to create a Fetcher instance for the entire test class, Fixture to set up URLs for testing (+5 more)

### Community 69 - "App Mcp Src"
Cohesion: 0.19
Nodes (13): runQA(), main(), CalleGoalDispatcher, GoalDispatchOptions, GoalDispatchResult, parseUploadedFile(), ensureDir(), listOKFDossiers() (+5 more)

### Community 70 - "Test Tests Fetchers"
Cohesion: 0.11
Nodes (15): _is_invalid_cdp_url(), _is_invalid_file_path(), Fast file path validation, Fast CDP URL validation, Custom validation after msgspec validation, construct_proxy_dict(), Validate a proxy and return it in the acceptable format for Playwright…, Test proxy dictionary construction (+7 more)

### Community 71 - "Test Tests Mcp"
Cohesion: 0.12
Nodes (13): _FakeAsyncBrowserSession, _FakeDynamicSession, _FakePage, _FakeStealthySession, _png_height(), Any, Pages with control chars like U+0008 must not crash the request/fetch path…, The page object a fake session hands to a `page_action`. (+5 more)

### Community 72 - "App Package Dependencies"
Cohesion: 0.10
Nodes (21): dependencies, class-variance-authority, crawlee, date-fns, framer-motion, lucide-react, pdf-parse, puppeteer-extra-plugin-stealth (+13 more)

### Community 73 - "Test Tests Fetchers"
Cohesion: 0.13
Nodes (10): Set multiple arguments for the parser at once globally :param kwargs: The…, Test default configuration values, Test configuring single parameter, Test configuring multiple parameters, Test configuring invalid parameter, Test configure with no parameters, Test configuring non-parser keyword, Test parser arguments generation (+2 more)

### Community 74 - "Test Tests Fetchers"
Cohesion: 0.18
Nodes (9): create_intercept_handler(), Create a route handler that blocks both resource types and specific domains.…, _MockRoute, Minimal mock for Playwright's sync Route object., Test the unified sync route handler factory., When both are active, resource type check comes first., Non-blocked resource type from a blocked domain should still be aborted., example.com' should not block 'notexample.com'. (+1 more)

### Community 75 - "Test Tests Spiders"
Cohesion: 0.16
Nodes (7): ExampleStoreSpider, _make_response(), Any, asyncio, TestDomainResolution, TestItemProcessing, TestParsing

### Community 76 - "Core Mcpserver Session"
Cohesion: 0.12
Nodes (14): BrowserSessionType, ImageContent, Response returned when a new session is created., Look up a session by ID, optionally validating its type. Pass `None` to skip…, Generate a session ID when none is given, and reject duplicates., Store a started session and build its creation receipt., Open a persistent browser session that can be reused across multiple…, Open a persistent HTTP requests session (no browser) that can be reused across… (+6 more)

### Community 77 - "App Src Server"
Cohesion: 0.16
Nodes (16): extractValue(), findMatchingKey(), ImportResult, normalizeRows(), parseEmployeeCount(), ContactCandidate, resolveAccurateContact(), ResolveContactInput (+8 more)

### Community 78 - "Engines Browsers Base"
Cohesion: 0.12
Nodes (12): AsyncFrame, AsyncPlaywrightResponse, BrowserContext, Frame, AsyncPage, Page, Get a ready page from the pool, or open a new one, Wait for the page to become idle (no network activity) even if there are never-… (+4 more)

### Community 79 - "Test List Tests"
Cohesion: 0.13
Nodes (13): BrowserTypeLiteral, FollowRedirects, ImpersonateType, Handle browser selection logic for the ` impersonate ` parameter. If…, :param impersonate: Browser version to impersonate. Can be a single browser…, _select_random_browser(), Test the random browser selection helper function., Test that single browser string is returned as-is. (+5 more)

### Community 80 - "Utils Core Spider"
Cohesion: 0.13
Nodes (14): Logger, Apply the given regex to the current text and return a list of strings with the…, flatten(), _is_iterable(), LoggerProxy, Any, Create and configure a logger with a standard format. :returns: logging.Logger:…, Set the current context logger. Returns token for reset. (+6 more)

### Community 81 - "Cli Test Tests"
Cohesion: 0.15
Nodes (10): mcp(), fixture, `--http` stays off the network by default, so `--no-auth` can't expose the…, The refusal raised by `serve` is shown as a CLI usage error instead of a…, Test MCP command with repeated allowed hosts, Test CLI functionality, Test MCP command with a custom browser executable, Test MCP command with a shared authentication token (+2 more)

### Community 82 - "Shell Test Core"
Cohesion: 0.12
Nodes (10): extraction_types, Convert HTML content to Markdown, Return a copy of the Selector with noise tags removed., Strip hidden content that could be used for prompt injection. Removes CSS-…, Extract the content of a Selector, Convert the response content to clean Markdown. Scripts, styles, and…, Test extracting content as Markdown, Test extracting content as HTML (+2 more)

### Community 83 - "Result Test Spiders"
Cohesion: 0.14
Nodes (11): CrawlResult, Complete result from a spider run., True if the crawl completed normally (not paused)., Test CrawlResult dataclass., Test basic CrawlResult creation., Test completed is True when not paused., Test completed is False when paused., Test len returns number of items. (+3 more)

### Community 84 - "Spiders Templates Feed"
Cohesion: 0.16
Nodes (12): CSVFeedSpider, Any, _Element, A Spider that iterates over the rows of a CSV feed. Override `parse_row()` to…, Read the feed's rows and dispatch each one to `parse_row`., Override to process one feed row as a `{column: value}` dictionary., A Spider that iterates over the nodes of an XML feed (RSS, Atom, product feeds,…, Iterate over the feed's `itertag` nodes and dispatch each one to `parse_node`. (+4 more)

### Community 85 - "Test Tests Spiders"
Cohesion: 0.18
Nodes (4): asyncio, Test that requests yielded from callbacks are processed., TestCrawl, TestPauseDuringCrawl

### Community 86 - "Test Tests Spiders"
Cohesion: 0.11
Nodes (10): Test kwargs with different values produce different fingerprints., Test header values are fingerprinted without lowercasing., Test Request computed properties., Test domain property extracts netloc correctly., Test domain extraction with port number., Test domain extraction with subdomains., Test fingerprint generation returns bytes., Test same request produces same fingerprint. (+2 more)

### Community 87 - "Mcp App Src"
Cohesion: 0.17
Nodes (7): POST(), RawImportedLead, McpJobStatus, McpOrchestrator, McpRunOptions, scoreLead(), DomainSearchQuery

### Community 88 - "Calle App Src"
Cohesion: 0.11
Nodes (9): @call-e/calle, CallCreateInput, CallCreateOptions, CallE, CallEConfig, CallObject, GoalObject, GoalRunInput (+1 more)

### Community 89 - "Core Test Storage"
Cohesion: 0.19
Nodes (4): Test the save/retrieve round-trip - the core of the adaptive feature., Elements saved under one URL should not be retrievable under another., TestGetBaseUrl, TestSaveRetrieveRoundTrip

### Community 90 - "Test Tests Fetchers"
Cohesion: 0.12
Nodes (11): fixture, parametrize, use_class_based_httpbin, Fixture to create a StealthyFetcher instance for the entire test class, Fixture to set up URLs for testing, Test doing a basic fetch request with multiple statuses, Test if cookies are set after the request, Test if automation breaks the code or not (+3 more)

### Community 91 - "Test Impersonate List"
Cohesion: 0.11
Nodes (11): fixture, use_class_based_httpbin, Test that multiple requests in a session work with impersonate list., Test that request-level impersonate overrides session-level., Test that request-level impersonate list overrides session-level., Fixture to set up URLs for testing., Test FetcherSession with list-based impersonate parameter., Fixture to set up URLs for testing. (+3 more)

### Community 92 - "App Src Server"
Cohesion: 0.18
Nodes (14): CallBrief, EvidenceItem, LeadScore, ScoreComponents, CallBriefInput, generateHypothesis(), LeadScoringInput, scoreBusinessQuality() (+6 more)

### Community 93 - "App Src Server"
Cohesion: 0.18
Nodes (11): LeadDiscoveryProvider, LeadEnrichment, LeadEnrichmentProvider, RawLead, SearchCriteria, delay(), SYNTHETIC_LEADS, SyntheticDiscoveryProvider (+3 more)

### Community 94 - "Engines Static Configurationlogic"
Cohesion: 0.14
Nodes (10): CurlResponse, _ConfigurationLogic, ABC, SUPPORTED_HTTP_METHODS, Merge request-specific arguments with default session arguments., 1. Adds a useragent to the headers if it doesn't have one 2. Generates real…, Perform an HTTP request using the configured session., Get parameter from kwargs if present, otherwise return default. (+2 more)

### Community 95 - "Apollo Api Testing"
Cohesion: 0.20
Nodes (11): HandlerStub, test_handle_payload_empty_people(), test_handle_payload_persists_person_phones(), test_is_authorized_checks_signature(), test_is_authorized_no_secret_always_true(), ApolloWebhookHandler, handle_payload(), is_authorized() (+3 more)

### Community 96 - "Core Storage Test"
Cohesion: 0.15
Nodes (10): Close all connections. It will be useful when with some things like scrapy…, To ensure all connections are closed when the object is destroyed., The recommended system to use, it's race condition safe and thread safe. Mainly…, :param storage_file: File to be used to store elements' data. :param url: URL…, SQLiteStorageSystem, Test SQLiteStorageSystem functionality, Test SQLite storage system creation, Test SQLite storage with an actual file (+2 more)

### Community 97 - "Cli Test Tests"
Cohesion: 0.12
Nodes (10): configure_selector_mock(), use_class_based_httpbin, Helper function to create a properly configured Selector mock, Test extract `post` command, Test extract `put` command, Test extract `delete` command, Test extract fetch command, Test that --executable-path is passed through to DynamicFetcher and wins over… (+2 more)

### Community 98 - "Test Tests Fetchers"
Cohesion: 0.15
Nodes (10): asyncio, fixture, parametrize, use_class_based_httpbin, Test doing a basic fetch request with multiple statuses, Test if cookies are set after the request, Test if automation breaks the code or not, Test if different arguments break the code or not (+2 more)

### Community 99 - "Test Page Tests"
Cohesion: 0.21
Nodes (8): _async_page(), _async_session(), asyncio, Tests for the tab reuse lifecycle of the browser sessions, with mocked…, _sync_page(), _sync_session(), TestAsyncTabReuse, TestSyncTabReuse

### Community 100 - "Engines Browsers Controllers"
Cohesion: 0.15
Nodes (10): Unpack, Opens up the browser and do your request based on your chosen options. :param…, A Browser session manager with page pooling :param headless: Run the browser in…, Opens up the browser and do your request based on your chosen options. :param…, A Browser session manager with page pooling, it's using a persistent browser…, PlaywrightSession, TypedDict, Unpack (+2 more)

### Community 101 - "Spiders Result Itemlist"
Cohesion: 0.14
Nodes (10): Any, Path, Turn an item's value into text, serializing containers to JSON so no data is…, Turn an item's key into a usable XML tag name., Export items to a JSON file. :param path: Path to the output file :param…, Export items as JSON Lines (one JSON object per line). :param path: Path to the…, Export items to a CSV file. Items that don't share the same keys are still…, Export items to an XML file. Each item becomes an element whose children are… (+2 more)

### Community 102 - "Test Tests Fetchers"
Cohesion: 0.13
Nodes (9): asyncio, fixture, parametrize, use_class_based_httpbin, Test doing a basic fetch request with multiple statuses, Test if cookies are set after the request, Test if automation breaks the code or not, Test if different arguments break the code or not (+1 more)

### Community 103 - "Test Args Tests"
Cohesion: 0.17
Nodes (9): Tests for _merge_request_args to ensure browser-only kwargs are excluded.…, Verify that browser-only keyword arguments are stripped before the request dict…, Helper: instantiate a FetcherClient and call _merge_request_args., block_ads is a browser-engine param and must not leak into the HTTP request…, google_search is a browser-engine param and should be stripped., extra_headers is a browser-engine param and should be stripped., The url must always be present in the output dict., Arbitrary curl_cffi-compatible kwargs should survive. (+1 more)

### Community 104 - "Test Tests Parser"
Cohesion: 0.13
Nodes (15): html_content(), page(), fixture, Test parsing and selecting performance on large HTML, Try to create selectors for all elements in the page, Test that full path selectors don't duplicate id segments (regression test), Test full path selectors with a mix of elements with and without ids, Test getting all text from the page (+7 more)

### Community 105 - "Test Spider Tests"
Cohesion: 0.12
Nodes (9): ConcreteSpider, Any, Concrete spider implementation for testing., Test spider initialization with crawldir., Test spider initialization without crawldir., Test spider with custom checkpoint interval., Test spider has default checkpoint interval., Test that default configure_sessions adds a session. (+1 more)

### Community 107 - "App Src Server"
Cohesion: 0.22
Nodes (12): webAdapter, callLLM(), fallbackGrillingResponse(), OrchestratorMessage, runGrillingTurn(), extractThinking(), loadSession(), GrillingResult (+4 more)

### Community 108 - "App Src Session"
Cohesion: 0.27
Nodes (13): POST(), GET(), appendTurn(), ensureSessionsDir(), formatTurnMarkdown(), g, getOrCreateSessionId(), listSessionIds() (+5 more)

### Community 109 - "App Src Server"
Cohesion: 0.21
Nodes (12): POST(), UPLOAD_DIR, cleanExtractedText(), extractPdfText(), extractTextFromPdfRaw(), unescapePdfString(), describeImage(), extractDocumentText() (+4 more)

### Community 110 - "App Src Server"
Cohesion: 0.21
Nodes (6): CreateCallInput, PhoneAgent, PhoneCallResult, CallePhoneAgent, SYNTHETIC_RESULTS, SyntheticPhoneAgent

### Community 111 - "App Src Server"
Cohesion: 0.19
Nodes (9): ChunkStore, chunkText(), cosineSimilarity(), embed(), g, STOP_WORDS, StoredChunk, tokenize() (+1 more)

### Community 112 - "Test Tests Mcp"
Cohesion: 0.15
Nodes (11): Any, Collect all the keys a TypedDict holds, including the inherited ones., Extract the JSON-safe effective settings of a session, for the AI agent., _session_settings(), _typed_dict_keys(), open_session and list_sessions return the session's effective settings., The helper keeps JSON primitives and drops the rest (callables, structs,…, A CDP session drives a remote browser, so the local config is not reported as… (+3 more)

### Community 113 - "Core Storage Test"
Cohesion: 0.16
Nodes (8): ABC, :param url: URL of the website we are working on to separate it from other…, Using the identifier, we search the storage and return the unique properties of…, StorageSystemMixin, Test that SQLiteStorageSystem is safe under concurrent access., Test _StorageTools._get_element_path()., TestStorageThreadSafety, TestStorageToolsGetElementPath

### Community 114 - "Parser Selector Css"
Cohesion: 0.14
Nodes (9): _escape_css_string(), Pattern, Call the ``.css()`` method for each element in this list and return their…, Call the ``.re()`` method for each element in this list and return their…, Escape the characters that can't appear literally inside a CSS double-quoted…, Find elements by filters of your creations for ease. :param args: Tag name(s),…, Find elements by filters of your creations for ease, then return the first…, Apply the given regex to the current text and return a list of strings with the… (+1 more)

### Community 115 - "Test Filter Selectors"
Cohesion: 0.13
Nodes (9): page(), fixture, Tests for Selectors.filter() method edge cases. Target file:…, filter() should return only elements matching the predicate, filter() should return an empty Selectors (not None/exception) when nothing…, filter() with always-True predicate should return all elements, filter() should be chainable - apply two filters in sequence, filter() on an already-empty Selectors should not raise (+1 more)

### Community 116 - "Cli Test Tests"
Cohesion: 0.18
Nodes (11): command, option, _common_browser_options(), __Execute(), install(), Apply shared Click options for browser-based commands (fetch/stealthy_fetch)., Opens up a browser with advanced stealth features and fetch content using…, shell() (+3 more)

### Community 117 - "Test Tests Mcp"
Cohesion: 0.14
Nodes (8): The one-shot vs session split is derived from the library TypedDicts and must…, session_fetch exposes exactly the stealth per-request keys (plus…, Each per-request default equals the library config default so the AI sees the…, The one-shot tools no longer accept session_id, open_session keeps browser-level params only, none of the per-request fetch keys, A session runs one tab, so proxy is set once on open_session, never per request, The session-level proxy reaches the underlying session so it applies to every…, TestModeSplitContract

### Community 118 - "Test Tests Fetchers"
Cohesion: 0.15
Nodes (13): content_type_map(), fixture, Test if using different http responses' status codes returns the expected result, Test handling of an unknown status code, A charset declared without quotes is returned verbatim., A quoted charset value (RFC 7231 allows quoting) is unwrapped, not dropped., Fall back to the default when no charset is present or the header is empty., status_map() (+5 more)

### Community 119 - "Tests Spiders Test"
Cohesion: 0.15
Nodes (4): _LogCounterStub, MockSpider, Any, Exception

### Community 120 - "Test Tests Spiders"
Cohesion: 0.14
Nodes (8): Test Spider class attribute defaults., Test default concurrent_requests is 4., Test default concurrent_requests_per_domain is 0 (disabled)., Test default download_delay is 0., Test default max_blocked_retries is 3., Test default logging level is DEBUG., Test default allowed_domains is empty set., TestSpiderClassAttributes

### Community 122 - "Cli Http Options"
Cohesion: 0.22
Nodes (13): argument, _common_http_options(), _data_options(), delete(), __http_command(), post(), put(), Apply shared Click options for all HTTP extract commands (get/post/put/delete). (+5 more)

### Community 123 - "Engines Browsers Base"
Cohesion: 0.22
Nodes (8): AsyncBrowserContext, Any, ProxyType, Acquire a page - either from persistent context or fresh context with proxy., Initialize the browser context., Get a ready page from the pool, or open a new one, Acquire a page - either from persistent context or fresh context with proxy., Build context options with a specific proxy for rotation mode. :param proxy:…

### Community 124 - "Benchmarks Test Bs4"
Cohesion: 0.28
Nodes (11): benchmark(), test_autoscraper(), test_bs4_html5lib(), test_bs4_lxml(), test_lxml(), test_mechanicalsoup(), test_parsel(), test_pyquery() (+3 more)

### Community 125 - "Core Mixins Selectorsgeneration"
Cohesion: 0.26
Nodes (8): Any, Generate a selector for the current element. :return: A string of the generated…, Functions for generating selectors Trying to generate selectors like Firefox or…, Generate a CSS selector for the current element :return: A string of the…, Generate a complete CSS selector for the current element :return: A string of…, Generate an XPath selector for the current element :return: A string of the…, Generate a complete XPath selector for the current element :return: A string of…, SelectorsGeneration

### Community 126 - "Test Tests Mcp"
Cohesion: 0.19
Nodes (6): `session_fetch` forwards its per-request params by name to the session's…, A dynamic session receives every dynamic per-request param, including explicit…, A stealthy session additionally receives solve_cloudflare, Per-request overrides reach the session as given, Asking a dynamic session to solve Cloudflare is a clear error, not a silent no-…, TestSessionFetchForwarding

### Community 127 - "Test Ancestor Tests"
Cohesion: 0.15
Nodes (7): iterancestors() should yield every ancestor up to <html>, iterancestors() should start from the immediate parent, not the root, find_ancestor() should return the closest ancestor matching the predicate, find_ancestor() should return None if no ancestor matches, iterancestors() on a text node should yield nothing (not raise), find_ancestor() on the root <html> element should return None gracefully, TestAncestorNavigation

### Community 128 - "Test Find Similar"
Cohesion: 0.15
Nodes (7): find_similar() with defaults should find div.product siblings, not the section, A higher similarity_threshold should return fewer (or equal) results, match_text=True should factor in text content during similarity scoring, Ignoring data-price should make more elements qualify as similar, find_similar() on a text node should return empty Selectors without raising, The similarity denominator uses max() of both attribute counts, so candidates…, TestFindSimilarAdvanced

### Community 129 - "Test Spiders Engine"
Cohesion: 0.20
Nodes (5): _dump(), Tests for the CrawlerEngine class., TestDumpHelper, TestNormalizeRequest, TestTaskWrapper

### Community 130 - "Test Spiders Throttle"
Cohesion: 0.26
Nodes (5): parse_retry_after(), Return how many seconds a `Retry-After` header asks us to wait, or `None` when…, Test reading the `Retry-After` header, Engines don't agree on the casing of header names, TestParseRetryAfter

### Community 131 - "Server Repository Description"
Cohesion: 0.17
Nodes (11): description, icons, name, packages, repository, source, url, $schema (+3 more)

### Community 132 - "Test Tests Mcp"
Cohesion: 0.17
Nodes (7): Test persistent requests (HTTP) session management, Open a requests session, make GET and POST requests through it, then close it, Cookies set by one request are sent with the next request of the same session, A requests session and a browser session can't share the same ID, session_make_request rejects browser sessions, The browser session tools refuse a static session with a clear error, TestStaticSessionManagement

### Community 133 - "Test Tests Fetchers"
Cohesion: 0.29
Nodes (5): _AsyncMockRoute, asyncio, Minimal mock for Playwright's async Route object., Test the unified async route handler factory., TestCreateAsyncInterceptHandler

### Community 134 - "Test Tests Fetchers"
Cohesion: 0.29
Nodes (4): _is_domain_blocked(), Check if a hostname matches any blocked domain using O(1) frozenset lookups.…, Test the frozenset-based domain matching helper., TestIsDomainBlocked

### Community 135 - "Test Tests Parser"
Cohesion: 0.18
Nodes (6): Test basic navigation properties of elements, Test parent and sibling navigation, Test child navigation, Test next and previous element navigation, Test finding ancestors of elements, TestElementNavigation

### Community 136 - "Test Tests Spiders"
Cohesion: 0.22
Nodes (4): MockResponse, MockSession, Minimal Response stand-in., Mock session that returns a canned response.

### Community 137 - "Test Tests Spiders"
Cohesion: 0.18
Nodes (6): asyncio, Test that start_requests yields requests for start_urls., Test that start_requests raises when no start_urls., Test that start_requests uses default session ID., Test default on_start doesn't raise., Test default on_scraped_item returns the item unchanged.

### Community 138 - "App Package Scripts"
Cohesion: 0.20
Nodes (9): name, packageManager, private, scripts, build, dev, lint, start (+1 more)

### Community 140 - "Cli Test Tests"
Cohesion: 0.20
Nodes (6): get(), Perform a GET request and save the content to a file., Test extract `get` command, Test invalid arguments handling, Test that comma-separated impersonate values are parsed correctly, Test that single impersonate value remains as string

### Community 141 - "Test Tests Mcp"
Cohesion: 0.24
Nodes (6): parametrize, Test the page pool sizing of the bulk browser tools, bulk_fetch opens a pool that covers the batch but stays inside the 1..50…, bulk_stealthy_fetch sizes its pool to the batch instead of leaving it at the…, The computed pool size always passes the real session validation without…, TestBulkPagePool

### Community 142 - "Test Tests Spiders"
Cohesion: 0.20
Nodes (6): Test Spider lifecycle hooks., Test default on_close doesn't raise., Test default on_error logs the error., Test default is_blocked checks blocked status codes., Test default retry_blocked_request returns the request unchanged., TestSpiderHooks

### Community 143 - "App Src Server"
Cohesion: 0.25
Nodes (5): dynamic, WSEvent, EventHandler, subscribe(), subscribers

### Community 144 - "Core Mcpserver Basemodel"
Cohesion: 0.22
Nodes (7): BaseModel, Information about an open browser session., Response returned when a session is closed., Close a persistent session and free its resources. :param session_id: The…, List all active sessions with their details, including the effective settings…, SessionClosedModel, SessionInfo

### Community 145 - "Test Tests Mcp"
Cohesion: 0.33
Nodes (4): _normalize_credentials(), Convert a credentials dictionary to a tuple accepted by fetchers., Test the _normalize_credentials helper, TestNormalizeCredentials

### Community 146 - "Core Storage Sqlitestoragesystem"
Cohesion: 0.22
Nodes (5): Any, HtmlElement, Saves the elements unique properties to the storage for retrieval and…, Using the identifier, we search the storage and return the unique properties of…, Saves the element's unique properties to the storage for retrieval and…

### Community 148 - "Request Spiders Convert"
Cohesion: 0.22
Nodes (6): _convert_to_bytes(), Any, Prepare state for pickling - store callback as name string for pickle…, Restore state from pickle - callback restored later via _restore_callback()., Generate a unique fingerprint for deduplication. Caches the result in self._fp…, _stable_value_repr()

### Community 149 - "Test Tests Parser"
Cohesion: 0.25
Nodes (5): asyncio, Test relocating element after structure change, Adaptive relocation with `auto_save=True` must not crash when no element clears…, Test relocating element after structure change in async mode, TestParserAdaptive

### Community 150 - "Test Tests Parser"
Cohesion: 0.22
Nodes (5): Test finding multiple matches with regex, Test finding the first match with regex, Test finding elements with partial text match, Test finding elements with exact text match, TestTextMatching

### Community 151 - "Parser Test Tests"
Cohesion: 0.22
Nodes (5): Test advanced Selector features like adaptive matching, Test adaptive initialization with custom storage, Test adaptive initialization with default storage args, Test adaptive initialization with existing storage object, TestSelectorAdvancedFeatures

### Community 152 - "Cli Test Tests"
Cohesion: 0.25
Nodes (6): group, extract(), main(), Extract content from web pages and save to files, Test that the --version flag prints the Scrapling version and exits, version_option

### Community 153 - "Spiders Templates Shopify"
Cohesion: 0.39
Nodes (3): Any, A spider that extracts all products from any Shopify-powered website through…, ShopifySpider

### Community 154 - "Spiders Templates Site"
Cohesion: 0.25
Nodes (4): Any, Yield the page as a Markdown item, then follow its links through the crawl…, Write the item to a Markdown file inside `output_dir` when it's set., Build a unique filesystem-safe name from the URL, suffixing a hash on…

### Community 155 - "Test Tests Fetchers"
Cohesion: 0.25
Nodes (4): Test harmful default arguments, Test default stealth flags, Test default disabled resources, TestConstants

### Community 156 - "Test Impersonate List"
Cohesion: 0.25
Nodes (5): Test type validation for impersonate parameter., Test that impersonate accepts string type., Test that impersonate accepts list type., Test that impersonate accepts None., TestImpersonateTypeValidation

### Community 157 - "Test Response Markdown"
Cohesion: 0.39
Nodes (3): _make_response(), Scripts, styles, and hidden elements are stripped even without main_content_only, TestResponseMarkdown

### Community 158 - "Test Tests Spiders"
Cohesion: 0.39
Nodes (3): _prefetch_robots_txt warms the robots.txt cache before the crawl loop., Return (fetch_fn, calls_list) where calls_list records every (url, sid) pair., TestPrefetchRobotsTxt

### Community 159 - "App Src Chatbot"
Cohesion: 0.57
Nodes (5): GET(), POST(), getAdapter(), listChannels(), registry

### Community 160 - "App Src Server"
Cohesion: 0.52
Nodes (5): format(), formatAll(), formatForTelegram(), formatForWeb(), formatForWhatsApp()

### Community 161 - "Test Tests Parser"
Cohesion: 0.29
Nodes (4): A single class token should match elements that carry other classes too, Multiple class tokens all have to be present, regardless of order, A blank class has no names to match, so it must match `class=""` instead of…, TestFindByClass

### Community 162 - "Test Tests Parser"
Cohesion: 0.29
Nodes (4): Test various invalid Selector initializations, Test invalid storage parameter, Test handling of invalid selectors, TestErrorHandling

### Community 163 - "Tests Spiders Test"
Cohesion: 0.29
Nodes (3): _LogCounterStub, Exception, Stub for LogCounterHandler.

### Community 164 - "App Src Layout"
Cohesion: 0.40
Nodes (3): inter, metadata, Providers()

### Community 166 - "Test Tests Fetchers"
Cohesion: 0.33
Nodes (4): Test Response class functionality, Test Response object creation, Test Response with 'bytes' content, TestResponse

### Community 167 - "Parser Test Tests"
Cohesion: 0.33
Nodes (4): Test advanced Selectors functionality, Test filtering operations on Selectors, Test Selectors properties, TestSelectorsAdvanced

### Community 168 - "Test Tests Spiders"
Cohesion: 0.33
Nodes (4): Tests for the result module (ItemList, CrawlStats, CrawlResult)., Integration tests for result classes., Test realistic workflow with all result classes., TestCrawlResultIntegration

### Community 169 - "Test Tests Spiders"
Cohesion: 0.33
Nodes (4): Test BLOCKED_CODES constant., Test that BLOCKED_CODES contains expected HTTP status codes., Test that success codes are not blocked., TestBlockedCodes

### Community 170 - "Test Engines Toolbelt"
Cohesion: 0.40
Nodes (4): OSName, get_os_name(), Get the current OS name in the same format needed for browserforge, if the OS…, Test OS name detection

### Community 171 - "Webhook Api Testing"
Cohesion: 0.50
Nodes (4): route, apollo_webhook(), Apollo enrichment webhook receiver. Apollo POSTs phone-enrichment results here…, utcnow()

### Community 172 - "Config Apollo Api"
Cohesion: 0.60
Nodes (4): _bool_env(), _list_env(), load_config(), Configuration for the alternative Apollo extraction engine. TRIGGER_MODE…

### Community 176 - "Parser Selector Getall"
Cohesion: 0.40
Nodes (3): Returns the serialized string of the first element, or ``default`` if empty.…, Return a single-element list containing this element's serialized string., _T

### Community 179 - "Test Tests Parser"
Cohesion: 0.40
Nodes (3): Test selecting reviews with high ratings, Test selecting products above a certain price, TestXPathSelectors

### Community 180 - "Test Tests Parser"
Cohesion: 0.40
Nodes (3): Test finding similar product elements, Test finding similar review elements with additional filtering, TestSimilarElements

### Community 181 - "Test Tests Parser"
Cohesion: 0.40
Nodes (3): Test that Selector objects cannot be pickled, Test custom string representations of objects, TestPicklingAndRepresentation

### Community 182 - "Test Tests Parser"
Cohesion: 0.40
Nodes (3): Test converting content to JSON, Test various attribute-related operations, TestJSONAndAttributes

### Community 183 - "Test Tests Parser"
Cohesion: 0.40
Nodes (3): Test selecting all product elements, Test selecting in-stock products, TestCSSSelectors

### Community 186 - "App Scripts Test"
Cohesion: 0.83
Nodes (3): fetchUrl(), run(), unwrapBingUrl()

### Community 188 - "Tests Parser Test"
Cohesion: 0.50
Nodes (3): nested_page(), fixture, Tests for Selector.iterancestors() and Selector.find_ancestor() methods. Target…

### Community 189 - "Tests Parser Test"
Cohesion: 0.50
Nodes (3): product_page(), fixture, Tests for Selector.find_similar() with non-default parameters. Target file:…

### Community 190 - "Test Tests Spiders"
Cohesion: 0.50
Nodes (3): Test Spider pause functionality., Test that pause without active engine raises RuntimeError., TestSpiderPause

### Community 191 - "Test Tests Spiders"
Cohesion: 0.50
Nodes (3): Test Spider stats property., Test that accessing stats without active crawl raises., TestSpiderStats

## Knowledge Gaps
- **195 isolated node(s):** `scrapling`, `$schema`, `name`, `title`, `description` (+190 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1767 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **44 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Response` connect `Spiders Templates Test` to `Spiders Test Session`, `Test Spiders Tests`, `Parser Selector Test`, `Spider Spiders Test`, `Fetchers Test Requests`, `Shell Cli Test`, `Parser Shell Core`, `Stealth Fetchers Test`, `Test Response Markdown`, `Engines Toolbelt Convertor`, `Sitemap Spiders Test`, `Core Mcpserver Fetch`, `Test Tests Fetchers`, `Integrations Scra Tests`, `Engines Toolbelt Custom`, `Test Feed Tests`, `Engines Static Asyncsessionlogic`, `Cache Spiders Test`, `Test Tests Mcp`, `Test Tests Spiders`, `Shell Test Core`, `Engines Static Configurationlogic`, `Engines Browsers Controllers`, `Test Tests Fetchers`?**
  _High betweenness centrality (0.237) - this node is a cross-community bridge._
- **Why does `Request` connect `Spiders Templates Test` to `Spiders Test Session`, `Test Spiders Engine`, `Test Spiders Tests`, `Scheduler Test Spiders`, `Checkpoint Test Spiders`, `Spider Spiders Test`, `Shell Cli Test`, `Test Request Tests`, `Test Tests Spiders`, `Request Spiders Convert`, `Spiders Templates Shopify`, `Spiders Templates Site`, `Test Checkpoint Force`, `Test Tests Spiders`, `Sitemap Spiders Test`, `Tests Spiders Test`, `Test Tests Spiders`, `Test Engine Tests`, `Test Feed Tests`, `Test Tests Spiders`, `Test Tests Spiders`, `Test Tests Spiders`, `Spiders Templates Feed`, `Test Tests Spiders`, `Test Tests Spiders`, `Test Spider Tests`, `Tests Spiders Test`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **Why does `Selector` connect `Parser Selector Test` to `Test Find Similar`, `Spiders Templates Test`, `Parser Core Custom`, `Fetchers Test Requests`, `Engines Browsers Base`, `Shell Cli Test`, `Parser Shell Core`, `Test Attributes Tests`, `Test Tests Parser`, `Websearch Test Tests`, `Cli Test Tests`, `Parser Test Tests`, `Test Tests Parser`, `Test Tests Parser`, `Parser Test Tests`, `Parser Selector Getall`, `Tests Parser Test`, `Tests Parser Test`, `Test Response Handling`, `Parser Test Advanced`, `Test Tests Parser`, `Shell Test Core`, `Core Storage Test`, `Cli Test Tests`, `Test Tests Parser`, `Core Storage Test`, `Parser Selector Css`, `Test Filter Selectors`, `Benchmarks Test Bs4`, `Core Mixins Selectorsgeneration`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `Selector` (e.g. with `Convertor` and `CustomShell`) actually correct?**
  _`Selector` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Are the 54 inferred relationships involving `Request` (e.g. with `CrawlerEngine` and `Response`) actually correct?**
  _`Request` has 54 INFERRED edges - model-reasoned connections that need verification._
- **Are the 19 inferred relationships involving `Response` (e.g. with `__Request_and_Save()` and `_translate_response()`) actually correct?**
  _`Response` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `SessionManager` (e.g. with `CrawlerEngine` and `Request`) actually correct?**
  _`SessionManager` has 17 INFERRED edges - model-reasoned connections that need verification._