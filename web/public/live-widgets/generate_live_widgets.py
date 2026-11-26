#!/usr/bin/env python3
"""GitSkins Zero-503 Live Widgets Generator (Python 3.10+ stdlib only).

Generates Light & Dark theme-matched SVGs for GitHub Actions cron workflows:
  - github-stats   (2/3/4 cols x 160px) — GitHub metrics + proportional language bar
  - coding-rhythm  (2/3/4 cols x 160px) — 24h commit histogram + circadian persona
  - rss-feed       (2/3/4 cols x 160px) — Latest 3 RSS/Atom articles
  - live-weather   (1/2   cols x 160px) — Open-Meteo real-time pixel weather window

Zero pip dependencies. Every SVG is strictly XML-validated before write.
"""

from __future__ import annotations

import argparse
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
    if theme_id == "editorial-zine":
        return FONT_SERIF
    if theme_id == "crt-terminal":
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


def parse_widget_specs(raw: str) -> list[tuple[str, int]]:
    defaults = {"github-stats": 2, "coding-rhythm": 2, "rss-feed": 3, "live-weather": 1}
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
    parser.add_argument("--check-all", action="store_true", help="XML-validate all 4 themes x 4 live widgets in memory.")
    args = parser.parse_args()

    if args.check_all:
        args.demo = True
        specs = [("github-stats", 2), ("coding-rhythm", 2), ("rss-feed", 3), ("live-weather", 1)]
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
