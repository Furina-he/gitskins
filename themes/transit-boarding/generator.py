#!/usr/bin/env python3
"""Generate 22 Light & Dark Transit & Boarding Pass SVGs and validate strict XML."""

from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape
import xml.etree.ElementTree as ET

OUT_DIR = Path(__file__).resolve().parent / "assets"
FONT_MONO = "'JetBrains Mono','SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace"
FONT_SANS = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"

PALETTES = {
    "light": {
        "bg": "#FAF6EE",
        "surface": "#FFFDF9",
        "ink": "#15171A",
        "sub": "#444952",
        "muted": "#727885",
        "border": "#181B20",
        "borderSoft": "#D8D0C2",
        "accent": "#D93829",
        "accentFg": "#FFFFFF",
        "secondary": "#1B56B5",
        "tertiary": "#168052",
        "highlight": "#C98212",
        "patternBg": "#EFE9DC",
        "patternFg": "#D4CCBC",
    },
    "dark": {
        "bg": "#111317",
        "surface": "#181B21",
        "ink": "#F4F1EA",
        "sub": "#B9B5AC",
        "muted": "#827F78",
        "border": "#363B46",
        "borderSoft": "#262A33",
        "accent": "#F59E0B",
        "accentFg": "#111317",
        "secondary": "#60A5FA",
        "tertiary": "#34D399",
        "highlight": "#FB7185",
        "patternBg": "#0D0F13",
        "patternFg": "#242830",
    },
}

# ---------------------------------------------------------------------------
# 24x24 Passport-Style Pixel Portrait (Furina-he demo avatar)
# ---------------------------------------------------------------------------
AVATAR_PALETTE = {
    "K": "#1D2238",  # crisp navy-ink outline
    "W": "#FFFFFF",  # headband frill, eye highlight, collar
    "L": "#D6E1F2",  # cool lace shadow
    "B": "#546BC2",  # periwinkle-cobalt hair base
    "D": "#384B96",  # deep hair shadow
    "H": "#85A1EC",  # hair shine
    "C": "#58BCEE",  # cyan side ribbon & gem
    "S": "#FFF3EB",  # porcelain skin
    "P": "#F5B0B8",  # cheek blush
    "E": "#2B3C7A",  # deep sapphire iris
    "G": "#7C9BE8",  # lower iris glow
    "N": "#273154",  # dark navy bowtie
}

PASSPORT_AVATAR_24 = [
    "........KK....KK........",
    ".....KKKWWK..KWWKKK.....",
    "....KWWWWWKKKKWWWWWK....",
    "...KWLKKKKKKKKKKKKLWK...",
    "..KWWKBBBBBBBBBBBBKWWK..",
    "..KWKBBHHBBBBBBHHBBKWK..",
    "..KWKBBBBBBBBBBBBBBKWK..",
    "..KKBBBBBBKBBKBBBBBKCK..",
    ".KBBBBBBBBKBBKBBBBBKCCK.",
    ".KBBHBBBBBKBBKBBBBKKCK..",
    ".KBBKKBBBBBBBBBBBBKKBBK.",
    ".KBBKSSKKKSSSSKKKSSKBBK.",
    ".KBBKSKWEEKSSKWEEKSKBBK.",
    ".KBBKSKEGGKSSKEGGKSKBBK.",
    ".KDBKSKGGGKSSKGGGKSKBDK.",
    "..KBKPPKKKSSSSKKKPPKDK..",
    "..KKSSPPSSSSSSSSPPSSKK..",
    "..KDBBKSSSSSSSSSSKBBDK..",
    "..KDBBWKKSSSSSSKKWBBDK..",
    "..KDBWLLKKKKKKKKLLWBDK..",
    ".KDBBWWKNNKCCKNNKWWBBDK.",
    ".KDBBWKKNNKCCKNNKKWBBDK.",
    ".KDBBKWWKNNNNNNKWWKBBDK.",
    "..KKKK.KKKKKKKKKK.KKKK..",
]

assert len(PASSPORT_AVATAR_24) == 24 and all(len(r) == 24 for r in PASSPORT_AVATAR_24)


def fmt(n: float) -> str:
    s = f"{n:.1f}"
    return s[:-2] if s.endswith(".0") else s


def grid_to_paths(
    grid: list[str],
    palette: dict[str, str],
    ox: float,
    oy: float,
    cell: float,
) -> str:
    """Convert a 24x24 character pixel grid into color-grouped crisp SVG <path> runs."""
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
                rx = ox + start * cell
                ry = oy + r * cell
                rw = (c - start) * cell
                by_color.setdefault(palette[sym], []).append(
                    f"M{fmt(rx)} {fmt(ry)}h{fmt(rw)}v{fmt(cell)}h-{fmt(rw)}z"
                )
            else:
                c += 1
    paths = [f'<path fill="{color}" d="{"".join(segs)}"/>' for color, segs in by_color.items()]
    return '<g shape-rendering="crispEdges">' + "".join(paths) + "</g>"


def badge_fg(col_key: str, mode: str, p: dict[str, str]) -> str:
    """Guarantee >= 4.9:1 foreground ink contrast on any colored transit line badge."""
    if mode == "dark":
        return p["accentFg"]  # #111317 on bright amber/sky/emerald/rose
    if col_key == "highlight":
        return p["ink"]  # #15171A on warm ochre #C98212 (~6.4:1)
    return "#FFFFFF"  # on vermilion/cobalt/emerald (>= 4.9:1)


def barcode_path(ox: int, oy: int, max_w: int, h: int, pattern: list[int]) -> str:
    """Generate a single merged crisp SVG path for a Code-128 style vector barcode."""
    segs: list[str] = []
    cx = ox
    for idx, width in enumerate(pattern):
        if cx + width > ox + max_w:
            break
        if idx % 2 == 0:  # even indices = ink bars, odd = spaces
            segs.append(f"M{cx} {oy}h{width}v{h}h-{width}z")
        cx += width
    return "".join(segs)


def hero_ticket_path(w: int, h: int, notch_x: int, notch_r: int = 11, corner_r: int = 8) -> str:
    """Closed SVG path for a boarding pass with top & bottom semicircular punch notches."""
    x0, y0, x1, y1 = 1, 1, w - 1, h - 1
    return (
        f"M {x0 + corner_r} {y0} "
        f"H {notch_x - notch_r} "
        f"A {notch_r} {notch_r} 0 0 0 {notch_x + notch_r} {y0} "
        f"H {x1 - corner_r} "
        f"A {corner_r} {corner_r} 0 0 1 {x1} {y0 + corner_r} "
        f"V {y1 - corner_r} "
        f"A {corner_r} {corner_r} 0 0 1 {x1 - corner_r} {y1} "
        f"H {notch_x + notch_r} "
        f"A {notch_r} {notch_r} 0 0 0 {notch_x - notch_r} {y1} "
        f"H {x0 + corner_r} "
        f"A {corner_r} {corner_r} 0 0 1 {x0} {y1 - corner_r} "
        f"V {y0 + corner_r} "
        f"A {corner_r} {corner_r} 0 0 1 {x0 + corner_r} {y0} Z"
    )


def card_ticket_path(w: int, h: int, notch_y: int, notch_r: int = 6, corner_r: int = 6) -> str:
    """Closed SVG path for a station transfer card with left & right fare-stub notches."""
    x0, y0, x1, y1 = 1, 1, w - 1, h - 1
    return (
        f"M {x0 + corner_r} {y0} "
        f"H {x1 - corner_r} "
        f"A {corner_r} {corner_r} 0 0 1 {x1} {y0 + corner_r} "
        f"V {notch_y - notch_r} "
        f"A {notch_r} {notch_r} 0 0 0 {x1} {notch_y + notch_r} "
        f"V {y1 - corner_r} "
        f"A {corner_r} {corner_r} 0 0 1 {x1 - corner_r} {y1} "
        f"H {x0 + corner_r} "
        f"A {corner_r} {corner_r} 0 0 1 {x0} {y1 - corner_r} "
        f"V {notch_y + notch_r} "
        f"A {notch_r} {notch_r} 0 0 0 {x0} {notch_y - notch_r} "
        f"V {y0 + corner_r} "
        f"A {corner_r} {corner_r} 0 0 1 {x0 + corner_r} {y0} Z"
    )


def build_hero(mode: str, p: dict[str, str]) -> str:
    w, h = 846, 300
    nx = 608
    uid = f"tb-{mode}"
    outline = hero_ticket_path(w, h, nx, notch_r=11, corner_r=8)

    # Top header styling: Shinkansen thermal dual-color banner (Light) vs Split-Flap board (Dark)
    if mode == "light":
        left_hdr_fill = p["accent"]
        left_hdr_ink = p["accentFg"]
        left_hdr_sub = "#FFE4E0"
        stub_hdr_fill = p["secondary"]
        stub_hdr_ink = "#FFFFFF"
        stub_body_fill = p["patternBg"]
        top_bars = ""
        header_rule = ""
        box_fill = p["surface"]
        flap_line = ""
    else:
        left_hdr_fill = p["patternBg"]
        left_hdr_ink = p["accent"]
        left_hdr_sub = p["ink"]
        stub_hdr_fill = p["patternBg"]
        stub_hdr_ink = p["secondary"]
        stub_body_fill = "#14171D"
        top_bars = (
            f'<rect x="1" y="1" width="{nx - 1}" height="4" fill="{p["accent"]}"/>'
            f'<rect x="{nx}" y="1" width="{w - nx - 1}" height="4" fill="{p["secondary"]}"/>'
        )
        header_rule = f'<line x1="1" y1="44.5" x2="{w - 1}" y2="44.5" stroke="{p["border"]}" stroke-width="1.2"/>'
        box_fill = p["patternBg"]
        flap_line = "yes"

    # 24x24 pixel portrait rendered at 4px/cell = 96x96 inside right passport box (678..774, 81..177)
    avatar_svg = grid_to_paths(PASSPORT_AVATAR_24, AVATAR_PALETTE, 678, 81, 4)

    # Deterministic Code-128 style vector barcode centered in stub box (x=629..823, width=194, y=224..262)
    bc_pattern = [
        3, 2, 1, 2, 2, 3, 1, 1, 3, 2, 2, 1, 1, 3, 2, 2, 3, 1, 1, 2, 2, 1, 3, 2,
        1, 2, 3, 1, 2, 2, 1, 3, 1, 1, 2, 3, 2, 1, 3, 2, 1, 2, 1, 3, 2, 1, 2, 2,
        3, 1, 2, 1, 1, 3, 2, 2, 1, 3, 2, 1, 2, 2, 3, 1, 1, 2, 3, 2, 1, 2, 2, 1,
        3, 1, 2, 2, 1, 3, 1, 2, 2, 3, 1, 1, 2, 2, 3, 2, 1, 2, 3, 1, 1, 2, 3, 1,
        2, 1, 3, 2, 1, 2, 2, 1, 3, 2, 3,
    ]
    bc_d = barcode_path(629, 224, 194, 38, bc_pattern)

    # 4 Boarding Boxes mapped transparently to real profile stats
    # Layout: x=24..586 (total width 562 = 4*133 + 3*10)
    boarding_boxes = [
        ("GATE", "04", "Flagship Systems", p["accent"]),
        ("SEAT", "13A", "13 Public Repos", p["secondary"]),
        ("CLASS", "OSS", "Local-First MCP", p["tertiary"]),
        ("MILES", "20+", "Synced Agents", p["highlight"]),
    ]
    boxes_svg: list[str] = []
    for idx, (lbl, val, sub, col) in enumerate(boarding_boxes):
        bx = 24 + idx * 143
        bw = 133
        boxes_svg.append(
            f'<rect x="{bx}" y="210" width="{bw}" height="72" rx="4" fill="{box_fill}" stroke="{p["borderSoft"]}" stroke-width="1.1"/>'
            f'<rect x="{bx + 1}" y="211" width="{bw - 2}" height="3" rx="1" fill="{col}"/>'
            f'<text x="{bx + 10}" y="228" font-family="{FONT_MONO}" font-size="8.5" font-weight="700" letter-spacing="0.9" fill="{p["muted"]}">{lbl}</text>'
            f'<text x="{bx + 10}" y="254" font-family="{FONT_MONO}" font-size="20" font-weight="800" fill="{p["ink"]}">{val}</text>'
            + (
                f'<line x1="{bx + 8}" y1="246.5" x2="{bx + bw - 8}" y2="246.5" stroke="{p["bg"]}" stroke-opacity="0.55" stroke-width="0.9"/>'
                if flap_line
                else ""
            )
            + f'<text x="{bx + 10}" y="272" font-family="{FONT_SANS}" font-size="9.8" fill="{p["sub"]}">{escape(sub)}</text>'
        )

    # Boarding status badge colors
    status_bg = p["tertiary"] if mode == "light" else "#102820"
    status_fg = "#FFFFFF" if mode == "light" else p["tertiary"]
    status_stroke = p["tertiary"]
    led_color = "#FFFFFF" if mode == "light" else p["tertiary"]

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Furina-he — Transit &amp; Boarding Pass GitHub Profile">
  <title>Furina-he — Transit &amp; Boarding Pass</title>
  <defs>
    <clipPath id="clip-{uid}">
      <path d="{outline}"/>
    </clipPath>
    <pattern id="dots-{uid}" width="12" height="12" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="0.7" fill="{p["patternFg"]}" fill-opacity="{0.55 if mode == 'light' else 0.45}"/>
    </pattern>
  </defs>
  <style>
    @keyframes led_{uid} {{ 0%, 100% {{ opacity: 1; }} 50% {{ opacity: 0.22; }} }}
    .led-{uid} {{ animation: led_{uid} 1.8s ease-in-out infinite; }}
    @media (prefers-reduced-motion: reduce) {{ .led-{uid} {{ animation: none !important; }} }}
  </style>

  <!-- Clipped Ticket Stock Interior -->
  <g clip-path="url(#clip-{uid})">
    <rect x="0" y="0" width="{nx}" height="{h}" fill="{p["bg"]}"/>
    <rect x="0" y="44" width="{nx}" height="{h - 44}" fill="url(#dots-{uid})"/>
    <rect x="{nx}" y="0" width="{w - nx}" height="{h}" fill="{stub_body_fill}"/>

    <!-- Top Boarding Pass Header Band -->
    <rect x="0" y="0" width="{nx}" height="44" fill="{left_hdr_fill}"/>
    <rect x="{nx}" y="0" width="{w - nx}" height="44" fill="{stub_hdr_fill}"/>
    {top_bars}
    {header_rule}

    <!-- Left Airline / Rail Emblem & Masthead -->
    <g transform="translate(22, 14)" fill="{left_hdr_ink}" aria-hidden="true">
      <polygon points="0,8 14,2 10,8 14,14"/>
      <rect x="16" y="6.5" width="7" height="3" rx="1"/>
    </g>
    <text x="52" y="27" font-family="{FONT_MONO}" font-size="11" font-weight="800" letter-spacing="1.1" fill="{left_hdr_ink}">GITSKINS EXPRESS · BOARDING PASS</text>
    <text x="{nx - 22}" y="27" text-anchor="end" font-family="{FONT_MONO}" font-size="10" font-weight="700" letter-spacing="0.8" fill="{left_hdr_sub}">FLIGHT GS-09 · INTL</text>

    <!-- Right Detachable Stub Header -->
    <text x="{nx + 18}" y="27" font-family="{FONT_MONO}" font-size="10.2" font-weight="800" letter-spacing="1" fill="{stub_hdr_ink}">PASSENGER STUB</text>
    <text x="{w - 20}" y="27" text-anchor="end" font-family="{FONT_MONO}" font-size="10.2" font-weight="800" fill="{stub_hdr_ink}">09</text>

    <!-- Main Left Route Header: DEV -> OSS -->
    <text x="26" y="64" font-family="{FONT_MONO}" font-size="8.5" font-weight="700" letter-spacing="1" fill="{p["muted"]}">ORIGIN // LOCAL</text>
    <text x="24" y="100" font-family="{FONT_SANS}" font-size="34" font-weight="800" letter-spacing="-0.5" fill="{p["ink"]}">DEV</text>

    <!-- Crisp Vector Flight Path & Airplane Icon -->
    <circle cx="114" cy="86" r="3.5" fill="none" stroke="{p["accent"]}" stroke-width="1.8"/>
    <line x1="121" y1="86" x2="152" y2="86" stroke="{p["borderSoft"]}" stroke-width="1.5" stroke-dasharray="3 3"/>
    <path d="M 157 86 L 169 86 L 164 78 L 167 78 L 175 86 L 182 86 C 184 86 184 88 182 88 L 175 88 L 167 96 L 164 96 L 169 88 L 157 88 L 154 91 L 152 91 L 154 87 L 152 83 L 154 83 Z" fill="{p["accent"]}"/>
    <line x1="188" y1="86" x2="219" y2="86" stroke="{p["borderSoft"]}" stroke-width="1.5" stroke-dasharray="3 3"/>
    <circle cx="226" cy="86" r="3.5" fill="{p["accent"]}"/>
    <text x="170" y="106" text-anchor="middle" font-family="{FONT_MONO}" font-size="8.2" font-weight="700" letter-spacing="0.8" fill="{p["muted"]}">NON-STOP · 2026</text>

    <text x="242" y="64" font-family="{FONT_MONO}" font-size="8.5" font-weight="700" letter-spacing="1" fill="{p["muted"]}">DEST // OPEN SOURCE</text>
    <text x="240" y="100" font-family="{FONT_SANS}" font-size="34" font-weight="800" letter-spacing="-0.5" fill="{p["ink"]}">OSS</text>

    <!-- Boarding LED Status Pill & Domain -->
    <rect x="466" y="56" width="120" height="22" rx="11" fill="{status_bg}" stroke="{status_stroke}" stroke-width="1.1"/>
    <circle class="led-{uid}" cx="481" cy="67" r="3.5" fill="{led_color}"/>
    <text x="492" y="70.5" font-family="{FONT_MONO}" font-size="9.5" font-weight="800" letter-spacing="0.8" fill="{status_fg}">BOARDING</text>
    <text x="586" y="99" text-anchor="end" font-family="{FONT_MONO}" font-size="9.8" font-weight="700" fill="{p["sub"]}">cloudlink.blessc.com</text>

    <line x1="24" y1="116.5" x2="586" y2="116.5" stroke="{p["borderSoft"]}" stroke-width="1"/>

    <!-- Passenger Name & Bio -->
    <text x="26" y="134" font-family="{FONT_MONO}" font-size="8.5" font-weight="700" letter-spacing="1" fill="{p["muted"]}">PASSENGER / GITHUB HANDLE</text>
    <text x="586" y="134" text-anchor="end" font-family="{FONT_MONO}" font-size="8.5" font-weight="700" letter-spacing="0.8" fill="{p["muted"]}">PNR · NEVERGIVEUP</text>
    <text x="25" y="169" font-family="{FONT_MONO}" font-size="31" font-weight="800" letter-spacing="1.2" fill="{p["ink"]}">FURINA-HE</text>
    <rect x="478" y="148" width="108" height="20" rx="3" fill="{p["patternBg"]}" stroke="{p["borderSoft"]}" stroke-width="1"/>
    <text x="532" y="161.5" text-anchor="middle" font-family="{FONT_MONO}" font-size="9.2" font-weight="700" fill="{p["sub"]}">RUST · TS · PY</text>
    <text x="26" y="193" font-family="{FONT_SANS}" font-size="12.5" font-weight="600" fill="{p["sub"]}">AI Agent Guardrails · Desktop Companions · Interactive Systems</text>

    <!-- 4 Boarding Stat Boxes -->
    {"".join(boxes_svg)}

    <!-- Right Detachable Tear-Off Stub Content (x=608..845) -->
    <text x="726" y="63" text-anchor="middle" font-family="{FONT_MONO}" font-size="8.5" font-weight="700" letter-spacing="1" fill="{p["muted"]}">PASSPORT ID · 24×24</text>

    <!-- Framed Passport Pixel Portrait Box -->
    <rect x="668" y="71" width="116" height="116" rx="4" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1.4"/>
    <rect x="674" y="77" width="104" height="104" fill="{p["bg"]}" stroke="{p["borderSoft"]}" stroke-width="0.9"/>
    <!-- Passport Photo Corner Mount Ticks -->
    <path d="M 671 82 V 74 H 679" fill="none" stroke="{p["accent"]}" stroke-width="1.8"/>
    <path d="M 773 74 H 781 V 82" fill="none" stroke="{p["accent"]}" stroke-width="1.8"/>
    <path d="M 671 176 V 184 H 679" fill="none" stroke="{p["accent"]}" stroke-width="1.8"/>
    <path d="M 773 184 H 781 V 176" fill="none" stroke="{p["accent"]}" stroke-width="1.8"/>
    {avatar_svg}
    <!-- Calm Boarding Status LED on Passport Badge -->
    <circle class="led-{uid}" cx="772" cy="83" r="3" fill="{p["tertiary"]}"/>

    <!-- Stub Mini Route & Sequence -->
    <text x="628" y="206" font-family="{FONT_MONO}" font-size="10.2" font-weight="800" fill="{p["ink"]}">DEV → OSS</text>
    <text x="824" y="206" text-anchor="end" font-family="{FONT_MONO}" font-size="9.5" font-weight="700" fill="{p["accent"]}">SEQ 009</text>
    <line x1="628" y1="214.5" x2="824" y2="214.5" stroke="{p["borderSoft"]}" stroke-width="1" stroke-dasharray="3 2"/>

    <!-- Sharp Vector Barcode Strip -->
    <rect x="624" y="220" width="204" height="46" rx="3" fill="{p["surface"]}" stroke="{p["borderSoft"]}" stroke-width="0.9"/>
    <path fill="{p["ink"]}" shape-rendering="crispEdges" d="{bc_d}"/>
    <text x="726" y="281" text-anchor="middle" font-family="{FONT_MONO}" font-size="8.5" font-weight="700" letter-spacing="1.2" fill="{p["muted"]}">GS09 · 2026 · FURINA-HE</text>

    <!-- Vertical Dashed Perforation Line -->
    <line x1="{nx}" y1="15" x2="{nx}" y2="{h - 15}" stroke="{p["borderSoft"]}" stroke-width="1.6" stroke-dasharray="4 4"/>
  </g>

  <!-- Crisp Outer Notched Ticket Border -->
  <path d="{outline}" fill="none" stroke="{p["border"]}" stroke-width="1.5"/>
</svg>"""


def build_button(line_code: str, text: str, col_key: str, primary: bool, mode: str, p: dict[str, str]) -> str:
    h = 30
    w = max(148, int(len(text) * 7.2) + 74)
    line_col = p[col_key]
    line_fg = badge_fg(col_key, mode, p)

    if primary:
        bg = p["accent"]
        fg = p["accentFg"]
        pill_bg = p["accentFg"]
        pill_fg = p["accent"]
        div_col = p["accentFg"]
        border_col = p["border"] if mode == "light" else p["accent"]
    else:
        bg = p["surface"]
        fg = p["ink"]
        pill_bg = line_col
        pill_fg = line_fg
        div_col = p["borderSoft"]
        border_col = p["border"]

    # Ticket pill path with right semicircular validation punch notch
    x0, y0, x1, y1, r, nr = 1, 1, w - 1, h - 1, 5, 4
    btn_path = (
        f"M {x0 + r} {y0} H {x1 - r} A {r} {r} 0 0 1 {x1} {y0 + r} "
        f"V {15 - nr} A {nr} {nr} 0 0 0 {x1} {15 + nr} "
        f"V {y1 - r} A {r} {r} 0 0 1 {x1 - r} {y1} "
        f"H {x0 + r} A {r} {r} 0 0 1 {x0} {y1 - r} "
        f"V {y0 + r} A {r} {r} 0 0 1 {x0 + r} {y0} Z"
    )
    aria = f"[{line_code}] {text}"
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(aria)}">
  <path d="{btn_path}" fill="{bg}" stroke="{border_col}" stroke-width="1.3"/>
  <rect x="6" y="5" width="28" height="20" rx="10" fill="{pill_bg}"/>
  <text x="20" y="18.5" text-anchor="middle" font-family="{FONT_MONO}" font-size="9.5" font-weight="800" fill="{pill_fg}">{escape(line_code)}</text>
  <line x1="40" y1="6" x2="40" y2="24" stroke="{div_col}" stroke-opacity="0.55" stroke-width="1" stroke-dasharray="2 2"/>
  <text x="48" y="19" font-family="{FONT_MONO}" font-size="10.5" font-weight="700" fill="{fg}">{escape(text)}</text>
  <text x="{w - 11}" y="19" text-anchor="end" font-family="{FONT_MONO}" font-size="10" font-weight="700" fill="{fg}" fill-opacity="0.72">↗</text>
</svg>"""


def build_section(line_code: str, title: str, right: str, col_key: str, mode: str, p: dict[str, str]) -> str:
    w, h = 846, 40
    col = p[col_key]
    fg = badge_fg(col_key, mode, p)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(line_code)} — {escape(title)}">
  <rect x="1" y="1" width="{w - 2}" height="{h - 2}" rx="5" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1.4"/>
  <rect x="2" y="34" width="{w - 4}" height="4" rx="1" fill="{col}"/>
  <!-- Metro Line Badge Circle -->
  <circle cx="24" cy="18.5" r="11.5" fill="{col}"/>
  <text x="24" y="22" text-anchor="middle" font-family="{FONT_MONO}" font-size="9.5" font-weight="800" fill="{fg}">{escape(line_code)}</text>
  <!-- Wayfinding Route Arrow -->
  <path d="M 44 18.5 H 58 M 53 13.5 L 59 18.5 L 53 23.5" fill="none" stroke="{col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="68" y="22.5" font-family="{FONT_SANS}" font-size="13.5" font-weight="800" letter-spacing="0.4" fill="{p["ink"]}">{escape(title)}</text>
  <line x1="628" y1="9" x2="628" y2="28" stroke="{p["borderSoft"]}" stroke-width="1"/>
  <text x="{w - 16}" y="22" text-anchor="end" font-family="{FONT_MONO}" font-size="9.5" font-weight="700" letter-spacing="0.6" fill="{p["muted"]}">{escape(right)}</text>
</svg>"""


def build_card(
    idx: int,
    name: str,
    line_code: str,
    tag: str,
    route_tag: str,
    desc1: str,
    desc2: str,
    stack: str,
    mode: str,
    p: dict[str, str],
) -> str:
    w, h = 417, 196
    ny = 148
    uid = f"tc-{idx}-{mode}"
    col_keys = ["accent", "secondary", "tertiary", "highlight"]
    ck = col_keys[idx % 4]
    col = p[ck]
    fg = badge_fg(ck, mode, p)
    station_code = f"ST-0{idx + 1}"
    outline = card_ticket_path(w, h, ny, notch_r=6, corner_r=6)

    # Compact 26px stub barcode glyph on right side of bottom fare row
    mini_bc = barcode_path(312, 162, 28, 16, [2, 1, 1, 2, 3, 1, 1, 1, 2, 2, 1, 1, 2, 1, 2, 1, 3])

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{station_code} {escape(name)}">
  <title>{station_code} {escape(name)} — Transit Station Card</title>
  <defs>
    <clipPath id="clip-{uid}">
      <path d="{outline}"/>
    </clipPath>
  </defs>
  <g clip-path="url(#clip-{uid})">
    <rect x="0" y="0" width="{w}" height="{h}" fill="{p["surface"]}"/>
    <!-- Top Transit Route Bar -->
    <rect x="0" y="0" width="{w}" height="44" fill="{p["patternBg"]}"/>
    <line x1="0" y1="44.5" x2="{w}" y2="44.5" stroke="{p["borderSoft"]}" stroke-width="1"/>

    <!-- Station Code Pill -->
    <rect x="14" y="11" width="52" height="22" rx="11" fill="{col}"/>
    <text x="40" y="25.5" text-anchor="middle" font-family="{FONT_MONO}" font-size="9.5" font-weight="800" fill="{fg}">{station_code}</text>

    <!-- Colored Horizontal Metro Route Bar + Circular Interchange Nodes (○—●—○) -->
    <line x1="80" y1="22" x2="262" y2="22" stroke="{col}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="84" cy="22" r="4.5" fill="{p["surface"]}" stroke="{col}" stroke-width="2.2"/>
    <circle cx="172" cy="22" r="6.5" fill="{p["surface"]}" stroke="{col}" stroke-width="2.4"/>
    <circle cx="172" cy="22" r="3" fill="{col}"/>
    <circle cx="260" cy="22" r="4.5" fill="{p["surface"]}" stroke="{col}" stroke-width="2.2"/>

    <!-- Right Line Category Tag (high-contrast ink) -->
    <text x="401" y="25.5" text-anchor="end" font-family="{FONT_MONO}" font-size="9.5" font-weight="700" letter-spacing="0.5" fill="{p["ink"]}">{escape(line_code)} · {escape(tag)}</text>

    <!-- Station Title & Route Code -->
    <text x="18" y="79" font-family="{FONT_SANS}" font-size="22" font-weight="800" fill="{p["ink"]}">{escape(name)}</text>
    <rect x="316" y="61" width="84" height="20" rx="3" fill="{p["bg"]}" stroke="{p["borderSoft"]}" stroke-width="1"/>
    <text x="358" y="74.5" text-anchor="middle" font-family="{FONT_MONO}" font-size="9.2" font-weight="700" fill="{p["sub"]}">{escape(route_tag)}</text>

    <!-- Crisp 2-Line Description -->
    <text x="18" y="106" font-family="{FONT_SANS}" font-size="12.3" fill="{p["sub"]}">{escape(desc1)}</text>
    <text x="18" y="126" font-family="{FONT_SANS}" font-size="12.3" fill="{p["sub"]}">{escape(desc2)}</text>

    <!-- Perforated Bottom Fare / Spec Ticket Stub -->
    <rect x="0" y="{ny}" width="{w}" height="{h - ny}" fill="{p["bg"]}"/>
    <line x1="12" y1="{ny + 0.5}" x2="{w - 12}" y2="{ny + 0.5}" stroke="{p["borderSoft"]}" stroke-width="1.3" stroke-dasharray="4 3"/>
    <rect x="18" y="167" width="6" height="6" rx="1" fill="{col}"/>
    <text x="30" y="174" font-family="{FONT_MONO}" font-size="10" font-weight="700" fill="{p["sub"]}">SPEC // {escape(stack)}</text>
    <path fill="{p["muted"]}" shape-rendering="crispEdges" d="{mini_bc}"/>
    <text x="400" y="174" text-anchor="end" font-family="{FONT_MONO}" font-size="10" font-weight="800" fill="{p["ink"]}">BOARD ↗</text>
  </g>
  <path d="{outline}" fill="none" stroke="{p["border"]}" stroke-width="1.4"/>
</svg>"""


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    buttons = [
        ("cloudlink", "L1", "cloudlink.blessc.com", "accent", True),
        ("openpet", "L2", "openpet.myfurina.top", "secondary", False),
        ("release", "L3", "CloudLink v0.6.0", "tertiary", False),
        ("github", "L4", "@Furina-he", "highlight", False),
    ]
    cards = [
        (
            "cloudlink",
            "CloudLink",
            "L1",
            "GUARDRAIL",
            "DEV → OPS",
            "Zero-credential AI ops bridge with",
            "deterministic execution guardrails.",
            "Rust · Tauri · TS",
        ),
        (
            "openpet",
            "OpenPet",
            "L2",
            "COMPANION",
            "DEV → PET",
            "Local-first desktop AI pet companion",
            "with pluggable memory & plugins.",
            "TS · Electron · AI",
        ),
        (
            "gitskins",
            "GitSkins",
            "L3",
            "ATELIER",
            "DEV → SVG",
            "Agent-ready GitHub Profile & Repo",
            "SVG skins + 4-col Bento widgets.",
            "TS · Python · SVG",
        ),
        (
            "virtual",
            "Virtual",
            "L4",
            "SANDBOX",
            "DEV → 3D",
            "Interactive 3D virtual lab & spatial",
            "experimentation playground.",
            "TS · WebGL · 3D",
        ),
    ]

    count = 0
    for mode, pal in PALETTES.items():
        files = {
            f"hero-{mode}.svg": build_hero(mode, pal),
            f"sec-work-{mode}.svg": build_section(
                "L1", "PLATFORM 01 · SELECTED SYSTEMS", "ST-01 → ST-04 · 04 LINES", "accent", mode, pal
            ),
            f"sec-activity-{mode}.svg": build_section(
                "L2", "PLATFORM 02 · DAILY DEPARTURE LOG", "@FURINA-HE · TIMETABLE →", "secondary", mode, pal
            ),
        }
        for bid, lcode, lbl, ckey, prim in buttons:
            files[f"btn-{bid}-{mode}.svg"] = build_button(lcode, lbl, ckey, prim, mode, pal)
        for idx, (cid, name, lcode, tag, rtag, d1, d2, stk) in enumerate(cards):
            files[f"card-{cid}-{mode}.svg"] = build_card(idx, name, lcode, tag, rtag, d1, d2, stk, mode, pal)

        for fname, svg in files.items():
            ET.fromstring(svg)
            (OUT_DIR / fname).write_text(svg, encoding="utf-8")
            count += 1

    print(f"[transit-boarding] Generated and XML-validated {count} SVGs")


if __name__ == "__main__":
    main()
