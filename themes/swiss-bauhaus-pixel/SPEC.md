# Swiss-Bauhaus Pixel Poster — Visual Specification

## Visual Grammar
- **Geometry**: Strict `0px` corners and crisp `1px` architectural rules (`#0A0A0A` in Light, `#2E313D` in Dark). Zero rounded pills, zero blurry drop shadows, zero decorative emoji clutter.
- **Surfaces**:
  - Light: Warm gallery paper (`#FAF9F5`) with `#FFFFFF` card panels and pitch ink (`#0A0A0A`).
  - Dark: Deep slate ink (`#101115`) with `#16181F` terminal surfaces and `#F4F4F6` foreground text.
- **Typography**:
  - Monumental 9-row geometric pixel display wordmark (`<path shape-rendering="crispEdges">`) for the developer handle and 4 bottom metric counters.
  - Display sans (`Inter Tight` / system sans fallback) for headlines & 2-line project copy.
  - Monospace (`JetBrains Mono` / Consolas fallback) for parenthetical tags `(projects)`, spec strips, and `$` terminal lines.
- **Orthogonal Pixel Weaves (`6x6` grid)**:
  - Hero right field: `plus` weave tinted to the developer's primary accent color (e.g. Hydro Blue `#7CC4FA` / `#4CA4EC` light, `#14243A` / `#1F3C63` dark).
  - 2x2 Project Cards (`417x194`, `width="49%"` in README): `cross` (Cobalt), `plus` (Sodium Orchid), `tartan` (Emerald x Cobalt), `basket` (Signal Amber).
- **Signature Portrait**:
  - Framed `28x28` graphic pixel portrait of the user's actual GitHub avatar inside a `142x142` frame with a `4px` hard-edge Bauhaus shadow.
  - Subtle `5.2s` step blink animation + `1.4s` terminal block cursor, both disabled under `@media (prefers-reduced-motion: reduce)`.
- **Project Cards**:
  - Top weave band (`54px` height) carrying a sharp black index badge `(01) Category` on the left and a custom `16x16` pixel emblem inside a `44x44` black square on the right.
  - Title (`20px` bold) + right-aligned link, crisp 2-line summary, bottom hairline divider, and mono spec strip (`Language · Stack · Stars · License`).

## Verification Requirements
1. Every generated `.svg` must pass strict XML parsing (`xml.etree.ElementTree.fromstring`).
2. Render both Light and Dark previews at `846px` width and verify zero text clipping, balanced pill padding, and cursor alignment right after the terminal text.
3. Verify all external links return HTTP `200` before publishing.
