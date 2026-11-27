#!/usr/bin/env python3
"""Generate 22 Light & Dark Classic Desktop OS SVGs and validate strict XML.

Light mode evokes Classic Macintosh System 7 / Platinum OS.
Dark mode evokes NeXTSTEP / Midnight Workstation chrome.
"""

from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape
import xml.etree.ElementTree as ET

OUT_DIR = Path(__file__).resolve().parent / "assets"
FONT_MONO = "'JetBrains Mono','SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace"
FONT_SANS = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"

PALETTES = {
    "light": {
        "bg": "#E6E5DF",
        "surface": "#FFFFFF",
        "ink": "#111111",
        "sub": "#3B3B3F",
        "muted": "#6B6B72",
        "border": "#111111",
        "borderSoft": "#B8B7B0",
        "accent": "#2455C8",
        "accentFg": "#FFFFFF",
        "secondary": "#C93B2B",
        "tertiary": "#1E824C",
        "highlight": "#C98A00",
        "patternBg": "#DCDAD2",
        "patternFg": "#9C9A92",
    },
    "dark": {
        "bg": "#17181D",
        "surface": "#202229",
        "ink": "#F1F1EE",
        "sub": "#BCBCC4",
        "muted": "#868792",
        "border": "#D8D8D2",
        "borderSoft": "#383B46",
        "accent": "#60A5FA",
        "accentFg": "#111318",
        "secondary": "#F87171",
        "tertiary": "#4ADE80",
        "highlight": "#FACC15",
        "patternBg": "#121318",
        "patternFg": "#2D303A",
    },
}

# ---------------------------------------------------------------------------
# 24x24 Crisp Vector Pixel Portrait (for About This Developer portrait slot)
# ---------------------------------------------------------------------------
PORTRAIT_PAL = {
    "K": "#181C2E",  # crisp dark navy outline
    "W": "#FFFFFF",  # headband lace & eye sparkle
    "L": "#D6E0F0",  # soft lace shade
    "B": "#4A66C4",  # cobalt-periwinkle hair base
    "D": "#2F4492",  # deep hair shadow
    "H": "#89A6F2",  # hair highlight
    "C": "#4AB9EE",  # sky-cyan side ribbon & gem
    "S": "#FFF2EA",  # warm porcelain skin
    "P": "#F4AAB4",  # subtle blush
    "E": "#243574",  # sapphire upper iris
    "G": "#7092E6",  # sapphire lower iris
    "N": "#242D52",  # dark navy bowtie
}

PORTRAIT_OPEN = [
    ".......KKK....KKK.......",
    ".....KKWWWK..KWWWKK.....",
    "....KWWWWWKKKKWWWWWK....",
    "...KWLKKKKKKKKKKKKLWK...",
    "..KWWKBBBBBBBBBBBBKWWK..",
    "..KWKBBHHBBBBBBHHBBKWK..",
    "..KWKBBBBBBBBBBBBBBKWK..",
    ".KKKBBBBBBKBBKBBBBBWKCK.",
    ".KBBBBBBBBKBBKBBBBWKCCK.",
    ".KBBHBBKKBBBBBBKKBBKCK..",
    ".KBBBKSKBBKBBKBBKSKBBBK.",
    ".KBBKSKKKKSSSSKKKKSKBBK.",
    ".KBBKSKWEEKSSKWEEKSKBBK.",
    ".KBBKSKWEGKSSKWEGKSKBBK.",
    ".KDBKSKGGGKSSKGGGKSKBDK.",
    "..KBKPPKKKSSSSKKKPPKBK..",
    "..KKSSPPSSSSSSSSPPSSKK..",
    "...KBBKKSSSSSSSSKKBBK...",
    "..KDBBWKKSSSSSSKKWBBDK..",
    "..KDBWLLKKKKKKKKLLWBDK..",
    ".KDBBWWKNNKCCKNNKWWBBDK.",
    ".KDBBWKKNNKCCKNNKKWBBDK.",
    ".KDBBKWWKNNNNNNKWWKBBDK.",
    "..KKKK.KKKKKKKKKK.KKKK..",
]

PORTRAIT_CLOSED = [
    ".......KKK....KKK.......",
    ".....KKWWWK..KWWWKK.....",
    "....KWWWWWKKKKWWWWWK....",
    "...KWLKKKKKKKKKKKKLWK...",
    "..KWWKBBBBBBBBBBBBKWWK..",
    "..KWKBBHHBBBBBBHHBBKWK..",
    "..KWKBBBBBBBBBBBBBBKWK..",
    ".KKKBBBBBBKBBKBBBBBWKCK.",
    ".KBBBBBBBBKBBKBBBBWKCCK.",
    ".KBBHBBKKBBBBBBKKBBKCK..",
    ".KBBBKSKBBKBBKBBKSKBBBK.",
    ".KBBKSSSSSSSSSSSSSSKBBK.",
    ".KBBKSSSSSSSSSSSSSSKBBK.",
    ".KBBKSKKKKSSSSKKKKSKBBK.",
    ".KDBKSSSSSSSSSSSSSSKBDK.",
    "..KBKPPSSSSSSSSSSPPKBK..",
    "..KKSSPPSSSSSSSSPPSSKK..",
    "...KBBKKSSSSSSSSKKBBK...",
    "..KDBBWKKSSSSSSKKWBBDK..",
    "..KDBWLLKKKKKKKKLLWBDK..",
    ".KDBBWWKNNKCCKNNKWWBBDK.",
    ".KDBBWKKNNKCCKNNKKWBBDK.",
    ".KDBBKWWKNNNNNNKWWKBBDK.",
    "..KKKK.KKKKKKKKKK.KKKK..",
]

assert len(PORTRAIT_OPEN) == 24 and all(len(r) == 24 for r in PORTRAIT_OPEN)
assert len(PORTRAIT_CLOSED) == 24 and all(len(r) == 24 for r in PORTRAIT_CLOSED)

# ---------------------------------------------------------------------------
# 12x12 Bespoke Classic Desktop App Icons (for 2x2 Project Cards)
# ---------------------------------------------------------------------------
APP_ICONS: dict[str, list[str]] = {
    # 01: CloudLink — classic 3.5" floppy disk with security slide shutter
    "floppy": [
        "AAAAAAAAAA..",
        "ABCCBBBCCAA.",
        "ABCCBBBCCBAA",
        "ABCCCCCCCBBA",
        "ABBBBBBBBBBA",
        "ABBBBBBBBBBA",
        "ABCCCCCCCCBA",
        "ABCBBBBBCCBA",
        "ABCCCCCCCCBA",
        "ABCBBBBBBCBA",
        "ABCCCCCCCCBA",
        "AAAAAAAAAAAA",
    ],
    # 02: OpenPet — classic Happy Mac / smiling desktop companion monitor
    "pet": [
        ".AAAAAAAAAA.",
        "ABBBBBBBBBBA",
        "ABCCCCCCCCBA",
        "ABCCACCACCBA",
        "ABCCACCACCBA",
        "ABCCCCACCCBA",
        "ABCCCCCCCCBA",
        "ABCACCCCACBA",
        "ABCCAAAACCBA",
        "ABBBBBBBBBBA",
        "..ABBBBBBA..",
        ".AAAAAAAAAA.",
    ],
    # 03: GitSkins — cascading classic OS windows & skin palette
    "windows": [
        "AAAAAAAA....",
        "ABBBBBBA....",
        "AAAAAAAA....",
        "ACCCCCCA....",
        "ACCBAAAAAAAA",
        "ACCABBBBBBBA",
        "ACCAAAAAAAAA",
        "AAAACCCCCCCA",
        "...ACBBBBBCA",
        "...ACBBBBBCA",
        "...ACCCCCCCA",
        "...AAAAAAAAA",
    ],
    # 04: Virtual — classic isometric 3D workstation cube
    "cube": [
        "....AAAA....",
        "..AACCCCAA..",
        ".ACCCCCCCCA.",
        "ACCCCCCCCCCA",
        "AABBBAAACCAA",
        "ABBBBBABCCCA",
        "ABBBBBABCCCA",
        "ABBBBBABCCCA",
        "ABBBBBABCCCA",
        ".AABBBACCAA.",
        "...AABBAA...",
        "....AAAA....",
    ],
}

for _k, _g in APP_ICONS.items():
    assert len(_g) == 12 and all(len(r) == 12 for r in _g), f"Bad 12x12 icon: {_k}"

# ---------------------------------------------------------------------------
# Compact Pixel Glyphs for Menu Bar, Push Buttons & Finder Section Strips
# ---------------------------------------------------------------------------
MINI_ICONS: dict[str, list[str]] = {
    # 7x7 classic OS menu bar emblem (happy mini workstation)
    "os_mark": [
        ".AAAAA.",
        "ABBBBBA",
        "ABABABA",
        "ABBBBBA",
        "ABAAABA",
        "AAAAAAA",
        "..AAA..",
    ],
    # 7x7 default action launch arrow
    "arrow": [
        "..AAAAA",
        "....AAA",
        "...AAAA",
        "..AA.AA",
        ".AA...A",
        "AA.....",
        ".......",
    ],
    # 7x7 mini classic app window
    "window": [
        "AAAAAAA",
        "ABBBBBA",
        "AAAAAAA",
        "A.....A",
        "A.BBB.A",
        "A.....A",
        "AAAAAAA",
    ],
    # 7x7 mini 3.5" floppy disk
    "disk": [
        "AAAAAA.",
        "ABBBAAA",
        "ABBBBBA",
        "AAAAAAA",
        "A.BBB.A",
        "A.BBB.A",
        "AAAAAAA",
    ],
    # 7x7 mini Finder folder
    "folder": [
        "AAA....",
        "AAAAAAA",
        "ABBBBBA",
        "ABBBBBA",
        "ABBBBBA",
        "ABBBBBA",
        "AAAAAAA",
    ],
    # 9x7 Finder folder for 846x40 section strips
    "finder_folder": [
        "AAAA.....",
        "AAAAAAAAA",
        "ABBBBBBBA",
        "ABBBBBBBA",
        "ABBBBBBBA",
        "ABBBBBBBA",
        "AAAAAAAAA",
    ],
}


def grid_to_paths(
    grid: list[str],
    cmap: dict[str, str],
    ox: int,
    oy: int,
    cell: int,
) -> str:
    """Merge horizontal pixel runs by color into compact crisp SVG <path> elements."""
    by_color: dict[str, list[str]] = {}
    for r, row in enumerate(grid):
        c = 0
        n = len(row)
        while c < n:
            sym = row[c]
            if sym in cmap:
                start = c
                while c < n and row[c] == sym:
                    c += 1
                rx = ox + start * cell
                ry = oy + r * cell
                rw = (c - start) * cell
                by_color.setdefault(cmap[sym], []).append(
                    f"M{rx} {ry}h{rw}v{cell}h-{rw}z"
                )
            else:
                c += 1
    paths = [
        f'<path fill="{color}" d="{"".join(segs)}"/>'
        for color, segs in by_color.items()
    ]
    return '<g shape-rendering="crispEdges">' + "".join(paths) + "</g>"


def shadow_color(mode: str, p: dict[str, str]) -> str:
    return p["border"] if mode == "light" else "#07080B"


def pinstripe_lines(
    x1: int,
    x2: int,
    y_start: int,
    count: int,
    step: int,
    color: str,
    opacity: float = 1.0,
) -> str:
    op = f' opacity="{opacity}"' if opacity < 1.0 else ""
    segs = [f"M{x1} {y_start + i * step}h{x2 - x1}v1h-{x2 - x1}z" for i in range(count)]
    return f'<path fill="{color}"{op} shape-rendering="crispEdges" d="{"".join(segs)}"/>'


def build_hero(mode: str, p: dict[str, str]) -> str:
    w, h = 846, 300
    uid = f"cos-{mode}"
    shd = shadow_color(mode, p)
    stripe_col = p["border"] if mode == "light" else p["muted"]
    stripe_op = 0.65 if mode == "light" else 0.72

    os_logo = grid_to_paths(
        MINI_ICONS["os_mark"],
        {"A": p["ink"], "B": p["accent"]},
        14,
        6,
        2,
    )

    # 24x24 pixel portrait rendered at 4px/cell = 96x96 inside right-hand framed slot
    portrait_open = grid_to_paths(PORTRAIT_OPEN, PORTRAIT_PAL, 672, 82, 4)
    portrait_closed = grid_to_paths(PORTRAIT_CLOSED, PORTRAIT_PAL, 672, 82, 4)

    # Bottom 4 classic memory/disk stat bars inside window footer (x=19..824, y=217..283)
    metrics = [
        ("FLAGSHIP APPS", "04", 0.88, p["accent"], "Ops · Pet · Skins · 3D"),
        ("PUBLIC REPOS", "13", 0.74, p["tertiary"], "Rust · TS · Python"),
        ("SYNCED AGENTS", "20+", 0.92, p["secondary"], "CloudLink Guard"),
        ("LOCAL MEMORY", "100%", 0.96, p["highlight"], "Tauri · Electron · OSS"),
    ]
    col_starts = [19, 220, 421, 622]
    col_widths = [201, 201, 201, 202]
    stats_svg: list[str] = []
    for idx, (lbl, val, ratio, bar_col, sub) in enumerate(metrics):
        cx = col_starts[idx]
        cw = col_widths[idx]
        if idx > 0:
            stats_svg.append(
                f'  <line x1="{cx}.5" y1="217" x2="{cx}.5" y2="283" stroke="{p["borderSoft"]}" stroke-width="1"/>'
            )
        bar_x = cx + 14
        bar_w = cw - 28
        fill_w = max(8, int(round((bar_w - 4) * ratio)))
        # Subtle pixel tick marks inside memory bar track
        ticks = "".join(
            f'<line x1="{bar_x + int(bar_w * f)}.5" y1="245" x2="{bar_x + int(bar_w * f)}.5" y2="255" '
            f'stroke="{p["borderSoft"]}" stroke-width="1" opacity="0.65"/>'
            for f in (0.25, 0.5, 0.75)
        )
        stats_svg.append(
            f'  <text x="{bar_x}" y="234" font-family="{FONT_MONO}" font-size="9.2" font-weight="700" fill="{p["sub"]}">{lbl}</text>\n'
            f'  <text x="{cx + cw - 14}" y="234" text-anchor="end" font-family="{FONT_MONO}" font-size="11.5" font-weight="800" fill="{p["ink"]}">{val}</text>\n'
            f'  <rect x="{bar_x}" y="244" width="{bar_w}" height="12" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1" shape-rendering="crispEdges"/>\n'
            f'  {ticks}\n'
            f'  <rect x="{bar_x + 2}" y="246" width="{fill_w}" height="8" fill="{bar_col}" shape-rendering="crispEdges"/>\n'
            f'  <text x="{bar_x}" y="272" font-family="{FONT_SANS}" font-size="10" fill="{p["sub"]}">{escape(sub)}</text>'
        )

    os_label = "System 7.5" if mode == "light" else "NeXTSTEP 3.3"

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Furina-he — Classic Desktop OS Profile">
  <title>Furina-he — Classic Desktop OS</title>
  <defs>
    <pattern id="bayer-{uid}" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="4" fill="{p["patternBg"]}"/>
      <rect x="0" y="0" width="1" height="1" fill="{p["patternFg"]}"/>
      <rect x="2" y="2" width="1" height="1" fill="{p["patternFg"]}"/>
      <rect x="2" y="0" width="1" height="1" fill="{p["patternFg"]}" opacity="0.45"/>
      <rect x="0" y="2" width="1" height="1" fill="{p["patternFg"]}" opacity="0.45"/>
    </pattern>
  </defs>
  <style>
    @keyframes blinkOpen_{uid} {{
      0%, 91%, 96%, 100% {{ opacity: 1; }}
      92%, 95% {{ opacity: 0; }}
    }}
    @keyframes blinkClosed_{uid} {{
      0%, 91%, 96%, 100% {{ opacity: 0; }}
      92%, 95% {{ opacity: 1; }}
    }}
    @keyframes cursorTick_{uid} {{
      0%, 49% {{ opacity: 1; }}
      50%, 100% {{ opacity: 0.15; }}
    }}
    .ava-open-{uid} {{ animation: blinkOpen_{uid} 5.4s steps(1, end) infinite; }}
    .ava-shut-{uid} {{ opacity: 0; animation: blinkClosed_{uid} 5.4s steps(1, end) infinite; }}
    .cur-{uid} {{ animation: cursorTick_{uid} 1.3s steps(1, end) infinite; }}
    @media (prefers-reduced-motion: reduce) {{
      .ava-open-{uid}, .ava-shut-{uid}, .cur-{uid} {{ animation: none !important; }}
    }}
  </style>

  <!-- 1-bit Bayer Dot-Dither Desktop Backdrop -->
  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" fill="url(#bayer-{uid})" stroke="{p["border"]}" stroke-width="1.2" shape-rendering="crispEdges"/>

  <!-- Top OS Menu Bar -->
  <rect x="1" y="1" width="{w - 2}" height="24" fill="{p["surface"]}" shape-rendering="crispEdges"/>
  <line x1="1" y1="25.5" x2="{w - 1}" y2="25.5" stroke="{p["border"]}" stroke-width="1.2"/>
  {os_logo}
  <text x="38" y="17" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="{p["ink"]}">File</text>
  <text x="76" y="17" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="{p["ink"]}">Edit</text>
  <text x="115" y="17" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="{p["ink"]}">View</text>
  <text x="158" y="17" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="{p["ink"]}">Special</text>

  <text x="818" y="17" text-anchor="end" font-family="{FONT_MONO}" font-size="10" font-weight="700" fill="{p["sub"]}">{os_label} · cloudlink.blessc.com</text>
  <rect x="826" y="9" width="7" height="7" fill="{p["tertiary"]}" shape-rendering="crispEdges"/>

  <!-- Elevated "About This Developer" Window + Crisp 3px Hard Shadow -->
  <rect x="21" y="39" width="807" height="248" fill="{shd}" shape-rendering="crispEdges"/>
  <rect x="18" y="36" width="807" height="248" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1.5" shape-rendering="crispEdges"/>

  <!-- 6-Line Pin-Stripe Window Titlebar -->
  <rect x="19" y="37" width="805" height="23" fill="{p["bg"]}" shape-rendering="crispEdges"/>
  {pinstripe_lines(24, 819, 43, 6, 2, stripe_col, stripe_op)}
  <line x1="18" y1="60.5" x2="825" y2="60.5" stroke="{p["border"]}" stroke-width="1.2"/>

  <!-- Top-Left Classic Square Close Box -->
  <rect x="25" y="40" width="18" height="17" fill="{p["bg"]}" shape-rendering="crispEdges"/>
  <rect x="28" y="42" width="12" height="12" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1.2" shape-rendering="crispEdges"/>

  <!-- Top-Right Classic Zoom Box -->
  <rect x="799" y="40" width="18" height="17" fill="{p["bg"]}" shape-rendering="crispEdges"/>
  <rect x="802" y="42" width="12" height="12" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1.2" shape-rendering="crispEdges"/>
  <rect x="802" y="42" width="7" height="7" fill="none" stroke="{p["border"]}" stroke-width="1" shape-rendering="crispEdges"/>

  <!-- Centered Masked Title Plaque -->
  <rect x="311" y="39" width="220" height="19" fill="{p["bg"]}" shape-rendering="crispEdges"/>
  <text x="421" y="52.5" text-anchor="middle" font-family="{FONT_MONO}" font-size="11" font-weight="700" fill="{p["ink"]}">About This Developer</text>

  <!-- Left Developer Identity Panel -->
  <rect x="36" y="71" width="90" height="18" fill="{p["accent"]}" shape-rendering="crispEdges"/>
  <text x="81" y="83.5" text-anchor="middle" font-family="{FONT_MONO}" font-size="9.5" font-weight="700" fill="{p["accentFg"]}">PROFILE OS</text>
  <text x="136" y="83.5" font-family="{FONT_MONO}" font-size="10.5" font-weight="700" fill="{p["sub"]}">@Furina-he  ·  NeverGiveUp  ·  Local-First AI</text>

  <text x="38" y="129" font-family="{FONT_MONO}" font-size="38" font-weight="800" fill="{p["borderSoft"]}">FURINA-HE</text>
  <text x="36" y="127" font-family="{FONT_MONO}" font-size="38" font-weight="800" fill="{p["ink"]}">FURINA-HE</text>
  <text x="36" y="152" font-family="{FONT_SANS}" font-size="13" font-weight="600" fill="{p["sub"]}">AI Agent Guardrails · Desktop Companions · Interactive Systems</text>

  <!-- Classic Recessed System Info Well -->
  <rect x="36" y="166" width="568" height="34" fill="{p["bg"]}" stroke="{p["border"]}" stroke-width="1.1" shape-rendering="crispEdges"/>
  <line x1="37" y1="167.5" x2="603" y2="167.5" stroke="{p["borderSoft"]}" stroke-width="1"/>
  <text x="48" y="187" font-family="{FONT_MONO}" font-size="10.8" font-weight="700" fill="{p["ink"]}"><tspan fill="{p["accent"]}">ROM:</tspan> Rust · TypeScript · Tauri · Electron · Python</text>
  <rect class="cur-{uid}" x="586" y="176" width="7" height="14" fill="{p["accent"]}" shape-rendering="crispEdges"/>

  <!-- Right Framed 24x24 Pixel Portrait Slot -->
  <rect x="634" y="71" width="172" height="133" fill="{p["bg"]}" stroke="{p["border"]}" stroke-width="1.2" shape-rendering="crispEdges"/>
  <rect x="668" y="78" width="104" height="104" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1" shape-rendering="crispEdges"/>
  <g class="ava-open-{uid}">{portrait_open}</g>
  <g class="ava-shut-{uid}">{portrait_closed}</g>
  <text x="714" y="197" text-anchor="middle" font-family="{FONT_MONO}" font-size="9.2" font-weight="700" fill="{p["sub"]}">USER_ICON.PICT</text>
  <rect class="cur-{uid}" x="767" y="189" width="5" height="9" fill="{p["accent"]}" shape-rendering="crispEdges"/>

  <!-- Bottom 4 Classic Memory / Disk Stat Bars -->
  <line x1="18" y1="216.5" x2="825" y2="216.5" stroke="{p["border"]}" stroke-width="1.2"/>
  <rect x="19" y="217" width="805" height="66" fill="{p["bg"]}" shape-rendering="crispEdges"/>
{chr(10).join(stats_svg)}
</svg>"""


def build_button(label: str, icon_key: str, primary: bool, mode: str, p: dict[str, str]) -> str:
    w = max(154, int(len(label) * 7.3) + 56)
    h = 30
    shd = shadow_color(mode, p)
    if primary:
        glyph = grid_to_paths(
            MINI_ICONS[icon_key],
            {"A": p["accentFg"], "B": p["accentFg"]},
            12,
            8,
            2,
        )
        return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(label)}">
  <title>{escape(label)}</title>
  <!-- Classic Double-Border Default-Action Button Ring -->
  <rect x="1" y="1" width="{w - 2}" height="{h - 2}" rx="5" ry="5" fill="{p["bg"]}" stroke="{p["border"]}" stroke-width="2"/>
  <rect x="4.5" y="4.5" width="{w - 9}" height="{h - 9}" rx="3" ry="3" fill="{p["accent"]}" stroke="{p["border"]}" stroke-width="1"/>
  {glyph}
  <text x="30" y="19" font-family="{FONT_MONO}" font-size="10.5" font-weight="700" fill="{p["accentFg"]}">{escape(label)}</text>
</svg>"""

    glyph = grid_to_paths(
        MINI_ICONS[icon_key],
        {"A": p["border"], "B": p["accent"]},
        10,
        8,
        2,
    )
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(label)}">
  <title>{escape(label)}</title>
  <!-- Hard Stepped Bevel Classic Push Button -->
  <rect x="3" y="3" width="{w - 4}" height="{h - 4}" rx="3" ry="3" fill="{shd}"/>
  <rect x="1" y="1" width="{w - 4}" height="{h - 4}" rx="3" ry="3" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1.2"/>
  <line x1="4" y1="3.5" x2="{w - 7}" y2="3.5" stroke="{p["borderSoft"]}" stroke-width="1"/>
  {glyph}
  <text x="29" y="18.5" font-family="{FONT_MONO}" font-size="10.5" font-weight="700" fill="{p["ink"]}">{escape(label)}</text>
  <text x="{w - 11}" y="18.5" text-anchor="end" font-family="{FONT_MONO}" font-size="10.5" font-weight="700" fill="{p["accent"]}">&#8599;</text>
</svg>"""


def build_section(
    badge: str,
    title: str,
    right: str,
    badge_color: str,
    mode: str,
    p: dict[str, str],
) -> str:
    w, h = 846, 40
    shd = shadow_color(mode, p)
    stripe_col = p["border"] if mode == "light" else p["muted"]
    stripe_op = 0.55 if mode == "light" else 0.65

    folder = grid_to_paths(
        MINI_ICONS["finder_folder"],
        {"A": p["border"], "B": badge_color},
        18,
        12,
        2,
    )
    badge_w = max(84, len(badge) * 7 + 16)
    title_x = 46 + badge_w + 12
    left_plaque_w = min(560, title_x + int(len(title) * 7.8) + 18)
    right_plaque_w = max(148, int(len(right) * 7.2) + 28)
    right_plaque_x = w - 12 - right_plaque_w

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(title)}">
  <title>{escape(title)}</title>
  <!-- Hard Shadow + Classic Finder Folder Header Strip -->
  <rect x="2" y="2" width="{w - 3}" height="{h - 3}" fill="{shd}" shape-rendering="crispEdges"/>
  <rect x="0.5" y="0.5" width="{w - 3}" height="{h - 3}" fill="{p["bg"]}" stroke="{p["border"]}" stroke-width="1.3" shape-rendering="crispEdges"/>
  {pinstripe_lines(6, w - 8, 9, 6, 4, stripe_col, stripe_op)}

  <!-- Left Masked Folder + Title Plaque -->
  <rect x="10" y="5" width="{left_plaque_w}" height="28" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1" shape-rendering="crispEdges"/>
  {folder}
  <rect x="44" y="10" width="{badge_w}" height="18" fill="{badge_color}" shape-rendering="crispEdges"/>
  <text x="{44 + badge_w // 2}" y="22.5" text-anchor="middle" font-family="{FONT_MONO}" font-size="9.5" font-weight="700" fill="{p["accentFg"]}">{escape(badge)}</text>
  <text x="{title_x}" y="23" font-family="{FONT_MONO}" font-size="12" font-weight="800" fill="{p["ink"]}">{escape(title)}</text>

  <!-- Right Masked Item Count Plaque -->
  <rect x="{right_plaque_x}" y="5" width="{right_plaque_w}" height="28" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1" shape-rendering="crispEdges"/>
  <text x="{right_plaque_x + right_plaque_w // 2}" y="22.5" text-anchor="middle" font-family="{FONT_MONO}" font-size="10" font-weight="700" fill="{p["sub"]}">{escape(right)}</text>
</svg>"""


def build_card(
    idx: int,
    name: str,
    tag: str,
    desc1: str,
    desc2: str,
    stack: str,
    app_kind: str,
    icon_key: str,
    mode: str,
    p: dict[str, str],
) -> str:
    w, h = 417, 196
    shd = shadow_color(mode, p)
    stripe_col = p["border"] if mode == "light" else p["muted"]
    stripe_op = 0.65 if mode == "light" else 0.72
    colors = [p["accent"], p["secondary"], p["tertiary"], p["highlight"]]
    col = colors[idx % 4]
    win_title = f"0{idx + 1} · {name}.app"
    title_mask_w = max(144, int(len(win_title) * 7.2) + 26)
    title_mask_x = (w - 3 - title_mask_w) // 2

    # 12x12 pixel app icon at 5px/cell = 60x60 centered inside 82x82 icon well (x=316, y=44)
    icon_svg = grid_to_paths(
        APP_ICONS[icon_key],
        {"A": p["border"], "B": col, "C": p["surface"]},
        327,
        55,
        5,
    )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(name)}">
  <title>{escape(name)} — Classic Desktop App Window</title>
  <!-- Hard 3px Window Shadow + Mini Application Window -->
  <rect x="3" y="3" width="{w - 4}" height="{h - 4}" fill="{shd}" shape-rendering="crispEdges"/>
  <rect x="0.5" y="0.5" width="{w - 4}" height="{h - 4}" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1.4" shape-rendering="crispEdges"/>

  <!-- 6-Line Pin-Stripe Titlebar -->
  <rect x="1" y="1" width="{w - 5}" height="25" fill="{p["bg"]}" shape-rendering="crispEdges"/>
  {pinstripe_lines(6, w - 9, 8, 6, 2, stripe_col, stripe_op)}
  <line x1="1" y1="26.5" x2="{w - 4}" y2="26.5" stroke="{p["border"]}" stroke-width="1.2"/>

  <!-- Top-Left Square Close Box -->
  <rect x="8" y="5" width="17" height="17" fill="{p["bg"]}" shape-rendering="crispEdges"/>
  <rect x="11" y="8" width="11" height="11" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1.1" shape-rendering="crispEdges"/>

  <!-- Top-Right App Accent Chip -->
  <rect x="{w - 29}" y="5" width="17" height="17" fill="{p["bg"]}" shape-rendering="crispEdges"/>
  <rect x="{w - 26}" y="8" width="11" height="11" fill="{col}" stroke="{p["border"]}" stroke-width="1.1" shape-rendering="crispEdges"/>

  <!-- Centered Masked Title -->
  <rect x="{title_mask_x}" y="4" width="{title_mask_w}" height="19" fill="{p["bg"]}" shape-rendering="crispEdges"/>
  <text x="{(w - 3) // 2}" y="17.5" text-anchor="middle" font-family="{FONT_MONO}" font-size="10" font-weight="700" fill="{p["ink"]}">{escape(win_title)}</text>

  <!-- Left Content Area -->
  <rect x="18" y="42" width="7" height="7" fill="{col}" shape-rendering="crispEdges"/>
  <text x="31" y="49" font-family="{FONT_MONO}" font-size="9.5" font-weight="700" fill="{p["sub"]}">{escape(tag)}</text>
  <text x="18" y="78" font-family="{FONT_MONO}" font-size="20" font-weight="800" fill="{p["ink"]}">{escape(name)}</text>
  <text x="18" y="104" font-family="{FONT_SANS}" font-size="12.2" fill="{p["sub"]}">{escape(desc1)}</text>
  <text x="18" y="123" font-family="{FONT_SANS}" font-size="12.2" fill="{p["sub"]}">{escape(desc2)}</text>
  <text x="18" y="149" font-family="{FONT_MONO}" font-size="9.5" font-weight="700" fill="{p["sub"]}">/Applications/{escape(name)}.app</text>

  <!-- Right 12x12 Pixel App Icon Well -->
  <rect x="316" y="44" width="82" height="82" fill="{p["bg"]}" stroke="{p["border"]}" stroke-width="1.1" shape-rendering="crispEdges"/>
  {icon_svg}
  <text x="357" y="144" text-anchor="middle" font-family="{FONT_MONO}" font-size="8.8" font-weight="700" fill="{p["sub"]}">{escape(app_kind)}</text>

  <!-- Status Footer Bar + Bottom-Right Diagonal Resize Grip Lines -->
  <line x1="1" y1="164.5" x2="{w - 4}" y2="164.5" stroke="{p["border"]}" stroke-width="1.1"/>
  <rect x="1" y="165" width="{w - 5}" height="27" fill="{p["bg"]}" shape-rendering="crispEdges"/>
  <text x="16" y="182" font-family="{FONT_MONO}" font-size="9.8" font-weight="700" fill="{p["sub"]}">STACK: {escape(stack)}</text>

  <line x1="{w - 28}.5" y1="165" x2="{w - 28}.5" y2="192" stroke="{p["border"]}" stroke-width="1"/>
  <line x1="{w - 22}" y1="189" x2="{w - 8}" y2="175" stroke="{p["border"]}" stroke-width="1.2"/>
  <line x1="{w - 17}" y1="189" x2="{w - 8}" y2="180" stroke="{p["border"]}" stroke-width="1.2"/>
  <line x1="{w - 12}" y1="189" x2="{w - 8}" y2="185" stroke="{p["border"]}" stroke-width="1.2"/>
</svg>"""


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    buttons = [
        ("cloudlink", "Open cloudlink.blessc.com", "arrow", True),
        ("openpet", "Open openpet.myfurina.top", "window", False),
        ("release", "Disk: CloudLink v0.6.0", "disk", False),
        ("github", "Finder: @Furina-he", "folder", False),
    ]
    cards = [
        (
            "cloudlink",
            "CloudLink",
            "GUARDRAIL · DAEMON",
            "Zero-credential AI ops bridge with",
            "deterministic execution guardrails.",
            "Rust · Tauri · TypeScript",
            "SYSTEM DISK",
            "floppy",
        ),
        (
            "openpet",
            "OpenPet",
            "COMPANION · DESKTOP",
            "Local-first desktop AI pet companion",
            "with pluggable memory & plugins.",
            "TypeScript · Electron · AI",
            "HAPPY PET",
            "pet",
        ),
        (
            "gitskins",
            "GitSkins",
            "ATELIER · SVG SUITE",
            "Agent-ready GitHub Profile & Repo",
            "SVG skins + 4-col Bento widgets.",
            "TypeScript · Python · SVG",
            "SKIN STUDIO",
            "windows",
        ),
        (
            "virtual",
            "Virtual",
            "SANDBOX · 3D LAB",
            "Interactive 3D virtual lab & spatial",
            "experimentation playground.",
            "TypeScript · WebGL · 3D",
            "3D MONITOR",
            "cube",
        ),
    ]

    count = 0
    for mode, pal in PALETTES.items():
        files = {
            f"hero-{mode}.svg": build_hero(mode, pal),
            f"sec-work-{mode}.svg": build_section(
                "APPLICATIONS",
                "Selected Systems & Active Builds",
                "4 items · 846px",
                pal["accent"],
                mode,
                pal,
            ),
            f"sec-activity-{mode}.svg": build_section(
                "SYSTEM LOG",
                "Daily Contribution Activity",
                "@Furina-he · 846px",
                pal["tertiary"],
                mode,
                pal,
            ),
        }
        for bid, lbl, ico, prim in buttons:
            files[f"btn-{bid}-{mode}.svg"] = build_button(lbl, ico, prim, mode, pal)
        for idx, (cid, name, tag, d1, d2, stk, kind, ico) in enumerate(cards):
            files[f"card-{cid}-{mode}.svg"] = build_card(
                idx, name, tag, d1, d2, stk, kind, ico, mode, pal
            )

        for fname, svg in files.items():
            ET.fromstring(svg)
            (OUT_DIR / fname).write_text(svg, encoding="utf-8")
            count += 1

    print(f"[classic-desktop-os] Generated and XML-validated {count} SVGs")


if __name__ == "__main__":
    main()
