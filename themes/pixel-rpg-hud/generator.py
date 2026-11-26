#!/usr/bin/env python3
"""Generate 22 Light & Dark 16-bit Pixel RPG HUD SVGs and validate strict XML."""

from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape
import xml.etree.ElementTree as ET

OUT_DIR = Path(__file__).resolve().parent / "assets"
FONT_MONO = "'JetBrains Mono','SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace"
FONT_SANS = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"

PALETTES = {
    "light": {
        "bg": "#F6F2E4",
        "surface": "#FFFDF6",
        "ink": "#1B1E2E",
        "sub": "#434963",
        "muted": "#6F7591",
        "border": "#1B1E2E",
        "borderSoft": "#D5CEBA",
        "accent": "#D97706",
        "accentFg": "#FFFFFF",
        "secondary": "#DC2626",
        "tertiary": "#15803D",
        "highlight": "#2563EB",
        "patternBg": "#EAE4D1",
        "patternFg": "#D9D1BA",
    },
    "dark": {
        "bg": "#121524",
        "surface": "#191E33",
        "ink": "#F6F4EA",
        "sub": "#B8C0DC",
        "muted": "#7F8AAD",
        "border": "#EAB308",
        "borderSoft": "#2F385C",
        "accent": "#FACC15",
        "accentFg": "#121524",
        "secondary": "#F87171",
        "tertiary": "#4ADE80",
        "highlight": "#38BDF8",
        "patternBg": "#1E2540",
        "patternFg": "#2B3457",
    },
}

ICONS = {
    "shield": [
        "....AAAA....",
        "..AABBBBAA..",
        ".ABBBBBBBBA.",
        ".ABBBCCBBBA.",
        ".ABBBCCBBBA.",
        ".ABCCCCCCBA.",
        ".ABBBCCBBBA.",
        "..ABBBBBBA..",
        "..ABBBBBBA..",
        "...ABBBBA...",
        "....ABBA....",
        ".....AA.....",
    ],
    "pet": [
        "..AA....AA..",
        ".ABBA..ABBA.",
        ".ABBBBBBBBA.",
        ".ABBBBBBBBA.",
        ".ABCCBBCCBA.",
        ".ABBBBBBBBA.",
        ".ABBBCCBBBA.",
        ".ABBBBBBBBA.",
        "..ABBBBBBA..",
        "..AB.BB.BA..",
        "..AA....AA..",
        "............",
    ],
    "scroll": [
        ".AAAAAAAAAA.",
        "ABBBBBBBBBBA",
        "AB.CCCCCC.BA",
        ".A.BBBBBB.A.",
        ".A.BCCCCB.A.",
        ".A.BBBBBB.A.",
        ".A.BCCCCB.A.",
        ".A.BBBBBB.A.",
        ".A.BBBBBB.A.",
        "ABBBBBBBBBBA",
        ".AAAAAAAAAA.",
        "............",
    ],
    "orb": [
        "....AAAA....",
        "..AABBBBAA..",
        ".ABBCCCCBBA.",
        ".ABCCBBBBBA.",
        ".ABCBBBBBBA.",
        ".ABBBBBBBBA.",
        ".ABBBBBBBBA.",
        ".ABBBBBBBBA.",
        "..ABBBBBBA..",
        "...AAAAAA...",
        "..AACCCCAA..",
        ".AAAAAAAAAA.",
    ],
}


def pixel_grid(rows: list[str], ox: int, oy: int, cell: int, cmap: dict[str, str]) -> str:
    parts = []
    for r, row in enumerate(rows):
        for c, ch in enumerate(row):
            if ch in cmap:
                parts.append(
                    f'<rect x="{ox + c * cell}" y="{oy + r * cell}" width="{cell}" height="{cell}" '
                    f'fill="{cmap[ch]}" shape-rendering="crispEdges"/>'
                )
    return "".join(parts)


def rpg_frame(w: int, h: int, p: dict[str, str], fill_key: str = "bg") -> str:
    return (
        f'<rect x="2" y="2" width="{w - 4}" height="{h - 4}" fill="{p[fill_key]}" '
        f'stroke="{p["border"]}" stroke-width="2" shape-rendering="crispEdges"/>'
        f'<rect x="6" y="6" width="{w - 12}" height="{h - 12}" fill="none" '
        f'stroke="{p["borderSoft"]}" stroke-width="1" shape-rendering="crispEdges"/>'
        f'<rect x="0" y="0" width="6" height="6" fill="{p["border"]}" shape-rendering="crispEdges"/>'
        f'<rect x="{w - 6}" y="0" width="6" height="6" fill="{p["border"]}" shape-rendering="crispEdges"/>'
        f'<rect x="0" y="{h - 6}" width="6" height="6" fill="{p["border"]}" shape-rendering="crispEdges"/>'
        f'<rect x="{w - 6}" y="{h - 6}" width="6" height="6" fill="{p["border"]}" shape-rendering="crispEdges"/>'
        f'<rect x="2" y="2" width="2" height="2" fill="{p["accent"]}" shape-rendering="crispEdges"/>'
        f'<rect x="{w - 4}" y="2" width="2" height="2" fill="{p["accent"]}" shape-rendering="crispEdges"/>'
        f'<rect x="2" y="{h - 4}" width="2" height="2" fill="{p["accent"]}" shape-rendering="crispEdges"/>'
        f'<rect x="{w - 4}" y="{h - 4}" width="2" height="2" fill="{p["accent"]}" shape-rendering="crispEdges"/>'
    )


def stat_bar(x: int, y: int, label: str, val: str, ratio: float, color: str, p: dict[str, str]) -> str:
    segs = 14
    filled = max(1, min(segs, round(segs * ratio)))
    seg_w = 10
    gap = 3
    bars = []
    for i in range(segs):
        sx = x + 36 + i * (seg_w + gap)
        fill = color if i < filled else p["patternBg"]
        bars.append(
            f'<rect x="{sx}" y="{y - 9}" width="{seg_w}" height="10" fill="{fill}" '
            f'stroke="{p["borderSoft"]}" stroke-width="0.8" shape-rendering="crispEdges"/>'
        )
    return (
        f'<text x="{x}" y="{y}" font-family="{FONT_MONO}" font-size="10.5" font-weight="700" fill="{color}">{label}</text>'
        + "".join(bars)
        + f'<text x="{x + 36 + segs * (seg_w + gap) + 8}" y="{y}" font-family="{FONT_MONO}" '
        f'font-size="10" font-weight="700" fill="{p["ink"]}">{val}</text>'
    )


def build_hero(mode: str, p: dict[str, str]) -> str:
    w, h = 846, 304
    uid = f"rpg-{mode}"
    crest = pixel_grid(
        ICONS["shield"],
        674,
        74,
        8,
        {"A": p["border"], "B": p["highlight"], "C": p["accent"]},
    )
    metrics = [
        (p["accent"], "04", "MAIN QUESTS", "Ops · Pet · Skins · 3D"),
        (p["tertiary"], "13", "PUBLIC REPOS", "Rust · TS · Python"),
        (p["highlight"], "20+", "PARTY AGENTS", "CloudLink Guard"),
        (p["secondary"], "S-RANK", "LOCAL-FIRST", "Tauri · Electron · OSS"),
    ]
    cols = [6, 216, 426, 636]
    stats_svg = []
    for idx, (col, val, lbl, sub) in enumerate(metrics):
        cx = cols[idx]
        if idx > 0:
            stats_svg.append(
                f'<line x1="{cx}" y1="234" x2="{cx}" y2="{h - 6}" stroke="{p["borderSoft"]}" stroke-width="1"/>'
            )
        stats_svg.append(
            f'<rect x="{cx + 14}" y="244" width="6" height="6" fill="{col}" shape-rendering="crispEdges"/>'
            f'<text x="{cx + 26}" y="250" font-family="{FONT_MONO}" font-size="8.8" font-weight="700" fill="{p["muted"]}">{lbl}</text>'
            f'<text x="{cx + 14}" y="272" font-family="{FONT_MONO}" font-size="16.5" font-weight="800" fill="{p["ink"]}">{val}</text>'
            f'<text x="{cx + 14}" y="288" font-family="{FONT_SANS}" font-size="10" fill="{p["sub"]}">{escape(sub)}</text>'
        )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Furina-he — 16-bit Pixel RPG HUD Profile">
  <title>Furina-he — 16-bit Pixel RPG HUD</title>
  <style>
    @keyframes tw_{uid} {{ 0%, 100% {{ opacity: 1; }} 50% {{ opacity: 0.25; }} }}
    .tw-{uid} {{ animation: tw_{uid} 1.8s steps(2, end) infinite; }}
    @media (prefers-reduced-motion: reduce) {{ .tw-{uid} {{ animation: none !important; }} }}
  </style>
  {rpg_frame(w, h, p, "bg")}
  <rect x="7" y="7" width="{w - 14}" height="28" fill="{p["patternBg"]}"/>
  <line x1="6" y1="35.5" x2="{w - 6}" y2="35.5" stroke="{p["border"]}" stroke-width="1.4"/>
  <rect x="18" y="16" width="8" height="8" fill="{p["accent"]}" shape-rendering="crispEdges"/>
  <text x="34" y="25" font-family="{FONT_MONO}" font-size="10.5" font-weight="700" fill="{p["ink"]}">LV.26  ·  CLASS: INDIE ARCHMAGE  ·  GUILD: @FURINA-HE</text>
  <text x="{w - 18}" y="25" text-anchor="end" font-family="{FONT_MONO}" font-size="10" font-weight="700" fill="{p["accent"]}">SAVE SLOT 01 · ONLINE</text>

  <text x="28" y="64" font-family="{FONT_MONO}" font-size="10" font-weight="700" fill="{p["accent"]}">&gt; PLAYER STATUS // LOCAL-FIRST AI TOOLING</text>
  <text x="31" y="114" font-family="{FONT_MONO}" font-size="40" font-weight="800" fill="{p["borderSoft"]}">FURINA-HE</text>
  <text x="28" y="111" font-family="{FONT_MONO}" font-size="40" font-weight="800" fill="{p["ink"]}">FURINA-HE</text>
  <text x="28" y="137" font-family="{FONT_SANS}" font-size="13" font-weight="600" fill="{p["sub"]}">AI Agent Guardrails · Desktop Companions · Interactive Systems</text>

  {stat_bar(28, 168, "HP", "980/980", 0.96, p["secondary"], p)}
  {stat_bar(28, 191, "MP", "740/800", 0.88, p["highlight"], p)}
  {stat_bar(28, 214, "XP", "84% NEXT", 0.84, p["tertiary"], p)}

  <!-- Right Framed 16-bit Relic Crest -->
  <rect x="614" y="50" width="212" height="170" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1.6" shape-rendering="crispEdges"/>
  <rect x="620" y="56" width="200" height="158" fill="{p["patternBg"]}" stroke="{p["borderSoft"]}" stroke-width="1" shape-rendering="crispEdges"/>
  {crest}
  <rect class="tw-{uid}" x="638" y="72" width="6" height="6" fill="{p["accent"]}" shape-rendering="crispEdges"/>
  <rect class="tw-{uid}" x="794" y="102" width="6" height="6" fill="{p["tertiary"]}" shape-rendering="crispEdges"/>
  <text x="720" y="198" text-anchor="middle" font-family="{FONT_MONO}" font-size="9.5" font-weight="700" fill="{p["ink"]}">EQUIPPED: RUST + TS + PY</text>

  <line x1="6" y1="233.5" x2="{w - 6}" y2="233.5" stroke="{p["border"]}" stroke-width="1.4"/>
  {"".join(stats_svg)}
</svg>"""


def build_button(label: str, primary: bool, p: dict[str, str]) -> str:
    w = max(136, int(len(label) * 7.2) + 34)
    h = 30
    bg = p["accent"] if primary else p["surface"]
    fg = p["accentFg"] if primary else p["ink"]
    dot = p["accentFg"] if primary else p["accent"]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(label)}">
  <rect x="1" y="1" width="{w - 2}" height="{h - 2}" fill="{bg}" stroke="{p["border"]}" stroke-width="2" shape-rendering="crispEdges"/>
  <rect x="9" y="12" width="6" height="6" fill="{dot}" shape-rendering="crispEdges"/>
  <text x="22" y="19" font-family="{FONT_MONO}" font-size="10.5" font-weight="700" fill="{fg}">{escape(label)}</text>
</svg>"""


def build_section(code: str, title: str, right: str, p: dict[str, str]) -> str:
    w, h = 846, 36
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(title)}">
  <rect x="1" y="1" width="{w - 2}" height="{h - 2}" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="2" shape-rendering="crispEdges"/>
  <rect x="8" y="7" width="82" height="22" fill="{p["accent"]}" shape-rendering="crispEdges"/>
  <text x="49" y="21.5" text-anchor="middle" font-family="{FONT_MONO}" font-size="9.5" font-weight="700" fill="{p["accentFg"]}">{escape(code)}</text>
  <text x="104" y="22.5" font-family="{FONT_MONO}" font-size="12.5" font-weight="800" fill="{p["ink"]}">{escape(title)}</text>
  <text x="{w - 14}" y="22" text-anchor="end" font-family="{FONT_MONO}" font-size="9.5" font-weight="700" fill="{p["muted"]}">{escape(right)}</text>
</svg>"""


def build_card(idx: int, name: str, tag: str, desc1: str, desc2: str, stack: str, icon_key: str, p: dict[str, str]) -> str:
    w, h = 417, 196
    colors = [p["accent"], p["secondary"], p["tertiary"], p["highlight"]]
    col = colors[idx % 4]
    num = f"QUEST 0{idx + 1}"
    icon_svg = pixel_grid(
        ICONS[icon_key],
        330,
        58,
        5,
        {"A": p["border"], "B": col, "C": p["surface"]},
    )
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(name)}">
  <title>{escape(name)} — RPG Quest Card</title>
  {rpg_frame(w, h, p, "surface")}
  <rect x="7" y="7" width="{w - 14}" height="26" fill="{p["patternBg"]}"/>
  <line x1="6" y1="33.5" x2="{w - 6}" y2="33.5" stroke="{p["border"]}" stroke-width="1.2"/>
  <rect x="16" y="15" width="8" height="8" fill="{col}" shape-rendering="crispEdges"/>
  <text x="31" y="23.5" font-family="{FONT_MONO}" font-size="10" font-weight="700" fill="{p["ink"]}">{num} · {escape(tag)}</text>
  <text x="{w - 16}" y="23.5" text-anchor="end" font-family="{FONT_MONO}" font-size="10" font-weight="700" fill="{col}">★★★★</text>

  <text x="18" y="68" font-family="{FONT_MONO}" font-size="20" font-weight="800" fill="{p["ink"]}">{escape(name)}</text>
  <text x="18" y="96" font-family="{FONT_SANS}" font-size="12.2" fill="{p["sub"]}">{escape(desc1)}</text>
  <text x="18" y="116" font-family="{FONT_SANS}" font-size="12.2" fill="{p["sub"]}">{escape(desc2)}</text>

  <rect x="318" y="48" width="82" height="82" fill="{p["patternBg"]}" stroke="{p["borderSoft"]}" stroke-width="1" shape-rendering="crispEdges"/>
  {icon_svg}

  <line x1="16" y1="150" x2="{w - 16}" y2="150" stroke="{p["borderSoft"]}" stroke-width="1"/>
  <text x="18" y="173" font-family="{FONT_MONO}" font-size="10.2" font-weight="700" fill="{p["muted"]}">LOOT // {escape(stack)}</text>
</svg>"""


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    buttons = [
        ("cloudlink", "[EQUIP] cloudlink.blessc.com", True),
        ("openpet", "[PET] openpet.myfurina.top", False),
        ("release", "[DROP] CloudLink v0.6.0", False),
        ("github", "[GUILD] @Furina-he", False),
    ]
    cards = [
        ("cloudlink", "CloudLink", "GUARDRAIL", "Zero-credential AI ops bridge with", "deterministic execution guardrails.", "Rust · Tauri · TypeScript", "shield"),
        ("openpet", "OpenPet", "COMPANION", "Local-first desktop AI pet companion", "with pluggable memory & plugins.", "TypeScript · Electron · AI", "pet"),
        ("gitskins", "GitSkins", "ATELIER", "Agent-ready GitHub Profile & Repo", "SVG skins + 4-col Bento widgets.", "TypeScript · Python · SVG", "scroll"),
        ("virtual", "Virtual", "SANDBOX", "Interactive 3D virtual lab & spatial", "experimentation playground.", "TypeScript · WebGL · 3D", "orb"),
    ]
    count = 0
    for mode, pal in PALETTES.items():
        files = {
            f"hero-{mode}.svg": build_hero(mode, pal),
            f"sec-work-{mode}.svg": build_section("QUEST LOG", "SELECTED SYSTEMS & ACTIVE BUILDS", "04 FLAGSHIP QUESTS", pal),
            f"sec-activity-{mode}.svg": build_section("XP LEDGER", "DAILY CONTRIBUTION ACTIVITY", "@FURINA-HE", pal),
        }
        for bid, lbl, prim in buttons:
            files[f"btn-{bid}-{mode}.svg"] = build_button(lbl, prim, pal)
        for idx, (cid, name, tag, d1, d2, stk, ico) in enumerate(cards):
            files[f"card-{cid}-{mode}.svg"] = build_card(idx, name, tag, d1, d2, stk, ico, pal)
        for fname, svg in files.items():
            ET.fromstring(svg)
            (OUT_DIR / fname).write_text(svg, encoding="utf-8")
            count += 1
    print(f"[pixel-rpg-hud] Generated and XML-validated {count} SVGs")


if __name__ == "__main__":
    main()
