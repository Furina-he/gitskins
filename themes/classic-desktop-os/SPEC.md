# Classic Desktop OS — Visual Specification

## Aesthetic Identity
A crisp retro desktop operating system interface engineered for GitHub's `846px` README canvas, pairing Classic Macintosh System 7 / Platinum with NeXTSTEP Midnight Workstation craft:
- **Zero fuzzy glow or blurry shadows** — every window uses `1px–1.5px` crisp borders, `3px` hard stepped window shadows, 6-line horizontal pin-stripe titlebars, and `shape-rendering="crispEdges"` pixel icons.
- **Light Mode (System 7 / Platinum)**: Warm putty gray chrome (`#E6E5DF`), crisp paper white window canvases (`#FFFFFF`), 1-bit Bayer dot-dither desktop pattern (`#DCDAD2` / `#9C9A92`), solid obsidian borders (`#111111`), and Cobalt OS accent (`#2455C8`).
- **Dark Mode (NeXTSTEP / Midnight Workstation)**: Deep workstation graphite (`#17181D`), elevated slate window interiors (`#202229`), dark dithered backdrop (`#121318` / `#2D303A`), cool silver-bone window rules (`#D8D8D2`), and electric sky highlight (`#60A5FA`).

## Semantic Token Contract
| Token | Light (Platinum) | Dark (NeXTSTEP) | Role |
| :--- | :--- | :--- | :--- |
| `bg` | `#E6E5DF` | `#17181D` | Chrome titlebars, footers, recessed wells |
| `surface` | `#FFFFFF` | `#202229` | Window interior canvas, menu bar, push buttons |
| `ink` | `#111111` | `#F1F1EE` | Primary headings & high-contrast labels |
| `sub` | `#3B3B3F` | `#BCBCC4` | Secondary body text & status captions |
| `muted` | `#6B6B72` | `#868792` | Quiet metadata & subtle structural chrome |
| `border` | `#111111` | `#D8D8D2` | Crisp outer window frames & dividers |
| `borderSoft` | `#B8B7B0` | `#383B46` | Hairline inner rules & inactive partitions |
| `accent` | `#2455C8` | `#60A5FA` | Default action button, primary memory bar, highlights |
| `accentFg` | `#FFFFFF` | `#111318` | Text rendered over `accent` fills (`>= 6.9:1`) |
| `secondary` | `#C93B2B` | `#F87171` | Alert / secondary disk bar & app tag |
| `tertiary` | `#1E824C` | `#4ADE80` | Active system / repo bar & online dot |
| `highlight` | `#C98A00` | `#FACC15` | Memory highlight bar & fourth app tag |
| `patternBg` | `#DCDAD2` | `#121318` | Desktop 1-bit dither base |
| `patternFg` | `#9C9A92` | `#2D303A` | Desktop 1-bit Bayer dot pattern foreground |

## Module Dimensions
- `hero-{light,dark}.svg`: `846×300` — 1-bit dot-dither desktop backdrop (`<pattern>`), top OS menu bar (`File  Edit  View  Special` + crisp vector OS emblem), elevated `About This Developer` window with 6-line horizontal pin-stripe titlebar, top-left close box, top-right zoom box, hard `3px` window shadow, right-hand framed `24×24` pixel vector portrait slot with calm blink & cursor `@keyframes` (`prefers-reduced-motion`), and 4 classic memory/disk stat bars along the footer.
- `btn-*-{light,dark}.svg`: `height="30"` — classic OS push buttons (primary uses iconic System 7 double-border default-action ring; secondary buttons use hard bevelled caps with pixel arrow/window/floppy/folder glyphs).
- `sec-*-{light,dark}.svg`: `846×40` — classic Finder folder header strip with 6 horizontal pin-stripes, crisp pixel folder icon, and right-hand item count plaque (`4 items · 846px`).
- `card-*-{light,dark}.svg`: `417×196` — mini desktop application windows (`2×2`, `width="49%"`) with 6-line pin-stripe titlebar, top-left close box, bespoke `12×12` pixel app icon well, title/description, status bar footer, and bottom-right diagonal resize grip lines.
