# Workspace Agent Rules

## Mandatory Graphify Consultation Before Answers & Changes
When working in this repository:
1. **Always Consult Graphify**:
   - Before answering architectural questions, tracing code paths, or making source code changes, inspect the knowledge graph in `graphify-out/` (`graph.json`, `GRAPH_REPORT.md`, or run `graphify query "<question>"`).
2. **Impact & Dependency Analysis**:
   - Use the graph to check caller/callee edges, community boundaries, god nodes, and potential breaking ripple effects before modifying existing functions or classes.
3. **Graph Consistency**:
   - Keep `graphify-out/` updated when significant structural code changes occur.
