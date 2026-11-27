#!/usr/bin/env python3
"""Generate 22 Light & Dark Solder Mask PCB SVGs and validate strict XML."""

from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape
import xml.etree.ElementTree as ET

OUT_DIR = Path(__file__).resolve().parent / "assets"
FONT_MONO = "'JetBrains Mono','SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace"
FONT_SANS = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"

PALETTES = {
    "light": {
        "bg": "#F5F5F2",
        "surface": "#FFFFFF",
        "ink": "#16211B",
        "sub": "#3D4F45",
        "muted": "#67786E",
        "border": "#1C4F38",
        "borderSoft": "#CBD6CF",
        "accent": "#B87D14",
        "accentFg": "#FFFFFF",
        "secondary": "#1C6B4A",
        "tertiary": "#0D7D8C",
        "highlight": "#D49B1A",
        "patternBg": "#EAECE8",
        "patternFg": "#C7D4CC",
    },
    "dark": {
        "bg": "#0B1F17",
        "surface": "#102B20",
        "ink": "#F2F7F4",
        "sub": "#B6D4C5",
        "muted": "#76A38E",
        "border": "#E5B84B",
        "borderSoft": "#1E4A38",
        "accent": "#E5B84B",
        "accentFg": "#0B1F17",
        "secondary": "#34D399",
        "tertiary": "#38BDF8",
        "highlight": "#F59E0B",
        "patternBg": "#081711",
        "patternFg": "#193D2E",
    },
}


def pcb_grid_defs(uid: str, p: dict[str, str], step: int = 16) -> str:
    """Subtle copper ground-plane micro-grid for FR-4 solder mask substrate."""
    return (
        f"  <defs>\n"
        f'    <pattern id="pcb-grid-{uid}" width="{step}" height="{step}" patternUnits="userSpaceOnUse">\n'
        f'      <circle cx="{step // 2}" cy="{step // 2}" r="0.85" fill="{p["patternFg"]}" fill-opacity="0.7"/>\n'
        f"    </pattern>\n"
        f"  </defs>"
    )


def mounting_hole(cx: int, cy: int, p: dict[str, str]) -> str:
    """ENIG immersion gold corner mounting hole with annular ring, drill bore, and stitching vias."""
    gold = p["highlight"] if p["bg"] == "#F5F5F2" else p["accent"]
    ring_edge = p["accent"]
    return (
        f'<g aria-hidden="true">'
        f'<circle cx="{cx}" cy="{cy}" r="8.5" fill="none" stroke="{ring_edge}" stroke-opacity="0.45" stroke-width="0.7" stroke-dasharray="2 2"/>'
        f'<circle cx="{cx}" cy="{cy}" r="6.8" fill="{gold}" stroke="{ring_edge}" stroke-width="0.7"/>'
        f'<circle cx="{cx}" cy="{cy}" r="3.4" fill="{p["patternBg"]}" stroke="{p["borderSoft"]}" stroke-width="0.7"/>'
        f'<circle cx="{cx - 7}" cy="{cy - 7}" r="0.9" fill="{gold}"/>'
        f'<circle cx="{cx + 7}" cy="{cy - 7}" r="0.9" fill="{gold}"/>'
        f'<circle cx="{cx - 7}" cy="{cy + 7}" r="0.9" fill="{gold}"/>'
        f'<circle cx="{cx + 7}" cy="{cy + 7}" r="0.9" fill="{gold}"/>'
        f"</g>"
    )


def via_pad(cx: float, cy: float, p: dict[str, str], r: float = 3.2, hole_fill: str | None = None) -> str:
    """ENIG gold plated through-hole via pad."""
    gold = p["highlight"] if p["bg"] == "#F5F5F2" else p["accent"]
    bore = hole_fill if hole_fill is not None else p["bg"]
    return (
        f'<g aria-hidden="true">'
        f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{gold}"/>'
        f'<circle cx="{cx}" cy="{cy}" r="{r * 0.45:.2f}" fill="{bore}"/>'
        f"</g>"
    )


def smd_resistor(x: int, y: int, label: str, val: str, p: dict[str, str]) -> str:
    """Horizontal SMD resistor footprint with ENIG pads and silkscreen designator."""
    gold = p["highlight"] if p["bg"] == "#F5F5F2" else p["accent"]
    body = "#23302A" if p["bg"] == "#F5F5F2" else "#06140E"
    return (
        f'<g aria-hidden="true">'
        f'<rect x="{x - 2}" y="{y - 2}" width="28" height="14" rx="1.5" fill="none" stroke="{p["borderSoft"]}" stroke-width="0.8"/>'
        f'<rect x="{x}" y="{y}" width="6" height="10" rx="0.8" fill="{gold}"/>'
        f'<rect x="{x + 18}" y="{y}" width="6" height="10" rx="0.8" fill="{gold}"/>'
        f'<rect x="{x + 5.5}" y="{y + 1}" width="13" height="8" fill="{body}" stroke="{p["borderSoft"]}" stroke-width="0.6"/>'
        f'<text x="{x + 12}" y="{y - 5}" text-anchor="middle" font-family="{FONT_MONO}" font-size="7.5" font-weight="700" fill="{p["sub"]}">{escape(label)}</text>'
        f'<text x="{x + 12}" y="{y + 20}" text-anchor="middle" font-family="{FONT_MONO}" font-size="7" fill="{p["muted"]}">{escape(val)}</text>'
        f"</g>"
    )


def smd_capacitor(x: int, y: int, label: str, val: str, p: dict[str, str]) -> str:
    """Horizontal SMD ceramic capacitor footprint with ENIG pads and silkscreen label."""
    gold = p["highlight"] if p["bg"] == "#F5F5F2" else p["accent"]
    cap_body = p["tertiary"]
    return (
        f'<g aria-hidden="true">'
        f'<rect x="{x - 2}" y="{y - 2}" width="26" height="13" rx="1.5" fill="none" stroke="{p["borderSoft"]}" stroke-width="0.8"/>'
        f'<rect x="{x}" y="{y}" width="5.5" height="9" rx="0.8" fill="{gold}"/>'
        f'<rect x="{x + 16.5}" y="{y}" width="5.5" height="9" rx="0.8" fill="{gold}"/>'
        f'<rect x="{x + 5.5}" y="{y + 1}" width="11" height="7" fill="{cap_body}" fill-opacity="0.85"/>'
        f'<text x="{x + 11}" y="{y - 5}" text-anchor="middle" font-family="{FONT_MONO}" font-size="7.5" font-weight="700" fill="{p["sub"]}">{escape(label)}</text>'
        f'<text x="{x + 11}" y="{y + 19}" text-anchor="middle" font-family="{FONT_MONO}" font-size="7" fill="{p["muted"]}">{escape(val)}</text>'
        f"</g>"
    )


def qfp_ic_package(cx: int, cy: int, p: dict[str, str], mode: str) -> str:
    """Right-hand QFP-32 Silicon IC Package (U1 · DEV-SOC) with 32 gull-wing ENIG gold pins."""
    size = 96
    x0 = cx - size // 2
    y0 = cy - size // 2
    gold = p["highlight"] if mode == "light" else p["accent"]
    gold_edge = p["accent"] if mode == "light" else "#B88924"
    epoxy = "#18241E" if mode == "light" else "#06130E"
    epoxy_inner = "#22332B" if mode == "light" else "#0C2219"
    etch_hi = "#E5B84B"
    etch_main = "#F2F7F4"
    etch_sub = "#B6D4C5"
    etch_dim = "#7FA895"

    pins: list[str] = []
    # 8 gull-wing pins per side (32-pin QFP)
    offsets = [-35, -25, -15, -5, 5, 15, 25, 35]
    for off in offsets:
        px = cx + off
        py = cy + off
        # Top pins
        pins.append(
            f'<rect x="{px - 2}" y="{y0 - 15}" width="4" height="15" rx="0.6" fill="{gold}" stroke="{gold_edge}" stroke-width="0.4"/>'
            f'<rect x="{px - 2.6}" y="{y0 - 16}" width="5.2" height="3" rx="0.5" fill="{gold}"/>'
        )
        # Bottom pins
        pins.append(
            f'<rect x="{px - 2}" y="{y0 + size}" width="4" height="15" rx="0.6" fill="{gold}" stroke="{gold_edge}" stroke-width="0.4"/>'
            f'<rect x="{px - 2.6}" y="{y0 + size + 13}" width="5.2" height="3" rx="0.5" fill="{gold}"/>'
        )
        # Left pins
        pins.append(
            f'<rect x="{x0 - 15}" y="{py - 2}" width="15" height="4" rx="0.6" fill="{gold}" stroke="{gold_edge}" stroke-width="0.4"/>'
            f'<rect x="{x0 - 16}" y="{py - 2.6}" width="3" height="5.2" rx="0.5" fill="{gold}"/>'
        )
        # Right pins
        pins.append(
            f'<rect x="{x0 + size}" y="{py - 2}" width="15" height="4" rx="0.6" fill="{gold}" stroke="{gold_edge}" stroke-width="0.4"/>'
            f'<rect x="{x0 + size + 13}" y="{py - 2.6}" width="3" height="5.2" rx="0.5" fill="{gold}"/>'
        )

    # Courtyard silkscreen corner ticks around QFP footprint
    c = 21
    courtyard = (
        f'<path d="M {x0 - c} {y0 - c + 12} V {y0 - c} H {x0 - c + 12}" fill="none" stroke="{p["border"]}" stroke-opacity="0.65" stroke-width="1"/>'
        f'<path d="M {x0 + size + c - 12} {y0 - c} H {x0 + size + c} V {y0 - c + 12}" fill="none" stroke="{p["border"]}" stroke-opacity="0.65" stroke-width="1"/>'
        f'<path d="M {x0 - c} {y0 + size + c - 12} V {y0 + size + c} H {x0 - c + 12}" fill="none" stroke="{p["border"]}" stroke-opacity="0.65" stroke-width="1"/>'
        f'<path d="M {x0 + size + c - 12} {y0 + size + c} H {x0 + size + c} V {y0 + size + c - 12}" fill="none" stroke="{p["border"]}" stroke-opacity="0.65" stroke-width="1"/>'
    )

    # Chamfered Pin-1 corner polygon for QFP body
    ch = 7
    body_pts = (
        f"{x0 + ch},{y0} {x0 + size},{y0} {x0 + size},{y0 + size} "
        f"{x0},{y0 + size} {x0},{y0 + ch}"
    )

    return (
        f'<g aria-label="U1 DEV-SOC QFP-32 Silicon IC Package">'
        f"{courtyard}"
        f'{"".join(pins)}'
        f'<polygon points="{body_pts}" fill="{epoxy}" stroke="{gold}" stroke-width="1.3"/>'
        f'<rect x="{x0 + 8}" y="{y0 + 8}" width="{size - 16}" height="{size - 16}" rx="2" fill="{epoxy_inner}" stroke="{gold}" stroke-opacity="0.38" stroke-width="0.9"/>'
        f'<circle cx="{x0 + 15}" cy="{y0 + 15}" r="3.2" fill="{etch_hi}"/>'
        f'<text x="{x0 + 24}" y="{y0 + 18}" font-family="{FONT_MONO}" font-size="7.5" font-weight="700" fill="{etch_dim}">PIN1</text>'
        f'<text x="{cx}" y="{cy - 8}" text-anchor="middle" font-family="{FONT_MONO}" font-size="12" font-weight="700" letter-spacing="1.2" fill="{etch_hi}">U1</text>'
        f'<text x="{cx}" y="{cy + 9}" text-anchor="middle" font-family="{FONT_MONO}" font-size="11" font-weight="700" letter-spacing="0.8" fill="{etch_main}">DEV-SOC</text>'
        f'<text x="{cx}" y="{cy + 23}" text-anchor="middle" font-family="{FONT_MONO}" font-size="8.2" font-weight="600" fill="{etch_sub}">FURINA-HE</text>'
        f'<text x="{cx}" y="{cy + 36}" text-anchor="middle" font-family="{FONT_MONO}" font-size="7.2" fill="{etch_dim}">QFP-32 · 26W</text>'
        f"</g>"
    )


def build_hero(mode: str, p: dict[str, str]) -> str:
    w, h = 846, 300
    uid = f"pcb-{mode}"
    gold = p["highlight"] if mode == "light" else p["accent"]
    hi_label = p["border"] if mode == "light" else p["accent"]
    trace_stroke = p["patternFg"] if mode == "light" else "#1D4A37"
    trace_op = "0.95" if mode == "light" else "0.9"
    pulse_col = p["highlight"] if mode == "light" else p["accent"]
    ic_cx, ic_cy = 684, 132

    # 45-degree copper trace bus network across substrate (routed behind copy & into U1)
    static_traces = (
        f'<g fill="none" stroke="{trace_stroke}" stroke-opacity="{trace_op}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        # Left upper bus feeding U1 left pins
        f'<path d="M 46 60 H 472 L 496 84 H 612 L 620 97"/>'
        f'<path d="M 480 68 L 502 90 H 608 L 620 107"/>'
        f'<path d="M 520 117 H 620"/>'
        f'<path d="M 538 147 H 604 L 614 157 H 620"/>'
        f'<path d="M 536 168 H 598 L 610 180 H 636"/>'
        # Traces from U1 top pins to upper vias & VCC
        f'<path d="M 659 68 V 52 L 648 41"/>'
        f'<path d="M 679 68 V 50 L 690 41"/>'
        f'<path d="M 709 68 V 56 L 722 44 H 768 L 778 54"/>'
        # Traces from U1 right pins to VCC / GND / edge vias
        f'<path d="M 748 107 H 772 L 784 95 V 78"/>'
        f'<path d="M 748 127 H 788 L 798 117"/>'
        f'<path d="M 748 147 H 774 L 784 157 V 176"/>'
        # Traces from U1 bottom pins routing down to PIN 01..04 header rail
        f'<path d="M 649 196 V 208 L 636 221"/>'
        f'<path d="M 669 196 V 210 L 656 221"/>'
        f'<path d="M 699 196 V 210 L 712 221"/>'
        # Subtle ground traces on left margin
        f'<path d="M 22 68 V 118 L 32 128 V 192"/>'
        f'<path d="M 824 66 V 144 L 814 154 V 208"/>'
        f"</g>"
    )

    # Animated gold signal pulses travelling along 45° copper paths
    pulse_traces = (
        f'<g fill="none" stroke="{pulse_col}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        f'<path class="pcb-pulse-{uid}" d="M 472 60 L 496 84 H 612 L 620 97" stroke-dasharray="14 186"/>'
        f'<path class="pcb-pulse-b-{uid}" d="M 748 127 H 788 L 798 117" stroke-dasharray="10 110"/>'
        f'<path class="pcb-pulse-{uid}" d="M 649 196 V 208 L 636 221" stroke-dasharray="10 120"/>'
        f"</g>"
    )

    # Decorative via anchors along routed traces
    vias = "".join(
        [
            via_pad(472, 60, p, 3.0),
            via_pad(480, 68, p, 2.8),
            via_pad(538, 147, p, 2.8),
            via_pad(778, 54, p, 3.0),
            via_pad(798, 117, p, 3.0),
            via_pad(32, 192, p, 2.8),
            via_pad(814, 208, p, 2.8),
        ]
    )

    # VCC & GND symbols near right edge of U1
    vcc_gnd = (
        f'<g aria-hidden="true">'
        # VCC power node at top-right of IC
        f'<line x1="784" y1="68" x2="784" y2="78" stroke="{p["secondary"]}" stroke-width="1.3"/>'
        f'<line x1="777" y1="68" x2="791" y2="68" stroke="{p["secondary"]}" stroke-width="1.8"/>'
        f'<text x="784" y="63" text-anchor="middle" font-family="{FONT_MONO}" font-size="7.5" font-weight="700" fill="{p["secondary"]}">VCC 3V3</text>'
        # GND symbol at bottom-right of IC
        f'<line x1="784" y1="176" x2="784" y2="186" stroke="{p["tertiary"]}" stroke-width="1.3"/>'
        f'<line x1="776" y1="186" x2="792" y2="186" stroke="{p["tertiary"]}" stroke-width="1.5"/>'
        f'<line x1="779" y1="190" x2="789" y2="190" stroke="{p["tertiary"]}" stroke-width="1.3"/>'
        f'<line x1="782" y1="194" x2="786" y2="194" stroke="{p["tertiary"]}" stroke-width="1.2"/>'
        f'<text x="784" y="205" text-anchor="middle" font-family="{FONT_MONO}" font-size="7.5" font-weight="700" fill="{p["tertiary"]}">GND</text>'
        f"</g>"
    )

    # Bottom 4-column Pin-Header Metric Pads (PIN 01..04)
    metrics = [
        ("PIN 01", "FLAGSHIPS", "04", "Ops · AI · Skins · 3D", p["secondary"], True),
        ("PIN 02", "PUBLIC REPOS", "13", "Rust · TS · Python", p["tertiary"], False),
        ("PIN 03", "SYNCED AGENTS", "20+", "CloudLink Guardrail", hi_label, False),
        ("PIN 04", "FINISH SPEC", "ENIG", "Zero-503 Static SVG", p["secondary"], False),
    ]
    cols = [44, 236, 428, 620]
    pin_blocks: list[str] = []
    for idx, (pin_id, lbl, val, sub, val_col, is_pin1) in enumerate(metrics):
        cx = cols[idx]
        if idx > 0:
            pin_blocks.append(
                f'<line x1="{cx - 12}" y1="230" x2="{cx - 12}" y2="282" stroke="{p["borderSoft"]}" stroke-width="0.9" stroke-dasharray="3 3"/>'
            )
        # Authentic PCB pin header pad: square pad for PIN 01, circular plated pads for PIN 02..04
        if is_pin1:
            pad_svg = (
                f'<rect x="{cx}" y="233" width="11" height="11" rx="1.2" fill="{gold}"/>'
                f'<circle cx="{cx + 5.5}" cy="238.5" r="2.5" fill="{p["bg"]}"/>'
            )
        else:
            pad_svg = (
                f'<circle cx="{cx + 5.5}" cy="238.5" r="5.5" fill="{gold}"/>'
                f'<circle cx="{cx + 5.5}" cy="238.5" r="2.5" fill="{p["bg"]}"/>'
            )
        pin_blocks.append(
            f"{pad_svg}"
            f'<text x="{cx + 17}" y="241.5" font-family="{FONT_MONO}" font-size="8.5" font-weight="700" letter-spacing="0.5" fill="{p["sub"]}">{pin_id} · {lbl}</text>'
            f'<text x="{cx}" y="264" font-family="{FONT_MONO}" font-size="18" font-weight="700" fill="{val_col}">{val}</text>'
            f'<text x="{cx}" y="280" font-family="{FONT_SANS}" font-size="10" fill="{p["sub"]}">{escape(sub)}</text>'
        )

    # Handle pill contrast colors
    pill_bg = p["border"] if mode == "light" else p["surface"]
    pill_fg = p["accentFg"] if mode == "light" else p["accent"]
    pill_stroke = p["border"] if mode == "light" else p["accent"]

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Furina-he — Solder Mask PCB GitHub Profile">
  <title>Furina-he — Solder Mask PCB</title>
{pcb_grid_defs(uid, p, 16)}
  <style>
    @keyframes pulse_{uid} {{
      0% {{ stroke-dashoffset: 200; opacity: 0.25; }}
      40% {{ opacity: 0.95; }}
      100% {{ stroke-dashoffset: 0; opacity: 0.25; }}
    }}
    @keyframes led_{uid} {{
      0%, 100% {{ opacity: 1; }}
      50% {{ opacity: 0.45; }}
    }}
    .pcb-pulse-{uid} {{ animation: pulse_{uid} 5.4s linear infinite; }}
    .pcb-pulse-b-{uid} {{ animation: pulse_{uid} 4.2s linear infinite; }}
    .pcb-led-{uid} {{ animation: led_{uid} 3.2s ease-in-out infinite; }}
    @media (prefers-reduced-motion: reduce) {{
      .pcb-pulse-{uid}, .pcb-pulse-b-{uid}, .pcb-led-{uid} {{ animation: none !important; }}
    }}
  </style>

  <!-- FR-4 Solder Mask Substrate & Courtyard Frame -->
  <rect x="0.75" y="0.75" width="{w - 1.5}" height="{h - 1.5}" rx="5" fill="{p["bg"]}" stroke="{p["border"]}" stroke-width="1.5"/>
  <rect x="2" y="2" width="{w - 4}" height="{h - 4}" rx="4" fill="url(#pcb-grid-{uid})"/>
  <rect x="8.5" y="8.5" width="{w - 17}" height="{h - 17}" rx="3" fill="none" stroke="{p["borderSoft"]}" stroke-width="0.85"/>

  <!-- 45° Copper Trace Network & Animated ENIG Signal Pulses -->
  {static_traces}
  {pulse_traces}
  {vias}

  <!-- 4 ENIG Gold-Plated Corner Mounting Holes -->
  {mounting_hole(22, 22, p)}
  {mounting_hole(w - 22, 22, p)}
  {mounting_hole(22, h - 22, p)}
  {mounting_hole(w - 22, h - 22, p)}

  <!-- Top Silkscreen Revision Bar -->
  {via_pad(48, 24.5, p, 3.0)}
  <text x="58" y="28" font-family="{FONT_MONO}" font-size="9.5" font-weight="700" letter-spacing="0.9" fill="{hi_label}">REV 2.6 // PCB-846 · ENIG GOLD</text>
  <text x="366" y="28" font-family="{FONT_MONO}" font-size="9" letter-spacing="0.7" fill="{p["sub"]}">FR-4 · 1.6MM · 2OZ CU</text>
  <circle class="pcb-led-{uid}" cx="598" cy="24.5" r="3.2" fill="{p["secondary"]}"/>
  <text x="608" y="28" font-family="{FONT_MONO}" font-size="9.5" font-weight="700" letter-spacing="0.5" fill="{p["ink"]}">3V3 · CLOUDLINK.BLESSC.COM</text>
  <line x1="42" y1="40.5" x2="{w - 42}" y2="40.5" stroke="{p["borderSoft"]}" stroke-width="1"/>

  <!-- Left Silkscreen Identity Zone -->
  <text x="42" y="65" font-family="{FONT_MONO}" font-size="9.5" font-weight="700" letter-spacing="1.1" fill="{p["secondary"]}">U0 // SILKSCREEN IDENTITY · @FURINA-HE</text>
  <text x="42" y="115" font-family="{FONT_SANS}" font-size="45" font-weight="800" letter-spacing="-0.6" fill="{p["ink"]}">Furina-he<tspan fill="{gold}">.</tspan></text>

  <!-- NeverGiveUp Silkscreen Handle Pill & Role -->
  <rect x="42" y="128" width="114" height="20" rx="2" fill="{pill_bg}" stroke="{pill_stroke}" stroke-width="0.9"/>
  <text x="99" y="141.5" text-anchor="middle" font-family="{FONT_MONO}" font-size="10" font-weight="700" fill="{pill_fg}">NeverGiveUp</text>
  <text x="166" y="142" font-family="{FONT_SANS}" font-size="12.5" font-weight="600" fill="{p["sub"]}">Local-First AI Systems &amp; Hardware Craft</text>

  <text x="42" y="170" font-family="{FONT_SANS}" font-size="12.5" fill="{p["sub"]}">Deterministic agent guardrails, desktop AI companions, GitSkins &amp; 3D labs.</text>

  <!-- Silkscreen Bus Stack Box -->
  <rect x="42" y="184" width="496" height="24" rx="2" fill="{p["surface"]}" stroke="{p["borderSoft"]}" stroke-width="1"/>
  <rect x="42" y="184" width="4" height="24" rx="1" fill="{gold}"/>
  <text x="55" y="199.5" font-family="{FONT_MONO}" font-size="10" fill="{p["ink"]}"><tspan font-weight="700" fill="{hi_label}">BUS:</tspan> Rust · TypeScript · Python · Tauri v2 · Electron · Three.js</text>

  <!-- Right Side: QFP-32 Silicon IC Package (U1 · DEV-SOC) + SMD Passives -->
  {smd_resistor(562, 66, "R01", "10K", p)}
  {smd_capacitor(562, 184, "C02", "100nF", p)}
  {qfp_ic_package(ic_cx, ic_cy, p, mode)}
  {vcc_gnd}

  <!-- Bottom Pin-Header Metric Pads (PIN 01..04) -->
  <line x1="42" y1="221.5" x2="{w - 42}" y2="221.5" stroke="{p["border"]}" stroke-opacity="0.7" stroke-width="1"/>
  {via_pad(42, 221.5, p, 2.8)}
  {via_pad(w - 42, 221.5, p, 2.8)}
  {"".join(pin_blocks)}
</svg>"""


def build_button(label: str, primary: bool, mode: str, p: dict[str, str]) -> str:
    w = max(136, int(len(label) * 7.2) + 46)
    h = 30
    gold = p["highlight"] if mode == "light" else p["accent"]
    if primary:
        bg = p["border"] if mode == "light" else p["accent"]
        fg = p["accentFg"]
        stroke = p["border"] if mode == "light" else p["accent"]
        finger = p["highlight"] if mode == "light" else p["bg"]
        pad_ring = p["highlight"] if mode == "light" else p["bg"]
        pad_bore = bg
    else:
        bg = p["surface"]
        fg = p["ink"]
        stroke = p["border"] if mode == "light" else p["borderSoft"]
        finger = gold
        pad_ring = gold
        pad_bore = bg

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(label)}">
  <rect x="0.75" y="0.75" width="{w - 1.5}" height="{h - 1.5}" rx="3" fill="{bg}" stroke="{stroke}" stroke-width="1.2"/>
  <!-- Gold-finger edge connector contacts -->
  <rect x="3" y="5" width="7" height="4" rx="0.6" fill="{finger}"/>
  <rect x="3" y="13" width="7" height="4" rx="0.6" fill="{finger}"/>
  <rect x="3" y="21" width="7" height="4" rx="0.6" fill="{finger}"/>
  <line x1="13.5" y1="4" x2="13.5" y2="26" stroke="{stroke}" stroke-opacity="0.35" stroke-width="0.8"/>
  <!-- Left & right solder pad dots -->
  <circle cx="20" cy="15" r="2.7" fill="{pad_ring}"/>
  <circle cx="20" cy="15" r="1.1" fill="{pad_bore}"/>
  <text x="29" y="18.8" font-family="{FONT_MONO}" font-size="10.2" font-weight="700" fill="{fg}">{escape(label)}</text>
  <circle cx="{w - 11}" cy="15" r="2.5" fill="{pad_ring}"/>
  <circle cx="{w - 11}" cy="15" r="1.0" fill="{pad_bore}"/>
</svg>"""


def build_section(bus_code: str, title: str, right: str, mode: str, p: dict[str, str]) -> str:
    w, h = 846, 40
    gold = p["highlight"] if mode == "light" else p["accent"]
    badge_bg = p["border"] if mode == "light" else p["surface"]
    badge_fg = p["accentFg"] if mode == "light" else p["accent"]
    badge_stroke = p["border"] if mode == "light" else p["accent"]
    trace_col = p["border"] if mode == "light" else p["accent"]

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(bus_code)} // {escape(title)}">
  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" rx="3" fill="{p["bg"]}" stroke="{p["borderSoft"]}" stroke-width="1"/>
  <line x1="8" y1="4.5" x2="{w - 8}" y2="4.5" stroke="{p["borderSoft"]}" stroke-opacity="0.55" stroke-width="0.7"/>
  <line x1="8" y1="{h - 4.5}" x2="{w - 8}" y2="{h - 4.5}" stroke="{p["borderSoft"]}" stroke-opacity="0.55" stroke-width="0.7"/>

  <!-- Silkscreen Bus Badge -->
  <rect x="10" y="9" width="76" height="22" rx="2" fill="{badge_bg}" stroke="{badge_stroke}" stroke-width="1"/>
  <rect x="15" y="16" width="8" height="8" rx="1" fill="{gold}"/>
  <circle cx="19" cy="20" r="1.8" fill="{badge_bg}"/>
  <text x="29" y="23.5" font-family="{FONT_MONO}" font-size="10" font-weight="700" fill="{badge_fg}">{escape(bus_code)}</text>

  <!-- Section Silkscreen Title -->
  <text x="98" y="24" font-family="{FONT_MONO}" font-size="13" font-weight="700" letter-spacing="0.8" fill="{p["ink"]}"><tspan fill="{p["secondary"]}">//</tspan> {escape(title)}</text>

  <!-- Differential-Pair 45° Copper Trace Jogs with Gold Via Anchors -->
  <g fill="none" stroke="{trace_col}" stroke-opacity="0.55" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M 304 16 H 432 L 444 24 H 612"/>
    <path d="M 316 24 H 426 L 438 16 H 600"/>
  </g>
  {via_pad(304, 16, p, 3.1)}
  {via_pad(316, 24, p, 2.8)}
  {via_pad(600, 16, p, 2.8)}
  {via_pad(612, 24, p, 3.1)}

  <!-- Right Silkscreen Telemetry Tag -->
  <text x="{w - 14}" y="23.5" text-anchor="end" font-family="{FONT_MONO}" font-size="9.8" font-weight="700" letter-spacing="0.5" fill="{p["sub"]}">[ {escape(right)} ]</text>
</svg>"""


def build_card(
    idx: int,
    ref_des: str,
    pkg_code: str,
    tp_id: str,
    name: str,
    tag: str,
    link_label: str,
    d1: str,
    d2: str,
    stack: str,
    mode: str,
    p: dict[str, str],
) -> str:
    w, h = 417, 196
    gold = p["highlight"] if mode == "light" else p["accent"]
    gold_edge = p["accent"] if mode == "light" else "#B88924"
    # Guaranteed >= 4.5:1 text accent per card in both Light and Dark modes
    if mode == "light":
        text_cols = [p["secondary"], p["tertiary"], p["border"], p["secondary"]]
    else:
        text_cols = [p["accent"], p["secondary"], p["tertiary"], p["highlight"]]
    col = text_cols[idx % 4]

    # 6 left & 6 right IC lead pins
    lead_ys = [46, 66, 86, 106, 126, 146]
    leads: list[str] = []
    for ly in lead_ys:
        leads.append(
            f'<rect x="2" y="{ly}" width="12" height="6.5" rx="0.8" fill="{gold}" stroke="{gold_edge}" stroke-width="0.4"/>'
            f'<rect x="{w - 14}" y="{ly}" width="12" height="6.5" rx="0.8" fill="{gold}" stroke="{gold_edge}" stroke-width="0.4"/>'
        )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{escape(ref_des)} — {escape(name)}">
  <title>{escape(ref_des)} {escape(name)} — Solder Mask PCB Component Card</title>
  <!-- PCB Substrate Backdrop -->
  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" rx="4" fill="{p["bg"]}" stroke="{p["borderSoft"]}" stroke-width="1"/>

  <!-- Left & Right ENIG Gold IC Lead Pins -->
  <g aria-hidden="true">
    {"".join(leads)}
  </g>

  <!-- SMD/IC Component Courtyard Frame -->
  <rect x="14" y="8" width="{w - 28}" height="{h - 16}" rx="4" fill="{p["surface"]}" stroke="{p["border"]}" stroke-width="1.25"/>
  <rect x="18" y="12" width="{w - 36}" height="{h - 24}" rx="2.5" fill="none" stroke="{p["borderSoft"]}" stroke-width="0.75"/>

  <!-- Subtle 45° Copper Trace Watermark -->
  <g fill="none" stroke="{p["patternFg"]}" stroke-opacity="0.55" stroke-width="1.1" aria-hidden="true">
    <path d="M 326 146 L 348 124 H 386"/>
    <path d="M 342 146 L 358 130 H 386"/>
  </g>

  <!-- 4 Corner Gold Via Pads -->
  {via_pad(24, 18, p, 3.0, p["surface"])}
  {via_pad(w - 24, 18, p, 3.0, p["surface"])}
  {via_pad(24, h - 18, p, 3.0, p["surface"])}
  {via_pad(w - 24, h - 18, p, 3.0, p["surface"])}

  <!-- Top Component Designator & Pin-1 Dot -->
  <circle cx="38" cy="30" r="3.4" fill="{gold}"/>
  <text x="48" y="33.5" font-family="{FONT_MONO}" font-size="9.5" font-weight="700" letter-spacing="0.8" fill="{col}">{escape(ref_des)} · {escape(tag)}</text>
  <text x="{w - 36}" y="33.5" text-anchor="end" font-family="{FONT_MONO}" font-size="9" font-weight="600" fill="{p["sub"]}">{escape(link_label)}</text>
  <line x1="26" y1="43.5" x2="{w - 26}" y2="43.5" stroke="{p["borderSoft"]}" stroke-width="0.9"/>

  <!-- Package Title, Silkscreen Footprint Stamp & 2-Line Description -->
  <text x="30" y="76" font-family="{FONT_SANS}" font-size="22" font-weight="800" letter-spacing="-0.3" fill="{p["ink"]}">{escape(name)}</text>
  <rect x="{w - 122}" y="58" width="90" height="19" rx="2" fill="{p["bg"]}" stroke="{p["borderSoft"]}" stroke-width="0.9"/>
  <text x="{w - 77}" y="70.8" text-anchor="middle" font-family="{FONT_MONO}" font-size="8.5" font-weight="700" fill="{p["sub"]}">{escape(pkg_code)}</text>

  <text x="30" y="104" font-family="{FONT_SANS}" font-size="12.2" fill="{p["sub"]}">{escape(d1)}</text>
  <text x="30" y="124" font-family="{FONT_SANS}" font-size="12.2" fill="{p["sub"]}">{escape(d2)}</text>

  <!-- Bottom Test-Point Spec Bar -->
  <line x1="26" y1="146.5" x2="{w - 26}" y2="146.5" stroke="{p["borderSoft"]}" stroke-width="0.9" stroke-dasharray="3 3"/>
  <circle cx="34" cy="164.5" r="3.5" fill="{gold}"/>
  <circle cx="34" cy="164.5" r="1.5" fill="{p["surface"]}"/>
  <text x="43" y="167.8" font-family="{FONT_MONO}" font-size="8.8" font-weight="700" fill="{col}">{escape(tp_id)}</text>
  <text x="66" y="167.8" font-family="{FONT_MONO}" font-size="9.8" fill="{p["sub"]}">{escape(stack)}</text>
  <text x="{w - 36}" y="167.8" text-anchor="end" font-family="{FONT_MONO}" font-size="9.5" font-weight="700" fill="{col}">PROBE ↗</text>
</svg>"""


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    buttons = [
        ("cloudlink", "J1 · cloudlink.blessc.com", True),
        ("openpet", "J2 · openpet.myfurina.top", False),
        ("release", "J3 · CloudLink v0.6.0", False),
        ("github", "J4 · @Furina-he", False),
    ]
    cards = [
        (
            "cloudlink",
            "U1",
            "SOIC-12 · v0.6",
            "TP1",
            "CloudLink",
            "GUARDRAIL",
            "cloudlink.blessc.com",
            "Local-first AI ops cockpit with zero-secret",
            "deterministic execution guardrails.",
            "Rust · Tauri v2 · TypeScript",
        ),
        (
            "openpet",
            "U2",
            "QFN-12 · MCP",
            "TP2",
            "OpenPet",
            "COMPANION",
            "openpet.myfurina.top",
            "Resident desktop AI partner with local",
            "memory, live emotions & open plugins.",
            "TypeScript · Electron · MCP",
        ),
        (
            "gitskins",
            "U3",
            "BGA-12 · SVG",
            "TP3",
            "GitSkins",
            "SKIN KIT",
            "gitskins.blessc.com",
            "Modular Light & Dark GitHub Profile & Repo",
            "SVG themes with zero-503 live widgets.",
            "TypeScript · Python · SVG",
        ),
        (
            "virtual",
            "U4",
            "DIP-12 · SPICE",
            "TP4",
            "Virtual",
            "CIRCUIT LAB",
            "Furina-he/virtual",
            "Offline 3D electronics workbench powered",
            "by Electron, Three.js & ngspice solver.",
            "TypeScript · Three.js · ngspice",
        ),
    ]
    count = 0
    for mode, pal in PALETTES.items():
        files = {
            f"hero-{mode}.svg": build_hero(mode, pal),
            f"sec-work-{mode}.svg": build_section("BUS 01", "IC MODULES", "04 SMD PACKAGES · 2OZ CU", mode, pal),
            f"sec-activity-{mode}.svg": build_section("BUS 02", "CLOCK & COMMITS", "CLK 24H · @FURINA-HE", mode, pal),
        }
        for bid, lbl, prim in buttons:
            files[f"btn-{bid}-{mode}.svg"] = build_button(lbl, prim, mode, pal)
        for idx, (cid, ref_des, pkg_code, tp_id, name, tag, link_lbl, d1, d2, stk) in enumerate(cards):
            files[f"card-{cid}-{mode}.svg"] = build_card(
                idx, ref_des, pkg_code, tp_id, name, tag, link_lbl, d1, d2, stk, mode, pal
            )
        for fname, svg in files.items():
            ET.fromstring(svg)
            (OUT_DIR / fname).write_text(svg, encoding="utf-8", newline="\n")
            count += 1
    print(f"[pcb-solder-mask] Generated and XML-validated {count} SVGs")


if __name__ == "__main__":
    main()
