# Architectural Blueprint CAD — Visual Specification

## Visual Grammar
- **Material & Atmosphere**: Authentic engineering blueprint drafting sheet.
  - **Dark**: Classic Prussian Blueprint Navy (`#0A1E38`) with crisp coordinate grid (`#112D52` minor / `#1B4070` major), drafting-white ink (`#EAF4FF`), and cyan dimension accents (`#38BDF8`).
  - **Light**: Architectural Vellum Tracing Paper (`#F4F7FB`) with soft drafting-blue grid (`#E3ECF6` minor / `#C9DAEE` major), deep blueprint ink (`#0E2A4D`), and engineering cobalt accents (`#1D5BB8`).
- **Drafting Structural Conventions**:
  - Outer sheet border + `8px` inset inner border with corner registration crosshairs (`⊕`) and engineering zone labels (`A / B / C / D`).
  - Chamfered 45° corner tags (`polygon`) for buttons and project drawing numbers (`DWG-01` .. `DWG-04`).
  - Dimension arrows (`|<--- ... --->|`) and dashed construction lines (`stroke-dasharray="3 3"`).
- **Hero Drafting Sheet (`846x300`)**:
  - Top revision strip: `DWG NO.`, `REV`, `SCALE 1:1`, `STATUS`.
  - Left elevation: uppercase display handle with crisp offset shadow & dimension line, role/stack specs, and chamfered `NOTE 01` callout box.
  - Right target reticle (`x=584..826`): calibrated azimuth rings (`0°/90°/180°/270°`), centered isometric cube schematic, and a calm `16s` orbital sweep arc (`prefers-reduced-motion` safe).
  - Bottom 4-cell CAD Title Block (`DRAWN BY`, `FLAGSHIPS`, `PUBLIC REPOS`, `ECOSYSTEM`).
- **2x2 Project Blueprint Sheets (`417x198`)**:
  - Each card includes a top-left chamfered drawing tag (`DWG-01`), title, concise 2-line engineering summary (strictly kept left of `x=312`), a framed `76x64` custom wireframe schematic diagram on the right, and a bottom BOM spec line.

## Verification Requirements
1. Strict XML validation on every generated SVG.
2. Verify Light (vellum) and Dark (blueprint) contrast >= 4.5:1 on all labels and verify zero overlap between 2-line card copy and the right-hand schematic box.
