import { stripProtocol } from "../profile/githubApi";
import type { ZipFileEntry } from "../profile/zipExport";
import type { Lang, PreviewMode, SkinTheme, ThemeTokens } from "../types";
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
import type { RepoFeatureItem, RepoSkinData } from "./repoGithubApi";

export interface RepoSkinOptions {
  accentOverride: string;
  featureCount: 2 | 4;
  showArch: boolean;
  showBadge: boolean;
  animated: boolean;
}

export const DEFAULT_REPO_OPTIONS: RepoSkinOptions = {
  accentOverride: "",
  featureCount: 4,
  showArch: true,
  showBadge: true,
  animated: true,
};

export interface RenderedRepoSuite {
  hero: string;
  install: string;
  secFeatures: string;
  features: string[];
  secArch: string;
  arch: string;
  badge: string;
}

function fmtNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/**
 * R05: Optional "Styled with GitSkins" footer attribution badge (216x32).
 * Adapts cleanly to all 4 skins and Light/Dark tokens.
 */
export function renderGitSkinsBadgeSvg(
  themeId: string,
  _mode: PreviewMode,
  baseTokens: ThemeTokens,
  accentOverride = ""
): string {
  const t = resolveTokens(baseTokens, accentOverride);
  const w = 216;
  const h = 32;

  if (themeId === "blueprint-cad") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Styled with GitSkins">
  <title>Styled with GitSkins</title>
  <polygon points="${chamferPolygon(0.5, 0.5, w - 1, h - 1, 6)}" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <rect x="10" y="9" width="14" height="14" fill="none" stroke="${t.accent}" stroke-width="1.2"/>
  <rect x="14" y="13" width="6" height="6" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="32" y="19.5" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">STYLED WITH</text>
  <text x="112" y="19.5" font-family='${FONT_MONO}' font-size="10.5" font-weight="700" fill="${t.ink}">GITSKINS</text>
  <text x="${w - 12}" y="19.5" text-anchor="end" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.accent}">↗</text>
</svg>`;
  }

  if (themeId === "editorial-zine") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Styled with GitSkins">
  <title>Styled with GitSkins</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="2.4" fill="${t.border}"/>
  <rect x="12" y="13" width="6" height="6" fill="${t.accent}"/>
  <text x="26" y="20" font-family='${FONT_MONO}' font-size="9.5" letter-spacing="0.6" fill="${t.muted}">SET IN</text>
  <text x="72" y="20.5" font-family='${FONT_SERIF}' font-size="13" font-weight="700" fill="${t.ink}">GitSkins</text>
  <text x="${w - 12}" y="20" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.accent}">MONOGRAPH ↗</text>
</svg>`;
  }

  if (themeId === "crt-terminal") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Styled with GitSkins">
  <title>Styled with GitSkins</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <rect x="1" y="1" width="54" height="${h - 2}" fill="${t.accent}"/>
  <text x="28" y="20" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.accentFg}">SKIN</text>
  <text x="66" y="20" font-family='${FONT_MONO}' font-size="10.5" font-weight="700" fill="${t.ink}">GitSkins</text>
  <text x="${w - 10}" y="20" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">[SVG] ↗</text>
</svg>`;
  }

  // swiss-bauhaus-pixel
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Styled with GitSkins">
  <title>Styled with GitSkins</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <rect x="8" y="8" width="16" height="16" fill="${t.ink}"/>
  <rect x="10" y="10" width="6" height="6" fill="${t.accent}" shape-rendering="crispEdges"/>
  <rect x="16" y="16" width="6" height="6" fill="${t.secondary}" shape-rendering="crispEdges"/>
  <text x="32" y="19.5" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">STYLED WITH</text>
  <text x="114" y="20" font-family='${FONT_SANS}' font-size="12" font-weight="800" fill="${t.ink}">GitSkins</text>
  <text x="${w - 10}" y="19.5" text-anchor="end" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.accent}">↗</text>
</svg>`;
}

/**
 * R01: Project Hero Banner (846x248)
 */
export function renderRepoHeroSvg(
  repo: RepoSkinData,
  themeId: string,
  mode: PreviewMode,
  t: ThemeTokens,
  animated: boolean
): string {
  const w = 846;
  const h = 248;
  const uid = `rh-${themeId}-${mode}`;
  const slug = `${repo.owner}/${repo.name}`;
  const siteShort = repo.homepage ? stripProtocol(repo.homepage) : `github.com/${slug}`;
  const topics = repo.topics.slice(0, 4);

  if (themeId === "blueprint-cad") {
    const safeName = escapeXml(fitText(repo.name.toUpperCase(), 490, 34, false));
    const tagLines = wrapText(repo.tagline, 496, 12.5, 2, false);
    const cross = (cx: number, cy: number) =>
      `<g stroke="${t.border}" stroke-width="0.9" fill="none"><circle cx="${cx}" cy="${cy}" r="3.5"/><line x1="${cx - 6}" y1="${cy}" x2="${cx + 6}" y2="${cy}"/><line x1="${cx}" y1="${cy - 6}" x2="${cx}" y2="${cy + 6}"/></g>`;
    const style = animated
      ? `<style>
    @keyframes spin_${uid} { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .ring-${uid} { transform-origin: 716px 112px; animation: spin_${uid} 18s linear infinite; }
    @media (prefers-reduced-motion: reduce) { .ring-${uid} { animation: none !important; } }
  </style>`
      : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(slug)} — Architectural Blueprint Repository Banner">
  <title>${escapeXml(slug)} — Blueprint Repo Hero</title>
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
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="none" stroke="${t.border}" stroke-width="1.3"/>
  <rect x="8.5" y="8.5" width="${w - 17}" height="${h - 17}" fill="none" stroke="${t.border}" stroke-opacity="0.45" stroke-width="0.9"/>
  ${cross(16, 16)}${cross(w - 16, 16)}${cross(16, h - 16)}${cross(w - 16, h - 16)}
  <line x1="8.5" y1="34.5" x2="${w - 8.5}" y2="34.5" stroke="${t.border}" stroke-opacity="0.6" stroke-width="0.9"/>
  <text x="28" y="24.5" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="0.8" fill="${t.muted}">REPO SPEC // ${escapeXml(fitText(slug.toUpperCase(), 260, 9.5, true))}  ·  ${escapeXml(repo.version.toUpperCase())}</text>
  <text x="${w - 28}" y="24.5" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.ink}">${escapeXml(fitText(siteShort, 190, 9.5, true))}</text>

  <text x="30" y="60" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="1.2" fill="${t.accent}">ASSEMBLY 01 // OPEN-SOURCE REPOSITORY</text>
  <text x="32" y="106" font-family='${FONT_SANS}' font-size="34" font-weight="800" fill="${t.accent}" fill-opacity="0.26">${safeName}</text>
  <text x="30" y="104" font-family='${FONT_SANS}' font-size="34" font-weight="800" fill="${t.ink}">${safeName}</text>
  ${tagLines
    .map(
      (line, i) =>
        `<text x="30" y="${130 + i * 19}" font-family='${FONT_SANS}' font-size="12.5" font-weight="600" fill="${t.sub}">${escapeXml(line)}</text>`
    )
    .join("\n  ")}

  <!-- Right CAD Isometric Module -->
  <circle cx="716" cy="112" r="52" fill="none" stroke="${t.borderSoft}" stroke-dasharray="3 3" stroke-width="1"/>
  <g class="ring-${uid}">
    <path d="M 716 60 A 52 52 0 0 1 763 90" fill="none" stroke="${t.accent}" stroke-width="2.2"/>
    <circle cx="763" cy="90" r="3" fill="${t.accent}"/>
  </g>
  <polygon points="716,84 742,99 742,127 716,142 690,127 690,99" fill="${t.patternBg}" fill-opacity="0.72" stroke="${t.accent}" stroke-width="1.3"/>
  <line x1="716" y1="84" x2="716" y2="113" stroke="${t.accent}" stroke-width="1.1"/>
  <line x1="742" y1="99" x2="716" y2="113" stroke="${t.accent}" stroke-width="1.1"/>
  <line x1="690" y1="99" x2="716" y2="113" stroke="${t.accent}" stroke-width="1.1"/>
  <line x1="716" y1="113" x2="716" y2="142" stroke="${t.border}" stroke-dasharray="2 2" stroke-width="1"/>

  <!-- Bottom 4-cell CAD Title Block -->
  <line x1="8.5" y1="184.5" x2="${w - 8.5}" y2="184.5" stroke="${t.border}" stroke-width="1.1"/>
  <line x1="216.5" y1="184.5" x2="216.5" y2="${h - 8.5}" stroke="${t.border}" stroke-opacity="0.6" stroke-width="0.9"/>
  <line x1="423.5" y1="184.5" x2="423.5" y2="${h - 8.5}" stroke="${t.border}" stroke-opacity="0.6" stroke-width="0.9"/>
  <line x1="630.5" y1="184.5" x2="630.5" y2="${h - 8.5}" stroke="${t.border}" stroke-opacity="0.6" stroke-width="0.9"/>
  <text x="26" y="203" font-family='${FONT_MONO}' font-size="8.5" fill="${t.muted}">PRIMARY LANGUAGE</text>
  <text x="26" y="224" font-family='${FONT_MONO}' font-size="13.5" font-weight="700" fill="${t.ink}">${escapeXml(fitText(repo.language, 174, 13.5, true))}</text>
  <text x="234" y="203" font-family='${FONT_MONO}' font-size="8.5" fill="${t.muted}">STARS &amp; FORKS</text>
  <text x="234" y="224" font-family='${FONT_MONO}' font-size="13.5" font-weight="700" fill="${t.accent}">★ ${fmtNum(repo.stars)} <tspan fill="${t.muted}" font-size="11">· ${fmtNum(repo.forks)} forks</tspan></text>
  <text x="441" y="203" font-family='${FONT_MONO}' font-size="8.5" fill="${t.muted}">RELEASE / LICENSE</text>
  <text x="441" y="224" font-family='${FONT_MONO}' font-size="13.5" font-weight="700" fill="${t.tertiary}">${escapeXml(fitText(`${repo.version} · ${repo.license}`, 176, 13.5, true))}</text>
  <text x="648" y="203" font-family='${FONT_MONO}' font-size="8.5" fill="${t.muted}">TAGS</text>
  <text x="648" y="224" font-family='${FONT_MONO}' font-size="11.5" font-weight="700" fill="${t.ink}">${escapeXml(fitText(topics.join(" · "), 176, 11.5, true))}</text>
</svg>`;
  }

  if (themeId === "editorial-zine") {
    const safeName = escapeXml(fitText(repo.name, 480, 42, false));
    const tagLines = wrapText(repo.tagline, 494, 14.5, 2, false);
    const ledger: [string, string][] = [
      ["REPOSITORY", fitText(slug, 150, 11.5)],
      ["LANGUAGE", fitText(repo.language, 145, 11.5)],
      ["STARS", `★ ${fmtNum(repo.stars)}`],
      ["FORKS", fmtNum(repo.forks)],
      ["LICENSE", `${repo.license} · ${repo.version}`],
    ];
    const ledgerSvg = ledger
      .map(([k, v], idx) => {
        const y = 84 + idx * 29;
        const rule =
          idx > 0
            ? `<line x1="572" y1="${y - 18}" x2="818" y2="${y - 18}" stroke="${t.borderSoft}" stroke-width="0.9"/>`
            : "";
        return `${rule}
  <text x="572" y="${y}" font-family='${FONT_MONO}' font-size="9" letter-spacing="0.6" fill="${t.muted}">${k}</text>
  <text x="818" y="${y}" text-anchor="end" font-family='${FONT_SERIF}' font-size="12.5" font-weight="700" fill="${t.ink}">${escapeXml(v)}</text>`;
      })
      .join("\n");

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(slug)} — Editorial Broadsheet Repository Banner">
  <title>${escapeXml(slug)} — Editorial Repo Hero</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="24" y="14" width="798" height="2.4" fill="${t.border}"/>
  <line x1="24" y1="20.5" x2="822" y2="20.5" stroke="${t.border}" stroke-width="0.8"/>
  <text x="24" y="37" font-family='${FONT_MONO}' font-size="9.5" letter-spacing="1.2" fill="${t.muted}">REPOSITORY MONOGRAPH · ${escapeXml(fitText(repo.owner.toUpperCase(), 130, 9.5, true))}</text>
  <text x="822" y="37" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" letter-spacing="1.2" fill="${t.muted}">${escapeXml(repo.version.toUpperCase())} · ${escapeXml(repo.license)}</text>
  <line x1="24" y1="45.5" x2="822" y2="45.5" stroke="${t.border}" stroke-width="1"/>
  <line x1="548.5" y1="56" x2="548.5" y2="226" stroke="${t.borderSoft}" stroke-width="1"/>

  <rect x="26" y="64" width="6" height="6" fill="${t.accent}"/>
  <text x="40" y="71" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="1.1" fill="${t.accent}">${escapeXml(fitText(topics.join(" · ").toUpperCase(), 480, 9.5, true))}</text>
  <text x="26" y="122" font-family='${FONT_SERIF}' font-size="42" font-weight="700" fill="${t.ink}">${safeName}<tspan fill="${t.accent}">.</tspan></text>
  ${tagLines
    .map(
      (line, i) =>
        `<text x="26" y="${156 + i * 23}" font-family='${FONT_SERIF}' font-size="15" font-style="italic" fill="${t.sub}">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  <line x1="26" y1="208" x2="522" y2="208" stroke="${t.borderSoft}" stroke-width="0.9"/>
  <text x="26" y="226" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">SOURCE · ${escapeXml(fitText(siteShort, 460, 9.5, true))}</text>
  ${ledgerSvg}
  <line x1="24" y1="236" x2="822" y2="236" stroke="${t.border}" stroke-width="0.9"/>
</svg>`;
  }

  if (themeId === "crt-terminal") {
    const rows: [string, string][] = [
      ["repo", slug],
      ["desc", repo.tagline],
      ["lang", `${repo.language} · ${topics.slice(0, 3).join(", ")}`],
      ["stats", `★ ${fmtNum(repo.stars)} stars · ${fmtNum(repo.forks)} forks`],
      ["release", `${repo.version} · ${repo.license} license`],
    ];
    const tableSvg = rows
      .map(([k, v], i) => {
        const y = 84 + i * 24;
        return `<text x="282" y="${y}" font-family='${FONT_MONO}' font-size="11" font-weight="700" fill="${t.accent}">${k.padEnd(7, " ")}</text>
  <text x="342" y="${y}" font-family='${FONT_MONO}' font-size="11" fill="${t.muted}">:</text>
  <text x="356" y="${y}" font-family='${FONT_MONO}' font-size="11" fill="${t.ink}">${escapeXml(fitText(v, 452, 11, true))}</text>`;
      })
      .join("\n  ");
    const monoLetters = (repo.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3) || "OSS").toUpperCase();
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(slug)} — Retro CRT Repository Banner">
  <title>${escapeXml(slug)} — CRT Repo Hero</title>
  <defs>
    <pattern id="scan-${uid}" width="4" height="4" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="4" y2="0" stroke="${mode === "dark" ? "#FFFFFF" : "#000000"}" stroke-opacity="${mode === "dark" ? "0.045" : "0.02"}" stroke-width="1"/>
    </pattern>
  </defs>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <rect x="1" y="1" width="${w - 2}" height="26" fill="${t.patternBg}"/>
  <line x1="1" y1="27.5" x2="${w - 1}" y2="27.5" stroke="${t.border}" stroke-width="1"/>
  <circle cx="16" cy="14" r="3.8" fill="#F87171"/>
  <circle cx="29" cy="14" r="3.8" fill="${t.highlight}"/>
  <circle cx="42" cy="14" r="3.8" fill="${t.accent}"/>
  <text x="423" y="18" text-anchor="middle" font-family='${FONT_MONO}' font-size="10.5" fill="${t.sub}">${escapeXml(slug)} — README.md</text>
  <text x="830" y="18" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${escapeXml(repo.version)}</text>

  <rect x="14" y="38" width="236" height="174" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <text x="26" y="56" font-family='${FONT_MONO}' font-size="9" fill="${t.muted}">[pane 0: package]</text>
  <rect x="30" y="68" width="204" height="94" fill="${t.bg}" stroke="${t.accent}" stroke-width="1.2"/>
  <text x="132" y="128" text-anchor="middle" font-family='${FONT_MONO}' font-size="40" font-weight="700" letter-spacing="3" fill="${t.accent}">${escapeXml(monoLetters)}</text>
  <text x="26" y="184" font-family='${FONT_MONO}' font-size="10" fill="${t.accent}">$ git status</text>
  <text x="26" y="201" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.ink}">${escapeXml(fitText(siteShort, 212, 10, true))}</text>

  <rect x="264" y="38" width="568" height="174" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <text x="282" y="56" font-family='${FONT_MONO}' font-size="9" fill="${t.muted}">[pane 1: repo-fetch --info]</text>
  <text x="282" y="68" font-family='${FONT_MONO}' font-size="10.5" font-weight="700" fill="${t.secondary}">${escapeXml(repo.name)} @ ${escapeXml(repo.owner)}</text>
  ${tableSvg}

  <rect x="1" y="223" width="${w - 2}" height="24" fill="${t.patternBg}"/>
  <line x1="1" y1="222.5" x2="${w - 1}" y2="222.5" stroke="${t.border}" stroke-width="1"/>
  <rect x="10" y="227" width="60" height="16" fill="${t.accent}"/>
  <text x="40" y="238.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.accentFg}">REPO</text>
  <text x="82" y="238.5" font-family='${FONT_MONO}' font-size="10" fill="${t.ink}">0:overview*  1:install  2:features  3:arch</text>
  <text x="832" y="238.5" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${escapeXml(repo.license)} | READY</text>
  <rect x="1" y="28" width="${w - 2}" height="194" fill="url(#scan-${uid})" pointer-events="none"/>
</svg>`;
  }

  // swiss-bauhaus-pixel
  const safeTitle = escapeXml(fitText(repo.name.toUpperCase(), 540, 42, false));
  const tagLines = wrapText(repo.tagline, 540, 13.5, 2, false);
  const pillsSvg = (() => {
    let px = 26;
    return topics
      .map((tp, idx) => {
        const label = `#${fitText(tp, 110, 10, true)}`;
        const pw = Math.round(estimateTextPx(label, 10, true) + 18);
        if (px + pw > 568) return "";
        const x = px;
        px += pw + 8;
        const dot = [t.accent, t.secondary, t.tertiary, t.highlight][idx % 4];
        return `<rect x="${x}" y="158" width="${pw}" height="20" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="${x + 6}" y="165" width="5" height="5" fill="${dot}" shape-rendering="crispEdges"/>
  <text x="${x + 15}" y="171.5" font-family='${FONT_MONO}' font-size="9.8" font-weight="700" fill="${t.ink}">${escapeXml(label)}</text>`;
      })
      .join("\n  ");
  })();

  const metrics: [string, string, string][] = [
    [t.accent, fmtNum(repo.stars), "GitHub Stars"],
    [t.secondary, fmtNum(repo.forks), "Forks"],
    [t.tertiary, fitText(repo.language, 95, 13, true), "Language"],
    [t.highlight, fitText(`${repo.license} · ${repo.version}`, 110, 12.5, true), "License / Ref"],
  ];
  const colStarts = [0, 212, 423, 634];
  const metricsSvg = metrics
    .map(([dot, val, label], idx) => {
      const cx = colStarts[idx];
      const div =
        idx > 0
          ? `<line x1="${cx + 0.5}" y1="194.5" x2="${cx + 0.5}" y2="${h - 0.5}" stroke="${t.border}" stroke-width="1"/>`
          : "";
      return `${div}
  <rect x="${cx + 16}" y="205" width="6" height="6" fill="${dot}" shape-rendering="crispEdges"/>
  <text x="${cx + 28}" y="211.5" font-family='${FONT_MONO}' font-size="9" font-weight="700" fill="${t.muted}">${escapeXml(label.toUpperCase())}</text>
  <text x="${cx + 16}" y="234" font-family='${FONT_MONO}' font-size="14.5" font-weight="800" fill="${t.ink}">${escapeXml(val)}</text>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(slug)} — Swiss-Bauhaus Repository Banner">
  <title>${escapeXml(slug)} — Swiss-Bauhaus Repo Hero</title>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}"/>
  ${bauhausWeave(596, 35, 249, 159, t.patternBg, t.patternFg, 6)}
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="none" stroke="${t.border}" stroke-width="1"/>
  <line x1="0.5" y1="34.5" x2="${w - 0.5}" y2="34.5" stroke="${t.border}" stroke-width="1"/>
  <line x1="595.5" y1="34.5" x2="595.5" y2="194.5" stroke="${t.border}" stroke-width="1"/>
  <line x1="0.5" y1="194.5" x2="${w - 0.5}" y2="194.5" stroke="${t.border}" stroke-width="1"/>

  <rect x="16" y="12" width="10" height="10" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="34" y="21" font-family='${FONT_MONO}' font-size="11" font-weight="700" fill="${t.ink}">${escapeXml(fitText(slug, 280, 11, true))}</text>
  <text x="330" y="21" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">(${escapeXml(repo.version)})</text>
  <rect x="666" y="7" width="164" height="20" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <text x="748" y="20.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="600" fill="${t.ink}">${escapeXml(fitText(siteShort, 150, 9.5, true))}</text>

  <text x="26" y="60" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.accent}">(repository) · OPEN SOURCE</text>
  <text x="24" y="106" font-family='${FONT_SANS}' font-size="42" font-weight="800" letter-spacing="-0.03em" fill="${t.ink}">${safeTitle}</text>
  ${tagLines
    .map(
      (line, i) =>
        `<text x="26" y="${130 + i * 18}" font-family='${FONT_SANS}' font-size="13" font-weight="500" fill="${t.sub}">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  ${pillsSvg}

  <!-- Right Bauhaus Geometric Module Emblem -->
  <rect x="656" y="54" width="128" height="122" fill="${t.border}"/>
  <rect x="651.5" y="49.5" width="128" height="122" fill="${t.surface}" stroke="${t.border}" stroke-width="1.2"/>
  <rect x="665" y="63" width="46" height="36" fill="${t.accent}" shape-rendering="crispEdges"/>
  <rect x="719" y="63" width="46" height="36" fill="${t.ink}" shape-rendering="crispEdges"/>
  <rect x="665" y="107" width="32" height="46" fill="${t.ink}" shape-rendering="crispEdges"/>
  <rect x="705" y="107" width="60" height="46" fill="${t.secondary}" shape-rendering="crispEdges"/>
  <rect x="727" y="121" width="16" height="16" fill="${t.bg}" shape-rendering="crispEdges"/>

  ${metricsSvg}
</svg>`;
}

/**
 * R02: Quick Install Command Strip (846x72)
 */
export function renderRepoInstallSvg(
  repo: RepoSkinData,
  themeId: string,
  mode: PreviewMode,
  t: ThemeTokens,
  animated: boolean
): string {
  const w = 846;
  const h = 72;
  const uid = `ri-${themeId}-${mode}`;
  const label = escapeXml(fitText(repo.installLabel || "INSTALL", 130, 10, true));
  const hint = escapeXml(fitText(repo.installHint || "READY", 170, 9.5, true));
  const cmdStr = `$ ${fitText(repo.installCommand, 520, 13, true)}`;
  const safeCmd = escapeXml(cmdStr);
  const style = animated
    ? `<style>
    @keyframes cur_${uid} { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.12; } }
    .cur-${uid} { animation: cur_${uid} 1.4s steps(1, end) infinite; }
    @media (prefers-reduced-motion: reduce) { .cur-${uid} { animation: none !important; } }
  </style>`
    : "";

  if (themeId === "blueprint-cad") {
    const curX = Math.min(646, 156 + Math.round(estimateTextPx(cmdStr, 13, true) + 6));
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Quick Install: ${escapeXml(repo.installCommand)}">
  <title>Quick Install Command</title>
  ${style}
  <polygon points="${chamferPolygon(0.5, 0.5, w - 1, h - 1, 8)}" fill="${t.bg}" stroke="${t.border}" stroke-width="1.1"/>
  <polygon points="${chamferPolygon(14, 20, 124, 32, 5)}" fill="${t.accent}"/>
  <text x="76" y="40" text-anchor="middle" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.accentFg}">${label}</text>
  <text x="156" y="41" font-family='${FONT_MONO}' font-size="13" font-weight="700" fill="${t.ink}">${safeCmd}</text>
  <rect class="cur-${uid}" x="${curX}" y="29" width="7" height="14" fill="${t.accent}"/>
  <line x1="664" y1="14" x2="664" y2="58" stroke="${t.borderSoft}" stroke-dasharray="3 3" stroke-width="1"/>
  <text x="828" y="40" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.muted}">${hint}</text>
</svg>`;
  }

  if (themeId === "editorial-zine") {
    const curX = Math.min(646, 154 + Math.round(estimateTextPx(cmdStr, 13, true) + 6));
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Quick Install: ${escapeXml(repo.installCommand)}">
  <title>Quick Install Command</title>
  ${style}
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="1" y="1" width="${w - 2}" height="3" fill="${t.border}"/>
  <text x="20" y="30" font-family='${FONT_MONO}' font-size="9" font-weight="700" letter-spacing="1.2" fill="${t.accent}">${label}</text>
  <text x="20" y="52" font-family='${FONT_SERIF}' font-size="14" font-style="italic" fill="${t.sub}">Command</text>
  <line x1="138" y1="16" x2="138" y2="58" stroke="${t.borderSoft}" stroke-width="1"/>
  <text x="154" y="42" font-family='${FONT_MONO}' font-size="13" font-weight="700" fill="${t.ink}">${safeCmd}</text>
  <rect class="cur-${uid}" x="${curX}" y="30" width="7" height="14" fill="${t.accent}"/>
  <text x="826" y="41" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${hint}</text>
</svg>`;
  }

  if (themeId === "crt-terminal") {
    const curX = Math.min(650, 146 + Math.round(estimateTextPx(cmdStr, 13, true) + 6));
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Quick Install: ${escapeXml(repo.installCommand)}">
  <title>Quick Install Command</title>
  ${style}
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <rect x="1" y="1" width="128" height="${h - 2}" fill="${t.patternBg}"/>
  <line x1="129.5" y1="1" x2="129.5" y2="${h - 1}" stroke="${t.border}" stroke-width="1"/>
  <circle cx="18" cy="36" r="3.5" fill="${t.accent}"/>
  <text x="30" y="40" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.accent}">${label}</text>
  <text x="146" y="41" font-family='${FONT_MONO}' font-size="13" font-weight="700" fill="${t.ink}">${safeCmd}</text>
  <rect class="cur-${uid}" x="${curX}" y="29" width="7" height="14" fill="${t.accent}"/>
  <text x="830" y="40" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">[${hint}]</text>
</svg>`;
  }

  // swiss-bauhaus-pixel
  const curX = Math.min(650, 162 + Math.round(estimateTextPx(cmdStr, 13, true) + 6));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Quick Install: ${escapeXml(repo.installCommand)}">
  <title>Quick Install Command</title>
  ${style}
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <rect x="1" y="1" width="144" height="${h - 2}" fill="${t.ink}"/>
  <rect x="14" y="31" width="8" height="8" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="30" y="39.5" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.bg}">${label}</text>
  <text x="162" y="41" font-family='${FONT_MONO}' font-size="13" font-weight="700" fill="${t.ink}">${safeCmd}</text>
  <rect class="cur-${uid}" x="${curX}" y="29" width="7" height="14" fill="${t.accent}"/>
  <line x1="664" y1="14" x2="664" y2="58" stroke="${t.borderSoft}" stroke-width="1"/>
  <text x="828" y="40" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.muted}">${hint}</text>
</svg>`;
}

/**
 * Shared Section Header (846x36)
 */
function renderRepoSectionHeaderSvg(
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

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <rect x="10" y="9" width="18" height="18" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="19" y="21.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.accentFg}">${escapeXml(code)}</text>
  <text x="38" y="22.5" font-family='${FONT_SANS}' font-size="13" font-weight="800" fill="${t.ink}">${safeTitle}</text>
  <text x="${w - 14}" y="22" text-anchor="end" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">${safeRight}</text>
</svg>`;
}

/**
 * R03: Feature Card (417x152)
 */
export function renderRepoFeatureCardSvg(
  feat: RepoFeatureItem,
  idx: number,
  themeId: string,
  mode: PreviewMode,
  t: ThemeTokens
): string {
  const w = 417;
  const h = 152;
  const colors = [t.accent, t.secondary, t.tertiary, t.highlight];
  const color = colors[idx % colors.length];
  const numStr = String(idx + 1).padStart(2, "0");
  const roman = ["I", "II", "III", "IV"][idx] || numStr;
  const safeTag = escapeXml(fitText((feat.tag || "FEATURE").toUpperCase(), 110, 9.5, true));
  const safeTitle = escapeXml(fitText(feat.title, 360, 17.5, false));
  const descLines = wrapText(feat.desc, 372, 12.2, 2, false);

  if (themeId === "blueprint-cad") {
    const uid = `rf-bp-${idx}-${mode}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <defs>
    <pattern id="g-${uid}" width="12" height="12" patternUnits="userSpaceOnUse">
      <path d="M 12 0 L 0 0 0 12" fill="none" stroke="${t.borderSoft}" stroke-opacity="0.45" stroke-width="0.6"/>
    </pattern>
  </defs>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1.1"/>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="url(#g-${uid})"/>
  <polygon points="${chamferPolygon(14, 12, 74, 20, 5)}" fill="${color}"/>
  <text x="51" y="25.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.accentFg}">MOD-${numStr}</text>
  <text x="${w - 16}" y="25.5" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.muted}">${safeTag}</text>
  <text x="16" y="64" font-family='${FONT_SANS}' font-size="17.5" font-weight="800" fill="${t.ink}">${safeTitle}</text>
  ${descLines
    .map(
      (line, i) =>
        `<text x="16" y="${92 + i * 20}" font-family='${FONT_SANS}' font-size="12.2" fill="${t.sub}">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  <line x1="14" y1="134" x2="${w - 14}" y2="134" stroke="${t.borderSoft}" stroke-dasharray="3 3" stroke-width="0.9"/>
</svg>`;
  }

  if (themeId === "editorial-zine") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="1" y="1" width="${w - 2}" height="3" fill="${color}"/>
  <text x="18" y="26" font-family='${FONT_MONO}' font-size="9.2" font-weight="700" letter-spacing="1.2" fill="${color}">SECTION ${roman}</text>
  <text x="${w - 18}" y="26" text-anchor="end" font-family='${FONT_MONO}' font-size="9.2" fill="${t.muted}">${safeTag}</text>
  <text x="18" y="62" font-family='${FONT_SERIF}' font-size="20" font-weight="700" fill="${t.ink}">${safeTitle}</text>
  ${descLines
    .map(
      (line, i) =>
        `<text x="18" y="${92 + i * 20}" font-family='${FONT_SANS}' font-size="12.2" fill="${t.sub}">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
</svg>`;
  }

  if (themeId === "crt-terminal") {
    const monoDesc = wrapText(feat.desc, 374, 11.2, 2, true);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <rect x="1" y="1" width="${w - 2}" height="24" fill="${t.patternBg}"/>
  <line x1="1" y1="25.5" x2="${w - 1}" y2="25.5" stroke="${t.border}" stroke-width="1"/>
  <circle cx="14" cy="13" r="3" fill="${color}"/>
  <text x="24" y="16.5" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.ink}">[0${idx + 1}] ${safeTag}</text>
  <text x="${w - 14}" y="16.5" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">OK</text>
  <text x="16" y="56" font-family='${FONT_MONO}' font-size="14" font-weight="700" fill="${color}">&gt; ${escapeXml(fitText(feat.title, 355, 14, true))}</text>
  ${monoDesc
    .map(
      (line, i) =>
        `<text x="16" y="${86 + i * 20}" font-family='${FONT_MONO}' font-size="11.2" fill="${t.sub}">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
</svg>`;
  }

  // swiss-bauhaus-pixel
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <rect x="1" y="1" width="${w - 2}" height="32" fill="${t.patternBg}"/>
  <line x1="0.5" y1="33.5" x2="${w - 0.5}" y2="33.5" stroke="${t.border}" stroke-width="1"/>
  <rect x="12" y="8" width="22" height="17" fill="${t.ink}"/>
  <text x="23" y="20" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.bg}">${numStr}</text>
  <rect x="42" y="13" width="6" height="6" fill="${color}" shape-rendering="crispEdges"/>
  <text x="54" y="20" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.ink}">${safeTag}</text>
  <text x="16" y="68" font-family='${FONT_SANS}' font-size="17.5" font-weight="800" fill="${t.ink}">${safeTitle}</text>
  ${descLines
    .map(
      (line, i) =>
        `<text x="16" y="${96 + i * 20}" font-family='${FONT_SANS}' font-size="12.2" fill="${t.sub}">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
</svg>`;
}

/**
 * R04: Architecture Flow Diagram Card (846x168)
 */
export function parseArchStages(spec: string): { title: string; sub: string }[] {
  const raw = spec
    .split(/->|→/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
  if (raw.length < 2) {
    return [
      { title: "Input", sub: "Source / CLI" },
      { title: "Core Engine", sub: "Deterministic Build" },
      { title: "Output", sub: "Static Artifacts" },
    ];
  }
  return raw.map((part, idx) => {
    const [titlePart, subPart] = part.split("|").map((x) => x.trim());
    return {
      title: titlePart || `Stage ${idx + 1}`,
      sub: subPart || `Step 0${idx + 1}`,
    };
  });
}

export function renderRepoArchSvg(
  archSpec: string,
  themeId: string,
  mode: PreviewMode,
  t: ThemeTokens,
  animated: boolean
): string {
  const w = 846;
  const h = 168;
  const uid = `ra-${themeId}-${mode}`;
  const stages = parseArchStages(archSpec);
  const n = stages.length;
  const padX = 24;
  const gap = 36;
  const boxW = Math.floor((w - padX * 2 - gap * (n - 1)) / n);
  const boxH = 86;
  const boxY = 54;
  const colors = [t.accent, t.secondary, t.tertiary, t.highlight];

  const style = animated
    ? `<style>
    @keyframes flow_${uid} { 0% { opacity: 0.25; transform: translateX(-6px); } 50% { opacity: 1; transform: translateX(0px); } 100% { opacity: 0.25; transform: translateX(6px); } }
    .pulse-${uid} { animation: flow_${uid} 2.2s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) { .pulse-${uid} { animation: none !important; } }
  </style>`
    : "";

  const nodesSvg = stages
    .map((st, idx) => {
      const bx = padX + idx * (boxW + gap);
      const col = colors[idx % colors.length];
      const safeTitle = escapeXml(fitText(st.title, boxW - 24, 13.5, themeId === "crt-terminal"));
      const safeSub = escapeXml(fitText(st.sub, boxW - 24, 10.5, true));
      const num = `0${idx + 1}`;
      const arrowX1 = bx + boxW + 4;
      const arrowX2 = bx + boxW + gap - 6;
      const arrowY = boxY + boxH / 2;
      const connector =
        idx < n - 1
          ? `<line x1="${arrowX1}" y1="${arrowY}" x2="${arrowX2}" y2="${arrowY}" stroke="${t.border}" stroke-width="1.4"/>
  <polygon points="${arrowX2 - 5},${arrowY - 4} ${arrowX2 + 2},${arrowY} ${arrowX2 - 5},${arrowY + 4}" fill="${col}"/>
  <circle class="pulse-${uid}" cx="${Math.round((arrowX1 + arrowX2) / 2)}" cy="${arrowY}" r="3" fill="${col}"/>`
          : "";

      if (themeId === "blueprint-cad") {
        return `<polygon points="${chamferPolygon(bx, boxY, boxW, boxH, 7)}" fill="${t.surface}" stroke="${t.border}" stroke-width="1.1"/>
  <rect x="${bx + 10}" y="${boxY + 10}" width="26" height="14" fill="${col}"/>
  <text x="${bx + 23}" y="${boxY + 20.5}" text-anchor="middle" font-family='${FONT_MONO}' font-size="8.5" font-weight="700" fill="${t.accentFg}">${num}</text>
  <text x="${bx + 12}" y="${boxY + 48}" font-family='${FONT_SANS}' font-size="13.5" font-weight="800" fill="${t.ink}">${safeTitle}</text>
  <text x="${bx + 12}" y="${boxY + 68}" font-family='${FONT_MONO}' font-size="10.2" fill="${t.muted}">${safeSub}</text>
  ${connector}`;
      }

      if (themeId === "editorial-zine") {
        return `<rect x="${bx}" y="${boxY}" width="${boxW}" height="${boxH}" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="${bx}" y="${boxY}" width="${boxW}" height="3" fill="${col}"/>
  <text x="${bx + 12}" y="${boxY + 22}" font-family='${FONT_MONO}' font-size="9" font-weight="700" fill="${col}">STAGE ${num}</text>
  <text x="${bx + 12}" y="${boxY + 48}" font-family='${FONT_SERIF}' font-size="15.5" font-weight="700" fill="${t.ink}">${safeTitle}</text>
  <text x="${bx + 12}" y="${boxY + 69}" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">${safeSub}</text>
  ${connector}`;
      }

      if (themeId === "crt-terminal") {
        return `<rect x="${bx}" y="${boxY}" width="${boxW}" height="${boxH}" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <rect x="${bx + 1}" y="${boxY + 1}" width="${boxW - 2}" height="20" fill="${t.patternBg}"/>
  <text x="${bx + 10}" y="${boxY + 14.5}" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${col}">[${num}] NODE</text>
  <text x="${bx + 10}" y="${boxY + 46}" font-family='${FONT_MONO}' font-size="12.5" font-weight="700" fill="${t.ink}">${safeTitle}</text>
  <text x="${bx + 10}" y="${boxY + 67}" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">${safeSub}</text>
  ${connector}`;
      }

      // swiss-bauhaus-pixel
      return `<rect x="${bx + 3}" y="${boxY + 3}" width="${boxW}" height="${boxH}" fill="${t.border}" fill-opacity="0.16"/>
  <rect x="${bx}" y="${boxY}" width="${boxW}" height="${boxH}" fill="${t.surface}" stroke="${t.border}" stroke-width="1.1"/>
  <rect x="${bx}" y="${boxY}" width="24" height="20" fill="${t.ink}"/>
  <text x="${bx + 12}" y="${boxY + 13.5}" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.bg}">${num}</text>
  <rect x="${bx + 32}" y="${boxY + 7}" width="6" height="6" fill="${col}" shape-rendering="crispEdges"/>
  <text x="${bx + 12}" y="${boxY + 48}" font-family='${FONT_SANS}' font-size="13.5" font-weight="800" fill="${t.ink}">${safeTitle}</text>
  <text x="${bx + 12}" y="${boxY + 68}" font-family='${FONT_MONO}' font-size="10.2" fill="${t.muted}">${safeSub}</text>
  ${connector}`;
    })
    .join("\n  ");

  const headerLabel =
    themeId === "blueprint-cad"
      ? "SCHEMATIC // ARCHITECTURE PIPELINE"
      : themeId === "editorial-zine"
        ? "FIG. 01 — SYSTEM ARCHITECTURE"
        : themeId === "crt-terminal"
          ? "$ pipeline --graph"
          : "(architecture) · PIPELINE FLOW";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Architecture Flow Diagram">
  <title>Architecture Pipeline</title>
  ${style}
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <rect x="1" y="1" width="${w - 2}" height="32" fill="${t.patternBg}"/>
  <line x1="0.5" y1="33.5" x2="${w - 0.5}" y2="33.5" stroke="${t.border}" stroke-width="1"/>
  <rect x="14" y="13" width="6" height="6" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="28" y="20.5" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.ink}">${escapeXml(headerLabel)}</text>
  <text x="${w - 16}" y="20.5" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${n} STAGES · STATIC SVG</text>
  ${nodesSvg}
</svg>`;
}

export function renderRepoSkinSuite(
  repo: RepoSkinData,
  theme: SkinTheme,
  mode: PreviewMode,
  options: RepoSkinOptions
): RenderedRepoSuite {
  const t = resolveTokens(theme.tokens[mode], options.accentOverride);
  const activeFeatures = repo.features.slice(0, options.featureCount);

  return {
    hero: renderRepoHeroSvg(repo, theme.id, mode, t, options.animated),
    install: renderRepoInstallSvg(repo, theme.id, mode, t, options.animated),
    secFeatures: renderRepoSectionHeaderSvg(
      theme.id === "blueprint-cad" ? "SEC. A-A" : "01",
      "KEY CAPABILITIES",
      `${String(activeFeatures.length).padStart(2, "0")} MODULES`,
      theme.id,
      t
    ),
    features: activeFeatures.map((f, idx) =>
      renderRepoFeatureCardSvg(f, idx, theme.id, mode, t)
    ),
    secArch: renderRepoSectionHeaderSvg(
      theme.id === "blueprint-cad" ? "SEC. B-B" : "02",
      "SYSTEM ARCHITECTURE",
      "DATA FLOW",
      theme.id,
      t
    ),
    arch: renderRepoArchSvg(repo.architecture, theme.id, mode, t, options.animated),
    badge: renderGitSkinsBadgeSvg(theme.id, mode, theme.tokens[mode], options.accentOverride),
  };
}

export function buildRepoSkinPrompt(
  repo: RepoSkinData,
  theme: SkinTheme,
  options: RepoSkinOptions,
  lang: Lang
): string {
  const accentNote = options.accentOverride || "theme default";
  const featList = repo.features
    .slice(0, options.featureCount)
    .map((f, i) => `  ${i + 1}. [${f.tag}] ${f.title} — ${f.desc}`)
    .join("\n");

  if (lang === "zh") {
    return [
      `请使用 GitSkins 的「${theme.nameZh}（${theme.id}）」视觉体系，为当前开源项目仓库生成一套 846px Light / Dark 双主题 Repo README 皮肤。`,
      `- 参考主题规范：${theme.links.spec}`,
      `- 仓库信息：先读取本地 package.json / Cargo.toml / pyproject.toml 与目录结构（演示基准：${repo.owner}/${repo.name} · ${repo.version} · ${repo.license}），不要编造未实现的功能。`,
      `- 生成资产到 assets/ 并严格 XML 校验（零 <script>、内置 prefers-reduced-motion）：`,
      `  1. assets/repo-hero-{light,dark}.svg（846×248 项目海报，展示仓库名、简介、标签与语言/协议）`,
      `  2. assets/repo-install-{light,dark}.svg（846×72 快速安装条，命令：${repo.installCommand}）`,
      `  3. assets/repo-feat-01..0${options.featureCount}-{light,dark}.svg（417×152 双列特性卡，width="49%"）：\n${featList}`,
      ...(options.showArch
        ? [
            `  4. assets/repo-arch-{light,dark}.svg（846×168 架构流程卡：${repo.architecture}）`,
          ]
        : []),
      ...(options.showBadge
        ? [`  5. assets/gitskins-badge-{light,dark}.svg（216×32 Styled with GitSkins 尾标）`]
        : []),
      `- 参数：主强调色=${accentNote}，动效=${options.animated ? "克制 CSS 动效" : "纯静态 SVG"}。`,
      `- 最后更新根目录 README.md，使用 <picture> 挂载全部双主题 SVG，并运行校验脚本确认 0 XML 报错。`,
    ].join("\n");
  }

  return [
    `Re-skin this open-source repository's README.md using GitSkins "${theme.name}" (${theme.id}) — 846px Light & Dark static SVG suite.`,
    `- Visual spec reference: ${theme.links.spec}`,
    `- Repo truth check: inspect local manifest files (package.json / Cargo.toml / pyproject.toml / git remote) instead of inventing facts. Baseline config: ${repo.owner}/${repo.name} (${repo.version} · ${repo.license}).`,
    `- Generate XML-validated Light & Dark SVGs under assets/ (zero <script>, safe system fonts, prefers-reduced-motion):`,
    `  1. assets/repo-hero-{light,dark}.svg (846x248 Project Hero Banner)`,
    `  2. assets/repo-install-{light,dark}.svg (846x72 Quick Install Strip: ${repo.installCommand})`,
    `  3. assets/repo-feat-01..0${options.featureCount}-{light,dark}.svg (417x152 2-col Feature Cards, width="49%"):\n${featList}`,
    ...(options.showArch
      ? [`  4. assets/repo-arch-{light,dark}.svg (846x168 Architecture Flow: ${repo.architecture})`]
      : []),
    ...(options.showBadge
      ? [`  5. assets/gitskins-badge-{light,dark}.svg (216x32 Styled with GitSkins footer badge)`]
      : []),
    `- Overrides: accent=${accentNote}, motion=${options.animated ? "calm CSS keyframes" : "static SVG"}.`,
    `- Wire all SVGs into README.md using GitHub <picture> light/dark pairs and verify strict XML before finishing.`,
  ].join("\n");
}

export function buildRepoZipEntries(params: {
  repo: RepoSkinData;
  theme: SkinTheme;
  options: RepoSkinOptions;
  lang: Lang;
}): ZipFileEntry[] {
  const { repo, theme, options } = params;
  const light = renderRepoSkinSuite(repo, theme, "light", options);
  const dark = renderRepoSkinSuite(repo, theme, "dark", options);

  const entries: ZipFileEntry[] = [
    { path: "assets/repo-hero-light.svg", content: light.hero },
    { path: "assets/repo-hero-dark.svg", content: dark.hero },
    { path: "assets/repo-install-light.svg", content: light.install },
    { path: "assets/repo-install-dark.svg", content: dark.install },
    { path: "assets/repo-sec-feat-light.svg", content: light.secFeatures },
    { path: "assets/repo-sec-feat-dark.svg", content: dark.secFeatures },
  ];

  light.features.forEach((svg, idx) => {
    const n = String(idx + 1).padStart(2, "0");
    entries.push({ path: `assets/repo-feat-${n}-light.svg`, content: svg });
    entries.push({ path: `assets/repo-feat-${n}-dark.svg`, content: dark.features[idx] });
  });

  if (options.showArch) {
    entries.push(
      { path: "assets/repo-sec-arch-light.svg", content: light.secArch },
      { path: "assets/repo-sec-arch-dark.svg", content: dark.secArch },
      { path: "assets/repo-arch-light.svg", content: light.arch },
      { path: "assets/repo-arch-dark.svg", content: dark.arch }
    );
  }

  if (options.showBadge) {
    entries.push(
      { path: "assets/gitskins-badge-light.svg", content: light.badge },
      { path: "assets/gitskins-badge-dark.svg", content: dark.badge }
    );
  }

  const featRows: string[] = [];
  for (let i = 0; i < light.features.length; i += 2) {
    const pair = [i, i + 1].filter((idx) => idx < light.features.length);
    const html = pair
      .map((idx) => {
        const n = String(idx + 1).padStart(2, "0");
        const title = repo.features[idx]?.title || `Feature ${n}`;
        return `<picture><source media="(prefers-color-scheme: dark)" srcset="./assets/repo-feat-${n}-dark.svg"><img src="./assets/repo-feat-${n}-light.svg" alt="${title}" width="49%"></picture>`;
      })
      .join("&nbsp;");
    featRows.push(`<p>\n  ${html}\n</p>`);
  }

  const readmeLines: string[] = [
    `<!-- Generated with GitSkins Repo Skins (https://gitskins.blessc.com) · Theme: ${theme.id} -->`,
    "",
    `<p>`,
    `  <a href="${repo.homepage || repo.htmlUrl}">`,
    `    <picture>`,
    `      <source media="(prefers-color-scheme: dark)" srcset="./assets/repo-hero-dark.svg">`,
    `      <img src="./assets/repo-hero-light.svg" alt="${repo.owner}/${repo.name} — ${theme.name}" width="100%">`,
    `    </picture>`,
    `  </a>`,
    `</p>`,
    "",
    `<p>`,
    `  <picture>`,
    `    <source media="(prefers-color-scheme: dark)" srcset="./assets/repo-install-dark.svg">`,
    `    <img src="./assets/repo-install-light.svg" alt="Quick Install: ${repo.installCommand}" width="100%">`,
    `  </picture>`,
    `</p>`,
    "",
    `<p>`,
    `  <picture>`,
    `    <source media="(prefers-color-scheme: dark)" srcset="./assets/repo-sec-feat-dark.svg">`,
    `    <img src="./assets/repo-sec-feat-light.svg" alt="Key Capabilities" width="100%">`,
    `  </picture>`,
    `</p>`,
    "",
    ...featRows,
    "",
    ...(options.showArch
      ? [
          `<p>`,
          `  <picture>`,
          `    <source media="(prefers-color-scheme: dark)" srcset="./assets/repo-sec-arch-dark.svg">`,
          `    <img src="./assets/repo-sec-arch-light.svg" alt="System Architecture" width="100%">`,
          `  </picture>`,
          `</p>`,
          "",
          `<p>`,
          `  <picture>`,
          `    <source media="(prefers-color-scheme: dark)" srcset="./assets/repo-arch-dark.svg">`,
          `    <img src="./assets/repo-arch-light.svg" alt="Architecture Flow" width="100%">`,
          `  </picture>`,
          `</p>`,
          "",
        ]
      : []),
    `## Quick Start`,
    "",
    "```bash",
    repo.installCommand,
    "```",
    "",
    ...(options.showBadge
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
