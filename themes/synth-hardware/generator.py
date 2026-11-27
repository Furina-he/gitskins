#!/usr/bin/env python3
"""Generate 22 Light & Dark Tactile Industrial Synth SVGs and validate strict XML."""

from __future__ import annotations

import math
from pathlib import Path
from xml.sax.saxutils import escape
import xml.etree.ElementTree as ET

OUT_DIR = Path(__file__).resolve().parent / "assets"
FONT_MONO = "'JetBrains Mono','SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace"
FONT_SANS = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"

PALETTES = {
    "light": {
        "bg": "#EFECE6",
        "surface": "#FAF8F4",
        "ink": "#141517",
        "sub": "#44474D",
        "muted": "#6E727A",
        "border": "#1C1E22",
        "borderSoft": "#CFCBC2",
        "accent": "#FF5200",
        "accentFg": "#FFFFFF",
        "secondary": "#0088CC",
        "tertiary": "#1E9E63",
        "highlight": "#D49B00",
        "patternBg": "#E3DFD6",
        "patternFg": "#B8B3A8",
    },
    "dark": {
        "bg": "#121316",
        "surface": "#1A1C21",
        "ink": "#F3F2EE",
        "sub": "#B5B8C0",
        "muted": "#7D818C",
        "border": "#363A44",
        "borderSoft": "#252830",
        "accent": "#FF6B2B",
        "accentFg": "#121316",
        "secondary": "#38BDF8",
        "tertiary": "#34D399",
        "highlight": "#FACC15",
        "patternBg": "#0D0E11",
        "patternFg": "#2A2E38",
    },
}


def hex_polygon(cx: float, cy: float, r: float, rotate_deg: float = 30.0) -> str:
    pts = []
    for i in range(6):
        ang = math.radians(rotate_deg + i * 60.0)
        pts.append(f"{cx + r * math.cos(ang):.2f},{cy + r * math.sin(ang):.2f}")
    return " ".join(pts)


def hex_screw(cx: float, cy: float, p: dict[str, str], mode: str, r: float = 5.2) -> str:
    """Machined countersunk M2 hex-socket chassis screw."""
    socket_fill = p["border"] if mode == "light" else "#090A0D"
    washer_fill = p["surface"] if mode == "light" else "#23262E"
    return (
        f'<g aria-hidden="true">'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{p["patternBg"]}" stroke="{p["border"]}" stroke-width="0.9"/>'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r * 0.73:.1f}" fill="{washer_fill}" stroke="{p["borderSoft"]}" stroke-width="0.6"/>'
        f'<polygon points="{hex_polygon(cx, cy, r * 0.42)}" fill="{socket_fill}" fill-opacity="0.82"/>'
        f"</g>"
    )


def chassis_frame(w: int, h: int, p: dict[str, str], mode: str, fill_key: str = "bg", rx: int = 10, screw_pad: float = 17.0, screw_r: float = 5.2) -> str:
    """Anodized aluminum chassis plate with machined inner bezel and 4 corner hex screws."""
    sheen_op = "0.75" if mode == "light" else "0.10"
    screws = "".join(
        hex_screw(sx, sy, p, mode, screw_r)
        for sx, sy in (
            (screw_pad, screw_pad),
            (w - screw_pad, screw_pad),
            (screw_pad, h - screw_pad),
            (w - screw_pad, h - screw_pad),
        )
    )
    return (
        f'<rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" rx="{rx}" fill="{p[fill_key]}" stroke="{p["border"]}" stroke-width="1.2"/>'
        f'<rect x="4.5" y="4.5" width="{w - 9}" height="{h - 9}" rx="{max(4, rx - 3)}" fill="none" stroke="{p["borderSoft"]}" stroke-width="0.9"/>'
        f'<line x1="{rx + 4}" y1="2.1" x2="{w - rx - 4}" y2="2.1" stroke="{p["surface"]}" stroke-opacity="{sheen_op}" stroke-width="1"/>'
        f"{screws}"
    )


def speaker_grill(cx: float, cy: float, radius: float, p: dict[str, str], mode: str) -> str:
    """Precision-drilled circular Braun / OP-1 perforated speaker dot-grid grill."""
    hole_fill = "#1C1E22" if mode == "light" else "#07080A"
    hole_op = "0.82" if mode == "light" else "0.95"
    step = 7.4
    max_r = radius - 3.2
    dots = []
    span = int(radius // step) + 1
    for gy in range(-span, span + 1):
        for gx in range(-span, span + 1):
            dx = gx * step
            dy = gy * step
            if dx * dx + dy * dy <= max_r * max_r:
                dots.append(
                    f'<circle cx="{cx + dx:.1f}" cy="{cy + dy:.1f}" r="2.0" fill="{hole_fill}" fill-opacity="{hole_op}"/>'
                )
    return (
        f'<g aria-hidden="true">'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{radius + 5:.1f}" fill="{p["patternBg"]}" fill-opacity="0.7" stroke="{p["borderSoft"]}" stroke-width="1"/>'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{radius + 1:.1f}" fill="none" stroke="{p["border"]}" stroke-opacity="0.32" stroke-width="0.7"/>'
        f'{"".join(dots)}'
        f"</g>"
    )


def rotary_knob(
    cx: float,
    cy: float,
    r: float,
    color: str,
    angle_deg: float,
    label: str,
    p: dict[str, str],
    mode: str,
    pointer_dark: bool = False,
    sub_label: str = "",
) -> str:
    """Color-coded tactile rotary encoder knob with 270-deg scale ticks and pointer indicator."""
    ticks = []
    for i in range(9):
        deg = -135.0 + i * (270.0 / 8.0)
        rad = math.radians(deg - 90.0)
        x1 = cx + (r + 3.4) * math.cos(rad)
        y1 = cy + (r + 3.4) * math.sin(rad)
        x2 = cx + (r + 6.4) * math.cos(rad)
        y2 = cy + (r + 6.4) * math.sin(rad)
        active = deg <= angle_deg + 2.0
        t_col = color if active else p["patternFg"]
        t_w = "1.4" if active else "1.0"
        ticks.append(
            f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{t_col}" stroke-width="{t_w}" stroke-linecap="round"/>'
        )

    p_rad = math.radians(angle_deg - 90.0)
    px1 = cx + (r * 0.24) * math.cos(p_rad)
    py1 = cy + (r * 0.24) * math.sin(p_rad)
    px2 = cx + (r * 0.80) * math.cos(p_rad)
    py2 = cy + (r * 0.80) * math.sin(p_rad)
    ptr_col = "#121316" if pointer_dark else "#FFFFFF"
    ring_col = "#121316" if pointer_dark else "#FFFFFF"
    shadow_op = "0.26" if mode == "light" else "0.65"

    label_svg = ""
    if label:
        label_svg += (
            f'<text x="{cx:.1f}" y="{cy + r + 16.5:.1f}" text-anchor="middle" '
            f'font-family="{FONT_MONO}" font-size="8" font-weight="700" letter-spacing="0.7" fill="{p["ink"]}">{escape(label)}</text>'
        )
    if sub_label:
        label_svg += (
            f'<text x="{cx:.1f}" y="{cy + r + 26.5:.1f}" text-anchor="middle" '
            f'font-family="{FONT_MONO}" font-size="7.2" fill="{p["sub"]}">{escape(sub_label)}</text>'
        )

    return (
        f"<g>"
        f'{"".join(ticks)}'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r + 1.8:.1f}" fill="{p["patternBg"]}" stroke="{p["borderSoft"]}" stroke-width="0.8"/>'
        f'<circle cx="{cx:.1f}" cy="{cy + 1.6:.1f}" r="{r:.1f}" fill="{p["border"]}" fill-opacity="{shadow_op}"/>'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{color}" stroke="{p["border"]}" stroke-width="1.1"/>'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r * 0.74:.1f}" fill="none" stroke="{ring_col}" stroke-opacity="0.28" stroke-width="0.9"/>'
        f'<line x1="{px1:.1f}" y1="{py1:.1f}" x2="{px2:.1f}" y2="{py2:.1f}" stroke="{ptr_col}" stroke-width="2.4" stroke-linecap="round"/>'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{max(2.0, r * 0.14):.1f}" fill="{ptr_col}" fill-opacity="0.88"/>'
        f"{label_svg}"
        f"</g>"
    )


def mini_dial(cx: float, cy: float, r: float, color: str, angle_deg: float, p: dict[str, str]) -> str:
    """Compact rotary dial gauge for KPI patchbay cells."""
    rad = math.radians(angle_deg - 90.0)
    nx = cx + (r * 0.76) * math.cos(rad)
    ny = cy + (r * 0.76) * math.sin(rad)
    return (
        f'<g aria-hidden="true">'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{p["patternBg"]}" stroke="{p["border"]}" stroke-width="0.9"/>'
        f'<line x1="{cx:.1f}" y1="{cy:.1f}" x2="{nx:.1f}" y2="{ny:.1f}" stroke="{color}" stroke-width="2.0" stroke-linecap="round"/>'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="1.6" fill="{p["ink"]}"/>'
        f"</g>"
    )


def patch_jack(cx: float, cy: float, color: str, label: str, p: dict[str, str], mode: str) -> str:
    """Eurorack 3.5mm TRS hex-nut patch jack port."""
    hole = "#111214" if mode == "light" else "#07080A"
    return (
        f"<g>"
        f'<polygon points="{hex_polygon(cx, cy, 7.6, 0.0)}" fill="{p["patternBg"]}" stroke="{p["border"]}" stroke-width="0.9"/>'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="5.3" fill="{p["surface"]}" stroke="{color}" stroke-width="1.5"/>'
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="3.0" fill="{hole}"/>'
        f'<text x="{cx + 11.5:.1f}" y="{cy + 3.0:.1f}" font-family="{FONT_MONO}" font-size="8" font-weight="700" letter-spacing="0.4" fill="{p["sub"]}">{escape(label)}</text>'
        f"</g>"
    )


def build_wave_path(x0: float, y0: float, width: float, period: float, amp: float, phase: float = 0.0) -> str:
    """Generate a smooth periodic synth waveform SVG path spanning 2x screen width for seamless drift."""
    pts = []
    steps = 48
    for i in range(steps + 1):
        x = x0 + (width * i / steps)
        t = (x - x0) / period * 2.0 * math.pi + phase
        y = y0 - amp * (0.72 * math.sin(t) + 0.28 * math.sin(2.0 * t + 0.6))
        cmd = "M" if i == 0 else "L"
        pts.append(f"{cmd} {x:.1f} {y:.1f}")
    return " ".join(pts)


def build_hero(mode: str, p: dict[str, str]) -> str:
    w, h = 846, 300
    uid = f"synth-{mode}"
    oled_bg = "#111317" if mode == "light" else "#0A0B0E"
    oled_grid = "#1E222C"
    oled_green = "#34D399"
    oled_blue = "#38BDF8"
    oled_orange = "#FF6B2B"
    oled_yellow = "#FACC15"

    # Left 4 rotary-dial / patchbay KPI meters
    kpis = [
        ("REPOS", "13", "Public Repos", p["accent"], 45.0, 5),
        ("STARS", "20+", "GitHub Stars", p["secondary"], 15.0, 4),
        ("LIVE", "03", "Live Domains", p["tertiary"], -20.0, 6),
        ("STACK", "06", "Core Stacks", p["highlight"], 70.0, 6),
    ]
    kpi_parts = []
    for idx, (lbl, val, sub, col, ang, segs) in enumerate(kpis):
        kx = 30 + idx * 121
        ky = 188
        bars = "".join(
            f'<rect x="{kx + 10 + b * 13.8:.1f}" y="{ky + 60}" width="10" height="3.2" rx="1" '
            f'fill="{col if b < segs else p["patternBg"]}"/>'
            for b in range(7)
        )
        kpi_parts.append(
            f'<g>'
            f'<rect x="{kx}" y="{ky}" width="113" height="86" rx="5" fill="{p["surface"]}" stroke="{p["borderSoft"]}" stroke-width="1"/>'
            f'<rect x="{kx + 8}" y="{ky + 6}" width="97" height="2.6" rx="1.3" fill="{col}"/>'
            f'<text x="{kx + 10}" y="{ky + 23}" font-family="{FONT_MONO}" font-size="8.5" font-weight="700" letter-spacing="0.8" fill="{p["sub"]}">{lbl}</text>'
            f'{mini_dial(kx + 94, ky + 21, 7.2, col, ang, p)}'
            f'<text x="{kx + 10}" y="{ky + 52}" font-family="{FONT_MONO}" font-size="22" font-weight="800" fill="{p["ink"]}">{val}</text>'
            f"{bars}"
            f'<text x="{kx + 10}" y="{ky + 77}" font-family="{FONT_SANS}" font-size="9.5" fill="{p["sub"]}">{escape(sub)}</text>'
            f"</g>"
        )

    # Mini VU meter bars inside the left recessed OLED readout strip
    vu_heights = [7, 11, 15, 9, 18, 13, 8, 16, 11, 6]
    vu_colors = [
        oled_green, oled_green, oled_green, oled_green,
        oled_blue, oled_blue, oled_blue,
        oled_yellow, oled_yellow, oled_orange,
    ]
    vu_bars = "".join(
        f'<rect x="{414 + i * 8}" y="{170 - vh}" width="5" height="{vh}" rx="1" fill="{vc}"/>'
        for i, (vh, vc) in enumerate(zip(vu_heights, vu_colors))
    )

    # Right OLED oscilloscope grid + animated waveform paths (period=66px, shifted smoothly by -66px)
    osc_x, osc_y, osc_w, osc_h = 670, 52, 144, 114
    osc_grid_lines = "".join(
        f'<line x1="{osc_x + gx}" y1="{osc_y + 18}" x2="{osc_x + gx}" y2="{osc_y + osc_h - 16}" stroke="{oled_grid}" stroke-width="0.7"/>'
        for gx in range(24, osc_w, 24)
    ) + "".join(
        f'<line x1="{osc_x + 6}" y1="{osc_y + gy}" x2="{osc_x + osc_w - 6}" y2="{osc_y + gy}" stroke="{oled_grid}" stroke-width="0.7"/>'
        for gy in (36, 57, 78)
    )
    wave_primary = build_wave_path(osc_x + 4, osc_y + 57, 264.0, 66.0, 19.0, 0.0)
    wave_secondary = build_wave_path(osc_x + 4, osc_y + 57, 264.0, 66.0, 12.0, 1.8)

    # Right 4 color-coded rotary encoder knobs
    knobs_spec = [
        (574, 224, p["accent"], -42.0, "FREQ", mode == "dark"),
        (642, 224, p["secondary"], 28.0, "RESO", mode == "dark"),
        (710, 224, p["tertiary"], -72.0, "GATE", mode == "dark"),
        (778, 224, p["highlight"], 64.0, "TUNE", True),
    ]
    knobs_svg = "".join(
        rotary_knob(kx, ky, 18.0, col, ang, lbl, p, mode, pointer_dark=dark_ptr)
        for kx, ky, col, ang, lbl, dark_ptr in knobs_spec
    )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Furina-he — Tactile Industrial Synth GitHub Profile">
  <title>Furina-he — Tactile Industrial Synth</title>
  <defs>
    <clipPath id="osc-clip-{uid}">
      <rect x="{osc_x + 5}" y="{osc_y + 18}" width="{osc_w - 10}" height="{osc_h - 34}" rx="2"/>
    </clipPath>
  </defs>
  <style>
    @keyframes oscScroll_{uid} {{
      0% {{ transform: translateX(0px); }}
      100% {{ transform: translateX(-66px); }}
    }}
    @keyframes ledPulse_{uid} {{
      0%, 100% {{ opacity: 1; }}
      50% {{ opacity: 0.42; }}
    }}
    .osc-wave-{uid} {{ animation: oscScroll_{uid} 3.6s linear infinite; }}
    .osc-harm-{uid} {{ animation: oscScroll_{uid} 5.4s linear infinite; }}
    .led-live-{uid} {{ animation: ledPulse_{uid} 2.6s ease-in-out infinite; }}
    @media (prefers-reduced-motion: reduce) {{
      .osc-wave-{uid}, .osc-harm-{uid}, .led-live-{uid} {{ animation: none !important; }}
    }}
  </style>

  {chassis_frame(w, h, p, mode, "bg", rx=10, screw_pad=17.0, screw_r=5.2)}

  <!-- Top Silkscreen Status Bar -->
  <circle cx="40" cy="23.5" r="5.5" fill="{p["accent"]}" fill-opacity="0.22" class="led-live-{uid}"/>
  <circle cx="40" cy="23.5" r="3.1" fill="{p["accent"]}"/>
  <text x="52" y="27" font-family="{FONT_MONO}" font-size="9.6" font-weight="700" letter-spacing="1.0" fill="{p["ink"]}">OP-DEV // FIELD SYNTH · CH-01</text>
  <rect x="542" y="14.5" width="116" height="17" rx="3" fill="{p["patternBg"]}" stroke="{p["borderSoft"]}" stroke-width="0.9"/>
  <text x="600" y="26" text-anchor="middle" font-family="{FONT_MONO}" font-size="8.4" font-weight="700" letter-spacing="0.6" fill="{p["sub"]}">48kHz · 24-BIT</text>
  <text x="808" y="27" text-anchor="end" font-family="{FONT_MONO}" font-size="9" letter-spacing="0.8" fill="{p["sub"]}">REV 07 · STATIC SVG</text>
  <line x1="30" y1="38.5" x2="816" y2="38.5" stroke="{p["borderSoft"]}" stroke-width="1"/>

  <!-- Main Vertical Chassis Divider -->
  <line x1="523.5" y1="48" x2="523.5" y2="278" stroke="{p["borderSoft"]}" stroke-width="1"/>

  <!-- Left Zone: Technical Display Identity -->
  <rect x="30" y="50" width="7" height="7" rx="1.5" fill="{p["accent"]}"/>
  <text x="44" y="57" font-family="{FONT_MONO}" font-size="8.8" font-weight="700" letter-spacing="0.9" fill="{p["sub"]}">FIELD WORKSTATION // INDIE SYSTEMS BUILDER</text>

  <text x="30" y="97" font-family="{FONT_SANS}" font-size="38" font-weight="800" letter-spacing="-0.8" fill="{p["ink"]}">Furina-he</text>
  <rect x="366" y="72" width="140" height="26" rx="4" fill="{p["patternBg"]}" stroke="{p["borderSoft"]}" stroke-width="1"/>
  <circle cx="379" cy="85" r="2.8" fill="{p["accent"]}"/>
  <text x="390" y="89" font-family="{FONT_MONO}" font-size="11" font-weight="700" letter-spacing="0.4" fill="{p["ink"]}">NeverGiveUp</text>

  <text x="30" y="119" font-family="{FONT_SANS}" font-size="12.5" fill="{p["sub"]}">Local-first AI ops, desktop companions &amp; deterministic SVG craft.</text>

  <!-- Recessed OLED Status Readout Strip -->
  <rect x="30" y="132" width="476" height="44" rx="5" fill="{oled_bg}" stroke="{p["border"]}" stroke-width="1.2"/>
  <rect x="32.5" y="134.5" width="471" height="39" rx="3.5" fill="none" stroke="#262A34" stroke-width="0.8"/>
  <circle cx="44" cy="147" r="2.8" fill="{oled_green}" class="led-live-{uid}"/>
  <text x="53" y="150" font-family="{FONT_MONO}" font-size="8.4" font-weight="700" letter-spacing="0.6" fill="{oled_green}">SIGNAL: ONLINE <tspan fill="#9CA3AF" font-weight="500">· CLOUDLINK.BLESSC.COM</tspan></text>
  <text x="41" y="167" font-family="{FONT_MONO}" font-size="9.4" font-weight="600" letter-spacing="0.3" fill="#F3F2EE">BUS &gt; RUST · TS · PYTHON · TAURI · ELECTRON</text>
  <text x="494" y="144" text-anchor="end" font-family="{FONT_MONO}" font-size="7.2" font-weight="700" fill="{oled_blue}">VU -0.4dB</text>
  {vu_bars}

  <!-- Left Bottom: 4 Rotary-Dial / Patchbay KPI Meters -->
  {"".join(kpi_parts)}

  <!-- Right Top: Perforated Circular Speaker Grill + Recessed AMOLED Oscilloscope -->
  {speaker_grill(600, 108, 49, p, mode)}
  <text x="600" y="176" text-anchor="middle" font-family="{FONT_MONO}" font-size="7.6" font-weight="700" letter-spacing="0.9" fill="{p["sub"]}">SPEAKER · MONO</text>

  <rect x="{osc_x}" y="{osc_y}" width="{osc_w}" height="{osc_h}" rx="6" fill="{oled_bg}" stroke="{p["border"]}" stroke-width="1.2"/>
  <rect x="{osc_x + 2.5}" y="{osc_y + 2.5}" width="{osc_w - 5}" height="{osc_h - 5}" rx="4" fill="none" stroke="#262A34" stroke-width="0.8"/>
  {osc_grid_lines}
  <line x1="{osc_x + 6}" y1="{osc_y + 57}" x2="{osc_x + osc_w - 6}" y2="{osc_y + 57}" stroke="#333A4A" stroke-width="0.8" stroke-dasharray="3 3"/>
  <text x="{osc_x + 9}" y="{osc_y + 14}" font-family="{FONT_MONO}" font-size="7.8" font-weight="700" fill="{oled_orange}">OSC-A</text>
  <text x="{osc_x + osc_w - 9}" y="{osc_y + 14}" text-anchor="end" font-family="{FONT_MONO}" font-size="7.4" fill="{oled_blue}">SIN/SAW</text>
  <g clip-path="url(#osc-clip-{uid})">
    <path d="{wave_secondary}" fill="none" stroke="{oled_blue}" stroke-opacity="0.55" stroke-width="1.3" stroke-linecap="round" class="osc-harm-{uid}"/>
    <path d="{wave_primary}" fill="none" stroke="{oled_green}" stroke-width="2.1" stroke-linecap="round" class="osc-wave-{uid}"/>
  </g>
  <text x="{osc_x + 9}" y="{osc_y + osc_h - 6}" font-family="{FONT_MONO}" font-size="7.4" font-weight="700" fill="{oled_yellow}">ENV 42ms</text>
  <text x="{osc_x + osc_w - 9}" y="{osc_y + osc_h - 6}" text-anchor="end" font-family="{FONT_MONO}" font-size="7.4" fill="#F3F2EE">PATCH 07</text>
  <text x="{osc_x + osc_w / 2:.1f}" y="176" text-anchor="middle" font-family="{FONT_MONO}" font-size="7.6" font-weight="700" letter-spacing="0.9" fill="{p["sub"]}">AMOLED · SCOPE</text>

  <!-- Right Bottom: 4 Color-Coded Rotary Encoder Knobs -->
  <rect x="538" y="188" width="276" height="86" rx="6" fill="{p["surface"]}" stroke="{p["borderSoft"]}" stroke-width="1"/>
  {knobs_svg}
</svg>"""


def build_button(channel: str, text: str, col_key: str, primary: bool, p: dict[str, str], mode: str) -> str:
    full = f"[{channel}] {text}"
    w = max(136, int(len(full) * 6.8) + 34)
    h = 30
    led_col = p[col_key]
    if primary:
        face_fill = "#141517" if mode == "light" else "#23262E"
        face_stroke = "#141517" if mode == "light" else p["accent"]
        well_fill = "#0A0B0D" if mode == "light" else "#0D0E11"
        text_fill = "#FAF8F4" if mode == "light" else "#F3F2EE"
        ch_fill = "#FF6B2B"
    else:
        face_fill = p["surface"]
        face_stroke = p["borderSoft"]
        well_fill = p["patternBg"]
        text_fill = p["ink"]
        ch_fill = p["sub"]
    led_bezel = "#0B0C0E" if (primary or mode == "dark") else p["patternBg"]

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(full)}">
  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" rx="5" fill="{well_fill}" stroke="{p["border"]}" stroke-width="1"/>
  <rect x="2" y="2" width="{w - 4}" height="{h - 6}" rx="3.5" fill="{face_fill}" stroke="{face_stroke}" stroke-width="0.9"/>
  <circle cx="14" cy="14" r="4.5" fill="{led_bezel}" stroke="{p["border"]}" stroke-opacity="0.45" stroke-width="0.7"/>
  <circle cx="14" cy="14" r="2.8" fill="{led_col}"/>
  <circle cx="13.2" cy="13.2" r="0.8" fill="#FFFFFF" fill-opacity="0.75"/>
  <text x="25" y="17.5" font-family="{FONT_MONO}" font-size="10" font-weight="700" fill="{text_fill}"><tspan fill="{ch_fill}">[{escape(channel)}]</tspan> {escape(text)}</text>
</svg>"""


def build_section(code: str, title: str, right: str, p: dict[str, str], mode: str) -> str:
    w, h = 846, 40
    vents = "".join(
        f'<rect x="{510 + i * 7}" y="15" width="3" height="10" rx="1.2" fill="{p["patternBg"]}" stroke="{p["borderSoft"]}" stroke-width="0.6"/>'
        for i in range(8)
    )
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(code)} // {escape(title)}">
  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" rx="6" fill="{p["bg"]}" stroke="{p["border"]}" stroke-width="1.1"/>
  <rect x="30" y="5" width="{w - 60}" height="30" rx="3.5" fill="{p["surface"]}" stroke="{p["borderSoft"]}" stroke-width="0.9"/>
  {hex_screw(16, 20, p, mode, 5.0)}
  {hex_screw(w - 16, 20, p, mode, 5.0)}
  <circle cx="46" cy="20" r="3" fill="{p["accent"]}"/>
  <circle cx="57" cy="20" r="3" fill="{p["secondary"]}"/>
  <circle cx="68" cy="20" r="3" fill="{p["tertiary"]}"/>
  <text x="84" y="24" font-family="{FONT_MONO}" font-size="11.5" font-weight="700" letter-spacing="1.0" fill="{p["ink"]}">{escape(code)} <tspan fill="{p["muted"]}">//</tspan> {escape(title)}</text>
  {vents}
  <text x="{w - 42}" y="23.5" text-anchor="end" font-family="{FONT_MONO}" font-size="9.4" font-weight="700" letter-spacing="0.8" fill="{p["sub"]}">{escape(right)}</text>
</svg>"""


def build_card(
    idx: int,
    name: str,
    mod_no: str,
    tag: str,
    d1: str,
    d2: str,
    stack: str,
    dial_label: str,
    dial_angle: float,
    p: dict[str, str],
    mode: str,
) -> str:
    w, h = 417, 196
    colors = [p["accent"], p["secondary"], p["tertiary"], p["highlight"]]
    col = colors[idx % 4]
    pointer_dark = mode == "dark" or (idx % 4 == 3)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(name)} — Eurorack Module {mod_no}">
  <title>{escape(name)} — Synth Hardware Module {mod_no}</title>
  {chassis_frame(w, h, p, mode, "surface", rx=8, screw_pad=14.5, screw_r=4.6)}
  <rect x="28" y="5" width="{w - 56}" height="3" rx="1.5" fill="{col}"/>

  <!-- Top Module Silkscreen & Patch Jacks -->
  <circle cx="31" cy="28" r="3.2" fill="{col}"/>
  <text x="41" y="31.5" font-family="{FONT_MONO}" font-size="9.5" font-weight="700" letter-spacing="0.8" fill="{p["ink"]}">MOD {mod_no} <tspan fill="{p["muted"]}">//</tspan> {escape(tag)}</text>
  {patch_jack(314, 28, col, "IN", p, mode)}
  {patch_jack(356, 28, p["borderSoft"] if mode == "light" else p["muted"], "OUT", p, mode)}
  <line x1="22" y1="48.5" x2="{w - 22}" y2="48.5" stroke="{p["borderSoft"]}" stroke-width="0.9"/>

  <!-- Left Content: Module Name & Description -->
  <text x="26" y="83" font-family="{FONT_SANS}" font-size="25" font-weight="800" letter-spacing="-0.5" fill="{p["ink"]}">{escape(name)}</text>
  <text x="26" y="108" font-family="{FONT_SANS}" font-size="12" fill="{p["sub"]}">{escape(d1)}</text>
  <text x="26" y="127" font-family="{FONT_SANS}" font-size="12" fill="{p["sub"]}">{escape(d2)}</text>

  <!-- Right Mini Rotary Knob Dial Bay -->
  <rect x="314" y="58" width="79" height="84" rx="5" fill="{p["bg"]}" stroke="{p["borderSoft"]}" stroke-width="0.9"/>
  {rotary_knob(353.5, 92, 16.0, col, dial_angle, dial_label, p, mode, pointer_dark=pointer_dark)}

  <!-- Bottom Silkscreen Spec Footer -->
  <line x1="22" y1="152.5" x2="{w - 22}" y2="152.5" stroke="{p["borderSoft"]}" stroke-width="0.9"/>
  <text x="26" y="172" font-family="{FONT_MONO}" font-size="9.8" fill="{p["sub"]}">{escape(stack)}</text>
  <text x="{w - 26}" y="172" text-anchor="end" font-family="{FONT_MONO}" font-size="9.6" font-weight="700" fill="{p["ink"]}">PATCH <tspan fill="{col}">↗</tspan></text>
</svg>"""


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    buttons = [
        ("cloudlink", "CH.1", "cloudlink.blessc.com", "accent", True),
        ("openpet", "CH.2", "openpet.myfurina.top", "secondary", False),
        ("release", "CH.3", "CloudLink v0.6.0", "tertiary", False),
        ("github", "CH.4", "@Furina-he", "highlight", False),
    ]
    cards = [
        (
            "cloudlink",
            "CloudLink",
            "01",
            "GUARDRAIL",
            "Local-first AI ops cockpit with zero-secret",
            "deterministic execution guardrails.",
            "Rust · Tauri · TypeScript",
            "SYNC 98%",
            -35.0,
        ),
        (
            "openpet",
            "OpenPet",
            "02",
            "COMPANION",
            "Quiet desktop AI companion featuring local",
            "memory, habits, and open plugins.",
            "TypeScript · Electron · AI",
            "MEM 84%",
            38.0,
        ),
        (
            "gitskins",
            "GitSkins",
            "03",
            "SKIN ENGINE",
            "Modular Light & Dark GitHub Profile & Repo",
            "SVG themes with Bento widgets.",
            "TypeScript · Python · SVG",
            "SVG 100%",
            16.0,
        ),
        (
            "virtual",
            "Virtual",
            "04",
            "3D SPATIAL",
            "Interactive 3D virtual lab crafted for",
            "real-time spatial experimentation.",
            "TypeScript · WebGL · 3D",
            "FPS 60",
            -58.0,
        ),
    ]
    count = 0
    for mode, pal in PALETTES.items():
        files = {
            f"hero-{mode}.svg": build_hero(mode, pal),
            f"sec-work-{mode}.svg": build_section("PATCH 01", "SELECTED MODULES", "04 EURORACK MODULES", pal, mode),
            f"sec-activity-{mode}.svg": build_section("PATCH 02", "SIGNAL ACTIVITY", "CH-OUT // @FURINA-HE", pal, mode),
        }
        for bid, ch, txt, col_key, prim in buttons:
            files[f"btn-{bid}-{mode}.svg"] = build_button(ch, txt, col_key, prim, pal, mode)
        for idx, (cid, name, mod_no, tag, d1, d2, stk, dlbl, dang) in enumerate(cards):
            files[f"card-{cid}-{mode}.svg"] = build_card(idx, name, mod_no, tag, d1, d2, stk, dlbl, dang, pal, mode)
        for fname, svg in files.items():
            ET.fromstring(svg)
            (OUT_DIR / fname).write_text(svg, encoding="utf-8")
            count += 1
    print(f"[synth-hardware] Generated and XML-validated {count} SVGs")


if __name__ == "__main__":
    main()
