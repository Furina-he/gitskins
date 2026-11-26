import type { Lang, PreviewMode, SkinTheme, ThemeTokens } from "../types";
import { renderGitSkinsBadgeSvg } from "../repo/renderRepoSkin";
import { packBentoRows, renderCompositeBentoRowSvg } from "../widgets/bento";
import { mergeStickerIntoHeroSvg } from "../widgets/catalog";
import { renderWidgetSvg } from "../widgets/renderers";
import { buildLiveWorkflowYaml, isLiveWidgetId } from "../widgets/workflow";
import {
  FONT_MONO,
  FONT_SANS,
  FONT_SERIF,
  bauhausWeave,
  chamferPolygon,
  escapeXml,
  estimateTextPx,
  fitText,
  resolveTokens,
  wrapText,
} from "../widgets/svgPrimitives";
import type {
  HeroStickerConfig,
  WidgetInstance,
  WidgetPlacement,
} from "../widgets/types";
import {
  stripProtocol,
  type GitHubRepoSummary,
  type LiveProfileData,
  type PixelAvatarVector,
} from "./githubApi";
import type { ZipFileEntry } from "./zipExport";

export type CopyLangPref = "auto" | "en" | "zh" | "bilingual";

export interface ProfileOverrides {
  accentOverride: string;
  cardCount: 2 | 4 | 6;
  animated: boolean;
  copyLang: CopyLangPref;
  showBadge: boolean;
}

export const DEFAULT_OVERRIDES: ProfileOverrides = {
  accentOverride: "",
  cardCount: 4,
  animated: true,
  copyLang: "auto",
  showBadge: false,
};

export function hasActiveOverrides(o: ProfileOverrides): boolean {
  return (
    Boolean(o.accentOverride) ||
    o.cardCount !== 4 ||
    !o.animated ||
    o.copyLang !== "auto" ||
    o.showBadge
  );
}

export interface ProfileButtonItem {
  id: string;
  label: string;
  url: string;
  svg: string;
}

export interface ProfileCardItem {
  id: string;
  title: string;
  url: string;
  svg: string;
}

export interface RenderedProfileSuite {
  hero: string;
  buttons: ProfileButtonItem[];
  secWork: string;
  secActivity: string;
  cards: ProfileCardItem[];
}

function fmtNum(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function getInitials(name: string): string {
  const parts = name
    .replace(/[^a-zA-Z0-9\s_-]/g, " ")
    .split(/[\s_-]+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  const clean = name.replace(/[^a-zA-Z0-9]/g, "");
  return (clean.slice(0, 2) || "GH").toUpperCase();
}

function renderPixelAvatarGroup(
  avatar: PixelAvatarVector | null,
  fallbackInitials: string,
  ox: number,
  oy: number,
  boxSize: number,
  t: ThemeTokens
): string {
  if (avatar && avatar.paths.length > 0) {
    const scale = +(boxSize / avatar.size).toFixed(4);
    const paths = avatar.paths
      .map((p) => `<path fill="${p.color}" d="${p.d}"/>`)
      .join("");
    return `<g transform="translate(${ox}, ${oy}) scale(${scale})" shape-rendering="crispEdges">${paths}</g>`;
  }
  const cx = ox + boxSize / 2;
  const cy = oy + boxSize / 2;
  return `
  <rect x="${ox}" y="${oy}" width="${boxSize}" height="${boxSize}" fill="${t.surface}"/>
  <rect x="${ox + 10}" y="${oy + 10}" width="${boxSize - 20}" height="${boxSize - 20}" fill="${t.patternBg}" stroke="${t.border}" stroke-width="1"/>
  <rect x="${ox + 18}" y="${oy + 18}" width="12" height="12" fill="${t.accent}" shape-rendering="crispEdges"/>
  <rect x="${ox + boxSize - 30}" y="${oy + boxSize - 30}" width="12" height="12" fill="${t.highlight}" shape-rendering="crispEdges"/>
  <text x="${cx}" y="${cy + 13}" text-anchor="middle" font-family='${FONT_MONO}' font-size="34" font-weight="700" fill="${t.ink}">${escapeXml(fallbackInitials)}</text>`;
}

function renderHeroForTheme(
  profile: LiveProfileData,
  theme: SkinTheme,
  mode: PreviewMode,
  t: ThemeTokens,
  animated: boolean
): string {
  const uid = `pr-${theme.id}-${mode}`;
  const initials = getInitials(profile.username);
  const stackLine = profile.topLanguages.join(" · ");
  const siteShort = profile.blog ? stripProtocol(profile.blog) : `github.com/${profile.username}`;
  const handleUpper = profile.username.toUpperCase();

  if (theme.id === "blueprint-cad") {
    const w = 846;
    const h = 300;
    const safeHandle = escapeXml(fitText(handleUpper, 480, 38, false));
    const safeSub = escapeXml(fitText(profile.bio, 510, 12.5, false));
    const safeNote = escapeXml(
      fitText(`${profile.displayName} · ${stackLine} · ${profile.location}`, 470, 10.5, true)
    );
    const cross = (cx: number, cy: number) =>
      `<g stroke="${t.border}" stroke-width="0.9" fill="none"><circle cx="${cx}" cy="${cy}" r="4"/><line x1="${cx - 7}" y1="${cy}" x2="${cx + 7}" y2="${cy}"/><line x1="${cx}" y1="${cy - 7}" x2="${cx}" y2="${cy + 7}"/></g>`;
    const style = animated
      ? `<style>
    @keyframes sweep_${uid} { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .orbit-${uid} { transform-origin: 706px 136px; animation: sweep_${uid} 16s linear infinite; }
    @media (prefers-reduced-motion: reduce) { .orbit-${uid} { animation: none !important; } }
  </style>`
      : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(profile.username)} — Architectural Blueprint CAD Profile">
  <title>${escapeXml(profile.username)} — Architectural Blueprint CAD</title>
  <defs>
    <pattern id="gmin-${uid}" width="12" height="12" patternUnits="userSpaceOnUse">
      <path d="M 12 0 L 0 0 0 12" fill="none" stroke="${t.borderSoft}" stroke-opacity="0.55" stroke-width="0.6"/>
    </pattern>
    <pattern id="gmaj-${uid}" width="48" height="48" patternUnits="userSpaceOnUse">
      <rect width="48" height="48" fill="url(#gmin-${uid})"/>
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="${t.borderSoft}" stroke-width="0.9"/>
    </pattern>
  </defs>
  ${style}
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="url(#gmaj-${uid})"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="none" stroke="${t.border}" stroke-width="1.4"/>
  <rect x="8.5" y="8.5" width="${w - 17}" height="${h - 17}" fill="none" stroke="${t.border}" stroke-opacity="0.45" stroke-width="0.9"/>
  ${cross(16, 16)}${cross(w - 16, 16)}${cross(16, h - 16)}${cross(w - 16, h - 16)}
  <line x1="8.5" y1="36.5" x2="${w - 8.5}" y2="36.5" stroke="${t.border}" stroke-opacity="0.6" stroke-width="0.9"/>
  <text x="30" y="26" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="0.8" fill="${t.muted}">DWG NO. GH-${escapeXml(fitText(handleUpper, 120, 9.5, true))}  ·  REV 2026  ·  SCALE 1:1</text>
  <rect x="646" y="18" width="6" height="6" fill="${t.tertiary}" shape-rendering="crispEdges"/>
  <text x="658" y="25" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.ink}">${escapeXml(fitText(siteShort, 160, 9.5, true))}</text>

  <text x="32" y="64" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="1.2" fill="${t.accent}">SPECIFICATION // DEVELOPER IDENTITY</text>
  <line x1="32" y1="76" x2="496" y2="76" stroke="${t.borderSoft}" stroke-dasharray="3 3" stroke-width="0.9"/>
  <text x="34" y="122" font-family='${FONT_SANS}' font-size="38" font-weight="800" letter-spacing="-0.02em" fill="${t.accent}" fill-opacity="0.28">${safeHandle}</text>
  <text x="32" y="120" font-family='${FONT_SANS}' font-size="38" font-weight="800" letter-spacing="-0.02em" fill="${t.ink}">${safeHandle}</text>
  <text x="32" y="146" font-family='${FONT_SANS}' font-size="12.5" font-weight="600" fill="${t.sub}">${safeSub}</text>
  <polygon points="${chamferPolygon(32, 164, 514, 34, 8)}" fill="${t.surface}" fill-opacity="0.82" stroke="${t.border}" stroke-width="1"/>
  <text x="46" y="185" font-family='${FONT_MONO}' font-size="10.5" fill="${t.ink}"><tspan fill="${t.accent}" font-weight="700">NOTE 01:</tspan> ${safeNote}</text>

  <!-- Right isometric calibration reticle -->
  <text x="588" y="62" font-family='${FONT_MONO}' font-size="9" fill="${t.muted}">FIG 1.0 · ISO CORE</text>
  <circle cx="706" cy="136" r="64" fill="none" stroke="${t.borderSoft}" stroke-dasharray="3 3" stroke-width="1"/>
  <circle cx="706" cy="136" r="46" fill="none" stroke="${t.border}" stroke-opacity="0.6" stroke-width="1"/>
  <line x1="628" y1="136" x2="784" y2="136" stroke="${t.borderSoft}" stroke-width="0.8"/>
  <line x1="706" y1="62" x2="706" y2="210" stroke="${t.borderSoft}" stroke-width="0.8"/>
  <g class="orbit-${uid}">
    <path d="M 706 72 A 64 64 0 0 1 764 110" fill="none" stroke="${t.accent}" stroke-width="2.2"/>
    <circle cx="764" cy="110" r="3.2" fill="${t.accent}"/>
  </g>
  <polygon points="706,104 734,120 734,152 706,168 678,152 678,120" fill="${t.patternBg}" fill-opacity="0.65" stroke="${t.accent}" stroke-width="1.4"/>
  <line x1="706" y1="104" x2="706" y2="136" stroke="${t.accent}" stroke-width="1.1"/>
  <line x1="734" y1="120" x2="706" y2="136" stroke="${t.accent}" stroke-width="1.1"/>
  <line x1="678" y1="120" x2="706" y2="136" stroke="${t.accent}" stroke-width="1.1"/>
  <line x1="706" y1="136" x2="706" y2="168" stroke="${t.border}" stroke-dasharray="2 2" stroke-width="1"/>

  <!-- Bottom 4-cell CAD Title Block -->
  <line x1="8.5" y1="226.5" x2="${w - 8.5}" y2="226.5" stroke="${t.border}" stroke-width="1.1"/>
  <line x1="216.5" y1="226.5" x2="216.5" y2="${h - 8.5}" stroke="${t.border}" stroke-opacity="0.6" stroke-width="0.9"/>
  <line x1="423.5" y1="226.5" x2="423.5" y2="${h - 8.5}" stroke="${t.border}" stroke-opacity="0.6" stroke-width="0.9"/>
  <line x1="630.5" y1="226.5" x2="630.5" y2="${h - 8.5}" stroke="${t.border}" stroke-opacity="0.6" stroke-width="0.9"/>
  <text x="26" y="246" font-family='${FONT_MONO}' font-size="8.8" fill="${t.muted}">AUTHOR / HANDLE</text>
  <text x="26" y="268" font-family='${FONT_SANS}' font-size="14" font-weight="700" fill="${t.ink}">${escapeXml(fitText(profile.displayName, 174, 14))}</text>
  <text x="234" y="246" font-family='${FONT_MONO}' font-size="8.8" fill="${t.muted}">PUBLIC REPOSITORIES</text>
  <text x="234" y="268" font-family='${FONT_MONO}' font-size="14" font-weight="700" fill="${t.accent}">${fmtNum(profile.publicRepos)} <tspan fill="${t.ink}" font-size="11">REPOS</tspan></text>
  <text x="441" y="246" font-family='${FONT_MONO}' font-size="8.8" fill="${t.muted}">STARS &amp; FOLLOWERS</text>
  <text x="441" y="268" font-family='${FONT_MONO}' font-size="14" font-weight="700" fill="${t.tertiary}">★ ${fmtNum(profile.totalStars)} <tspan fill="${t.muted}" font-size="11">· ${fmtNum(profile.followers)}</tspan></text>
  <text x="648" y="246" font-family='${FONT_MONO}' font-size="8.8" fill="${t.muted}">PRIMARY STACK</text>
  <text x="648" y="268" font-family='${FONT_MONO}' font-size="12.5" font-weight="700" fill="${t.ink}">${escapeXml(fitText(stackLine, 176, 12.5, true))}</text>
</svg>`;
  }

  if (theme.id === "editorial-zine") {
    const w = 846;
    const h = 302;
    const safeName = escapeXml(fitText(profile.username, 470, 44, false));
    const bioLines = wrapText(profile.bio, 495, 14.5, 2, false);
    const ledger: [string, string][] = [
      ["AUTHOR", fitText(profile.displayName, 145, 12)],
      ["REPOSITORIES", `${fmtNum(profile.publicRepos)} Public`],
      ["STARS EARNED", `${fmtNum(profile.totalStars)} Total`],
      ["FOLLOWERS", fmtNum(profile.followers)],
      ["PRIMARY STACK", fitText(stackLine, 145, 12)],
      ["DISPATCH", fitText(siteShort, 145, 12)],
    ];
    const ledgerSvg = ledger
      .map(([k, v], idx) => {
        const y = 96 + idx * 30;
        const rule =
          idx > 0
            ? `<line x1="572" y1="${y - 18}" x2="818" y2="${y - 18}" stroke="${t.borderSoft}" stroke-width="0.9"/>`
            : "";
        return `${rule}
  <text x="572" y="${y}" font-family='${FONT_MONO}' font-size="9.5" letter-spacing="0.6" fill="${t.muted}">${k}</text>
  <text x="818" y="${y}" text-anchor="end" font-family='${FONT_SERIF}' font-size="12.5" font-weight="700" fill="${t.ink}">${escapeXml(v)}</text>`;
      })
      .join("\n");

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(profile.username)} — Editorial Broadsheet Zine Profile">
  <title>${escapeXml(profile.username)} — Open-Source Monograph</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="24" y="16" width="798" height="2.4" fill="${t.border}"/>
  <line x1="24" y1="22.5" x2="822" y2="22.5" stroke="${t.border}" stroke-width="0.8"/>
  <text x="24" y="40" font-family='${FONT_MONO}' font-size="9.5" letter-spacing="1.4" fill="${t.muted}">VOL. IV  ·  @${escapeXml(fitText(handleUpper, 120, 9.5, true))}</text>
  <text x="423" y="40" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="2.2" fill="${t.ink}">OPEN-SOURCE MONOGRAPH</text>
  <text x="822" y="40" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" letter-spacing="1.4" fill="${t.muted}">EDITION 2026</text>
  <line x1="24" y1="49.5" x2="822" y2="49.5" stroke="${t.border}" stroke-width="1"/>
  <line x1="548.5" y1="60" x2="548.5" y2="274" stroke="${t.borderSoft}" stroke-width="1"/>

  <rect x="26" y="68" width="6" height="6" fill="${t.accent}"/>
  <text x="40" y="75" font-family='${FONT_MONO}' font-size="10" font-weight="600" letter-spacing="1.1" fill="${t.accent}">${escapeXml(fitText(`${profile.location.toUpperCase()}  ·  GITHUB PROFILE`, 480, 10, true))}</text>
  <text x="26" y="136" font-family='${FONT_SERIF}' font-size="44" font-weight="700" fill="${t.ink}">${safeName}<tspan fill="${t.accent}">.</tspan></text>
  ${bioLines
    .map(
      (line, i) =>
        `<text x="26" y="${174 + i * 24}" font-family='${FONT_SERIF}' font-size="15.5" font-style="italic" fill="${t.sub}">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  <line x1="26" y1="234" x2="522" y2="234" stroke="${t.borderSoft}" stroke-width="1"/>
  <text x="26" y="256" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">COLOPHON · ${escapeXml(fitText(stackLine, 460, 10, true))}</text>
  ${ledgerSvg}
  <line x1="24" y1="286" x2="822" y2="286" stroke="${t.border}" stroke-width="0.9"/>
</svg>`;
  }

  if (theme.id === "crt-terminal") {
    const w = 846;
    const h = 306;
    const ansi =
      mode === "dark"
        ? ["#1F2D38", "#F87171", "#34D399", "#FBBF24", "#60A5FA", "#F472B6", "#38BDF8", "#E6F1F5"]
        : ["#182026", "#DC2626", "#0E7C5B", "#B45309", "#1D5FD6", "#A21CAF", "#0274A6", "#6E7B85"];
    const rows: [string, string][] = [
      ["user", `${profile.displayName} (@${profile.username})`],
      ["bio", profile.bio],
      ["stack", stackLine],
      ["repos", `${fmtNum(profile.publicRepos)} public · ★ ${fmtNum(profile.totalStars)} stars`],
      ["social", `${fmtNum(profile.followers)} followers · ${profile.location}`],
      ["web", siteShort],
    ];
    const tableSvg = rows
      .map(([k, v], i) => {
        const y = 96 + i * 23;
        return `<text x="322" y="${y}" font-family='${FONT_MONO}' font-size="11.5" font-weight="700" fill="${t.accent}">${k.padEnd(7, " ")}</text>
  <text x="386" y="${y}" font-family='${FONT_MONO}' font-size="11.5" fill="${t.muted}">:</text>
  <text x="400" y="${y}" font-family='${FONT_MONO}' font-size="11.5" fill="${t.ink}">${escapeXml(fitText(v, 412, 11.5, true))}</text>`;
      })
      .join("\n  ");
    const whoamiText = `${profile.username} (${fitText(profile.displayName, 130, 11, true)})`;
    const curX = Math.min(272, 28 + Math.round(estimateTextPx(whoamiText, 11, true) + 6));
    const style = animated
      ? `<style>
    @keyframes cur_${uid} { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.15; } }
    .cur-${uid} { animation: cur_${uid} 1.4s steps(1, end) infinite; }
    @media (prefers-reduced-motion: reduce) { .cur-${uid} { animation: none !important; } }
  </style>`
      : "";

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(profile.username)} — Retro CRT Terminal Profile">
  <title>${escapeXml(profile.username)}@github — CRT Terminal</title>
  <defs>
    <pattern id="scan-${uid}" width="4" height="4" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="4" y2="0" stroke="${mode === "dark" ? "#FFFFFF" : "#000000"}" stroke-opacity="${mode === "dark" ? "0.045" : "0.02"}" stroke-width="1"/>
    </pattern>
  </defs>
  ${style}
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <rect x="1" y="1" width="${w - 2}" height="28" fill="${t.patternBg}"/>
  <line x1="1" y1="29.5" x2="${w - 1}" y2="29.5" stroke="${t.border}" stroke-width="1"/>
  <circle cx="16" cy="15" r="4" fill="#F87171"/>
  <circle cx="30" cy="15" r="4" fill="${t.highlight}"/>
  <circle cx="44" cy="15" r="4" fill="${t.accent}"/>
  <text x="423" y="19" text-anchor="middle" font-family='${FONT_MONO}' font-size="10.5" fill="${t.sub}">${escapeXml(profile.username)}@github: ~/profile — zsh</text>
  <text x="830" y="19" text-anchor="end" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">tmux 3.4</text>

  <!-- Left Pane -->
  <rect x="14" y="42" width="272" height="226" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <text x="26" y="61" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">[pane 0: identity]</text>
  <rect x="34" y="76" width="232" height="122" fill="${t.bg}" stroke="${t.accent}" stroke-width="1.2"/>
  ${profile.pixelAvatar ? renderPixelAvatarGroup(profile.pixelAvatar, initials, 102, 89, 96, t) : `<text x="150" y="152" text-anchor="middle" font-family='${FONT_MONO}' font-size="54" font-weight="700" letter-spacing="4" fill="${t.accent}">${escapeXml(initials)}</text>`}
  <text x="28" y="228" font-family='${FONT_MONO}' font-size="10.5" fill="${t.accent}">$ whoami</text>
  <text x="28" y="248" font-family='${FONT_MONO}' font-size="11" font-weight="700" fill="${t.ink}">${escapeXml(whoamiText)}</text>
  <rect class="cur-${uid}" x="${curX}" y="237" width="7" height="13" fill="${t.accent}"/>

  <!-- Right Pane -->
  <rect x="304" y="42" width="528" height="226" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <text x="322" y="61" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">[pane 1: neofetch --github]</text>
  <text x="322" y="76" font-family='${FONT_MONO}' font-size="11.5" font-weight="700" fill="${t.secondary}">${escapeXml(profile.username)}@github.com</text>
  ${tableSvg}
  ${ansi
    .map(
      (hex, i) =>
        `<rect x="${322 + i * 24}" y="236" width="18" height="12" fill="${hex}" shape-rendering="crispEdges"/>`
    )
    .join("")}
  <text x="816" y="246" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">shell: zsh · live api</text>

  <!-- Bottom tmux status bar -->
  <rect x="1" y="281" width="${w - 2}" height="24" fill="${t.patternBg}"/>
  <line x1="1" y1="280.5" x2="${w - 1}" y2="280.5" stroke="${t.border}" stroke-width="1"/>
  <rect x="10" y="285" width="60" height="16" fill="${t.accent}"/>
  <text x="40" y="296.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.accentFg}">NORMAL</text>
  <text x="82" y="296.5" font-family='${FONT_MONO}' font-size="10" fill="${t.ink}">0:profile*  1:repos  2:widgets</text>
  <text x="832" y="296.5" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">UTF-8 | LIVE | 100%</text>
  <rect x="1" y="30" width="${w - 2}" height="250" fill="url(#scan-${uid})" pointer-events="none"/>
</svg>`;
  }

  // Default: swiss-bauhaus-pixel
  const w = 846;
  const h = 294;
  const safeHandle = escapeXml(fitText(handleUpper, 520, 46, false));
  const bioLines = wrapText(profile.bio, 525, 13.5, 2, false);
  const cmdText = `$ build --stack "${fitText(stackLine, 390, 11.5, true)}"`;
  const curX = Math.min(562, 26 + Math.round(estimateTextPx(cmdText, 11.5, true) + 6));
  const style = animated
    ? `<style>
    @keyframes cur_${uid} { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.15; } }
    .cur-${uid} { animation: cur_${uid} 1.4s steps(1, end) infinite; }
    @media (prefers-reduced-motion: reduce) { .cur-${uid} { animation: none !important; } }
  </style>`
    : "";

  const metrics: [string, string, string, string][] = [
    [t.accent, fmtNum(profile.publicRepos), "Public Repos", fitText(stackLine, 115, 10)],
    [t.secondary, fmtNum(profile.totalStars), "Total Stars", "Verified public repos"],
    [t.tertiary, fmtNum(profile.followers), "Followers", fitText(profile.location, 115, 10)],
    [t.highlight, profile.topLanguages[0] || "OSS", "Top Language", "GitHub Profile"],
  ];

  const colStarts = [0, 212, 423, 634];
  const metricsSvg = metrics
    .map(([dot, val, label, sub], idx) => {
      const cx = colStarts[idx];
      const div =
        idx > 0
          ? `<line x1="${cx + 0.5}" y1="230.5" x2="${cx + 0.5}" y2="293.5" stroke="${t.border}" stroke-width="1"/>`
          : "";
      const px = cx + 16;
      const safeVal = escapeXml(fitText(val, 68, 18, true));
      return `${div}
  <rect x="${px}" y="242" width="6" height="6" fill="${dot}" shape-rendering="crispEdges"/>
  <text x="${px}" y="274" font-family='${FONT_MONO}' font-size="18" font-weight="800" fill="${t.ink}">${safeVal}</text>
  <text x="${px + 72}" y="262" font-family='${FONT_SANS}' font-size="11.5" font-weight="700" fill="${t.ink}">${escapeXml(label)}</text>
  <text x="${px + 72}" y="277" font-family='${FONT_SANS}' font-size="10" fill="${t.muted}">${escapeXml(sub)}</text>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(profile.username)} — Swiss-Bauhaus Pixel Poster Profile">
  <title>${escapeXml(profile.username)} — Swiss-Bauhaus Pixel Poster</title>
  ${style}
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}"/>
  ${bauhausWeave(589, 37, 256, 193, t.patternBg, t.patternFg, 6)}
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="none" stroke="${t.border}" stroke-width="1"/>
  <line x1="0.5" y1="36.5" x2="${w - 0.5}" y2="36.5" stroke="${t.border}" stroke-width="1"/>
  <line x1="588.5" y1="36.5" x2="588.5" y2="230.5" stroke="${t.border}" stroke-width="1"/>
  <line x1="0.5" y1="230.5" x2="${w - 0.5}" y2="230.5" stroke="${t.border}" stroke-width="1"/>

  <rect x="16" y="13" width="10" height="10" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="34" y="22.5" font-family='${FONT_MONO}' font-size="11.5" font-weight="700" fill="${t.ink}">${escapeXml(fitText(handleUpper, 150, 11.5, true))}</text>
  <text x="196" y="22.5" font-family='${FONT_MONO}' font-size="10.5" fill="${t.muted}">(${escapeXml(fitText(profile.displayName, 220, 10.5, true))})</text>
  <rect x="668" y="8" width="162" height="20" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <text x="749" y="21.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="600" fill="${t.ink}">${escapeXml(fitText(siteShort, 148, 9.5, true))}</text>

  <text x="26" y="64" font-family='${FONT_MONO}' font-size="10.5" font-weight="600" fill="${t.accent}">(profile) · ${escapeXml(fitText(profile.location, 220, 10.5, true))}</text>
  <text x="24" y="124" font-family='${FONT_SANS}' font-size="46" font-weight="800" letter-spacing="-0.03em" fill="${t.ink}">${safeHandle}</text>
  ${bioLines
    .map(
      (line, i) =>
        `<text x="26" y="${156 + i * 20}" font-family='${FONT_SANS}' font-size="13.5" font-weight="500" fill="${t.sub}">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  <rect x="26" y="196" width="538" height="24" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <text x="36" y="212" font-family='${FONT_MONO}' font-size="11" fill="${t.ink}">${escapeXml(cmdText)}</text>
  <rect class="cur-${uid}" x="${curX}" y="202" width="7" height="12" fill="${t.accent}"/>

  <!-- Framed Pixel Portrait (24x24 real GitHub avatar or geometric monogram) -->
  <rect x="651" y="62" width="136" height="148" fill="${t.border}"/>
  <rect x="646.5" y="57.5" width="136" height="148" fill="${t.surface}" stroke="${t.border}" stroke-width="1.2"/>
  ${renderPixelAvatarGroup(profile.pixelAvatar, initials, 660, 68, 108, t)}
  <text x="714.5" y="196" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.muted}">@${escapeXml(fitText(profile.username, 118, 9.5, true))}</text>

  ${metricsSvg}
</svg>`;
}

function renderButtonSvg(
  label: string,
  primary: boolean,
  themeId: string,
  t: ThemeTokens
): string {
  const h = themeId === "blueprint-cad" ? 32 : 30;
  const safe = escapeXml(fitText(label, 220, 11, true));
  const w = Math.max(108, Math.round(estimateTextPx(safe, 11, true) + 32));
  const bg = primary ? t.accent : t.surface;
  const fg = primary ? t.accentFg : t.ink;

  if (themeId === "blueprint-cad") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safe}">
  <polygon points="${chamferPolygon(0.5, 0.5, w - 1, h - 1, 6)}" fill="${bg}" stroke="${t.border}" stroke-width="1"/>
  <text x="${w / 2}" y="20" text-anchor="middle" font-family='${FONT_MONO}' font-size="11" font-weight="700" fill="${fg}">${safe}</text>
</svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safe}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${bg}" stroke="${t.border}" stroke-width="1"/>
  <rect x="10" y="12" width="5" height="5" fill="${primary ? t.accentFg : t.accent}" shape-rendering="crispEdges"/>
  <text x="21" y="19" font-family='${FONT_MONO}' font-size="11" font-weight="700" fill="${fg}">${safe}</text>
</svg>`;
}

function renderSectionHeaderSvg(
  code: string,
  title: string,
  rightNote: string,
  themeId: string,
  t: ThemeTokens
): string {
  const w = 846;
  const h = 36;
  const safeTitle = escapeXml(title);
  const safeRight = escapeXml(rightNote);

  if (themeId === "blueprint-cad") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.borderSoft}" stroke-width="1"/>
  <polygon points="${chamferPolygon(10, 7, 74, 22, 5)}" fill="${t.accent}"/>
  <text x="47" y="21.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.accentFg}">${escapeXml(code)}</text>
  <text x="96" y="22" font-family='${FONT_SANS}' font-size="12.5" font-weight="700" letter-spacing="0.4" fill="${t.ink}">${safeTitle}</text>
  <text x="${w - 14}" y="22" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${safeRight}</text>
</svg>`;
  }

  if (themeId === "editorial-zine") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <rect width="${w}" height="${h}" fill="${t.bg}"/>
  <rect x="0" y="2" width="${w}" height="2" fill="${t.border}"/>
  <line x1="0" y1="6.5" x2="${w}" y2="6.5" stroke="${t.border}" stroke-width="0.7"/>
  <text x="4" y="26" font-family='${FONT_SERIF}' font-size="15.5" font-weight="700" fill="${t.ink}">${safeTitle}</text>
  <text x="${w - 4}" y="25" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" letter-spacing="0.8" fill="${t.muted}">${safeRight}</text>
  <line x1="0" y1="34.5" x2="${w}" y2="34.5" stroke="${t.borderSoft}" stroke-width="0.9"/>
</svg>`;
  }

  if (themeId === "crt-terminal") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.patternBg}" stroke="${t.border}" stroke-width="1"/>
  <text x="14" y="22" font-family='${FONT_MONO}' font-size="11.5" font-weight="700" fill="${t.accent}">[${escapeXml(code)}]</text>
  <text x="74" y="22" font-family='${FONT_MONO}' font-size="11.5" font-weight="700" fill="${t.ink}">${safeTitle}</text>
  <text x="${w - 14}" y="22" text-anchor="end" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">${safeRight}</text>
</svg>`;
  }

  // swiss-bauhaus-pixel
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <rect x="10" y="9" width="18" height="18" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="19" y="21.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.accentFg}">${escapeXml(code)}</text>
  <text x="38" y="22.5" font-family='${FONT_SANS}' font-size="13" font-weight="800" fill="${t.ink}">${safeTitle}</text>
  <text x="${w - 14}" y="22" text-anchor="end" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">${safeRight}</text>
</svg>`;
}

function renderCardSvg(
  repo: GitHubRepoSummary,
  idx: number,
  themeId: string,
  mode: PreviewMode,
  t: ThemeTokens
): string {
  const w = 417;
  const h = themeId === "blueprint-cad" ? 198 : 194;
  const colors = [t.accent, t.secondary, t.tertiary, t.highlight];
  const plateColor = colors[idx % colors.length];
  const numStr = String(idx + 1).padStart(2, "0");
  const roman = ["I", "II", "III", "IV", "V", "VI"][idx] || numStr;
  const linkHint = repo.homepage ? stripProtocol(repo.homepage) : `github.com/${repo.name}`;
  const specLine = `${repo.language}  ·  ★ ${fmtNum(repo.stars)}  ·  Forks ${fmtNum(repo.forks)}  ·  ${repo.license}`;

  if (themeId === "blueprint-cad") {
    const descLines = wrapText(repo.description, 274, 12, 2, false);
    const uid = `card-bp-${idx}-${mode}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(repo.name)}">
  <defs>
    <pattern id="g-${uid}" width="12" height="12" patternUnits="userSpaceOnUse">
      <path d="M 12 0 L 0 0 0 12" fill="none" stroke="${t.borderSoft}" stroke-opacity="0.45" stroke-width="0.6"/>
    </pattern>
  </defs>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1.1"/>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="url(#g-${uid})"/>
  <polygon points="${chamferPolygon(14, 12, 74, 20, 5)}" fill="${plateColor}"/>
  <text x="51" y="25.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.accentFg}">DWG-${numStr}</text>
  <text x="${w - 14}" y="25.5" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${escapeXml(fitText(linkHint, 185, 9.5, true))} ↗</text>

  <text x="16" y="62" font-family='${FONT_SANS}' font-size="18.5" font-weight="800" fill="${t.ink}">${escapeXml(fitText(repo.name, 278, 18.5))}</text>
  ${descLines
    .map(
      (line, i) =>
        `<text x="16" y="${88 + i * 19}" font-family='${FONT_SANS}' font-size="12" fill="${t.sub}">${escapeXml(line)}</text>`
    )
    .join("\n  ")}

  <!-- Right wireframe schematic box -->
  <rect x="322" y="52" width="78" height="68" fill="${t.patternBg}" stroke="${t.border}" stroke-width="1"/>
  <circle cx="361" cy="86" r="20" fill="none" stroke="${plateColor}" stroke-width="1.2"/>
  <rect x="347" y="72" width="28" height="28" fill="none" stroke="${t.border}" stroke-dasharray="2 2" stroke-width="1"/>
  <circle cx="361" cy="86" r="4" fill="${plateColor}"/>

  <line x1="14" y1="152" x2="${w - 14}" y2="152" stroke="${t.borderSoft}" stroke-dasharray="3 3" stroke-width="0.9"/>
  <text x="16" y="176" font-family='${FONT_MONO}' font-size="10.5" fill="${t.muted}">${escapeXml(fitText(specLine, 384, 10.5, true))}</text>
</svg>`;
  }

  if (themeId === "editorial-zine") {
    const descLines = wrapText(repo.description, 376, 12.5, 2, false);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(repo.name)}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="1" y="1" width="${w - 2}" height="3.2" fill="${plateColor}"/>
  <text x="18" y="28" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="1.2" fill="${plateColor}">PLATE ${roman}  ·  ${escapeXml(repo.language.toUpperCase())}</text>
  <text x="${w - 18}" y="28" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">★ ${fmtNum(repo.stars)}</text>
  <text x="18" y="64" font-family='${FONT_SERIF}' font-size="22" font-weight="700" fill="${t.ink}">${escapeXml(fitText(repo.name, 376, 22))}</text>
  ${descLines
    .map(
      (line, i) =>
        `<text x="18" y="${94 + i * 21}" font-family='${FONT_SANS}' font-size="12.5" fill="${t.sub}">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  <line x1="18" y1="148" x2="${w - 18}" y2="148" stroke="${t.borderSoft}" stroke-width="0.9"/>
  <text x="18" y="172" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">${escapeXml(fitText(specLine, 380, 10, true))}</text>
</svg>`;
  }

  if (themeId === "crt-terminal") {
    const descLines = wrapText(repo.description, 378, 11.5, 2, true);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(repo.name)}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <rect x="1" y="1" width="${w - 2}" height="26" fill="${t.patternBg}"/>
  <line x1="1" y1="27.5" x2="${w - 1}" y2="27.5" stroke="${t.border}" stroke-width="1"/>
  <circle cx="14" cy="14" r="3" fill="${plateColor}"/>
  <text x="24" y="17.5" font-family='${FONT_MONO}' font-size="10.5" font-weight="700" fill="${t.ink}">[${idx + 1}] ${escapeXml(fitText(repo.name, 220, 10.5, true))}</text>
  <text x="${w - 14}" y="17.5" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${escapeXml(repo.language)}</text>
  <text x="16" y="54" font-family='${FONT_MONO}' font-size="10.5" fill="${plateColor}">&gt; ${escapeXml(fitText(linkHint, 360, 10.5, true))}</text>
  ${descLines
    .map(
      (line, i) =>
        `<text x="16" y="${82 + i * 20}" font-family='${FONT_MONO}' font-size="11.5" fill="${t.sub}">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  <line x1="14" y1="146" x2="${w - 14}" y2="146" stroke="${t.borderSoft}" stroke-width="1"/>
  <text x="16" y="170" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">${escapeXml(fitText(specLine, 384, 10, true))}</text>
</svg>`;
  }

  // swiss-bauhaus-pixel
  const descLines = wrapText(repo.description, 378, 12.5, 2, false);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(repo.name)}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  ${bauhausWeave(1, 1, w - 2, 48, t.patternBg, t.patternFg, 6)}
  <line x1="0.5" y1="49.5" x2="${w - 0.5}" y2="49.5" stroke="${t.border}" stroke-width="1"/>
  <rect x="14" y="14" width="114" height="22" fill="${t.ink}"/>
  <text x="22" y="28.5" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.bg}">(${numStr}) ${escapeXml(fitText(repo.language, 66, 10, true))}</text>
  <rect x="${w - 50}" y="7" width="36" height="36" fill="${t.ink}" stroke="${t.border}" stroke-width="1"/>
  <rect x="${w - 42}" y="15" width="10" height="10" fill="${plateColor}" shape-rendering="crispEdges"/>
  <rect x="${w - 29}" y="25" width="7" height="7" fill="${t.bg}" shape-rendering="crispEdges"/>

  <text x="16" y="80" font-family='${FONT_SANS}' font-size="19" font-weight="800" fill="${t.ink}">${escapeXml(fitText(repo.name, 260, 19))}</text>
  <text x="${w - 16}" y="79" text-anchor="end" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">★ ${fmtNum(repo.stars)} ↗</text>
  ${descLines
    .map(
      (line, i) =>
        `<text x="16" y="${106 + i * 19}" font-family='${FONT_SANS}' font-size="12.5" fill="${t.sub}">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  <line x1="16" y1="152" x2="${w - 16}" y2="152" stroke="${t.borderSoft}" stroke-width="1"/>
  <text x="16" y="174" font-family='${FONT_MONO}' font-size="10.5" fill="${t.muted}">${escapeXml(fitText(specLine, 384, 10.5, true))}</text>
</svg>`;
}

export function renderProfileSuite(
  profile: LiveProfileData,
  theme: SkinTheme,
  mode: PreviewMode,
  overrides: ProfileOverrides
): RenderedProfileSuite {
  const t = resolveTokens(theme.tokens[mode], overrides.accentOverride);
  const topRepos = profile.repos.slice(0, overrides.cardCount);

  const hero = renderHeroForTheme(profile, theme, mode, t, overrides.animated);

  const rawButtons: { id: string; label: string; url: string }[] = [];
  if (profile.blog) {
    rawButtons.push({
      id: "site",
      label: stripProtocol(profile.blog),
      url: profile.blog,
    });
  }
  rawButtons.push({
    id: "github",
    label: `@${profile.username}`,
    url: profile.htmlUrl,
  });
  if (topRepos[0]) {
    rawButtons.push({
      id: "flagship",
      label: `${topRepos[0].name} ★ ${fmtNum(topRepos[0].stars)}`,
      url: topRepos[0].htmlUrl,
    });
  }
  rawButtons.push({
    id: "repos",
    label: `${fmtNum(profile.publicRepos)} Repositories`,
    url: `${profile.htmlUrl}?tab=repositories`,
  });

  const buttons: ProfileButtonItem[] = rawButtons.slice(0, 4).map((b, idx) => ({
    ...b,
    svg: renderButtonSvg(b.label, idx === 0, theme.id, t),
  }));

  const secWork = renderSectionHeaderSvg(
    theme.id === "blueprint-cad" ? "SEC. A-A" : "01",
    "SELECTED REPOSITORIES",
    `${String(topRepos.length).padStart(2, "0")} VERIFIED REPOS`,
    theme.id,
    t
  );
  const secActivity = renderSectionHeaderSvg(
    theme.id === "blueprint-cad" ? "SEC. B-B" : "02",
    "CONTRIBUTION ACTIVITY",
    `@${profile.username}`,
    theme.id,
    t
  );

  const cards: ProfileCardItem[] = topRepos.map((repo, idx) => ({
    id: repo.id,
    title: repo.name,
    url: repo.htmlUrl,
    svg: renderCardSvg(repo, idx, theme.id, mode, t),
  }));

  return { hero, buttons, secWork, secActivity, cards };
}

function buildBentoSlotAssets(params: {
  slot: Exclude<WidgetPlacement, "hero-overlay">;
  widgets: WidgetInstance[];
  theme: SkinTheme;
  overrides: ProfileOverrides;
}): { entries: ZipFileEntry[]; markdownLines: string[] } {
  const { slot, widgets, theme, overrides } = params;
  if (!widgets.length) return { entries: [], markdownLines: [] };

  const rows = packBentoRows(widgets);
  const entries: ZipFileEntry[] = [];
  const markdownLines: string[] = [];

  rows.forEach((row, rIdx) => {
    const rowHasLive = row.items.some((w) => isLiveWidgetId(w.widgetId));

    if (rowHasLive) {
      // Emit individual SVGs so .github/workflows/gitskins-widgets.yml can refresh
      // assets/live-<widgetId>-{light,dark}.svg in-place without regenerating static composites.
      const tags: string[] = [];
      row.items.forEach((w, iIdx) => {
        const isLive = isLiveWidgetId(w.widgetId);
        const fileBase = isLive
          ? `live-${w.widgetId}`
          : `widget-${w.widgetId}-${slot}-r${rIdx + 1}-${iIdx + 1}`;
        const lightPath = `assets/${fileBase}-light.svg`;
        const darkPath = `assets/${fileBase}-dark.svg`;

        if (!entries.some((e) => e.path === lightPath)) {
          const lightSvg = renderWidgetSvg(w.widgetId, w.config, {
            themeId: theme.id,
            mode: "light",
            tokens: theme.tokens.light,
            colSpan: w.colSpan,
            targetHeight: row.items.length > 1 || w.widgetId !== "skill-dock" ? row.rowHeight : undefined,
            inBentoRow: true,
            accentOverride: w.accentOverride || overrides.accentOverride,
            animated: w.animated && overrides.animated,
            instanceId: `zip-${slot}-r${rIdx}-${iIdx}-l`,
          });
          const darkSvg = renderWidgetSvg(w.widgetId, w.config, {
            themeId: theme.id,
            mode: "dark",
            tokens: theme.tokens.dark,
            colSpan: w.colSpan,
            targetHeight: row.items.length > 1 || w.widgetId !== "skill-dock" ? row.rowHeight : undefined,
            inBentoRow: true,
            accentOverride: w.accentOverride || overrides.accentOverride,
            animated: w.animated && overrides.animated,
            instanceId: `zip-${slot}-r${rIdx}-${iIdx}-d`,
          });
          entries.push({ path: lightPath, content: lightSvg });
          entries.push({ path: darkPath, content: darkSvg });
        }

        const widthPct =
          row.items.length === 1 && w.colSpan === 4
            ? "100%"
            : w.colSpan === 3
              ? "74%"
              : w.colSpan === 2
                ? "49%"
                : "24%";
        const alt = `GitSkins ${isLive ? "Live" : "DIY"} Widget (${w.widgetId})`;
        tags.push(
          `<picture><source media="(prefers-color-scheme: dark)" srcset="./${darkPath}"><img src="./${lightPath}" alt="${alt}" width="${widthPct}"></picture>`
        );
      });
      markdownLines.push(`<p>`, `  ${tags.join("&nbsp;")}`, `</p>`);
      return;
    }

    const fileBase = `bento-${slot}-r${rIdx + 1}`;
    const lightSvg = renderCompositeBentoRowSvg(row, {
      themeId: theme.id,
      mode: "light",
      tokens: theme.tokens.light,
      globalAccent: overrides.accentOverride,
      globalAnimated: overrides.animated,
      rowKey: `zip-${slot}-r${rIdx}-l`,
    });
    const darkSvg = renderCompositeBentoRowSvg(row, {
      themeId: theme.id,
      mode: "dark",
      tokens: theme.tokens.dark,
      globalAccent: overrides.accentOverride,
      globalAnimated: overrides.animated,
      rowKey: `zip-${slot}-r${rIdx}-d`,
    });
    entries.push({ path: `assets/${fileBase}-light.svg`, content: lightSvg });
    entries.push({ path: `assets/${fileBase}-dark.svg`, content: darkSvg });

    const widthPct =
      row.usedCols === 4
        ? "100%"
        : row.usedCols === 3
          ? "74%"
          : row.usedCols === 2
            ? "49%"
            : "24%";
    const alt = `GitSkins Bento Row (${row.items.map((i) => i.widgetId).join(" + ")})`;
    markdownLines.push(
      `<p>`,
      `  <picture>`,
      `    <source media="(prefers-color-scheme: dark)" srcset="./assets/${fileBase}-dark.svg">`,
      `    <img src="./assets/${fileBase}-light.svg" alt="${alt}" width="${widthPct}">`,
      `  </picture>`,
      `</p>`
    );
  });

  return { entries, markdownLines };
}

export function buildProfileZipEntries(params: {
  profile: LiveProfileData;
  theme: SkinTheme;
  overrides: ProfileOverrides;
  mountedWidgets: WidgetInstance[];
  lang: Lang;
  liveGeneratorPy?: string;
}): ZipFileEntry[] {
  const { profile, theme, overrides, mountedWidgets, liveGeneratorPy } = params;
  const lightSuite = renderProfileSuite(profile, theme, "light", overrides);
  const darkSuite = renderProfileSuite(profile, theme, "dark", overrides);

  const bySlot: Record<WidgetPlacement, WidgetInstance[]> = {
    top: [],
    "hero-overlay": [],
    "under-hero": [],
    "under-cards": [],
    bottom: [],
  };
  for (const w of mountedWidgets) {
    bySlot[w.placement].push(w);
  }

  let heroLight = lightSuite.hero;
  let heroDark = darkSuite.hero;

  // Embed every Hero Corner Sticker natively into hero-light.svg & hero-dark.svg
  for (const sticker of bySlot["hero-overlay"]) {
    const anchor = (sticker.config as HeroStickerConfig).anchor || "bottom-right";
    const sLight = renderWidgetSvg(sticker.widgetId, sticker.config, {
      themeId: theme.id,
      mode: "light",
      tokens: theme.tokens.light,
      colSpan: 1,
      accentOverride: sticker.accentOverride || overrides.accentOverride,
      animated: sticker.animated && overrides.animated,
      instanceId: `zip-ov-l-${sticker.uid}`,
    });
    const sDark = renderWidgetSvg(sticker.widgetId, sticker.config, {
      themeId: theme.id,
      mode: "dark",
      tokens: theme.tokens.dark,
      colSpan: 1,
      accentOverride: sticker.accentOverride || overrides.accentOverride,
      animated: sticker.animated && overrides.animated,
      instanceId: `zip-ov-d-${sticker.uid}`,
    });
    heroLight = mergeStickerIntoHeroSvg(heroLight, sLight, anchor);
    heroDark = mergeStickerIntoHeroSvg(heroDark, sDark, anchor);
  }

  const entries: ZipFileEntry[] = [
    { path: "assets/hero-light.svg", content: heroLight },
    { path: "assets/hero-dark.svg", content: heroDark },
    { path: "assets/sec-work-light.svg", content: lightSuite.secWork },
    { path: "assets/sec-work-dark.svg", content: darkSuite.secWork },
    { path: "assets/sec-activity-light.svg", content: lightSuite.secActivity },
    { path: "assets/sec-activity-dark.svg", content: darkSuite.secActivity },
  ];

  lightSuite.buttons.forEach((btn, idx) => {
    entries.push({ path: `assets/btn-${btn.id}-light.svg`, content: btn.svg });
    entries.push({ path: `assets/btn-${btn.id}-dark.svg`, content: darkSuite.buttons[idx].svg });
  });

  lightSuite.cards.forEach((card, idx) => {
    entries.push({ path: `assets/card-${card.id}-light.svg`, content: card.svg });
    entries.push({ path: `assets/card-${card.id}-dark.svg`, content: darkSuite.cards[idx].svg });
  });

  const topSlot = buildBentoSlotAssets({ slot: "top", widgets: bySlot.top, theme, overrides });
  const underHeroSlot = buildBentoSlotAssets({
    slot: "under-hero",
    widgets: bySlot["under-hero"],
    theme,
    overrides,
  });
  const underCardsSlot = buildBentoSlotAssets({
    slot: "under-cards",
    widgets: bySlot["under-cards"],
    theme,
    overrides,
  });
  const bottomSlot = buildBentoSlotAssets({
    slot: "bottom",
    widgets: bySlot.bottom,
    theme,
    overrides,
  });

  entries.push(
    ...topSlot.entries,
    ...underHeroSlot.entries,
    ...underCardsSlot.entries,
    ...bottomSlot.entries
  );

  // Assemble ready-to-push README.md
  const btnHeight = theme.id === "blueprint-cad" ? 32 : 30;
  const cardRows: string[] = [];
  for (let i = 0; i < lightSuite.cards.length; i += 2) {
    const pair = lightSuite.cards.slice(i, i + 2);
    const rowHtml = pair
      .map(
        (c) =>
          `<a href="${c.url}"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/card-${c.id}-dark.svg"><img src="./assets/card-${c.id}-light.svg" alt="${c.title}" width="49%"></picture></a>`
      )
      .join("&nbsp;");
    cardRows.push(`<p>\n  ${rowHtml}\n</p>`);
  }

  const liveWidgets = mountedWidgets.filter((w) => isLiveWidgetId(w.widgetId));
  if (liveWidgets.length > 0) {
    entries.push({
      path: ".github/workflows/gitskins-widgets.yml",
      content: buildLiveWorkflowYaml({
        themeId: theme.id,
        liveWidgets,
        accentOverride: overrides.accentOverride,
        animated: overrides.animated,
      }),
    });
    if (liveGeneratorPy) {
      entries.push({
        path: "scripts/generate_live_widgets.py",
        content: liveGeneratorPy,
      });
    }
  }

  if (overrides.showBadge) {
    entries.push(
      {
        path: "assets/gitskins-badge-light.svg",
        content: renderGitSkinsBadgeSvg(
          theme.id,
          "light",
          theme.tokens.light,
          overrides.accentOverride
        ),
      },
      {
        path: "assets/gitskins-badge-dark.svg",
        content: renderGitSkinsBadgeSvg(
          theme.id,
          "dark",
          theme.tokens.dark,
          overrides.accentOverride
        ),
      }
    );
  }

  const readmeLines: string[] = [
    `<!-- Generated with GitSkins (https://gitskins.blessc.com) · Theme: ${theme.id} -->`,
    ...(liveWidgets.length > 0
      ? [
          `<!-- Auto-updating live widgets enabled via .github/workflows/gitskins-widgets.yml -->`,
        ]
      : []),
    "",
    ...topSlot.markdownLines,
    "",
    `<p>`,
    `  <a href="${profile.blog || profile.htmlUrl}">`,
    `    <picture>`,
    `      <source media="(prefers-color-scheme: dark)" srcset="./assets/hero-dark.svg">`,
    `      <img src="./assets/hero-light.svg" alt="${profile.username} — ${theme.name}" width="100%">`,
    `    </picture>`,
    `  </a>`,
    `</p>`,
    "",
    `<p>`,
    ...lightSuite.buttons.map(
      (b) =>
        `  <a href="${b.url}"><picture><source media="(prefers-color-scheme: dark)" srcset="./assets/btn-${b.id}-dark.svg"><img src="./assets/btn-${b.id}-light.svg" alt="${b.label}" height="${btnHeight}"></picture></a>`
    ),
    `</p>`,
    "",
    ...underHeroSlot.markdownLines,
    "",
    `<p>`,
    `  <picture>`,
    `    <source media="(prefers-color-scheme: dark)" srcset="./assets/sec-work-dark.svg">`,
    `    <img src="./assets/sec-work-light.svg" alt="Selected Repositories" width="100%">`,
    `  </picture>`,
    `</p>`,
    "",
    ...cardRows,
    "",
    ...underCardsSlot.markdownLines,
    "",
    `<p>`,
    `  <picture>`,
    `    <source media="(prefers-color-scheme: dark)" srcset="./assets/sec-activity-dark.svg">`,
    `    <img src="./assets/sec-activity-light.svg" alt="Contribution Activity" width="100%">`,
    `  </picture>`,
    `</p>`,
    "",
    ...bottomSlot.markdownLines,
    "",
    ...(overrides.showBadge
      ? [
          `<p align="right">`,
          `  <a href="https://gitskins.blessc.com">`,
          `    <picture>`,
          `      <source media="(prefers-color-scheme: dark)" srcset="./assets/gitskins-badge-dark.svg">`,
          `      <img src="./assets/gitskins-badge-light.svg" alt="Styled with GitSkins" height="32">`,
          `    </picture>`,
          `  </a>`,
          `</p>`,
          "",
        ]
      : []),
  ];

  entries.unshift({
    path: "README.md",
    content: readmeLines.filter((l, idx, arr) => !(l === "" && arr[idx - 1] === "")).join("\n"),
  });

  return entries;
}

export function appendParametricOverridesToPrompt(
  prompt: string,
  liveProfile: LiveProfileData | null,
  overrides: ProfileOverrides,
  lang: Lang
): string {
  const notes: string[] = [];
  if (liveProfile && !liveProfile.isDemo) {
    notes.push(
      lang === "zh"
        ? `- 目标 GitHub 账号：@${liveProfile.username}（仓库：${liveProfile.username}/${liveProfile.username}）`
        : `- Target GitHub Handle: @${liveProfile.username} (profile repo: ${liveProfile.username}/${liveProfile.username})`
    );
  }
  if (overrides.accentOverride) {
    notes.push(
      lang === "zh"
        ? `- 主强调色覆盖（Accent Override）：${overrides.accentOverride}（深浅双主题均按高对比度适配）`
        : `- Accent Color Override: ${overrides.accentOverride} (preserve >=4.5:1 foreground contrast in Light & Dark)`
    );
  }
  if (overrides.cardCount !== 4) {
    notes.push(
      lang === "zh"
        ? `- 精选项目卡片数量：${overrides.cardCount} 张（每行 2 张，width="49%"）`
        : `- Flagship Project Cards: ${overrides.cardCount} cards (2-column grid, width="49%")`
    );
  }
  if (!overrides.animated) {
    notes.push(
      lang === "zh"
        ? `- 动效偏好：纯静态 SVG（移除所有 CSS @keyframes 动效）`
        : `- Motion Preference: Static SVG (omit all CSS @keyframes animations)`
    );
  }
  if (overrides.copyLang !== "auto") {
    const labelMap: Record<CopyLangPref, { en: string; zh: string }> = {
      auto: { en: "Auto", zh: "自动" },
      en: { en: "English only", zh: "纯英文" },
      zh: { en: "Chinese (中文) only", zh: "纯中文" },
      bilingual: { en: "Bilingual (EN + 中文)", zh: "中英双语" },
    };
    notes.push(
      lang === "zh"
        ? `- 主页文案语言：${labelMap[overrides.copyLang].zh}`
        : `- README Copy Language: ${labelMap[overrides.copyLang].en}`
    );
  }
  if (overrides.showBadge) {
    notes.push(
      lang === "zh"
        ? `- 极简尾标：在 README 底部右侧挂载同皮肤 Styled with GitSkins 尾标（216×32，assets/gitskins-badge-{light,dark}.svg）`
        : `- Footer Badge: include the theme-matched 216x32 "Styled with GitSkins" footer badge (assets/gitskins-badge-{light,dark}.svg)`
    );
  }

  if (!notes.length) return prompt;
  const heading = lang === "zh" ? "### 自定义参数微调（Parametric Overrides）" : "### Parametric Overrides";
  return `${prompt}\n\n${heading}\n${notes.join("\n")}`;
}
