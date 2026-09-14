# SF Pro Typography & 100 / 300 / 700 Interactive Weightage Rule

## 1. Font Family
- **Primary Typography**: Apple SF Pro (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", sans-serif`).
- High-fidelity webfont loading is provided in `globals.css` ensuring pixel-perfect rendering across Windows, Linux, Android, and macOS.

## 2. Permitted Font Weights (Strict 3-Tier Weightage Scale)
Only three font weights are permitted across all user interface components:
- **`100` (Thin / Ultralight)**: Ambient metadata, secondary timestamps, inactive counters, subtle helper labels, and ghost guidelines.
- **`300` (Light)**: Default reading body text, hypotheses, explanations, unselected card titles, and standard interactive controls.
- **`700` (Bold)**: Primary emphasis, active / selected items, key metric numbers, hero badges, and primary action verbs.

## 3. Interactive Weightage Dynamic
Every interactive state change (hover, active, selected, focus) must actively play with and transition across this 3-tier weightage scale:
- **Idle -> Hover**:
  - Ambient captions / timestamps transition from `font-thin-100` (100) to `font-light-300` (300).
  - Unselected item titles and interactive controls transition from `font-light-300` (300) to `font-bold-700` (700).
- **Selection / Active State**:
  - The active lead title, active navigation tab, and active filter pill maintain `font-bold-700` (700).
- **Smoothness**:
  - Use `.interactive-weight` or `transition: font-weight 0.2s cubic-bezier(0.16, 1, 0.3, 1)` to prevent layout jumpiness and create an Apple-grade tactile feel.
