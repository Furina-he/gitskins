# Editorial Broadsheet Zine — Visual Specification

## Visual Grammar
- **Material & Tone**: Timeless independent print monograph & Swiss broadsheet typography. Zero neon glows, zero clutter, maximum typographic poise.
  - **Light**: Archival warm paper (`#F7F3EA`), editorial ink (`#141311`), muted sepia stone (`#6E685E`), vermilion stamp accent (`#C93B2B`).
  - **Dark**: Warm obsidian press (`#131210`), bone ivory (`#F0EBE1`), warm charcoal rules (`#33302B`), luminous vermilion (`#E45847`).
- **Typographic Voice**:
  - Monumental serif display (`Georgia, "Times New Roman", serif`) for the nameplate, italic deck, section titles, and plate headings.
  - Tracked uppercase monospace (`JetBrains Mono`) for volume/issue metadata, plate labels (`PLATE I`..`PLATE IV`), and technical colophon footnotes.
- **Broadsheet Hero (`846x302`)**:
  - Classic double-rule newspaper header (`2px` heavy bar + `3px` gap + `0.8px` hairline) framing `VOL. IV · NO. 12`, `OPEN-SOURCE MONOGRAPH`, and `EDITION 2026`.
  - Left editorial column (`x=28..530`): large serif nameplate with vermilion square full stop, italic deck description, and subtle horizontal pull-quote divider.
  - Right colophon ledger (`x=564..818`): structured 6-row editorial metadata table separated by crisp hairlines.
- **2x2 Magazine Feature Plates (`417x196`)**:
  - Top `3px` editorial ink rule (vermilion / cobalt / forest / ochre), Roman plate label, subtle line-art colophon mark, bold serif title, generous two-line prose, and hairline technical colophon strip.

## Verification Requirements
1. Strict XML validation on all SVGs.
2. Check Light & Dark contrast, serif legibility, and balanced ledger row alignment at `846px` width.
