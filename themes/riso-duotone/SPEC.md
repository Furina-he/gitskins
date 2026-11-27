# Risograph Overprint Poster — Visual Specification

## Aesthetic Identity
Independent Tokyo & London Risograph studio print posters engineered for GitHub's `846px` README canvas — pure graphic print craft with zero photographic portraits:
- **Light Mode**: Uncoated warm cream stock (`#F8F3E8`) and crisp off-white print surface (`#FDFBF5`) with deep indigo ink (`#17203B`), **Cobalt Blue** Plate A (`#0066CC`), **Fluorescent Coral** Plate B (`#FF4F5E`), emerald spot ink (`#0E9472`), and golden amber (`#F59E0B`).
- **Dark Mode**: Midnight matte cardstock (`#121318`) and charcoal surface (`#1A1C24`) with warm chalk ink (`#F7F4EC`), **Fluorescent Cyan** Plate A (`#22D3EE`), **Fluorescent Pink** Plate B (`#FF5E7E`), mint spot ink (`#34D399`), and metallic gold (`#F5B700`).
- **Signature Geometry**:
  - Intentional `2–3px` misregistered duotone ink overprints across headlines, buttons, plate tags, and card shadows.
  - Staggered halftone dot screen `<pattern>` fields.
  - Four-corner vector print registration crosshairs (`⊕`).
  - Right-side overprinted geometric Bauhaus/Riso emblem with subtle counter-drifting ink plates (`@keyframes` strictly wrapped in `@media (prefers-reduced-motion: reduce)`).
  - High-contrast print-proof badges and 4-step ink-density calibration bars (`>= 4.5:1` WCAG AA contrast on all legible text).

## Module Dimensions
- `hero-{light,dark}.svg`: `846×300` — poster sheet with 4 corner registration crosshairs, edition masthead (`EDITION 011 // 2-INK RISO`), `2.5px` misregistered duotone headline, right-hand halftone field + animated overprinted Bauhaus-Riso geometric emblem with custom monogram punch-out, press-proof color swatch bar, and 4-column print-spec metric strip.
- `btn-*-{light,dark}.svg`: `height="30"` — misregistered duotone offset stamp buttons (solid ink shadow shifted `2.5px` behind a crisp outlined plate with mini registration mark).
- `sec-*-{light,dark}.svg`: `846×40` — bold 2-ink overprint band with offset plate tag (`+ PLATE 01`, `+ PLATE 02`), misregistered display heading, halftone dot strip, and right-hand knockout registration spec pill.
- `card-*-{light,dark}.svg`: `417×196` — riso art-print cards (`2×2`, `width="49%"`) with `3.5px` misregistered colored ink shadow layer, halftone header block, bold print number stamp (`01`–`04`), misregistered display title, 2-line description, stack metadata, 4-step ink-density swatch bar, and crisp `OPEN ↗` footer.
