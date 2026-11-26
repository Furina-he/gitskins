#!/usr/bin/env python3
"""Generate 22 Light & Dark Seal Ink Monograph SVGs and validate strict XML."""

from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape
import xml.etree.ElementTree as ET

OUT_DIR = Path(__file__).resolve().parent / "assets"
FONT_MONO = "'JetBrains Mono','SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace"
FONT_SANS = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
FONT_SERIF = "'Newsreader',Georgia,'Times New Roman',serif"

PALETTES = {
    "light": {
        "bg": "#F7F3EA",
        "surface": "#FCF9F2",
        "ink": "#1C1917",
        "sub": "#4E4740",
        "muted": "#847B70",
        "border": "#2B2622",
        "borderSoft": "#DED5C5",
        "accent": "#C4362C",
        "accentFg": "#FCF9F2",
        "secondary": "#2C5E5A",
        "tertiary": "#7C5C3B",
        "highlight": "#B5842A",
        "patternBg": "#EFE8DA",
        "patternFg": "#DCD2BF",
    },
    "dark": {
        "bg": "#141311",
        "surface": "#1B1916",
        "ink": "#F2ECE1",
        "sub": "#C2B9AA",
        "muted": "#8C8274",
        "border": "#D6CCB9",
        "borderSoft": "#35312A",
        "accent": "#E0564A",
        "accentFg": "#141311",
        "secondary": "#56A39B",
        "tertiary": "#C79C6D",
        "highlight": "#DFB35B",
        "patternBg": "#221F1B",
        "patternFg": "#322E28",
    },
}


def scroll_frame(w: int, h: int, p: dict[str, str], fill_key: str = "bg") -> str:
    """Double-hairline bookbinding border with classical geometric corner fret brackets."""
    m = 8
    c = 12
    return (
        f'<rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" fill="{p[fill_key]}" stroke="{p["borderSoft"]}" stroke-width="1"/>'
        f'<rect x="{m}.5" y="{m}.5" width="{w - m * 2 - 1}" height="{h - m * 2 - 1}" fill="none" stroke="{p["border"]}" stroke-opacity="0.72" stroke-width="0.9"/>'
        f'<path d="M {m + 4} {m + c} L {m + 4} {m + 4} L {m + c} {m + 4}" fill="none" stroke="{p["accent"]}" stroke-width="1.3"/>'
        f'<path d="M {w - m - c} {m + 4} L {w - m - 4} {m + 4} L {w - m - 4} {m + c}" fill="none" stroke="{p["accent"]}" stroke-width="1.3"/>'
        f'<path d="M {m + 4} {h - m - c} L {m + 4} {h - m - 4} L {m + c} {h - m - 4}" fill="none" stroke="{p["accent"]}" stroke-width="1.3"/>'
        f'<path d="M {w - m - c} {h - m - 4} L {w - m - 4} {h - m - 4} L {w - m - 4} {h - m - c}" fill="none" stroke="{p["accent"]}" stroke-width="1.3"/>'
    )


def carved_seal(x: int, y: int, size: int, p: dict[str, str]) -> str:
    """Geometric carved cinnabar square seal stamp (100% font-independent vector strokes)."""
    inner = size - 8
    mid = x + size // 2
    my = y + size // 2
    return (
        f'<g aria-hidden="true">'
        f'<rect x="{x}" y="{y}" width="{size}" height="{size}" rx="2" fill="{p["accent"]}"/>'
        f'<rect x="{x + 4}" y="{y + 4}" width="{inner}" height="{inner}" fill="none" stroke="{p["accentFg"]}" stroke-width="1.3"/>'
        f'<line x1="{mid}" y1="{y + 7}" x2="{mid}" y2="{y + size - 7}" stroke="{p["accentFg"]}" stroke-width="1.6"/>'
        f'<line x1="{x + 8}" y1="{my}" x2="{x + size - 8}" y2="{my}" stroke="{p["accentFg"]}" stroke-width="1.5"/>'
        f'<path d="M {x + 10} {y + 11} H {mid - 3} V {my - 4} H {x + 10}" fill="none" stroke="{p["accentFg"]}" stroke-width="1.4"/>'
        f'<path d="M {mid + 4} {y + 11} H {x + size - 10} V {y + size - 11} H {mid + 4}" fill="none" stroke="{p["accentFg"]}" stroke-width="1.4"/>'
        f'<line x1="{x + 10}" y1="{y + size - 11}" x2="{mid - 3}" y2="{y + size - 11}" stroke="{p["accentFg"]}" stroke-width="1.5"/>'
        f"</g>"
    )


def build_hero(mode: str, p: dict[str, str]) -> str:
    w, h = 846, 300
    uid = f"ink-{mode}"
    seal = carved_seal(756, 62, 46, p)
    metrics = [
        (p["accent"], "04", "FLAGSHIP WORKS", "Ops · AI Pet · Skins · 3D"),
        (p["secondary"], "13", "PUBLIC REPOS", "Rust · TypeScript · Python"),
        (p["tertiary"], "20+", "SYNCED AGENTS", "CloudLink Skill & Guard"),
        (p["highlight"], "LOCAL", "CRAFT ETHOS", "Calm · Crisp · Static"),
    ]
    cols = [22, 224, 426, 628]
    colophon = []
    for idx, (col, val, lbl, sub) in enumerate(metrics):
        cx = cols[idx]
        if idx > 0:
            colophon.append(
                f'<line x1="{cx - 10}" y1="234" x2="{cx - 10}" y2="278" stroke="{p["borderSoft"]}" stroke-width="0.9"/>'
            )
        colophon.append(
            f'<rect x="{cx}" y="234" width="5" height="5" fill="{col}"/>'
            f'<text x="{cx + 11}" y="240" font-family="{FONT_MONO}" font-size="8.5" font-weight="700" letter-spacing="0.6" fill="{p["muted"]}">{lbl}</text>'
            f'<text x="{cx}" y="263" font-family="{FONT_SERIF}" font-size="18" font-weight="700" fill="{p["ink"]}">{val}</text>'
            f'<text x="{cx}" y="280" font-family="{FONT_SANS}" font-size="10" fill="{p["sub"]}">{escape(sub)}</text>'
        )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Furina-he — Seal Ink Monograph GitHub Profile">
  <title>Furina-he — Seal Ink Monograph</title>
  <style>
    @keyframes mist_{uid} {{ 0%, 100% {{ transform: translateX(0px); opacity: 0.45; }} 50% {{ transform: translateX(10px); opacity: 0.72; }} }}
    .mist-{uid} {{ animation: mist_{uid} 7s ease-in-out infinite; }}
    @media (prefers-reduced-motion: reduce) {{ .mist-{uid} {{ animation: none !important; }} }}
  </style>
  {scroll_frame(w, h, p, "bg")}
  <!-- Layered geometric ink-wash mountain horizon on lower right -->
  <path d="M 480 222 Q 555 152 628 192 T 764 148 L 836 186 L 836 222 Z" fill="{p["patternBg"]}" fill-opacity="0.85"/>
  <path d="M 556 222 Q 625 168 696 198 T 836 172 L 836 222 Z" fill="{p["patternFg"]}" fill-opacity="0.58"/>
  <g class="mist-{uid}">
    <line x1="566" y1="184" x2="668" y2="184" stroke="{p["surface"]}" stroke-width="2" stroke-linecap="round"/>
    <line x1="636" y1="196" x2="724" y2="196" stroke="{p["surface"]}" stroke-width="1.6" stroke-linecap="round"/>
  </g>

  <!-- Masthead line -->
  <text x="28" y="34" font-family="{FONT_MONO}" font-size="9.5" letter-spacing="1.4" fill="{p["muted"]}">MONOGRAPH SCROLL · @FURINA-HE</text>
  <text x="{w - 28}" y="34" text-anchor="end" font-family="{FONT_MONO}" font-size="9.5" letter-spacing="1.1" fill="{p["muted"]}">CLOUDLINK.BLESSC.COM · 2026</text>
  <line x1="22" y1="44.5" x2="{w - 22}" y2="44.5" stroke="{p["borderSoft"]}" stroke-width="0.9"/>

  <!-- Primary Typography -->
  <rect x="28" y="64" width="6" height="6" fill="{p["accent"]}"/>
  <text x="42" y="71" font-family="{FONT_MONO}" font-size="9.8" font-weight="700" letter-spacing="1.2" fill="{p["accent"]}">INDIE DEVELOPER · LOCAL-FIRST AI STUDIO</text>
  <text x="28" y="128" font-family="{FONT_SERIF}" font-size="46" font-weight="700" fill="{p["ink"]}">Furina-he<tspan fill="{p["accent"]}">.</tspan></text>
  <text x="28" y="160" font-family="{FONT_SERIF}" font-size="15.5" font-style="italic" fill="{p["sub"]}">Crafting deterministic agent guardrails, desktop companions, and quiet SVG craft.</text>
  <text x="28" y="190" font-family="{FONT_MONO}" font-size="10.5" fill="{p["muted"]}">STACK · Rust · TypeScript · Python · Tauri · Electron · Cloudflare</text>

  <!-- Carved Cinnabar Seal Stamp & Vertical Bookbinding Rule -->
  <line x1="736.5" y1="62" x2="736.5" y2="148" stroke="{p["borderSoft"]}" stroke-width="1"/>
  {seal}
  <text x="779" y="124" text-anchor="middle" font-family="{FONT_MONO}" font-size="8.5" letter-spacing="1" fill="{p["accent"]}">SEAL · 06</text>

  <!-- Bottom Colophon Rail -->
  <line x1="22" y1="222.5" x2="{w - 22}" y2="222.5" stroke="{p["border"]}" stroke-opacity="0.65" stroke-width="0.9"/>
  <line x1="22" y1="225.5" x2="{w - 22}" y2="225.5" stroke="{p["borderSoft"]}" stroke-width="0.7"/>
  {"".join(colophon)}
</svg>"""


def build_button(label: str, primary: bool, p: dict[str, str]) -> str:
    w = max(124, int(len(label) * 7.0) + 32)
    h = 30
    bg = p["accent"] if primary else p["surface"]
    fg = p["accentFg"] if primary else p["ink"]
    dot = p["accentFg"] if primary else p["accent"]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(label)}">
  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" fill="{bg}" stroke="{p["border"] if primary else p["borderSoft"]}" stroke-width="1"/>
  <rect x="10" y="12" width="5" height="5" fill="{dot}"/>
  <text x="22" y="19" font-family="{FONT_MONO}" font-size="10.5" font-weight="700" fill="{fg}">{escape(label)}</text>
</svg>"""


def build_section(code: str, title: str, right: str, p: dict[str, str]) -> str:
    w, h = 846, 36
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(title)}">
  <rect width="{w}" height="{h}" fill="{p["bg"]}"/>
  <line x1="0" y1="2.5" x2="{w}" y2="2.5" stroke="{p["border"]}" stroke-opacity="0.75" stroke-width="1.2"/>
  <line x1="0" y1="5.5" x2="{w}" y2="5.5" stroke="{p["borderSoft"]}" stroke-width="0.7"/>
  <rect x="2" y="12" width="14" height="14" rx="1" fill="{p["accent"]}"/>
  <rect x="5" y="15" width="8" height="8" fill="none" stroke="{p["accentFg"]}" stroke-width="1"/>
  <text x="26" y="24" font-family="{FONT_SERIF}" font-size="15.5" font-weight="700" fill="{p["ink"]}">{escape(code)} · {escape(title)}</text>
  <text x="{w - 4}" y="23" text-anchor="end" font-family="{FONT_MONO}" font-size="9.5" letter-spacing="0.8" fill="{p["muted"]}">{escape(right)}</text>
  <line x1="0" y1="34.5" x2="{w}" y2="34.5" stroke="{p["borderSoft"]}" stroke-width="0.9"/>
</svg>"""


def build_card(idx: int, name: str, roman: str, tag: str, d1: str, d2: str, stack: str, p: dict[str, str]) -> str:
    w, h = 417, 196
    colors = [p["accent"], p["secondary"], p["tertiary"], p["highlight"]]
    col = colors[idx % 4]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(name)}">
  <title>{escape(name)} — Seal Ink Folio</title>
  {scroll_frame(w, h, p, "surface")}
  <rect x="9" y="9" width="{w - 18}" height="3" fill="{col}"/>
  <text x="22" y="34" font-family="{FONT_MONO}" font-size="9.2" font-weight="700" letter-spacing="1.1" fill="{col}">FOLIO {roman} · {escape(tag)}</text>
  <rect x="{w - 38}" y="22" width="14" height="14" rx="1" fill="{col}"/>
  <rect x="{w - 35}" y="25" width="8" height="8" fill="none" stroke="{p["surface"]}" stroke-width="1"/>

  <text x="22" y="72" font-family="{FONT_SERIF}" font-size="24" font-weight="700" fill="{p["ink"]}">{escape(name)}</text>
  <text x="22" y="102" font-family="{FONT_SANS}" font-size="12.5" fill="{p["sub"]}">{escape(d1)}</text>
  <text x="22" y="122" font-family="{FONT_SANS}" font-size="12.5" fill="{p["sub"]}">{escape(d2)}</text>

  <line x1="22" y1="150" x2="{w - 22}" y2="150" stroke="{p["borderSoft"]}" stroke-width="0.9"/>
  <text x="22" y="172" font-family="{FONT_MONO}" font-size="10" fill="{p["muted"]}">{escape(stack)}</text>
  <text x="{w - 22}" y="172" text-anchor="end" font-family="{FONT_MONO}" font-size="10" font-weight="700" fill="{col}">OPEN ↗</text>
</svg>"""


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    buttons = [
        ("cloudlink", "· cloudlink.blessc.com", True),
        ("openpet", "· openpet.myfurina.top", False),
        ("release", "· CloudLink v0.6.0", False),
        ("github", "· @Furina-he", False),
    ]
    cards = [
        ("cloudlink", "CloudLink", "I", "GUARDRAIL", "Local-first AI ops cockpit with zero-secret", "deterministic execution guardrails.", "Rust · Tauri · TypeScript"),
        ("openpet", "OpenPet", "II", "COMPANION", "Quiet desktop AI companion featuring local", "memory, habits, and open plugins.", "TypeScript · Electron · AI"),
        ("gitskins", "GitSkins", "III", "MONOGRAPH", "Modular Light & Dark GitHub Profile & Repo", "SVG themes with Bento widgets.", "TypeScript · Python · SVG"),
        ("virtual", "Virtual", "IV", "SPATIAL", "Interactive 3D virtual lab crafted for", "real-time spatial experimentation.", "TypeScript · WebGL · 3D"),
    ]
    count = 0
    for mode, pal in PALETTES.items():
        files = {
            f"hero-{mode}.svg": build_hero(mode, pal),
            f"sec-work-{mode}.svg": build_section("FOLIO I", "SELECTED WORKS", "04 MONOGRAPHS", pal),
            f"sec-activity-{mode}.svg": build_section("FOLIO II", "CONTRIBUTION LEDGER", "@FURINA-HE", pal),
        }
        for bid, lbl, prim in buttons:
            files[f"btn-{bid}-{mode}.svg"] = build_button(lbl, prim, pal)
        for idx, (cid, name, roman, tag, d1, d2, stk) in enumerate(cards):
            files[f"card-{cid}-{mode}.svg"] = build_card(idx, name, roman, tag, d1, d2, stk, pal)
        for fname, svg in files.items():
            ET.fromstring(svg)
            (OUT_DIR / fname).write_text(svg, encoding="utf-8")
            count += 1
    print(f"[seal-ink-scroll] Generated and XML-validated {count} SVGs")


if __name__ == "__main__":
    main()
