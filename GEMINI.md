# Gemini & Agent Workspace Rules

## Mandatory Graphify Knowledge Graph Rule
Before answering codebase architecture questions or making changes/refactors to code:
- **Consult `graphify-out/`**: Inspect `graphify-out/graph.json` or `graphify-out/GRAPH_REPORT.md` (or run `graphify query "<question>"`) to understand connected components, callers, callees, and dependencies.
- **Trace Impact**: Verify if the modified node is a God Node or a cross-community bridge before applying edits.
- **Avoid Circular Dependencies**: Check existing cycle warnings in `GRAPH_REPORT.md`.

## Mandatory SF Pro Typography & 100 / 300 / 700 Weightage Rule
- **Primary Font**: SF Pro (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", sans-serif`) is required across all UI components.
- **Strict 3-Tier Weightage**:
  - `100` (Thin / Ultralight): Ambient metadata, timestamps, counters, ghost text.
  - `300` (Light): Standard body text, descriptions, inactive headers, card titles.
  - `700` (Bold): Emphasis, active / selected states, key metrics.
- **Interaction Dynamic**: Every interactive state (hover, focus, active, select) must actively transition between these weights (e.g., `100` -> `300` on hover, `300` -> `700` on hover/selection).

