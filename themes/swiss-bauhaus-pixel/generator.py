#!/usr/bin/env python3
"""Generate the Swiss-Bauhaus Pixel Poster SVG suite for Furina-he's GitHub Profile.

Produces Light & Dark paired SVGs in assets/, validates all output as strict XML,
and keeps typography, 0px architectural rules, orthogonal pixel weaves, pixel portrait,
and 16x16 project emblems completely deterministic.
"""

from __future__ import annotations

from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"

FONT_SANS = (
    '"Inter Tight", -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", '
    '"Noto Sans CJK SC", "Helvetica Neue", Arial, sans-serif'
)
FONT_MONO = (
    '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace'
)

# ---------------------------------------------------------------------------
# 9-row monumental bold pixel display font (Swiss-Bauhaus proportions)
# ---------------------------------------------------------------------------
GLYPHS_9: dict[str, list[str]] = {
    "F": [
        "#######",
        "#######",
        "##.....",
        "######.",
        "######.",
        "##.....",
        "##.....",
        "##.....",
        "##.....",
    ],
    "U": [
        "##...##",
        "##...##",
        "##...##",
        "##...##",
        "##...##",
        "##...##",
        "##...##",
        "#######",
        ".#####.",
    ],
    "R": [
        "######.",
        "#######",
        "##...##",
        "#######",
        "######.",
        "##..##.",
        "##...##",
        "##...##",
        "##...##",
    ],
    "I": [
        "######",
        "######",
        "..##..",
        "..##..",
        "..##..",
        "..##..",
        "..##..",
        "######",
        "######",
    ],
    "N": [
        "##...##",
        "###..##",
        "####.##",
        "#######",
        "##.####",
        "##..###",
        "##...##",
        "##...##",
        "##...##",
    ],
    "A": [
        "..###..",
        ".#####.",
        "##...##",
        "##...##",
        "#######",
        "#######",
        "##...##",
        "##...##",
        "##...##",
    ],
    "-": [
        "....",
        "....",
        "....",
        "####",
        "####",
        "....",
        "....",
        "....",
        "....",
    ],
    "H": [
        "##...##",
        "##...##",
        "##...##",
        "#######",
        "#######",
        "##...##",
        "##...##",
        "##...##",
        "##...##",
    ],
    "E": [
        "#######",
        "#######",
        "##.....",
        "######.",
        "######.",
        "##.....",
        "##.....",
        "#######",
        "#######",
    ],
    "0": [
        ".#####.",
        "#######",
        "##...##",
        "##..###",
        "##.#.##",
        "###..##",
        "##...##",
        "#######",
        ".#####.",
    ],
    "1": [
        "..##..",
        ".###..",
        "####..",
        "..##..",
        "..##..",
        "..##..",
        "..##..",
        "######",
        "######",
    ],
    "2": [
        ".#####.",
        "#######",
        "##...##",
        "....##.",
        "..###..",
        ".###...",
        "##.....",
        "#######",
        "#######",
    ],
    "3": [
        ".#####.",
        "#######",
        "##...##",
        "...###.",
        "...###.",
        ".....##",
        "##...##",
        "#######",
        ".#####.",
    ],
    "4": [
        "....##.",
        "...###.",
        "..####.",
        ".##.##.",
        "##..##.",
        "#######",
        "#######",
        "....##.",
        "....##.",
    ],
    "+": [
        "......",
        "..##..",
        "..##..",
        "######",
        "######",
        "..##..",
        "..##..",
        "......",
        "......",
    ],
    "M": [
        "##...##",
        "###.###",
        "#######",
        "##.#.##",
        "##...##",
        "##...##",
        "##...##",
        "##...##",
        "##...##",
    ],
    "C": [
        ".#####.",
        "#######",
        "##.....",
        "##.....",
        "##.....",
        "##.....",
        "##.....",
        "#######",
        ".#####.",
    ],
    "P": [
        "######.",
        "#######",
        "##...##",
        "#######",
        "######.",
        "##.....",
        "##.....",
        "##.....",
        "##.....",
    ],
}


def fmt(n: float) -> str:
    s = f"{n:.1f}"
    return s[:-2] if s.endswith(".0") else s


def pixel_text_path(
    text: str, x: float, y: float, cw: float, ch: float, gap_cols: float = 2.0
) -> tuple[str, float]:
    """Build merged horizontal-run SVG path for 9-row pixel display text."""
    parts: list[str] = []
    cur_x = x
    for idx, ch_char in enumerate(text):
        glyph = GLYPHS_9[ch_char]
        cols = len(glyph[0])
        for r, row in enumerate(glyph):
            c = 0
            while c < cols:
                if row[c] == "#":
                    start = c
                    while c < cols and row[c] == "#":
                        c += 1
                    rx = cur_x + start * cw
                    ry = y + r * ch
                    rw = (c - start) * cw
                    parts.append(f"M{rx:.1f} {ry:.1f}h{rw:.1f}v{ch:.1f}h-{rw:.1f}z")
                else:
                    c += 1
        cur_x += cols * cw
        if idx < len(text) - 1:
            cur_x += gap_cols * cw
    return "".join(parts), cur_x - x


def grid_to_paths(
    grid: list[str],
    palette: dict[str, str],
    ox: float,
    oy: float,
    px: float,
) -> str:
    """Convert a character pixel-art grid into color-grouped crisp SVG <path> elements."""
    by_color: dict[str, list[str]] = {}
    for r, row in enumerate(grid):
        c = 0
        n = len(row)
        while c < n:
            sym = row[c]
            if sym != "." and sym in palette:
                start = c
                while c < n and row[c] == sym:
                    c += 1
                rx = ox + start * px
                ry = oy + r * px
                rw = (c - start) * px
                by_color.setdefault(palette[sym], []).append(
                    f"M{fmt(rx)} {fmt(ry)}h{fmt(rw)}v{fmt(px)}h-{fmt(rw)}z"
                )
            else:
                c += 1
    out = []
    for color, segs in by_color.items():
        out.append(f'<path fill="{color}" d="{"".join(segs)}"/>')
    return '<g shape-rendering="crispEdges">' + "".join(out) + "</g>"


# ---------------------------------------------------------------------------
# Orthogonal Bauhaus Pixel Weaves (6x6 cell grid, horizontal-run merged)
# ---------------------------------------------------------------------------
def weave_svg(
    kind: str, x: int, y: int, w: int, h: int, bg: str, fg: str, cell: int = 6
) -> str:
    """Generate crisp orthogonal pixel weave pattern (plus, cross, tartan, basket)."""
    cols = (w + cell - 1) // cell
    rows = (h + cell - 1) // cell

    def hit(r: int, c: int) -> bool:
        if kind == "plus":
            # Staggered 3x3 plus tiles inside a 6x6 repeat
            rm, cm = r % 6, c % 6
            in_a = (rm == 1 and cm in (0, 1, 2)) or (cm == 1 and rm in (0, 1, 2))
            in_b = (rm == 4 and cm in (3, 4, 5)) or (cm == 4 and rm in (3, 4, 5))
            return in_a or in_b
        if kind == "cross":
            # Crisp Swiss cross-hatch grid (period 4)
            return (r % 4 == 1) or (c % 4 == 1)
        if kind == "tartan":
            # Diagonal stepped pixel weave (period 4)
            rm, cm = r % 4, c % 4
            if rm == 0:
                return cm in (2, 3)
            if rm == 1:
                return cm in (1, 2, 3)
            return cm in (0, 1)
        if kind == "basket":
            # Bauhaus woven basket (period 8)
            rm, cm = r % 8, c % 8
            if rm in (0, 2):
                return cm in (0, 1, 2, 3, 4, 6)
            if rm in (1, 3):
                return cm in (4, 6)
            if rm in (4, 6):
                return cm in (0, 2, 4, 5, 6, 7)
            return cm in (0, 2)
        raise ValueError(f"Unknown weave: {kind}")

    segs: list[str] = []
    for r in range(rows):
        ry = y + r * cell
        rh = min(cell, y + h - ry)
        c = 0
        while c < cols:
            if hit(r, c):
                start = c
                while c < cols and hit(r, c):
                    c += 1
                rx = x + start * cell
                rw = min((c - start) * cell, x + w - rx)
                segs.append(f"M{rx} {ry}h{rw}v{rh}h-{rw}z")
            else:
                c += 1
    return (
        f'<g shape-rendering="crispEdges">'
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{bg}"/>'
        f'<path fill="{fg}" d="{"".join(segs)}"/>'
        f"</g>"
    )


# ---------------------------------------------------------------------------
# 28x28 Pixel Portrait of Furina-he's Blue-Haired Chibi Maid Avatar
# ---------------------------------------------------------------------------
FURINA_PALETTE = {
    "K": "#1D2238",  # crisp navy-ink outline
    "W": "#FFFFFF",  # white frilly maid headband, eye highlights, collar
    "L": "#D6E1F2",  # cool lace shadow
    "B": "#546BC2",  # Furina periwinkle-cobalt hair base
    "D": "#384B96",  # hair deep shadow
    "H": "#85A1EC",  # soft periwinkle hair shine
    "C": "#58BCEE",  # sky-cyan side ribbon & bowtie diamond gem
    "A": "#2E84B8",  # cyan ribbon shading
    "S": "#FFF3EB",  # porcelain chibi skin
    "P": "#F5B0B8",  # rosy chibi cheek blush
    "E": "#2B3C7A",  # deep sapphire chibi iris
    "G": "#7C9BE8",  # lower iris sapphire glow
    "N": "#273154",  # dark navy bowtie
}

FURINA_OPEN = [
    ".........KKK....KKK.........",
    "......KKKWWWK..KWWWKKK......",
    ".....KWWWWWWKKKKWWWWWWK.....",
    "....KWWLKKKKKKKKKKKKLWWK....",
    "...KWWKKBBBBBBBBBBBBKKWWK...",
    "...KWKBBHHBBBBBBHHBBBBKWK...",
    "..KWWKBBHHBBBBBBHHBBBBKWWK..",
    "..KWKBBBBBBBBBBBBBBBBBKKWK..",
    "..KKKBBBBBBKBBKBBBBBBBWKCK..",
    ".KBBBBBBBBBKBBKBBBBBBBWKCCK.",
    ".KBBHBBBBBBKBBKBBBBBBBKCKAK.",
    ".KBBBKKBBBBBBBBBBBBKKBKKCK..",
    ".KBBKSSKBBKBBBBKBBKSSKBBBK..",
    ".KBBKSKKKKKSSSSKKKKKSKBBBK..",
    ".KBBKSKWWEEKSSKWWEEKSKBBBK..",
    ".KBBKSKWEGGKSSKWEGGKSKBBBK..",
    ".KDBKSKEGGGKSSKEGGGKSKBBDK..",
    "..KBKSKGGGGKSSKGGGGKSKBDK...",
    "..KKKPPKKKKSSSSKKKKPPKKDK...",
    "...KKSSPPSSSSSSSSPPSSKKDK...",
    "...KBBKKSSSSSSSSSSKKBBDK....",
    "..KDBBBWKKSSSSSSKKWBBBDK....",
    "..KDBBWLLKKKKKKKKLLWBBDK....",
    ".KDBBBWWKNNKCCKNNKWWBBBDK...",
    ".KDBBBWKKNNKCCKNNKKWBBBDK...",
    ".KDBBBKWWKNNNNNNKWWKBBBDK...",
    ".KDBBBKWWWKKKKKKWWWKBBBDK...",
    "..KKKK.KKKKKKKKKKKK.KKKK....",
]

FURINA_CLOSED = [
    ".........KKK....KKK.........",
    "......KKKWWWK..KWWWKKK......",
    ".....KWWWWWWKKKKWWWWWWK.....",
    "....KWWLKKKKKKKKKKKKLWWK....",
    "...KWWKKBBBBBBBBBBBBKKWWK...",
    "...KWKBBHHBBBBBBHHBBBBKWK...",
    "..KWWKBBHHBBBBBBHHBBBBKWWK..",
    "..KWKBBBBBBBBBBBBBBBBBKKWK..",
    "..KKKBBBBBBKBBKBBBBBBBWKCK..",
    ".KBBBBBBBBBKBBKBBBBBBBWKCCK.",
    ".KBBHBBBBBBKBBKBBBBBBBKCKAK.",
    ".KBBBKKBBBBBBBBBBBBKKBKKCK..",
    ".KBBKSSKBBKBBBBKBBKSSKBBBK..",
    ".KBBKSSSSSSSSSSSSSSSSKBBBK..",
    ".KBBKSSSSSSSSSSSSSSSSKBBBK..",
    ".KBBKSKKKKKSSSSKKKKKSKBBBK..",
    ".KDBKSSSSSSSSSSSSSSSSKBBDK..",
    "..KBKSSSSSSSSSSSSSSSSKBDK...",
    "..KKKPPSSSSSSSSSSSSPPKKDK...",
    "...KKSSPPSSSSSSSSPPSSKKDK...",
    "...KBBKKSSSSSSSSSSKKBBDK....",
    "..KDBBBWKKSSSSSSKKWBBBDK....",
    "..KDBBWLLKKKKKKKKLLWBBDK....",
    ".KDBBBWWKNNKCCKNNKWWBBBDK...",
    ".KDBBBWKKNNKCCKNNKKWBBBDK...",
    ".KDBBBKWWKNNNNNNKWWKBBBDK...",
    ".KDBBBKWWWKKKKKKWWWKBBBDK...",
    "..KKKK.KKKKKKKKKKKK.KKKK....",
]

assert len(FURINA_OPEN) == 28 and all(len(r) == 28 for r in FURINA_OPEN)
assert len(FURINA_CLOSED) == 28 and all(len(r) == 28 for r in FURINA_CLOSED)

# ---------------------------------------------------------------------------
# 16x16 Bespoke Bauhaus Pixel Emblems for the 4 Flagship Project Cards
# ---------------------------------------------------------------------------
# 01: CloudLink — faithful pixel rendering of cloudlink-icon.svg
#     (square = servers/cloud, circle = AI agent, intersection = Signal Cyan #00A3CC)
EMBLEM_CLOUDLINK_PAL = {
    "W": "#FFFFFF",
    "C": "#00A3CC",
    "S": "#7DD3FC",
    "K": "#0A0A0A",
}
EMBLEM_CLOUDLINK = [
    "................",
    "..WWWWWWWW......",
    ".WWWWWWWWWW.....",
    ".WW......WW.....",
    ".WW......WW.....",
    ".WW....CCCCWW...",
    ".WW...CCCCCCWW..",
    ".WW...CCSSCCWWW.",
    ".WW...CCCCCC.WW.",
    ".WWWWWCCCC...WW.",
    "..WWWWWW.....WW.",
    ".....WW......WW.",
    ".....WW.....WWW.",
    "......WWWWWWWW..",
    ".......WWWWWW...",
    "................",
]

# 02: OpenPet — desktop AI character companion with sparkling eyes & heart spark
EMBLEM_OPENPET_PAL = {
    "W": "#FFFFFF",
    "P": "#F3ACF0",
    "C": "#38BDF8",
    "R": "#FF6B8B",
    "K": "#0A0A0A",
}
EMBLEM_OPENPET = [
    "...........R.R..",
    "..........RRRRR.",
    "..WW...WW..RRR..",
    ".WPPW.WPPW..R...",
    ".WPPWWWPPW......",
    ".WWWWWWWWW......",
    ".WWCWWWCWW......",
    ".WWCWWWCWW......",
    ".WPWWWWWPW......",
    ".WWWWWWWWW......",
    "..WWWWWWW.......",
    "...WWWWW........",
    "..WWWWWWWWW.....",
    ".WWPPPPPPPWW....",
    ".WWWWWWWWWWW....",
    "................",
]

# 03: GitSkins — layered Bauhaus multi-skin GitHub profile frame mark
EMBLEM_GITSKINS_PAL = {
    "W": "#FFFFFF",
    "C": "#00A3CC",
    "R": "#E45847",
    "Y": "#F5B700",
    "G": "#22C98A",
}
EMBLEM_GITSKINS = [
    "................",
    ".WWWWWWWWWWWWWW.",
    ".W............W.",
    ".W.CCCCCC.WWW.W.",
    ".W.CCCCCC.WWW.W.",
    ".W.CCCCCC.WWW.W.",
    ".W.CCCCCC.WWW.W.",
    ".W............W.",
    ".W.GGGG.RRRRR.W.",
    ".W.GGGG.RRRRR.W.",
    ".W.GGGG.RRWRR.W.",
    ".W.GGGG.RRRRR.W.",
    ".W.YYYY.RRRRR.W.",
    ".W............W.",
    ".WWWWWWWWWWWWWW.",
    "................",
]

# 04: Virtual — 3D electrical & electronics circuit simulator (IC chip + oscilloscope trace)
EMBLEM_VIRTUAL_PAL = {
    "W": "#FFFFFF",
    "G": "#22C98A",
    "Y": "#F5B700",
    "B": "#7FB3FF",
    "K": "#0A0A0A",
}
EMBLEM_VIRTUAL = [
    "....Y..Y..Y.....",
    "....Y..Y..Y.....",
    "..WWWWWWWWWWW...",
    "..WKKKKKKKKKW...",
    "YYWK..GG...KWYY.",
    "..WK.G..G..KW...",
    "YYWKG....G.KWYY.",
    "..WK....G.GKW...",
    "YYWK.....G.KWYY.",
    "..WKBBBBBBBKW...",
    "YYWKBBBBBBBKWYY.",
    "..WKKKKKKKKKW...",
    "..WWWWWWWWWWW...",
    "....Y..Y..Y.....",
    "....Y..Y..Y.....",
    "................",
]

for name, grid in [
    ("cloudlink", EMBLEM_CLOUDLINK),
    ("openpet", EMBLEM_OPENPET),
    ("gitskins", EMBLEM_GITSKINS),
    ("virtual", EMBLEM_VIRTUAL),
]:
    assert len(grid) == 16 and all(len(r) == 16 for r in grid), f"Bad emblem: {name}"


# ---------------------------------------------------------------------------
# Theme palettes (Light warm paper & Dark deep slate-ink)
# ---------------------------------------------------------------------------
THEMES = {
    "light": {
        "bg": "#FAF9F5",
        "card_bg": "#FFFFFF",
        "surface": "#FFFFFF",
        "border": "#0A0A0A",
        "rule_soft": "#D4D4D8",
        "text": "#0A0A0A",
        "text_sub": "#3F3F46",
        "text_muted": "#71717A",
        "hero_weave_bg": "#7CC4FA",
        "hero_weave_fg": "#4CA4EC",
        "portrait_bg": "#FFFDF8",
        "portrait_shadow": "#0A0A0A",
        "btn_primary_bg": "#0A0A0A",
        "btn_primary_fg": "#FFFFFF",
        "btn_primary_dot": "#38BDF8",
        "btn_primary_border": "#0A0A0A",
        "btn_bg": "#FFFFFF",
        "btn_border": "#0A0A0A",
        "accent": "#00A3CC",
    },
    "dark": {
        "bg": "#101115",
        "card_bg": "#101115",
        "surface": "#16181F",
        "border": "#2E313D",
        "rule_soft": "#232631",
        "text": "#F4F4F6",
        "text_sub": "#B4B6C2",
        "text_muted": "#7C8091",
        "hero_weave_bg": "#14243A",
        "hero_weave_fg": "#1F3C63",
        "portrait_bg": "#181A22",
        "portrait_shadow": "#0A0A0A",
        "btn_primary_bg": "#38BDF8",
        "btn_primary_fg": "#0A0A0A",
        "btn_primary_dot": "#0A0A0A",
        "btn_primary_border": "#2E313D",
        "btn_bg": "#14161C",
        "btn_border": "#2E313D",
        "accent": "#38BDF8",
    },
}


# ---------------------------------------------------------------------------
# SVG Builders
# ---------------------------------------------------------------------------
def build_hero(mode: str) -> str:
    t = THEMES[mode]
    mini_mark, _ = pixel_text_path("FURINA-HE", 20.0, 11.0, 1.7, 1.6, gap_cols=2.0)
    big_mark, _ = pixel_text_path("FURINA-HE", 24.0, 106.0, 7.15, 6.8, gap_cols=2.0)
    right_weave = weave_svg(
        "plus", 589, 37, 256, 193, t["hero_weave_bg"], t["hero_weave_fg"], cell=6
    )

    # Portrait 28x28 at 4px per cell = 112x112 centered horizontally in 142x142 frame (x=646.5..788.5)
    # Center X = 646.5 + (142 - 112)/2 = 661.5 -> 662; Y = 68..180 (leaves crisp space for bottom label at y=194)
    portrait_open = grid_to_paths(FURINA_OPEN, FURINA_PALETTE, 662, 68, 4)
    portrait_closed = grid_to_paths(FURINA_CLOSED, FURINA_PALETTE, 662, 68, 4)

    # Bottom 4-column metric bar (4 equal columns across 846px)
    metrics = [
        ("#00A3CC", "04", "Flagship Systems", "Ops · AI Pet · Skins · 3D"),
        ("#2370E8", "13", "Public Repos", "Rust · TypeScript · Python"),
        ("#2BA676", "20+", "Synced Agents", "CloudLink Skill &amp; Guard"),
        ("#F5B700", "MCP", "Local-First", "Tauri · Electron · OSS"),
    ]
    col_starts = [0, 212, 423, 634]
    metric_lines: list[str] = []
    for idx, (dot_color, val, label, sub) in enumerate(metrics):
        cx = col_starts[idx]
        if idx > 0:
            metric_lines.append(
                f'  <line x1="{cx + 0.5}" y1="230.5" x2="{cx + 0.5}" y2="293.5" stroke="{t["border"]}" stroke-width="1"/>'
            )
        pad_x = cx + 16
        metric_lines.append(
            f'  <rect x="{pad_x}" y="242" width="6" height="6" fill="{dot_color}" shape-rendering="crispEdges"/>'
        )
        m_path, m_w = pixel_text_path(val, float(pad_x), 254.0, 2.35, 2.6, gap_cols=1.2)
        metric_lines.append(
            f'  <path fill="{t["text"]}" shape-rendering="crispEdges" d="{m_path}"/>'
        )
        tx = int(round(pad_x + m_w + 10))
        metric_lines.append(
            f'  <text x="{tx}" y="263" font-family=\'{FONT_SANS}\' font-size="11.5" font-weight="700" fill="{t["text"]}">{label}</text>'
        )
        metric_lines.append(
            f'  <text x="{tx}" y="277" font-family=\'{FONT_SANS}\' font-size="10" fill="{t["text_muted"]}">{sub}</text>'
        )

    metrics_block = "\n".join(metric_lines)

    # Top-right domain pill inside x=589..845 (right edge at 830.5, width 146)
    pill_x, pill_w = 684.5, 146

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="846" height="294" viewBox="0 0 846 294" role="img" aria-label="Furina-he (NeverGiveUp) — Indie Developer | AI Agent Guardrails, Desktop Companions &amp; 3D Simulation">
  <title>Furina-he (NeverGiveUp) — Indie Developer</title>
  <style>
    @keyframes avatarBlinkOpen {{
      0%, 92%, 97%, 100% {{ opacity: 1; }}
      93%, 96% {{ opacity: 0; }}
    }}
    @keyframes avatarBlinkClosed {{
      0%, 92%, 97%, 100% {{ opacity: 0; }}
      93%, 96% {{ opacity: 1; }}
    }}
    @keyframes calmCursor {{
      0%, 49% {{ opacity: 1; }}
      50%, 100% {{ opacity: 0.15; }}
    }}
    .avatar-open {{ animation: avatarBlinkOpen 5.2s steps(1, end) infinite; }}
    .avatar-closed {{ opacity: 0; animation: avatarBlinkClosed 5.2s steps(1, end) infinite; }}
    .cursor {{ animation: calmCursor 1.4s steps(1, end) infinite; }}
    @media (prefers-reduced-motion: reduce) {{
      .avatar-open, .avatar-closed, .cursor {{ animation: none !important; }}
    }}
  </style>

  <!-- Base Poster Surface (0px crisp Swiss corners) -->
  <rect x="0.5" y="0.5" width="845" height="293" fill="{t["bg"]}"/>

  <!-- Right Bauhaus Pixel Weave Field -->
  {right_weave}

  <!-- Structural Grid Rules -->
  <rect x="0.5" y="0.5" width="845" height="293" fill="none" stroke="{t["border"]}" stroke-width="1"/>
  <line x1="0.5" y1="36.5" x2="845.5" y2="36.5" stroke="{t["border"]}" stroke-width="1"/>
  <line x1="588.5" y1="36.5" x2="588.5" y2="230.5" stroke="{t["border"]}" stroke-width="1"/>
  <line x1="0.5" y1="230.5" x2="845.5" y2="230.5" stroke="{t["border"]}" stroke-width="1"/>

  <!-- Top Masthead Bar -->
  <path fill="{t["text"]}" shape-rendering="crispEdges" d="{mini_mark}"/>
  <text x="158" y="22.5" font-family='{FONT_MONO}' font-size="11" fill="{t["text_muted"]}">(NeverGiveUp · indie developer)</text>
  <text x="572" y="22.5" text-anchor="end" font-family='{FONT_MONO}' font-size="10.5" font-weight="600" fill="{t["text_sub"]}">(local-first · AI tooling)</text>

  <rect x="{pill_x}" y="8.5" width="{pill_w}" height="20" fill="{t["bg"] if mode == "dark" else "#FFFFFF"}" stroke="{t["border"]}" stroke-width="1"/>
  <rect x="{int(pill_x + 8.5)}" y="15" width="7" height="7" fill="#00A3CC" shape-rendering="crispEdges"/>
  <text x="{int(pill_x + 21.5)}" y="22" font-family='{FONT_MONO}' font-size="10.5" font-weight="600" fill="{t["text"]}">cloudlink.blessc.com</text>

  <!-- Left Poster Lockup -->
  <text x="24" y="62" font-family='{FONT_SANS}' font-size="14" font-weight="600" fill="{t["text"]}">AI Agent Guardrails · Desktop Companions · Interactive Systems</text>
  <text x="24" y="82" font-family='{FONT_SANS}' font-size="13" fill="{t["text_sub"]}">Rust · TypeScript · Tauri · Electron · Java  —  Local-first tools &amp; virtual labs</text>

  <!-- Monumental 9-Row Pixel Display Wordmark -->
  <path fill="{t["text"]}" shape-rendering="crispEdges" d="{big_mark}"/>

  <!-- Crisp Terminal / Bio Box -->
  <rect x="24.5" y="186.5" width="538" height="28" fill="{t["surface"]}" stroke="{t["border"]}" stroke-width="1"/>
  <text x="36" y="204.5" font-family='{FONT_MONO}' font-size="11.5" fill="{t["text"]}"><tspan fill="#00A3CC" font-weight="700">$</tspan> building agent guardrails, AI pets, GitSkins &amp; 3D labs</text>
  <rect class="cursor" x="397" y="194" width="7" height="13" fill="{t["text"]}" shape-rendering="crispEdges"/>

  <!-- Framed Bauhaus Pixel Avatar Portrait on Right -->
  <rect x="650" y="62" width="142" height="142" fill="{t["portrait_shadow"]}" shape-rendering="crispEdges"/>
  <rect x="646.5" y="58.5" width="142" height="142" fill="{t["portrait_bg"]}" stroke="{t["border"]}" stroke-width="1"/>
  <g class="avatar-open">{portrait_open}</g>
  <g class="avatar-closed">{portrait_closed}</g>
  <text x="654" y="194" font-family='{FONT_MONO}' font-size="9.5" fill="{t["text_muted"]}">(Furina-he)</text>
  <rect x="775" y="187" width="6" height="6" fill="#00A3CC" shape-rendering="crispEdges"/>

  <!-- Bottom 4-Column Metric Bar -->
{metrics_block}
</svg>
"""


def build_button_primary(mode: str, label: str, width: int, aria: str) -> str:
    t = THEMES[mode]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="30" viewBox="0 0 {width} 30" role="img" aria-label="{aria}">
  <rect x="0.5" y="0.5" width="{width - 1}" height="29" fill="{t["btn_primary_bg"]}" stroke="{t["btn_primary_border"]}" stroke-width="1"/>
  <rect x="11" y="12" width="6" height="6" fill="{t["btn_primary_dot"]}" shape-rendering="crispEdges"/>
  <text x="24" y="19" font-family='{FONT_MONO}' font-size="11.5" font-weight="700" fill="{t["btn_primary_fg"]}">{label} &#8599;</text>
</svg>
"""


def build_button_secondary(
    mode: str, tag: str, label: str, width: int, aria: str
) -> str:
    t = THEMES[mode]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="30" viewBox="0 0 {width} 30" role="img" aria-label="{aria}">
  <rect x="0.5" y="0.5" width="{width - 1}" height="29" fill="{t["btn_bg"]}" stroke="{t["btn_border"]}" stroke-width="1"/>
  <text x="11" y="19" font-family='{FONT_MONO}' font-size="11" fill="{t["text_muted"]}">({tag}) <tspan font-family='{FONT_SANS}' font-size="12" font-weight="600" fill="{t["text"]}">{label}</tspan></text>
  <text x="{width - 10}" y="19" text-anchor="end" font-family='{FONT_MONO}' font-size="11" fill="{t["text_muted"]}">&#8599;</text>
</svg>
"""


def build_section_header(
    mode: str,
    tag: str,
    title: str,
    right_note: str,
    accent: str,
    title_x: int,
) -> str:
    t = THEMES[mode]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="846" height="34" viewBox="0 0 846 34" role="img" aria-label="{title}">
  <line x1="0" y1="6.5" x2="846" y2="6.5" stroke="{t["border"]}" stroke-width="1"/>
  <rect x="0" y="17" width="7" height="7" fill="{accent}" stroke="{t["border"]}" stroke-width="0.8" shape-rendering="crispEdges"/>
  <text x="15" y="25" font-family='{FONT_MONO}' font-size="11.5" font-weight="600" fill="{t["text_muted"]}">({tag})</text>
  <text x="{title_x}" y="25" font-family='{FONT_SANS}' font-size="14" font-weight="700" fill="{t["text"]}">{title}</text>
  <text x="846" y="25" text-anchor="end" font-family='{FONT_MONO}' font-size="11" fill="{t["text_muted"]}">({right_note})</text>
</svg>
"""


def build_card(
    mode: str,
    *,
    title: str,
    category: str,
    pill_w: int,
    link_label: str,
    line1: str,
    line2: str,
    spec: str,
    weave_kind: str,
    weave_light: tuple[str, str],
    weave_dark: tuple[str, str],
    dot_light: str,
    dot_dark: str,
    emblem_grid: list[str],
    emblem_pal: dict[str, str],
) -> str:
    t = THEMES[mode]
    wbg, wfg = weave_light if mode == "light" else weave_dark
    dot = dot_light if mode == "light" else dot_dark
    weave = weave_svg(weave_kind, 1, 1, 415, 54, wbg, wfg, cell=6)
    emblem = grid_to_paths(emblem_grid, emblem_pal, 363.0, 7.0, 2.5)
    aria = f"{title} — {category.split(') ', 1)[-1]}"
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="417" height="194" viewBox="0 0 417 194" role="img" aria-label="{aria}">
  <title>{aria}</title>
  <rect x="0.5" y="0.5" width="416" height="193" fill="{t["card_bg"]}"/>
  {weave}
  <line x1="0.5" y1="54.5" x2="416.5" y2="54.5" stroke="{t["border"]}" stroke-width="1"/>
  <line x1="18" y1="154.5" x2="399" y2="154.5" stroke="{t["rule_soft"]}" stroke-width="1"/>
  <rect x="0.5" y="0.5" width="416" height="193" fill="none" stroke="{t["border"]}" stroke-width="1"/>

  <!-- Top Left Index Pill on Weave Band -->
  <rect x="16" y="16" width="{pill_w}" height="22" fill="#0A0A0A"/>
  <text x="24" y="30.5" font-family='{FONT_MONO}' font-size="10.5" font-weight="600" fill="#FFFFFF">{category}</text>

  <!-- Top Right Framed 16x16 Bauhaus Pixel Emblem -->
  <rect x="361" y="5" width="44" height="44" fill="#0A0A0A"/>
  {emblem}

  <!-- Project Title & Crisp Two-Line Copy -->
  <text x="18" y="84" font-family='{FONT_SANS}' font-size="20" font-weight="800" letter-spacing="-0.4" fill="{t["text"]}">{title}</text>
  <text x="399" y="82" text-anchor="end" font-family='{FONT_MONO}' font-size="11" font-weight="600" fill="{t["text_sub"]}">{link_label} &#8599;</text>

  <text x="18" y="110" font-family='{FONT_SANS}' font-size="12.5" fill="{t["text_sub"]}">{line1}</text>
  <text x="18" y="129" font-family='{FONT_SANS}' font-size="12.5" fill="{t["text_sub"]}">{line2}</text>

  <!-- Bottom Spec Strip -->
  <rect x="18" y="169" width="6" height="6" fill="{dot}" stroke="#0A0A0A" stroke-width="0.6" shape-rendering="crispEdges"/>
  <text x="31" y="176" font-family='{FONT_MONO}' font-size="10.5" fill="{t["text_muted"]}">{spec}</text>
  <text x="399" y="176" text-anchor="end" font-family='{FONT_MONO}' font-size="12" font-weight="700" fill="{t["text"]}">&#8594;</text>
</svg>
"""


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    files: dict[str, str] = {}

    for mode in ("light", "dark"):
        files[f"hero-{mode}.svg"] = build_hero(mode)

        files[f"btn-cloudlink-{mode}.svg"] = build_button_primary(
            mode, "cloudlink.blessc.com", 180, "site cloudlink.blessc.com"
        )
        files[f"btn-openpet-{mode}.svg"] = build_button_secondary(
            mode, "pet", "openpet.myfurina.top", 198, "pet openpet.myfurina.top"
        )
        files[f"btn-release-{mode}.svg"] = build_button_secondary(
            mode, "release", "CloudLink v0.6.0", 190, "release CloudLink v0.6.0"
        )
        files[f"btn-github-{mode}.svg"] = build_button_secondary(
            mode, "github", "@Furina-he", 158, "github @Furina-he"
        )

        files[f"sec-work-{mode}.svg"] = build_section_header(
            mode,
            "projects",
            "Selected Systems &amp; Desktop Tools",
            "04 flagship repos",
            "#00A3CC",
            94,
        )
        files[f"sec-activity-{mode}.svg"] = build_section_header(
            mode,
            "activity",
            "Contribution Rhythm",
            "auto-updated daily",
            "#2BA676",
            94,
        )

        files[f"card-cloudlink-{mode}.svg"] = build_card(
            mode,
            title="CloudLink",
            category="(01) Agent Ops Guardrail",
            pill_w=156,
            link_label="cloudlink.blessc.com",
            line1="Local infrastructure switchboard &amp; command guardrail for",
            line2="AI agents — unified SSH/cloud Skill + desktop approvals.",
            spec="Rust · Tauri v2 · React 19 · v0.6.0 · 10 ★ · MIT",
            weave_kind="cross",
            weave_light=("#2370E8", "#5393F5"),
            weave_dark=("#1D4ED8", "#3B82F6"),
            dot_light="#2370E8",
            dot_dark="#1D4ED8",
            emblem_grid=EMBLEM_CLOUDLINK,
            emblem_pal=EMBLEM_CLOUDLINK_PAL,
        )
        files[f"card-openpet-{mode}.svg"] = build_card(
            mode,
            title="OpenPet",
            category="(02) Desktop AI Companion",
            pill_w=162,
            link_label="openpet.myfurina.top",
            line1="Resident desktop AI character partner with live emotions,",
            line2="Obsidian-ready memory wiki, MCP tools &amp; plugin packs.",
            spec="TypeScript · Electron · Vue 3 · MCP · 2 ★ · MIT",
            weave_kind="plus",
            weave_light=("#F3ACF0", "#D97AD5"),
            weave_dark=("#D88AD4", "#A855A3"),
            dot_light="#F3ACF0",
            dot_dark="#D88AD4",
            emblem_grid=EMBLEM_OPENPET,
            emblem_pal=EMBLEM_OPENPET_PAL,
        )
        files[f"card-gitskins-{mode}.svg"] = build_card(
            mode,
            title="GitSkins",
            category="(03) Profile Skin Studio",
            pill_w=156,
            link_label="gitskins.blessc.com",
            line1="Curated Light &amp; Dark GitHub profile SVG themes for AI",
            line2="coding agents — copy one zero-config prompt to re-skin.",
            spec="TypeScript · React · Python · 88 SVGs · MIT",
            weave_kind="tartan",
            weave_light=("#2BA676", "#2370E8"),
            weave_dark=("#1E825C", "#1D4ED8"),
            dot_light="#2BA676",
            dot_dark="#1E825C",
            emblem_grid=EMBLEM_GITSKINS,
            emblem_pal=EMBLEM_GITSKINS_PAL,
        )
        files[f"card-virtual-{mode}.svg"] = build_card(
            mode,
            title="Virtual",
            category="(04) 3D Circuit Lab",
            pill_w=128,
            link_label="Furina-he/virtual",
            line1="Offline 3D electrical &amp; electronics virtual lab built with",
            line2="Electron, Three.js and real ngspice circuit simulation.",
            spec="TypeScript · Electron · Three.js · ngspice",
            weave_kind="basket",
            weave_light=("#F5B700", "#DE7E12"),
            weave_dark=("#D99B00", "#B45309"),
            dot_light="#F5B700",
            dot_dark="#D99B00",
            emblem_grid=EMBLEM_VIRTUAL,
            emblem_pal=EMBLEM_VIRTUAL_PAL,
        )

    for fname, content in files.items():
        # Strict XML validation before writing
        ET.fromstring(content)
        (ASSETS / fname).write_text(content, encoding="utf-8", newline="\n")

    print(f"Generated and XML-validated {len(files)} SVGs in {ASSETS}")


if __name__ == "__main__":
    main()
