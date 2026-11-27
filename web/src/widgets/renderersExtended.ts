import { encodeQrMatrix, qrMatrixToSvgPath } from "./qrEncoder";
import {
  FONT_MONO,
  FONT_SANS,
  escapeXml,
  fitText,
  renderThemeFrame,
  resolveTokens,
  themeHeadingFont,
} from "./svgPrimitives";
import type {
  CommitStreakConfig,
  ContribSkylineConfig,
  KeycapRigConfig,
  QrPassConfig,
  RecentActivityConfig,
  SkillRadarConfig,
  SplitFlapConfig,
  WidgetRenderOptions,
} from "./types";
import { getSnakePaletteForTheme } from "./workflow";

const BENTO_COL_PX = 204;
const BENTO_GAP_PX = 10;
const BENTO_ROW_HEIGHT = 160;

function colPx(span: 1 | 2 | 3 | 4): number {
  return span * BENTO_COL_PX + (span - 1) * BENTO_GAP_PX;
}

function makeUid(prefix: string, opts: WidgetRenderOptions): string {
  const suffix = (opts.instanceId || "ext").replace(/[^a-zA-Z0-9_-]/g, "");
  return `${prefix}-${opts.themeId}-${opts.mode}-c${opts.colSpan}-${suffix}`;
}

function parseHexRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || "").trim());
  if (!m) return [128, 128, 128];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixHex(a: string, b: string, ratio: number): string {
  const [r1, g1, b1] = parseHexRgb(a);
  const [r2, g2, b2] = parseHexRgb(b);
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const bl = Math.round(b1 + (b2 - b1) * ratio);
  return `#${[r, g, bl].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

// ---------------------------------------------------------------------------
// W09: Mechanical Keycap Rig (2/3/4 cols x 160px)
// ---------------------------------------------------------------------------
export function renderKeycapRig(cfg: KeycapRigConfig, opts: WidgetRenderOptions): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = colPx(opts.colSpan);
  const h = opts.targetHeight ?? BENTO_ROW_HEIGHT;
  const uid = makeUid("wkeys", opts);
  const title = (cfg.title || "DAILY RIG").toUpperCase();

  const frame = renderThemeFrame({
    uid,
    themeId: opts.themeId,
    mode: opts.mode,
    tokens: t,
    width: w,
    height: h,
    tag: fitText(title, 120, 9.5, true),
    rightMeta: "MECH KEYCAPS",
  });

  const pad = frame.padX;
  const innerW = w - pad * 2;
  const rawKeys = (cfg.keys || "ESC, VIM, RUST, TS, PY, AI, GIT, RET")
    .split(/[,，\n]+/)
    .map((k) => k.trim().toUpperCase())
    .filter(Boolean);
  const maxKeys = opts.colSpan === 4 ? 12 : opts.colSpan === 3 ? 10 : 8;
  const keys = (rawKeys.length ? rawKeys : ["ESC", "VIM", "RUST", "TS", "PY", "AI", "GIT", "RET"]).slice(0, maxKeys);
  const accentSet = new Set(
    (cfg.accentKeys || "ESC, AI, RET")
      .split(/[,，\n]+/)
      .map((k) => k.trim().toUpperCase())
      .filter(Boolean)
  );

  const perRow = keys.length <= 6 ? keys.length : Math.ceil(keys.length / 2);
  const rowCount = keys.length <= 6 ? 1 : 2;
  const gapX = 7;
  const gapY = 7;
  const areaTop = frame.contentTop + 5;
  const areaH = frame.contentBottom - areaTop - 22;
  const keyW = Math.min(96, Math.floor((innerW - gapX * (perRow - 1)) / perRow));
  const keyH = rowCount === 1 ? Math.min(54, areaH - 6) : Math.min(37, Math.floor((areaH - gapY) / 2));
  const gridTotalW = perRow * keyW + (perRow - 1) * gapX;
  const startX = Math.round(pad + (innerW - gridTotalW) / 2);
  const startY = Math.round(areaTop + (areaH - (rowCount * keyH + (rowCount - 1) * gapY)) / 2);

  const keySvgs: string[] = [];
  const pressClasses: string[] = [];

  keys.forEach((label, idx) => {
    const row = Math.floor(idx / perRow);
    const col = idx % perRow;
    const rowItems = row === rowCount - 1 ? keys.length - row * perRow : perRow;
    const rowW = rowItems * keyW + (rowItems - 1) * gapX;
    const rowOffset = Math.round(pad + (innerW - rowW) / 2);
    const kx = rowCount > 1 && row === rowCount - 1 ? rowOffset + col * (keyW + gapX) : startX + col * (keyW + gapX);
    const ky = startY + row * (keyH + gapY);

    const isAccent = accentSet.has(label);
    const isEsc = label === "ESC";
    const isSecondary = isAccent && (isEsc || idx % 2 === 1);
    const skirtFill = isAccent
      ? mixHex(isSecondary ? t.secondary : t.accent, "#000000", 0.34)
      : mixHex(t.surface, t.border, opts.mode === "dark" ? 0.45 : 0.28);
    const faceFill = isAccent
      ? isSecondary
        ? t.secondary
        : t.accent
      : t.surface;
    const textFill = isAccent ? t.accentFg : t.ink;
    const strokeCol = isAccent ? skirtFill : t.border;

    const animIdx = idx % 3;
    const cls = opts.animated && isAccent ? ` class="kpr-${uid}-${animIdx}"` : "";
    if (opts.animated && isAccent) pressClasses.push(`.kpr-${uid}-${animIdx}`);

    const safeLabel = escapeXml(fitText(label, keyW - 14, 10, true));
    keySvgs.push(`
  <g${cls}>
    <rect x="${kx}" y="${ky + 2}" width="${keyW}" height="${keyH}" rx="2" fill="${skirtFill}" stroke="${strokeCol}" stroke-width="1"/>
    <rect x="${kx + 3}" y="${ky}" width="${keyW - 6}" height="${keyH - 5}" rx="1.5" fill="${faceFill}" stroke="${strokeCol}" stroke-opacity="0.45" stroke-width="0.7"/>
    <text x="${kx + 8}" y="${ky + Math.min(18, Math.round((keyH - 5) * 0.6))}" font-family='${FONT_MONO}' font-size="9.8" font-weight="800" fill="${textFill}">${safeLabel}</text>
    <rect x="${kx + keyW - 11}" y="${ky + keyH - 11}" width="3" height="3" fill="${isAccent ? t.accentFg : t.accent}" fill-opacity="${isAccent ? "0.6" : "0.75"}" shape-rendering="crispEdges"/>
  </g>`);
  });

  const styleBlock = opts.animated
    ? `\n  <style>
    @keyframes kpress_${uid} { 0%, 82%, 100% { transform: translateY(0px); } 88% { transform: translateY(2px); } }
    .kpr-${uid}-0 { animation: kpress_${uid} 4.2s ease-in-out 0.2s infinite; }
    .kpr-${uid}-1 { animation: kpress_${uid} 4.8s ease-in-out 1.6s infinite; }
    .kpr-${uid}-2 { animation: kpress_${uid} 5.4s ease-in-out 3.1s infinite; }
    @media (prefers-reduced-motion: reduce) { .kpr-${uid}-0, .kpr-${uid}-1, .kpr-${uid}-2 { animation: none !important; } }
  </style>`
    : "";

  const hwY = frame.contentBottom - 4;
  const hwText = escapeXml(fitText(cfg.hardware || "HHKB HYBRID · NEOVIM · GHOSTTY · MACOS", innerW - 18, 9, true));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Mechanical Keycap Rig: ${escapeXml(title)}">
  <title>${escapeXml(title)} — Keycap Rig</title>${frame.defs ? `\n  <defs>${frame.defs}\n  </defs>` : ""}${styleBlock}
  ${frame.chrome}
  <rect x="${pad}" y="${areaTop - 2}" width="${innerW}" height="${areaH + 4}" fill="${t.patternBg}" fill-opacity="0.55" stroke="${t.borderSoft}" stroke-width="0.9"/>
  ${keySvgs.join("")}
  <rect x="${pad}" y="${hwY - 7}" width="6" height="6" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="${pad + 12}" y="${hwY}" font-family='${FONT_MONO}' font-size="9" font-weight="600" fill="${t.muted}">${hwText}</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// W10: Split-Flap Departure Board (2/3/4 cols x 160px)
// ---------------------------------------------------------------------------
export function renderSplitFlap(cfg: SplitFlapConfig, opts: WidgetRenderOptions): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = colPx(opts.colSpan);
  const h = opts.targetHeight ?? BENTO_ROW_HEIGHT;
  const uid = makeUid("wflap", opts);
  const header = (cfg.header || "STATUS BOARD").toUpperCase();
  const code = (cfg.code || "GATE A7").toUpperCase();

  const frame = renderThemeFrame({
    uid,
    themeId: opts.themeId,
    mode: opts.mode,
    tokens: t,
    width: w,
    height: h,
    tag: fitText(header, 130, 9.5, true),
    rightMeta: fitText(code, 90, 9.5, true),
  });

  const pad = frame.padX;
  const innerW = w - pad * 2;
  const tileSlots = opts.colSpan === 4 ? 22 : opts.colSpan === 3 ? 17 : 12;
  const gapX = 4;
  const tileW = Math.floor((innerW - gapX * (tileSlots - 1)) / tileSlots);
  const rowW = tileSlots * tileW + (tileSlots - 1) * gapX;
  const startX = Math.round(pad + (innerW - rowW) / 2);

  const tileBg = opts.mode === "dark" ? "#0B0D12" : "#15171C";
  const tileTopBg = opts.mode === "dark" ? "#141822" : "#21242C";
  const tileInk = "#F6F5F0";
  const tileAccentInk = t.highlight;

  const normalizeRow = (s: string): string[] => {
    const clean = (s || "").toUpperCase().replace(/[^A-Z0-9 ./:%+\-·#]/g, " ");
    const arr = Array.from(clean.slice(0, tileSlots));
    while (arr.length < tileSlots) arr.push(" ");
    return arr;
  };

  const row1 = normalizeRow(cfg.line1 || "SHIPPING GITSKINS");
  const row2 = normalizeRow(cfg.line2 || "2026 GOAL · 88% OK");

  const r1Y = frame.contentTop + 8;
  const r2Y = r1Y + 46;
  const tileH = 38;
  const fontSize = Math.min(20, Math.max(14, Math.round(tileW * 0.62)));

  const renderFlapRow = (chars: string[], ry: number, highlightRow: boolean): string =>
    chars
      .map((ch, idx) => {
        const tx = startX + idx * (tileW + gapX);
        const isNumOrPct = /[0-9%+]/.test(ch);
        const charColor = highlightRow && isNumOrPct ? tileAccentInk : tileInk;
        const flipCls =
          opts.animated && ((highlightRow && idx === tileSlots - 2) || (!highlightRow && idx === Math.floor(tileSlots / 2)))
            ? ` class="flp-${uid}-${highlightRow ? 1 : 0}"`
            : "";
        return `<g${flipCls}>
    <rect x="${tx}" y="${ry}" width="${tileW}" height="${tileH}" rx="1.5" fill="${tileBg}" stroke="${t.border}" stroke-width="0.9"/>
    <rect x="${tx + 1}" y="${ry + 1}" width="${tileW - 2}" height="${Math.floor(tileH / 2) - 1}" fill="${tileTopBg}"/>
    <text x="${(tx + tileW / 2).toFixed(1)}" y="${ry + Math.round(tileH * 0.68)}" text-anchor="middle" font-family='${FONT_MONO}' font-size="${fontSize}" font-weight="800" fill="${charColor}">${escapeXml(ch)}</text>
    <line x1="${tx}" y1="${ry + tileH / 2}" x2="${tx + tileW}" y2="${ry + tileH / 2}" stroke="#000000" stroke-opacity="0.75" stroke-width="1.3"/>
    <rect x="${tx - 0.5}" y="${ry + tileH / 2 - 2.5}" width="2" height="5" fill="${t.muted}" shape-rendering="crispEdges"/>
    <rect x="${tx + tileW - 1.5}" y="${ry + tileH / 2 - 2.5}" width="2" height="5" fill="${t.muted}" shape-rendering="crispEdges"/>
  </g>`;
      })
      .join("\n  ");

  const styleBlock = opts.animated
    ? `\n  <style>
    @keyframes flp_${uid} { 0%, 84%, 100% { opacity: 1; } 88% { opacity: 0.45; } 92% { opacity: 1; } }
    .flp-${uid}-0 { animation: flp_${uid} 5.2s steps(2, end) infinite; }
    .flp-${uid}-1 { animation: flp_${uid} 6.4s steps(2, end) 2.1s infinite; }
    @media (prefers-reduced-motion: reduce) { .flp-${uid}-0, .flp-${uid}-1 { animation: none !important; } }
  </style>`
    : "";

  const footY = frame.contentBottom - 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Split-Flap Board: ${escapeXml(cfg.line1 || "")}">
  <title>${escapeXml(header)} — Split-Flap</title>${frame.defs ? `\n  <defs>${frame.defs}\n  </defs>` : ""}${styleBlock}
  ${frame.chrome}
  ${renderFlapRow(row1, r1Y, false)}
  ${renderFlapRow(row2, r2Y, true)}
  <rect x="${startX}" y="${footY - 6}" width="5" height="5" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="${startX + 10}" y="${footY}" font-family='${FONT_MONO}' font-size="8.4" fill="${t.muted}">SPLIT-FLAP TELEMETRY · ${tileSlots}×2 CELLS</text>
  <text x="${startX + rowW}" y="${footY}" text-anchor="end" font-family='${FONT_MONO}' font-size="8.4" font-weight="700" fill="${t.accent}">ON TIME</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// W11: Hex Skill Radar (1/2 cols x 160px)
// ---------------------------------------------------------------------------
export function renderSkillRadar(cfg: SkillRadarConfig, opts: WidgetRenderOptions): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = colPx(opts.colSpan);
  const h = opts.targetHeight ?? BENTO_ROW_HEIGHT;
  const uid = makeUid("wradar", opts);
  const wide = opts.colSpan >= 2;
  const headFont = themeHeadingFont(opts.themeId);

  const frame = renderThemeFrame({
    uid,
    themeId: opts.themeId,
    mode: opts.mode,
    tokens: t,
    width: w,
    height: h,
    tag: fitText((cfg.title || "ABILITY RADAR").toUpperCase(), wide ? 140 : 96, 9, true),
    rightMeta: wide ? fitText((cfg.subtitle || "ENGINEER SPEC").toUpperCase(), 110, 9, true) : "6-AXIS",
  });

  const parsed = (cfg.axes || "SYS:88, AI:92, UI:84, INFRA:78, OSS:95, HW:72")
    .split(/[,，\n]+/)
    .map((part) => {
      const [rawL, rawV] = part.split(":");
      const label = (rawL || "").trim().toUpperCase().slice(0, 6);
      const val = Math.max(10, Math.min(100, parseInt((rawV || "75").trim(), 10) || 75));
      return label ? { label, val } : null;
    })
    .filter((x): x is { label: string; val: number } => x !== null)
    .slice(0, 6);
  const defaults = [
    { label: "SYS", val: 88 },
    { label: "AI", val: 92 },
    { label: "UI", val: 84 },
    { label: "INFRA", val: 78 },
    { label: "OSS", val: 95 },
    { label: "HW", val: 72 },
  ];
  const axes = Array.from({ length: 6 }, (_, i) => parsed[i] ?? defaults[i]);

  const pad = frame.padX;
  const cx = wide ? pad + 78 : w / 2;
  const cy = Math.round((frame.contentTop + frame.contentBottom) / 2) + 2;
  const maxR = wide ? 40 : 35;

  const pt = (idx: number, radius: number): [number, number] => {
    const angle = -Math.PI / 2 + (idx * Math.PI * 2) / 6;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
  };

  const rings = [0.35, 0.68, 1.0]
    .map((frac) => {
      const coords = Array.from({ length: 6 }, (_, i) => pt(i, maxR * frac))
        .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
        .join(" ");
      return `<polygon points="${coords}" fill="none" stroke="${t.borderSoft}" stroke-width="${frac === 1 ? 1.1 : 0.7}"${frac < 1 ? ' stroke-dasharray="2 2"' : ""}/>`;
    })
    .join("\n  ");

  const spokes = Array.from({ length: 6 }, (_, i) => {
    const [x, y] = pt(i, maxR);
    return `<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${t.borderSoft}" stroke-width="0.7"/>`;
  }).join("\n  ");

  const dataPts = axes.map((a, i) => pt(i, (a.val / 100) * maxR));
  const polyCoords = dataPts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const dots = dataPts
    .map(
      ([x, y], i) =>
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${i % 2 === 0 ? t.accent : t.secondary}" stroke="${t.surface}" stroke-width="0.9"/>`
    )
    .join("\n  ");

  const axisLabels = axes
    .map((a, i) => {
      const [lx, ly] = pt(i, maxR + (wide ? 13 : 11));
      const anchor = Math.abs(lx - cx) < 6 ? "middle" : lx > cx ? "start" : "end";
      return `<text x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="${anchor}" font-family='${FONT_MONO}' font-size="${wide ? 8.2 : 7.6}" font-weight="700" fill="${t.sub}">${escapeXml(a.label)}</text>`;
    })
    .join("\n  ");

  const sidePanel = wide
    ? (() => {
        const sx = pad + 166;
        const sw = w - sx - pad;
        const colW = Math.floor((sw - 10) / 2);
        const avg = Math.round(axes.reduce((s, a) => s + a.val, 0) / axes.length);
        const bars = axes
          .map((a, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const bx = sx + col * (colW + 10);
            const by = frame.contentTop + 32 + row * 25;
            const barW = Math.max(24, colW - 4);
            const fillW = Math.max(4, Math.round((barW * a.val) / 100));
            const color = [t.accent, t.secondary, t.tertiary, t.highlight][idx % 4];
            return `
  <text x="${bx}" y="${by}" font-family='${FONT_MONO}' font-size="8.6" font-weight="700" fill="${t.ink}">${escapeXml(a.label)}</text>
  <text x="${bx + barW}" y="${by}" text-anchor="end" font-family='${FONT_MONO}' font-size="8.4" fill="${t.muted}">${a.val}</text>
  <rect x="${bx}" y="${by + 4}" width="${barW}" height="5" fill="${t.patternBg}" shape-rendering="crispEdges"/>
  <rect x="${bx}" y="${by + 4}" width="${fillW}" height="5" fill="${color}" shape-rendering="crispEdges"/>`;
          })
          .join("");
        return `
  <text x="${sx}" y="${frame.contentTop + 16}" font-family='${headFont}' font-size="14" font-weight="800" fill="${t.ink}">AVG ${avg}/100</text>
  <text x="${w - pad}" y="${frame.contentTop + 15}" text-anchor="end" font-family='${FONT_MONO}' font-size="8.6" font-weight="700" fill="${t.accent}">HEX MATRIX</text>
  <line x1="${sx}" y1="${frame.contentTop + 21}" x2="${w - pad}" y2="${frame.contentTop + 21}" stroke="${t.borderSoft}" stroke-width="0.8"/>
  ${bars}`;
      })()
    : "";

  const styleBlock = opts.animated
    ? `\n  <style>
    @keyframes rpls_${uid} { 0%, 100% { fill-opacity: 0.24; } 50% { fill-opacity: 0.38; } }
    .rpoly-${uid} { animation: rpls_${uid} 4.2s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) { .rpoly-${uid} { animation: none !important; } }
  </style>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Hex Skill Radar">
  <title>Hex Skill Radar</title>${frame.defs ? `\n  <defs>${frame.defs}\n  </defs>` : ""}${styleBlock}
  ${frame.chrome}
  ${rings}
  ${spokes}
  <polygon class="rpoly-${uid}" points="${polyCoords}" fill="${t.accent}" fill-opacity="0.26" stroke="${t.accent}" stroke-width="1.6"/>
  ${dots}
  ${axisLabels}
  ${sidePanel}
</svg>`;
}

// ---------------------------------------------------------------------------
// W12: Scannable Vector QR Pass (1/2 cols x 160px)
// ---------------------------------------------------------------------------
export function renderQrPass(cfg: QrPassConfig, opts: WidgetRenderOptions): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = colPx(opts.colSpan);
  const h = opts.targetHeight ?? BENTO_ROW_HEIGHT;
  const uid = makeUid("wqr", opts);
  const wide = opts.colSpan >= 2;
  const headFont = themeHeadingFont(opts.themeId);

  const frame = renderThemeFrame({
    uid,
    themeId: opts.themeId,
    mode: opts.mode,
    tokens: t,
    width: w,
    height: h,
    tag: "QR PASS",
    rightMeta: fitText((cfg.badge || "VERIFIED").toUpperCase(), 76, 8.8, true),
  });

  const pad = frame.padX;
  const qrUrl = (cfg.url || "https://gitskins.blessc.com").trim();
  const mat = encodeQrMatrix(qrUrl);
  const n = mat.length;

  // Always preserve a crisp high-contrast light quiet zone so mobile cameras scan reliably in Dark mode too!
  const boxSize = wide ? 96 : 86;
  const boxX = wide ? pad + 2 : Math.round((w - boxSize) / 2);
  const boxY = wide ? frame.contentTop + 5 : frame.contentTop + 2;
  const quiet = 6;
  const modSize = (boxSize - quiet * 2) / n;
  const qrPath = qrMatrixToSvgPath(mat, boxX + quiet, boxY + quiet, modSize);
  const qrInk = "#111214";

  const safeTitle = escapeXml(fitText(cfg.title || "SCAN SITE", wide ? w - pad * 2 - boxSize - 20 : w - 24, wide ? 17 : 12));
  const safeSub = escapeXml(fitText(cfg.subtitle || qrUrl.replace(/^https?:\/\//, ""), wide ? w - pad * 2 - boxSize - 20 : w - 24, 9.5, true));
  const urlShort = escapeXml(fitText(qrUrl, wide ? w - pad * 2 - boxSize - 20 : w - 24, 8.8, true));

  const details = wide
    ? `
  <rect x="${boxX + boxSize + 16}" y="${boxY + 6}" width="6" height="6" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="${boxX + boxSize + 27}" y="${boxY + 12}" font-family='${FONT_MONO}' font-size="8.8" font-weight="700" fill="${t.accent}">ISO-18004 VECTOR QR</text>
  <text x="${boxX + boxSize + 16}" y="${boxY + 38}" font-family='${headFont}' font-size="18" font-weight="800" fill="${t.ink}">${safeTitle}</text>
  <text x="${boxX + boxSize + 16}" y="${boxY + 58}" font-family='${FONT_MONO}' font-size="10.5" font-weight="600" fill="${t.sub}">${safeSub}</text>
  <line x1="${boxX + boxSize + 16}" y1="${boxY + 70}" x2="${w - pad}" y2="${boxY + 70}" stroke="${t.borderSoft}" stroke-width="0.9"/>
  <text x="${boxX + boxSize + 16}" y="${boxY + 88}" font-family='${FONT_MONO}' font-size="8.8" fill="${t.muted}">${urlShort}</text>`
    : `
  <text x="${w / 2}" y="${h - 14}" text-anchor="middle" font-family='${FONT_MONO}' font-size="9" font-weight="700" fill="${t.ink}">${safeSub}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="QR Pass for ${escapeXml(qrUrl)}">
  <title>QR Pass — ${escapeXml(qrUrl)}</title>${frame.defs ? `\n  <defs>${frame.defs}\n  </defs>` : ""}
  ${frame.chrome}
  <rect x="${boxX}" y="${boxY}" width="${boxSize}" height="${boxSize}" fill="#FFFFFF" stroke="${t.border}" stroke-width="1.2"/>
  <path fill="${qrInk}" shape-rendering="crispEdges" d="${qrPath}"/>
  ${details}
</svg>`;
}

// ---------------------------------------------------------------------------
// L08: 3D Isometric Contribution Skyline (3/4 cols x 160px)
// ---------------------------------------------------------------------------
export function renderContribSkyline(cfg: ContribSkylineConfig, opts: WidgetRenderOptions): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = colPx(opts.colSpan);
  const h = opts.targetHeight ?? BENTO_ROW_HEIGHT;
  const uid = makeUid("lsky", opts);
  const handle = (cfg.username || "Furina-he").replace(/^@+/, "");
  const weeks = Math.max(12, Math.min(22, Math.round(cfg.weeks || (opts.colSpan === 4 ? 18 : 14))));
  const total = Math.max(0, Math.round(cfg.totalCommits ?? 1284));
  const pal = getSnakePaletteForTheme(opts.themeId, opts.mode, t, opts.accentOverride);

  const frame = renderThemeFrame({
    uid,
    themeId: opts.themeId,
    mode: opts.mode,
    tokens: t,
    width: w,
    height: h,
    tag: "3D SKYLINE",
    rightMeta: `@${fitText(handle, 110, 9.5, true)} · ${total.toLocaleString()} COMMITS`,
  });

  let seed = 13;
  for (let i = 0; i < handle.length; i++) seed = (seed * 31 + handle.charCodeAt(i)) % 97;

  // Isometric projection vectors (dx, dy)
  const dx = opts.colSpan === 4 ? 16.5 : 13.8;
  const dy = opts.colSpan === 4 ? 6.4 : 5.6;
  const rowDx = -11.5;
  const rowDy = 6.2;

  const gridSpanX = (weeks - 1) * dx + 6 * rowDx;
  const originX = Math.round(w / 2 - gridSpanX / 2) + 8;
  const originY = frame.contentTop + 34;

  const topColors = pal.dots;
  const polys: string[] = [];

  // Painter's algorithm: back-to-front (week ascending, day ascending)
  for (let c = 0; c < weeks; c++) {
    for (let r = 0; r < 7; r++) {
      const wave =
        Math.sin((c + seed) * 0.55 + r * 0.7) +
        Math.cos((c * 0.28 - r * 0.9) + seed * 0.2);
      const hash = ((c * 41 + r * 83 + seed * 19) ^ (c * 11)) & 31;
      const lvl =
        hash < 5
          ? 0
          : wave > 1.05 || hash >= 29
            ? 4
            : wave > 0.35 || hash > 23
              ? 3
              : wave > -0.35
                ? 2
                : 1;

      const bh = lvl === 0 ? 2 : 6 + lvl * 8;
      const bx = originX + c * dx + r * rowDx;
      const by = originY + c * dy + r * rowDy;
      const hw = dx * 0.44;
      const hh = dy * 0.46;

      const topC = topColors[lvl];
      const leftC = mixHex(topC, "#000000", opts.mode === "dark" ? 0.28 : 0.2);
      const rightC = mixHex(topC, "#000000", opts.mode === "dark" ? 0.48 : 0.36);

      // Top diamond at y - bh
      const ty = by - bh;
      const topPts = `${bx.toFixed(1)},${(ty - hh).toFixed(1)} ${(bx + hw).toFixed(1)},${ty.toFixed(1)} ${bx.toFixed(1)},${(ty + hh).toFixed(1)} ${(bx - hw).toFixed(1)},${ty.toFixed(1)}`;
      const leftPts = `${(bx - hw).toFixed(1)},${ty.toFixed(1)} ${bx.toFixed(1)},${(ty + hh).toFixed(1)} ${bx.toFixed(1)},${(by + hh).toFixed(1)} ${(bx - hw).toFixed(1)},${by.toFixed(1)}`;
      const rightPts = `${bx.toFixed(1)},${(ty + hh).toFixed(1)} ${(bx + hw).toFixed(1)},${ty.toFixed(1)} ${(bx + hw).toFixed(1)},${by.toFixed(1)} ${bx.toFixed(1)},${(by + hh).toFixed(1)}`;

      polys.push(
        `<polygon points="${leftPts}" fill="${leftC}"/><polygon points="${rightPts}" fill="${rightC}"/><polygon points="${topPts}" fill="${topC}"/>`
      );
    }
  }

  const footY = frame.contentBottom - 4;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="3D Contribution Skyline for @${escapeXml(handle)}">
  <title>3D Contribution Skyline — @${escapeXml(handle)}</title>${frame.defs ? `\n  <defs>${frame.defs}\n  </defs>` : ""}
  ${frame.chrome}
  <g>${polys.join("")}</g>
  <rect x="${frame.padX}" y="${footY - 7}" width="6" height="6" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="${frame.padX + 11}" y="${footY}" font-family='${FONT_MONO}' font-size="8.6" font-weight="700" fill="${t.muted}">ISOMETRIC ${weeks}W × 7D · ZERO-503</text>
  <text x="${w - frame.padX}" y="${footY}" text-anchor="end" font-family='${FONT_MONO}' font-size="8.6" fill="${t.muted}">GITHUB GRAPHQL</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// L09: Commit Streak Flame (1/2 cols x 160px)
// ---------------------------------------------------------------------------
export function renderCommitStreak(cfg: CommitStreakConfig, opts: WidgetRenderOptions): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = colPx(opts.colSpan);
  const h = opts.targetHeight ?? BENTO_ROW_HEIGHT;
  const uid = makeUid("lstrk", opts);
  const wide = opts.colSpan >= 2;
  const headFont = themeHeadingFont(opts.themeId);
  const cur = Math.max(0, Math.round(cfg.currentStreak ?? 42));
  const best = Math.max(cur, Math.round(cfg.longestStreak ?? 96));
  const total = Math.max(cur, Math.round(cfg.totalCommits ?? 1284));

  const frame = renderThemeFrame({
    uid,
    themeId: opts.themeId,
    mode: opts.mode,
    tokens: t,
    width: w,
    height: h,
    tag: "STREAK",
    rightMeta: wide ? `@${fitText((cfg.username || "Furina-he").replace(/^@+/, ""), 100, 9, true)}` : "LIVE",
  });

  const pad = frame.padX;
  const fx = wide ? pad + 26 : pad + 18;
  const fy = frame.contentTop + 14;

  // Crisp pixel flame (8x10 grid scaled by 4px)
  const flameSvg = `
  <g class="flm-${uid}" transform="translate(${fx}, ${fy})">
    <path fill="${t.secondary}" shape-rendering="crispEdges" d="M12 0h4v4h-4zM8 4h12v4H8zM4 8h20v12H4zM0 16h28v12H0zM4 28h20v4H4z"/>
    <path fill="${t.accent}" shape-rendering="crispEdges" d="M12 8h4v4h-4zM8 12h12v12H8zM4 20h20v8H4z"/>
    <path fill="${t.highlight}" shape-rendering="crispEdges" d="M12 16h4v12h-4zM8 22h12v6H8z"/>
  </g>`;

  const days14 = [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  const barY = frame.contentBottom - 16;
  const barInnerW = w - pad * 2;
  const segGap = 3;
  const segW = Math.floor((barInnerW - segGap * 13) / 14);
  const dayBars = days14
    .map((on, i) => {
      const x = pad + i * (segW + segGap);
      const col = !on ? t.borderSoft : i >= 11 ? t.accent : i >= 7 ? t.secondary : t.tertiary;
      return `<rect x="${x}" y="${barY}" width="${segW}" height="7" fill="${col}" shape-rendering="crispEdges"/>`;
    })
    .join("");

  const metrics = wide
    ? `
  <text x="${pad + 72}" y="${frame.contentTop + 34}" font-family='${headFont}' font-size="30" font-weight="800" fill="${t.ink}">${cur}<tspan font-family='${FONT_MONO}' font-size="11" font-weight="700" fill="${t.accent}"> DAYS</tspan></text>
  <text x="${pad + 72}" y="${frame.contentTop + 52}" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">CURRENT STREAK · ACTIVE</text>
  <line x1="${w - pad - 118}" y1="${frame.contentTop + 8}" x2="${w - pad - 118}" y2="${frame.contentTop + 62}" stroke="${t.borderSoft}" stroke-width="0.9"/>
  <text x="${w - pad - 104}" y="${frame.contentTop + 21}" font-family='${FONT_MONO}' font-size="8.5" fill="${t.muted}">LONGEST</text>
  <text x="${w - pad - 104}" y="${frame.contentTop + 37}" font-family='${headFont}' font-size="15" font-weight="800" fill="${t.ink}">${best}d</text>
  <text x="${w - pad - 104}" y="${frame.contentTop + 52}" font-family='${FONT_MONO}' font-size="8.5" fill="${t.muted}">YEAR <tspan fill="${t.sub}" font-weight="700">${total.toLocaleString()}</tspan></text>`
    : `
  <text x="${pad + 56}" y="${frame.contentTop + 36}" font-family='${headFont}' font-size="28" font-weight="800" fill="${t.ink}">${cur}<tspan font-family='${FONT_MONO}' font-size="10" fill="${t.accent}">d</tspan></text>
  <text x="${pad + 56}" y="${frame.contentTop + 53}" font-family='${FONT_MONO}' font-size="8.8" fill="${t.muted}">BEST ${best}d</text>`;

  const styleBlock = opts.animated
    ? `\n  <style>
    @keyframes flm_${uid} { 0%, 100% { transform: translate(${fx}px, ${fy}px) scaleY(1); } 50% { transform: translate(${fx}px, ${fy - 1}px) scaleY(1.04); } }
    .flm-${uid} { animation: flm_${uid} 1.9s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) { .flm-${uid} { animation: none !important; } }
  </style>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Commit Streak: ${cur} days">
  <title>Commit Streak — ${cur} days</title>${frame.defs ? `\n  <defs>${frame.defs}\n  </defs>` : ""}${styleBlock}
  ${frame.chrome}
  ${flameSvg}
  ${metrics}
  <text x="${pad}" y="${barY - 5}" font-family='${FONT_MONO}' font-size="8.2" fill="${t.muted}">LAST 14 DAYS</text>
  ${dayBars}
</svg>`;
}

// ---------------------------------------------------------------------------
// L10: Live Activity Log (2/3/4 cols x 160px)
// ---------------------------------------------------------------------------
export function renderRecentActivity(cfg: RecentActivityConfig, opts: WidgetRenderOptions): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = colPx(opts.colSpan);
  const h = opts.targetHeight ?? BENTO_ROW_HEIGHT;
  const uid = makeUid("lact", opts);
  const handle = (cfg.username || "Furina-he").replace(/^@+/, "");

  const frame = renderThemeFrame({
    uid,
    themeId: opts.themeId,
    mode: opts.mode,
    tokens: t,
    width: w,
    height: h,
    tag: "ACTIVITY LOG",
    rightMeta: `@${fitText(handle, 110, 9.2, true)}`,
  });

  const pad = frame.padX;
  const parseEvent = (raw: string, fallback: [string, string, string]): [string, string, string] => {
    const parts = (raw || "").split("|").map((p) => p.trim());
    if (parts.length >= 3) return [parts[0].toUpperCase().slice(0, 4), parts[1], parts[2]];
    if (parts.length === 2) return [parts[0].toUpperCase().slice(0, 4), parts[1], "now"];
    return fallback;
  };

  const rows: [string, string, string][] = [
    parseEvent(cfg.event1, ["PUSH", "Furina-he/gitskins · feat: high-recognition pack", "2h"]),
    parseEvent(cfg.event2, ["REL", "Furina-he/cloudlink · v0.6.0 switchboard", "1d"]),
    parseEvent(cfg.event3, ["PR", "Furina-he/OpenPet · desktop companion", "3d"]),
  ];

  const badgeColors: Record<string, string> = {
    PUSH: t.accent,
    REL: t.highlight,
    PR: t.tertiary,
    STAR: t.secondary,
  };
  const msgMaxW = w - pad * 2 - 92;

  const rowSvg = rows
    .map(([kind, msg, age], idx) => {
      const y = frame.contentTop + 21 + idx * 33;
      const sep =
        idx > 0
          ? `<line x1="${pad}" y1="${y - 18}" x2="${w - pad}" y2="${y - 18}" stroke="${t.borderSoft}" stroke-width="0.8"/>`
          : "";
      const col = badgeColors[kind] ?? t.accent;
      const badgeW = 36;
      const safeMsg = escapeXml(fitText(msg, msgMaxW, 11.2, opts.themeId === "crt-terminal"));
      return `${sep}
  <rect x="${pad}" y="${y - 10}" width="${badgeW}" height="15" fill="${col}"/>
  <text x="${pad + badgeW / 2}" y="${y + 1}" text-anchor="middle" font-family='${FONT_MONO}' font-size="8.2" font-weight="700" fill="${t.accentFg}">${escapeXml(kind)}</text>
  <text x="${pad + badgeW + 9}" y="${y + 1}" font-family='${opts.themeId === "crt-terminal" ? FONT_MONO : FONT_SANS}' font-size="11.5" font-weight="600" fill="${t.ink}">${safeMsg}</text>
  <text x="${w - pad}" y="${y + 1}" text-anchor="end" font-family='${FONT_MONO}' font-size="9.2" fill="${t.muted}">${escapeXml(age)}</text>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Live Activity Log for @${escapeXml(handle)}">
  <title>Activity Log — @${escapeXml(handle)}</title>${frame.defs ? `\n  <defs>${frame.defs}\n  </defs>` : ""}
  ${frame.chrome}
  ${rowSvg}
</svg>`;
}
