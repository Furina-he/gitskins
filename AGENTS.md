# AGENTS.md — GitSkins Engineering Guardrails

Read this file before adding a new theme, DIY widget, live widget, Repo Skin module, or modifying README/SVG assets. Full specs live in [docs/architecture.md](docs/architecture.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## 1. Hard Invariants (Never Violate)

1. **Strict GitHub SVG Safety**:
   - Zero `<script>` tags, zero `on*=` event attributes, zero external `<image href="http...">`, zero `@import` web fonts.
   - Strict XML well-formedness (`xml.etree.ElementTree.fromstring` + `node cli/gitskins.mjs validate`).
   - Whenever `@keyframes` is used, ALWAYS wrap with `@media (prefers-reduced-motion: reduce) { ... { animation: none !important; } }`.
2. **846px Grid & Light/Dark Parity**:
   - Every visual asset ships in true semantic Light & Dark pairs (`meta.json#tokens.{light,dark}` — all 14 keys required). Never invert colors blindly.
   - Check text contrast (`>= 4.5:1`) on tinted headers (e.g. light blue `#7CC4FA` needs dark `#0A0A0A` ink, not muted gray) and leave cross-platform monospace width headroom (Windows Consolas vs macOS SFMono/Menlo vs Linux Liberation Mono).
3. **Canonical Brand Icon Parity**:
   - `assets/logo.svg`, `web/public/favicon.svg`, and `BrandMark()` in `web/src/App.tsx` MUST remain identical (`64×64` Swiss-Bauhaus 4-block grid). `scripts/build_all.py` fails if `assets/logo.svg` and `web/public/favicon.svg` drift.
4. **Prompt Personalization & Zero Demo-Data Leakage**:
   - Every `themes/<id>/PROMPT.md` MUST have both `<!-- LANG:EN -->` and `<!-- LANG:ZH -->` blocks.
   - Prompts MUST instruct the user's agent to auto-detect identity (`gh` / `git config`), handle `< 4` repos or missing websites gracefully, pixelize the user's real GitHub `avatar_url?s=96` into crisp vector `<path>` paths for portrait themes (matching `web/src/profile/renderProfileTheme.ts`), and run a **Zero Demo-Data Leakage Check** (confirming zero leftover `Furina-he`, `NeverGiveUp`, `cloudlink`, `openpet`, `myfurina`, `blessc.com` strings, except the opt-in `Styled with GitSkins` badge).
5. **CLI Package Naming**:
   - NEVER recommend unscoped `npx gitskins` — `gitskins` on npm belongs to an unrelated third-party repository. Always use `node cli/gitskins.mjs ...` (scoped package name in `cli/package.json` is `@furina-he/gitskins`).

## 2. Touchpoint Checklist When Adding a New Theme

When adding `themes/<new-theme>/`:
- [ ] `themes/<new-theme>/`: `meta.json` (14 light+dark tokens), `SPEC.md`, `PROMPT.md` (EN+ZH + avatar/personalization + zero demo-leakage gate), `generator.py`, `README.demo.md`, generated `assets/*.svg`.
- [ ] `web/src/widgets/svgPrimitives.ts`: add theme chrome in `renderThemeFrame()` & font mapping in `themeHeadingFont()`.
- [ ] `web/src/profile/renderProfileTheme.ts`: add Hero, buttons, sections & cards (keep portrait/avatar behavior consistent with `PROMPT.md`).
- [ ] `web/src/repo/renderRepoSkin.ts`: add Hero, Install, Section Header, Feature Card, Arch Flow, and `Styled with GitSkins` Badge variants.
- [ ] `live-widgets/generate_live_widgets.py`: add theme tokens + frame styling so `--check-all` validates all live widgets on the new theme.
- [ ] `cli/gitskins.mjs`: add fallback tokens in `FALLBACK_THEMES` and update `printHelp()`.
- [ ] `README.md` & `README_ZH.md`: add to the 2-column Visual Theme Gallery, update theme/SVG counts & badges, and refresh `assets/repo-hero-{light,dark}.svg` & `themes/*/generator.py` (`card-gitskins` total SVG count) if counts changed.
- [ ] `docs/architecture.md` & `skill/gitskins/SKILL.md`: register the new theme idiom & portrait style.

## 3. Touchpoint Checklist When Adding a New Widget / Live Plugin

- [ ] **Static DIY Widget (`Wxx`)**: `web/src/widgets/types.ts` -> `renderers.ts` -> `catalog.ts` -> `components/WidgetsStudio.tsx` -> `i18n.ts` -> `README.md` & `README_ZH.md` widget table -> `cli/gitskins.mjs` `runList()`.
- [ ] **Zero-503 Live Widget (`Lxx`)**: all DIY touchpoints above **plus** `live-widgets/generate_live_widgets.py` (stdlib Python only, zero `pip` deps), `live-widgets/gitskins-widgets.yml`, `web/src/widgets/workflow.ts`, `skill/gitskins/SKILL.md`, and `docs/live-widgets.md`.

## 4. Mandatory Verification Commands

Always run all four before committing:

```bash
python scripts/build_all.py
node cli/gitskins.mjs validate ./assets
node cli/gitskins.mjs validate ./themes
cd web && pnpm build
```
