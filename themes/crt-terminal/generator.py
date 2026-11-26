#!/usr/bin/env python3
"""Generate the Retro CRT Terminal TUI SVG suite for GitSkins."""

from __future__ import annotations

from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"

FONT_MONO = (
    '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace'
)
FONT_SANS = (
    '"Inter Tight", -apple-system, BlinkMacSystemFont, "Segoe UI", '
    '"Noto Sans CJK SC", Arial, sans-serif'
)

THEMES = {
    "light": {
        "bg": "#F7F5EE",
        "chrome": "#EAE5D8",
        "pane": "#FCFBF7",
        "border": "#C5BFAF",
        "border_soft": "#DDD8CA",
        "text": "#182026",
        "sub": "#44515C",
        "muted": "#6E7B85",
        "green": "#0E7C5B",
        "cyan": "#0274A6",
        "blue": "#1D5FD6",
        "amber": "#B45309",
        "magenta": "#A21CAF",
        "red": "#DC2626",
        "status_bg": "#E3DED0",
        "pill_bg": "#0E7C5B",
        "pill_fg": "#FFFFFF",
        "scan_opacity": "0.02",
        "scan_color": "#000000",
        "ansi": ["#182026", "#DC2626", "#0E7C5B", "#B45309", "#1D5FD6", "#A21CAF", "#0274A6", "#6E7B85"],
    },
    "dark": {
        "bg": "#0A0F12",
        "chrome": "#11181E",
        "pane": "#0E151A",
        "border": "#22313D",
        "border_soft": "#19242D",
        "text": "#E6F1F5",
        "sub": "#A8BDC9",
        "muted": "#647B8A",
        "green": "#34D399",
        "cyan": "#38BDF8",
        "blue": "#60A5FA",
        "amber": "#FBBF24",
        "magenta": "#F472B6",
        "red": "#F87171",
        "status_bg": "#111A21",
        "pill_bg": "#34D399",
        "pill_fg": "#071412",
        "scan_opacity": "0.05",
        "scan_color": "#FFFFFF",
        "ansi": ["#1F2D38", "#F87171", "#34D399", "#FBBF24", "#60A5FA", "#F472B6", "#38BDF8", "#E6F1F5"],
    },
}

# Crisp 22x14 pixel terminal sigil ("F-H" geometric terminal emblem)
SIGIL_GRID = [
    "######################",
    "#....................#",
    "#.######....##....##.#",
    "#.######....##....##.#",
    ".##.........##....##..",
    ".#####..##..########..",
    ".#####..##..########..",
    ".##.........##....##..",
    ".##.........##....##..",
    "###.........##....##..",
    "#....................#",
    "#..CCCC..GGGG..AAAA..#",
    "#....................#",
    "######################",
]


def sigil_svg(ox: float, oy: float, px: float, t: dict[str, str]) -> str:
    pal = {"#": t["cyan"], "C": t["cyan"], "G": t["green"], "A": t["amber"]}
    by_c: dict[str, list[str]] = {}
    for r, row in enumerate(SIGIL_GRID):
        c = 0
        while c < len(row):
            ch = row[c]
            if ch in pal:
                s = c
                while c < len(row) and row[c] == ch:
                    c += 1
                rx = ox + s * px
                ry = oy + r * px
                rw = (c - s) * px
                by_c.setdefault(pal[ch], []).append(
                    f"M{rx:.1f} {ry:.1f}h{rw:.1f}v{px:.1f}h-{rw:.1f}z"
                )
            else:
                c += 1
    return (
        '<g shape-rendering="crispEdges">'
        + "".join(f'<path fill="{col}" d="{"".join(d)}"/>' for col, d in by_c.items())
        + "</g>"
    )


def build_hero(mode: str) -> str:
    t = THEMES[mode]
    uid = f"scan-{mode}"
    rows = [
        ("role", "Indie Developer · Local-First Builder"),
        ("focus", "AI Agent Guardrails · AI Pets · 3D Labs"),
        ("stack", "Rust · TypeScript · Tauri · Electron · Java"),
        ("flagship", "04 systems (CloudLink, OpenPet, Virtual, CarView)"),
        ("repos", "12 public repos · 20+ synced agents via CloudLink"),
        ("sites", "cloudlink.blessc.com · openpet.myfurina.top"),
    ]
    neo_lines = []
    for i, (k, v) in enumerate(rows):
        y = 104 + i * 22
        neo_lines.append(
            f'  <text x="316" y="{y}" font-family=\'{FONT_MONO}\' font-size="11.5" font-weight="700" fill="{t["cyan"]}">{k:<9}</text>'
            f'<text x="394" y="{y}" font-family=\'{FONT_MONO}\' font-size="11.5" fill="{t["muted"]}">:</text>'
            f'<text x="408" y="{y}" font-family=\'{FONT_MONO}\' font-size="11.5" fill="{t["text"]}">{v}</text>'
        )
    neo_block = "\n".join(neo_lines)

    ansi_swatches = "".join(
        f'<rect x="{316 + i * 24}" y="242" width="20" height="11" fill="{c}" shape-rendering="crispEdges"/>'
        for i, c in enumerate(t["ansi"])
    )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="846" height="306" viewBox="0 0 846 306" role="img" aria-label="Furina-he — Retro CRT Terminal TUI Profile">
  <title>furina-he@github: ~/profile</title>
  <defs>
    <pattern id="{uid}" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="{t["scan_color"]}" fill-opacity="{t["scan_opacity"]}"/>
    </pattern>
  </defs>
  <style>
    @keyframes ttyBlink {{
      0%, 49% {{ opacity: 1; }}
      50%, 100% {{ opacity: 0.12; }}
    }}
    .tty-cursor {{ animation: ttyBlink 1.3s steps(1, end) infinite; }}
    @media (prefers-reduced-motion: reduce) {{
      .tty-cursor {{ animation: none !important; }}
    }}
  </style>

  <!-- Terminal Window Frame -->
  <rect x="0.5" y="0.5" width="845" height="305" fill="{t["bg"]}" stroke="{t["border"]}" stroke-width="1"/>
  <rect x="1" y="29" width="844" height="252" fill="url(#{uid})"/>

  <!-- Top TTY Title Bar -->
  <rect x="1" y="1" width="844" height="28" fill="{t["chrome"]}"/>
  <line x1="0.5" y1="29.5" x2="845.5" y2="29.5" stroke="{t["border"]}" stroke-width="1"/>
  <rect x="14" y="11" width="8" height="8" fill="{t["red"]}" shape-rendering="crispEdges"/>
  <rect x="28" y="11" width="8" height="8" fill="{t["amber"]}" shape-rendering="crispEdges"/>
  <rect x="42" y="11" width="8" height="8" fill="{t["green"]}" shape-rendering="crispEdges"/>
  <text x="423" y="19" text-anchor="middle" font-family='{FONT_MONO}' font-size="11" font-weight="600" fill="{t["sub"]}">furina-he@github: ~/profile — zsh</text>
  <text x="832" y="19" text-anchor="end" font-family='{FONT_MONO}' font-size="10.5" fill="{t["muted"]}">tmux 3.4</text>

  <!-- Split tmux Vertical Divider -->
  <line x1="296.5" y1="29.5" x2="296.5" y2="281.5" stroke="{t["border"]}" stroke-width="1"/>

  <!-- Left Pane: Pixel Terminal Sigil + $ whoami -->
  <text x="18" y="52" font-family='{FONT_MONO}' font-size="10.5" fill="{t["muted"]}">[pane 0: identity]</text>
  {sigil_svg(32.0, 68.0, 10.5, t)}

  <text x="20" y="236" font-family='{FONT_MONO}' font-size="11.5" fill="{t["green"]}">$ <tspan fill="{t["sub"]}">whoami</tspan></text>
  <text x="20" y="256" font-family='{FONT_MONO}' font-size="12" font-weight="700" fill="{t["text"]}">Furina-he <tspan font-weight="400" fill="{t["muted"]}">(NeverGiveUp)</tspan></text>
  <rect class="tty-cursor" x="179" y="245" width="7" height="13" fill="{t["green"]}" shape-rendering="crispEdges"/>

  <!-- Right Pane: neofetch Profile Readout -->
  <text x="316" y="52" font-family='{FONT_MONO}' font-size="10.5" fill="{t["muted"]}">[pane 1: neofetch --github]</text>
  <text x="316" y="75" font-family='{FONT_MONO}' font-size="14" font-weight="700" fill="{t["green"]}">furina-he<tspan fill="{t["muted"]}">@</tspan><tspan fill="{t["cyan"]}">github.com</tspan></text>
  <line x1="316" y1="84.5" x2="826" y2="84.5" stroke="{t["border"]}" stroke-width="1" stroke-dasharray="4 3"/>
{neo_block}
  {ansi_swatches}
  <text x="826" y="251" text-anchor="end" font-family='{FONT_MONO}' font-size="10" fill="{t["muted"]}">shell: zsh · os: win11/wsl2</text>

  <!-- Bottom tmux Status Bar -->
  <rect x="1" y="281" width="844" height="24" fill="{t["status_bg"]}"/>
  <line x1="0.5" y1="281.5" x2="845.5" y2="281.5" stroke="{t["border"]}" stroke-width="1"/>
  <rect x="1" y="281" width="74" height="24" fill="{t["pill_bg"]}"/>
  <text x="38" y="297" text-anchor="middle" font-family='{FONT_MONO}' font-size="10.5" font-weight="700" fill="{t["pill_fg"]}">NORMAL</text>
  <text x="88" y="297" font-family='{FONT_MONO}' font-size="10.5" fill="{t["text"]}"><tspan fill="{t["green"]}" font-weight="700">0:profile*</tspan>  <tspan fill="{t["sub"]}">1:cloudlink  2:openpet  3:virtual  4:carview</tspan></text>
  <text x="832" y="297" text-anchor="end" font-family='{FONT_MONO}' font-size="10.5" fill="{t["muted"]}">UTF-8 │ MIT │ 100%</text>
</svg>
"""


def build_button(mode: str, cmd: str, arg: str, width: int, primary: bool = False) -> str:
    t = THEMES[mode]
    bg = t["pill_bg"] if primary else t["pane"]
    prompt_c = t["pill_fg"] if primary else t["green"]
    cmd_c = t["pill_fg"] if primary else t["muted"]
    arg_c = t["pill_fg"] if primary else t["text"]
    stroke = t["green"] if primary else t["border"]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="30" viewBox="0 0 {width} 30" role="img" aria-label="{cmd} {arg}">
  <rect x="0.5" y="0.5" width="{width - 1}" height="29" fill="{bg}" stroke="{stroke}" stroke-width="1"/>
  <text x="11" y="19" font-family='{FONT_MONO}' font-size="11" font-weight="700" fill="{prompt_c}">$ <tspan font-weight="500" fill="{cmd_c}">{cmd} </tspan><tspan font-weight="700" fill="{arg_c}">{arg}</tspan></text>
  <text x="{width - 10}" y="19" text-anchor="end" font-family='{FONT_MONO}' font-size="11" fill="{prompt_c}">&#8599;</text>
</svg>
"""


def build_section(mode: str, cmd: str, right_note: str) -> str:
    t = THEMES[mode]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="846" height="34" viewBox="0 0 846 34" role="img" aria-label="{cmd}">
  <line x1="0" y1="6.5" x2="846" y2="6.5" stroke="{t["border"]}" stroke-width="1"/>
  <text x="0" y="25" font-family='{FONT_MONO}' font-size="12" font-weight="700" fill="{t["cyan"]}">~/furina-he <tspan fill="{t["green"]}">$</tspan> <tspan fill="{t["text"]}">{cmd}</tspan></text>
  <text x="846" y="25" text-anchor="end" font-family='{FONT_MONO}' font-size="10.5" fill="{t["muted"]}">[{right_note}]</text>
</svg>
"""


def build_card(
    mode: str,
    *,
    tab: str,
    status: str,
    accent_key: str,
    title: str,
    link_label: str,
    line1: str,
    line2: str,
    spec: str,
) -> str:
    t = THEMES[mode]
    acc = t[accent_key]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="417" height="194" viewBox="0 0 417 194" role="img" aria-label="{tab} — {title}">
  <title>{tab} — {title}</title>
  <rect x="0.5" y="0.5" width="416" height="193" fill="{t["pane"]}" stroke="{t["border"]}" stroke-width="1"/>

  <!-- Top tmux Pane Tab Header -->
  <rect x="1" y="1" width="415" height="28" fill="{t["chrome"]}"/>
  <line x1="0.5" y1="29.5" x2="416.5" y2="29.5" stroke="{t["border"]}" stroke-width="1"/>
  <rect x="1" y="1" width="4" height="28" fill="{acc}"/>
  <text x="14" y="19" font-family='{FONT_MONO}' font-size="11" font-weight="700" fill="{t["text"]}">{tab}</text>
  <text x="399" y="18.5" text-anchor="end" font-family='{FONT_MONO}' font-size="10" fill="{t["sub"]}"><tspan fill="{acc}">■</tspan> {status}</text>

  <!-- Pane Content -->
  <text x="18" y="60" font-family='{FONT_MONO}' font-size="18" font-weight="700" fill="{t["text"]}">{title}</text>
  <text x="399" y="58" text-anchor="end" font-family='{FONT_MONO}' font-size="10.5" fill="{acc}">{link_label} &#8599;</text>

  <text x="18" y="88" font-family='{FONT_MONO}' font-size="11" fill="{t["sub"]}"><tspan fill="{t["muted"]}">&gt;</tspan> {line1}</text>
  <text x="18" y="108" font-family='{FONT_MONO}' font-size="11" fill="{t["sub"]}"><tspan fill="{t["muted"]}">&gt;</tspan> {line2}</text>

  <!-- Terminal Spec & Bottom Prompt Line -->
  <line x1="18" y1="146.5" x2="399" y2="146.5" stroke="{t["border_soft"]}" stroke-width="1" stroke-dasharray="3 3"/>
  <rect x="18" y="162" width="7" height="7" fill="{acc}" shape-rendering="crispEdges"/>
  <text x="32" y="169.5" font-family='{FONT_MONO}' font-size="10.5" fill="{t["muted"]}">{spec}</text>
  <text x="399" y="169.5" text-anchor="end" font-family='{FONT_MONO}' font-size="11" font-weight="700" fill="{t["green"]}">&#8629;</text>
</svg>
"""


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    files: dict[str, str] = {}
    for mode in ("light", "dark"):
        files[f"hero-{mode}.svg"] = build_hero(mode)
        files[f"btn-cloudlink-{mode}.svg"] = build_button(mode, "open", "cloudlink.blessc.com", 200, primary=True)
        files[f"btn-openpet-{mode}.svg"] = build_button(mode, "open", "openpet.myfurina.top", 200)
        files[f"btn-release-{mode}.svg"] = build_button(mode, "gh", "release v0.6.0", 156)
        files[f"btn-github-{mode}.svg"] = build_button(mode, "gh", "browse @Furina-he", 172)
        files[f"sec-work-{mode}.svg"] = build_section(mode, "ls -la --flagship", "4 units · exit 0")
        files[f"sec-activity-{mode}.svg"] = build_section(mode, "git log --graph --daily", "cron 00:00 UTC")

        files[f"card-cloudlink-{mode}.svg"] = build_card(
            mode,
            tab="[1] cloudlink.rs",
            status="v0.6.0",
            accent_key="cyan",
            title="CloudLink",
            link_label="cloudlink.blessc.com",
            line1="Local infra switchboard &amp; guardrail for AI",
            line2="agents — unified SSH/cloud Skill + approvals.",
            spec="Rust · Tauri v2 · React 19 · 10 ★ · MIT",
        )
        files[f"card-openpet-{mode}.svg"] = build_card(
            mode,
            tab="[2] openpet.ts",
            status="active",
            accent_key="magenta",
            title="OpenPet",
            link_label="openpet.myfurina.top",
            line1="Resident desktop AI companion with emotions,",
            line2="Obsidian memory wiki, MCP tools &amp; plugins.",
            spec="TypeScript · Electron · Vue 3 · MCP · 2 ★",
        )
        files[f"card-virtual-{mode}.svg"] = build_card(
            mode,
            tab="[3] virtual.ts",
            status="ngspice",
            accent_key="green",
            title="Virtual",
            link_label="Furina-he/virtual",
            line1="Offline 3D electrical &amp; electronics virtual",
            line2="lab powered by Electron, Three.js &amp; ngspice.",
            spec="TypeScript · Electron · Three.js · ngspice",
        )
        files[f"card-carview-{mode}.svg"] = build_card(
            mode,
            tab="[4] carview.java",
            status="stream",
            accent_key="amber",
            title="CarView",
            link_label="Furina-he/carview",
            line1="Connected vehicle IoT monitoring pipeline:",
            line2="Kafka, Flink streaming, Spark &amp; Vue 3 UI.",
            spec="Java · Kafka · Flink · Spark · Vue 3",
        )

    for fname, content in files.items():
        ET.fromstring(content)
        (ASSETS / fname).write_text(content, encoding="utf-8", newline="\n")
    print(f"[crt-terminal] Generated and XML-validated {len(files)} SVGs")


if __name__ == "__main__":
    main()
