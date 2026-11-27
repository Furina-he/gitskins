# Solder Mask PCB — Visual Specification

## Aesthetic Identity
Precision printed circuit board (PCB) hardware engineering translated cleanly to GitHub's `846px` README canvas:
- **Light Mode (Matte White Solder Mask)**: Matte ceramic-white FR-4 substrate (`#F5F5F2`) with crisp dark emerald silkscreen ink (`#16211B` / `#1C4F38`), ENIG immersion gold pads & vias (`#B87D14` / `#D49B1A`), deep trace green (`#1C6B4A`), and solder-flux cyan (`#0D7D8C`).
- **Dark Mode (Classic Emerald ENIG PCB)**: Deep solder-mask emerald green (`#0B1F17`) with elevated board panels (`#102B20`), high-contrast white silkscreen (`#F2F7F4`), bright ENIG immersion gold traces & pads (`#E5B84B`), live signal green (`#34D399`), and probe cyan (`#38BDF8`).
- **Signature Hardware Geometry**:
  - 4 ENIG gold-plated corner mounting holes with concentric annular rings, drill centers, and thermal-relief stitching vias (`◎`).
  - Authentic 45° angled copper trace routing networks terminated with gold via pads (`via_pad`).
  - Central **QFP-32 Silicon IC Package (`U1 · DEV-SOC`)** surrounded by 32 gull-wing gold leads, Pin-1 orientation bevel & gold dot, neighboring SMD passive footprints (`R01`, `C02`, `VCC`, `GND`), and calm animated ENIG gold signal pulses (`@keyframes` strictly guarded by `@media (prefers-reduced-motion: reduce)`).
  - Pure circuit-board visual language — no photo portrait by design.

## Module Dimensions & Anatomy
- `hero-{light,dark}.svg` (`846×300`):
  - Routed FR-4 board outline (`rx="5"`) + inner silkscreen courtyard + 4 corner ENIG mounting holes.
  - Top silkscreen revision bar: `REV 2.6 // PCB-846 · ENIG GOLD`, board stackup specs, and `3V3 PWR` live LED indicator.
  - Left silkscreen zone (`x=42..552`): display handle, silkscreen handle badge, engineering summary, and framed `BUS` tech-stack callout.
  - Right IC zone (`x=562..804`): `U1 · DEV-SOC` QFP-32 silicon chip with gull-wing gold pins, `R01`/`C02` SMD passives, `VCC`/`GND` symbols, and animated 45° copper signal pulses.
  - Bottom pin-header rail (`PIN 01`–`PIN 04`): plated square Pin-1 pad + circular gold through-hole pads for 4 factual profile metrics.
- `btn-*-{light,dark}.svg` (`height="30"`):
  - Gold-finger card-edge connector tabs with 3 left-edge ENIG contact fingers, solder pad dots, and mono `J1`–`J4` connector labels.
- `sec-*-{light,dark}.svg` (`846×40`):
  - Silkscreen bus dividers (`BUS 01 // IC MODULES`, `BUS 02 // CLOCK & COMMITS`) featuring differential-pair 45° trace jogs anchored by ENIG gold vias.
- `card-*-{light,dark}.svg` (`417×196`, `2×2` at `width="49%"`):
  - SMD/IC component footprint cards (`U1`–`U4`) with 6 left & 6 right gold IC lead pins, 4 corner gold vias, silkscreen Pin-1 dot, package code stamp, crisp 2-line description, and bottom test-point spec bar (`TP1`–`TP4`).

## Verification Requirements
1. Strict XML well-formedness (`xml.etree.ElementTree.fromstring` + `node cli/gitskins.mjs validate`).
2. Zero `<script>`, zero `on*=` attributes, zero external `<image href="http...">`, and `prefers-reduced-motion: reduce` protection on every `@keyframes` animation.
3. Verify WCAG text contrast `>= 4.5:1` across both Matte White (Light) and Deep Emerald (Dark) solder masks, and confirm generous monospace width headroom across Windows/macOS/Linux.
