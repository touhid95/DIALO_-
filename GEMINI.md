# Gemini & Agent Workspace Rules

## Mandatory Graphify Knowledge Graph Rule
Before answering codebase architecture questions or making changes/refactors to code:
- **Consult `graphify-out/`**: Inspect `graphify-out/graph.json` or `graphify-out/GRAPH_REPORT.md` (or run `graphify query "<question>"`) to understand connected components, callers, callees, and dependencies.
- **Trace Impact**: Verify if the modified node is a God Node or a cross-community bridge before applying edits.
- **Avoid Circular Dependencies**: Check existing cycle warnings in `GRAPH_REPORT.md`.
