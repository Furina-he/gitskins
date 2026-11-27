#!/usr/bin/env python3
"""GitSkins Zero-503 Live Widgets Generator (Python 3.10+ stdlib only).

Generates Light & Dark theme-matched SVGs for GitHub Actions cron workflows:
  - github-stats    (2/3/4 cols x 160px) — GitHub metrics + proportional language bar
  - coding-rhythm   (2/3/4 cols x 160px) — 24h commit histogram + circadian persona
  - rss-feed        (2/3/4 cols x 160px) — Latest 3 RSS/Atom articles
  - live-weather    (1/2   cols x 160px) — Open-Meteo real-time pixel weather window
  - wakatime-weekly (2/3/4 cols x 160px) — WakaTime 7-day coding hours + language breakdown
  - spotify-recent  (2/3/4 cols x 160px) — Spotify Now Playing / recently played vinyl deck
  - contribution-snake (4 cols x 160px) — Theme-matched 53x7 GitHub contribution snake

Zero pip dependencies. Every SVG is strictly XML-validated before write.
"""

from __future__ import annotations

import argparse
import base64
from datetime import datetime, timedelta, timezone
import json
import math
import os
from pathlib import Path
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

FONT_SANS = (
    '"Inter Tight", -apple-system, BlinkMacSystemFont, "Segoe UI", '
    '"Noto Sans CJK SC", Arial, sans-serif'
)
FONT_MONO = (
    '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace'
)
FONT_SERIF = 'Georgia, "Times New Roman", "Noto Serif CJK SC", serif'

THEME_TOKENS: dict[str, dict[str, dict[str, str]]] = {
    "swiss-bauhaus-pixel": {
        "light": {
            "bg": "#FAF9F5", "surface": "#FFFFFF", "ink": "#0A0A0A", "sub": "#3F3F46",
            "muted": "#71717A", "border": "#0A0A0A", "borderSoft": "#D4D4D8",
            "accent": "#00A3CC", "accentFg": "#FFFFFF", "secondary": "#2370E8",
            "tertiary": "#2BA676", "highlight": "#F5B700", "patternBg": "#7CC4FA", "patternFg": "#4CA4EC",
        },
        "dark": {
            "bg": "#101115", "surface": "#16181F", "ink": "#F4F4F6", "sub": "#B4B6C2",
            "muted": "#7C8091", "border": "#2E313D", "borderSoft": "#232631",
            "accent": "#38BDF8", "accentFg": "#0A0A0A", "secondary": "#60A5FA",
            "tertiary": "#22C98A", "highlight": "#F5B700", "patternBg": "#14243A", "patternFg": "#1F3C63",
        },
    },
    "blueprint-cad": {
        "light": {
            "bg": "#F4F7FB", "surface": "#FFFFFF", "ink": "#0C2340", "sub": "#2C4C74",
            "muted": "#567499", "border": "#0E2A4D", "borderSoft": "#C6D8ED",
            "accent": "#1D5BB8", "accentFg": "#F4F7FB", "secondary": "#0284C7",
            "tertiary": "#0F766E", "highlight": "#B45309", "patternBg": "#EDF3FA", "patternFg": "#C6D8ED",
        },
        "dark": {
            "bg": "#0A1E38", "surface": "#0D2442", "ink": "#ECF5FF", "sub": "#B3D4F7",
            "muted": "#72A2D4", "border": "#5EA8F0", "borderSoft": "#1B4272",
            "accent": "#38BDF8", "accentFg": "#07162A", "secondary": "#60A5FA",
            "tertiary": "#2DD4BF", "highlight": "#FBBF24", "patternBg": "#07162B", "patternFg": "#1B4272",
        },
    },
    "editorial-zine": {
        "light": {
            "bg": "#F7F3EA", "surface": "#FBF8F1", "ink": "#141311", "sub": "#3B3832",
            "muted": "#726C62", "border": "#141311", "borderSoft": "#D9D1C1",
            "accent": "#C93B2B", "accentFg": "#F7F3EA", "secondary": "#1F4E79",
            "tertiary": "#2D6A4F", "highlight": "#B07D2B", "patternBg": "#F0EAE0", "patternFg": "#D9D1C1",
        },
        "dark": {
            "bg": "#131210", "surface": "#191714", "ink": "#F0EBE1", "sub": "#C2BBB0",
            "muted": "#8A8377", "border": "#4A453D", "borderSoft": "#2A2722",
            "accent": "#E45847", "accentFg": "#131210", "secondary": "#6EA8E5",
            "tertiary": "#52B788", "highlight": "#E3B25B", "patternBg": "#1E1B18", "patternFg": "#2A2722",
        },
    },
    "crt-terminal": {
        "light": {
            "bg": "#F7F5EE", "surface": "#FCFBF7", "ink": "#182026", "sub": "#44515C",
            "muted": "#6E7B85", "border": "#C5BFAF", "borderSoft": "#DDD8CA",
            "accent": "#0E7C5B", "accentFg": "#FFFFFF", "secondary": "#0274A6",
            "tertiary": "#1D5FD6", "highlight": "#B45309", "patternBg": "#EAE5D8", "patternFg": "#DDD8CA",
        },
        "dark": {
            "bg": "#0A0F12", "surface": "#0E151A", "ink": "#E6F1F5", "sub": "#A8BDC9",
            "muted": "#647B8A", "border": "#22313D", "borderSoft": "#19242D",
            "accent": "#34D399", "accentFg": "#071412", "secondary": "#38BDF8",
            "tertiary": "#60A5FA", "highlight": "#FBBF24", "patternBg": "#11181E", "patternFg": "#19242D",
        },
    },
    "pixel-rpg-hud": {
        "light": {
            "bg": "#F6F2E4", "surface": "#FFFDF6", "ink": "#1B1E2E", "sub": "#434963",
            "muted": "#6F7591", "border": "#1B1E2E", "borderSoft": "#D5CEBA",
            "accent": "#D97706", "accentFg": "#FFFFFF", "secondary": "#DC2626",
            "tertiary": "#15803D", "highlight": "#2563EB", "patternBg": "#EAE4D1", "patternFg": "#D9D1BA",
        },
        "dark": {
            "bg": "#121524", "surface": "#191E33", "ink": "#F6F4EA", "sub": "#B8C0DC",
            "muted": "#7F8AAD", "border": "#EAB308", "borderSoft": "#2F385C",
            "accent": "#FACC15", "accentFg": "#121524", "secondary": "#F87171",
            "tertiary": "#4ADE80", "highlight": "#38BDF8", "patternBg": "#1E2540", "patternFg": "#2B3457",
        },
    },
    "seal-ink-scroll": {
        "light": {
            "bg": "#F7F3EA", "surface": "#FCF9F2", "ink": "#1C1917", "sub": "#4E4740",
            "muted": "#847B70", "border": "#2B2622", "borderSoft": "#DED5C5",
            "accent": "#C4362C", "accentFg": "#FCF9F2", "secondary": "#2C5E5A",
            "tertiary": "#7C5C3B", "highlight": "#B5842A", "patternBg": "#EFE8DA", "patternFg": "#DCD2BF",
        },
        "dark": {
            "bg": "#141311", "surface": "#1B1916", "ink": "#F2ECE1", "sub": "#C2B9AA",
            "muted": "#8C8274", "border": "#D6CCB9", "borderSoft": "#35312A",
            "accent": "#E0564A", "accentFg": "#141311", "secondary": "#56A39B",
            "tertiary": "#C79C6D", "highlight": "#DFB35B", "patternBg": "#221F1B", "patternFg": "#322E28",
        },
    },
    "synth-hardware": {
        "light": {
            "bg": "#EFECE6", "surface": "#FAF8F4", "ink": "#141517", "sub": "#44474D",
            "muted": "#6E727A", "border": "#1C1E22", "borderSoft": "#CFCBC2",
            "accent": "#FF5200", "accentFg": "#FFFFFF", "secondary": "#0088CC",
            "tertiary": "#1E9E63", "highlight": "#D49B00", "patternBg": "#E3DFD6", "patternFg": "#B8B3A8",
        },
        "dark": {
            "bg": "#121316", "surface": "#1A1C21", "ink": "#F3F2EE", "sub": "#B5B8C0",
            "muted": "#7D818C", "border": "#363A44", "borderSoft": "#252830",
            "accent": "#FF6B2B", "accentFg": "#121316", "secondary": "#38BDF8",
            "tertiary": "#34D399", "highlight": "#FACC15", "patternBg": "#0D0E11", "patternFg": "#2A2E38",
        },
    },
    "pcb-solder-mask": {
        "light": {
            "bg": "#F5F5F2", "surface": "#FFFFFF", "ink": "#16211B", "sub": "#3D4F45",
            "muted": "#67786E", "border": "#1C4F38", "borderSoft": "#CBD6CF",
            "accent": "#B87D14", "accentFg": "#FFFFFF", "secondary": "#1C6B4A",
            "tertiary": "#0D7D8C", "highlight": "#D49B1A", "patternBg": "#EAECE8", "patternFg": "#C7D4CC",
        },
        "dark": {
            "bg": "#0B1F17", "surface": "#102B20", "ink": "#F2F7F4", "sub": "#B6D4C5",
            "muted": "#76A38E", "border": "#E5B84B", "borderSoft": "#1E4A38",
            "accent": "#E5B84B", "accentFg": "#0B1F17", "secondary": "#34D399",
            "tertiary": "#38BDF8", "highlight": "#F59E0B", "patternBg": "#081711", "patternFg": "#193D2E",
        },
    },
    "transit-boarding": {
        "light": {
            "bg": "#FAF6EE", "surface": "#FFFDF9", "ink": "#15171A", "sub": "#444952",
            "muted": "#727885", "border": "#181B20", "borderSoft": "#D8D0C2",
            "accent": "#D93829", "accentFg": "#FFFFFF", "secondary": "#1B56B5",
            "tertiary": "#168052", "highlight": "#C98212", "patternBg": "#EFE9DC", "patternFg": "#D4CCBC",
        },
        "dark": {
            "bg": "#111317", "surface": "#181B21", "ink": "#F4F1EA", "sub": "#B9B5AC",
            "muted": "#827F78", "border": "#363B46", "borderSoft": "#262A33",
            "accent": "#F59E0B", "accentFg": "#111317", "secondary": "#60A5FA",
            "tertiary": "#34D399", "highlight": "#FB7185", "patternBg": "#0D0F13", "patternFg": "#242830",
        },
    },
    "classic-desktop-os": {
        "light": {
            "bg": "#E6E5DF", "surface": "#FFFFFF", "ink": "#111111", "sub": "#3B3B3F",
            "muted": "#6B6B72", "border": "#111111", "borderSoft": "#B8B7B0",
            "accent": "#2455C8", "accentFg": "#FFFFFF", "secondary": "#C93B2B",
            "tertiary": "#1E824C", "highlight": "#C98A00", "patternBg": "#DCDAD2", "patternFg": "#9C9A92",
        },
        "dark": {
            "bg": "#17181D", "surface": "#202229", "ink": "#F1F1EE", "sub": "#BCBCC4",
            "muted": "#868792", "border": "#D8D8D2", "borderSoft": "#383B46",
            "accent": "#60A5FA", "accentFg": "#111318", "secondary": "#F87171",
            "tertiary": "#4ADE80", "highlight": "#FACC15", "patternBg": "#121318", "patternFg": "#2D303A",
        },
    },
    "riso-duotone": {
        "light": {
            "bg": "#F8F3E8", "surface": "#FDFBF5", "ink": "#17203B", "sub": "#3E4A6B",
            "muted": "#6D7896", "border": "#17203B", "borderSoft": "#D7CEBC",
            "accent": "#0066CC", "accentFg": "#FFFFFF", "secondary": "#FF4F5E",
            "tertiary": "#0E9472", "highlight": "#F59E0B", "patternBg": "#EFE8D8", "patternFg": "#C9D7EA",
        },
        "dark": {
            "bg": "#121318", "surface": "#1A1C24", "ink": "#F7F4EC", "sub": "#C2C5D3",
            "muted": "#878CA0", "border": "#383D4F", "borderSoft": "#272B38",
            "accent": "#22D3EE", "accentFg": "#0F1218", "secondary": "#FF5E7E",
            "tertiary": "#34D399", "highlight": "#F5B700", "patternBg": "#161822", "patternFg": "#263348",
        },
    },
}


def col_span_to_px(span: int) -> int:
    span = max(1, min(4, span))
    return span * 204 + (span - 1) * 10


def esc(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def estimate_px(text: str, font_size: float, mono: bool = False) -> float:
    units = 0.0
    for ch in text:
        code = ord(ch)
        if (0x2E80 <= code <= 0x9FFF) or (0xAC00 <= code <= 0xD7AF) or (0xFF00 <= code <= 0xFFEF):
            units += 1.85
        elif mono:
            units += 1.0
        elif ch in " .,:il!":
            units += 0.56
        elif "A" <= ch <= "Z":
            units += 1.12
        elif ch in "WMmw@":
            units += 1.25
        else:
            units += 0.92
    return units * font_size * (0.61 if mono else 0.56)


def fit_text(text: str, max_px: float, font_size: float, mono: bool = False) -> str:
    clean = re.sub(r"\s+", " ", text or "").strip()
    if not clean or estimate_px(clean, font_size, mono) <= max_px:
        return clean
    ell = "…"
    ell_px = estimate_px(ell, font_size, mono)
    out: list[str] = []
    acc = 0.0
    for ch in clean:
        w = estimate_px(ch, font_size, mono)
        if acc + w + ell_px > max_px:
            break
        out.append(ch)
        acc += w
    return "".join(out).rstrip() + ell


def hex_luminance(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    if len(h) != 6:
        return 0.5
    r, g, b = (int(h[i : i + 2], 16) / 255.0 for i in (0, 2, 4))
    lin = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def resolve_tokens(theme_id: str, mode: str, accent_override: str) -> dict[str, str]:
    base = dict(THEME_TOKENS.get(theme_id, THEME_TOKENS["swiss-bauhaus-pixel"])[mode])
    acc = (accent_override or "").strip()
    if re.match(r"^#[0-9A-Fa-f]{6}$", acc):
        base["accent"] = acc
        base["accentFg"] = "#0A0A0A" if hex_luminance(acc) > 0.42 else "#FFFFFF"
    return base


def chamfer(x: float, y: float, w: float, h: float, cut: float = 5) -> str:
    return f"{x + cut},{y} {x + w},{y} {x + w},{y + h - cut} {x + w - cut},{y + h} {x},{y + h} {x},{y + cut}"


def head_font(theme_id: str) -> str:
    if theme_id in ("editorial-zine", "seal-ink-scroll"):
        return FONT_SERIF
    if theme_id in ("crt-terminal", "pixel-rpg-hud", "pcb-solder-mask", "classic-desktop-os"):
        return FONT_MONO
    return FONT_SANS


def fmt_num(n: int) -> str:
    if n >= 1000:
        return f"{n / 1000:.1f}k"
    return str(n)


def render_theme_frame(
    uid: str, theme_id: str, mode: str, t: dict[str, str], w: int, h: int, tag: str, right_meta: str
) -> tuple[str, str, int, int]:
    safe_tag = esc(tag)
    safe_meta = esc(right_meta)
    if theme_id == "blueprint-cad":
        defs = f"""
    <pattern id="gmin-{uid}" width="12" height="12" patternUnits="userSpaceOnUse">
      <path d="M 12 0 L 0 0 0 12" fill="none" stroke="{t['borderSoft']}" stroke-opacity="{'0.45' if mode == 'dark' else '0.65'}" stroke-width="0.6"/>
    </pattern>
    <pattern id="gmaj-{uid}" width="48" height="48" patternUnits="userSpaceOnUse">
      <rect width="48" height="48" fill="url(#gmin-{uid})"/>
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="{t['borderSoft']}" stroke-opacity="{'0.75' if mode == 'dark' else '0.95'}" stroke-width="0.9"/>
    </pattern>"""
        tw = min(148, max(80, round(estimate_px(tag, 9.5, True) + 22)))
        cross = lambda cx, cy: (
            f'<g stroke="{t["border"]}" stroke-opacity="0.65" stroke-width="0.8" fill="none">'
            f'<circle cx="{cx}" cy="{cy}" r="3"/>'
            f'<line x1="{cx - 5.5}" y1="{cy}" x2="{cx + 5.5}" y2="{cy}"/>'
            f'<line x1="{cx}" y1="{cy - 5.5}" x2="{cx}" y2="{cy + 5.5}"/></g>'
        )
        chrome = f"""
  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" fill="{t['bg']}"/>
  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" fill="url(#gmaj-{uid})"/>
  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" fill="none" stroke="{t['border']}" stroke-width="1.2"/>
  <rect x="6.5" y="6.5" width="{w - 13}" height="{h - 13}" fill="none" stroke="{t['border']}" stroke-opacity="0.45" stroke-width="0.8"/>
  {cross(12, 12)}{cross(w - 12, 12)}{cross(12, h - 12)}{cross(w - 12, h - 12)}
  <polygon points="{chamfer(22, 12, tw, 18, 5)}" fill="{t['accent']}"/>
  <text x="{22 + tw / 2}" y="24" text-anchor="middle" font-family='{FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="0.6" fill="{t['accentFg']}">{safe_tag}</text>
  <text x="{w - 24}" y="24" text-anchor="end" font-family='{FONT_MONO}' font-size="9.5" fill="{t['muted']}">{safe_meta}</text>
  <line x1="16" y1="35.5" x2="{w - 16}" y2="35.5" stroke="{t['borderSoft']}" stroke-dasharray="3 3" stroke-width="0.9"/>"""
        return defs, chrome, 42, 20

    if theme_id == "editorial-zine":
        chrome = f"""
  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" fill="{t['bg']}" stroke="{t['borderSoft']}" stroke-width="1"/>
  <rect x="16" y="11" width="{w - 32}" height="2" fill="{t['border']}"/>
  <line x1="16" y1="16" x2="{w - 16}" y2="16" stroke="{t['border']}" stroke-width="0.7"/>
  <rect x="16" y="23" width="6" height="6" fill="{t['accent']}"/>
  <text x="28" y="29" font-family='{FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="1.1" fill="{t['accent']}">{safe_tag}</text>
  <text x="{w - 16}" y="29" text-anchor="end" font-family='{FONT_MONO}' font-size="9.5" fill="{t['muted']}">{safe_meta}</text>
  <line x1="16" y1="36.5" x2="{w - 16}" y2="36.5" stroke="{t['borderSoft']}" stroke-width="0.9"/>
  <line x1="16" y1="{h - 11.5}" x2="{w - 16}" y2="{h - 11.5}" stroke="{t['borderSoft']}" stroke-width="0.8"/>"""
        return "", chrome, 43, 18

    if theme_id == "crt-terminal":
        defs = f"""
    <pattern id="scan-{uid}" width="4" height="4" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="4" y2="0" stroke="{'#FFFFFF' if mode == 'dark' else '#000000'}" stroke-opacity="{'0.045' if mode == 'dark' else '0.02'}" stroke-width="1"/>
    </pattern>"""
        chrome = f"""
  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" fill="{t['bg']}" stroke="{t['border']}" stroke-width="1"/>
  <rect x="1" y="1" width="{w - 2}" height="24" fill="{t['patternBg']}"/>
  <line x1="1" y1="25.5" x2="{w - 1}" y2="25.5" stroke="{t['border']}" stroke-width="1"/>
  <circle cx="14" cy="13" r="3.2" fill="{t['highlight']}"/>
  <circle cx="25" cy="13" r="3.2" fill="{t['secondary']}"/>
  <circle cx="36" cy="13" r="3.2" fill="{t['accent']}"/>
  <text x="49" y="16.5" font-family='{FONT_MONO}' font-size="10" font-weight="700" fill="{t['ink']}">[{safe_tag.lower()}]</text>
  <text x="{w - 14}" y="16.5" text-anchor="end" font-family='{FONT_MONO}' font-size="9.5" fill="{t['muted']}">{safe_meta}</text>
  <rect x="1" y="26" width="{w - 2}" height="{h - 27}" fill="url(#scan-{uid})"/>"""
        return defs, chrome, 35, 16

    if theme_id == "pixel-rpg-hud":
        chrome = f"""
  <rect x="2" y="2" width="{w - 4}" height="{h - 4}" fill="{t['bg']}" stroke="{t['border']}" stroke-width="2" shape-rendering="crispEdges"/>
  <rect x="6" y="6" width="{w - 12}" height="{h - 12}" fill="none" stroke="{t['borderSoft']}" stroke-width="1" shape-rendering="crispEdges"/>
  <rect x="0" y="0" width="5" height="5" fill="{t['border']}" shape-rendering="crispEdges"/>
  <rect x="{w - 5}" y="0" width="5" height="5" fill="{t['border']}" shape-rendering="crispEdges"/>
  <rect x="0" y="{h - 5}" width="5" height="5" fill="{t['border']}" shape-rendering="crispEdges"/>
  <rect x="{w - 5}" y="{h - 5}" width="5" height="5" fill="{t['border']}" shape-rendering="crispEdges"/>
  <rect x="7" y="7" width="{w - 14}" height="22" fill="{t['patternBg']}"/>
  <line x1="6" y1="29.5" x2="{w - 6}" y2="29.5" stroke="{t['border']}" stroke-width="1.2"/>
  <rect x="15" y="15" width="6" height="6" fill="{t['accent']}" shape-rendering="crispEdges"/>
  <text x="27" y="21.5" font-family='{FONT_MONO}' font-size="9.5" font-weight="700" fill="{t['ink']}">{safe_tag}</text>
  <text x="{w - 16}" y="21.5" text-anchor="end" font-family='{FONT_MONO}' font-size="9" font-weight="700" fill="{t['accent']}">{safe_meta}</text>"""
        return "", chrome, 36, 18

    if theme_id == "seal-ink-scroll":
        chrome = f"""
  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" fill="{t['bg']}" stroke="{t['borderSoft']}" stroke-width="1"/>
  <rect x="6.5" y="6.5" width="{w - 13}" height="{h - 13}" fill="none" stroke="{t['border']}" stroke-opacity="0.7" stroke-width="0.9"/>
  <path d="M 10 20 L 10 10 L 20 10" fill="none" stroke="{t['accent']}" stroke-width="1.2"/>
  <path d="M {w - 20} 10 L {w - 10} 10 L {w - 10} 20" fill="none" stroke="{t['accent']}" stroke-width="1.2"/>
  <path d="M 10 {h - 20} L 10 {h - 10} L 20 {h - 10}" fill="none" stroke="{t['accent']}" stroke-width="1.2"/>
  <path d="M {w - 20} {h - 10} L {w - 10} {h - 10} L {w - 10} {h - 20}" fill="none" stroke="{t['accent']}" stroke-width="1.2"/>
  <rect x="18" y="16" width="11" height="11" rx="1" fill="{t['accent']}"/>
  <rect x="20.5" y="18.5" width="6" height="6" fill="none" stroke="{t['accentFg']}" stroke-width="0.9"/>
  <text x="36" y="25" font-family='{FONT_MONO}' font-size="9.2" font-weight="700" letter-spacing="0.9" fill="{t['ink']}">{safe_tag}</text>
  <text x="{w - 18}" y="25" text-anchor="end" font-family='{FONT_MONO}' font-size="9.2" fill="{t['muted']}">{safe_meta}</text>
  <line x1="16" y1="32.5" x2="{w - 16}" y2="32.5" stroke="{t['borderSoft']}" stroke-width="0.9"/>"""
        return "", chrome, 38, 18

    if theme_id == "synth-hardware":
        screw = lambda cx, cy: (
            f'<g><circle cx="{cx}" cy="{cy}" r="3" fill="{t["patternBg"]}" stroke="{t["border"]}" stroke-width="0.8"/>'
            f'<line x1="{cx - 1.8}" y1="{cy}" x2="{cx + 1.8}" y2="{cy}" stroke="{t["muted"]}" stroke-width="0.7"/></g>'
        )
        chrome = f"""
  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" rx="3" fill="{t['bg']}" stroke="{t['border']}" stroke-width="1.2"/>
  <rect x="5" y="5" width="{w - 10}" height="22" fill="{t['patternBg']}" stroke="{t['borderSoft']}" stroke-width="0.8"/>
  {screw(12, 16)}{screw(w - 12, 16)}{screw(12, h - 10)}{screw(w - 12, h - 10)}
  <circle cx="24" cy="16" r="3" fill="{t['accent']}"/>
  <circle cx="33" cy="16" r="2.2" fill="{t['secondary']}"/>
  <text x="42" y="19.5" font-family='{FONT_MONO}' font-size="9.2" font-weight="700" letter-spacing="0.6" fill="{t['ink']}">{safe_tag}</text>
  <text x="{w - 22}" y="19.5" text-anchor="end" font-family='{FONT_MONO}' font-size="9" fill="{t['muted']}">{safe_meta}</text>"""
        return "", chrome, 34, 18

    if theme_id == "pcb-solder-mask":
        via = lambda cx, cy: f'<g><circle cx="{cx}" cy="{cy}" r="3.6" fill="{t["accent"]}"/><circle cx="{cx}" cy="{cy}" r="1.5" fill="{t["bg"]}"/></g>'
        chrome = f"""
  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" fill="{t['bg']}" stroke="{t['border']}" stroke-width="1.3"/>
  <rect x="6" y="6" width="{w - 12}" height="{h - 12}" fill="none" stroke="{t['borderSoft']}" stroke-width="0.8"/>
  <path d="M 16 28 L 32 28 L 40 20 L {w - 20} 20" fill="none" stroke="{t['borderSoft']}" stroke-opacity="0.7" stroke-width="0.9"/>
  {via(12, 12)}{via(w - 12, 12)}{via(12, h - 12)}{via(w - 12, h - 12)}
  <rect x="24" y="12" width="6" height="6" fill="{t['accent']}" shape-rendering="crispEdges"/>
  <text x="35" y="18.5" font-family='{FONT_MONO}' font-size="9.2" font-weight="700" fill="{t['ink']}">{safe_tag}</text>
  <text x="{w - 24}" y="18.5" text-anchor="end" font-family='{FONT_MONO}' font-size="9" fill="{t['accent']}">{safe_meta}</text>
  <line x1="16" y1="30.5" x2="{w - 16}" y2="30.5" stroke="{t['borderSoft']}" stroke-width="0.9"/>"""
        return "", chrome, 36, 18

    if theme_id == "transit-boarding":
        chrome = f"""
  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" fill="{t['bg']}" stroke="{t['border']}" stroke-width="1.1"/>
  <rect x="1" y="1" width="{w - 2}" height="24" fill="{t['accent']}"/>
  <circle cx="14" cy="13" r="4" fill="none" stroke="{t['accentFg']}" stroke-width="1.4"/>
  <text x="25" y="16.5" font-family='{FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="0.8" fill="{t['accentFg']}">{safe_tag}</text>
  <text x="{w - 14}" y="16.5" text-anchor="end" font-family='{FONT_MONO}' font-size="9" font-weight="700" fill="{t['accentFg']}" fill-opacity="0.9">{safe_meta}</text>
  <line x1="14" y1="{h - 10.5}" x2="{w - 14}" y2="{h - 10.5}" stroke="{t['borderSoft']}" stroke-dasharray="3 3" stroke-width="0.9"/>"""
        return "", chrome, 33, 16

    if theme_id == "classic-desktop-os":
        stripes = "".join(f'<line x1="26" y1="{sy}" x2="{w - 14}" y2="{sy}" stroke="{t["borderSoft"]}" stroke-width="0.9"/>' for sy in (7, 10, 13, 16, 19))
        tw = min(160, max(70, round(estimate_px(tag, 9.2, True) + 16)))
        chrome = f"""
  <rect x="2.5" y="2.5" width="{w - 3}" height="{h - 3}" fill="{t['border']}" fill-opacity="0.18"/>
  <rect x="0.5" y="0.5" width="{w - 3}" height="{h - 3}" fill="{t['surface']}" stroke="{t['border']}" stroke-width="1.2"/>
  <rect x="1" y="1" width="{w - 4}" height="23" fill="{t['bg']}"/>
  {stripes}
  <rect x="8" y="6" width="12" height="12" fill="{t['surface']}" stroke="{t['border']}" stroke-width="1"/>
  <rect x="{round(w / 2 - tw / 2)}" y="4" width="{tw}" height="17" fill="{t['bg']}"/>
  <text x="{round(w / 2)}" y="15.5" text-anchor="middle" font-family='{FONT_MONO}' font-size="9.2" font-weight="700" fill="{t['ink']}">{safe_tag}</text>
  <line x1="0.5" y1="24.5" x2="{w - 2.5}" y2="24.5" stroke="{t['border']}" stroke-width="1.1"/>
  <text x="{w - 14}" y="15.5" text-anchor="end" font-family='{FONT_MONO}' font-size="8.4" fill="{t['muted']}">{esc(fit_text(right_meta, 78, 8.4, True))}</text>"""
        return "", chrome, 33, 16

    if theme_id == "riso-duotone":
        defs = f"""
    <pattern id="riso-{uid}" width="6" height="6" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="0.85" fill="{t['patternFg']}" fill-opacity="{'0.4' if mode == 'dark' else '0.65'}"/>
    </pattern>"""
        reg = lambda cx, cy: (
            f'<g stroke="{t["secondary"]}" stroke-width="0.8" fill="none"><circle cx="{cx}" cy="{cy}" r="2.6"/>'
            f'<line x1="{cx - 4.5}" y1="{cy}" x2="{cx + 4.5}" y2="{cy}"/><line x1="{cx}" y1="{cy - 4.5}" x2="{cx}" y2="{cy + 4.5}"/></g>'
        )
        chrome = f"""
  <rect x="2.5" y="2.5" width="{w - 3}" height="{h - 3}" fill="{t['secondary']}" fill-opacity="0.22"/>
  <rect x="0.5" y="0.5" width="{w - 3}" height="{h - 3}" fill="{t['bg']}" stroke="{t['border']}" stroke-width="1.2"/>
  <rect x="1" y="1" width="{w - 4}" height="24" fill="url(#riso-{uid})"/>
  <line x1="0.5" y1="25.5" x2="{w - 2.5}" y2="25.5" stroke="{t['border']}" stroke-width="1"/>
  {reg(13, 13)}
  <text x="25" y="16.5" font-family='{FONT_MONO}' font-size="9.5" font-weight="700" fill="{t['accent']}">{safe_tag}</text>
  <text x="{w - 14}" y="16.5" text-anchor="end" font-family='{FONT_MONO}' font-size="9" fill="{t['secondary']}">{safe_meta}</text>"""
        return defs, chrome, 34, 16

    chrome = f"""
  <rect x="0.5" y="0.5" width="{w - 1}" height="{h - 1}" fill="{t['bg']}" stroke="{t['border']}" stroke-width="1"/>
  <rect x="1" y="1" width="{w - 2}" height="26" fill="{t['surface']}"/>
  <line x1="0.5" y1="27.5" x2="{w - 0.5}" y2="27.5" stroke="{t['border']}" stroke-width="1"/>
  <rect x="14" y="11" width="6" height="6" fill="{t['accent']}" shape-rendering="crispEdges"/>
  <text x="27" y="18" font-family='{FONT_MONO}' font-size="10" font-weight="700" fill="{t['ink']}">({safe_tag.lower()})</text>
  <text x="{w - 14}" y="18" text-anchor="end" font-family='{FONT_MONO}' font-size="9.5" fill="{t['muted']}">{safe_meta}</text>"""
    return "", chrome, 36, 16


# ---------------------------------------------------------------------------
# Live Data Fetchers (stdlib urllib, graceful offline fallback)
# ---------------------------------------------------------------------------
def http_get_json(url: str, headers: dict[str, str] | None = None, timeout: int = 12) -> object:
    req_headers = {"User-Agent": "GitSkins-LiveWidgets/0.4"}
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url, headers=req_headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_github_stats(username: str, token: str, demo: bool) -> dict:
    if demo or not username:
        return {
            "username": username or "Furina-he",
            "stars": 148,
            "repos": 16,
            "followers": 52,
            "prs": 38,
            "langs": [("Rust", 42), ("TypeScript", 31), ("Python", 19), ("Shell", 8)],
        }
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        user = http_get_json(f"https://api.github.com/users/{urllib.parse.quote(username)}", headers)
        repos = http_get_json(
            f"https://api.github.com/users/{urllib.parse.quote(username)}/repos?per_page=100&sort=updated",
            headers,
        )
        prs_total = 0
        try:
            pr_res = http_get_json(
                f"https://api.github.com/search/issues?q=author:{urllib.parse.quote(username)}+type:pr&per_page=1",
                headers,
            )
            prs_total = int(pr_res.get("total_count", 0)) if isinstance(pr_res, dict) else 0
        except Exception:
            prs_total = 0

        stars = sum(int(r.get("stargazers_count", 0)) for r in repos if isinstance(r, dict))
        lang_weights: dict[str, int] = {}
        for r in repos:
            if not isinstance(r, dict) or r.get("fork"):
                continue
            lang = r.get("language")
            if lang:
                lang_weights[lang] = lang_weights.get(lang, 0) + max(1, int(r.get("size", 1)))
        total_w = sum(lang_weights.values()) or 1
        top = sorted(lang_weights.items(), key=lambda kv: kv[1], reverse=True)[:4]
        langs = [(k, max(1, round(v * 100 / total_w))) for k, v in top] or [("Code", 100)]
        return {
            "username": user.get("login", username),
            "stars": stars,
            "repos": int(user.get("public_repos", len(repos))),
            "followers": int(user.get("followers", 0)),
            "prs": prs_total,
            "langs": langs,
        }
    except Exception as exc:
        print(f"[warn] github-stats fetch failed ({exc}), using fallback", file=sys.stderr)
        return fetch_github_stats(username, "", True)


def fetch_coding_rhythm(username: str, tz_offset: int, token: str, demo: bool) -> dict:
    if demo or not username:
        hours = [5, 3, 1, 0, 0, 1, 2, 4, 8, 12, 14, 11, 9, 13, 15, 12, 10, 8, 11, 16, 19, 22, 17, 10]
    else:
        headers = {"Accept": "application/vnd.github+json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        hours = [0] * 24
        try:
            events = http_get_json(
                f"https://api.github.com/users/{urllib.parse.quote(username)}/events/public?per_page=100",
                headers,
            )
            tz = timezone(timedelta(hours=tz_offset))
            for ev in events if isinstance(events, list) else []:
                ts = ev.get("created_at") if isinstance(ev, dict) else None
                if not ts:
                    continue
                dt = datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(tz)
                hours[dt.hour] += 1
        except Exception as exc:
            print(f"[warn] coding-rhythm fetch failed ({exc}), using fallback", file=sys.stderr)
            return fetch_coding_rhythm(username, tz_offset, "", True)

    total = sum(hours) or 1
    morning = round(sum(hours[6:12]) * 100 / total)
    afternoon = round(sum(hours[12:18]) * 100 / total)
    evening = round(sum(hours[18:24]) * 100 / total)
    night = max(0, 100 - morning - afternoon - evening)
    peak_hr = max(range(24), key=lambda i: hours[i])
    if 5 <= peak_hr < 12:
        persona = "EARLY BIRD"
    elif 12 <= peak_hr < 18:
        persona = "DAY BUILDER"
    elif 18 <= peak_hr < 22:
        persona = "EVENING CODER"
    else:
        persona = "NIGHT OWL"
    return {
        "hours": hours,
        "periods": [("06-12", morning), ("12-18", afternoon), ("18-24", evening), ("00-06", night)],
        "peak": f"{peak_hr:02d}:00",
        "persona": persona,
        "tz": f"UTC{'+' if tz_offset >= 0 else ''}{tz_offset}",
    }


def fetch_rss_feed(rss_url: str, demo: bool) -> dict:
    if demo or not rss_url:
        return {
            "source": "gitskins.blessc.com",
            "items": [
                ("Designing Deterministic SVG Themes for AI Agents", "11-26"),
                ("Zero-503 GitHub Profile Widgets via GitHub Actions", "11-22"),
                ("4-Column 846px Bento Grids Without Wrap Glitches", "11-18"),
            ],
        }
    try:
        req = urllib.request.Request(rss_url, headers={"User-Agent": "GitSkins-LiveWidgets/0.4"})
        with urllib.request.urlopen(req, timeout=12) as resp:
            xml_text = resp.read().decode("utf-8", errors="replace")
        root = ET.fromstring(xml_text)
        strip_ns = lambda tag: tag.split("}")[-1].lower()
        entries: list[tuple[str, str]] = []
        for elem in root.iter():
            tag = strip_ns(elem.tag)
            if tag in ("item", "entry"):
                title = ""
                date_raw = ""
                for child in elem:
                    ctag = strip_ns(child.tag)
                    if ctag == "title" and child.text:
                        title = re.sub(r"<[^>]+>", "", child.text).strip()
                    elif ctag in ("pubdate", "published", "updated", "date") and child.text:
                        date_raw = child.text.strip()
                if title:
                    m_iso = re.search(r"(\d{4})-(\d{2})-(\d{2})", date_raw)
                    m_rfc = re.search(r"(\d{1,2})\s+([A-Za-z]{3})", date_raw)
                    if m_iso:
                        date_str = f"{m_iso.group(2)}-{m_iso.group(3)}"
                    elif m_rfc:
                        date_str = f"{m_rfc.group(2)} {m_rfc.group(1).zfill(2)}"
                    else:
                        date_str = "NEW"
                    entries.append((title, date_str))
            if len(entries) >= 3:
                break
        host = urllib.parse.urlparse(rss_url).netloc or "RSS FEED"
        if not entries:
            raise ValueError("No RSS/Atom entries found")
        return {"source": host, "items": entries[:3]}
    except Exception as exc:
        print(f"[warn] rss-feed fetch failed ({exc}), using fallback", file=sys.stderr)
        return fetch_rss_feed("", True)


def map_wmo_code(code: int) -> tuple[str, str]:
    if code in (0, 1):
        return "sunny", "CLEAR SKY"
    if code in (2, 3, 45, 48):
        return "cloudy", "CLOUDY"
    if code in (71, 73, 75, 77, 85, 86):
        return "snow", "SNOWFALL"
    if code >= 95:
        return "rain", "STORM"
    return "rain", "RAINY"


def fetch_live_weather(city: str, unit: str, demo: bool) -> dict:
    clean_city = (city or "Shanghai").strip()
    u = "F" if (unit or "C").upper() == "F" else "C"
    if demo:
        return {
            "city": clean_city,
            "temp": f"{66 if u == 'F' else 19}°{u}",
            "kind": "rain",
            "label": "LIGHT RAIN",
            "humidity": "74%",
            "wind": "12 km/h",
        }
    try:
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(clean_city)}&count=1&format=json"
        geo = http_get_json(geo_url)
        results = geo.get("results") if isinstance(geo, dict) else None
        if not results:
            raise ValueError(f"City not found: {clean_city}")
        loc = results[0]
        lat, lon = loc["latitude"], loc["longitude"]
        temp_unit = "fahrenheit" if u == "F" else "celsius"
        wx_url = (
            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit={temp_unit}"
        )
        wx = http_get_json(wx_url)
        cur = wx["current"]
        kind, label = map_wmo_code(int(cur.get("weather_code", 0)))
        return {
            "city": loc.get("name", clean_city),
            "temp": f"{round(float(cur['temperature_2m']))}°{u}",
            "kind": kind,
            "label": label,
            "humidity": f"{round(float(cur.get('relative_humidity_2m', 60)))}%",
            "wind": f"{round(float(cur.get('wind_speed_10m', 10)))} km/h",
        }
    except Exception as exc:
        print(f"[warn] live-weather fetch failed ({exc}), using fallback", file=sys.stderr)
        return fetch_live_weather(clean_city, u, True)


def fetch_wakatime_weekly(api_key: str, demo: bool) -> dict:
    if demo or not api_key:
        return {
            "total": "38h 42m",
            "daily_avg": "5h 31m / day",
            "editor": "VS Code",
            "langs": [("TypeScript", 44), ("Rust", 28), ("Python", 18), ("CSS", 10)],
        }
    try:
        tok = base64.b64encode(f"{api_key}:".encode("utf-8")).decode("ascii")
        res = http_get_json(
            "https://wakatime.com/api/v1/users/current/stats/last_7_days",
            {"Authorization": f"Basic {tok}"},
        )
        d = res.get("data", {}) if isinstance(res, dict) else {}
        raw_langs = d.get("languages") or []
        langs = [
            (str(item.get("name", "Code")), max(1, round(float(item.get("percent", 1)))))
            for item in raw_langs[:4]
            if isinstance(item, dict)
        ] or [("Code", 100)]
        editors = d.get("editors") or []
        editor = str(editors[0].get("name", "Editor")) if editors and isinstance(editors[0], dict) else "Editor"
        return {
            "total": str(d.get("human_readable_total_including_other_language") or d.get("human_readable_total") or "0h 0m"),
            "daily_avg": f"{d.get('human_readable_daily_average') or '0h 0m'} / day",
            "editor": editor,
            "langs": langs,
        }
    except Exception as exc:
        print(f"[warn] wakatime fetch failed ({exc}), using fallback", file=sys.stderr)
        return fetch_wakatime_weekly("", True)


def fetch_spotify_recent(client_id: str, client_secret: str, refresh_token: str, demo: bool) -> dict:
    if demo or not (client_id and client_secret and refresh_token):
        return {
            "track": "Aruarian Dance",
            "artist": "Nujabes",
            "album": "Samurai Champloo OST",
            "status": "NOW PLAYING",
            "progress": 68,
            "duration": "4:10",
        }
    try:
        basic = base64.b64encode(f"{client_id}:{client_secret}".encode("utf-8")).decode("ascii")
        body = urllib.parse.urlencode({"grant_type": "refresh_token", "refresh_token": refresh_token}).encode("utf-8")
        req = urllib.request.Request(
            "https://accounts.spotify.com/api/token",
            data=body,
            headers={
                "Authorization": f"Basic {basic}",
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "GitSkins-LiveWidgets/0.6",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=12) as resp:
            tok_data = json.loads(resp.read().decode("utf-8"))
        access = tok_data["access_token"]
        auth_h = {"Authorization": f"Bearer {access}"}
        item = None
        status = "RECENTLY PLAYED"
        progress = 72
        try:
            now_req = urllib.request.Request("https://api.spotify.com/v1/me/player/currently-playing", headers=auth_h)
            with urllib.request.urlopen(now_req, timeout=12) as nr:
                if nr.status == 200:
                    payload = json.loads(nr.read().decode("utf-8"))
                    if payload.get("item"):
                        item = payload["item"]
                        status = "NOW PLAYING" if payload.get("is_playing") else "PAUSED"
                        dur_ms = max(1, int(item.get("duration_ms", 1)))
                        progress = max(5, min(98, round(int(payload.get("progress_ms", 0)) * 100 / dur_ms)))
        except Exception:
            item = None
        if not item:
            rec = http_get_json("https://api.spotify.com/v1/me/player/recently-played?limit=1", auth_h)
            items = rec.get("items") if isinstance(rec, dict) else []
            if items and isinstance(items[0], dict):
                item = items[0].get("track")
        if not isinstance(item, dict):
            raise ValueError("No Spotify track returned")
        artists = ", ".join(a.get("name", "") for a in item.get("artists", []) if isinstance(a, dict)) or "Artist"
        dur_s = round(int(item.get("duration_ms", 210000)) / 1000)
        return {
            "track": str(item.get("name", "Untitled")),
            "artist": artists,
            "album": str((item.get("album") or {}).get("name", "Spotify")),
            "status": status,
            "progress": progress,
            "duration": f"{dur_s // 60}:{dur_s % 60:02d}",
        }
    except Exception as exc:
        print(f"[warn] spotify fetch failed ({exc}), using fallback", file=sys.stderr)
        return fetch_spotify_recent("", "", "", True)


# ---------------------------------------------------------------------------
# SVG Renderers (all 160px Bento height, strict XML, prefers-reduced-motion)
# ---------------------------------------------------------------------------
def render_github_stats_svg(data: dict, theme_id: str, mode: str, span: int, accent: str, animated: bool) -> str:
    t = resolve_tokens(theme_id, mode, accent)
    w = col_span_to_px(span)
    h = 160
    uid = f"lstats-{theme_id}-{mode}-c{span}"
    defs, chrome, top, pad = render_theme_frame(uid, theme_id, mode, t, w, h, "GITHUB STATS", f"@{data['username']}")
    inner_w = w - pad * 2
    kpis = [
        ("STARS", fmt_num(data["stars"]), t["accent"]),
        ("REPOS", fmt_num(data["repos"]), t["secondary"]),
        ("FOLLOWERS", fmt_num(data["followers"]), t["tertiary"]),
        ("PULL REQS", fmt_num(data["prs"]), t["highlight"]),
    ]
    gap = 8
    cell_w = (inner_w - gap * 3) / 4
    kpi_y = top + 6
    kpi_svg: list[str] = []
    for idx, (lbl, val, col) in enumerate(kpis):
        x = pad + idx * (cell_w + gap)
        kpi_svg.append(
            f'  <rect x="{x:.1f}" y="{kpi_y}" width="{cell_w:.1f}" height="46" fill="{t["surface"]}" stroke="{t["borderSoft"]}" stroke-width="1"/>'
            f'  <rect x="{x + 8:.1f}" y="{kpi_y + 9}" width="5" height="5" fill="{col}" shape-rendering="crispEdges"/>'
            f'  <text x="{x + 17:.1f}" y="{kpi_y + 14.5}" font-family=\'{FONT_MONO}\' font-size="8.5" font-weight="700" fill="{t["muted"]}">{lbl}</text>'
            f'  <text x="{x + 8:.1f}" y="{kpi_y + 36}" font-family=\'{head_font(theme_id)}\' font-size="17" font-weight="800" fill="{t["ink"]}">{esc(val)}</text>'
        )

    bar_y = kpi_y + 62
    langs = data["langs"]
    total_pct = sum(p for _, p in langs) or 100
    bar_colors = [t["accent"], t["secondary"], t["tertiary"], t["highlight"]]
    bar_svg: list[str] = []
    legend_svg: list[str] = []
    bx = float(pad)
    lx = float(pad)
    for idx, (lname, pct) in enumerate(langs):
        seg_w = max(8.0, inner_w * (pct / total_pct))
        if idx == len(langs) - 1:
            seg_w = max(4.0, (pad + inner_w) - bx)
        col = bar_colors[idx % len(bar_colors)]
        bar_svg.append(
            f'  <rect x="{bx:.1f}" y="{bar_y}" width="{seg_w:.1f}" height="8" fill="{col}" shape-rendering="crispEdges"/>'
        )
        bx += seg_w
        tag_txt = f"{lname} {pct}%"
        est = estimate_px(tag_txt, 9.5, True) + 18
        if lx + est <= w - pad + 4:
            legend_svg.append(
                f'  <rect x="{lx:.1f}" y="{bar_y + 18}" width="6" height="6" fill="{col}" shape-rendering="crispEdges"/>'
                f'  <text x="{lx + 10:.1f}" y="{bar_y + 24.5}" font-family=\'{FONT_MONO}\' font-size="9.5" fill="{t["sub"]}">{esc(tag_txt)}</text>'
            )
            lx += est

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="GitHub Stats for {esc(data['username'])}">
  <title>GitHub Stats — @{esc(data['username'])}</title>{f'<defs>{defs}</defs>' if defs else ''}
  {chrome}
{"".join(kpi_svg)}
  <rect x="{pad}" y="{bar_y}" width="{inner_w}" height="8" fill="{t['borderSoft']}"/>
{"".join(bar_svg)}
{"".join(legend_svg)}
</svg>"""


def render_coding_rhythm_svg(data: dict, theme_id: str, mode: str, span: int, accent: str, animated: bool) -> str:
    t = resolve_tokens(theme_id, mode, accent)
    w = col_span_to_px(span)
    h = 160
    uid = f"lrhythm-{theme_id}-{mode}-c{span}"
    defs, chrome, top, pad = render_theme_frame(uid, theme_id, mode, t, w, h, "CODING RHYTHM", f"{data['tz']} · PEAK {data['peak']}")
    inner_w = w - pad * 2
    hours: list[int] = data["hours"]
    max_v = max(hours) or 1

    # Persona badge + 24-hour histogram
    pill_w = round(estimate_px(data["persona"], 9.5, True) + 18)
    chart_top = top + 28
    chart_h = 54
    base_y = chart_top + chart_h
    slot_w = inner_w / 24
    bar_w = max(4.0, slot_w - 3.0)
    bars: list[str] = []
    for hr, val in enumerate(hours):
        bh = max(4.0, (val / max_v) * (chart_h - 4))
        bx = pad + hr * slot_w + (slot_w - bar_w) / 2
        is_peak = val == max_v and val > 0
        fill = t["accent"] if is_peak else (t["secondary"] if val > max_v * 0.55 else t["borderSoft"])
        bars.append(
            f'  <rect x="{bx:.1f}" y="{base_y - bh:.1f}" width="{bar_w:.1f}" height="{bh:.1f}" fill="{fill}" shape-rendering="crispEdges"/>'
        )

    p_y = base_y + 18
    p_step = inner_w / 4
    p_svg = []
    for idx, (rng, pct) in enumerate(data["periods"]):
        px = pad + idx * p_step
        p_svg.append(
            f'  <text x="{px:.1f}" y="{p_y}" font-family=\'{FONT_MONO}\' font-size="9.5" fill="{t["muted"]}">{rng} <tspan font-weight="700" fill="{t["ink"]}">{pct}%</tspan></text>'
        )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Coding Rhythm — {esc(data['persona'])}">
  <title>Coding Rhythm — {esc(data['persona'])}</title>{f'<defs>{defs}</defs>' if defs else ''}
  {chrome}
  <text x="{pad}" y="{top + 16}" font-family='{head_font(theme_id)}' font-size="14.5" font-weight="800" fill="{t['ink']}">Commit Cadence</text>
  <rect x="{w - pad - pill_w}" y="{top + 3}" width="{pill_w}" height="18" fill="{t['accent']}"/>
  <text x="{w - pad - pill_w / 2}" y="{top + 15}" text-anchor="middle" font-family='{FONT_MONO}' font-size="9" font-weight="700" fill="{t['accentFg']}">{esc(data['persona'])}</text>
  <line x1="{pad}" y1="{base_y + 1.5}" x2="{w - pad}" y2="{base_y + 1.5}" stroke="{t['border']}" stroke-width="1"/>
{"".join(bars)}
{"".join(p_svg)}
</svg>"""


def render_rss_feed_svg(data: dict, theme_id: str, mode: str, span: int, accent: str, animated: bool) -> str:
    t = resolve_tokens(theme_id, mode, accent)
    w = col_span_to_px(span)
    h = 160
    uid = f"lrss-{theme_id}-{mode}-c{span}"
    src = fit_text(data["source"], max(110, w - 190), 9.5, True)
    defs, chrome, top, pad = render_theme_frame(uid, theme_id, mode, t, w, h, "LATEST POSTS", src)
    rows_svg: list[str] = []
    title_max_w = w - pad * 2 - 96
    row_y0 = top + 20
    for idx, (title, dt) in enumerate(data["items"][:3]):
        y = row_y0 + idx * 33
        if idx > 0:
            rows_svg.append(
                f'  <line x1="{pad}" y1="{y - 18}" x2="{w - pad}" y2="{y - 18}" stroke="{t["borderSoft"]}" stroke-width="0.9"/>'
            )
        badge_col = [t["accent"], t["secondary"], t["tertiary"]][idx % 3]
        safe_t = esc(fit_text(title, title_max_w, 12, theme_id == "crt-terminal"))
        rows_svg.append(
            f'  <rect x="{pad}" y="{y - 10}" width="22" height="15" fill="{badge_col}"/>'
            f'  <text x="{pad + 11}" y="{y + 1}" text-anchor="middle" font-family=\'{FONT_MONO}\' font-size="8.5" font-weight="700" fill="{t["accentFg"]}">0{idx + 1}</text>'
            f'  <text x="{pad + 30}" y="{y + 1}" font-family=\'{head_font(theme_id)}\' font-size="12" font-weight="700" fill="{t["ink"]}">{safe_t}</text>'
            f'  <text x="{w - pad}" y="{y + 1}" text-anchor="end" font-family=\'{FONT_MONO}\' font-size="9.5" fill="{t["muted"]}">{esc(dt)}</text>'
        )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Latest RSS posts from {esc(data['source'])}">
  <title>Latest Posts — {esc(data['source'])}</title>{f'<defs>{defs}</defs>' if defs else ''}
  {chrome}
{"".join(rows_svg)}
</svg>"""


def render_live_weather_svg(data: dict, theme_id: str, mode: str, span: int, accent: str, animated: bool) -> str:
    t = resolve_tokens(theme_id, mode, accent)
    w = col_span_to_px(span)
    h = 160
    uid = f"lwx-{theme_id}-{mode}-c{span}"
    defs, chrome, top, pad = render_theme_frame(uid, theme_id, mode, t, w, h, "WEATHER", data["temp"])
    kind = data["kind"]
    wide = span >= 2
    box_x = pad
    box_y = top + 4
    box_w = 136 if wide else w - pad * 2
    box_h = 98 if wide else h - box_y - 40
    cx = box_x + box_w / 2
    mid_y = box_y + box_h / 2
    clip_id = f"wclip-{uid}"

    sky = ""
    anim_css = ""
    if kind == "sunny":
        rays = "".join(
            f'<line x1="{cx + math.cos(i * math.pi / 4) * 16:.1f}" y1="{mid_y + math.sin(i * math.pi / 4) * 16:.1f}" '
            f'x2="{cx + math.cos(i * math.pi / 4) * 23:.1f}" y2="{mid_y + math.sin(i * math.pi / 4) * 23:.1f}" '
            f'stroke="{t["highlight"]}" stroke-width="2.2"/>'
            for i in range(8)
        )
        sky = f'<g class="wsun-{uid}" style="transform-origin:{cx:.1f}px {mid_y:.1f}px">{rays}</g><circle cx="{cx:.1f}" cy="{mid_y:.1f}" r="11.5" fill="{t["highlight"]}"/>'
        anim_css = f"@keyframes wsun_{uid} {{ from {{ transform: rotate(0deg); }} to {{ transform: rotate(360deg); }} }} .wsun-{uid} {{ animation: wsun_{uid} 20s linear infinite; }}"
    elif kind == "snow":
        cols = [-42, -22, -4, 14, 34]
        flakes = "".join(
            f'<rect class="wflk-{uid}-{i}" x="{cx + dx:.1f}" y="{box_y + 22 + (i % 2) * 8}" width="4" height="4" fill="{t["ink"] if i % 2 == 0 else t["accent"]}" shape-rendering="crispEdges"/>'
            for i, dx in enumerate(cols)
        )
        sky = f'<rect x="{cx - 38:.1f}" y="{box_y + 12}" width="76" height="13" fill="{t["borderSoft"]}"/>{flakes}'
        anim_css = (
            f"@keyframes wflk_{uid} {{ 0% {{ transform: translateY(-4px); opacity: 0; }} 30% {{ opacity: 1; }} 100% {{ transform: translateY(34px); opacity: 0; }} }} "
            + " ".join(f".wflk-{uid}-{i} {{ animation: wflk_{uid} {2.4 + (i % 3) * 0.4:.1f}s linear {i * 0.3:.2f}s infinite; }}" for i in range(len(cols)))
        )
    elif kind == "cloudy":
        sky = (
            f'<circle cx="{cx + 16:.1f}" cy="{box_y + 26}" r="10" fill="{t["highlight"]}"/>'
            f'<rect class="wcld-{uid}" x="{cx - 36:.1f}" y="{box_y + 26}" width="72" height="16" fill="{t["border"]}"/>'
            f'<rect class="wcld-{uid}" x="{cx - 22:.1f}" y="{box_y + 18}" width="44" height="12" fill="{t["border"]}"/>'
        )
        anim_css = f"@keyframes wcld_{uid} {{ 0%, 100% {{ transform: translateX(-4px); }} 50% {{ transform: translateX(4px); }} }} .wcld-{uid} {{ animation: wcld_{uid} 5s ease-in-out infinite; }}"
    else:
        cols = [-38, -20, -2, 16, 34]
        drops = "".join(
            f'<line class="wdrp-{uid}-{i}" x1="{cx + dx:.1f}" y1="{box_y + 28}" x2="{cx + dx - 4:.1f}" y2="{box_y + 38}" stroke="{t["accent"] if i % 2 == 0 else t["secondary"]}" stroke-width="1.9"/>'
            for i, dx in enumerate(cols)
        )
        sky = f'<rect x="{cx - 40:.1f}" y="{box_y + 14}" width="80" height="13" fill="{t["border"]}"/><rect x="{cx - 26:.1f}" y="{box_y + 8}" width="48" height="9" fill="{t["border"]}"/>{drops}'
        anim_css = (
            f"@keyframes wdrp_{uid} {{ 0% {{ transform: translate(0, -4px); opacity: 0; }} 30% {{ opacity: 1; }} 100% {{ transform: translate(-7px, 28px); opacity: 0; }} }} "
            + " ".join(f".wdrp-{uid}-{i} {{ animation: wdrp_{uid} 1.45s linear {i * 0.24:.2f}s infinite; }}" for i in range(len(cols)))
        )

    style_block = (
        f"<style>{anim_css} @media (prefers-reduced-motion: reduce) {{ * {{ animation: none !important; }} }}</style>"
        if animated and anim_css
        else ""
    )

    if wide:
        tx = box_x + box_w + 18
        info = f"""
  <text x="{tx}" y="{box_y + 24}" font-family='{head_font(theme_id)}' font-size="26" font-weight="800" fill="{t['ink']}">{esc(data['temp'])}</text>
  <text x="{w - pad}" y="{box_y + 20}" text-anchor="end" font-family='{FONT_MONO}' font-size="9.5" font-weight="700" fill="{t['accent']}">{esc(data['label'])}</text>
  <text x="{tx}" y="{box_y + 46}" font-family='{FONT_SANS}' font-size="13" font-weight="700" fill="{t['sub']}">{esc(fit_text(data['city'], w - tx - pad, 13))}</text>
  <line x1="{tx}" y1="{box_y + 58}" x2="{w - pad}" y2="{box_y + 58}" stroke="{t['borderSoft']}" stroke-width="0.9"/>
  <text x="{tx}" y="{box_y + 78}" font-family='{FONT_MONO}' font-size="10" fill="{t['muted']}">HUMIDITY <tspan fill="{t['ink']}" font-weight="700">{esc(data['humidity'])}</tspan></text>
  <text x="{w - pad}" y="{box_y + 78}" text-anchor="end" font-family='{FONT_MONO}' font-size="10" fill="{t['muted']}">WIND <tspan fill="{t['ink']}" font-weight="700">{esc(data['wind'])}</tspan></text>"""
    else:
        info = f"""
  <text x="{w / 2}" y="{h - 23}" text-anchor="middle" font-family='{head_font(theme_id)}' font-size="13" font-weight="700" fill="{t['ink']}">{esc(fit_text(data['city'], w - 24, 13))}</text>
  <text x="{w / 2}" y="{h - 10}" text-anchor="middle" font-family='{FONT_MONO}' font-size="8.8" fill="{t['muted']}">{esc(data['label'])} · {esc(data['humidity'])}</text>"""

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Weather in {esc(data['city'])}: {esc(data['temp'])}">
  <title>{esc(data['city'])} — {esc(data['temp'])}</title>
  <defs>{defs}<clipPath id="{clip_id}"><rect x="{box_x + 1}" y="{box_y + 1}" width="{box_w - 2}" height="{box_h - 2}"/></clipPath></defs>
  {style_block}
  {chrome}
  <rect x="{box_x}" y="{box_y}" width="{box_w}" height="{box_h}" fill="{t['patternBg']}" stroke="{t['border']}" stroke-width="1"/>
  <g clip-path="url(#{clip_id})">{sky}</g>
  {info}
</svg>"""


def render_wakatime_weekly_svg(data: dict, theme_id: str, mode: str, span: int, accent: str, animated: bool) -> str:
    t = resolve_tokens(theme_id, mode, accent)
    w = col_span_to_px(span)
    h = 160
    uid = f"lwaka-{theme_id}-{mode}-c{span}"
    defs, chrome, top, pad = render_theme_frame(uid, theme_id, mode, t, w, h, "WAKATIME · 7D", data["editor"])
    inner_w = w - pad * 2
    langs = data["langs"][:4]
    bar_colors = [t["accent"], t["secondary"], t["tertiary"], t["highlight"]]

    left_w = 132 if span == 2 else 164
    right_x = pad + left_w + 14
    right_w = w - right_x - pad

    rows_svg: list[str] = []
    row_y0 = top + 12
    for idx, (lname, pct) in enumerate(langs):
        y = row_y0 + idx * 24
        col = bar_colors[idx % 4]
        track_x = right_x + 76
        track_w = max(48, right_w - 114)
        fill_w = max(4, round(track_w * min(100, pct) / 100))
        rows_svg.append(
            f'  <text x="{right_x}" y="{y + 8}" font-family=\'{FONT_MONO}\' font-size="9.5" font-weight="700" fill="{t["ink"]}">{esc(fit_text(lname, 70, 9.5, True))}</text>'
            f'  <rect x="{track_x}" y="{y}" width="{track_w}" height="9" fill="{t["patternBg"]}" stroke="{t["borderSoft"]}" stroke-width="0.7" shape-rendering="crispEdges"/>'
            f'  <rect x="{track_x}" y="{y}" width="{fill_w}" height="9" fill="{col}" shape-rendering="crispEdges"/>'
            f'  <text x="{w - pad}" y="{y + 8}" text-anchor="end" font-family=\'{FONT_MONO}\' font-size="9.2" fill="{t["muted"]}">{pct}%</text>'
        )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="WakaTime Weekly Coding: {esc(data['total'])}">
  <title>WakaTime Weekly — {esc(data['total'])}</title>{f'<defs>{defs}</defs>' if defs else ''}
  {chrome}
  <rect x="{pad}" y="{top + 8}" width="{left_w}" height="{h - top - 22}" fill="{t['surface']}" stroke="{t['borderSoft']}" stroke-width="1"/>
  <rect x="{pad + 10}" y="{top + 18}" width="6" height="6" fill="{t['accent']}" shape-rendering="crispEdges"/>
  <text x="{pad + 22}" y="{top + 24}" font-family='{FONT_MONO}' font-size="8.8" font-weight="700" fill="{t['muted']}">LAST 7 DAYS</text>
  <text x="{pad + 10}" y="{top + 56}" font-family='{head_font(theme_id)}' font-size="22" font-weight="800" fill="{t['ink']}">{esc(fit_text(data['total'], left_w - 20, 22))}</text>
  <line x1="{pad + 10}" y1="{top + 68}" x2="{pad + left_w - 10}" y2="{top + 68}" stroke="{t['borderSoft']}" stroke-width="0.8"/>
  <text x="{pad + 10}" y="{top + 86}" font-family='{FONT_MONO}' font-size="9.5" fill="{t['sub']}">AVG {esc(fit_text(data['daily_avg'], left_w - 40, 9.5, True))}</text>
{"".join(rows_svg)}
</svg>"""


def render_spotify_recent_svg(data: dict, theme_id: str, mode: str, span: int, accent: str, animated: bool) -> str:
    t = resolve_tokens(theme_id, mode, accent)
    w = col_span_to_px(span)
    h = 160
    uid = f"lspot-{theme_id}-{mode}-c{span}"
    defs, chrome, top, pad = render_theme_frame(uid, theme_id, mode, t, w, h, "SPOTIFY", data["status"])
    disc_cx = pad + 48
    disc_cy = top + 54
    tx = pad + 110
    text_w = w - tx - pad - 44
    prog_w = w - tx - pad
    prog_fill = max(8, round(prog_w * max(0, min(100, int(data["progress"]))) / 100))

    eq_bars = ""
    for i, bh in enumerate((12, 22, 16, 26)):
        ex = w - pad - 28 + i * 7
        eq_bars += f'<rect class="eq-{uid}-{i}" x="{ex}" y="{top + 40 - bh}" width="4" height="{bh}" fill="{t["accent"] if i % 2 == 0 else t["secondary"]}" shape-rendering="crispEdges"/>'

    style_block = (
        f"""<style>
    @keyframes spin_{uid} {{ from {{ transform: rotate(0deg); }} to {{ transform: rotate(360deg); }} }}
    @keyframes eq_{uid} {{ 0%, 100% {{ transform: scaleY(0.45); }} 50% {{ transform: scaleY(1); }} }}
    .disc-{uid} {{ transform-origin: {disc_cx}px {disc_cy}px; animation: spin_{uid} 10s linear infinite; }}
    .eq-{uid}-0 {{ transform-origin: {w - pad - 26}px {top + 40}px; animation: eq_{uid} 1.1s ease-in-out infinite; }}
    .eq-{uid}-1 {{ transform-origin: {w - pad - 19}px {top + 40}px; animation: eq_{uid} 0.9s ease-in-out 0.15s infinite; }}
    .eq-{uid}-2 {{ transform-origin: {w - pad - 12}px {top + 40}px; animation: eq_{uid} 1.25s ease-in-out 0.3s infinite; }}
    .eq-{uid}-3 {{ transform-origin: {w - pad - 5}px {top + 40}px; animation: eq_{uid} 1.0s ease-in-out 0.45s infinite; }}
    @media (prefers-reduced-motion: reduce) {{ .disc-{uid}, .eq-{uid}-0, .eq-{uid}-1, .eq-{uid}-2, .eq-{uid}-3 {{ animation: none !important; }} }}
  </style>"""
        if animated
        else ""
    )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Spotify: {esc(data['track'])} by {esc(data['artist'])}">
  <title>Spotify — {esc(data['track'])}</title>{f'<defs>{defs}</defs>' if defs else ''}
  {style_block}
  {chrome}
  <rect x="{pad}" y="{top + 8}" width="96" height="92" fill="{t['patternBg']}" stroke="{t['border']}" stroke-width="1"/>
  <g class="disc-{uid}">
    <circle cx="{disc_cx}" cy="{disc_cy}" r="36" fill="{t['ink']}"/>
    <circle cx="{disc_cx}" cy="{disc_cy}" r="26" fill="none" stroke="{t['muted']}" stroke-opacity="0.4" stroke-width="1"/>
    <circle cx="{disc_cx}" cy="{disc_cy}" r="18" fill="none" stroke="{t['muted']}" stroke-opacity="0.35" stroke-width="1"/>
    <circle cx="{disc_cx}" cy="{disc_cy}" r="12" fill="{t['accent']}"/>
    <rect x="{disc_cx - 2}" y="{disc_cy - 30}" width="4" height="8" fill="{t['surface']}"/>
    <circle cx="{disc_cx}" cy="{disc_cy}" r="3.5" fill="{t['bg']}"/>
  </g>
  {eq_bars}
  <text x="{tx}" y="{top + 26}" font-family='{head_font(theme_id)}' font-size="17" font-weight="800" fill="{t['ink']}">{esc(fit_text(data['track'], text_w, 17))}</text>
  <text x="{tx}" y="{top + 47}" font-family='{FONT_SANS}' font-size="12.5" font-weight="600" fill="{t['sub']}">{esc(fit_text(data['artist'], text_w + 20, 12.5))}</text>
  <text x="{tx}" y="{top + 66}" font-family='{FONT_MONO}' font-size="9.5" fill="{t['muted']}">ALBUM · {esc(fit_text(data['album'], prog_w - 60, 9.5, True))}</text>
  <rect x="{tx}" y="{top + 79}" width="{prog_w}" height="7" fill="{t['patternBg']}" stroke="{t['borderSoft']}" stroke-width="0.7"/>
  <rect x="{tx}" y="{top + 79}" width="{prog_fill}" height="7" fill="{t['accent']}" shape-rendering="crispEdges"/>
  <text x="{tx}" y="{top + 100}" font-family='{FONT_MONO}' font-size="9" fill="{t['muted']}">{data['progress']}%</text>
  <text x="{w - pad}" y="{top + 100}" text-anchor="end" font-family='{FONT_MONO}' font-size="9" fill="{t['muted']}">{esc(data['duration'])}</text>
</svg>"""


SNAKE_PALETTES: dict[str, dict[str, tuple[str, list[str]]]] = {
    "swiss-bauhaus-pixel": {
        "light": ("#00A3CC", ["#EAE8E1", "#B5E2F2", "#5AC1E4", "#2370E8", "#111214"]),
        "dark": ("#38BDF8", ["#1B1F29", "#143A54", "#1D5E87", "#38BDF8", "#F5B700"]),
    },
    "blueprint-cad": {
        "light": ("#1D5BB8", ["#E3ECF7", "#B8D3F2", "#6DA6E6", "#1D5BB8", "#0C2340"]),
        "dark": ("#38BDF8", ["#10294A", "#164070", "#1E63A6", "#38BDF8", "#FBBF24"]),
    },
    "editorial-zine": {
        "light": ("#C93B2B", ["#EAE3D5", "#D4C8B4", "#A49987", "#524D45", "#141311"]),
        "dark": ("#E45847", ["#221F1B", "#3D372F", "#6F665B", "#B5ABA0", "#F0EBE1"]),
    },
    "crt-terminal": {
        "light": ("#0E7C5B", ["#E4DFD2", "#B4DFD0", "#5BBF9F", "#0E7C5B", "#182026"]),
        "dark": ("#34D399", ["#141E24", "#103D31", "#146E53", "#34D399", "#A7F3D0"]),
    },
    "pixel-rpg-hud": {
        "light": ("#D97706", ["#E6DFCB", "#C7DEC0", "#6DBE7D", "#15803D", "#D97706"]),
        "dark": ("#FACC15", ["#1F2640", "#1E4D3C", "#2E8555", "#4ADE80", "#FACC15"]),
    },
    "seal-ink-scroll": {
        "light": ("#C4362C", ["#EAE2D3", "#CFC5B4", "#9E9485", "#575049", "#1C1917"]),
        "dark": ("#E0564A", ["#23201C", "#3E3932", "#6B6358", "#A89E8E", "#F2ECE1"]),
    },
    "synth-hardware": {
        "light": ("#FF5200", ["#DFDBD2", "#F5C6AE", "#FF9361", "#FF5200", "#141517"]),
        "dark": ("#FF6B2B", ["#1D1F26", "#4A271A", "#8F3E1D", "#FF6B2B", "#FACC15"]),
    },
    "pcb-solder-mask": {
        "light": ("#B87D14", ["#E3E7E2", "#BFE0CE", "#63B08B", "#1C6B4A", "#B87D14"]),
        "dark": ("#E5B84B", ["#112B20", "#174A36", "#227554", "#34D399", "#E5B84B"]),
    },
    "transit-boarding": {
        "light": ("#D93829", ["#EAE3D5", "#BDD2EE", "#6899D9", "#1B56B5", "#D93829"]),
        "dark": ("#F59E0B", ["#1D2028", "#2B3A57", "#3D67A8", "#60A5FA", "#F59E0B"]),
    },
    "classic-desktop-os": {
        "light": ("#2455C8", ["#D8D6CE", "#B8C7E8", "#7496DF", "#2455C8", "#111111"]),
        "dark": ("#60A5FA", ["#22242C", "#1F375C", "#2E5A9E", "#60A5FA", "#FACC15"]),
    },
    "riso-duotone": {
        "light": ("#FF4F5E", ["#EAE3D3", "#B5D2F2", "#5C9EE6", "#0066CC", "#FF4F5E"]),
        "dark": ("#FF5E7E", ["#1E212E", "#164457", "#187E9C", "#22D3EE", "#FF5E7E"]),
    },
}


def mix_hex_color(a: str, b: str, ratio: float) -> str:
    def _rgb(h: str) -> tuple[int, int, int]:
        h = h.lstrip("#")
        return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    try:
        ra, ga, ba = _rgb(a)
        rb, gb, bb = _rgb(b)
    except Exception:
        return b
    r = max(0, min(255, round(ra + (rb - ra) * ratio)))
    g = max(0, min(255, round(ga + (gb - ga) * ratio)))
    bl = max(0, min(255, round(ba + (bb - ba) * ratio)))
    return f"#{r:02X}{g:02X}{bl:02X}"


def resolve_snake_palette(theme_id: str, mode: str, t: dict[str, str], accent: str) -> tuple[str, list[str]]:
    clean_acc = accent.strip().upper() if accent and re.match(r"^#[0-9a-fA-F]{6}$", accent.strip()) else ""
    curated = SNAKE_PALETTES.get(theme_id, {}).get(mode)
    if curated and not clean_acc:
        return curated
    snake = clean_acc or t["accent"]
    empty = curated[1][0] if curated else mix_hex_color(t["surface"], t["borderSoft"], 0.42 if mode == "dark" else 0.38)
    dots = [
        empty,
        mix_hex_color(empty, snake, 0.28),
        mix_hex_color(empty, snake, 0.56),
        snake,
        t["highlight"] if mode == "dark" else t["ink"],
    ]
    return snake, dots


def demo_contrib_grid(handle: str) -> list[list[int]]:
    seed = 7
    for ch in handle:
        seed = (seed * 31 + ord(ch)) % 97
    grid: list[list[int]] = []
    for c in range(53):
        col: list[int] = []
        for r in range(7):
            wave = math.sin((c + seed) * 0.42 + r * 0.85) + math.cos(c * 0.21 - r * 1.15 + seed * 0.3)
            h = ((c * 37 + r * 91 + seed * 17) ^ (c * 13)) & 31
            if h < 6:
                lvl = 0
            elif wave > 1.05 or h == 30:
                lvl = 4
            elif wave > 0.35 or h > 24:
                lvl = 3
            elif wave > -0.35:
                lvl = 2
            else:
                lvl = 1
            col.append(lvl)
        grid.append(col)
    return grid


def fetch_contribution_snake(username: str, token: str, demo: bool) -> dict:
    handle = (username or "developer").lstrip("@")
    if demo or not token:
        return {"username": handle, "total": 1284, "grid": demo_contrib_grid(handle)}
    level_map = {
        "NONE": 0,
        "FIRST_QUARTILE": 1,
        "SECOND_QUARTILE": 2,
        "THIRD_QUARTILE": 3,
        "FOURTH_QUARTILE": 4,
    }
    query = """
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionLevel
              }
            }
          }
        }
      }
    }
    """
    try:
        payload = json.dumps({"query": query, "variables": {"login": handle}}).encode("utf-8")
        req = urllib.request.Request(
            "https://api.github.com/graphql",
            data=payload,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "User-Agent": "GitSkins-LiveWidgets/0.7",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=14) as resp:
            body = json.loads(resp.read().decode("utf-8"))
        cal = body["data"]["user"]["contributionsCollection"]["contributionCalendar"]
        weeks = cal.get("weeks") or []
        grid: list[list[int]] = []
        for wk in weeks[-53:]:
            days = wk.get("contributionDays") or []
            col = [level_map.get(str(d.get("contributionLevel", "NONE")), 0) for d in days[:7]]
            while len(col) < 7:
                col.append(0)
            grid.append(col)
        while len(grid) < 53:
            grid.insert(0, [0] * 7)
        return {
            "username": handle,
            "total": int(cal.get("totalContributions", 0)),
            "grid": grid[:53],
        }
    except Exception as exc:
        print(f"[warn] contribution-snake fetch failed ({exc}), using fallback", file=sys.stderr)
        return {"username": handle, "total": 1284, "grid": demo_contrib_grid(handle)}


def render_contribution_snake_svg(data: dict, theme_id: str, mode: str, span: int, accent: str, animated: bool) -> str:
    t = resolve_tokens(theme_id, mode, accent)
    w = col_span_to_px(4)
    h = 160
    uid = f"lsnk-{theme_id}-{mode}"
    handle = str(data.get("username") or "developer")
    total = int(data.get("total") or 0)
    grid = data.get("grid") or demo_contrib_grid(handle)
    snake_col, dots = resolve_snake_palette(theme_id, mode, t, accent)
    defs, chrome, top, pad = render_theme_frame(
        uid, theme_id, mode, t, w, h, "CONTRIBUTION SNAKE", f"@{fit_text(handle, 110, 9.5, True)} · {total:,} COMMITS"
    )

    cols, rows = 53, 7
    cell_w, cell_h, gap_x, gap_y = 10, 9, 4, 2
    step_x, step_y = cell_w + gap_x, cell_h + gap_y
    grid_w = cols * step_x - gap_x
    grid_x = round((w - grid_w) / 2) + 8
    grid_y = top + 4

    eaten_dots = [(14, 1, 6), (34, 1, 17), (36, 3, 33), (16, 3, 43), (22, 5, 61), (42, 5, 71), (26, 6, 87)]
    eaten_map = {(c, r): idx for idx, (c, r, _p) in enumerate(eaten_dots)}

    cells: list[str] = []
    for c in range(cols):
        for r in range(rows):
            cx = grid_x + c * step_x
            cy = grid_y + r * step_y
            lvl = max(0, min(4, int(grid[c][r]))) if c < len(grid) and r < len(grid[c]) else 0
            eidx = eaten_map.get((c, r))
            if eidx is not None:
                lvl = 4
            fill = dots[lvl]
            if eidx is not None and animated:
                cells.append(
                    f'<rect x="{cx}" y="{cy}" width="{cell_w}" height="{cell_h}" fill="{dots[0]}" shape-rendering="crispEdges"/>'
                    f'<rect class="eat-{uid}-{eidx}" x="{cx}" y="{cy}" width="{cell_w}" height="{cell_h}" fill="{fill}" shape-rendering="crispEdges"/>'
                )
            else:
                cells.append(
                    f'<rect x="{cx}" y="{cy}" width="{cell_w}" height="{cell_h}" fill="{fill}" shape-rendering="crispEdges"/>'
                )

    waypoints = [
        (0, 2, 1), (24.74, 49, 1), (25.79, 49, 3), (48.42, 6, 3),
        (49.47, 6, 5), (72.11, 49, 5), (72.63, 49, 6), (97.37, 2, 6), (100, 2, 1),
    ]
    dur = 16.0
    step_dur = dur / 190.0
    kf_body = " ".join(
        f"{pct}% {{ transform: translate({grid_x + c * step_x}px, {grid_y + r * step_y}px); }}"
        for pct, c, r in waypoints
    )
    seg_defs = [
        (10, 9, 0.0, 0.0, 1.0), (10, 9, 0.0, 0.0, 0.94), (9, 8, 0.5, 0.5, 0.86), (9, 8, 0.5, 0.5, 0.78),
        (8, 7, 1.0, 1.0, 0.68), (8, 7, 1.0, 1.0, 0.58), (7, 6, 1.5, 1.5, 0.46), (6, 5, 2.0, 2.0, 0.34),
    ]
    snake_css: list[str] = []
    snake_nodes: list[str] = []
    seg_count = len(seg_defs)
    for i in range(seg_count - 1, -1, -1):
        sw, sh, ox, oy, op = seg_defs[i]
        sx = grid_x + (26 - i) * step_x
        sy = grid_y + 3 * step_y
        delay = -((seg_count - i) * step_dur)
        snake_css.append(
            f".snk-{uid}-{i} {{ transform: translate({sx}px, {sy}px); animation: snk_{uid} {dur:.0f}s linear {delay:.3f}s infinite; }}"
        )
        eye = (
            f'<rect x="6" y="2" width="2" height="2" fill="{t["bg"]}" shape-rendering="crispEdges"/>'
            f'<rect x="6" y="5" width="2" height="2" fill="{t["bg"]}" shape-rendering="crispEdges"/>'
            if i == 0
            else ""
        )
        if animated:
            snake_nodes.append(
                f'<g class="snk-{uid}-{i}"><rect x="{ox}" y="{oy}" width="{sw}" height="{sh}" fill="{snake_col}" fill-opacity="{op}" shape-rendering="crispEdges"/>{eye}</g>'
            )
        else:
            snake_nodes.append(
                f'<g transform="translate({sx}, {sy})"><rect x="{ox}" y="{oy}" width="{sw}" height="{sh}" fill="{snake_col}" fill-opacity="{op}" shape-rendering="crispEdges"/>{eye}</g>'
            )

    eaten_css = " ".join(
        f"@keyframes eat_{uid}_{idx} {{ 0%, {max(0, p - 1):.1f}% {{ opacity: 1; }} {min(98, p + 1.5):.1f}%, {min(99, p + 14):.1f}% {{ opacity: 0.08; }} 100% {{ opacity: 1; }} }} .eat-{uid}-{idx} {{ animation: eat_{uid}_{idx} {dur:.0f}s linear infinite; }}"
        for idx, (_c, _r, p) in enumerate(eaten_dots)
    )
    style_block = (
        f"""<style>
    @keyframes snk_{uid} {{ {kf_body} }}
    {" ".join(snake_css)}
    {eaten_css}
    @media (prefers-reduced-motion: reduce) {{ [class^="snk-{uid}"], [class^="eat-{uid}"] {{ animation: none !important; }} }}
  </style>"""
        if animated
        else ""
    )

    day_labels = "".join(
        f'<text x="{grid_x - 8}" y="{grid_y + r * step_y + 7.5}" text-anchor="end" font-family=\'{FONT_MONO}\' font-size="8" fill="{t["muted"]}">{lbl}</text>'
        for lbl, r in (("MON", 1), ("WED", 3), ("FRI", 5))
    )
    leg_y = h - 20
    leg_x = w - pad - 96
    leg_dots = "".join(
        f'<rect x="{leg_x + idx * 12}" y="{leg_y - 8}" width="9" height="8" fill="{col}" shape-rendering="crispEdges"/>'
        for idx, col in enumerate(dots)
    )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Contribution Snake for @{esc(handle)}">
  <title>Contribution Snake — @{esc(handle)}</title>{f'<defs>{defs}</defs>' if defs else ''}
  {style_block}
  {chrome}
  {day_labels}
  <g>{"".join(cells)}</g>
  {"".join(snake_nodes)}
  <rect x="{pad}" y="{leg_y - 7}" width="7" height="7" fill="{snake_col}" shape-rendering="crispEdges"/>
  <text x="{pad + 12}" y="{leg_y}" font-family='{FONT_MONO}' font-size="8.6" font-weight="700" fill="{t['muted']}">GITSKINS GRAPHQL · SNAKE {snake_col} · ZERO-503</text>
  <text x="{leg_x - 6}" y="{leg_y}" text-anchor="end" font-family='{FONT_MONO}' font-size="8.4" fill="{t['muted']}">LESS</text>
  {leg_dots}
  <text x="{leg_x + 62}" y="{leg_y}" font-family='{FONT_MONO}' font-size="8.4" fill="{t['muted']}">MORE</text>
</svg>"""


def render_contrib_skyline_svg(data: dict, theme_id: str, mode: str, span: int, accent: str, animated: bool) -> str:
    t = resolve_tokens(theme_id, mode, accent)
    w = col_span_to_px(max(3, min(4, span)))
    h = 160
    uid = f"lsky-{theme_id}-{mode}-c{span}"
    handle = str(data.get("username") or "developer")
    total = int(data.get("total") or 0)
    full_grid = data.get("grid") or demo_contrib_grid(handle)
    weeks = 18 if span >= 4 else 14
    slice_grid = full_grid[-weeks:]
    _snake_col, dots = resolve_snake_palette(theme_id, mode, t, accent)
    defs, chrome, top, pad = render_theme_frame(
        uid, theme_id, mode, t, w, h, "3D SKYLINE", f"@{fit_text(handle, 100, 9.5, True)} · {total:,} COMMITS"
    )

    dx = 16.5 if span >= 4 else 13.8
    dy = 6.4 if span >= 4 else 5.6
    row_dx = -11.5
    row_dy = 6.2
    grid_span_x = (weeks - 1) * dx + 6 * row_dx
    origin_x = round(w / 2 - grid_span_x / 2) + 8
    origin_y = top + 34

    polys: list[str] = []
    for c in range(weeks):
        for r in range(7):
            lvl = max(0, min(4, int(slice_grid[c][r]))) if c < len(slice_grid) and r < len(slice_grid[c]) else 0
            bh = 2 if lvl == 0 else 6 + lvl * 8
            bx = origin_x + c * dx + r * row_dx
            by = origin_y + c * dy + r * row_dy
            hw = dx * 0.44
            hh = dy * 0.46
            top_c = dots[lvl]
            left_c = mix_hex_color(top_c, "#000000", 0.28 if mode == "dark" else 0.20)
            right_c = mix_hex_color(top_c, "#000000", 0.48 if mode == "dark" else 0.36)
            ty = by - bh
            top_pts = f"{bx:.1f},{ty - hh:.1f} {bx + hw:.1f},{ty:.1f} {bx:.1f},{ty + hh:.1f} {bx - hw:.1f},{ty:.1f}"
            left_pts = f"{bx - hw:.1f},{ty:.1f} {bx:.1f},{ty + hh:.1f} {bx:.1f},{by + hh:.1f} {bx - hw:.1f},{by:.1f}"
            right_pts = f"{bx:.1f},{ty + hh:.1f} {bx + hw:.1f},{ty:.1f} {bx + hw:.1f},{by:.1f} {bx:.1f},{by + hh:.1f}"
            polys.append(
                f'<polygon points="{left_pts}" fill="{left_c}"/><polygon points="{right_pts}" fill="{right_c}"/><polygon points="{top_pts}" fill="{top_c}"/>'
            )

    foot_y = h - 18
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="3D Contribution Skyline for @{esc(handle)}">
  <title>3D Contribution Skyline — @{esc(handle)}</title>{f'<defs>{defs}</defs>' if defs else ''}
  {chrome}
  <g>{"".join(polys)}</g>
  <rect x="{pad}" y="{foot_y - 7}" width="6" height="6" fill="{t['accent']}" shape-rendering="crispEdges"/>
  <text x="{pad + 11}" y="{foot_y}" font-family='{FONT_MONO}' font-size="8.6" font-weight="700" fill="{t['muted']}">ISOMETRIC {weeks}W × 7D · ZERO-503</text>
  <text x="{w - pad}" y="{foot_y}" text-anchor="end" font-family='{FONT_MONO}' font-size="8.6" fill="{t['muted']}">GITHUB GRAPHQL</text>
</svg>"""


def compute_streak_stats(calendar_data: dict) -> dict:
    grid = calendar_data.get("grid") or []
    flat = [lvl for col in grid for lvl in col]
    if not flat:
        return {"username": calendar_data.get("username", "developer"), "current": 42, "longest": 96, "total": 1284, "last14": [1] * 14}
    longest = 0
    run = 0
    for v in flat:
        if v > 0:
            run += 1
            longest = max(longest, run)
        else:
            run = 0
    cur = 0
    idx = len(flat) - 1
    if idx >= 0 and flat[idx] == 0:
        idx -= 1
    while idx >= 0 and flat[idx] > 0:
        cur += 1
        idx -= 1
    last14 = [1 if v > 0 else 0 for v in flat[-14:]]
    while len(last14) < 14:
        last14.insert(0, 0)
    return {
        "username": calendar_data.get("username", "developer"),
        "current": cur,
        "longest": max(longest, cur),
        "total": int(calendar_data.get("total") or 0),
        "last14": last14,
    }


def render_commit_streak_svg(data: dict, theme_id: str, mode: str, span: int, accent: str, animated: bool) -> str:
    t = resolve_tokens(theme_id, mode, accent)
    w = col_span_to_px(max(1, min(2, span)))
    h = 160
    uid = f"lstrk-{theme_id}-{mode}-c{span}"
    wide = span >= 2
    handle = str(data.get("username") or "developer")
    cur = int(data.get("current") or 0)
    best = int(data.get("longest") or cur)
    total = int(data.get("total") or cur)
    last14 = data.get("last14") or [1] * 14
    defs, chrome, top, pad = render_theme_frame(
        uid, theme_id, mode, t, w, h, "STREAK", f"@{fit_text(handle, 100, 9, True)}" if wide else "LIVE"
    )
    fx = pad + (26 if wide else 18)
    fy = top + 14
    flame_svg = (
        f'<g class="flm-{uid}" transform="translate({fx}, {fy})">'
        f'<path fill="{t["secondary"]}" shape-rendering="crispEdges" d="M12 0h4v4h-4zM8 4h12v4H8zM4 8h20v12H4zM0 16h28v12H0zM4 28h20v4H4z"/>'
        f'<path fill="{t["accent"]}" shape-rendering="crispEdges" d="M12 8h4v4h-4zM8 12h12v12H8zM4 20h20v8H4z"/>'
        f'<path fill="{t["highlight"]}" shape-rendering="crispEdges" d="M12 16h4v12h-4zM8 22h12v6H8z"/>'
        f"</g>"
    )
    bar_y = h - 28
    bar_inner_w = w - pad * 2
    seg_gap = 3
    seg_w = max(4, (bar_inner_w - seg_gap * 13) // 14)
    day_bars = "".join(
        f'<rect x="{pad + i * (seg_w + seg_gap)}" y="{bar_y}" width="{seg_w}" height="7" '
        f'fill="{t["borderSoft"] if not on else (t["accent"] if i >= 11 else (t["secondary"] if i >= 7 else t["tertiary"]))}" shape-rendering="crispEdges"/>'
        for i, on in enumerate(last14[:14])
    )
    if wide:
        metrics = f"""
  <text x="{pad + 72}" y="{top + 34}" font-family='{head_font(theme_id)}' font-size="30" font-weight="800" fill="{t['ink']}">{cur}<tspan font-family='{FONT_MONO}' font-size="11" font-weight="700" fill="{t['accent']}"> DAYS</tspan></text>
  <text x="{pad + 72}" y="{top + 52}" font-family='{FONT_MONO}' font-size="9.5" fill="{t['muted']}">CURRENT STREAK · ACTIVE</text>
  <line x1="{w - pad - 118}" y1="{top + 8}" x2="{w - pad - 118}" y2="{top + 62}" stroke="{t['borderSoft']}" stroke-width="0.9"/>
  <text x="{w - pad - 104}" y="{top + 21}" font-family='{FONT_MONO}' font-size="8.5" fill="{t['muted']}">LONGEST</text>
  <text x="{w - pad - 104}" y="{top + 37}" font-family='{head_font(theme_id)}' font-size="15" font-weight="800" fill="{t['ink']}">{best}d</text>
  <text x="{w - pad - 104}" y="{top + 52}" font-family='{FONT_MONO}' font-size="8.5" fill="{t['muted']}">YEAR <tspan fill="{t['sub']}" font-weight="700">{total:,}</tspan></text>"""
    else:
        metrics = f"""
  <text x="{pad + 56}" y="{top + 36}" font-family='{head_font(theme_id)}' font-size="28" font-weight="800" fill="{t['ink']}">{cur}<tspan font-family='{FONT_MONO}' font-size="10" fill="{t['accent']}">d</tspan></text>
  <text x="{pad + 56}" y="{top + 53}" font-family='{FONT_MONO}' font-size="8.8" fill="{t['muted']}">BEST {best}d</text>"""

    style_block = (
        f"<style>@keyframes flm_{uid} {{ 0%, 100% {{ transform: translate({fx}px, {fy}px) scaleY(1); }} 50% {{ transform: translate({fx}px, {fy - 1}px) scaleY(1.04); }} }} "
        f".flm-{uid} {{ animation: flm_{uid} 1.9s ease-in-out infinite; }} "
        f"@media (prefers-reduced-motion: reduce) {{ .flm-{uid} {{ animation: none !important; }} }}</style>"
        if animated
        else ""
    )
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Commit Streak: {cur} days">
  <title>Commit Streak — {cur} days</title>{f'<defs>{defs}</defs>' if defs else ''}
  {style_block}
  {chrome}
  {flame_svg}
  {metrics}
  <text x="{pad}" y="{bar_y - 5}" font-family='{FONT_MONO}' font-size="8.2" fill="{t['muted']}">LAST 14 DAYS</text>
  {day_bars}
</svg>"""


def fetch_recent_activity(username: str, token: str, demo: bool) -> dict:
    handle = (username or "developer").lstrip("@")
    fallback = {
        "username": handle,
        "events": [
            ("PUSH", f"{handle}/gitskins · feat: high-recognition skins & widgets", "2h"),
            ("REL", f"{handle}/cloudlink · v0.6.0 switchboard", "1d"),
            ("PR", f"{handle}/OpenPet · crisp desktop companion", "3d"),
        ],
    }
    if demo or not username:
        return fallback
    try:
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        raw = http_get_json(f"https://api.github.com/users/{urllib.parse.quote(handle)}/events/public?per_page=20", headers)
        if not isinstance(raw, list):
            return fallback
        now = datetime.now(timezone.utc)
        events: list[tuple[str, str, str]] = []
        for ev in raw:
            if not isinstance(ev, dict):
                continue
            etype = str(ev.get("type") or "")
            repo = str((ev.get("repo") or {}).get("name") or "")
            payload = ev.get("payload") or {}
            created = str(ev.get("created_at") or "")
            age = "now"
            if created:
                try:
                    dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
                    hrs = max(1, int((now - dt).total_seconds() // 3600))
                    age = f"{hrs}h" if hrs < 24 else f"{hrs // 24}d"
                except Exception:
                    age = "new"
            if etype == "PushEvent":
                commits = payload.get("commits") or []
                msg = str(commits[0].get("message", "push commits")).splitlines()[0] if commits and isinstance(commits[0], dict) else "push updates"
                events.append(("PUSH", f"{repo} · {msg}", age))
            elif etype == "ReleaseEvent":
                tag = str((payload.get("release") or {}).get("tag_name") or "release")
                events.append(("REL", f"{repo} · published {tag}", age))
            elif etype == "PullRequestEvent":
                title = str((payload.get("pull_request") or {}).get("title") or "pull request")
                events.append(("PR", f"{repo} · {title}", age))
            elif etype == "WatchEvent":
                events.append(("STAR", f"starred {repo}", age))
            if len(events) >= 3:
                break
        return {"username": handle, "events": events[:3]} if events else fallback
    except Exception as exc:
        print(f"[warn] recent-activity fetch failed ({exc}), using fallback", file=sys.stderr)
        return fallback


def render_recent_activity_svg(data: dict, theme_id: str, mode: str, span: int, accent: str, animated: bool) -> str:
    t = resolve_tokens(theme_id, mode, accent)
    w = col_span_to_px(max(2, min(4, span)))
    h = 160
    uid = f"lact-{theme_id}-{mode}-c{span}"
    handle = str(data.get("username") or "developer")
    defs, chrome, top, pad = render_theme_frame(
        uid, theme_id, mode, t, w, h, "ACTIVITY LOG", f"@{fit_text(handle, 110, 9.2, True)}"
    )
    badge_cols = {"PUSH": t["accent"], "REL": t["highlight"], "PR": t["tertiary"], "STAR": t["secondary"]}
    msg_max_w = w - pad * 2 - 92
    rows_svg: list[str] = []
    for idx, (kind, msg, age) in enumerate((data.get("events") or [])[:3]):
        y = top + 21 + idx * 33
        if idx > 0:
            rows_svg.append(f'  <line x1="{pad}" y1="{y - 18}" x2="{w - pad}" y2="{y - 18}" stroke="{t["borderSoft"]}" stroke-width="0.8"/>')
        col = badge_cols.get(kind, t["accent"])
        safe_msg = esc(fit_text(msg, msg_max_w, 11.2, theme_id == "crt-terminal"))
        ff = FONT_MONO if theme_id == "crt-terminal" else FONT_SANS
        rows_svg.append(
            f'  <rect x="{pad}" y="{y - 10}" width="36" height="15" fill="{col}"/>'
            f'  <text x="{pad + 18}" y="{y + 1}" text-anchor="middle" font-family=\'{FONT_MONO}\' font-size="8.2" font-weight="700" fill="{t["accentFg"]}">{esc(kind[:4])}</text>'
            f'  <text x="{pad + 45}" y="{y + 1}" font-family=\'{ff}\' font-size="11.5" font-weight="600" fill="{t["ink"]}">{safe_msg}</text>'
            f'  <text x="{w - pad}" y="{y + 1}" text-anchor="end" font-family=\'{FONT_MONO}\' font-size="9.2" fill="{t["muted"]}">{esc(age)}</text>'
        )
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Live Activity Log for @{esc(handle)}">
  <title>Activity Log — @{esc(handle)}</title>{f'<defs>{defs}</defs>' if defs else ''}
  {chrome}
{"".join(rows_svg)}
</svg>"""


def parse_widget_specs(raw: str) -> list[tuple[str, int]]:
    defaults = {
        "github-stats": 2,
        "coding-rhythm": 2,
        "rss-feed": 3,
        "live-weather": 1,
        "wakatime-weekly": 2,
        "spotify-recent": 2,
        "contribution-snake": 4,
        "contrib-skyline": 4,
        "commit-streak": 2,
        "recent-activity": 2,
    }
    out: list[tuple[str, int]] = []
    for part in (raw or "").split(","):
        part = part.strip()
        if not part:
            continue
        if ":" in part:
            wid, sp = part.split(":", 1)
            wid = wid.strip()
            span = int(sp.strip()) if sp.strip().isdigit() else defaults.get(wid, 2)
        else:
            wid = part
            span = defaults.get(wid, 2)
        if wid in defaults:
            out.append((wid, max(1, min(4, span))))
    return out or [("github-stats", 2), ("coding-rhythm", 2)]


def generate_one(wid: str, span: int, theme_id: str, mode: str, args: argparse.Namespace, cache: dict) -> str:
    token = os.environ.get("GITHUB_TOKEN", "")
    animated = not args.static
    if wid == "github-stats":
        if "stats" not in cache:
            cache["stats"] = fetch_github_stats(args.username, token, args.demo)
        return render_github_stats_svg(cache["stats"], theme_id, mode, span, args.accent, animated)
    if wid == "coding-rhythm":
        if "rhythm" not in cache:
            cache["rhythm"] = fetch_coding_rhythm(args.username, args.tz_offset, token, args.demo)
        return render_coding_rhythm_svg(cache["rhythm"], theme_id, mode, span, args.accent, animated)
    if wid == "rss-feed":
        if "rss" not in cache:
            cache["rss"] = fetch_rss_feed(args.rss_url, args.demo)
        return render_rss_feed_svg(cache["rss"], theme_id, mode, span, args.accent, animated)
    if wid == "live-weather":
        if "weather" not in cache:
            cache["weather"] = fetch_live_weather(args.city, args.unit, args.demo)
        return render_live_weather_svg(cache["weather"], theme_id, mode, span, args.accent, animated)
    if wid == "wakatime-weekly":
        if "wakatime" not in cache:
            cache["wakatime"] = fetch_wakatime_weekly(os.environ.get("WAKATIME_API_KEY", ""), args.demo)
        return render_wakatime_weekly_svg(cache["wakatime"], theme_id, mode, span, args.accent, animated)
    if wid == "spotify-recent":
        if "spotify" not in cache:
            cache["spotify"] = fetch_spotify_recent(
                os.environ.get("SPOTIFY_CLIENT_ID", ""),
                os.environ.get("SPOTIFY_CLIENT_SECRET", ""),
                os.environ.get("SPOTIFY_REFRESH_TOKEN", ""),
                args.demo,
            )
        return render_spotify_recent_svg(cache["spotify"], theme_id, mode, span, args.accent, animated)
    if wid == "contribution-snake":
        if "snake" not in cache:
            cache["snake"] = fetch_contribution_snake(args.username, token, args.demo)
        return render_contribution_snake_svg(cache["snake"], theme_id, mode, span, args.accent, animated)
    if wid == "contrib-skyline":
        if "snake" not in cache:
            cache["snake"] = fetch_contribution_snake(args.username, token, args.demo)
        return render_contrib_skyline_svg(cache["snake"], theme_id, mode, span, args.accent, animated)
    if wid == "commit-streak":
        if "snake" not in cache:
            cache["snake"] = fetch_contribution_snake(args.username, token, args.demo)
        if "streak" not in cache:
            cache["streak"] = compute_streak_stats(cache["snake"])
        return render_commit_streak_svg(cache["streak"], theme_id, mode, span, args.accent, animated)
    if wid == "recent-activity":
        if "activity" not in cache:
            cache["activity"] = fetch_recent_activity(args.username, token, args.demo)
        return render_recent_activity_svg(cache["activity"], theme_id, mode, span, args.accent, animated)
    raise ValueError(f"Unknown live widget: {wid}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate GitSkins live auto-updating SVG widgets.")
    parser.add_argument("--username", default=os.environ.get("GITHUB_REPOSITORY_OWNER", ""))
    parser.add_argument("--theme", default="swiss-bauhaus-pixel", choices=list(THEME_TOKENS.keys()))
    parser.add_argument("--widgets", default="github-stats:2,coding-rhythm:2,rss-feed:3,live-weather:1")
    parser.add_argument("--city", default="Shanghai")
    parser.add_argument("--unit", default="C", choices=["C", "F"])
    parser.add_argument("--tz-offset", type=int, default=8)
    parser.add_argument("--rss-url", default="")
    parser.add_argument("--accent", default="")
    parser.add_argument("--static", action="store_true")
    parser.add_argument("--out-dir", default="assets")
    parser.add_argument("--demo", action="store_true", help="Use deterministic demo data (offline).")
    parser.add_argument("--check-all", action="store_true", help="XML-validate all themes x all live widgets in memory.")
    args = parser.parse_args()

    if args.check_all:
        args.demo = True
        specs = [
            ("github-stats", 2),
            ("coding-rhythm", 2),
            ("rss-feed", 3),
            ("live-weather", 1),
            ("wakatime-weekly", 2),
            ("spotify-recent", 2),
            ("contribution-snake", 4),
            ("contrib-skyline", 4),
            ("commit-streak", 2),
            ("recent-activity", 2),
        ]
        count = 0
        for tid in THEME_TOKENS:
            cache: dict = {}
            for wid, span in specs:
                for mode in ("light", "dark"):
                    svg = generate_one(wid, span, tid, mode, args, cache)
                    ET.fromstring(svg)
                    count += 1
        print(f"[live-widgets] Validated {count} strict XML SVGs across {len(THEME_TOKENS)} themes.")
        return

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    specs = parse_widget_specs(args.widgets)
    cache = {}
    written = 0
    for wid, span in specs:
        for mode in ("light", "dark"):
            svg = generate_one(wid, span, args.theme, mode, args, cache)
            ET.fromstring(svg)
            target = out_dir / f"live-{wid}-{mode}.svg"
            target.write_text(svg, encoding="utf-8")
            written += 1
    print(f"[live-widgets] Generated and XML-validated {written} SVGs in {out_dir}")


if __name__ == "__main__":
    main()
