# Retro CRT Terminal TUI — Visual Specification

## Visual Grammar
- **Surfaces & Palette**:
  - **Dark**: Deep Phosphor Terminal (`#0A0F12`), chrome bar (`#11181D`), crisp borders (`#22303A`), subtle `4px` horizontal scanline overlay (`opacity=0.04`, zero flashing), Emerald (`#34D399`), Cyan (`#38BDF8`), Amber (`#FBBF24`), Magenta (`#F472B6`).
  - **Light**: Crisp Solarized Paper Terminal (`#F7F5EE`), chrome bar (`#EAE6DA`), borders (`#C8C2B2`), Pine Emerald (`#0E7C5B`), Cobalt (`#1D5FD6`), Rust Amber (`#B45309`), Plum (`#A21CAF`).
- **Hero (`846x306`)**:
  - Top TTY window header bar (`h=28`) with 3 traffic lights, shell path (`<user>@github: ~/profile — zsh`), and `tmux 3.4` tag.
  - Left pane (`x=14..286`): pixel-crisp vector monogram sigil (avoids cross-OS monospace ASCII glyph drift) + `$ whoami` readout with calm `1.4s` blinking block cursor (`prefers-reduced-motion` safe).
  - Right pane (`x=304..832`): structured `neofetch` key-value profile table (`role`, `focus`, `stack`, `flagship`, `repos`, `web`) + classic 8-swatch ANSI terminal palette bar.
  - Bottom `tmux` status bar (`h=24`): `[NORMAL]` pill, numbered window tabs (`0:profile*`, `1..4`), and right-side encoding/status.
- **Action Buttons (`height="30"`)**: CLI command pills (`$ open ...`, `$ gh ...`).
- **2x2 tmux Project Panes (`417x194`)**: Numbered pane tabs (`[1] project.ext`), live status indicator, `> url` line, crisp 2-line terminal description, and bottom language/license spec strip.

## Verification Requirements
1. Strict XML parsing on every generated SVG.
2. Render Light & Dark previews at `846px` width and verify clean monospace column alignment, cursor placement, and zero text overlap across panes.
