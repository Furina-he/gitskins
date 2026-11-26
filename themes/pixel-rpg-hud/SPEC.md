# 16-bit Pixel RPG HUD — Visual Specification

## Aesthetic Identity
A crisp 16-bit console / handheld RPG status interface engineered for GitHub's `846px` README canvas:
- **Zero fuzzy glow or blurry shadows** — every frame uses stepped `2px` pixel bevels (`shape-rendering="crispEdges"`) and corner rivets.
- **Light Mode**: Warm classic manual parchment (`#F6F2E4`) with crisp obsidian borders (`#1B1E2E`) and quest gold (`#D97706`).
- **Dark Mode**: Classic 16-bit midnight battle menu (`#121524`) framed in gold (`#EAB308`), HP crimson (`#F87171`), emerald (`#4ADE80`), and mana cyan (`#38BDF8`).

## Module Dimensions
- `hero-{light,dark}.svg`: `846×304` — top guild banner, character handle + class bio, HP/MP/XP segmented bars, right-hand framed pixel relic emblem with twinkling star animation (`prefers-reduced-motion`), and 4-column inventory strip.
- `btn-*-{light,dark}.svg`: `height="30"` stepped RPG command pills.
- `sec-*-{light,dark}.svg`: `846×36` quest-log section headers.
- `card-*-{light,dark}.svg`: `417×196` quest cards (`2×2`, `width="49%"`) featuring rarity stars and custom `12×12` pixel-art icons.
