<div align="center">

<h1>GitSkins</h1>

<p><strong>Curated GitHub Profile themes engineered for AI coding agents.</strong></p>
<p>Browse live Light &amp; Dark SVG themes · Click once to copy an Agent Prompt · Let Claude Code, Codex, Cursor, or Antigravity transform your GitHub profile automatically.</p>

<p>
  <a href="https://gitskins.blessc.com"><strong>Live Gallery (gitskins.blessc.com) ↗</strong></a>
  ·
  <a href="#themes">Themes</a>
  ·
  <a href="#how-it-works">How It Works</a>
  ·
  <a href="CONTRIBUTING.md">Submit a Theme</a>
</p>

</div>

---

## Why GitSkins?

Traditional GitHub profile templates force you to hand-edit brittle SVG coordinates, fiddle with image crops, and hunt for broken third-party stat cards.

**GitSkins flips the workflow for the AI-agent era:**
- **Zero-form, one-click prompts** — Copy a single prompt from [gitskins.blessc.com](https://gitskins.blessc.com) and paste it into your local AI coding agent (Claude Code, Codex CLI, Cursor, Antigravity, Gemini CLI, Windsurf, etc.).
- **Auto-detected real data** — Every prompt instructs your agent to inspect your local `gh` / `git config` identity, avatar, real repositories, stars, releases, and live websites—never inventing fake metrics.
- **Deterministic SVG generators** — Each theme ships with both a strict visual spec (`SPEC.md`) and a reference Python generator (`generator.py`) with strict XML validation, so agents reliably produce razor-sharp Light & Dark SVGs instead of misaligned hand-coded markup.

---

## Themes

| # | Theme | Visual World | Best For | Files |
| :--- | :--- | :--- | :--- | :--- |
| `01` | **Swiss-Bauhaus Pixel Poster** | `0px` Swiss grid, 9-row geometric pixel wordmark, orthogonal pixel weaves, blinking `28×28` avatar portrait | Indie developers, toolmakers, design engineers | [SPEC](themes/swiss-bauhaus-pixel/SPEC.md) · [PROMPT](themes/swiss-bauhaus-pixel/PROMPT.md) · [Generator](themes/swiss-bauhaus-pixel/generator.py) |
| `02` | **Architectural Blueprint CAD** | Prussian blueprint (Dark) & vellum tracing sheet (Light), millimeter coordinate grid, isometric reticle, CAD title blocks | Systems engineers, Rust/Go/infra, hardware & full-stack | [SPEC](themes/blueprint-cad/SPEC.md) · [PROMPT](themes/blueprint-cad/PROMPT.md) · [Generator](themes/blueprint-cad/generator.py) |
| `03` | **Editorial Broadsheet Zine** | Archival newsprint & obsidian press, double-rule masthead, serif display headlines, vermilion folios, colophon ledger | Technical writers, architects, OSS maintainers | [SPEC](themes/editorial-zine/SPEC.md) · [PROMPT](themes/editorial-zine/PROMPT.md) · [Generator](themes/editorial-zine/generator.py) |
| `04` | **Retro CRT Terminal TUI** | Split-pane `tmux` workstation, pixel monogram, `neofetch` telemetry, ANSI 8-color bar, CLI command tabs | CLI authors, Linux/Neovim users, DevOps & backend | [SPEC](themes/crt-terminal/SPEC.md) · [PROMPT](themes/crt-terminal/PROMPT.md) · [Generator](themes/crt-terminal/generator.py) |

---

## How It Works

1. Visit **[gitskins.blessc.com](https://gitskins.blessc.com)** and toggle **Light / Dark** to preview each theme inside an authentic `846px` GitHub Profile frame.
2. Click **Copy Agent Prompt** (available in English & 中文, both Quick URL and Full Standalone modes).
3. Paste the prompt into your AI coding agent. It will inspect your GitHub account, customize the theme's SVGs to your real projects and avatar, validate XML & renders, and push to your `<username>/<username>` profile repository.

---

## Local Development

```bash
# 1. Regenerate all theme SVGs, validate XML, and sync manifest into web/public/themes/
python scripts/build_all.py

# 2. Run the showcase website locally
cd web
pnpm install
pnpm dev
```

---

## Contributing a Theme

Want to add a new GitHub Profile skin (e.g., 16-bit Pixel RPG, Bento Grid, Ink & Seal Stationery, Brutalist Zine)? Read [CONTRIBUTING.md](CONTRIBUTING.md) — adding a new folder under `themes/<theme-id>/` and running `python scripts/build_all.py` automatically registers it in the live gallery.

## Acknowledgments

Special thanks to the **[LINUX DO](https://linux.do)** community for the inspiration, feedback, and support.

## License

[MIT](LICENSE)
