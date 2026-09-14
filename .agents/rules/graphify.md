# Graphify Pre-Change & Knowledge Graph Rule

## Mandatory Policy
Before answering questions about the codebase architecture, file relationships, or module interactions, and BEFORE making code changes or refactoring, the agent MUST consult the **graphify knowledge graph** (`graphify-out/`).

## Verification & Investigation Protocol

1. **Pre-Response Check (Architecture & Code Questions)**:
   - Always verify if `graphify-out/graph.json` or `graphify-out/GRAPH_REPORT.md` exists.
   - For codebase relationship queries, trace data flows, or dependency questions:
     - Run `graphify query "<question>"` or inspect `graphify-out/graph.json` / `graphify-out/GRAPH_REPORT.md`.
     - Cross-reference god nodes, community clusters, and betweenness-centrality bridge nodes.

2. **Pre-Modification Impact Analysis (Before Code Changes)**:
   - Identify the target file/function in the graph.
   - Inspect dependent nodes (callers, callees, imports, type references).
   - Check if the modified entity is a "God Node" or a bridge across multiple communities (e.g. `Response`, `Request`, `Selector`, `SessionManager`, `ScraplingMCPServer`).
   - Ensure proposed modifications do not introduce circular dependencies (reference `## Import Cycles` in `GRAPH_REPORT.md`).

3. **Post-Change Graph Synchronization**:
   - When new files or structural relationships are introduced, update the knowledge graph using graphify (`--update` mode) so the graph remains in sync with the codebase state.
