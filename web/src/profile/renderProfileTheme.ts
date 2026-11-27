import type { Lang, PreviewMode, SkinTheme, ThemeTokens } from "../types";
import { renderGitSkinsBadgeSvg } from "../repo/renderRepoSkin";
import { packBentoRows, renderCompositeBentoRowSvg } from "../widgets/bento";
import { mergeStickerIntoHeroSvg } from "../widgets/catalog";
import { renderWidgetSvg } from "../widgets/renderers";
import {
  buildLiveWorkflowYaml,
  buildSnakePlataneMarkdown,
  buildSnakeWorkflowYaml,
  isLiveWidgetId,
  isPlataneSnakeInstance,
} from "../widgets/workflow";
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
  ContributionSnakeConfig,
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

  if (theme.id === "pixel-rpg-hud") {
    const w = 846;
    const h = 304;
    const safeHandle = escapeXml(fitText(handleUpper, 520, 38, true));
    const safeSub = escapeXml(fitText(profile.bio, 535, 13, false));
    const bar = (y: number, label: string, val: string, ratio: number, col: string) => {
      const segs = 14;
      const filled = Math.max(1, Math.min(segs, Math.round(segs * ratio)));
      const rects = Array.from({ length: segs }, (_, i) => {
        const sx = 64 + i * 13;
        return `<rect x="${sx}" y="${y - 9}" width="10" height="10" fill="${i < filled ? col : t.patternBg}" stroke="${t.borderSoft}" stroke-width="0.8" shape-rendering="crispEdges"/>`;
      }).join("");
      return `<text x="28" y="${y}" font-family='${FONT_MONO}' font-size="10.5" font-weight="700" fill="${col}">${label}</text>${rects}<text x="254" y="${y}" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.ink}">${escapeXml(val)}</text>`;
    };
    const stats: [string, string, string, string][] = [
      [t.accent, fmtNum(profile.publicRepos), "PUBLIC REPOS", fitText(stackLine, 108, 10)],
      [t.secondary, fmtNum(profile.totalStars), "STARS LOOT", "Verified Repos"],
      [t.tertiary, fmtNum(profile.followers), "GUILD ALLIES", fitText(profile.location, 108, 10)],
      [t.highlight, profile.topLanguages[0] || "OSS", "MAIN CLASS", "Live GitHub"],
    ];
    const cols = [6, 216, 426, 636];
    const statsSvg = stats
      .map(([col, val, lbl, sub], idx) => {
        const cx = cols[idx];
        const div =
          idx > 0
            ? `<line x1="${cx}" y1="234" x2="${cx}" y2="${h - 6}" stroke="${t.borderSoft}" stroke-width="1"/>`
            : "";
        return `${div}
  <rect x="${cx + 14}" y="244" width="6" height="6" fill="${col}" shape-rendering="crispEdges"/>
  <text x="${cx + 26}" y="250" font-family='${FONT_MONO}' font-size="8.8" font-weight="700" fill="${t.muted}">${lbl}</text>
  <text x="${cx + 14}" y="272" font-family='${FONT_MONO}' font-size="16" font-weight="800" fill="${t.ink}">${escapeXml(fitText(val, 180, 16, true))}</text>
  <text x="${cx + 14}" y="288" font-family='${FONT_SANS}' font-size="10" fill="${t.sub}">${escapeXml(fitText(sub, 180, 10))}</text>`;
      })
      .join("\n");

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(profile.username)} — 16-bit Pixel RPG HUD Profile">
  <title>${escapeXml(profile.username)} — 16-bit Pixel RPG HUD</title>
  <rect x="2" y="2" width="${w - 4}" height="${h - 4}" fill="${t.bg}" stroke="${t.border}" stroke-width="2" shape-rendering="crispEdges"/>
  <rect x="6" y="6" width="${w - 12}" height="${h - 12}" fill="none" stroke="${t.borderSoft}" stroke-width="1" shape-rendering="crispEdges"/>
  <rect x="0" y="0" width="6" height="6" fill="${t.border}" shape-rendering="crispEdges"/>
  <rect x="${w - 6}" y="0" width="6" height="6" fill="${t.border}" shape-rendering="crispEdges"/>
  <rect x="0" y="${h - 6}" width="6" height="6" fill="${t.border}" shape-rendering="crispEdges"/>
  <rect x="${w - 6}" y="${h - 6}" width="6" height="6" fill="${t.border}" shape-rendering="crispEdges"/>
  <rect x="7" y="7" width="${w - 14}" height="28" fill="${t.patternBg}"/>
  <line x1="6" y1="35.5" x2="${w - 6}" y2="35.5" stroke="${t.border}" stroke-width="1.4"/>
  <rect x="18" y="16" width="8" height="8" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="34" y="25" font-family='${FONT_MONO}' font-size="10.5" font-weight="700" fill="${t.ink}">LV.${Math.min(99, 10 + profile.publicRepos)} · CLASS: ${escapeXml(fitText((profile.topLanguages[0] || "BUILDER").toUpperCase(), 140, 10.5, true))} · @${escapeXml(fitText(handleUpper, 140, 10.5, true))}</text>
  <text x="${w - 18}" y="25" text-anchor="end" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.accent}">${escapeXml(fitText(siteShort, 170, 10, true))}</text>

  <text x="28" y="64" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.accent}">&gt; PLAYER STATUS // ${escapeXml(fitText(profile.displayName.toUpperCase(), 260, 10, true))}</text>
  <text x="31" y="114" font-family='${FONT_MONO}' font-size="38" font-weight="800" fill="${t.borderSoft}">${safeHandle}</text>
  <text x="28" y="111" font-family='${FONT_MONO}' font-size="38" font-weight="800" fill="${t.ink}">${safeHandle}</text>
  <text x="28" y="137" font-family='${FONT_SANS}' font-size="13" font-weight="600" fill="${t.sub}">${safeSub}</text>
  ${bar(168, "HP", `${Math.min(999, 500 + profile.totalStars * 2)}/999`, 0.94, t.secondary)}
  ${bar(191, "MP", `${Math.min(999, 400 + profile.publicRepos * 15)}/999`, 0.86, t.highlight)}
  ${bar(214, "XP", `${fmtNum(profile.followers)} ALLIES`, 0.82, t.tertiary)}

  <rect x="624" y="52" width="196" height="168" fill="${t.surface}" stroke="${t.border}" stroke-width="1.6" shape-rendering="crispEdges"/>
  <rect x="630" y="58" width="184" height="156" fill="${t.patternBg}" stroke="${t.borderSoft}" stroke-width="1" shape-rendering="crispEdges"/>
  ${renderPixelAvatarGroup(profile.pixelAvatar, initials, 668, 70, 108, t)}
  <text x="722" y="200" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.ink}">@${escapeXml(fitText(profile.username, 148, 9.5, true))}</text>

  <line x1="6" y1="233.5" x2="${w - 6}" y2="233.5" stroke="${t.border}" stroke-width="1.4"/>
  ${statsSvg}
</svg>`;
  }

  if (theme.id === "seal-ink-scroll") {
    const w = 846;
    const h = 300;
    const safeName = escapeXml(fitText(profile.username, 490, 44, false));
    const bioLines = wrapText(profile.bio, 510, 14.5, 2, false);
    const metrics: [string, string, string, string][] = [
      [t.accent, fmtNum(profile.publicRepos), "PUBLIC REPOS", fitText(stackLine, 110, 10)],
      [t.secondary, fmtNum(profile.totalStars), "TOTAL STARS", "Verified Open Source"],
      [t.tertiary, fmtNum(profile.followers), "FOLLOWERS", fitText(profile.location, 110, 10)],
      [t.highlight, profile.topLanguages[0] || "OSS", "PRIMARY CRAFT", "Seal Monograph"],
    ];
    const cols = [22, 224, 426, 628];
    const colophon = metrics
      .map(([col, val, lbl, sub], idx) => {
        const cx = cols[idx];
        const div =
          idx > 0
            ? `<line x1="${cx - 10}" y1="234" x2="${cx - 10}" y2="278" stroke="${t.borderSoft}" stroke-width="0.9"/>`
            : "";
        return `${div}
  <rect x="${cx}" y="234" width="5" height="5" fill="${col}"/>
  <text x="${cx + 11}" y="240" font-family='${FONT_MONO}' font-size="8.5" font-weight="700" letter-spacing="0.6" fill="${t.muted}">${lbl}</text>
  <text x="${cx}" y="263" font-family='${FONT_SERIF}' font-size="17.5" font-weight="700" fill="${t.ink}">${escapeXml(fitText(val, 180, 17.5))}</text>
  <text x="${cx}" y="280" font-family='${FONT_SANS}' font-size="10" fill="${t.sub}">${escapeXml(fitText(sub, 180, 10))}</text>`;
      })
      .join("\n");

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(profile.username)} — Seal Ink Monograph Profile">
  <title>${escapeXml(profile.username)} — Seal Ink Monograph</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="8.5" y="8.5" width="${w - 17}" height="${h - 17}" fill="none" stroke="${t.border}" stroke-opacity="0.72" stroke-width="0.9"/>
  <path d="M 12 24 L 12 12 L 24 12" fill="none" stroke="${t.accent}" stroke-width="1.3"/>
  <path d="M ${w - 24} 12 L ${w - 12} 12 L ${w - 12} 24" fill="none" stroke="${t.accent}" stroke-width="1.3"/>
  <path d="M 12 ${h - 24} L 12 ${h - 12} L 24 ${h - 12}" fill="none" stroke="${t.accent}" stroke-width="1.3"/>
  <path d="M ${w - 24} ${h - 12} L ${w - 12} ${h - 12} L ${w - 12} ${h - 24}" fill="none" stroke="${t.accent}" stroke-width="1.3"/>

  <path d="M 480 222 Q 555 152 628 192 T 764 148 L 836 186 L 836 222 Z" fill="${t.patternBg}" fill-opacity="0.85"/>
  <path d="M 556 222 Q 625 168 696 198 T 836 172 L 836 222 Z" fill="${t.patternFg}" fill-opacity="0.58"/>

  <text x="28" y="34" font-family='${FONT_MONO}' font-size="9.5" letter-spacing="1.4" fill="${t.muted}">MONOGRAPH SCROLL · @${escapeXml(fitText(handleUpper, 150, 9.5, true))}</text>
  <text x="${w - 28}" y="34" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${escapeXml(fitText(siteShort, 190, 9.5, true))}</text>
  <line x1="22" y1="44.5" x2="${w - 22}" y2="44.5" stroke="${t.borderSoft}" stroke-width="0.9"/>

  <rect x="28" y="64" width="6" height="6" fill="${t.accent}"/>
  <text x="42" y="71" font-family='${FONT_MONO}' font-size="9.8" font-weight="700" letter-spacing="1.1" fill="${t.accent}">${escapeXml(fitText(`${profile.displayName.toUpperCase()} · ${profile.location.toUpperCase()}`, 480, 9.8, true))}</text>
  <text x="28" y="126" font-family='${FONT_SERIF}' font-size="44" font-weight="700" fill="${t.ink}">${safeName}<tspan fill="${t.accent}">.</tspan></text>
  ${bioLines.map((line, i) => `<text x="28" y="${158 + i * 22}" font-family='${FONT_SERIF}' font-size="15" font-style="italic" fill="${t.sub}">${escapeXml(line)}</text>`).join("\n  ")}
  <text x="28" y="206" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">STACK · ${escapeXml(fitText(stackLine, 460, 10, true))}</text>

  <!-- Carved Cinnabar Seal -->
  <line x1="736.5" y1="62" x2="736.5" y2="148" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="756" y="62" width="46" height="46" rx="2" fill="${t.accent}"/>
  <rect x="760" y="66" width="38" height="38" fill="none" stroke="${t.accentFg}" stroke-width="1.3"/>
  <line x1="779" y1="69" x2="779" y2="101" stroke="${t.accentFg}" stroke-width="1.6"/>
  <line x1="764" y1="85" x2="794" y2="85" stroke="${t.accentFg}" stroke-width="1.5"/>
  <path d="M 766 73 H 776 V 81 H 766" fill="none" stroke="${t.accentFg}" stroke-width="1.4"/>
  <path d="M 783 73 H 792 V 97 H 783" fill="none" stroke="${t.accentFg}" stroke-width="1.4"/>
  <text x="779" y="124" text-anchor="middle" font-family='${FONT_MONO}' font-size="8.5" letter-spacing="1" fill="${t.accent}">SEAL · 06</text>

  <line x1="22" y1="222.5" x2="${w - 22}" y2="222.5" stroke="${t.border}" stroke-opacity="0.65" stroke-width="0.9"/>
  <line x1="22" y1="225.5" x2="${w - 22}" y2="225.5" stroke="${t.borderSoft}" stroke-width="0.7"/>
  ${colophon}
</svg>`;
  }

  if (theme.id === "synth-hardware") {
    const w = 846;
    const h = 300;
    const safeHandle = escapeXml(fitText(handleUpper, 480, 42, false));
    const bioLines = wrapText(profile.bio, 480, 12.8, 2, false);
    const screw = (cx: number, cy: number) =>
      `<g><circle cx="${cx}" cy="${cy}" r="4.5" fill="${t.patternBg}" stroke="${t.border}" stroke-width="1"/><line x1="${cx - 2.5}" y1="${cy}" x2="${cx + 2.5}" y2="${cy}" stroke="${t.muted}" stroke-width="1"/></g>`;
    const grillDots: string[] = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        const dx = c - 2.5;
        const dy = r - 2.5;
        if (dx * dx + dy * dy <= 7.8) {
          grillDots.push(`<circle cx="${626 + c * 9}" cy="${74 + r * 9}" r="2.1" fill="${t.border}" fill-opacity="0.65"/>`);
        }
      }
    }
    const knobs: [string, string, number, number][] = [
      ["FREQ", t.accent, 608, 174],
      ["RESO", t.secondary, 668, 174],
      ["GATE", t.tertiary, 728, 174],
      ["TUNE", t.highlight, 788, 174],
    ];
    const knobSvg = knobs
      .map(
        ([lbl, col, kx, ky], i) => `
  <circle cx="${kx}" cy="${ky}" r="18" fill="${t.surface}" stroke="${t.border}" stroke-width="1.2"/>
  <circle cx="${kx}" cy="${ky}" r="13" fill="${col}"/>
  <line x1="${kx}" y1="${ky}" x2="${kx + (i % 2 === 0 ? 7 : -7)}" y2="${ky - 8}" stroke="${t.accentFg}" stroke-width="2" stroke-linecap="square"/>
  <text x="${kx}" y="${ky + 31}" text-anchor="middle" font-family='${FONT_MONO}' font-size="8.2" font-weight="700" fill="${t.muted}">${lbl}</text>`
      )
      .join("");
    const stats: [string, string, string][] = [
      ["CH.01 REPOS", fmtNum(profile.publicRepos), t.accent],
      ["CH.02 STARS", fmtNum(profile.totalStars), t.secondary],
      ["CH.03 FOLLOW", fmtNum(profile.followers), t.tertiary],
      ["CH.04 STACK", profile.topLanguages[0] || "OSS", t.highlight],
    ];
    const statRow = stats
      .map(([lbl, val, col], idx) => {
        const sx = 24 + idx * 202;
        return `<rect x="${sx}" y="232" width="190" height="46" rx="2" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <circle cx="${sx + 14}" cy="246" r="3.5" fill="${col}"/>
  <text x="${sx + 24}" y="249.5" font-family='${FONT_MONO}' font-size="8.5" font-weight="700" fill="${t.muted}">${lbl}</text>
  <text x="${sx + 14}" y="270" font-family='${FONT_MONO}' font-size="15.5" font-weight="800" fill="${t.ink}">${escapeXml(fitText(val, 160, 15.5, true))}</text>`;
      })
      .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(profile.username)} — Tactile Industrial Synth Profile">
  <title>${escapeXml(profile.username)} — Industrial Synth</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="4" fill="${t.bg}" stroke="${t.border}" stroke-width="1.4"/>
  <rect x="10" y="10" width="${w - 20}" height="28" fill="${t.patternBg}" stroke="${t.borderSoft}" stroke-width="0.9"/>
  ${screw(20, 24)}${screw(w - 20, 24)}${screw(20, h - 14)}${screw(w - 20, h - 14)}
  <circle cx="38" cy="24" r="4" fill="${t.accent}"/>
  <text x="50" y="28" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.ink}">OP-DEV // FIELD SYNTH · @${escapeXml(fitText(profile.username.toUpperCase(), 150, 10, true))}</text>
  <text x="${w - 36}" y="28" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${escapeXml(fitText(siteShort, 190, 9.5, true))}</text>

  <text x="26" y="68" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.accent}">SYNTH MODULE 07 · ${escapeXml(fitText(profile.location.toUpperCase(), 220, 9.5, true))}</text>
  <text x="24" y="114" font-family='${FONT_SANS}' font-size="42" font-weight="800" letter-spacing="-0.03em" fill="${t.ink}">${safeHandle}</text>
  ${bioLines.map((l, i) => `<text x="26" y="${142 + i * 19}" font-family='${FONT_SANS}' font-size="12.8" fill="${t.sub}">${escapeXml(l)}</text>`).join("\n  ")}
  <rect x="26" y="186" width="510" height="30" rx="2" fill="#101216" stroke="${t.border}" stroke-width="1"/>
  <circle cx="40" cy="201" r="3.5" fill="${t.accent}"/>
  <text x="52" y="205" font-family='${FONT_MONO}' font-size="10.5" font-weight="700" fill="#F3F2EE">PATCH: ${escapeXml(fitText(stackLine, 420, 10.5, true))}</text>

  <rect x="572" y="50" width="248" height="166" rx="2" fill="${t.patternBg}" stroke="${t.border}" stroke-width="1"/>
  <g>${grillDots.join("")}</g>
  <rect x="692" y="64" width="114" height="66" rx="2" fill="#0B0D11" stroke="${t.border}" stroke-width="1"/>
  <polyline points="700,104 714,96 728,110 742,84 756,102 770,88 784,106 798,94" fill="none" stroke="${t.accent}" stroke-width="2"/>
  <text x="700" y="78" font-family='${FONT_MONO}' font-size="8" fill="${t.secondary}">OLED · 128 BPM</text>
  ${knobSvg}
  ${statRow}
</svg>`;
  }

  if (theme.id === "pcb-solder-mask") {
    const w = 846;
    const h = 300;
    const safeHandle = escapeXml(fitText(handleUpper, 480, 38, true));
    const bioLines = wrapText(profile.bio, 490, 12.5, 2, false);
    const via = (cx: number, cy: number) =>
      `<g><circle cx="${cx}" cy="${cy}" r="5.5" fill="${t.accent}"/><circle cx="${cx}" cy="${cy}" r="2.4" fill="${t.bg}"/></g>`;
    const pinsH = [0, 1, 2, 3, 4, 5]
      .map(
        (i) =>
          `<rect x="${668 + i * 14}" y="68" width="6" height="12" fill="${t.accent}"/><rect x="${668 + i * 14}" y="172" width="6" height="12" fill="${t.accent}"/>`
      )
      .join("");
    const pinsV = [0, 1, 2, 3, 4, 5]
      .map(
        (i) =>
          `<rect x="646" y="${90 + i * 13}" width="12" height="6" fill="${t.accent}"/><rect x="752" y="${90 + i * 13}" width="12" height="6" fill="${t.accent}"/>`
      )
      .join("");
    const stats: [string, string][] = [
      ["PIN 01 · REPOS", fmtNum(profile.publicRepos)],
      ["PIN 02 · STARS", fmtNum(profile.totalStars)],
      ["PIN 03 · FOLLOW", fmtNum(profile.followers)],
      ["PIN 04 · CORE", profile.topLanguages[0] || "OSS"],
    ];
    const pinRow = stats
      .map(([k, v], idx) => {
        const px = 28 + idx * 198;
        return `<rect x="${px}" y="232" width="184" height="44" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <circle cx="${px + 12}" cy="246" r="3" fill="${t.accent}"/>
  <text x="${px + 22}" y="249" font-family='${FONT_MONO}' font-size="8.4" font-weight="700" fill="${t.muted}">${k}</text>
  <text x="${px + 12}" y="268" font-family='${FONT_MONO}' font-size="14.5" font-weight="800" fill="${t.ink}">${escapeXml(fitText(v, 156, 14.5, true))}</text>`;
      })
      .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(profile.username)} — Solder Mask PCB Profile">
  <title>${escapeXml(profile.username)} — Solder Mask PCB</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1.5"/>
  <rect x="8.5" y="8.5" width="${w - 17}" height="${h - 17}" fill="none" stroke="${t.borderSoft}" stroke-width="0.9"/>
  <path d="M 30 46 L 190 46 L 210 66 L 560 66 M 560 124 L 620 124 L 640 104 M 560 162 L 620 162 L 640 142" fill="none" stroke="${t.borderSoft}" stroke-width="1.2"/>
  ${via(18, 18)}${via(w - 18, 18)}${via(18, h - 18)}${via(w - 18, h - 18)}
  <text x="34" y="29" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.accent}">REV 2.6 // PCB-846 · ENIG GOLD · @${escapeXml(fitText(profile.username.toUpperCase(), 150, 9.5, true))}</text>
  <text x="${w - 34}" y="29" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${escapeXml(fitText(siteShort, 180, 9.5, true))}</text>
  <line x1="18" y1="38.5" x2="${w - 18}" y2="38.5" stroke="${t.borderSoft}" stroke-width="0.9"/>

  <text x="28" y="66" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.secondary}">SILKSCREEN // ${escapeXml(fitText(profile.displayName.toUpperCase(), 260, 9.5, true))}</text>
  <text x="28" y="112" font-family='${FONT_MONO}' font-size="38" font-weight="800" fill="${t.ink}">${safeHandle}</text>
  ${bioLines.map((l, i) => `<text x="28" y="${140 + i * 19}" font-family='${FONT_SANS}' font-size="12.5" fill="${t.sub}">${escapeXml(l)}</text>`).join("\n  ")}
  <rect x="28" y="186" width="530" height="28" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <text x="40" y="204" font-family='${FONT_MONO}' font-size="10.2" font-weight="700" fill="${t.ink}">BUS: <tspan fill="${t.accent}">${escapeXml(fitText(stackLine, 450, 10.2, true))}</tspan></text>

  <!-- QFP-24 IC Package -->
  ${pinsH}${pinsV}
  <rect x="658" y="80" width="94" height="92" rx="2" fill="${t.surface}" stroke="${t.border}" stroke-width="1.5"/>
  <circle cx="670" cy="92" r="3" fill="${t.accent}"/>
  <text x="705" y="118" text-anchor="middle" font-family='${FONT_MONO}' font-size="14" font-weight="800" fill="${t.ink}">U1</text>
  <text x="705" y="138" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.accent}">${escapeXml(fitText(initials, 70, 9.5, true))}-SOC</text>
  <text x="705" y="156" text-anchor="middle" font-family='${FONT_MONO}' font-size="8" fill="${t.muted}">VCC 3.3V</text>
  ${pinRow}
</svg>`;
  }

  if (theme.id === "transit-boarding") {
    const w = 846;
    const h = 300;
    const safeHandle = escapeXml(fitText(handleUpper, 480, 38, false));
    const bioLines = wrapText(profile.bio, 530, 12.5, 2, false);
    const bars = [3, 1, 2, 1, 4, 1, 2, 2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2];
    let bx = 634;
    const barcode = bars
      .map((bw) => {
        const rect = `<rect x="${bx}" y="230" width="${bw * 2}" height="38" fill="${t.ink}" shape-rendering="crispEdges"/>`;
        bx += bw * 2 + 4;
        return rect;
      })
      .join("");
    const boxes: [string, string][] = [
      ["GATE / REPOS", fmtNum(profile.publicRepos)],
      ["MILES / STARS", fmtNum(profile.totalStars)],
      ["CREW / FOLLOW", fmtNum(profile.followers)],
      ["CLASS / LANG", profile.topLanguages[0] || "OSS"],
    ];
    const boxSvg = boxes
      .map(([k, v], idx) => {
        const x = 24 + idx * 142;
        return `<rect x="${x}" y="218" width="132" height="56" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <text x="${x + 10}" y="236" font-family='${FONT_MONO}' font-size="8.2" font-weight="700" fill="${t.muted}">${k}</text>
  <text x="${x + 10}" y="261" font-family='${FONT_MONO}' font-size="15" font-weight="800" fill="${idx === 0 ? t.accent : t.ink}">${escapeXml(fitText(v, 110, 15, true))}</text>`;
      })
      .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(profile.username)} — Transit & Boarding Pass Profile">
  <title>${escapeXml(profile.username)} — Transit &amp; Boarding Pass</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1.2"/>
  <rect x="1" y="1" width="${w - 2}" height="34" fill="${t.accent}"/>
  <text x="24" y="22.5" font-family='${FONT_MONO}' font-size="11" font-weight="800" letter-spacing="1.2" fill="${t.accentFg}">BOARDING PASS // DEV → OSS EXPRESS</text>
  <text x="588" y="22.5" text-anchor="end" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.accentFg}">SEAT 09A</text>
  <text x="${w - 24}" y="22.5" text-anchor="end" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.accentFg}">STUB · @${escapeXml(fitText(profile.username.toUpperCase(), 110, 10, true))}</text>

  <!-- Perforation tear-off stub divider -->
  <line x1="608" y1="35" x2="608" y2="${h - 1}" stroke="${t.border}" stroke-dasharray="4 4" stroke-width="1.2"/>
  <circle cx="608" cy="35" r="7" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <circle cx="608" cy="${h - 1}" r="7" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>

  <text x="24" y="64" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.secondary}">PASSENGER · ${escapeXml(fitText(profile.displayName.toUpperCase(), 240, 9.5, true))} · ${escapeXml(fitText(profile.location.toUpperCase(), 160, 9.5, true))}</text>
  <text x="24" y="110" font-family='${FONT_SANS}' font-size="38" font-weight="800" letter-spacing="-0.02em" fill="${t.ink}">${safeHandle}</text>
  ${bioLines.map((l, i) => `<text x="24" y="${138 + i * 19}" font-family='${FONT_SANS}' font-size="12.5" fill="${t.sub}">${escapeXml(l)}</text>`).join("\n  ")}
  <text x="24" y="196" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">ROUTE: <tspan fill="${t.ink}" font-weight="700">${escapeXml(fitText(stackLine, 460, 10, true))}</tspan></text>
  ${boxSvg}

  <!-- Right Passport Avatar + Barcode Stub -->
  <rect x="656" y="54" width="136" height="142" fill="${t.surface}" stroke="${t.border}" stroke-width="1.2"/>
  ${renderPixelAvatarGroup(profile.pixelAvatar, initials, 670, 64, 108, t)}
  <text x="724" y="188" text-anchor="middle" font-family='${FONT_MONO}' font-size="8.8" font-weight="700" fill="${t.muted}">PASSPORT · ${escapeXml(fitText(profile.username.toUpperCase(), 90, 8.8, true))}</text>
  ${barcode}
  <text x="724" y="282" text-anchor="middle" font-family='${FONT_MONO}' font-size="8.4" fill="${t.muted}">${escapeXml(fitText(siteShort, 190, 8.4, true))}</text>
</svg>`;
  }

  if (theme.id === "classic-desktop-os") {
    const w = 846;
    const h = 300;
    const safeHandle = escapeXml(fitText(profile.username, 460, 34, true));
    const bioLines = wrapText(profile.bio, 490, 12.2, 2, false);
    const stripes = [38, 41, 44, 47, 50]
      .map((sy) => `<line x1="46" y1="${sy}" x2="812" y2="${sy}" stroke="${t.borderSoft}" stroke-width="1"/>`)
      .join("");
    const stats: [string, string][] = [
      ["Repos", fmtNum(profile.publicRepos)],
      ["Stars", fmtNum(profile.totalStars)],
      ["Followers", fmtNum(profile.followers)],
      ["Primary", profile.topLanguages[0] || "OSS"],
    ];
    const statCells = stats
      .map(([k, v], idx) => {
        const sx = 36 + idx * 194;
        return `<rect x="${sx}" y="224" width="182" height="44" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <text x="${sx + 10}" y="240" font-family='${FONT_MONO}' font-size="8.8" fill="${t.muted}">${k}</text>
  <text x="${sx + 10}" y="259" font-family='${FONT_MONO}' font-size="14" font-weight="800" fill="${idx === 0 ? t.accent : t.ink}">${escapeXml(fitText(v, 156, 14, true))}</text>`;
      })
      .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(profile.username)} — Classic Desktop OS Profile">
  <title>${escapeXml(profile.username)} — Classic Desktop OS</title>
  <defs>
    <pattern id="dith-${uid}" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="4" fill="${t.patternBg}"/>
      <rect x="0" y="0" width="2" height="2" fill="${t.patternFg}" fill-opacity="0.45"/>
      <rect x="2" y="2" width="2" height="2" fill="${t.patternFg}" fill-opacity="0.45"/>
    </pattern>
  </defs>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="url(#dith-${uid})" stroke="${t.border}" stroke-width="1.2"/>
  <rect x="1" y="1" width="${w - 2}" height="22" fill="${t.surface}"/>
  <line x1="1" y1="23.5" x2="${w - 1}" y2="23.5" stroke="${t.border}" stroke-width="1.2"/>
  <rect x="12" y="7" width="9" height="9" fill="${t.ink}" shape-rendering="crispEdges"/>
  <text x="30" y="15.5" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.ink}">File   Edit   View   Special</text>
  <text x="${w - 14}" y="15.5" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${escapeXml(fitText(siteShort, 180, 9.5, true))}</text>

  <!-- Elevated Classic OS Window -->
  <rect x="22" y="36" width="806" height="248" fill="${t.border}" fill-opacity="0.24"/>
  <rect x="18" y="32" width="806" height="248" fill="${t.surface}" stroke="${t.border}" stroke-width="1.4"/>
  <rect x="19" y="33" width="804" height="24" fill="${t.bg}"/>
  ${stripes}
  <rect x="28" y="38" width="13" height="13" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <rect x="316" y="35" width="214" height="20" fill="${t.bg}"/>
  <text x="423" y="49" text-anchor="middle" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.ink}">About This Developer</text>
  <line x1="18" y1="57.5" x2="824" y2="57.5" stroke="${t.border}" stroke-width="1.2"/>

  <text x="36" y="84" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.accent}">SYSTEM 7.6 // ${escapeXml(fitText(profile.displayName, 240, 9.5, true))}</text>
  <text x="36" y="124" font-family='${FONT_MONO}' font-size="34" font-weight="800" fill="${t.ink}">${safeHandle}</text>
  ${bioLines.map((l, i) => `<text x="36" y="${152 + i * 19}" font-family='${FONT_SANS}' font-size="12.2" fill="${t.sub}">${escapeXml(l)}</text>`).join("\n  ")}
  <text x="36" y="204" font-family='${FONT_MONO}' font-size="9.8" fill="${t.muted}">DISK: ${escapeXml(fitText(stackLine, 460, 9.8, true))}</text>

  <!-- Right Framed Pixel Avatar -->
  <rect x="668" y="72" width="132" height="138" fill="${t.bg}" stroke="${t.border}" stroke-width="1.2"/>
  ${renderPixelAvatarGroup(profile.pixelAvatar, initials, 680, 82, 108, t)}
  <text x="734" y="202" text-anchor="middle" font-family='${FONT_MONO}' font-size="8.8" font-weight="700" fill="${t.ink}">@${escapeXml(fitText(profile.username, 100, 8.8, true))}</text>
  ${statCells}
</svg>`;
  }

  if (theme.id === "riso-duotone") {
    const w = 846;
    const h = 300;
    const safeHandle = escapeXml(fitText(handleUpper, 510, 44, false));
    const bioLines = wrapText(profile.bio, 510, 13, 2, false);
    const reg = (cx: number, cy: number) =>
      `<g stroke="${t.secondary}" stroke-width="0.9" fill="none"><circle cx="${cx}" cy="${cy}" r="3.5"/><line x1="${cx - 6}" y1="${cy}" x2="${cx + 6}" y2="${cy}"/><line x1="${cx}" y1="${cy - 6}" x2="${cx}" y2="${cy + 6}"/></g>`;
    const metrics: [string, string, string][] = [
      ["PLATE 01 · REPOS", fmtNum(profile.publicRepos), t.accent],
      ["PLATE 02 · STARS", fmtNum(profile.totalStars), t.secondary],
      ["PLATE 03 · FOLLOW", fmtNum(profile.followers), t.tertiary],
      ["PLATE 04 · INK", profile.topLanguages[0] || "OSS", t.highlight],
    ];
    const footCols = metrics
      .map(([k, v, col], idx) => {
        const mx = 28 + idx * 198;
        return `<rect x="${mx + 2}" y="234" width="184" height="44" fill="${col}" fill-opacity="0.22"/>
  <rect x="${mx}" y="232" width="184" height="44" fill="${t.surface}" stroke="${t.border}" stroke-width="1.1"/>
  <text x="${mx + 12}" y="248" font-family='${FONT_MONO}' font-size="8.2" font-weight="700" fill="${col}">${k}</text>
  <text x="${mx + 12}" y="268" font-family='${FONT_MONO}' font-size="14.5" font-weight="800" fill="${t.ink}">${escapeXml(fitText(v, 156, 14.5, true))}</text>`;
      })
      .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(profile.username)} — Risograph Overprint Poster Profile">
  <title>${escapeXml(profile.username)} — Risograph Poster</title>
  <defs>
    <pattern id="riso-${uid}" width="6" height="6" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="1.05" fill="${t.patternFg}" fill-opacity="${mode === "dark" ? "0.45" : "0.8"}"/>
    </pattern>
  </defs>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1.3"/>
  <rect x="572" y="38" width="254" height="178" fill="url(#riso-${uid})"/>
  ${reg(18, 18)}${reg(w - 18, 18)}${reg(18, h - 18)}${reg(w - 18, h - 18)}
  <text x="34" y="23" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="1.1" fill="${t.accent}">EDITION 011 // 2-INK RISOGRAPH OVERPRINT</text>
  <text x="${w - 34}" y="23" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.secondary}">${escapeXml(fitText(siteShort, 190, 9.5, true))}</text>
  <line x1="26" y1="34" x2="${w - 26}" y2="34" stroke="${t.border}" stroke-width="1.1"/>

  <text x="28" y="64" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.secondary}">PRINT · ${escapeXml(fitText(profile.displayName.toUpperCase(), 240, 9.5, true))} · ${escapeXml(fitText(profile.location.toUpperCase(), 150, 9.5, true))}</text>
  <text x="30.5" y="116.5" font-family='${FONT_SANS}' font-size="44" font-weight="800" letter-spacing="-0.03em" fill="${t.secondary}" fill-opacity="0.58">${safeHandle}</text>
  <text x="28" y="114" font-family='${FONT_SANS}' font-size="44" font-weight="800" letter-spacing="-0.03em" fill="${t.accent}">${safeHandle}</text>
  ${bioLines.map((l, i) => `<text x="28" y="${146 + i * 20}" font-family='${FONT_SANS}' font-size="13" fill="${t.sub}">${escapeXml(l)}</text>`).join("\n  ")}
  <text x="28" y="204" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.ink}">INK PLATES: <tspan fill="${t.accent}">${escapeXml(fitText(stackLine, 430, 10, true))}</tspan></text>

  <!-- Misregistered Duotone Geometric Emblem -->
  <circle cx="712" cy="126" r="52" fill="${t.secondary}" fill-opacity="0.62"/>
  <circle cx="698" cy="118" r="52" fill="${t.accent}" fill-opacity="0.72"/>
  <rect x="678" y="98" width="44" height="44" fill="none" stroke="${t.ink}" stroke-width="2"/>
  <text x="700" y="127" text-anchor="middle" font-family='${FONT_MONO}' font-size="18" font-weight="800" fill="${t.accentFg}">${escapeXml(initials)}</text>
  ${footCols}
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

  if (themeId === "pixel-rpg-hud") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="${t.surface}" stroke="${t.border}" stroke-width="2" shape-rendering="crispEdges"/>
  <rect x="8" y="7" width="76" height="22" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="46" y="21.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.accentFg}">${escapeXml(code)}</text>
  <text x="98" y="22.5" font-family='${FONT_MONO}' font-size="12.5" font-weight="800" fill="${t.ink}">${safeTitle}</text>
  <text x="${w - 14}" y="22" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.muted}">${safeRight}</text>
</svg>`;
  }

  if (themeId === "seal-ink-scroll") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <rect width="${w}" height="${h}" fill="${t.bg}"/>
  <line x1="0" y1="2.5" x2="${w}" y2="2.5" stroke="${t.border}" stroke-opacity="0.75" stroke-width="1.2"/>
  <line x1="0" y1="5.5" x2="${w}" y2="5.5" stroke="${t.borderSoft}" stroke-width="0.7"/>
  <rect x="2" y="12" width="14" height="14" rx="1" fill="${t.accent}"/>
  <rect x="5" y="15" width="8" height="8" fill="none" stroke="${t.accentFg}" stroke-width="1"/>
  <text x="26" y="24" font-family='${FONT_SERIF}' font-size="15.5" font-weight="700" fill="${t.ink}">${safeTitle}</text>
  <text x="${w - 4}" y="23" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" letter-spacing="0.8" fill="${t.muted}">${safeRight}</text>
  <line x1="0" y1="34.5" x2="${w}" y2="34.5" stroke="${t.borderSoft}" stroke-width="0.9"/>
</svg>`;
  }

  if (themeId === "synth-hardware") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="3" fill="${t.patternBg}" stroke="${t.border}" stroke-width="1.1"/>
  <circle cx="16" cy="18" r="4" fill="${t.accent}"/>
  <circle cx="28" cy="18" r="2.5" fill="${t.secondary}"/>
  <text x="40" y="22" font-family='${FONT_MONO}' font-size="11" font-weight="800" fill="${t.ink}">PATCH ${escapeXml(code)} // ${safeTitle}</text>
  <text x="${w - 16}" y="22" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${safeRight}</text>
</svg>`;
  }

  if (themeId === "pcb-solder-mask") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1.2"/>
  <circle cx="16" cy="18" r="5" fill="${t.accent}"/><circle cx="16" cy="18" r="2" fill="${t.bg}"/>
  <text x="30" y="22" font-family='${FONT_MONO}' font-size="11" font-weight="800" fill="${t.ink}">BUS ${escapeXml(code)} // ${safeTitle}</text>
  <text x="${w - 30}" y="22" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.accent}">${safeRight}</text>
  <circle cx="${w - 16}" cy="18" r="5" fill="${t.accent}"/><circle cx="${w - 16}" cy="18" r="2" fill="${t.bg}"/>
</svg>`;
  }

  if (themeId === "transit-boarding") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.border}" stroke-width="1.1"/>
  <rect x="1" y="1" width="66" height="${h - 2}" fill="${t.accent}"/>
  <text x="34" y="22" text-anchor="middle" font-family='${FONT_MONO}' font-size="10.5" font-weight="800" fill="${t.accentFg}">L${escapeXml(code)}</text>
  <text x="82" y="22.5" font-family='${FONT_SANS}' font-size="13" font-weight="800" fill="${t.ink}">${safeTitle}</text>
  <text x="${w - 16}" y="22" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.secondary}">${safeRight}</text>
</svg>`;
  }

  if (themeId === "classic-desktop-os") {
    const stripes = [12, 16, 20, 24]
      .map((sy) => `<line x1="10" y1="${sy}" x2="${w - 10}" y2="${sy}" stroke="${t.borderSoft}" stroke-width="1"/>`)
      .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1.2"/>
  ${stripes}
  <rect x="26" y="7" width="260" height="22" fill="${t.bg}"/>
  <text x="34" y="22" font-family='${FONT_MONO}' font-size="11.5" font-weight="800" fill="${t.ink}">[${escapeXml(code)}] ${safeTitle}</text>
  <rect x="${w - 196}" y="7" width="176" height="22" fill="${t.bg}"/>
  <text x="${w - 28}" y="22" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${safeRight}</text>
</svg>`;
  }

  if (themeId === "riso-duotone") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <rect x="2" y="2" width="${w - 2}" height="${h - 2}" fill="${t.secondary}" fill-opacity="0.28"/>
  <rect x="0.5" y="0.5" width="${w - 3}" height="${h - 3}" fill="${t.bg}" stroke="${t.border}" stroke-width="1.2"/>
  <text x="16" y="22" font-family='${FONT_MONO}' font-size="10.5" font-weight="800" fill="${t.secondary}">+ PLATE ${escapeXml(code)}</text>
  <text x="118" y="22.5" font-family='${FONT_SANS}' font-size="13.5" font-weight="800" fill="${t.accent}">${safeTitle}</text>
  <text x="${w - 16}" y="22" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${safeRight}</text>
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

  if (themeId === "pixel-rpg-hud") {
    const descLines = wrapText(repo.description, 368, 12.2, 2, false);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(repo.name)}">
  <rect x="2" y="2" width="${w - 4}" height="${h - 4}" fill="${t.surface}" stroke="${t.border}" stroke-width="2" shape-rendering="crispEdges"/>
  <rect x="6" y="6" width="${w - 12}" height="${h - 12}" fill="none" stroke="${t.borderSoft}" stroke-width="1" shape-rendering="crispEdges"/>
  <rect x="7" y="7" width="${w - 14}" height="26" fill="${t.patternBg}"/>
  <line x1="6" y1="33.5" x2="${w - 6}" y2="33.5" stroke="${t.border}" stroke-width="1.2"/>
  <rect x="16" y="15" width="8" height="8" fill="${plateColor}" shape-rendering="crispEdges"/>
  <text x="31" y="23.5" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.ink}">QUEST ${numStr} · ${escapeXml(repo.language.toUpperCase())}</text>
  <text x="${w - 16}" y="23.5" text-anchor="end" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${plateColor}">★ ${fmtNum(repo.stars)}</text>
  <text x="18" y="68" font-family='${FONT_MONO}' font-size="19" font-weight="800" fill="${t.ink}">${escapeXml(fitText(repo.name, 365, 19, true))}</text>
  ${descLines.map((line, i) => `<text x="18" y="${96 + i * 20}" font-family='${FONT_SANS}' font-size="12.2" fill="${t.sub}">${escapeXml(line)}</text>`).join("\n  ")}
  <line x1="16" y1="148" x2="${w - 16}" y2="148" stroke="${t.borderSoft}" stroke-width="1"/>
  <text x="18" y="172" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.muted}">LOOT // ${escapeXml(fitText(specLine, 330, 10, true))}</text>
</svg>`;
  }

  if (themeId === "seal-ink-scroll") {
    const descLines = wrapText(repo.description, 368, 12.5, 2, false);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(repo.name)}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="7.5" y="7.5" width="${w - 15}" height="${h - 15}" fill="none" stroke="${t.border}" stroke-opacity="0.7" stroke-width="0.9"/>
  <rect x="8" y="8" width="${w - 16}" height="3" fill="${plateColor}"/>
  <text x="20" y="33" font-family='${FONT_MONO}' font-size="9.2" font-weight="700" letter-spacing="1.1" fill="${plateColor}">FOLIO ${roman} · ${escapeXml(repo.language.toUpperCase())}</text>
  <rect x="${w - 36}" y="21" width="13" height="13" rx="1" fill="${plateColor}"/>
  <rect x="${w - 33}" y="24" width="7" height="7" fill="none" stroke="${t.surface}" stroke-width="1"/>
  <text x="20" y="70" font-family='${FONT_SERIF}' font-size="23" font-weight="700" fill="${t.ink}">${escapeXml(fitText(repo.name, 360, 23))}</text>
  ${descLines.map((line, i) => `<text x="20" y="${100 + i * 20}" font-family='${FONT_SANS}' font-size="12.5" fill="${t.sub}">${escapeXml(line)}</text>`).join("\n  ")}
  <line x1="20" y1="148" x2="${w - 20}" y2="148" stroke="${t.borderSoft}" stroke-width="0.9"/>
  <text x="20" y="170" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">${escapeXml(fitText(specLine, 372, 10, true))}</text>
</svg>`;
  }

  if (themeId === "synth-hardware") {
    const descLines = wrapText(repo.description, 320, 12.2, 2, false);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(repo.name)}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="3" fill="${t.surface}" stroke="${t.border}" stroke-width="1.2"/>
  <rect x="6" y="6" width="${w - 12}" height="26" fill="${t.patternBg}" stroke="${t.borderSoft}" stroke-width="0.8"/>
  <circle cx="18" cy="19" r="3.5" fill="${plateColor}"/>
  <text x="29" y="23" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.ink}">MOD-${numStr} · ${escapeXml(repo.language.toUpperCase())}</text>
  <text x="${w - 16}" y="23" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">★ ${fmtNum(repo.stars)}</text>
  <circle cx="${w - 34}" cy="84" r="16" fill="${t.patternBg}" stroke="${t.border}" stroke-width="1.1"/>
  <circle cx="${w - 34}" cy="84" r="10" fill="${plateColor}"/>
  <line x1="${w - 34}" y1="84" x2="${w - 29}" y2="78" stroke="${t.accentFg}" stroke-width="1.8"/>
  <text x="18" y="68" font-family='${FONT_SANS}' font-size="19" font-weight="800" fill="${t.ink}">${escapeXml(fitText(repo.name, 315, 19))}</text>
  ${descLines.map((line, i) => `<text x="18" y="${96 + i * 20}" font-family='${FONT_SANS}' font-size="12.2" fill="${t.sub}">${escapeXml(line)}</text>`).join("\n  ")}
  <line x1="16" y1="148" x2="${w - 16}" y2="148" stroke="${t.borderSoft}" stroke-width="0.9"/>
  <text x="18" y="170" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">${escapeXml(fitText(specLine, 372, 10, true))}</text>
</svg>`;
  }

  if (themeId === "pcb-solder-mask") {
    const descLines = wrapText(repo.description, 368, 12.2, 2, false);
    const via = (cx: number, cy: number) =>
      `<g><circle cx="${cx}" cy="${cy}" r="3.8" fill="${t.accent}"/><circle cx="${cx}" cy="${cy}" r="1.6" fill="${t.bg}"/></g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(repo.name)}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1.3"/>
  <rect x="7" y="7" width="${w - 14}" height="${h - 14}" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="0.9"/>
  ${via(14, 14)}${via(w - 14, 14)}${via(14, h - 14)}${via(w - 14, h - 14)}
  <text x="28" y="25" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${plateColor}">U${idx + 1} · ${escapeXml(repo.language.toUpperCase())}</text>
  <text x="${w - 28}" y="25" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.accent}">★ ${fmtNum(repo.stars)}</text>
  <line x1="16" y1="34" x2="${w - 16}" y2="34" stroke="${t.borderSoft}" stroke-width="0.8"/>
  <text x="20" y="68" font-family='${FONT_MONO}' font-size="19" font-weight="800" fill="${t.ink}">${escapeXml(fitText(repo.name, 360, 19, true))}</text>
  ${descLines.map((line, i) => `<text x="20" y="${96 + i * 20}" font-family='${FONT_SANS}' font-size="12.2" fill="${t.sub}">${escapeXml(line)}</text>`).join("\n  ")}
  <line x1="18" y1="148" x2="${w - 18}" y2="148" stroke="${t.borderSoft}" stroke-width="0.9"/>
  <text x="26" y="170" font-family='${FONT_MONO}' font-size="9.8" fill="${t.muted}">TP${idx + 1} // ${escapeXml(fitText(specLine, 336, 9.8, true))}</text>
</svg>`;
  }

  if (themeId === "transit-boarding") {
    const descLines = wrapText(repo.description, 368, 12.2, 2, false);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(repo.name)}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.border}" stroke-width="1.1"/>
  <rect x="1" y="1" width="${w - 2}" height="28" fill="${plateColor}"/>
  <circle cx="18" cy="15" r="4.5" fill="none" stroke="${t.accentFg}" stroke-width="1.5"/>
  <text x="30" y="19" font-family='${FONT_MONO}' font-size="9.8" font-weight="800" fill="${t.accentFg}">ST-${numStr} · ${escapeXml(repo.language.toUpperCase())}</text>
  <text x="${w - 16}" y="19" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.accentFg}">★ ${fmtNum(repo.stars)}</text>
  <line x1="18" y1="44" x2="${w - 18}" y2="44" stroke="${plateColor}" stroke-width="2"/>
  <circle cx="18" cy="44" r="4" fill="${t.surface}" stroke="${plateColor}" stroke-width="2"/>
  <circle cx="${Math.round(w / 2)}" cy="44" r="4" fill="${plateColor}"/>
  <circle cx="${w - 18}" cy="44" r="4" fill="${t.surface}" stroke="${plateColor}" stroke-width="2"/>
  <text x="18" y="80" font-family='${FONT_SANS}' font-size="19" font-weight="800" fill="${t.ink}">${escapeXml(fitText(repo.name, 368, 19))}</text>
  ${descLines.map((line, i) => `<text x="18" y="${106 + i * 19}" font-family='${FONT_SANS}' font-size="12.2" fill="${t.sub}">${escapeXml(line)}</text>`).join("\n  ")}
  <line x1="16" y1="150" x2="${w - 16}" y2="150" stroke="${t.borderSoft}" stroke-dasharray="3 3" stroke-width="1"/>
  <text x="18" y="172" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">${escapeXml(fitText(specLine, 376, 10, true))}</text>
</svg>`;
  }

  if (themeId === "classic-desktop-os") {
    const descLines = wrapText(repo.description, 368, 12.2, 2, false);
    const stripes = [8, 11, 14, 17, 20]
      .map((sy) => `<line x1="28" y1="${sy}" x2="${w - 14}" y2="${sy}" stroke="${t.borderSoft}" stroke-width="0.9"/>`)
      .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(repo.name)}">
  <rect x="3" y="3" width="${w - 3}" height="${h - 3}" fill="${t.border}" fill-opacity="0.22"/>
  <rect x="0.5" y="0.5" width="${w - 4}" height="${h - 4}" fill="${t.surface}" stroke="${t.border}" stroke-width="1.2"/>
  <rect x="1" y="1" width="${w - 5}" height="24" fill="${t.bg}"/>
  ${stripes}
  <rect x="9" y="7" width="12" height="12" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <rect x="130" y="4" width="156" height="18" fill="${t.bg}"/>
  <text x="208" y="16.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.ink}">${escapeXml(fitText(repo.name, 140, 9.5, true))}.app</text>
  <line x1="0.5" y1="25.5" x2="${w - 3.5}" y2="25.5" stroke="${t.border}" stroke-width="1.1"/>
  <text x="18" y="64" font-family='${FONT_MONO}' font-size="19" font-weight="800" fill="${t.ink}">${escapeXml(fitText(repo.name, 300, 19, true))}</text>
  <text x="${w - 18}" y="62" text-anchor="end" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${plateColor}">★ ${fmtNum(repo.stars)}</text>
  ${descLines.map((line, i) => `<text x="18" y="${94 + i * 20}" font-family='${FONT_SANS}' font-size="12.2" fill="${t.sub}">${escapeXml(line)}</text>`).join("\n  ")}
  <line x1="16" y1="146" x2="${w - 16}" y2="146" stroke="${t.borderSoft}" stroke-width="1"/>
  <text x="18" y="168" font-family='${FONT_MONO}' font-size="9.8" fill="${t.muted}">${escapeXml(fitText(specLine, 360, 9.8, true))}</text>
</svg>`;
  }

  if (themeId === "riso-duotone") {
    const descLines = wrapText(repo.description, 364, 12.2, 2, false);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(repo.name)}">
  <rect x="3.5" y="3.5" width="${w - 4}" height="${h - 4}" fill="${plateColor}" fill-opacity="0.28"/>
  <rect x="0.5" y="0.5" width="${w - 4}" height="${h - 4}" fill="${t.surface}" stroke="${t.border}" stroke-width="1.2"/>
  <rect x="1" y="1" width="${w - 5}" height="28" fill="${t.patternBg}"/>
  <line x1="0.5" y1="29.5" x2="${w - 3.5}" y2="29.5" stroke="${t.border}" stroke-width="1"/>
  <text x="16" y="19" font-family='${FONT_MONO}' font-size="9.8" font-weight="800" fill="${plateColor}">PRINT ${numStr} // ${escapeXml(repo.language.toUpperCase())}</text>
  <text x="${w - 18}" y="19" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.secondary}">★ ${fmtNum(repo.stars)}</text>
  <text x="19.5" y="67.5" font-family='${FONT_SANS}' font-size="20" font-weight="800" fill="${t.secondary}" fill-opacity="0.45">${escapeXml(fitText(repo.name, 360, 20))}</text>
  <text x="18" y="66" font-family='${FONT_SANS}' font-size="20" font-weight="800" fill="${t.accent}">${escapeXml(fitText(repo.name, 360, 20))}</text>
  ${descLines.map((line, i) => `<text x="18" y="${96 + i * 20}" font-family='${FONT_SANS}' font-size="12.2" fill="${t.sub}">${escapeXml(line)}</text>`).join("\n  ")}
  <line x1="16" y1="146" x2="${w - 18}" y2="146" stroke="${t.borderSoft}" stroke-width="0.9"/>
  <text x="18" y="168" font-family='${FONT_MONO}' font-size="9.8" fill="${t.muted}">${escapeXml(fitText(specLine, 368, 9.8, true))}</text>
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
  profileUsername: string;
}): { entries: ZipFileEntry[]; markdownLines: string[] } {
  const { slot, widgets, theme, overrides, profileUsername } = params;
  if (!widgets.length) return { entries: [], markdownLines: [] };

  const rows = packBentoRows(widgets);
  const entries: ZipFileEntry[] = [];
  const markdownLines: string[] = [];

  rows.forEach((row, rIdx) => {
    const rowHasLive = row.items.some((w) => isLiveWidgetId(w.widgetId));

    if (rowHasLive) {
      // Emit individual SVGs so .github/workflows/gitskins-widgets.yml (or snake.yml) can refresh
      // each live widget in-place without regenerating static composites.
      const tags: string[] = [];
      row.items.forEach((w, iIdx) => {
        if (isPlataneSnakeInstance(w)) {
          const snakeCfg = w.config as ContributionSnakeConfig;
          const snakeUser = (snakeCfg.username || profileUsername || "Furina-he").replace(/^@+/, "");
          tags.push(buildSnakePlataneMarkdown(snakeUser));
          return;
        }
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

  const topSlot = buildBentoSlotAssets({
    slot: "top",
    widgets: bySlot.top,
    theme,
    overrides,
    profileUsername: profile.username,
  });
  const underHeroSlot = buildBentoSlotAssets({
    slot: "under-hero",
    widgets: bySlot["under-hero"],
    theme,
    overrides,
    profileUsername: profile.username,
  });
  const underCardsSlot = buildBentoSlotAssets({
    slot: "under-cards",
    widgets: bySlot["under-cards"],
    theme,
    overrides,
    profileUsername: profile.username,
  });
  const bottomSlot = buildBentoSlotAssets({
    slot: "bottom",
    widgets: bySlot.bottom,
    theme,
    overrides,
    profileUsername: profile.username,
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

  const nativeLiveWidgets = mountedWidgets.filter(
    (w) => isLiveWidgetId(w.widgetId) && !isPlataneSnakeInstance(w)
  );
  const plataneSnakeInst = mountedWidgets.find((w) => isPlataneSnakeInstance(w)) ?? null;

  if (nativeLiveWidgets.length > 0) {
    entries.push({
      path: ".github/workflows/gitskins-widgets.yml",
      content: buildLiveWorkflowYaml({
        themeId: theme.id,
        liveWidgets: nativeLiveWidgets,
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

  if (plataneSnakeInst) {
    const sc = plataneSnakeInst.config as ContributionSnakeConfig;
    entries.push({
      path: ".github/workflows/snake.yml",
      content: buildSnakeWorkflowYaml({
        theme,
        username: sc.username || profile.username,
        accentOverride: plataneSnakeInst.accentOverride || overrides.accentOverride,
        schedule: sc.schedule,
      }),
    });
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
    ...(nativeLiveWidgets.length > 0
      ? [
          `<!-- Auto-updating live widgets enabled via .github/workflows/gitskins-widgets.yml -->`,
        ]
      : []),
    ...(plataneSnakeInst
      ? [
          `<!-- Theme-synced GitHub contribution snake enabled via .github/workflows/snake.yml -->`,
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
