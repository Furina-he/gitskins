---
name: gitskins
description: Design, scaffold, and validate Light & Dark static SVG skins for GitHub Profile READMEs, Open-Source Repository READMEs (Repo Skins), 4-column 846px Bento DIY widgets, and zero-503 GitHub Actions live widgets. Use when the user asks to beautify, re-skin, or modernize a GitHub Profile README, an open-source repo README, or add theme-matched GitHub Stats / Coding Rhythm / RSS / Weather / WakaTime / Spotify SVG widgets.
---

# GitSkins Agent Skill

GitSkins turns GitHub Profile READMEs and Open-Source Repository READMEs into deterministic, **846px-aligned Light & Dark static SVG systems** with zero external runtime servers.

- Showcase & Studio: `https://gitskins.blessc.com`
- Repository: `https://github.com/Furina-he/gitskins`

## 1. Curated Aesthetic Systems (`--theme <id>`)

| Theme ID | Aesthetic | Portrait / Emblem Style | Visual Signature |
| :--- | :--- | :--- | :--- |
| `swiss-bauhaus-pixel` | Swiss-Bauhaus Pixel Poster | **Real Pixel Avatar** (`24×24`/`28×28`) | Sharp `0px` Swiss grids, Bauhaus weave textures, bold sans headlines, crisp pixel accents |
| `blueprint-cad` | Architectural Blueprint CAD | Pure CAD Isometric Reticle | `12px/48px` drafting grid, corner registration crosshairs, chamfered plates, CAD title blocks |
| `editorial-zine` | Editorial Broadsheet Zine | Pure Typographic Monograph | Double hairline masthead rules, classic serif titles, italic lead-ins, right-hand specs ledger |
| `crt-terminal` | Retro CRT Terminal TUI | **Real Pixel Avatar** or Initials Monogram | Scanline overlay, tmux panes, phosphor monospace tables, ANSI color swatches & status bars |
| `pixel-rpg-hud` | 16-bit Pixel RPG HUD | **Real Pixel Avatar** (`24×24` HUD slot) | Stepped pixel bevel frames, HP/MP/XP stat meters, quest-log cards & `12×12` pixel relics |
| `seal-ink-scroll` | Seal Ink Monograph | **Personalized Cinnabar Seal Stamp** | Warm Xuan paper & inkstone dark, carved cinnabar red seal stamp, corner fretwork & mountain mist |
| `synth-hardware` | Tactile Industrial Synth | Pure Hardware Instrument | Brushed aluminum & dark chassis, corner screws, perforated speaker grill, OLED waveform & 4 colored rotary knobs |
| `pcb-solder-mask` | Solder Mask PCB | Pure PCB Silkscreen (`U1` IC) | Matte white & deep emerald solder mask, ENIG gold vias (`◎`), 45° copper traces & QFP IC package |
| `transit-boarding` | Transit & Boarding Pass | **Real Pixel Avatar** (`24×24` Passport Box) | Tear-off perforated ticket stub, vector barcode, route header & metro transfer station cards |
| `classic-desktop-os` | Classic Desktop OS | **Real Pixel Avatar** (`24×24` Window Icon) | 1-bit Bayer dither desktop, System 7 pin-stripe titlebars, close box & mini application windows |
| `riso-duotone` | Risograph Overprint Poster | Pure 2-Ink Graphic Emblem | Misregistered duotone ink shadows (`+2.5px`), halftone dot screens & corner registration marks (`⊕`) |

Every theme defines 14 semantic tokens (`bg`, `surface`, `patternBg`, `patternFg`, `border`, `borderSoft`, `ink`, `sub`, `muted`, `accent`, `accentFg`, `secondary`, `tertiary`, `highlight`) in `themes/<id>/meta.json`.

---

## 2. Hard Engineering Invariants (Never Violate)

1. **Zero Fabricated Facts**: Always inspect local context first (`gh api user`, `git config`, `git remote`, `package.json`, `Cargo.toml`, `pyproject.toml`, directory tree) before rendering metrics, URLs, or project descriptions. Adapt gracefully if the user has fewer than 4 repos or no personal site.
2. **Zero Demo-Data Leakage**: Reference `generator.py` scripts contain sample author data (`Furina-he`, `NeverGiveUp`, `cloudlink`, `openpet`, `myfurina`, `blessc.com`). Before finishing, ALWAYS scan every generated `assets/*.svg` and `README.md` to confirm **zero leftover demo strings** remain (except `gitskins.blessc.com` if the user opted into the `Styled with GitSkins` footer badge).
3. **Real Avatar Pixelization (for Portrait Themes)**: For `swiss-bauhaus-pixel`, `pixel-rpg-hud`, `transit-boarding`, `classic-desktop-os`, and optionally `crt-terminal`, download the user's real GitHub `avatar_url` (`?s=96`) and programmatically downsample + color-quantize it (e.g., via Python `Pillow` or stdlib) into crisp vector `<path shape-rendering="crispEdges">` paths. Never leave the demo portrait matrix or embed an external `<image href="https://...">`.
4. **True Light & Dark Parity**: Every SVG asset must be emitted in paired `*-light.svg` and `*-dark.svg` files and wired with GitHub's native `<picture><source media="(prefers-color-scheme: dark)" srcset="..."><img src="..."></picture>`.
5. **Strict GitHub SVG Safety**:
   - **Zero `<script>` tags** and **zero `on*=` attributes**.
   - **Zero external `<image href="http...">` links** and **zero `@import` external web fonts** (use cross-platform system stacks only).
   - **Strict XML well-formedness** (escape `&`, `<`, `>`, `"`, `'` in text and attributes).
   - Whenever `@keyframes` CSS animation is included, always include `@media (prefers-reduced-motion: reduce) { ... { animation: none !important; } }`.
6. **846px Grid Discipline**:
   - Profile & Repo full-width banners: `width="846"` (`width="100%"` in Markdown).
   - 2-column project/feature cards: `width="417"` (`width="49%"` paired with `&nbsp;`).
   - 4-column Bento DIY widgets: `1 col = 204px`, `2 cols = 418px`, `3 cols = 632px`, `4 cols = 846px` (uniform `160px` height; never render grid fraction labels like `1/2` or `1/4` inside exported SVGs).

---

## 3. Workflow A — Re-skin a GitHub Profile README

1. **Detect Identity**:
   ```bash
   gh api user --jq '{login,name,bio,avatar_url,blog,location,public_repos,followers}'
   gh repo list --limit 12 --json name,description,stargazerCount,forkCount,primaryLanguage,url,homepageUrl
   ```
   (Fallback to `git config user.name` / `git remote get-url origin` if `gh` is unavailable; only ask the user if nothing is detected locally.)
2. **Fetch Theme Spec & Generator**:
   - Spec: `https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/<theme>/SPEC.md`
   - Prompt: `https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/<theme>/PROMPT.md`
   - Generator: `https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/<theme>/generator.py`
3. **Customize & Run**: Rewrite the profile data, avatar pixel portrait (or personalized seal), and real repositories inside `generator.py`, run it to generate `assets/*-{light,dark}.svg`, and wire `README.md`.
4. **Optional Zero-503 Live Widgets (`L01`–`L10`)**:
   - Download `https://raw.githubusercontent.com/Furina-he/gitskins/main/live-widgets/generate_live_widgets.py` to `scripts/generate_live_widgets.py` (zero `pip` dependencies).
   - Add `.github/workflows/gitskins-widgets.yml` (template: `https://raw.githubusercontent.com/Furina-he/gitskins/main/live-widgets/gitskins-widgets.yml`) targeting any of: `github-stats`, `coding-rhythm`, `rss-feed`, `live-weather`, `wakatime-weekly` (uses optional `WAKATIME_API_KEY`), `spotify-recent` (uses optional Spotify refresh token secrets), `contribution-snake` (4-col `846px` contribution snake via GraphQL — or use `Platane/snk/svg-only@v3` in `.github/workflows/snake.yml` with Light/Dark `color_snake` and `color_dots` synced to the active theme), `contrib-skyline` (3–4 col isometric 3D contribution skyline), `commit-streak` (1–2 col streak flame), and `recent-activity` (2–4 col public events log).
   - Mount `./assets/live-<id>-{light,dark}.svg` via `<picture>` in `README.md`.

---

## 4. Workflow B — Re-skin an Open-Source Repo README (`Repo Skins`)

1. **Inspect Local Repository**: Read `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, `LICENSE`, `git remote -v`, and top-level directories to gather accurate repo title, tagline, install command, key features, and real architecture stages.
2. **Generate via Zero-Dependency CLI** (never run unscoped `npx gitskins`, which belongs to an unrelated npm package):
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

Validate every generated SVG for strict XML, security, reduced-motion compliance, AND zero demo-data leakage:

```bash
# 1. Validate XML, zero-<script>, zero external <image>, prefers-reduced-motion
node cli/gitskins.mjs validate ./assets
# Or Python stdlib fallback:
python -c "import glob, xml.etree.ElementTree as ET; files=sorted(glob.glob('assets/*.svg')); assert files; [ET.parse(f) for f in files]; print(f'OK: {len(files)} strict XML SVGs')"

# 2. Verify zero leftover demo template strings in README.md and assets/*.svg
python -c "import pathlib, re; bad=['Furina-he','NeverGiveUp','cloudlink','openpet','myfurina']; hits=[(str(p),b) for p in [pathlib.Path('README.md'),*sorted(pathlib.Path('assets').glob('*.svg'))] if p.exists() for b in bad if re.search(b,p.read_text(encoding='utf-8'),re.I)]; assert not hits, f'Demo leakage: {hits}'; print('OK: zero demo leakage')"
```

Never finish a task if any SVG fails XML parsing, has mismatched Light/Dark pairs, or retains demo author strings.
