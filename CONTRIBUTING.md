# Contributing a Theme to GitSkins

Every theme in GitSkins is a self-contained folder under `themes/<theme-id>/`. When you run `python scripts/build_all.py`, your theme is automatically XML-validated and registered into the live showcase gallery (`web/public/themes/manifest.json`).

## Required Files

```text
themes/<theme-id>/
├── meta.json          # Theme metadata, palette swatches, button/card definitions
├── SPEC.md            # Visual system grammar, exact tokens, dimensions, verification rules
├── PROMPT.md          # Zero-config Agent prompt with <!-- LANG:EN --> and <!-- LANG:ZH --> blocks
├── generator.py       # Deterministic Python script that writes Light & Dark SVGs into assets/
├── README.demo.md     # Example GitHub Profile README markup
└── assets/            # Generated Light & Dark SVGs (validated by scripts/build_all.py)
```

## Theme Quality Standards

1. **True Light & Dark Parity**: Every theme must craft deliberate palettes for both GitHub Light (`#ffffff`) and GitHub Dark (`#0d1117`)—never just invert colors or drop a dark box onto a white page.
2. **846px GitHub Width Discipline**: Hero & section headers use `846px` viewBox width; 2×2 project cards use `417px` viewBox width (`width="49%"` in README).
3. **Calm, Accessible Motion**: Keep micro-animations slow and non-strobing, and always wrap them with `@media (prefers-reduced-motion: reduce)`.
4. **Strict XML & Zero External Font Failures**: Every SVG must parse cleanly with Python's `xml.etree.ElementTree.fromstring` and gracefully fall back on macOS, Windows, and Linux system fonts.
5. **Zero-Config Agent Prompt**: Prompts must instruct the user's agent to auto-detect their GitHub identity via `gh` / `git config` and only use factual repository data.

## Submitting Your PR

```bash
python scripts/build_all.py
cd web && pnpm build
```

Open a Pull Request with Light and Dark preview screenshots of your new theme!
