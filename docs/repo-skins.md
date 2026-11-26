# GitSkins v0.5 Specification — Repo Skins, Agent Skill & Zero-Dependency CLI

> Status: Active (`v0.5`)  
> Scope: Extending GitSkins' 4 semantic theme systems to open-source repository READMEs (`Repo Skins`), adding an optional `Styled with GitSkins` footer badge, and shipping native Agent-first distribution (`SKILL.md` + zero-dependency Node CLI).

---

## 1. Design Goals

1. **Same 4 Aesthetic Systems, Built for Repositories**: Every open-source project README deserves the same 846px typographic precision and Light/Dark parity as a GitHub Profile — across `swiss-bauhaus-pixel`, `blueprint-cad`, `editorial-zine`, and `crt-terminal`.
2. **Zero-Backend Live Repo Hydration**: Users can paste any public `owner/repo` (e.g. `Furina-he/gitskins`, `vitejs/vite`) to populate real stars, forks, license, primary language, topics, and an inferred install command directly via the public GitHub REST API (`GET /repos/{owner}/{repo}`).
3. **Deterministic SVG Modules (No External Diagram/Badge Servers)**: Project hero banners, quick-install command bars, feature cards, architecture flow diagrams, and the optional `Styled with GitSkins` footer badge are all generated as static Light/Dark SVG pairs with zero third-party runtime dependencies.
4. **Dual Distribution Paths**:
   - **Web Studio**: Interactive 846px Repo Skins Studio with instant Light/Dark preview, Agent Prompt copy, and one-click ZIP export (`README.md` + `assets/repo-*.svg`).
   - **Agent-Native**: Standard `SKILL.md` (`skill/gitskins/SKILL.md`) plus a zero-dependency Node 18+ CLI (`cli/gitskins.mjs`) for `list`, `init`, and `validate`.

---

## 2. Repo Skin SVG Module Contract

All Repo Skin SVGs inherit `ThemeTokens` (`themes/<id>/meta.json#tokens.{light,dark}`), enforce `846px` max width, strict XML well-formedness, zero `<script>`, safe system font stacks, and `@media (prefers-reduced-motion: reduce)` whenever CSS motion is enabled.

| Code | Module | Dimensions | Output Filenames | README Layout |
| :--- | :--- | :--- | :--- | :--- |
| `R01` | **Project Hero Banner** | `846×248` | `assets/repo-hero-{light,dark}.svg` | `<img width="100%">` |
| `R02` | **Quick Install Strip** | `846×72` | `assets/repo-install-{light,dark}.svg` | `<img width="100%">` |
| `R03` | **Feature Cards (2 or 4)** | `417×152` | `assets/repo-feat-0{1..4}-{light,dark}.svg` | 2-col `<img width="49%">` pairs |
| `R04` | **Architecture Flow Card** | `846×168` | `assets/repo-arch-{light,dark}.svg` | `<img width="100%">` |
| `R05` | **Styled with GitSkins Badge** *(opt-in)* | `216×32` | `assets/gitskins-badge-{light,dark}.svg` | Footer `<a href="https://gitskins.blessc.com"><picture>...` |

### Architecture Flow Syntax (`R04`)

Users specify 3 or 4 pipeline stages using a lightweight single-line DSL:

```text
Title | Subtitle -> Title | Subtitle -> Title | Subtitle -> Title | Subtitle
```

- Delimiter between stages: `->` (also accepts `→`).
- Delimiter between node heading and micro-caption: `|` (optional).
- Maximum 4 stages so every stage box fits comfortably inside the `846×168` viewport without text truncation or overlap.

---

## 3. Live GitHub Repo Loader Contract

- Endpoint: `https://api.github.com/repos/{owner}/{repo}` (unauthenticated, 60 req/hr per IP).
- Validation: `owner/repo` regex `^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$` (also strips leading `https://github.com/` URLs for user convenience).
- Smart install command inference based on `language`:
  - `Rust` → `cargo add <repo>`
  - `Python` → `pip install <repo>`
  - `Go` → `go get github.com/<owner>/<repo>`
  - `TypeScript` / `JavaScript` → `npm install <repo>`
  - Fallback → `git clone https://github.com/<owner>/<repo>.git`

---

## 4. Standard Agent Skill (`skill/gitskins/SKILL.md`)

- Self-contained skill directory `skill/gitskins/SKILL.md` with YAML frontmatter (`name: gitskins`, `description: ...`).
- Synced by `scripts/build_all.py` to `web/public/skill/SKILL.md` (public URL: `https://gitskins.blessc.com/skill/SKILL.md`).
- Guides Claude Code, Codex, Cursor, Antigravity, Gemini CLI, and Windsurf through:
  1. Detecting user or repository identity locally (`gh` / `git` / manifest files) without fabricating metrics.
  2. Selecting from the 4 curated skins (`swiss-bauhaus-pixel`, `blueprint-cad`, `editorial-zine`, `crt-terminal`).
  3. Generating Profile Skins, Repo Skins, 4-col Bento Widgets, or Zero-503 GitHub Actions Live Widgets.
  4. Validating every SVG via `gitskins validate` or Python `xml.etree.ElementTree`.

---

## 5. Zero-Dependency CLI (`cli/gitskins.mjs`)

Node.js 18+ ESM CLI with zero external npm dependencies (`cli/package.json` defines `"bin": { "gitskins": "./gitskins.mjs" }`).

### Commands

```bash
# List themes, widgets, and repo modules
node cli/gitskins.mjs list

# Scaffold a Repo Skin (Hero + Install + Features + Architecture + README.md)
node cli/gitskins.mjs init --mode repo --theme blueprint-cad --repo owner/my-tool --install "npm i my-tool" --out ./out --badge

# Scaffold a Profile Skin starter + GitHub Actions live widgets workflow
node cli/gitskins.mjs init --mode profile --theme crt-terminal --widgets "github-stats:2,coding-rhythm:2,live-weather:1,rss-feed:3" --out ./out

# Validate every SVG under a directory (strict XML + security + reduced-motion checks)
node cli/gitskins.mjs validate ./out/assets
```

### Verification Criteria

- Every generated SVG passes strict XML validation, contains zero `<script>` tags or `on*=` attributes, and includes `@media (prefers-reduced-motion: reduce)` whenever `@keyframes` is present.
- All 4 themes × 5 Repo Skin modules export cleanly into CRC-32 verified ZIP archives with `README.md` referencing every Light/Dark SVG pair.
