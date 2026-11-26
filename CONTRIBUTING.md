# Contributing to GitSkins

GitSkins welcomes **full Profile & Repo Themes** (`themes/<theme-id>/`), **skin-adaptive DIY Widgets** (`web/src/widgets/`), and **Zero-503 Live Widgets** (`live-widgets/`). Before opening a PR, please read [docs/architecture.md](docs/architecture.md), [docs/widgets-system.md](docs/widgets-system.md), and [AGENTS.md](AGENTS.md).

---

## 1. Contributing a Theme

Every theme lives in a self-contained folder under `themes/<theme-id>/`. Running `python scripts/build_all.py` schema-validates `meta.json` (including all 14 Semantic Theme Tokens), checks `PROMPT.md` bilingual & zero-leakage gates, XML-validates every SVG, verifies brand icon parity, and registers the theme in `web/public/themes/manifest.json`.

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
1. **True Light & Dark Parity**: Define both `palette.{light,dark}` and all 14 semantic keys in `tokens.{light,dark}` (see [docs/architecture.md](docs/architecture.md)). Never invert colors blindly, and verify text contrast `>= 4.5:1` on tinted headers.
2. **846px GitHub Width Discipline**: Hero & section headers use `846px` viewBox width; 2×2 project cards use `417px` viewBox width (`width="49%"` in README). Leave cross-platform monospace width headroom (Consolas / SFMono / Liberation Mono).
3. **Calm, Accessible Motion**: Keep micro-animations slow and non-strobing, and always wrap them with `@media (prefers-reduced-motion: reduce)`.
4. **Strict XML & Safe Font Fallbacks**: Every SVG must parse with `xml.etree.ElementTree.fromstring` and `node cli/gitskins.mjs validate`, contain zero `<script>` / `on*=` / external `<image href="http...">`, and gracefully fall back across macOS, Windows, and Linux system fonts.
5. **Prompt Personalization & Zero Demo-Data Leakage**:
   - Include both `<!-- LANG:EN -->` and `<!-- LANG:ZH -->` blocks in `PROMPT.md`.
   - Instruct the agent to auto-detect identity via `gh` / `git config`, handle `< 4` repos or missing personal URLs gracefully, and **never invent metrics**.
   - Keep **portrait/avatar behavior consistent** between `PROMPT.md` and `web/src/profile/renderProfileTheme.ts`: if the theme includes a portrait slot, instruct the agent to fetch `avatar_url?s=96` and downsample/quantize it into vector `<path shape-rendering="crispEdges">` paths; if it is a pure typographic/architectural/seal theme, state that explicitly.
   - Include the mandatory **Zero Demo-Data Leakage Check** scanning generated `assets/*.svg` and `README.md` for leftover template author strings (`Furina-he`, `NeverGiveUp`, `cloudlink`, `openpet`, `myfurina`, `blessc.com`).

### End-to-End Theme Touchpoints Checklist
- [ ] `themes/<theme-id>/{meta.json,SPEC.md,PROMPT.md,generator.py,README.demo.md,assets/*.svg}`
- [ ] `web/src/widgets/svgPrimitives.ts` (`renderThemeFrame`, `themeHeadingFont`)
- [ ] `web/src/profile/renderProfileTheme.ts` (Hero, buttons, sections, cards)
- [ ] `web/src/repo/renderRepoSkin.ts` (Repo Hero, Install, Section Header, Feature Card, Arch, Badge)
- [ ] `live-widgets/generate_live_widgets.py` (theme tokens + frame support verified by `--check-all`)
- [ ] `cli/gitskins.mjs` (`FALLBACK_THEMES` + `printHelp()`)
- [ ] `skill/gitskins/SKILL.md`, `docs/architecture.md`, `README.md` & `README_ZH.md` (Theme Gallery + badge/hero counts)

---

## 2. Contributing a DIY or Live Widget

Widgets are lower-barrier modular components rendered across all curated themes (`846px` 4-column Bento Grid).

### Static DIY Widget (`Wxx`)
1. Define the widget config interface in `web/src/widgets/types.ts`.
2. Implement a deterministic pure SVG renderer in `web/src/widgets/renderers.ts` consuming `ThemeTokens` + `themeId` so the widget adapts automatically across **all curated skins** (Light & Dark).
3. Register metadata, supported `colSpan` (`1 | 2 | 3 | 4`), and supported slots (`top` / `hero-overlay` / `under-hero` / `under-cards` / `bottom`) in `web/src/widgets/catalog.ts`.
4. Add DIY parameter controls in `web/src/components/WidgetsStudio.tsx` and bilingual labels in `web/src/i18n.ts`.
5. Update widget tables in `README.md`, `README_ZH.md`, and `cli/gitskins.mjs` (`runList()`).
6. Ensure all user text is escaped via `escapeXml()`, truncated/wrapped cleanly for both CJK and ASCII, and passes strict XML validation with zero overlap across all skins.

### Zero-503 Live Widget (`Lxx`)
Complete the DIY widget steps above, plus:
1. Implement the stdlib-only Python renderer and data fetcher in `live-widgets/generate_live_widgets.py` (zero `pip` dependencies; must pass `--check-all` across every theme).
2. Add any optional secret environment variables to `live-widgets/gitskins-widgets.yml` and `web/src/widgets/workflow.ts`.
3. Document configuration and optional secrets in `docs/live-widgets.md`, `skill/gitskins/SKILL.md`, `README.md`, and `README_ZH.md`.

---

## 3. Brand Icon & CLI Rules

- Keep `assets/logo.svg`, `web/public/favicon.svg`, and `BrandMark()` in `web/src/App.tsx` strictly synchronized (`build_all.py` enforces byte-for-byte parity between `assets/logo.svg` and `web/public/favicon.svg`).
- Never use unscoped `npx gitskins` in docs or studio snippets (that npm name belongs to a third-party package); use `node cli/gitskins.mjs ...` (or the scoped package `@furina-he/gitskins`).

---

## 4. Verification Before Opening a PR

```bash
python scripts/build_all.py
node cli/gitskins.mjs validate ./assets
node cli/gitskins.mjs validate ./themes
cd web && pnpm build
```

Include Light & Dark screenshots at `846px` width in your Pull Request!
