# Workspace Agent Rules

## Mandatory Graphify Consultation Before Answers & Changes
When working in this repository:
1. **Always Consult Graphify**:
   - Before answering architectural questions, tracing code paths, or making source code changes, inspect the knowledge graph in `graphify-out/` (`graph.json`, `GRAPH_REPORT.md`, or run `graphify query "<question>"`).
2. **Impact & Dependency Analysis**:
   - Use the graph to check caller/callee edges, community boundaries, god nodes, and potential breaking ripple effects before modifying existing functions or classes.
3. **Graph Consistency**:
   - Keep `graphify-out/` updated when significant structural code changes occur.

## Mandatory Dual-Platform Typography: Roboto Flex (Android & Browsers) & SF Pro (iOS)
When implementing or modifying any UI in this repository:
1. **Dual-Engine Typography**:
   - **Android & Web Browsers**: **Roboto Flex** (`'Roboto Flex', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`) is the mandatory primary font with variable axes (`wght`, `wdth`, `opsz`).
   - **iOS / Apple Mobile Devices**: **SF Pro** (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", sans-serif`) is the mandatory primary font.
   - Dynamic platform selection is driven by early execution platform tags (`platform-ios`, `platform-android`, `platform-browser`) mapping to `--font-primary`.
2. **Strict 3-Tier Weightage Scale**:
   - Only 3 font weights are permitted for UI typography:
     - **`100` (Thin / Ultralight)**: Ambient metadata, timestamps, secondary captions, inactive counters, and ghost indicators (`font-variation-settings: 'wght' 100, 'wdth' 100, 'opsz' 14`).
     - **`300` (Light)**: Default reading body text, descriptions, unselected card titles, and standard interactive controls (`font-variation-settings: 'wght' 300, 'wdth' 100, 'opsz' 16`).
     - **`700` (Bold)**: Primary emphasis, active / selected items, key metric numbers, and hero labels (`font-variation-settings: 'wght' 700, 'wdth' 105, 'opsz' 48`).
3. **Interactive Weightage Transitions**:
   - Every UI interactive change (hover, active, select) must dynamically interact with this weightage scale:
     - Ambient text shifts from `100` to `300` on hover.
     - Interactive titles and controls shift from `300` to `700` on hover or when selected.
