# Workspace Agent Rules

## Mandatory Graphify Consultation Before Answers & Changes
When working in this repository:
1. **Always Consult Graphify**:
   - Before answering architectural questions, tracing code paths, or making source code changes, inspect the knowledge graph in `graphify-out/` (`graph.json`, `GRAPH_REPORT.md`, or run `graphify query "<question>"`).
2. **Impact & Dependency Analysis**:
   - Use the graph to check caller/callee edges, community boundaries, god nodes, and potential breaking ripple effects before modifying existing functions or classes.
3. **Graph Consistency**:
   - Keep `graphify-out/` updated when significant structural code changes occur.

## Mandatory SF Pro Typography & 100 / 300 / 700 Weightage Rule
When implementing or modifying any UI in this repository:
1. **Font Family**:
   - SF Pro (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", sans-serif`) is the mandatory primary typography across the entire interface.
2. **Strict 3-Tier Weightage Scale**:
   - Only 3 font weights are permitted for UI typography:
     - **`100` (Thin / Ultralight)**: Ambient metadata, timestamps, secondary captions, inactive counters, and ghost indicators.
     - **`300` (Light)**: Default reading body text, descriptions, unselected card titles, and standard interactive controls.
     - **`700` (Bold)**: Primary emphasis, active / selected items, key metric numbers, and hero labels.
3. **Interactive Weightage Transitions**:
   - Every UI interactive change (hover, active, select) must dynamically interact with this weightage scale:
     - Ambient text shifts from `100` to `300` on hover.
     - Interactive titles and controls shift from `300` to `700` on hover or when selected.
