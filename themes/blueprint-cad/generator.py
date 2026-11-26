#!/usr/bin/env python3
"""Generate the Architectural Blueprint CAD SVG suite for GitSkins."""

from __future__ import annotations

from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"

FONT_SANS = (
    '"Inter Tight", -apple-system, BlinkMacSystemFont, "Segoe UI", '
    '"Noto Sans CJK SC", Arial, sans-serif'
)
FONT_MONO = (
    '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace'
)

THEMES = {
    "light": {
        "bg": "#F4F7FB",
        "panel": "#FFFFFF",
        "grid_minor": "#E3ECF6",
        "grid_major": "#C6D8ED",
        "line": "#0E2A4D",
        "line_soft": "#94B3D8",
        "text": "#0C2340",
        "text_sub": "#2C4C74",
        "text_muted": "#567499",
        "accent": "#1D5BB8",
        "cyan": "#0284C7",
        "teal": "#0F766E",
        "amber": "#B45309",
        "tag_bg": "#0E2A4D",
        "tag_fg": "#F4F7FB",
        "btn_pri_bg": "#0E2A4D",
        "btn_pri_fg": "#F4F7FB",
        "btn_sec_bg": "#FFFFFF",
        "schematic_bg": "#EDF3FA",
    },
    "dark": {
        "bg": "#0A1E38",
        "panel": "#0D2442",
        "grid_minor": "#112D52",
        "grid_major": "#1B4272",
        "line": "#5EA8F0",
        "line_soft": "#28558A",
        "text": "#ECF5FF",
        "text_sub": "#B3D4F7",
        "text_muted": "#72A2D4",
        "accent": "#38BDF8",
        "cyan": "#38BDF8",
        "teal": "#2DD4BF",
        "amber": "#FBBF24",
        "tag_bg": "#38BDF8",
        "tag_fg": "#07162A",
        "btn_pri_bg": "#38BDF8",
        "btn_pri_fg": "#07162A",
        "btn_sec_bg": "#0D2442",
        "schematic_bg": "#07162B",
    },
}


def grid_defs(uid: str, minor: str, major: str) -> str:
    return f"""  <defs>
    <pattern id="gmin-{uid}" width="12" height="12" patternUnits="userSpaceOnUse">
      <path d="M 12 0 L 0 0 0 12" fill="none" stroke="{minor}" stroke-width="0.6"/>
    </pattern>
    <pattern id="gmaj-{uid}" width="48" height="48" patternUnits="userSpaceOnUse">
      <rect width="48" height="48" fill="url(#gmin-{uid})"/>
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="{major}" stroke-width="0.9"/>
    </pattern>
  </defs>"""


def crosshair(cx: int, cy: int, color: str, r: int = 4) -> str:
    return (
        f'<g stroke="{color}" stroke-width="0.9" fill="none">'
        f'<circle cx="{cx}" cy="{cy}" r="{r}"/>'
        f'<line x1="{cx - r - 3}" y1="{cy}" x2="{cx + r + 3}" y2="{cy}"/>'
        f'<line x1="{cx}" y1="{cy - r - 3}" x2="{cx}" y2="{cy + r + 3}"/>'
        f"</g>"
    )


def build_hero(mode: str) -> str:
    t = THEMES[mode]
    uid = f"hero-{mode}"
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="846" height="300" viewBox="0 0 846 300" role="img" aria-label="Furina-he — Architectural Blueprint CAD Profile">
  <title>Furina-he — Architectural Blueprint CAD Profile</title>
{grid_defs(uid, t["grid_minor"], t["grid_major"])}
  <style>
    @keyframes cadSweep {{
      from {{ transform: rotate(0deg); }}
      to {{ transform: rotate(360deg); }}
    }}
    .cad-orbit {{
      transform-origin: 706px 136px;
      animation: cadSweep 24s linear infinite;
    }}
    @media (prefers-reduced-motion: reduce) {{
      .cad-orbit {{ animation: none !important; }}
    }}
  </style>

  <!-- Drafting Sheet Surface + Coordinate Grid -->
  <rect x="0.5" y="0.5" width="845" height="299" fill="{t["bg"]}"/>
  <rect x="1" y="1" width="844" height="298" fill="url(#gmaj-{uid})"/>

  <!-- Outer & Inner Architectural Margin Borders -->
  <rect x="0.5" y="0.5" width="845" height="299" fill="none" stroke="{t["line"]}" stroke-width="1.2"/>
  <rect x="10.5" y="10.5" width="825" height="279" fill="none" stroke="{t["line_soft"]}" stroke-width="0.9"/>

  <!-- Top Revision & Datum Bar -->
  <line x1="10.5" y1="36.5" x2="835.5" y2="36.5" stroke="{t["line"]}" stroke-width="1"/>
  <text x="36" y="27" font-family='{FONT_MONO}' font-size="10.5" font-weight="700" fill="{t["accent"]}">DWG NO. GH-FURINA-01</text>
  <text x="204" y="27" font-family='{FONT_MONO}' font-size="10" fill="{t["text_muted"]}">REV 2026.11  ·  SCALE 1:1  ·  PROJ: ORTHO</text>
  <rect x="670" y="19.5" width="6" height="6" fill="{t["teal"]}"/>
  <text x="682" y="26.5" font-family='{FONT_MONO}' font-size="10" font-weight="600" fill="{t["text"]}">cloudlink.blessc.com</text>

  <!-- Zone Ruler Ticks Along Top Margin -->
  <text x="150" y="9" font-family='{FONT_MONO}' font-size="7.5" fill="{t["text_muted"]}">A</text>
  <text x="360" y="9" font-family='{FONT_MONO}' font-size="7.5" fill="{t["text_muted"]}">B</text>
  <text x="570" y="9" font-family='{FONT_MONO}' font-size="7.5" fill="{t["text_muted"]}">C</text>
  <text x="740" y="9" font-family='{FONT_MONO}' font-size="7.5" fill="{t["text_muted"]}">D</text>

  <!-- Main Vertical Split & Title Block Rule -->
  <line x1="576.5" y1="36.5" x2="576.5" y2="232.5" stroke="{t["line_soft"]}" stroke-width="1" stroke-dasharray="4 3"/>
  <line x1="10.5" y1="232.5" x2="835.5" y2="232.5" stroke="{t["line"]}" stroke-width="1"/>

  <!-- Left Elevation: Dimensioned Developer Nameplate -->
  <text x="28" y="61" font-family='{FONT_MONO}' font-size="10.5" font-weight="600" letter-spacing="1.2" fill="{t["accent"]}">SPECIFICATION // DEVELOPER IDENTITY</text>

  <!-- Dimension Extension Line Above Name -->
  <g stroke="{t["line_soft"]}" stroke-width="0.8">
    <line x1="28" y1="73" x2="28" y2="85"/>
    <line x1="428" y1="73" x2="428" y2="85"/>
    <line x1="28" y1="78" x2="188" y2="78"/>
    <line x1="268" y1="78" x2="428" y2="78"/>
    <polygon points="28,78 34,75.5 34,80.5" fill="{t["line_soft"]}"/>
    <polygon points="428,78 422,75.5 422,80.5" fill="{t["line_soft"]}"/>
  </g>
  <text x="228" y="81.5" text-anchor="middle" font-family='{FONT_MONO}' font-size="9" fill="{t["text_muted"]}">400.0 mm</text>

  <!-- Blueprint Offset Shadow + Monumental Stencil Display Title -->
  <text x="30" y="136" font-family='{FONT_SANS}' font-size="52" font-weight="800" letter-spacing="3.5" fill="none" stroke="{t["line_soft"]}" stroke-width="0.9">FURINA-HE</text>
  <text x="27" y="133" font-family='{FONT_SANS}' font-size="52" font-weight="800" letter-spacing="3.5" fill="{t["text"]}">FURINA-HE</text>

  <text x="28" y="158" font-family='{FONT_SANS}' font-size="13.5" font-weight="600" fill="{t["text_sub"]}">AI Agent Guardrails · Desktop Companions · 3D Circuit Simulation</text>
  <text x="28" y="177" font-family='{FONT_MONO}' font-size="11" fill="{t["text_muted"]}">Rust · TypeScript · Tauri v2 · Electron · Java · Local-First Architecture</text>

  <!-- Chamfered Engineering Note Box -->
  <polygon points="28,191 542,191 552,201 552,220 28,220" fill="{t["panel"]}" stroke="{t["line"]}" stroke-width="1"/>
  <text x="39" y="209.5" font-family='{FONT_MONO}' font-size="11" fill="{t["text"]}"><tspan fill="{t["accent"]}" font-weight="700">NOTE 01:</tspan> building agent guardrails, AI pets, GitSkins &amp; 3D labs</text>

  <!-- Right Panel: Calibrated Reticle & Isometric Core Diagram -->
  <g transform="translate(0, 0)">
    <circle cx="706" cy="136" r="74" fill="none" stroke="{t["line_soft"]}" stroke-width="0.9"/>
    <circle cx="706" cy="136" r="56" fill="none" stroke="{t["line_soft"]}" stroke-width="0.8" stroke-dasharray="3 3"/>
    <circle cx="706" cy="136" r="34" fill="none" stroke="{t["accent"]}" stroke-width="0.9" stroke-opacity="0.7"/>
    <line x1="620" y1="136" x2="792" y2="136" stroke="{t["line_soft"]}" stroke-width="0.7" stroke-dasharray="4 3"/>
    <line x1="706" y1="52" x2="706" y2="220" stroke="{t["line_soft"]}" stroke-width="0.7" stroke-dasharray="4 3"/>

    <!-- Rotating Subtle Orbital Arc -->
    <g class="cad-orbit">
      <path d="M 706 62 A 74 74 0 0 1 766 92" fill="none" stroke="{t["accent"]}" stroke-width="2"/>
      <circle cx="766" cy="92" r="2.8" fill="{t["accent"]}"/>
    </g>

    <!-- Azimuth Degree Labels -->
    <text x="706" y="49" text-anchor="middle" font-family='{FONT_MONO}' font-size="8.5" fill="{t["text_muted"]}">000°</text>
    <text x="807" y="139" text-anchor="middle" font-family='{FONT_MONO}' font-size="8.5" fill="{t["text_muted"]}">090°</text>
    <text x="706" y="227" text-anchor="middle" font-family='{FONT_MONO}' font-size="8.5" fill="{t["text_muted"]}">180°</text>
    <text x="604" y="139" text-anchor="middle" font-family='{FONT_MONO}' font-size="8.5" fill="{t["text_muted"]}">270°</text>

    <!-- Isometric Wireframe Cube + Cyan Core -->
    <g stroke="{t["text"]}" stroke-width="1.3" fill="none" stroke-linejoin="round">
      <polygon points="706,96 742,116 742,156 706,176 670,156 670,116"/>
      <polyline points="670,116 706,136 742,116"/>
      <line x1="706" y1="136" x2="706" y2="176"/>
    </g>
    <g stroke="{t["accent"]}" stroke-width="1.1" fill="{t["accent"]}" fill-opacity="0.16">
      <polygon points="706,114 724,124 724,146 706,156 688,146 688,124"/>
    </g>
    <circle cx="706" cy="136" r="3.5" fill="{t["accent"]}"/>
    <text x="588" y="54" font-family='{FONT_MONO}' font-size="9" fill="{t["text_muted"]}">FIG 1.0 · ISO CORE</text>
  </g>

  <!-- Corner Registration Marks -->
  {crosshair(22, 22, t["line_soft"], 3)}
  {crosshair(824, 22, t["line_soft"], 3)}
  {crosshair(824, 220, t["line_soft"], 3)}

  <!-- Bottom 4-Column CAD Title Block -->
  <text x="26" y="251" font-family='{FONT_MONO}' font-size="9" fill="{t["text_muted"]}">AUTHOR // HANDLE</text>
  <text x="26" y="274" font-family='{FONT_SANS}' font-size="16" font-weight="800" fill="{t["text"]}">NeverGiveUp</text>

  <line x1="224.5" y1="232.5" x2="224.5" y2="289.5" stroke="{t["line_soft"]}" stroke-width="1"/>
  <text x="240" y="251" font-family='{FONT_MONO}' font-size="9" fill="{t["text_muted"]}">FLAGSHIP SYSTEMS</text>
  <text x="240" y="274" font-family='{FONT_MONO}' font-size="16" font-weight="700" fill="{t["accent"]}">04 <tspan font-size="11.5" font-weight="600" fill="{t["text_sub"]}">VERIFIED</tspan></text>

  <line x1="432.5" y1="232.5" x2="432.5" y2="289.5" stroke="{t["line_soft"]}" stroke-width="1"/>
  <text x="448" y="251" font-family='{FONT_MONO}' font-size="9" fill="{t["text_muted"]}">PUBLIC REPOSITORIES</text>
  <text x="448" y="274" font-family='{FONT_MONO}' font-size="16" font-weight="700" fill="{t["text"]}">13 <tspan font-size="11.5" font-weight="600" fill="{t["text_sub"]}">OSS REPOS</tspan></text>

  <line x1="636.5" y1="232.5" x2="636.5" y2="289.5" stroke="{t["line_soft"]}" stroke-width="1"/>
  <text x="652" y="251" font-family='{FONT_MONO}' font-size="9" fill="{t["text_muted"]}">SYNCED AI AGENTS</text>
  <text x="652" y="274" font-family='{FONT_MONO}' font-size="16" font-weight="700" fill="{t["teal"]}">20+ <tspan font-size="11.5" font-weight="600" fill="{t["text_sub"]}">MCP · SKILL</tspan></text>
</svg>
"""


def build_button(mode: str, idx: str, label: str, width: int, primary: bool = False) -> str:
    t = THEMES[mode]
    bg = t["btn_pri_bg"] if primary else t["btn_sec_bg"]
    fg = t["btn_pri_fg"] if primary else t["text"]
    idx_fg = t["btn_pri_fg"] if primary else t["accent"]
    stroke = t["accent"] if primary else t["line"]
    b = 8
    pts = f"0.5,0.5 {width - b - 0.5},0.5 {width - 0.5},{b + 0.5} {width - 0.5},31.5 0.5,31.5"
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="32" viewBox="0 0 {width} 32" role="img" aria-label="{idx} {label}">
  <polygon points="{pts}" fill="{bg}" stroke="{stroke}" stroke-width="1"/>
  <text x="12" y="20" font-family='{FONT_MONO}' font-size="11" font-weight="700" fill="{idx_fg}">[{idx}] <tspan font-weight="600" fill="{fg}">{label}</tspan></text>
  <text x="{width - 12}" y="20" text-anchor="end" font-family='{FONT_MONO}' font-size="11" fill="{idx_fg}">&#8599;</text>
</svg>
"""


def build_section(mode: str, sec_code: str, title: str, right_tag: str) -> str:
    t = THEMES[mode]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="846" height="34" viewBox="0 0 846 34" role="img" aria-label="{sec_code} {title}">
  <line x1="0" y1="6.5" x2="846" y2="6.5" stroke="{t["line_soft"]}" stroke-width="1" stroke-dasharray="5 3"/>
  <polygon points="6,15 11,20 6,25 1,20" fill="{t["accent"]}"/>
  <text x="18" y="24" font-family='{FONT_MONO}' font-size="11" font-weight="700" fill="{t["accent"]}">{sec_code}</text>
  <text x="98" y="24" font-family='{FONT_SANS}' font-size="13.5" font-weight="700" letter-spacing="0.4" fill="{t["text"]}">{title}</text>
  <text x="846" y="24" text-anchor="end" font-family='{FONT_MONO}' font-size="10.5" fill="{t["text_muted"]}">[{right_tag}]</text>
</svg>
"""


def schematic_svg(kind: str, t: dict[str, str]) -> str:
    """76x64 framed CAD schematic diagram at x=322, y=54."""
    c_line = t["text"]
    c_acc = t["accent"]
    c_soft = t["line_soft"]
    c_teal = t["teal"]
    if kind == "cloudlink":
        inner = (
            f'<rect x="334" y="66" width="28" height="28" rx="4" fill="none" stroke="{c_line}" stroke-width="1.5"/>'
            f'<circle cx="366" cy="96" r="15" fill="none" stroke="{c_line}" stroke-width="1.5"/>'
            f'<path d="M 351 94 A 15 15 0 0 1 362 81 L 362 94 Z" fill="{c_acc}" fill-opacity="0.85"/>'
            f'<line x1="330" y1="108" x2="390" y2="108" stroke="{c_soft}" stroke-width="0.8" stroke-dasharray="2 2"/>'
        )
    elif kind == "openpet":
        inner = (
            f'<rect x="334" y="66" width="52" height="34" fill="none" stroke="{c_line}" stroke-width="1.2"/>'
            f'<circle cx="360" cy="83" r="9" fill="none" stroke="{c_acc}" stroke-width="1.5"/>'
            f'<circle cx="357" cy="82" r="1.6" fill="{c_line}"/>'
            f'<circle cx="363" cy="82" r="1.6" fill="{c_line}"/>'
            f'<line x1="340" y1="108" x2="380" y2="108" stroke="{c_teal}" stroke-width="1.2"/>'
            f'<circle cx="340" cy="108" r="2.2" fill="{c_teal}"/>'
            f'<circle cx="360" cy="108" r="2.2" fill="{c_acc}"/>'
            f'<circle cx="380" cy="108" r="2.2" fill="{c_teal}"/>'
        )
    elif kind == "gitskins":
        inner = (
            f'<rect x="331" y="64" width="58" height="48" fill="none" stroke="{c_line}" stroke-width="1.2"/>'
            f'<rect x="336" y="69" width="32" height="16" fill="{c_acc}" fill-opacity="0.25" stroke="{c_acc}" stroke-width="1.1"/>'
            f'<rect x="372" y="69" width="12" height="16" fill="none" stroke="{c_soft}" stroke-width="1"/>'
            f'<rect x="336" y="90" width="22" height="17" fill="none" stroke="{c_teal}" stroke-width="1.2"/>'
            f'<rect x="362" y="90" width="22" height="17" fill="none" stroke="{c_line}" stroke-width="1.2"/>'
        )
    else:  # virtual
        inner = (
            f'<polyline points="329,84 338,84 342,76 347,92 352,76 357,92 361,84 371,84" fill="none" stroke="{c_acc}" stroke-width="1.5" stroke-linejoin="round"/>'
            f'<line x1="371" y1="74" x2="371" y2="94" stroke="{c_line}" stroke-width="1.5"/>'
            f'<line x1="377" y1="74" x2="377" y2="94" stroke="{c_line}" stroke-width="1.5"/>'
            f'<line x1="377" y1="84" x2="391" y2="84" stroke="{c_line}" stroke-width="1.2"/>'
            f'<line x1="354" y1="104" x2="366" y2="104" stroke="{c_teal}" stroke-width="1.4"/>'
            f'<line x1="357" y1="108" x2="363" y2="108" stroke="{c_teal}" stroke-width="1.4"/>'
            f'<line x1="360" y1="94" x2="360" y2="104" stroke="{c_teal}" stroke-width="1"/>'
        )
    return (
        f'<rect x="322" y="56" width="76" height="64" fill="{t["schematic_bg"]}" stroke="{t["line_soft"]}" stroke-width="0.9"/>'
        f"{inner}"
        f'<text x="360" y="131" text-anchor="middle" font-family=\'{FONT_MONO}\' font-size="8" fill="{t["text_muted"]}">SCHEMATIC</text>'
    )


def build_card(
    mode: str,
    *,
    dwg: str,
    pill_w: int,
    title: str,
    link_label: str,
    line1: str,
    line2: str,
    spec: str,
    kind: str,
) -> str:
    t = THEMES[mode]
    uid = f"c-{kind}-{mode}"
    b = 7
    pts = f"14,12 {14 + pill_w - b},12 {14 + pill_w},{12 + b} {14 + pill_w},32 14,32"
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="417" height="198" viewBox="0 0 417 198" role="img" aria-label="{dwg} {title}">
  <title>{dwg} {title}</title>
{grid_defs(uid, t["grid_minor"], t["grid_major"])}
  <rect x="0.5" y="0.5" width="416" height="197" fill="{t["bg"]}"/>
  <rect x="1" y="1" width="415" height="196" fill="url(#gmaj-{uid})"/>
  <rect x="0.5" y="0.5" width="416" height="197" fill="none" stroke="{t["line"]}" stroke-width="1.1"/>
  <rect x="6.5" y="6.5" width="404" height="185" fill="none" stroke="{t["line_soft"]}" stroke-width="0.7"/>

  <!-- Chamfered Drawing Tag & Right URL -->
  <polygon points="{pts}" fill="{t["tag_bg"]}"/>
  <text x="22" y="25.5" font-family='{FONT_MONO}' font-size="10" font-weight="700" fill="{t["tag_fg"]}">{dwg}</text>
  <text x="398" y="25.5" text-anchor="end" font-family='{FONT_MONO}' font-size="10.5" font-weight="600" fill="{t["text_sub"]}">{link_label} &#8599;</text>
  <line x1="14" y1="42.5" x2="402" y2="42.5" stroke="{t["line_soft"]}" stroke-width="0.9"/>

  <!-- Title & Two-Line Technical Summary -->
  <text x="18" y="74" font-family='{FONT_SANS}' font-size="21" font-weight="800" letter-spacing="-0.3" fill="{t["text"]}">{title}</text>
  <text x="18" y="100" font-family='{FONT_SANS}' font-size="12" fill="{t["text_sub"]}">{line1}</text>
  <text x="18" y="119" font-family='{FONT_SANS}' font-size="12" fill="{t["text_sub"]}">{line2}</text>

  <!-- Right Framed CAD Schematic -->
  {schematic_svg(kind, t)}

  <!-- Bottom BOM / Spec Strip -->
  <line x1="14" y1="156.5" x2="402" y2="156.5" stroke="{t["line_soft"]}" stroke-width="0.9" stroke-dasharray="3 3"/>
  <text x="18" y="176" font-family='{FONT_MONO}' font-size="10" fill="{t["text_muted"]}"><tspan fill="{t["accent"]}" font-weight="700">BOM:</tspan> {spec}</text>
  <text x="398" y="176" text-anchor="end" font-family='{FONT_MONO}' font-size="11.5" font-weight="700" fill="{t["accent"]}">&#8594;</text>
</svg>
"""


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    files: dict[str, str] = {}
    for mode in ("light", "dark"):
        files[f"hero-{mode}.svg"] = build_hero(mode)
        files[f"btn-cloudlink-{mode}.svg"] = build_button(mode, "01", "cloudlink.blessc.com", 194, primary=True)
        files[f"btn-openpet-{mode}.svg"] = build_button(mode, "02", "openpet.myfurina.top", 194)
        files[f"btn-release-{mode}.svg"] = build_button(mode, "03", "CloudLink v0.6.0", 170)
        files[f"btn-github-{mode}.svg"] = build_button(mode, "04", "@Furina-he", 136)
        files[f"sec-work-{mode}.svg"] = build_section(mode, "SEC. A-A", "SELECTED SYSTEMS &amp; MODULES", "04 UNITS · SCALE 1:1")
        files[f"sec-activity-{mode}.svg"] = build_section(mode, "SEC. B-B", "CONTRIBUTION TELEMETRY", "DAILY CRON · AUTO")

        files[f"card-cloudlink-{mode}.svg"] = build_card(
            mode,
            dwg="DWG-01 · AGENT GUARDRAIL",
            pill_w=172,
            title="CloudLink",
            link_label="cloudlink.blessc.com",
            line1="Local infra switchboard &amp; guardrail for",
            line2="AI agents — SSH/cloud Skill + approvals.",
            spec="Rust · Tauri v2 · React 19 · v0.6.0 · 10 ★",
            kind="cloudlink",
        )
        files[f"card-openpet-{mode}.svg"] = build_card(
            mode,
            dwg="DWG-02 · AI COMPANION",
            pill_w=156,
            title="OpenPet",
            link_label="openpet.myfurina.top",
            line1="Resident desktop AI partner with live",
            line2="emotions, memory wiki &amp; MCP plugins.",
            spec="TypeScript · Electron · Vue 3 · MCP · 2 ★",
            kind="openpet",
        )
        files[f"card-gitskins-{mode}.svg"] = build_card(
            mode,
            dwg="DWG-03 · PROFILE SKIN KIT",
            pill_w=172,
            title="GitSkins",
            link_label="gitskins.blessc.com",
            line1="Agent-ready Light &amp; Dark GitHub profile",
            line2="themes — copy one prompt to re-skin.",
            spec="TypeScript · React · Python · 132 SVGs · MIT",
            kind="gitskins",
        )
        files[f"card-virtual-{mode}.svg"] = build_card(
            mode,
            dwg="DWG-04 · 3D CIRCUIT LAB",
            pill_w=162,
            title="Virtual",
            link_label="Furina-he/virtual",
            line1="Offline 3D electronics lab built on",
            line2="Electron, Three.js &amp; ngspice solver.",
            spec="TypeScript · Electron · Three.js · ngspice",
            kind="virtual",
        )

    for fname, content in files.items():
        ET.fromstring(content)
        (ASSETS / fname).write_text(content, encoding="utf-8", newline="\n")
    print(f"[blueprint-cad] Generated and XML-validated {len(files)} SVGs")


if __name__ == "__main__":
    main()
