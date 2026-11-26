#!/usr/bin/env node
/**
 * GitSkins Zero-Dependency CLI (Node.js 18+ ESM)
 *
 * Commands:
 *   gitskins list
 *   gitskins init --mode <repo|profile> --theme <id> [options]
 *   gitskins validate <path>
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

const FONT_MONO = "'JetBrains Mono','SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace";
const FONT_SANS = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const FONT_SERIF = "'Newsreader',Georgia,'Times New Roman',serif";
const RAW_LIVE_GENERATOR_URL =
  "https://raw.githubusercontent.com/Furina-he/gitskins/main/live-widgets/generate_live_widgets.py";

const FALLBACK_THEMES = {
  "swiss-bauhaus-pixel": {
    name: "Swiss-Bauhaus Pixel Poster",
    category: "Editorial Graphic",
    tokens: {
      light: {
        bg: "#F8F7F4",
        surface: "#FFFFFF",
        patternBg: "#EDEBE6",
        patternFg: "#D6D3CB",
        border: "#111214",
        borderSoft: "#C8C4BA",
        ink: "#111214",
        sub: "#3E434C",
        muted: "#6E747E",
        accent: "#00A3CC",
        accentFg: "#FFFFFF",
        secondary: "#E45847",
        tertiary: "#2B7A5B",
        highlight: "#D4A017",
      },
      dark: {
        bg: "#101216",
        surface: "#171A21",
        patternBg: "#1E222B",
        patternFg: "#2C313E",
        border: "#E6E4DD",
        borderSoft: "#353B48",
        ink: "#F3F2EC",
        sub: "#B8BEC8",
        muted: "#878E9B",
        accent: "#29C5EB",
        accentFg: "#0B1115",
        secondary: "#F06A5A",
        tertiary: "#3FC18E",
        highlight: "#F0BE3D",
      },
    },
  },
  "blueprint-cad": {
    name: "Architectural Blueprint CAD",
    category: "Engineering Spec",
    tokens: {
      light: {
        bg: "#F4F7FC",
        surface: "#FFFFFF",
        patternBg: "#E6EEF9",
        patternFg: "#C4D6EE",
        border: "#1E4FA8",
        borderSoft: "#A9C1E4",
        ink: "#0F254C",
        sub: "#2F4A78",
        muted: "#5A739C",
        accent: "#1D5FD6",
        accentFg: "#FFFFFF",
        secondary: "#D95D39",
        tertiary: "#0D8A6A",
        highlight: "#C98A1A",
      },
      dark: {
        bg: "#0A1628",
        surface: "#10213A",
        patternBg: "#152B4A",
        patternFg: "#21406C",
        border: "#5CA3FF",
        borderSoft: "#284A7A",
        ink: "#EAF2FF",
        sub: "#B3CBEB",
        muted: "#7B9AC4",
        accent: "#5CA3FF",
        accentFg: "#071323",
        secondary: "#FF845C",
        tertiary: "#3CD6A8",
        highlight: "#F4C24D",
      },
    },
  },
  "editorial-zine": {
    name: "Editorial Broadsheet Zine",
    category: "Print Monograph",
    tokens: {
      light: {
        bg: "#FBF9F5",
        surface: "#FFFFFF",
        patternBg: "#F2EDE4",
        patternFg: "#DCD4C6",
        border: "#1A1918",
        borderSoft: "#D5CEC2",
        ink: "#1A1918",
        sub: "#4A4640",
        muted: "#7A746B",
        accent: "#B83227",
        accentFg: "#FFFFFF",
        secondary: "#26547C",
        tertiary: "#2E6F4E",
        highlight: "#A9741A",
      },
      dark: {
        bg: "#151412",
        surface: "#1D1B18",
        patternBg: "#25221E",
        patternFg: "#36312B",
        border: "#E8E2D7",
        borderSoft: "#3E3932",
        ink: "#F4EFE6",
        sub: "#C7BFB2",
        muted: "#92897B",
        accent: "#E35D52",
        accentFg: "#151412",
        secondary: "#6EA3D1",
        tertiary: "#5EB888",
        highlight: "#E0AE4C",
      },
    },
  },
  "crt-terminal": {
    name: "Retro CRT Terminal TUI",
    category: "Phosphor System",
    tokens: {
      light: {
        bg: "#F2F5F4",
        surface: "#FFFFFF",
        patternBg: "#E4ECE9",
        patternFg: "#C7D8D1",
        border: "#1A2E28",
        borderSoft: "#A9C0B7",
        ink: "#12211D",
        sub: "#334C45",
        muted: "#5C766E",
        accent: "#0D8A64",
        accentFg: "#FFFFFF",
        secondary: "#0274A6",
        tertiary: "#B45309",
        highlight: "#D97706",
      },
      dark: {
        bg: "#0B1115",
        surface: "#111A20",
        patternBg: "#16222B",
        patternFg: "#243642",
        border: "#2E4756",
        borderSoft: "#223642",
        ink: "#E5F3F0",
        sub: "#A3C2BC",
        muted: "#6F918A",
        accent: "#34D399",
        accentFg: "#061510",
        secondary: "#38BDF8",
        tertiary: "#FBBF24",
        highlight: "#F472B6",
      },
    },
  },
  "pixel-rpg-hud": {
    name: "16-bit Pixel RPG HUD",
    category: "Retro Game UI",
    tokens: {
      light: {
        bg: "#F6F2E4",
        surface: "#FFFDF6",
        patternBg: "#EAE4D1",
        patternFg: "#D9D1BA",
        border: "#1B1E2E",
        borderSoft: "#D5CEBA",
        ink: "#1B1E2E",
        sub: "#434963",
        muted: "#6F7591",
        accent: "#D97706",
        accentFg: "#FFFFFF",
        secondary: "#DC2626",
        tertiary: "#15803D",
        highlight: "#2563EB",
      },
      dark: {
        bg: "#121524",
        surface: "#191E33",
        patternBg: "#1E2540",
        patternFg: "#2B3457",
        border: "#EAB308",
        borderSoft: "#2F385C",
        ink: "#F6F4EA",
        sub: "#B8C0DC",
        muted: "#7F8AAD",
        accent: "#FACC15",
        accentFg: "#121524",
        secondary: "#F87171",
        tertiary: "#4ADE80",
        highlight: "#38BDF8",
      },
    },
  },
  "seal-ink-scroll": {
    name: "Seal Ink Monograph",
    category: "East Asian Print",
    tokens: {
      light: {
        bg: "#F7F3EA",
        surface: "#FCF9F2",
        patternBg: "#EFE8DA",
        patternFg: "#DCD2BF",
        border: "#2B2622",
        borderSoft: "#DED5C5",
        ink: "#1C1917",
        sub: "#4E4740",
        muted: "#847B70",
        accent: "#C4362C",
        accentFg: "#FCF9F2",
        secondary: "#2C5E5A",
        tertiary: "#7C5C3B",
        highlight: "#B5842A",
      },
      dark: {
        bg: "#141311",
        surface: "#1B1916",
        patternBg: "#221F1B",
        patternFg: "#322E28",
        border: "#D6CCB9",
        borderSoft: "#35312A",
        ink: "#F2ECE1",
        sub: "#C2B9AA",
        muted: "#8C8274",
        accent: "#E0564A",
        accentFg: "#141311",
        secondary: "#56A39B",
        tertiary: "#C79C6D",
        highlight: "#DFB35B",
      },
    },
  },
};

function loadThemes() {
  const result = structuredClone(FALLBACK_THEMES);
  const themesDir = path.join(REPO_ROOT, "themes");
  if (!fs.existsSync(themesDir)) return result;
  for (const id of Object.keys(result)) {
    const metaPath = path.join(themesDir, id, "meta.json");
    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
        if (meta.tokens?.light && meta.tokens?.dark) {
          result[id] = {
            name: meta.name || result[id].name,
            category: meta.category || result[id].category,
            tokens: meta.tokens,
          };
        }
      } catch {
        /* keep fallback */
      }
    }
  }
  return result;
}

function escapeXml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fitText(text, maxPx, fontSize, mono = false) {
  const s = String(text ?? "").trim();
  const factor = mono ? 0.62 : 0.56;
  const maxChars = Math.max(4, Math.floor(maxPx / (fontSize * factor)));
  if (s.length <= maxChars) return s;
  return `${s.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`;
}

function wrapText(text, maxPx, fontSize, maxLines = 2, mono = false) {
  const words = String(text ?? "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const factor = mono ? 0.62 : 0.56;
  const maxChars = Math.max(8, Math.floor(maxPx / (fontSize * factor)));
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= maxChars) {
      cur = next;
    } else {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (lines.length === maxLines) {
    lines[maxLines - 1] = fitText(lines[maxLines - 1], maxPx, fontSize, mono);
  }
  return lines;
}

function chamferPolygon(x, y, w, h, cut = 7) {
  const x2 = x + w;
  const y2 = y + h;
  return `${x + cut},${y} ${x2 - cut},${y} ${x2},${y + cut} ${x2},${y2 - cut} ${x2 - cut},${y2} ${x + cut},${y2} ${x},${y2 - cut} ${x},${y + cut}`;
}

function contrastFg(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#FFFFFF";
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.54 ? "#111214" : "#FFFFFF";
}

function resolveTokens(base, accentOverride) {
  if (!accentOverride || !/^#[0-9a-fA-F]{6}$/.test(accentOverride)) return base;
  return { ...base, accent: accentOverride, accentFg: contrastFg(accentOverride) };
}

function renderBadgeSvg(themeId, t) {
  const w = 216;
  const h = 32;
  if (themeId === "blueprint-cad") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Styled with GitSkins">
  <title>Styled with GitSkins</title>
  <polygon points="${chamferPolygon(0.5, 0.5, w - 1, h - 1, 6)}" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <rect x="10" y="9" width="14" height="14" fill="none" stroke="${t.accent}" stroke-width="1.2"/>
  <rect x="14" y="13" width="6" height="6" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="32" y="19.5" font-family="${FONT_MONO}" font-size="10" fill="${t.muted}">STYLED WITH</text>
  <text x="112" y="19.5" font-family="${FONT_MONO}" font-size="10.5" font-weight="700" fill="${t.ink}">GITSKINS</text>
  <text x="${w - 12}" y="19.5" text-anchor="end" font-family="${FONT_MONO}" font-size="10" font-weight="700" fill="${t.accent}">↗</text>
</svg>`;
  }
  if (themeId === "editorial-zine") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Styled with GitSkins">
  <title>Styled with GitSkins</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="2.4" fill="${t.border}"/>
  <rect x="12" y="13" width="6" height="6" fill="${t.accent}"/>
  <text x="26" y="20" font-family="${FONT_MONO}" font-size="9.5" fill="${t.muted}">SET IN</text>
  <text x="72" y="20.5" font-family="${FONT_SERIF}" font-size="13" font-weight="700" fill="${t.ink}">GitSkins</text>
  <text x="${w - 12}" y="20" text-anchor="end" font-family="${FONT_MONO}" font-size="9.5" fill="${t.accent}">MONOGRAPH ↗</text>
</svg>`;
  }
  if (themeId === "crt-terminal") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Styled with GitSkins">
  <title>Styled with GitSkins</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <rect x="1" y="1" width="54" height="${h - 2}" fill="${t.accent}"/>
  <text x="28" y="20" text-anchor="middle" font-family="${FONT_MONO}" font-size="9.5" font-weight="700" fill="${t.accentFg}">SKIN</text>
  <text x="66" y="20" font-family="${FONT_MONO}" font-size="10.5" font-weight="700" fill="${t.ink}">GitSkins</text>
  <text x="${w - 10}" y="20" text-anchor="end" font-family="${FONT_MONO}" font-size="9.5" fill="${t.muted}">[SVG] ↗</text>
</svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Styled with GitSkins">
  <title>Styled with GitSkins</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <rect x="8" y="7" width="18" height="18" fill="#111214" shape-rendering="crispEdges"/>
  <rect x="10.5" y="9.5" width="13" height="13" fill="none" stroke="#F4F3EE" stroke-width="1"/>
  <rect x="12" y="11" width="5" height="4" fill="#00A3CC" shape-rendering="crispEdges"/>
  <rect x="18" y="11" width="4" height="4" fill="#F4F3EE" shape-rendering="crispEdges"/>
  <rect x="12" y="16" width="4" height="5" fill="#F4F3EE" shape-rendering="crispEdges"/>
  <rect x="17" y="16" width="5" height="5" fill="#E45847" shape-rendering="crispEdges"/>
  <text x="34" y="19.5" font-family="${FONT_MONO}" font-size="9.5" fill="${t.muted}">STYLED WITH</text>
  <text x="116" y="20" font-family="${FONT_SANS}" font-size="12" font-weight="800" fill="${t.ink}">GitSkins</text>
  <text x="${w - 10}" y="19.5" text-anchor="end" font-family="${FONT_MONO}" font-size="10" font-weight="700" fill="${t.accent}">↗</text>
</svg>`;
}

function renderRepoHero(meta, themeId, mode, t, animated) {
  const w = 846;
  const h = 248;
  const uid = `cli-rh-${themeId}-${mode}`;
  const slug = `${meta.owner}/${meta.name}`;
  const safeName = escapeXml(fitText(meta.name.toUpperCase(), 520, 38, false));
  const tagLines = wrapText(meta.tagline, 510, 13, 2, false);
  const style =
    animated && themeId === "blueprint-cad"
      ? `<style>
    @keyframes spin_${uid} { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .ring-${uid} { transform-origin: 716px 112px; animation: spin_${uid} 18s linear infinite; }
    @media (prefers-reduced-motion: reduce) { .ring-${uid} { animation: none !important; } }
  </style>`
      : "";

  if (themeId === "blueprint-cad") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(slug)}">
  <title>${escapeXml(slug)} — Blueprint Repo Hero</title>
  <defs>
    <pattern id="g-${uid}" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="${t.borderSoft}" stroke-opacity="0.55" stroke-width="0.7"/>
    </pattern>
  </defs>
  ${style}
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="url(#g-${uid})"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="none" stroke="${t.border}" stroke-width="1.3"/>
  <rect x="8.5" y="8.5" width="${w - 17}" height="${h - 17}" fill="none" stroke="${t.border}" stroke-opacity="0.45" stroke-width="0.9"/>
  <line x1="8.5" y1="34.5" x2="${w - 8.5}" y2="34.5" stroke="${t.border}" stroke-opacity="0.6" stroke-width="0.9"/>
  <text x="24" y="24.5" font-family="${FONT_MONO}" font-size="9.5" font-weight="700" fill="${t.muted}">REPO SPEC // ${escapeXml(slug.toUpperCase())} · ${escapeXml(meta.version)}</text>
  <text x="30" y="62" font-family="${FONT_MONO}" font-size="9.5" font-weight="700" fill="${t.accent}">ASSEMBLY 01 // OPEN-SOURCE REPOSITORY</text>
  <text x="30" y="106" font-family="${FONT_SANS}" font-size="36" font-weight="800" fill="${t.ink}">${safeName}</text>
  ${tagLines.map((l, i) => `<text x="30" y="${134 + i * 20}" font-family="${FONT_SANS}" font-size="13" fill="${t.sub}">${escapeXml(l)}</text>`).join("\n  ")}
  <circle cx="716" cy="112" r="50" fill="none" stroke="${t.borderSoft}" stroke-dasharray="3 3" stroke-width="1"/>
  <g class="ring-${uid}"><path d="M 716 62 A 50 50 0 0 1 761 91" fill="none" stroke="${t.accent}" stroke-width="2.2"/></g>
  <polygon points="716,86 740,100 740,126 716,140 692,126 692,100" fill="${t.patternBg}" stroke="${t.accent}" stroke-width="1.3"/>
  <line x1="8.5" y1="186.5" x2="${w - 8.5}" y2="186.5" stroke="${t.border}" stroke-width="1"/>
  <text x="26" y="206" font-family="${FONT_MONO}" font-size="8.5" fill="${t.muted}">LANGUAGE</text>
  <text x="26" y="226" font-family="${FONT_MONO}" font-size="13.5" font-weight="700" fill="${t.ink}">${escapeXml(meta.language)}</text>
  <text x="250" y="206" font-family="${FONT_MONO}" font-size="8.5" fill="${t.muted}">RELEASE / LICENSE</text>
  <text x="250" y="226" font-family="${FONT_MONO}" font-size="13.5" font-weight="700" fill="${t.accent}">${escapeXml(meta.version)} · ${escapeXml(meta.license)}</text>
  <text x="520" y="206" font-family="${FONT_MONO}" font-size="8.5" fill="${t.muted}">REPOSITORY</text>
  <text x="520" y="226" font-family="${FONT_MONO}" font-size="12.5" font-weight="700" fill="${t.ink}">${escapeXml(fitText(slug, 300, 12.5, true))}</text>
</svg>`;
  }

  if (themeId === "editorial-zine") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(slug)}">
  <title>${escapeXml(slug)} — Editorial Repo Hero</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="24" y="14" width="798" height="2.4" fill="${t.border}"/>
  <line x1="24" y1="20.5" x2="822" y2="20.5" stroke="${t.border}" stroke-width="0.8"/>
  <text x="24" y="37" font-family="${FONT_MONO}" font-size="9.5" fill="${t.muted}">REPOSITORY MONOGRAPH · ${escapeXml(meta.owner.toUpperCase())}</text>
  <text x="822" y="37" text-anchor="end" font-family="${FONT_MONO}" font-size="9.5" fill="${t.muted}">${escapeXml(meta.version)} · ${escapeXml(meta.license)}</text>
  <line x1="24" y1="45.5" x2="822" y2="45.5" stroke="${t.border}" stroke-width="1"/>
  <rect x="26" y="64" width="6" height="6" fill="${t.accent}"/>
  <text x="40" y="71" font-family="${FONT_MONO}" font-size="9.5" font-weight="700" fill="${t.accent}">${escapeXml(meta.language.toUpperCase())} · OPEN SOURCE</text>
  <text x="26" y="124" font-family="${FONT_SERIF}" font-size="42" font-weight="700" fill="${t.ink}">${escapeXml(fitText(meta.name, 520, 42))}<tspan fill="${t.accent}">.</tspan></text>
  ${tagLines.map((l, i) => `<text x="26" y="${158 + i * 23}" font-family="${FONT_SERIF}" font-size="15" font-style="italic" fill="${t.sub}">${escapeXml(l)}</text>`).join("\n  ")}
  <line x1="24" y1="214" x2="822" y2="214" stroke="${t.borderSoft}" stroke-width="0.9"/>
  <text x="26" y="232" font-family="${FONT_MONO}" font-size="9.5" fill="${t.muted}">GITHUB.COM/${escapeXml(slug.toUpperCase())}</text>
</svg>`;
  }

  if (themeId === "crt-terminal") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(slug)}">
  <title>${escapeXml(slug)} — CRT Repo Hero</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <rect x="1" y="1" width="${w - 2}" height="26" fill="${t.patternBg}"/>
  <line x1="1" y1="27.5" x2="${w - 1}" y2="27.5" stroke="${t.border}" stroke-width="1"/>
  <circle cx="16" cy="14" r="3.8" fill="#F87171"/>
  <circle cx="29" cy="14" r="3.8" fill="${t.highlight}"/>
  <circle cx="42" cy="14" r="3.8" fill="${t.accent}"/>
  <text x="423" y="18" text-anchor="middle" font-family="${FONT_MONO}" font-size="10.5" fill="${t.sub}">${escapeXml(slug)} — README.md</text>
  <text x="28" y="64" font-family="${FONT_MONO}" font-size="11" font-weight="700" fill="${t.accent}">$ repo-fetch --info</text>
  <text x="28" y="110" font-family="${FONT_MONO}" font-size="34" font-weight="700" fill="${t.ink}">${safeName}</text>
  ${tagLines.map((l, i) => `<text x="28" y="${142 + i * 21}" font-family="${FONT_MONO}" font-size="12" fill="${t.sub}">${escapeXml(l)}</text>`).join("\n  ")}
  <rect x="1" y="223" width="${w - 2}" height="24" fill="${t.patternBg}"/>
  <line x1="1" y1="222.5" x2="${w - 1}" y2="222.5" stroke="${t.border}" stroke-width="1"/>
  <rect x="10" y="227" width="60" height="16" fill="${t.accent}"/>
  <text x="40" y="238.5" text-anchor="middle" font-family="${FONT_MONO}" font-size="9.5" font-weight="700" fill="${t.accentFg}">REPO</text>
  <text x="82" y="238.5" font-family="${FONT_MONO}" font-size="10" fill="${t.ink}">${escapeXml(meta.language)} · ${escapeXml(meta.version)} · ${escapeXml(meta.license)}</text>
</svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(slug)}">
  <title>${escapeXml(slug)} — Swiss-Bauhaus Repo Hero</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <line x1="0.5" y1="34.5" x2="${w - 0.5}" y2="34.5" stroke="${t.border}" stroke-width="1"/>
  <line x1="595.5" y1="34.5" x2="595.5" y2="194.5" stroke="${t.border}" stroke-width="1"/>
  <line x1="0.5" y1="194.5" x2="${w - 0.5}" y2="194.5" stroke="${t.border}" stroke-width="1"/>
  <rect x="16" y="12" width="10" height="10" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="34" y="21" font-family="${FONT_MONO}" font-size="11" font-weight="700" fill="${t.ink}">${escapeXml(slug)}</text>
  <text x="26" y="60" font-family="${FONT_MONO}" font-size="10" font-weight="700" fill="${t.accent}">(repository) · ${escapeXml(meta.version)}</text>
  <text x="24" y="108" font-family="${FONT_SANS}" font-size="40" font-weight="800" fill="${t.ink}">${safeName}</text>
  ${tagLines.map((l, i) => `<text x="26" y="${136 + i * 20}" font-family="${FONT_SANS}" font-size="13" fill="${t.sub}">${escapeXml(l)}</text>`).join("\n  ")}
  <rect x="652" y="54" width="128" height="122" fill="${t.surface}" stroke="${t.border}" stroke-width="1.2"/>
  <rect x="665" y="67" width="46" height="36" fill="${t.accent}" shape-rendering="crispEdges"/>
  <rect x="719" y="67" width="46" height="36" fill="${t.ink}" shape-rendering="crispEdges"/>
  <rect x="665" y="111" width="32" height="46" fill="${t.ink}" shape-rendering="crispEdges"/>
  <rect x="705" y="111" width="60" height="46" fill="${t.secondary}" shape-rendering="crispEdges"/>
  <text x="20" y="216" font-family="${FONT_MONO}" font-size="9" font-weight="700" fill="${t.muted}">LANGUAGE</text>
  <text x="20" y="236" font-family="${FONT_MONO}" font-size="14" font-weight="800" fill="${t.ink}">${escapeXml(meta.language)}</text>
  <text x="240" y="216" font-family="${FONT_MONO}" font-size="9" font-weight="700" fill="${t.muted}">LICENSE</text>
  <text x="240" y="236" font-family="${FONT_MONO}" font-size="14" font-weight="800" fill="${t.ink}">${escapeXml(meta.license)}</text>
  <text x="460" y="216" font-family="${FONT_MONO}" font-size="9" font-weight="700" fill="${t.muted}">VERSION</text>
  <text x="460" y="236" font-family="${FONT_MONO}" font-size="14" font-weight="800" fill="${t.accent}">${escapeXml(meta.version)}</text>
</svg>`;
}

function renderRepoInstall(meta, themeId, mode, t, animated) {
  const w = 846;
  const h = 72;
  const uid = `cli-ri-${themeId}-${mode}`;
  const cmd = escapeXml(`$ ${fitText(meta.install, 540, 13, true)}`);
  const style = animated
    ? `<style>
    @keyframes cur_${uid} { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.15; } }
    .cur-${uid} { animation: cur_${uid} 1.4s steps(1, end) infinite; }
    @media (prefers-reduced-motion: reduce) { .cur-${uid} { animation: none !important; } }
  </style>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Quick Install">
  <title>Quick Install</title>
  ${style}
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <rect x="1" y="1" width="136" height="${h - 2}" fill="${themeId === "crt-terminal" ? t.patternBg : t.ink}"/>
  <text x="69" y="40" text-anchor="middle" font-family="${FONT_MONO}" font-size="10" font-weight="700" fill="${themeId === "crt-terminal" ? t.accent : t.bg}">INSTALL</text>
  <text x="156" y="41" font-family="${FONT_MONO}" font-size="13" font-weight="700" fill="${t.ink}">${cmd}</text>
  <rect class="cur-${uid}" x="816" y="29" width="7" height="14" fill="${t.accent}"/>
</svg>`;
}

function renderRepoFeature(feat, idx, themeId, t) {
  const w = 417;
  const h = 152;
  const colors = [t.accent, t.secondary, t.tertiary, t.highlight];
  const col = colors[idx % colors.length];
  const num = String(idx + 1).padStart(2, "0");
  const lines = wrapText(feat.desc, 372, 12.2, 2, themeId === "crt-terminal");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(feat.title)}">
  <title>${escapeXml(feat.title)}</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <rect x="1" y="1" width="${w - 2}" height="3" fill="${col}"/>
  <text x="16" y="27" font-family="${FONT_MONO}" font-size="9.5" font-weight="700" fill="${col}">[${num}] ${escapeXml(feat.tag.toUpperCase())}</text>
  <text x="16" y="64" font-family="${themeId === "editorial-zine" ? FONT_SERIF : themeId === "crt-terminal" ? FONT_MONO : FONT_SANS}" font-size="${themeId === "crt-terminal" ? 14.5 : 18}" font-weight="800" fill="${t.ink}">${escapeXml(fitText(feat.title, 368, 18))}</text>
  ${lines.map((l, i) => `<text x="16" y="${94 + i * 20}" font-family="${themeId === "crt-terminal" ? FONT_MONO : FONT_SANS}" font-size="12" fill="${t.sub}">${escapeXml(l)}</text>`).join("\n  ")}
</svg>`;
}

function renderRepoArch(archSpec, themeId, mode, t, animated) {
  const w = 846;
  const h = 168;
  const uid = `cli-ra-${themeId}-${mode}`;
  const stages = archSpec
    .split(/->|→/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4)
    .map((part, idx) => {
      const [title, sub] = part.split("|").map((x) => x.trim());
      return { title: title || `Stage ${idx + 1}`, sub: sub || `Step 0${idx + 1}` };
    });
  const n = Math.max(2, stages.length);
  const padX = 24;
  const gap = 36;
  const boxW = Math.floor((w - padX * 2 - gap * (n - 1)) / n);
  const boxH = 86;
  const boxY = 54;
  const colors = [t.accent, t.secondary, t.tertiary, t.highlight];
  const style = animated
    ? `<style>
    @keyframes flow_${uid} { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }
    .pulse-${uid} { animation: flow_${uid} 2.2s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) { .pulse-${uid} { animation: none !important; } }
  </style>`
    : "";

  const nodes = stages
    .map((st, idx) => {
      const bx = padX + idx * (boxW + gap);
      const col = colors[idx % colors.length];
      const arrowX1 = bx + boxW + 4;
      const arrowX2 = bx + boxW + gap - 6;
      const ay = boxY + boxH / 2;
      const conn =
        idx < stages.length - 1
          ? `<line x1="${arrowX1}" y1="${ay}" x2="${arrowX2}" y2="${ay}" stroke="${t.border}" stroke-width="1.3"/>
  <polygon points="${arrowX2 - 5},${ay - 4} ${arrowX2 + 2},${ay} ${arrowX2 - 5},${ay + 4}" fill="${col}"/>
  <circle class="pulse-${uid}" cx="${Math.round((arrowX1 + arrowX2) / 2)}" cy="${ay}" r="3" fill="${col}"/>`
          : "";
      return `<rect x="${bx}" y="${boxY}" width="${boxW}" height="${boxH}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <rect x="${bx}" y="${boxY}" width="${boxW}" height="3" fill="${col}"/>
  <text x="${bx + 12}" y="${boxY + 24}" font-family="${FONT_MONO}" font-size="9" font-weight="700" fill="${col}">0${idx + 1}</text>
  <text x="${bx + 12}" y="${boxY + 49}" font-family="${FONT_SANS}" font-size="13.5" font-weight="800" fill="${t.ink}">${escapeXml(fitText(st.title, boxW - 24, 13.5))}</text>
  <text x="${bx + 12}" y="${boxY + 69}" font-family="${FONT_MONO}" font-size="10" fill="${t.muted}">${escapeXml(fitText(st.sub, boxW - 24, 10, true))}</text>
  ${conn}`;
    })
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Architecture Flow">
  <title>Architecture Flow</title>
  ${style}
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <rect x="1" y="1" width="${w - 2}" height="32" fill="${t.patternBg}"/>
  <line x1="0.5" y1="33.5" x2="${w - 0.5}" y2="33.5" stroke="${t.border}" stroke-width="1"/>
  <text x="16" y="21" font-family="${FONT_MONO}" font-size="10" font-weight="700" fill="${t.ink}">ARCHITECTURE PIPELINE</text>
  <text x="${w - 16}" y="21" text-anchor="end" font-family="${FONT_MONO}" font-size="9.5" fill="${t.muted}">${stages.length} STAGES · STATIC SVG</text>
  ${nodes}
</svg>`;
}

/**
 * Pure-JS strict SVG XML & GitHub safety validator (zero external dependencies)
 */
function validateSvgString(raw) {
  const errors = [];
  const trimmed = raw.trim();
  if (!trimmed.startsWith("<svg") || !trimmed.endsWith("</svg>")) {
    errors.push("Must start with <svg and end with </svg>");
  }
  if (/<script[\s>]/i.test(trimmed)) {
    errors.push("Contains forbidden <script> tag");
  }
  if (/\son[a-z]+\s*=/i.test(trimmed)) {
    errors.push("Contains forbidden inline event handler (on*=)");
  }
  if (/<image[^>]+href\s*=\s*["']https?:/i.test(trimmed)) {
    errors.push("Contains external remote <image> URL");
  }
  if (/@keyframes\b/.test(trimmed) && !/prefers-reduced-motion\s*:\s*reduce/.test(trimmed)) {
    errors.push("Uses @keyframes without @media (prefers-reduced-motion: reduce)");
  }

  // Strip comments and <style> text for XML tag/entity validation
  const withoutComments = trimmed.replace(/<!--[\s\S]*?-->/g, "");
  const withoutStyle = withoutComments.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "<style/>");

  // Detect unescaped ampersands
  const badAmp = withoutStyle.match(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/);
  if (badAmp) {
    errors.push("Contains unescaped '&' entity");
  }

  // Strict XML tag balance check
  const tagRe = /<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[^\s=/>]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>/g;
  const stack = [];
  let lastIdx = 0;
  let m;
  while ((m = tagRe.exec(withoutStyle)) !== null) {
    const between = withoutStyle.slice(lastIdx, m.index);
    if (between.includes("<") || between.includes(">")) {
      errors.push("Malformed tag bracket inside text node");
      break;
    }
    lastIdx = tagRe.lastIndex;
    const isClose = m[1] === "/";
    const tag = m[2];
    const isSelf = m[4] === "/";
    if (isClose && isSelf) {
      errors.push(`Invalid self-closing end tag </${tag}/>`);
      break;
    }
    if (isClose) {
      const top = stack.pop();
      if (top !== tag) {
        errors.push(`Mismatched closing tag </${tag}> (expected </${top || "EOF"}>)`);
        break;
      }
    } else if (!isSelf) {
      stack.push(tag);
    }
  }
  const trailing = withoutStyle.slice(lastIdx);
  if (trailing.includes("<") || trailing.includes(">")) {
    errors.push("Unclosed tag bracket near end of SVG");
  }
  if (stack.length > 0) {
    errors.push(`Unclosed XML tags: ${stack.join(", ")}`);
  }
  return errors;
}

function collectSvgFiles(targetPath) {
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) return targetPath.endsWith(".svg") ? [targetPath] : [];
  const out = [];
  for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
    const full = path.join(targetPath, entry.name);
    if (entry.isDirectory()) out.push(...collectSvgFiles(full));
    else if (entry.name.endsWith(".svg")) out.push(full);
  }
  return out.sort();
}

function detectLocalRepoSlug(cwd) {
  try {
    const remote = execSync("git remote get-url origin", {
      cwd,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    const m = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)/i);
    if (m) return `${m[1]}/${m[2]}`;
  } catch {
    /* ignore */
  }
  const pkgPath = path.join(cwd, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      if (pkg.name) return `owner/${pkg.name.replace(/^@[^/]+\//, "")}`;
    } catch {
      /* ignore */
    }
  }
  return "owner/my-project";
}

function parseFlags(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i];
    if (tok.startsWith("--")) {
      const eq = tok.indexOf("=");
      if (eq > 0) {
        flags[tok.slice(2, eq)] = tok.slice(eq + 1);
      } else {
        const key = tok.slice(2);
        const next = argv[i + 1];
        if (next && !next.startsWith("--")) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else {
      positional.push(tok);
    }
  }
  return { flags, positional };
}

function printHelp() {
  console.log(`GitSkins CLI v0.6.0 — Zero-dependency GitHub Profile & Repo Skin toolkit

Usage:
  gitskins list
  gitskins init --mode <repo|profile> --theme <id> [options]
  gitskins validate <dir-or-svg>

Options for init:
  --mode <repo|profile>   Target mode (default: repo)
  --theme <id>            swiss-bauhaus-pixel | blueprint-cad | editorial-zine | crt-terminal | pixel-rpg-hud | seal-ink-scroll
  --out <dir>             Output directory (default: .)
  --repo <owner/name>     Repository slug for repo mode (auto-detected if omitted)
  --tagline <text>        Project tagline for repo mode
  --install <cmd>         Quick install command for repo mode
  --arch <spec>           Architecture stages ("A | sub -> B | sub -> C | sub")
  --widgets <csv>         Live Actions widgets for profile mode (e.g. github-stats:2,coding-rhythm:2)
  --city <name>           City for live-weather (default: Shanghai)
  --tz-offset <int>       UTC offset for coding-rhythm (default: 8)
  --rss-url <url>         RSS/Atom URL for rss-feed
  --accent <hex>          Accent color override (e.g. #00A3CC)
  --static                Disable CSS @keyframes animations
  --badge                 Include 216x32 "Styled with GitSkins" footer badge
`);
}

function runList(themes) {
  console.log("GitSkins Themes:");
  for (const [id, info] of Object.entries(themes)) {
    console.log(`  - ${id.padEnd(22)} ${info.name} (${info.category})`);
  }
  console.log("\nStatic DIY Widgets (W01-W08):");
  console.log(
    "  pixel-companion, now-playing, dev-badge, skill-dock, quote-banner, hero-sticker, pixel-runway, mini-tile"
  );
  console.log("\nZero-503 Live Actions Widgets (L01-L06):");
  console.log("  github-stats, coding-rhythm, rss-feed, live-weather, wakatime-weekly, spotify-recent");
  console.log("\nRepo Skin Modules (R01-R05):");
  console.log("  repo-hero (846x248), repo-install (846x72), repo-feat (417x152), repo-arch (846x168), gitskins-badge (216x32)");
}

function runInit(flags, themes) {
  const mode = String(flags.mode || "repo");
  const themeId = String(flags.theme || "swiss-bauhaus-pixel");
  if (!themes[themeId]) {
    console.error(`Unknown theme "${themeId}". Available: ${Object.keys(themes).join(", ")}`);
    process.exit(1);
  }
  const outDir = path.resolve(process.cwd(), String(flags.out || "."));
  const assetsDir = path.join(outDir, "assets");
  fs.mkdirSync(assetsDir, { recursive: true });

  const accent = typeof flags.accent === "string" ? flags.accent : "";
  const animated = !flags.static;
  const showBadge = Boolean(flags.badge);
  const lightT = resolveTokens(themes[themeId].tokens.light, accent);
  const darkT = resolveTokens(themes[themeId].tokens.dark, accent);

  if (mode === "profile") {
    const widgetsArg = String(flags.widgets || "github-stats:2,coding-rhythm:2,live-weather:1,rss-feed:3");
    const city = String(flags.city || "Shanghai");
    const tzOffset = String(flags["tz-offset"] ?? "8");
    const rssUrl = String(flags["rss-url"] || "");
    const wfDir = path.join(outDir, ".github", "workflows");
    fs.mkdirSync(wfDir, { recursive: true });

    const extraFlags = [
      accent ? `            --accent "${accent}" \\` : "",
      !animated ? `            --static \\` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const yaml = `name: Update GitSkins Live Widgets

on:
  schedule:
    - cron: "0 */6 * * *"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  update-live-widgets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Generate live SVGs (zero pip deps)
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          if [ ! -f scripts/generate_live_widgets.py ]; then
            mkdir -p scripts
            curl -fsSL "${RAW_LIVE_GENERATOR_URL}" -o scripts/generate_live_widgets.py
          fi
          python scripts/generate_live_widgets.py \\
            --username "\${{ github.repository_owner }}" \\
            --theme "${themeId}" \\
            --widgets "${widgetsArg}" \\
            --city "${city}" \\
            --tz-offset "${tzOffset}" \\
            --rss-url "${rssUrl}" \\
${extraFlags ? extraFlags + "\n" : ""}            --out-dir "assets"
      - name: Commit & push updated SVGs
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add assets/live-*.svg
          if ! git diff --cached --quiet; then
            git commit -m "chore(gitskins): refresh live profile widgets"
            git push
          fi
`;
    fs.writeFileSync(path.join(wfDir, "gitskins-widgets.yml"), yaml, "utf-8");

    const srcPy = path.join(REPO_ROOT, "live-widgets", "generate_live_widgets.py");
    if (fs.existsSync(srcPy)) {
      const scriptsDir = path.join(outDir, "scripts");
      fs.mkdirSync(scriptsDir, { recursive: true });
      fs.copyFileSync(srcPy, path.join(scriptsDir, "generate_live_widgets.py"));
    }

    if (showBadge) {
      fs.writeFileSync(path.join(assetsDir, "gitskins-badge-light.svg"), renderBadgeSvg(themeId, lightT));
      fs.writeFileSync(path.join(assetsDir, "gitskins-badge-dark.svg"), renderBadgeSvg(themeId, darkT));
    }
    console.log(`[gitskins] Initialized profile live-widget kit (${themeId}) in ${outDir}`);
    return;
  }

  // Repo Skin mode
  const slug = String(flags.repo || detectLocalRepoSlug(process.cwd()));
  const [owner, name] = slug.includes("/") ? slug.split("/") : ["owner", slug];
  const meta = {
    owner,
    name,
    version: String(flags.version || "v1.0.0"),
    license: String(flags.license || "MIT"),
    language: String(flags.lang || "TypeScript"),
    tagline: String(
      flags.tagline || `Deterministic open-source tooling maintained by @${owner}.`
    ),
    install: String(flags.install || `npm install ${name}`),
    arch: String(
      flags.arch ||
        `Input | CLI / API -> ${name} Core | Processing -> Validator | Strict Checks -> Output | Static Artifacts`
    ),
    features: [
      { tag: "CORE", title: "Deterministic Architecture", desc: "Predictable outputs with zero runtime surprises." },
      { tag: "FAST", title: "Zero-Bloat Execution", desc: "Lean footprint built for rapid local and CI workflows." },
      { tag: "SAFE", title: "Strict Validation", desc: "Automated verification checks built directly into the build." },
      { tag: "OPEN", title: "MIT Open Source", desc: "Clean code, clear docs, and straightforward contribution paths." },
    ],
  };

  const writtenSvgs = [];
  const writeSvg = (filename, content) => {
    const full = path.join(assetsDir, filename);
    fs.writeFileSync(full, content, "utf-8");
    writtenSvgs.push(full);
  };

  writeSvg("repo-hero-light.svg", renderRepoHero(meta, themeId, "light", lightT, animated));
  writeSvg("repo-hero-dark.svg", renderRepoHero(meta, themeId, "dark", darkT, animated));
  writeSvg("repo-install-light.svg", renderRepoInstall(meta, themeId, "light", lightT, animated));
  writeSvg("repo-install-dark.svg", renderRepoInstall(meta, themeId, "dark", darkT, animated));
  meta.features.forEach((f, idx) => {
    const n = String(idx + 1).padStart(2, "0");
    writeSvg(`repo-feat-${n}-light.svg`, renderRepoFeature(f, idx, themeId, lightT));
    writeSvg(`repo-feat-${n}-dark.svg`, renderRepoFeature(f, idx, themeId, darkT));
  });
  writeSvg("repo-arch-light.svg", renderRepoArch(meta.arch, themeId, "light", lightT, animated));
  writeSvg("repo-arch-dark.svg", renderRepoArch(meta.arch, themeId, "dark", darkT, animated));
  if (showBadge) {
    writeSvg("gitskins-badge-light.svg", renderBadgeSvg(themeId, lightT));
    writeSvg("gitskins-badge-dark.svg", renderBadgeSvg(themeId, darkT));
  }

  const readmeName = fs.existsSync(path.join(outDir, "README.md")) ? "README.gitskins.md" : "README.md";
  const readmeContent = `<!-- Generated with GitSkins CLI (${themeId}) -->

<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/repo-hero-dark.svg">
    <img src="./assets/repo-hero-light.svg" alt="${owner}/${name}" width="100%">
  </picture>
</p>

<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/repo-install-dark.svg">
    <img src="./assets/repo-install-light.svg" alt="Install ${name}" width="100%">
  </picture>
</p>

<p>
  <picture><source media="(prefers-color-scheme: dark)" srcset="./assets/repo-feat-01-dark.svg"><img src="./assets/repo-feat-01-light.svg" alt="${meta.features[0].title}" width="49%"></picture>&nbsp;<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/repo-feat-02-dark.svg"><img src="./assets/repo-feat-02-light.svg" alt="${meta.features[1].title}" width="49%"></picture>
</p>
<p>
  <picture><source media="(prefers-color-scheme: dark)" srcset="./assets/repo-feat-03-dark.svg"><img src="./assets/repo-feat-03-light.svg" alt="${meta.features[2].title}" width="49%"></picture>&nbsp;<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/repo-feat-04-dark.svg"><img src="./assets/repo-feat-04-light.svg" alt="${meta.features[3].title}" width="49%"></picture>
</p>

<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/repo-arch-dark.svg">
    <img src="./assets/repo-arch-light.svg" alt="Architecture Flow" width="100%">
  </picture>
</p>
${
  showBadge
    ? `\n<p align="right">\n  <a href="https://gitskins.blessc.com">\n    <picture>\n      <source media="(prefers-color-scheme: dark)" srcset="./assets/gitskins-badge-dark.svg">\n      <img src="./assets/gitskins-badge-light.svg" alt="Styled with GitSkins" height="32">\n    </picture>\n  </a>\n</p>\n`
    : ""
}`;
  fs.writeFileSync(path.join(outDir, readmeName), readmeContent, "utf-8");

  // Validate all generated SVGs immediately
  let failed = 0;
  for (const file of writtenSvgs) {
    const errs = validateSvgString(fs.readFileSync(file, "utf-8"));
    if (errs.length > 0) {
      failed++;
      console.error(`FAIL ${file}: ${errs.join("; ")}`);
    }
  }
  if (failed > 0) process.exit(1);
  console.log(
    `[gitskins] Scaffolded ${writtenSvgs.length} XML-validated Repo Skin SVGs (${themeId}) + ${readmeName} in ${outDir}`
  );
}

function runValidate(target) {
  const abs = path.resolve(process.cwd(), target || "assets");
  if (!fs.existsSync(abs)) {
    console.error(`Path not found: ${abs}`);
    process.exit(1);
  }
  const files = collectSvgFiles(abs);
  if (files.length === 0) {
    console.error(`No .svg files found under ${abs}`);
    process.exit(1);
  }
  let failures = 0;
  for (const file of files) {
    const errs = validateSvgString(fs.readFileSync(file, "utf-8"));
    if (errs.length > 0) {
      failures++;
      console.error(`FAIL ${path.relative(process.cwd(), file)}: ${errs.join("; ")}`);
    }
  }
  if (failures > 0) {
    console.error(`[gitskins] Validation failed: ${failures}/${files.length} SVG(s) had errors.`);
    process.exit(1);
  }
  console.log(`[gitskins] Validated ${files.length} SVG(s) under ${abs} — all strict XML & GitHub-safe!`);
}

// Entrypoint
const [cmd, ...rest] = process.argv.slice(2);
const { flags, positional } = parseFlags(rest);
const themes = loadThemes();

if (!cmd || cmd === "-h" || cmd === "--help" || cmd === "help") {
  printHelp();
} else if (cmd === "list") {
  runList(themes);
} else if (cmd === "init") {
  runInit(flags, themes);
} else if (cmd === "validate") {
  runValidate(positional[0] || flags.dir);
} else {
  console.error(`Unknown command: ${cmd}`);
  printHelp();
  process.exit(1);
}
