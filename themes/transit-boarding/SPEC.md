# Transit & Boarding Pass — Visual Specification

## Aesthetic Identity
Inspired by Japanese Shinkansen / JR thermal transit tickets, international airport boarding passes, and nocturnal split-flap departure boards — engineered for GitHub's `846px` README canvas:
- **Tactile Ticket Geometry**: Crisp semicircular tear-off punch notches, dashed perforation lines, deterministic Code-128 style vector barcodes (`shape-rendering="crispEdges"`), and high-contrast wayfinding line badges.
- **Light Mode (Thermal Transit Ticket)**: Warm ticket stock (`#FAF6EE`) & crisp cream card surfaces (`#FFFDF9`), obsidian ink (`#15171A`), signal vermilion (`#D93829`), transit cobalt (`#1B56B5`), platform emerald (`#168052`), and express ochre (`#C98212`).
- **Dark Mode (Split-Flap Departure Board)**: Nocturnal terminal obsidian (`#111317`) & flap panels (`#181B21`), warm off-white ink (`#F4F1EA`), split-flap amber (`#F59E0B`), concourse sky (`#60A5FA`), boarding emerald (`#34D399`), and express rose (`#FB7185`).

## Module Dimensions
- `hero-{light,dark}.svg`: `846×300` — notched boarding pass split into a left main pass (`0..608`) and a right detachable passenger stub (`608..846`) along a dashed perforation line with top/bottom semicircular punch notches. Left features the `DEV ✈ OSS` route lockup, passenger handle + bio, and 4 boarding boxes (`GATE`, `SEAT`, `CLASS`, `MILES`). Right stub frames a `24×24` crisp vector pixel passport portrait/emblem (`<path shape-rendering="crispEdges">`), a calm boarding-LED blink animation (`@media (prefers-reduced-motion: reduce)` guarded), and a sharp vector barcode strip.
- `btn-*-{light,dark}.svg`: `height="30"` — ticket-punched metro line validation pills (`[L1]`..`[L4]`).
- `sec-*-{light,dark}.svg`: `846×40` — metro station wayfinding signboards with colored line-badge circles (`L1`, `L2`) and directional route arrows.
- `card-*-{light,dark}.svg`: `417×196` — metro-line station transfer cards (`2×2`, `width="49%"`) with side ticket notches, colored horizontal transit route bar + circular interchange nodes (`○—●—○`), station codes (`ST-01`..`ST-04`), and perforated bottom fare/spec ticket stub.
