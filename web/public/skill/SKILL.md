---
name: gitskins
description: Design, scaffold, and validate Light & Dark static SVG skins for GitHub Profile READMEs, Open-Source Repository READMEs (Repo Skins), 4-column 846px Bento DIY widgets, and zero-503 GitHub Actions live widgets. Use when the user asks to beautify, re-skin, or modernize a GitHub Profile README, an open-source repo README, or add theme-matched GitHub Stats / Coding Rhythm / RSS / Weather SVG widgets.
---

# GitSkins Agent Skill

GitSkins turns GitHub Profile READMEs and Open-Source Repository READMEs into deterministic, **846px-aligned Light & Dark static SVG systems** with zero external runtime servers.

- Showcase & Studio: `https://gitskins.blessc.com`
- Repository: `https://github.com/Furina-he/gitskins`

## 1. Curated Aesthetic Systems (`--theme <id>`)

| Theme ID | Aesthetic | Visual Signature |
| :--- | :--- | :--- |
| `swiss-bauhaus-pixel` | Swiss-Bauhaus Pixel Poster | Sharp `0px` Swiss grids, Bauhaus weave textures, bold sans headlines, crisp pixel accents |
| `blueprint-cad` | Architectural Blueprint CAD | `12px/48px` drafting grid, corner registration crosshairs, chamfered plates, CAD title blocks |
| `editorial-zine` | Editorial Broadsheet Zine | Double hairline masthead rules, classic serif titles, italic lead-ins, right-hand specs ledger |
| `crt-terminal` | Retro CRT Terminal TUI | Scanline overlay, tmux panes, phosphor monospace tables, ANSI color swatches & status bars |

Every theme defines semantic tokens (`bg`, `surface`, `patternBg`, `patternFg`, `border`, `borderSoft`, `ink`, `sub`, `muted`, `accent`, `accentFg`, `secondary`, `tertiary`, `highlight`) in `themes/<id>/meta.json`.

---

## 2. Hard Engineering Invariants (Never Violate)

1. **Zero Fabricated Facts**: Always inspect local context first (`gh api user`, `git config`, `git remote`, `package.json`, `Cargo.toml`, `pyproject.toml`, directory tree) before rendering metrics, URLs, or project descriptions.
2. **True Light & Dark Parity**: Every SVG asset must be emitted in paired `*-light.svg` and `*-dark.svg` files and wired with GitHub's native `<picture><source media="(prefers-color-scheme: dark)" srcset="..."><img src="..."></picture>`.
3. **Strict GitHub SVG Safety**:
   - **Zero `<script>` tags** and **zero `on*=` attributes**.
   - **Zero external `<image href="http...">` links** and **zero `@import` external web fonts** (use cross-platform system stacks only).
   - **Strict XML well-formedness** (escape `&`, `<`, `>`, `"`, `'` in text and attributes).
   - Whenever `@keyframes` CSS animation is included, always include `@media (prefers-reduced-motion: reduce) { ... { animation: none !important; } }`.
4. **846px Grid Discipline**:
   - Profile & Repo full-width banners: `width="846"` (`width="100%"` in Markdown).
   - 2-column project/feature cards: `width="417"` (`width="49%"` paired with `&nbsp;`).
   - 4-column Bento DIY widgets: `1 col = 204px`, `2 cols = 418px`, `3 cols = 632px`, `4 cols = 846px` (uniform `160px` height; never render grid fraction labels like `1/2` or `1/4` inside exported SVGs).

---

## 3. Workflow A — Re-skin a GitHub Profile README

1. **Detect Identity**:
   ```bash
   gh api user --jq '{login,name,bio,blog,location,public_repos,followers}'
   gh repo list --limit 12 --json name,description,stargazerCount,forkCount,primaryLanguage,url,homepageUrl
   ```
   (Fallback to `git config user.name` / `git remote get-url origin` if `gh` is unavailable.)
2. **Fetch Theme Spec & Generator**:
   - Spec: `https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/<theme>/SPEC.md`
   - Generator: `https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/<theme>/generator.py`
3. **Customize & Run**: Update the profile data & real repositories inside `generator.py`, run it to generate `assets/*-{light,dark}.svg`, and wire `README.md`.
4. **Optional Zero-503 Live Widgets (`L01`–`L04`)**:
   - Download `https://raw.githubusercontent.com/Furina-he/gitskins/main/live-widgets/generate_live_widgets.py` to `scripts/generate_live_widgets.py` (zero `pip` dependencies).
   - Add `.github/workflows/gitskins-widgets.yml` (template: `https://raw.githubusercontent.com/Furina-he/gitskins/main/live-widgets/gitskins-widgets.yml`) targeting `--widgets "github-stats:2,coding-rhythm:2,live-weather:1,rss-feed:3"`.
   - Mount `./assets/live-<id>-{light,dark}.svg` via `<picture>` in `README.md`.

---

## 4. Workflow B — Re-skin an Open-Source Repo README (`Repo Skins`)

1. **Inspect Local Repository**: Read `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, `LICENSE`, `git remote -v`, and top-level directories to gather accurate repo title, tagline, install command, key features, and real architecture stages.
2. **Generate via Zero-Dependency CLI** (or write matching SVGs directly):
   ```bash
   node cli/gitskins.mjs init \
     --mode repo \
     --theme <theme> \
     --repo "<owner>/<name>" \
     --tagline "<concise description>" \
     --install "<install command>" \
     --arch "Stage 1 | sub -> Stage 2 | sub -> Stage 3 | sub -> Stage 4 | sub" \
     --out . \
     --badge
   ```
   Generates `assets/repo-hero-{light,dark}.svg`, `assets/repo-install-{light,dark}.svg`, `assets/repo-feat-01..04-{light,dark}.svg`, `assets/repo-arch-{light,dark}.svg`, optional `assets/gitskins-badge-{light,dark}.svg`, and a ready-to-merge README template.

---

## 5. Mandatory Verification Before Finishing

Validate every generated SVG for strict XML, security, and reduced-motion compliance:

```bash
# Option 1: GitSkins CLI validator
node cli/gitskins.mjs validate ./assets

# Option 2: Python stdlib XML validator
python -c "import glob, xml.etree.ElementTree as ET; files=sorted(glob.glob('assets/*.svg')); assert files; [ET.parse(f) for f in files]; print(f'OK: {len(files)} strict XML SVGs')"
```

Never finish a task if any SVG fails XML parsing or has mismatched Light/Dark pairs.
