# Contributing to GitSkins

GitSkins welcomes both **full Profile Themes** (`themes/<theme-id>/`) and **skin-adaptive DIY Widgets** (`web/src/widgets/`). Before opening a PR, please read [docs/architecture.md](docs/architecture.md) and [docs/widgets-system.md](docs/widgets-system.md).

---

## 1. Contributing a Theme

Every theme lives in a self-contained folder under `themes/<theme-id>/`. Running `python scripts/build_all.py` schema-validates `meta.json` (including Semantic Theme Tokens), XML-validates every SVG, and registers the theme in `web/public/themes/manifest.json`.

```text
themes/<theme-id>/
├── meta.json          # Metadata, palette swatches, semantic tokens.{light,dark}, buttons & cards
├── SPEC.md            # Visual grammar, exact tokens, dimensions, verification rules
├── PROMPT.md          # Zero-config Agent prompt with <!-- LANG:EN --> and <!-- LANG:ZH --> blocks
├── generator.py       # Deterministic Python script that writes Light & Dark SVGs into assets/
├── README.demo.md     # Example GitHub Profile README markup
└── assets/            # Generated Light & Dark SVGs (validated by scripts/build_all.py)
```

### Theme Quality Standards
1. **True Light & Dark Parity**: Define both `palette.{light,dark}` and all 14 semantic keys in `tokens.{light,dark}` (see [docs/architecture.md](docs/architecture.md)). Never invert colors blindly.
2. **846px GitHub Width Discipline**: Hero & section headers use `846px` viewBox width; 2×2 project cards use `417px` viewBox width (`width="49%"` in README).
3. **Calm, Accessible Motion**: Keep micro-animations slow and non-strobing, and wrap them with `@media (prefers-reduced-motion: reduce)`.
4. **Strict XML & Safe Font Fallbacks**: Every SVG must parse with `xml.etree.ElementTree.fromstring` and gracefully fall back across macOS, Windows, and Linux system fonts.
5. **Zero-Config Agent Prompt**: Prompts must instruct the user's agent to auto-detect their GitHub identity via `gh` / `git config` and use factual repository data only.

---

## 2. Contributing a DIY Widget

Widgets are lower-barrier modular components rendered in-browser across all themes.

1. Define the widget config interface in `web/src/widgets/types.ts`.
2. Implement a deterministic pure SVG renderer in `web/src/widgets/renderers.ts` consuming `ThemeTokens` + `themeId` so the widget adapts automatically across all skins (Light & Dark).
3. Register metadata, supported sizes (`full` / `half` / `tile` / `strip` / `sticker`), and supported slots (`top` / `hero-overlay` / `under-hero` / `under-cards` / `bottom`) in `web/src/widgets/catalog.ts`.
4. Add DIY parameter controls in `web/src/components/WidgetsStudio.tsx` and bilingual labels in `web/src/i18n.ts`.
5. Ensure all user text is escaped via `escapeXml()`, truncated/wrapped cleanly for both CJK and ASCII, and passes strict XML validation with zero overlap across all 4 skins.

---

## 3. Verification Before Opening a PR

```bash
python scripts/build_all.py
cd web && pnpm build
```

Include Light & Dark screenshots at `846px` width in your Pull Request!
