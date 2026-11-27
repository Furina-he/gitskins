#!/usr/bin/env python3
"""Generate 22 Light & Dark Risograph Overprint Poster SVGs and validate strict XML."""

from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape
import xml.etree.ElementTree as ET

OUT_DIR = Path(__file__).resolve().parent / "assets"
FONT_MONO = "'JetBrains Mono','SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace"
FONT_SANS = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
FONT_DISPLAY = "'Space Grotesk','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"

PALETTES = {
    "light": {
        "bg": "#F8F3E8",
        "surface": "#FDFBF5",
        "ink": "#17203B",
        "sub": "#3E4A6B",
        "muted": "#6D7896",
        "border": "#17203B",
        "borderSoft": "#D7CEBC",
        "accent": "#0066CC",
        "accentFg": "#FFFFFF",
        "secondary": "#FF4F5E",
        "tertiary": "#0E9472",
        "highlight": "#F59E0B",
        "patternBg": "#EFE8D8",
        "patternFg": "#C9D7EA",
    },
    "dark": {
        "bg": "#121318",
        "surface": "#1A1C24",
        "ink": "#F7F4EC",
        "sub": "#C2C5D3",
        "muted": "#878CA0",
        "border": "#383D4F",
        "borderSoft": "#272B38",
        "accent": "#22D3EE",
        "accentFg": "#0F1218",
        "secondary": "#FF5E7E",
        "tertiary": "#34D399",
        "highlight": "#F5B700",
        "patternBg": "#161822",
        "patternFg": "#263348",
    },
}


def reg_mark(cx: float, cy: float, r: float, stroke: str, accent: str | None = None) -> str:
    """Vector print registration crosshair (circle + protruding hairline axes)."""
    arm = r + 2.6
    ghost = (
        f'<circle cx="{cx + 1.1:.1f}" cy="{cy + 1.1:.1f}" r="{r:.1f}" fill="none" '
        f'stroke="{accent}" stroke-opacity="0.55" stroke-width="0.9"/>'
        if accent
        else ""
    )
    return (
        f'<g aria-hidden="true">'
        f"{ghost}"
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="none" stroke="{stroke}" stroke-width="1"/>'
        f'<line x1="{cx - arm:.1f}" y1="{cy:.1f}" x2="{cx + arm:.1f}" y2="{cy:.1f}" stroke="{stroke}" stroke-width="1"/>'
        f'<line x1="{cx:.1f}" y1="{cy - arm:.1f}" x2="{cx:.1f}" y2="{cy + arm:.1f}" stroke="{stroke}" stroke-width="1"/>'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="1.1" fill="{stroke}"/>'
        f"</g>"
    )


def halftone_pattern(pat_id: str, dot_color: str, dot_opacity: float, step: int = 8, radius: float = 1.35) -> str:
    """Staggered diagonal halftone dot screen <pattern>."""
    half = step / 2
    q1 = step * 0.25
    q3 = step * 0.75
    return (
        f'<pattern id="{pat_id}" width="{step}" height="{step}" patternUnits="userSpaceOnUse">'
        f'<circle cx="{q1:.1f}" cy="{q1:.1f}" r="{radius:.2f}" fill="{dot_color}" fill-opacity="{dot_opacity:.2f}"/>'
        f'<circle cx="{q3:.1f}" cy="{q3:.1f}" r="{radius:.2f}" fill="{dot_color}" fill-opacity="{dot_opacity:.2f}"/>'
        f'<circle cx="{half:.1f}" cy="{step:.1f}" r="{radius * 0.75:.2f}" fill="{dot_color}" fill-opacity="{dot_opacity * 0.55:.2f}"/>'
        f"</pattern>"
    )


def build_hero(mode: str, p: dict[str, str]) -> str:
    w, h = 846, 300
    uid = f"riso-{mode}"
    pat_main = f"ht-hero-a-{mode}"
    pat_sec = f"ht-hero-b-{mode}"
    plate_spec = (
        "PLATE A: COBALT · PLATE B: CORAL"
        if mode == "light"
        else "PLATE A: CYAN · PLATE B: PINK"
    )
    ht_a_op = 0.24 if mode == "light" else 0.22
    ht_b_op = 0.16 if mode == "light" else 0.16

    # Four-corner print registration marks outside the inner poster frame (24..822, 20..280)
    corners = (
        reg_mark(12, 12, 4.0, p["ink"], p["secondary"])
        + reg_mark(w - 12, 12, 4.0, p["ink"], p["accent"])
        + reg_mark(12, h - 12, 4.0, p["ink"], p["accent"])
        + reg_mark(w - 12, h - 12, 4.0, p["ink"], p["secondary"])
    )

    metrics = [
        (p["accent"], "01 · FLAGSHIP", "04", "Ops · AI Pet · Skins · 3D"),
        (p["secondary"], "02 · REPOS", "13", "Rust · TypeScript · Python"),
        (p["tertiary"], "03 · AGENTS", "20+", "CloudLink Skill & Guard"),
        (p["highlight"], "04 · PRESS", "2-INK", "Halftone · Static · Crisp"),
    ]
    col_starts = [24, 224, 424, 624]
    col_blocks = []
    for idx, (col, lbl, val, sub) in enumerate(metrics):
        cx = col_starts[idx]
        if idx > 0:
            col_blocks.append(
                f'<line x1="{cx}.0" y1="212" x2="{cx}.0" y2="278" stroke="{p["border"]}" stroke-opacity="0.7" stroke-width="1"/>'
            )
        tx = cx + 14
        col_blocks.append(
            f'<rect x="{tx + 1.8:.1f}" y="222.8" width="6" height="6" fill="{p["secondary"] if idx % 2 == 0 else p["accent"]}" fill-opacity="0.65"/>'
            f'<rect x="{tx}" y="221" width="6" height="6" fill="{col}"/>'
            f'<text x="{tx + 13}" y="227.5" font-family="{FONT_MONO}" font-size="8.6" font-weight="700" letter-spacing="0.6" fill="{p["sub"]}">{escape(lbl)}</text>'
            f'<text x="{tx + 1.8:.1f}" y="252.8" font-family="{FONT_DISPLAY}" font-size="20" font-weight="900" fill="{col}" fill-opacity="0.52">{escape(val)}</text>'
            f'<text x="{tx}" y="251" font-family="{FONT_DISPLAY}" font-size="20" font-weight="900" fill="{p["ink"]}">{escape(val)}</text>'
            f'<text x="{tx}" y="268.5" font-family="{FONT_SANS}" font-size="10" fill="{p["sub"]}">{escape(sub)}</text>'
        )

    # Press-proof ink swatch strip under stack line
    swatches = [p["accent"], p["secondary"], p["tertiary"], p["highlight"]]
    swatch_svg = []
    for i, sc in enumerate(swatches):
        sx = 38 + i * 24
        swatch_svg.append(
            f'<rect x="{sx + 1.5:.1f}" y="191.5" width="16" height="7" fill="{p["ink"]}" fill-opacity="0.22"/>'
            f'<rect x="{sx}" y="190" width="16" height="7" fill="{sc}"/>'
        )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Furina-he — Risograph Overprint Poster GitHub Profile">
  <title>Furina-he — Risograph Overprint Poster</title>
  <defs>
    {halftone_pattern(pat_main, p["accent"], ht_a_op, step=8, radius=1.35)}
    {halftone_pattern(pat_sec, p["secondary"], ht_b_op, step=10, radius=1.25)}
  </defs>
  <style>
    @keyframes driftA_{uid} {{ 0%, 100% {{ transform: translate(0px, 0px); }} 50% {{ transform: translate(-2.6px, -1.6px); }} }}
    @keyframes driftB_{uid} {{ 0%, 100% {{ transform: translate(0px, 0px); }} 50% {{ transform: translate(2.6px, 1.8px); }} }}
    .plate-a-{uid} {{ animation: driftA_{uid} 6.5s ease-in-out infinite; }}
    .plate-b-{uid} {{ animation: driftB_{uid} 6.5s ease-in-out infinite; }}
    @media (prefers-reduced-motion: reduce) {{ .plate-a-{uid}, .plate-b-{uid} {{ animation: none !important; }} }}
  </style>

  <!-- Uncoated paper / dark cardstock poster sheet -->
  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" fill="{p["bg"]}" stroke="{p["borderSoft"]}" stroke-width="1"/>

  <!-- Four-corner print registration crosshairs -->
  {corners}

  <!-- Misregistered inner print-bed ghost frame + primary frame -->
  <rect x="26.5" y="24.5" width="798" height="256" fill="none" stroke="{p["secondary"]}" stroke-opacity="0.34" stroke-width="1.4"/>
  <rect x="24" y="22" width="798" height="256" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1.5"/>

  <!-- Right-side halftone dot screen field -->
  <rect x="562" y="48" width="260" height="164" fill="{p["patternBg"]}"/>
  <rect x="562" y="48" width="260" height="164" fill="url(#{pat_main})"/>
  <polygon points="738,48 822,48 822,132" fill="url(#{pat_sec})"/>
  <line x1="562" y1="48" x2="562" y2="212" stroke="{p["border"]}" stroke-width="1.2"/>

  <!-- Top masthead edition bar -->
  <rect x="24.8" y="22.8" width="796.4" height="25" fill="{p["patternBg"]}"/>
  <line x1="24" y1="48" x2="822" y2="48" stroke="{p["border"]}" stroke-width="1.2"/>
  <circle cx="40" cy="35.5" r="4.5" fill="{p["accent"]}"/>
  <circle cx="46.5" cy="35.5" r="4.5" fill="{p["secondary"]}" fill-opacity="0.82"/>
  <text x="59" y="39" font-family="{FONT_MONO}" font-size="9.5" font-weight="700" letter-spacing="1.0" fill="{p["ink"]}">EDITION 011 // 2-INK RISO</text>
  <text x="808" y="39" text-anchor="end" font-family="{FONT_MONO}" font-size="8.8" font-weight="700" letter-spacing="0.7" fill="{p["sub"]}">{escape(plate_spec)}</text>

  <!-- Left Typography Bay -->
  <rect x="40.5" y="62.5" width="224" height="19" fill="{p["secondary"]}" fill-opacity="0.82"/>
  <rect x="38" y="60" width="224" height="19" fill="{p["accent"]}" stroke="{p["border"]}" stroke-width="1"/>
  <text x="48" y="73" font-family="{FONT_MONO}" font-size="9.0" font-weight="700" letter-spacing="0.8" fill="{p["accentFg"]}">INDIE STUDIO · LOCAL-FIRST AI</text>

  <!-- Misregistered duotone display headline (2.5px secondary-ink offset behind crisp primary plate) -->
  <text x="40.5" y="133.5" font-family="{FONT_DISPLAY}" font-size="52" font-weight="900" letter-spacing="-0.6" fill="{p["secondary"]}" fill-opacity="0.78">FURINA-HE</text>
  <text x="38" y="131" font-family="{FONT_DISPLAY}" font-size="52" font-weight="900" letter-spacing="-0.6" fill="{p["accent"]}">FURINA-HE<tspan fill="{p["ink"]}">.</tspan></text>

  <text x="38" y="156" font-family="{FONT_SANS}" font-size="12.8" font-weight="600" fill="{p["ink"]}">Deterministic AI ops guardrails, desktop pets &amp; static SVG craft.</text>
  <text x="38" y="177" font-family="{FONT_MONO}" font-size="10" font-weight="600" fill="{p["sub"]}">STACK · Rust · TypeScript · Python · Tauri · Electron · Cloudflare</text>

  <!-- Press-proof color calibration bar -->
  {"".join(swatch_svg)}
  <text x="142" y="197" font-family="{FONT_MONO}" font-size="8.2" font-weight="700" letter-spacing="0.7" fill="{p["sub"]}">PASS 01/02 · 846PX GRID</text>

  <!-- Right-side Overprinted Geometric Bauhaus/Riso Emblem (pure graphic art, no photo portrait) -->
  <g aria-hidden="true">
    <circle cx="692" cy="122" r="56" fill="none" stroke="{p["border"]}" stroke-opacity="0.5" stroke-dasharray="3 4" stroke-width="1"/>
    <line x1="628" y1="122" x2="756" y2="122" stroke="{p["border"]}" stroke-opacity="0.28" stroke-width="0.9"/>
    <line x1="692" y1="60" x2="692" y2="184" stroke="{p["border"]}" stroke-opacity="0.28" stroke-width="0.9"/>
    <g class="plate-a-{uid}">
      <circle cx="674" cy="112" r="36" fill="{p["accent"]}" fill-opacity="0.82"/>
      <rect x="702" y="124" width="38" height="38" fill="{p["accent"]}" fill-opacity="0.74"/>
      <rect x="646" y="142" width="22" height="22" fill="none" stroke="{p["accent"]}" stroke-width="2.2"/>
    </g>
    <g class="plate-b-{uid}">
      <circle cx="710" cy="126" r="34" fill="{p["secondary"]}" fill-opacity="0.78"/>
      <polygon points="690,74 726,74 708,104" fill="{p["highlight"]}" fill-opacity="0.88"/>
      <rect x="650" y="146" width="22" height="22" fill="{p["tertiary"]}" fill-opacity="0.78"/>
    </g>
    <!-- Crisp center monogram punch-out -->
    <circle cx="692" cy="122" r="19" fill="{p["surface"]}" stroke="{p["ink"]}" stroke-width="1.8"/>
    <text x="692" y="127" text-anchor="middle" font-family="{FONT_DISPLAY}" font-size="13.5" font-weight="900" letter-spacing="0.6" fill="{p["ink"]}">FH</text>
  </g>
  <!-- Emblem edition plate caption -->
  <rect x="614" y="188" width="156" height="17" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1"/>
  <text x="692" y="199.5" text-anchor="middle" font-family="{FONT_MONO}" font-size="8.2" font-weight="700" letter-spacing="0.8" fill="{p["ink"]}">RISO PRESS · NO. 011</text>

  <!-- Bottom 4-column print-spec metrics rail -->
  <line x1="24" y1="212" x2="822" y2="212" stroke="{p["border"]}" stroke-width="1.4"/>
  {"".join(col_blocks)}
</svg>"""


def build_button(label: str, primary: bool, alt_idx: int, p: dict[str, str]) -> str:
    w = max(114, int(len(label) * 7.0) + 38)
    h = 30
    shadow_col = p["secondary"] if primary or alt_idx % 2 == 1 else p["accent"]
    box_fill = p["accent"] if primary else p["surface"]
    fg = p["accentFg"] if primary else p["ink"]
    mark_col = p["accentFg"] if primary else (p["secondary"] if alt_idx % 2 == 1 else p["accent"])
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(label)}">
  <title>{escape(label)}</title>
  <!-- Misregistered 2.5px ink offset plate -->
  <rect x="3" y="3" width="{w - 4}" height="25.5" fill="{shadow_col}" fill-opacity="0.88"/>
  <!-- Crisp outlined top stamp plate -->
  <rect x="0.5" y="0.5" width="{w - 4}" height="25.5" fill="{box_fill}" stroke="{p["border"]}" stroke-width="1.2"/>
  {reg_mark(13.5, 13.2, 3.0, mark_col)}
  <text x="25" y="16.8" font-family="{FONT_MONO}" font-size="10.2" font-weight="700" fill="{fg}">{escape(label)}</text>
</svg>"""


def build_section(plate: str, title: str, right: str, mode: str, sec_id: str, p: dict[str, str]) -> str:
    w, h = 846, 40
    pat_id = f"ht-sec-{sec_id}-{mode}"
    ht_op = 0.24 if mode == "light" else 0.22
    right_w = max(116, int(len(right) * 6.4) + 28)
    right_x = w - 28 - right_w
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(plate)} · {escape(title)}">
  <title>{escape(plate)} — {escape(title)}</title>
  <defs>
    {halftone_pattern(pat_id, p["accent"], ht_op, step=7, radius=1.2)}
  </defs>
  <rect x="0" y="0" width="{w}" height="{h}" fill="{p["bg"]}"/>
  <!-- Halftone right-hand overprint strip -->
  <rect x="440" y="4" width="{w - 442}" height="31" fill="{p["patternBg"]}"/>
  <rect x="440" y="4" width="{w - 442}" height="31" fill="url(#{pat_id})"/>
  <!-- Top & bottom bold overprint rules -->
  <line x1="0" y1="2.5" x2="{w}" y2="2.5" stroke="{p["border"]}" stroke-width="1.4"/>
  <line x1="0" y1="36.5" x2="{w}" y2="36.5" stroke="{p["border"]}" stroke-width="1.3"/>
  <line x1="0" y1="38.8" x2="{w}" y2="38.8" stroke="{p["secondary"]}" stroke-opacity="0.72" stroke-width="1.5"/>

  <!-- Misregistered 2-ink plate badge (+ PLATE 01 / + PLATE 02) -->
  <rect x="8.5" y="9.5" width="112" height="22" fill="{p["secondary"]}" fill-opacity="0.85"/>
  <rect x="6" y="7" width="112" height="22" fill="{p["accent"]}" stroke="{p["border"]}" stroke-width="1.1"/>
  <text x="62" y="21.5" text-anchor="middle" font-family="{FONT_MONO}" font-size="10" font-weight="700" letter-spacing="0.8" fill="{p["accentFg"]}">{escape(plate)}</text>

  <!-- Misregistered duotone section title -->
  <text x="135.8" y="25.8" font-family="{FONT_DISPLAY}" font-size="16.5" font-weight="900" letter-spacing="0.6" fill="{p["secondary"]}" fill-opacity="0.62">{escape(title)}</text>
  <text x="134" y="24" font-family="{FONT_DISPLAY}" font-size="16.5" font-weight="900" letter-spacing="0.6" fill="{p["ink"]}">{escape(title)}</text>

  <!-- Right-side knockout spec pill + registration crosshair -->
  <rect x="{right_x}" y="9" width="{right_w}" height="21" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1"/>
  <text x="{right_x + right_w / 2:.1f}" y="22.8" text-anchor="middle" font-family="{FONT_MONO}" font-size="9.2" font-weight="700" letter-spacing="0.6" fill="{p["ink"]}">{escape(right)}</text>
  {reg_mark(w - 13, 19.5, 3.8, p["ink"], p["secondary"])}
</svg>"""


def build_card(
    idx: int,
    cid: str,
    name: str,
    num: str,
    tag: str,
    d1: str,
    d2: str,
    stack: str,
    mode: str,
    p: dict[str, str],
) -> str:
    w, h = 417, 196
    colors = [p["accent"], p["secondary"], p["tertiary"], p["highlight"]]
    col = colors[idx % 4]
    pat_id = f"ht-card-{cid}-{mode}"
    ht_op = 0.28 if mode == "light" else 0.30
    shadow_op = 0.85 if mode == "light" else 0.72
    tag_w = max(88, int(len(tag) * 6.8) + 34)

    # 4-step ink-density calibration bars in footer
    densities = [1.0, 0.72, 0.45, 0.22]
    density_svg = []
    for i, op in enumerate(densities):
        bx = 274 + i * 13
        density_svg.append(
            f'<rect x="{bx}" y="167" width="10" height="9" fill="{col}" fill-opacity="{op:.2f}" stroke="{p["border"]}" stroke-opacity="0.35" stroke-width="0.6"/>'
        )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(name)} — Print {escape(num)}">
  <title>{escape(name)} — Risograph Art Print {escape(num)}</title>
  <defs>
    {halftone_pattern(pat_id, col, ht_op, step=7, radius=1.25)}
  </defs>

  <!-- Misregistered 3.5px colored ink shadow layer -->
  <rect x="4" y="4" width="{w - 5}" height="{h - 5}" fill="{col}" fill-opacity="{shadow_op:.2f}"/>

  <!-- Main crisp art-print card -->
  <rect x="0.5" y="0.5" width="{w - 6}" height="{h - 6}" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1.4"/>

  <!-- Halftone header block -->
  <rect x="1.2" y="1.2" width="{w - 7.4:.1f}" height="44" fill="{p["patternBg"]}"/>
  <rect x="1.2" y="1.2" width="{w - 7.4:.1f}" height="44" fill="url(#{pat_id})"/>
  <line x1="0.5" y1="45.2" x2="{w - 5.5}" y2="45.2" stroke="{p["border"]}" stroke-width="1.2"/>

  <!-- Bold print number stamp (01..04) with 2px offset ink shadow -->
  <rect x="14.5" y="11" width="38" height="27" fill="{col}"/>
  <rect x="12" y="8.5" width="38" height="27" fill="{p["ink"]}" stroke="{p["border"]}" stroke-width="1"/>
  <text x="31" y="26.5" text-anchor="middle" font-family="{FONT_DISPLAY}" font-size="15" font-weight="900" fill="{p["surface"]}">{escape(num)}</text>

  <!-- Crisp knockout category plate tag -->
  <rect x="60" y="12.5" width="{tag_w}" height="20" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1"/>
  <circle cx="70.5" cy="22.5" r="3.2" fill="{col}"/>
  <text x="80" y="25.8" font-family="{FONT_MONO}" font-size="9.0" font-weight="700" letter-spacing="0.8" fill="{p["ink"]}">{escape(tag)}</text>

  <!-- Header registration crosshair -->
  {reg_mark(w - 24, 22.5, 4.0, p["ink"], col)}

  <!-- Misregistered duotone project title -->
  <text x="18" y="85.8" font-family="{FONT_DISPLAY}" font-size="25" font-weight="900" fill="{col}" fill-opacity="0.50">{escape(name)}</text>
  <text x="16" y="84" font-family="{FONT_DISPLAY}" font-size="25" font-weight="900" fill="{p["ink"]}">{escape(name)}</text>

  <!-- Crisp description lines -->
  <text x="16" y="112" font-family="{FONT_SANS}" font-size="12.2" fill="{p["sub"]}">{escape(d1)}</text>
  <text x="16" y="131" font-family="{FONT_SANS}" font-size="12.2" fill="{p["sub"]}">{escape(d2)}</text>

  <!-- Ink-density spec footer -->
  <line x1="16" y1="152" x2="{w - 22}" y2="152" stroke="{p["borderSoft"]}" stroke-width="1"/>
  <text x="16" y="175" font-family="{FONT_MONO}" font-size="9.6" font-weight="600" fill="{p["sub"]}">{escape(stack)}</text>
  {"".join(density_svg)}
  <text x="{w - 22}" y="174.5" text-anchor="end" font-family="{FONT_MONO}" font-size="9.8" font-weight="700" fill="{p["ink"]}">OPEN ↗</text>
  <rect x="{w - 64}" y="178" width="42" height="2.6" fill="{col}"/>
</svg>"""


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    buttons = [
        ("cloudlink", "cloudlink.blessc.com", True),
        ("openpet", "openpet.myfurina.top", False),
        ("release", "CloudLink v0.6.0", False),
        ("github", "@Furina-he", False),
    ]
    cards = [
        ("cloudlink", "CloudLink", "01", "GUARDRAIL", "Local-first AI ops cockpit with zero-secret", "deterministic execution guardrails.", "Rust · Tauri · TypeScript"),
        ("openpet", "OpenPet", "02", "COMPANION", "Quiet desktop AI companion featuring local", "memory, habits, and open plugins.", "TypeScript · Electron · AI"),
        ("gitskins", "GitSkins", "03", "PRINT KIT", "Modular Light & Dark GitHub Profile & Repo", "SVG themes with Bento & Live widgets.", "TypeScript · Python · SVG"),
        ("virtual", "Virtual", "04", "SPATIAL", "Interactive 3D virtual lab crafted for", "real-time spatial experimentation.", "TypeScript · WebGL · 3D"),
    ]
    count = 0
    for mode, pal in PALETTES.items():
        files = {
            f"hero-{mode}.svg": build_hero(mode, pal),
            f"sec-work-{mode}.svg": build_section("+ PLATE 01", "SELECTED WORKS", "04 ART PRINTS", mode, "work", pal),
            f"sec-activity-{mode}.svg": build_section("+ PLATE 02", "CONTRIBUTION LEDGER", "@FURINA-HE · 2026", mode, "activity", pal),
        }
        for idx, (bid, lbl, prim) in enumerate(buttons):
            files[f"btn-{bid}-{mode}.svg"] = build_button(lbl, prim, idx, pal)
        for idx, (cid, name, num, tag, d1, d2, stk) in enumerate(cards):
            files[f"card-{cid}-{mode}.svg"] = build_card(idx, cid, name, num, tag, d1, d2, stk, mode, pal)
        for fname, svg in files.items():
            ET.fromstring(svg)
            (OUT_DIR / fname).write_text(svg, encoding="utf-8")
            count += 1
    print(f"[riso-duotone] Generated and XML-validated {count} SVGs")


if __name__ == "__main__":
    main()
