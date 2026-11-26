#!/usr/bin/env python3
"""Generate the Editorial Broadsheet Zine SVG suite for GitSkins."""

from __future__ import annotations

from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"

FONT_SERIF = 'Georgia, "Times New Roman", "Noto Serif CJK SC", serif'
FONT_SANS = (
    '"Inter Tight", -apple-system, BlinkMacSystemFont, "Segoe UI", '
    '"Noto Sans CJK SC", Arial, sans-serif'
)
FONT_MONO = (
    '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace'
)

THEMES = {
    "light": {
        "bg": "#F7F3EA",
        "card_bg": "#FBF8F1",
        "ink": "#141311",
        "sub": "#3B3832",
        "muted": "#726C62",
        "rule": "#141311",
        "rule_soft": "#D9D1C1",
        "accent": "#C93B2B",
        "plates": ["#C93B2B", "#1F4E79", "#2D6A4F", "#B07D2B"],
        "btn_pri_bg": "#141311",
        "btn_pri_fg": "#F7F3EA",
        "btn_sec_bg": "#FBF8F1",
    },
    "dark": {
        "bg": "#131210",
        "card_bg": "#191714",
        "ink": "#F0EBE1",
        "sub": "#C2BBB0",
        "muted": "#8A8377",
        "rule": "#4A453D",
        "rule_soft": "#2A2722",
        "accent": "#E45847",
        "plates": ["#E45847", "#6EA8E5", "#52B788", "#E3B25B"],
        "btn_pri_bg": "#F0EBE1",
        "btn_pri_fg": "#131210",
        "btn_sec_bg": "#191714",
    },
}


def build_hero(mode: str) -> str:
    t = THEMES[mode]
    ledger = [
        ("AUTHOR", "NeverGiveUp"),
        ("FLAGSHIPS", "04 Systems"),
        ("REPOSITORIES", "13 Public"),
        ("AGENTS SYNCED", "20+ via CloudLink"),
        ("PRIMARY STACK", "Rust · TS · Python"),
        ("DISPATCH", "cloudlink.blessc.com"),
    ]
    ledger_svg = []
    y0 = 96
    for idx, (k, v) in enumerate(ledger):
        y = y0 + idx * 30
        if idx > 0:
            ledger_svg.append(
                f'  <line x1="572" y1="{y - 18}" x2="818" y2="{y - 18}" stroke="{t["rule_soft"]}" stroke-width="0.9"/>'
            )
        ledger_svg.append(
            f'  <text x="572" y="{y}" font-family=\'{FONT_MONO}\' font-size="9.5" letter-spacing="0.6" fill="{t["muted"]}">{k}</text>'
        )
        ledger_svg.append(
            f'  <text x="818" y="{y}" text-anchor="end" font-family=\'{FONT_SERIF}\' font-size="12.5" font-weight="700" fill="{t["ink"]}">{v}</text>'
        )
    ledger_block = "\n".join(ledger_svg)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="846" height="302" viewBox="0 0 846 302" role="img" aria-label="Furina-he — Editorial Broadsheet Zine GitHub Profile">
  <title>Furina-he — Open-Source Monograph</title>

  <!-- Archival Paper / Obsidian Press Canvas -->
  <rect x="0.5" y="0.5" width="845" height="301" fill="{t["bg"]}" stroke="{t["rule_soft"]}" stroke-width="1"/>

  <!-- Classic Double-Rule Broadsheet Masthead -->
  <rect x="24" y="16" width="798" height="2.4" fill="{t["rule"]}"/>
  <line x1="24" y1="22.5" x2="822" y2="22.5" stroke="{t["rule"]}" stroke-width="0.8"/>

  <!-- Running Dateline -->
  <text x="24" y="40" font-family='{FONT_MONO}' font-size="9.5" letter-spacing="1.4" fill="{t["muted"]}">VOL. IV  ·  NO. 12</text>
  <text x="423" y="40" text-anchor="middle" font-family='{FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="2.2" fill="{t["ink"]}">OPEN-SOURCE MONOGRAPH</text>
  <text x="822" y="40" text-anchor="end" font-family='{FONT_MONO}' font-size="9.5" letter-spacing="1.4" fill="{t["muted"]}">EDITION 2026</text>
  <line x1="24" y1="49.5" x2="822" y2="49.5" stroke="{t["rule"]}" stroke-width="1"/>

  <!-- Vertical Editorial Column Rule -->
  <line x1="548.5" y1="60" x2="548.5" y2="274" stroke="{t["rule_soft"]}" stroke-width="1"/>

  <!-- Left Editorial Column: Serif Nameplate + Italic Deck + Manifesto -->
  <rect x="26" y="68" width="6" height="6" fill="{t["accent"]}"/>
  <text x="40" y="75" font-family='{FONT_MONO}' font-size="10" font-weight="600" letter-spacing="1.1" fill="{t["accent"]}">INDEPENDENT DEVELOPER  ·  LOCAL-FIRST SOFTWARE</text>

  <text x="24" y="138" font-family='{FONT_SERIF}' font-size="56" font-weight="700" letter-spacing="-1.2" fill="{t["ink"]}">Furina-he<tspan fill="{t["accent"]}">.</tspan></text>

  <text x="26" y="172" font-family='{FONT_SERIF}' font-size="15.5" font-style="italic" fill="{t["sub"]}">Crafting quiet local-first guardrails for AI coding agents,</text>
  <text x="26" y="194" font-family='{FONT_SERIF}' font-size="15.5" font-style="italic" fill="{t["sub"]}">resident desktop companions, and offline 3D circuit labs.</text>

  <line x1="26" y1="216.5" x2="518" y2="216.5" stroke="{t["rule_soft"]}" stroke-width="1"/>

  <text x="26" y="240" font-family='{FONT_SANS}' font-size="12" font-weight="600" fill="{t["ink"]}">AI Agent Guardrails  ·  Desktop Companions  ·  Interactive Simulation</text>
  <text x="26" y="261" font-family='{FONT_MONO}' font-size="10.5" fill="{t["muted"]}">“NeverGiveUp — practical open-source software owned by its user.”</text>

  <!-- Right Column: Colophon & Folio Index -->
  <text x="572" y="73" font-family='{FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="1.5" fill="{t["accent"]}">COLOPHON &amp; FOLIO</text>
  <line x1="572" y1="80.5" x2="818" y2="80.5" stroke="{t["rule"]}" stroke-width="1"/>
{ledger_block}

  <!-- Bottom Broadsheet Double Closing Rule -->
  <line x1="24" y1="281.5" x2="822" y2="281.5" stroke="{t["rule"]}" stroke-width="0.8"/>
  <rect x="24" y="285" width="798" height="2" fill="{t["rule"]}"/>
</svg>
"""


def build_button(mode: str, roman: str, label: str, width: int, primary: bool = False) -> str:
    t = THEMES[mode]
    bg = t["btn_pri_bg"] if primary else t["btn_sec_bg"]
    fg = t["btn_pri_fg"] if primary else t["ink"]
    num_c = t["accent"]
    stroke = t["rule"]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="30" viewBox="0 0 {width} 30" role="img" aria-label="{roman} {label}">
  <rect x="0.5" y="0.5" width="{width - 1}" height="29" fill="{bg}" stroke="{stroke}" stroke-width="1"/>
  <text x="12" y="19" font-family='{FONT_SERIF}' font-size="11.5" font-weight="700" font-style="italic" fill="{num_c}">{roman} <tspan font-family='{FONT_MONO}' font-style="normal" font-size="11" font-weight="600" fill="{fg}">{label}</tspan></text>
  <text x="{width - 11}" y="19" text-anchor="end" font-family='{FONT_MONO}' font-size="11" fill="{num_c if primary else t['muted']}">&#8599;</text>
</svg>
"""


def build_section(mode: str, roman: str, title: str, right_note: str) -> str:
    t = THEMES[mode]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="846" height="36" viewBox="0 0 846 36" role="img" aria-label="{roman} {title}">
  <line x1="0" y1="4.5" x2="846" y2="4.5" stroke="{t["rule"]}" stroke-width="1.4"/>
  <line x1="0" y1="8" x2="846" y2="8" stroke="{t["rule_soft"]}" stroke-width="0.8"/>
  <text x="0" y="28" font-family='{FONT_MONO}' font-size="10.5" font-weight="700" letter-spacing="1.2" fill="{t["accent"]}">{roman}</text>
  <text x="86" y="28" font-family='{FONT_SERIF}' font-size="16" font-weight="700" fill="{t["ink"]}">{title}</text>
  <text x="846" y="28" text-anchor="end" font-family='{FONT_SERIF}' font-size="12" font-style="italic" fill="{t["muted"]}">{right_note}</text>
</svg>
"""


def colophon_mark(idx: int, color: str, ink: str) -> str:
    """Minimal geometric editorial colophon seal at x=366..398, y=18..50."""
    if idx == 0:
        return (
            f'<rect x="372" y="22" width="14" height="14" fill="none" stroke="{ink}" stroke-width="1.3"/>'
            f'<circle cx="388" cy="36" r="8" fill="none" stroke="{color}" stroke-width="1.4"/>'
        )
    if idx == 1:
        return (
            f'<circle cx="384" cy="32" r="11" fill="none" stroke="{ink}" stroke-width="1.2"/>'
            f'<circle cx="380" cy="31" r="1.5" fill="{color}"/>'
            f'<circle cx="388" cy="31" r="1.5" fill="{color}"/>'
            f'<path d="M381 36 Q384 39 387 36" fill="none" stroke="{ink}" stroke-width="1.2"/>'
        )
    if idx == 2:
        return (
            f'<rect x="372" y="21" width="24" height="22" fill="none" stroke="{ink}" stroke-width="1.2"/>'
            f'<rect x="375" y="24" width="11" height="7" fill="{color}"/>'
            f'<rect x="375" y="34" width="7" height="6" fill="none" stroke="{ink}" stroke-width="1"/>'
            f'<rect x="385" y="34" width="8" height="6" fill="none" stroke="{color}" stroke-width="1"/>'
        )
    return (
        f'<polygon points="384,20 396,32 384,44 372,32" fill="none" stroke="{ink}" stroke-width="1.2"/>'
        f'<polyline points="376,32 381,27 387,37 392,32" fill="none" stroke="{color}" stroke-width="1.4"/>'
    )


def build_card(
    mode: str,
    *,
    plate_idx: int,
    plate_label: str,
    category: str,
    title: str,
    link_label: str,
    line1: str,
    line2: str,
    spec: str,
) -> str:
    t = THEMES[mode]
    accent = t["plates"][plate_idx]
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="417" height="196" viewBox="0 0 417 196" role="img" aria-label="{plate_label} — {title}">
  <title>{plate_label} — {title}</title>
  <rect x="0.5" y="0.5" width="416" height="195" fill="{t["card_bg"]}" stroke="{t["rule_soft"]}" stroke-width="1"/>
  <rect x="0.5" y="0.5" width="416" height="3.5" fill="{accent}"/>

  <!-- Plate Index & Editorial Category -->
  <text x="20" y="30" font-family='{FONT_MONO}' font-size="10" font-weight="700" letter-spacing="1.1" fill="{accent}">{plate_label}</text>
  <text x="86" y="30" font-family='{FONT_MONO}' font-size="9.5" letter-spacing="0.8" fill="{t["muted"]}">/  {category}</text>
  {colophon_mark(plate_idx, accent, t["ink"])}

  <line x1="20" y1="50.5" x2="397" y2="50.5" stroke="{t["rule_soft"]}" stroke-width="0.9"/>

  <!-- Serif Title & Italic Folio URL -->
  <text x="20" y="82" font-family='{FONT_SERIF}' font-size="22" font-weight="700" letter-spacing="-0.3" fill="{t["ink"]}">{title}</text>
  <text x="397" y="80" text-anchor="end" font-family='{FONT_SERIF}' font-size="11.5" font-style="italic" fill="{t["sub"]}">{link_label} &#8599;</text>

  <!-- Crisp Two-Line Editorial Copy -->
  <text x="20" y="110" font-family='{FONT_SANS}' font-size="12.5" fill="{t["sub"]}">{line1}</text>
  <text x="20" y="129" font-family='{FONT_SANS}' font-size="12.5" fill="{t["sub"]}">{line2}</text>

  <!-- Hairline Footnote Colophon -->
  <line x1="20" y1="156.5" x2="397" y2="156.5" stroke="{t["rule_soft"]}" stroke-width="0.9"/>
  <rect x="20" y="170" width="5" height="5" fill="{accent}"/>
  <text x="32" y="176.5" font-family='{FONT_MONO}' font-size="10" fill="{t["muted"]}">{spec}</text>
  <text x="397" y="176.5" text-anchor="end" font-family='{FONT_SERIF}' font-size="13" font-weight="700" fill="{t["ink"]}">&#8594;</text>
</svg>
"""


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    files: dict[str, str] = {}
    for mode in ("light", "dark"):
        files[f"hero-{mode}.svg"] = build_hero(mode)
        files[f"btn-cloudlink-{mode}.svg"] = build_button(mode, "I.", "cloudlink.blessc.com", 176, primary=True)
        files[f"btn-openpet-{mode}.svg"] = build_button(mode, "II.", "openpet.myfurina.top", 180)
        files[f"btn-release-{mode}.svg"] = build_button(mode, "III.", "CloudLink v0.6.0", 162)
        files[f"btn-github-{mode}.svg"] = build_button(mode, "IV.", "@Furina-he", 126)
        files[f"sec-work-{mode}.svg"] = build_section(mode, "SECTION I.", "Selected Works &amp; Systems", "Plates I — IV")
        files[f"sec-activity-{mode}.svg"] = build_section(mode, "SECTION II.", "Contribution Chronicle", "Updated Daily")

        files[f"card-cloudlink-{mode}.svg"] = build_card(
            mode,
            plate_idx=0,
            plate_label="PLATE I",
            category="AGENT GUARDRAIL",
            title="CloudLink",
            link_label="cloudlink.blessc.com",
            line1="Local infrastructure switchboard &amp; command guardrail for",
            line2="AI coding agents — unified SSH/cloud Skill + approvals.",
            spec="Rust · Tauri v2 · React 19 · v0.6.0 · 10 ★ · MIT",
        )
        files[f"card-openpet-{mode}.svg"] = build_card(
            mode,
            plate_idx=1,
            plate_label="PLATE II",
            category="AI COMPANION",
            title="OpenPet",
            link_label="openpet.myfurina.top",
            line1="Resident desktop AI character partner with live emotions,",
            line2="Obsidian-ready memory wiki, MCP tools &amp; plugin packs.",
            spec="TypeScript · Electron · Vue 3 · MCP · 2 ★ · MIT",
        )
        files[f"card-gitskins-{mode}.svg"] = build_card(
            mode,
            plate_idx=2,
            plate_label="PLATE III",
            category="PROFILE THEMES",
            title="GitSkins",
            link_label="gitskins.blessc.com",
            line1="Curated Light &amp; Dark GitHub profile SVG themes for AI",
            line2="coding agents — copy one zero-config prompt to re-skin.",
            spec="TypeScript · React · Python · 88 SVGs · MIT",
        )
        files[f"card-virtual-{mode}.svg"] = build_card(
            mode,
            plate_idx=3,
            plate_label="PLATE IV",
            category="3D CIRCUIT LAB",
            title="Virtual",
            link_label="Furina-he/virtual",
            line1="Offline 3D electrical &amp; electronics virtual lab built with",
            line2="Electron, Three.js and real ngspice circuit simulation.",
            spec="TypeScript · Electron · Three.js · ngspice",
        )

    for fname, content in files.items():
        ET.fromstring(content)
        (ASSETS / fname).write_text(content, encoding="utf-8", newline="\n")
    print(f"[editorial-zine] Generated and XML-validated {len(files)} SVGs")


if __name__ == "__main__":
    main()
