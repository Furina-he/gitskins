import {
  PEEKER_CAT_BLINK,
  PEEKER_CAT_OPEN,
  PET_SPRITES,
  PIXEL_MUG,
  RUNNER_SPRITES,
} from "./sprites";
import {
  FONT_MONO,
  FONT_SANS,
  FONT_SERIF,
  bauhausWeave,
  chamferPolygon,
  escapeXml,
  estimateTextPx,
  fitText,
  gridToPaths,
  renderThemeFrame,
  resolveTokens,
  themeHeadingFont,
  wrapText,
} from "./svgPrimitives";
import type {
  BentoColSpan,
  CodingRhythmConfig,
  DevBadgeConfig,
  GitHubStatsConfig,
  HeroStickerConfig,
  LiveWeatherConfig,
  MiniTileConfig,
  NowPlayingConfig,
  PixelCompanionConfig,
  PixelRunwayConfig,
  QuoteBannerConfig,
  RssFeedConfig,
  SkillDockConfig,
  WidgetConfigMap,
  WidgetId,
  WidgetRenderOptions,
} from "./types";

export const BENTO_COL_PX = 204;
export const BENTO_GAP_PX = 10;
export const BENTO_ROW_HEIGHT = 160;

export function colSpanToPx(span: BentoColSpan): number {
  return span * BENTO_COL_PX + (span - 1) * BENTO_GAP_PX;
}

function makeUid(widgetId: string, opts: WidgetRenderOptions): string {
  const suffix = (opts.instanceId || "lab").replace(/[^a-zA-Z0-9_-]/g, "");
  return `${widgetId}-${opts.themeId}-${opts.mode}-c${opts.colSpan}-${suffix}`;
}

function renderPixelCompanion(
  cfg: PixelCompanionConfig,
  opts: WidgetRenderOptions
): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = colSpanToPx(opts.colSpan);
  const h = opts.targetHeight ?? BENTO_ROW_HEIGHT;
  const uid = makeUid("pet", opts);
  const hasSidePanel = w >= 632;

  const moodMap: Record<PixelCompanionConfig["mood"], { label: string; color: string }> = {
    coding: { label: "CODING", color: t.tertiary },
    coffee: { label: "COFFEE", color: t.highlight },
    debugging: { label: "DEBUGGING", color: t.accent },
    afking: { label: "AFK / IDLE", color: t.muted },
  };
  const mood = moodMap[cfg.mood] ?? moodMap.coding;

  const frame = renderThemeFrame({
    uid,
    themeId: opts.themeId,
    mode: opts.mode,
    tokens: t,
    width: w,
    height: h,
    tag: "COMPANION",
    rightMeta: `${cfg.pet.toUpperCase()} · ${mood.label}`,
  });

  const sprite = PET_SPRITES[cfg.pet] ?? PET_SPRITES.cat;
  const pal = sprite.palette(t.accent, t.secondary, t.highlight);
  const boxX = frame.padX;
  const boxY = frame.contentTop + 8;
  const boxSize = 90;
  const spritePx = 5;
  const spriteOx = boxX + Math.round((boxSize - 70) / 2);
  const spriteOy = boxY + Math.round((boxSize - 60) / 2) + 2;

  const openG = gridToPaths(sprite.open, pal, spriteOx, spriteOy, spritePx);
  const closedG = gridToPaths(sprite.closed, pal, spriteOx, spriteOy, spritePx);

  let portraitFrame = "";
  if (opts.themeId === "swiss-bauhaus-pixel") {
    portraitFrame = `
  <rect x="${boxX + 4}" y="${boxY + 4}" width="${boxSize}" height="${boxSize}" fill="${t.border}"/>
  ${bauhausWeave(boxX, boxY, boxSize, boxSize, t.patternBg, t.patternFg, 6)}
  <rect x="${boxX + 6}" y="${boxY + 6}" width="${boxSize - 12}" height="${boxSize - 12}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <rect x="${boxX}" y="${boxY}" width="${boxSize}" height="${boxSize}" fill="none" stroke="${t.border}" stroke-width="1.2"/>`;
  } else if (opts.themeId === "blueprint-cad") {
    portraitFrame = `
  <rect x="${boxX}" y="${boxY}" width="${boxSize}" height="${boxSize}" fill="${t.patternBg}" stroke="${t.border}" stroke-width="1"/>
  <line x1="${boxX + boxSize / 2}" y1="${boxY}" x2="${boxX + boxSize / 2}" y2="${boxY + boxSize}" stroke="${t.borderSoft}" stroke-dasharray="2 3" stroke-width="0.7"/>
  <line x1="${boxX}" y1="${boxY + boxSize / 2}" x2="${boxX + boxSize}" y2="${boxY + boxSize / 2}" stroke="${t.borderSoft}" stroke-dasharray="2 3" stroke-width="0.7"/>`;
  } else {
    portraitFrame = `
  <rect x="${boxX}" y="${boxY}" width="${boxSize}" height="${boxSize}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>`;
  }

  const sidePanelW = w >= 846 ? 198 : 168;
  const textX = boxX + boxSize + 18;
  const rightLimit = hasSidePanel ? w - sidePanelW - 18 : w - frame.padX;
  const textMaxW = rightLimit - textX;
  const headFont = themeHeadingFont(opts.themeId);
  const moodPillW = Math.round(estimateTextPx(mood.label, 9.5, true) + 20);
  const moodPillX = rightLimit - moodPillW;
  const safeName = escapeXml(
    fitText(cfg.name || "Mochi", textMaxW - moodPillW - 10, 17, opts.themeId === "crt-terminal")
  );
  const msgLines = wrapText(
    cfg.message || "Shipping crisp SVGs...",
    textMaxW - 22,
    12,
    2,
    opts.themeId === "crt-terminal"
  );
  const safeFooter = escapeXml(
    fitText(cfg.footerTag || "LV.08 · PIXEL COMPANION", textMaxW, 10, true)
  );

  const bubbleY = boxY + 26;
  const bubbleH = 44;
  const bubbleBox = `
  <rect x="${textX}" y="${bubbleY}" width="${textMaxW}" height="${bubbleH}" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <polygon points="${textX - 6},${bubbleY + 18} ${textX + 1},${bubbleY + 13} ${textX + 1},${bubbleY + 23}" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="${textX}" y="${bubbleY + 14}" width="2" height="9" fill="${t.surface}"/>
  ${msgLines
    .map(
      (line, idx) =>
        `<text x="${textX + 11}" y="${bubbleY + (msgLines.length === 1 ? 26 : 18 + idx * 16)}" font-family='${opts.themeId === "crt-terminal" ? FONT_MONO : FONT_SANS}' font-size="11.5" fill="${t.sub}">${escapeXml(line)}</text>`
    )
    .join("\n  ")}`;

  const sideX = w - sidePanelW + 14;
  const sidePanel = hasSidePanel
    ? `
  <line x1="${w - sidePanelW}" y1="${frame.contentTop + 4}" x2="${w - sidePanelW}" y2="${frame.contentBottom - 4}" stroke="${t.borderSoft}" stroke-width="1"/>
  <text x="${sideX}" y="${boxY + 14}" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="0.8" fill="${t.muted}">UNIT TELEMETRY</text>
  <text x="${sideX}" y="${boxY + 36}" font-family='${FONT_MONO}' font-size="10" fill="${t.sub}">SPECIES</text>
  <text x="${w - frame.padX}" y="${boxY + 36}" text-anchor="end" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.ink}">${escapeXml(cfg.pet.toUpperCase())}</text>
  <line x1="${sideX}" y1="${boxY + 46}" x2="${w - frame.padX}" y2="${boxY + 46}" stroke="${t.borderSoft}" stroke-width="0.8"/>
  <text x="${sideX}" y="${boxY + 62}" font-family='${FONT_MONO}' font-size="10" fill="${t.sub}">STATE</text>
  <text x="${w - frame.padX}" y="${boxY + 62}" text-anchor="end" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${mood.color}">${escapeXml(mood.label)}</text>
  <line x1="${sideX}" y1="${boxY + 72}" x2="${w - frame.padX}" y2="${boxY + 72}" stroke="${t.borderSoft}" stroke-width="0.8"/>
  <text x="${sideX}" y="${boxY + 88}" font-family='${FONT_MONO}' font-size="10" fill="${t.sub}">ENERGY</text>
  ${Array.from({ length: 6 }, (_, i) => {
    const bx = w - frame.padX - (6 - i) * 10 + 2;
    const filled = i < (cfg.mood === "afking" ? 3 : 5);
    return `<rect x="${bx}" y="${boxY + 79}" width="7.5" height="10" fill="${filled ? t.accent : t.borderSoft}" shape-rendering="crispEdges"/>`;
  }).join("")}`
    : "";

  const styleBlock = opts.animated
    ? `
  <style>
    @keyframes petA_${uid} { 0%, 78%, 100% { opacity: 1; } 79%, 99% { opacity: 0; } }
    @keyframes petB_${uid} { 0%, 78%, 100% { opacity: 0; } 79%, 99% { opacity: 1; } }
    @keyframes led_${uid} { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
    .pet-a-${uid} { animation: petA_${uid} 3.6s steps(1, end) infinite; }
    .pet-b-${uid} { opacity: 0; animation: petB_${uid} 3.6s steps(1, end) infinite; }
    .pet-led-${uid} { animation: led_${uid} 2.4s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      .pet-a-${uid}, .pet-b-${uid}, .pet-led-${uid} { animation: none !important; }
      .pet-a-${uid} { opacity: 1 !important; }
      .pet-b-${uid} { opacity: 0 !important; }
    }
  </style>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeName} — GitSkins Companion Widget">
  <title>${safeName} — ${escapeXml(mood.label)}</title>${frame.defs ? `\n  <defs>${frame.defs}\n  </defs>` : ""}${styleBlock}
  ${frame.chrome}
  ${portraitFrame}
  <g class="pet-a-${uid}">${openG}</g>
  ${opts.animated ? `<g class="pet-b-${uid}">${closedG}</g>` : ""}
  <text x="${textX}" y="${boxY + 15}" font-family='${headFont}' font-size="17" font-weight="700" fill="${t.ink}">${safeName}</text>
  <rect x="${moodPillX}" y="${boxY + 1}" width="${moodPillW}" height="18" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect class="pet-led-${uid}" x="${moodPillX + 6}" y="${boxY + 7}" width="5" height="5" fill="${mood.color}" shape-rendering="crispEdges"/>
  <text x="${moodPillX + 15}" y="${boxY + 13.5}" font-family='${FONT_MONO}' font-size="9" font-weight="700" fill="${t.ink}">${escapeXml(mood.label)}</text>
  ${bubbleBox}
  <text x="${textX}" y="${boxY + 87}" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">${safeFooter}</text>
  ${sidePanel}
</svg>`;
}

function renderNowPlaying(
  cfg: NowPlayingConfig,
  opts: WidgetRenderOptions
): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = colSpanToPx(opts.colSpan);
  const h = opts.targetHeight ?? BENTO_ROW_HEIGHT;
  const uid = makeUid("music", opts);
  const pct = Math.max(0, Math.min(100, Math.round(cfg.progress || 0)));
  const hasSidePanel = w >= 632;

  const frame = renderThemeFrame({
    uid,
    themeId: opts.themeId,
    mode: opts.mode,
    tokens: t,
    width: w,
    height: h,
    tag: cfg.media === "vinyl" ? "NOW SPINNING" : "NOW PLAYING",
    rightMeta: `${cfg.media.toUpperCase()} · ${pct}%`,
  });

  const artX = frame.padX;
  const artY = frame.contentTop + 10;
  let artSvg = "";

  if (cfg.media === "vinyl") {
    const cx = artX + 44;
    const cy = artY + 44;
    artSvg = `
  <rect x="${artX}" y="${artY}" width="88" height="88" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <g class="spin-${uid}" style="transform-origin:${cx}px ${cy}px">
    <circle cx="${cx}" cy="${cy}" r="35" fill="${opts.mode === "dark" ? "#0B0D10" : "#16181D"}" stroke="${t.border}" stroke-width="1"/>
    <circle cx="${cx}" cy="${cy}" r="29" fill="none" stroke="${t.muted}" stroke-opacity="0.32" stroke-width="0.8"/>
    <circle cx="${cx}" cy="${cy}" r="23" fill="none" stroke="${t.muted}" stroke-opacity="0.28" stroke-width="0.8"/>
    <circle cx="${cx}" cy="${cy}" r="14" fill="${t.accent}"/>
    <path d="M ${cx - 24} ${cy - 12} A 27 27 0 0 1 ${cx - 8} ${cy - 26}" fill="none" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="1.5"/>
    <circle cx="${cx}" cy="${cy}" r="3" fill="${t.bg}"/>
  </g>
  <line x1="${artX + 78}" y1="${artY + 14}" x2="${artX + 67}" y2="${artY + 52}" stroke="${t.ink}" stroke-width="2"/>
  <circle cx="${artX + 78}" cy="${artY + 14}" r="3.5" fill="${t.border}"/>`;
  } else {
    const cy = artY + 10;
    const r1x = artX + 27;
    const r2x = artX + 67;
    const ry = cy + 33;
    artSvg = `
  <rect x="${artX}" y="${cy}" width="94" height="66" fill="${t.surface}" stroke="${t.border}" stroke-width="1.2"/>
  <rect x="${artX + 5}" y="${cy + 5}" width="84" height="14" fill="${t.accent}"/>
  <text x="${artX + 10}" y="${cy + 15}" font-family='${FONT_MONO}' font-size="8.5" font-weight="700" fill="${t.accentFg}">SIDE A · C-60</text>
  <rect x="${artX + 11}" y="${cy + 23}" width="72" height="20" fill="${t.patternBg}" stroke="${t.borderSoft}" stroke-width="0.9"/>
  <g class="spin-${uid}" style="transform-origin:${r1x}px ${ry}px">
    <circle cx="${r1x}" cy="${ry}" r="7.5" fill="${t.bg}" stroke="${t.ink}" stroke-width="1.2"/>
    <line x1="${r1x - 5}" y1="${ry}" x2="${r1x + 5}" y2="${ry}" stroke="${t.ink}" stroke-width="1.1"/>
    <line x1="${r1x}" y1="${ry - 5}" x2="${r1x}" y2="${ry + 5}" stroke="${t.ink}" stroke-width="1.1"/>
  </g>
  <g class="spin-${uid}" style="transform-origin:${r2x}px ${ry}px">
    <circle cx="${r2x}" cy="${ry}" r="7.5" fill="${t.bg}" stroke="${t.ink}" stroke-width="1.2"/>
    <line x1="${r2x - 5}" y1="${ry}" x2="${r2x + 5}" y2="${ry}" stroke="${t.ink}" stroke-width="1.1"/>
    <line x1="${r2x}" y1="${ry - 5}" x2="${r2x}" y2="${ry + 5}" stroke="${t.ink}" stroke-width="1.1"/>
  </g>
  <rect x="${artX + 38}" y="${cy + 29}" width="18" height="8" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="0.8"/>
  <polygon points="${artX + 16},${cy + 66} ${artX + 24},${cy + 53} ${artX + 70},${cy + 53} ${artX + 78},${cy + 66}" fill="${t.patternBg}" stroke="${t.borderSoft}" stroke-width="0.9"/>`;
  }

  const sidePanelW = w >= 846 ? 198 : 168;
  const infoX = artX + (cfg.media === "vinyl" ? 104 : 110);
  const rightLimit = hasSidePanel ? w - sidePanelW - 18 : w - frame.padX;
  const infoW = rightLimit - infoX;
  const headFont = themeHeadingFont(opts.themeId);
  const safeNote = escapeXml(fitText(cfg.note || "ON REPEAT · SIDE A", infoW - 44, 9.5, true));
  const safeTrack = escapeXml(
    fitText(cfg.track || "Midnight Compiler", infoW, 17, opts.themeId === "crt-terminal")
  );
  const safeArtist = escapeXml(
    fitText(cfg.artist || "Lo-Fi Build Pipeline", infoW, 12, opts.themeId === "crt-terminal")
  );

  const eqBaseX = rightLimit - 28;
  const eqBaseY = artY + 18;
  const eqHeights = [12, 7, 15, 9, 13];
  const eqBars = eqHeights
    .map((bh, i) => {
      const x = eqBaseX + i * 6;
      return `<rect class="eq-${uid}-${i}" x="${x}" y="${eqBaseY - bh}" width="3.5" height="${bh}" fill="${i % 2 === 0 ? t.accent : t.secondary}" shape-rendering="crispEdges"/>`;
    })
    .join("");

  const totalSec = 228;
  const curSec = Math.round((totalSec * pct) / 100);
  const fmtTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const barY = artY + 70;
  const barW = infoW;
  const fillW = Math.max(4, Math.round((barW * pct) / 100));

  const sideX = w - sidePanelW + 14;
  const sidePanel = hasSidePanel
    ? `
  <line x1="${w - sidePanelW}" y1="${frame.contentTop + 4}" x2="${w - sidePanelW}" y2="${frame.contentBottom - 4}" stroke="${t.borderSoft}" stroke-width="1"/>
  <text x="${sideX}" y="${artY + 14}" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="0.8" fill="${t.muted}">DECK SPEC</text>
  <text x="${sideX}" y="${artY + 38}" font-family='${FONT_MONO}' font-size="10" fill="${t.sub}">MEDIUM</text>
  <text x="${w - frame.padX}" y="${artY + 38}" text-anchor="end" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.ink}">${cfg.media === "vinyl" ? "VINYL" : "TAPE"}</text>
  <line x1="${sideX}" y1="${artY + 48}" x2="${w - frame.padX}" y2="${artY + 48}" stroke="${t.borderSoft}" stroke-width="0.8"/>
  <text x="${sideX}" y="${artY + 64}" font-family='${FONT_MONO}' font-size="10" fill="${t.sub}">OUTPUT</text>
  <text x="${w - frame.padX}" y="${artY + 64}" text-anchor="end" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.accent}">HI-FI</text>
  <line x1="${sideX}" y1="${artY + 74}" x2="${w - frame.padX}" y2="${artY + 74}" stroke="${t.borderSoft}" stroke-width="0.8"/>
  <text x="${sideX}" y="${artY + 90}" font-family='${FONT_MONO}' font-size="10" fill="${t.sub}">LOOP</text>
  <text x="${w - frame.padX}" y="${artY + 90}" text-anchor="end" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.tertiary}">ACTIVE</text>`
    : "";

  const styleBlock = opts.animated
    ? `
  <style>
    @keyframes spin_${uid} { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes eq_${uid} { 0%, 100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }
    .spin-${uid} { animation: spin_${uid} ${cfg.media === "vinyl" ? "14s" : "7s"} linear infinite; }
    ${eqHeights
      .map(
        (_, i) =>
          `.eq-${uid}-${i} { transform-origin: ${eqBaseX + i * 6 + 1.75}px ${eqBaseY}px; animation: eq_${uid} ${(1.1 + i * 0.22).toFixed(2)}s ease-in-out infinite; }`
      )
      .join("\n    ")}
    @media (prefers-reduced-motion: reduce) {
      .spin-${uid}, ${eqHeights.map((_, i) => `.eq-${uid}-${i}`).join(", ")} { animation: none !important; }
    }
  </style>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Now Playing: ${safeTrack} by ${safeArtist}">
  <title>Now Playing — ${safeTrack}</title>${frame.defs ? `\n  <defs>${frame.defs}\n  </defs>` : ""}${styleBlock}
  ${frame.chrome}
  ${artSvg}
  <text x="${infoX}" y="${artY + 14}" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="0.7" fill="${t.accent}">${safeNote}</text>
  ${eqBars}
  <text x="${infoX}" y="${artY + 39}" font-family='${headFont}' font-size="17" font-weight="700" fill="${t.ink}">${safeTrack}</text>
  <text x="${infoX}" y="${artY + 57}" font-family='${opts.themeId === "crt-terminal" ? FONT_MONO : FONT_SANS}' font-size="12" fill="${t.sub}">${safeArtist}</text>
  <rect x="${infoX}" y="${barY}" width="${barW}" height="6" fill="${t.borderSoft}"/>
  <rect x="${infoX}" y="${barY}" width="${fillW}" height="6" fill="${t.accent}"/>
  <rect x="${infoX + Math.min(barW - 3, fillW - 1)}" y="${barY - 2}" width="3" height="10" fill="${t.ink}"/>
  <text x="${infoX}" y="${barY + 20}" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${fmtTime(curSec)}</text>
  <text x="${rightLimit}" y="${barY + 20}" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${fmtTime(totalSec)}</text>
  ${sidePanel}
</svg>`;
}

function renderDevBadge(cfg: DevBadgeConfig, opts: WidgetRenderOptions): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = colSpanToPx(opts.colSpan);
  const h = opts.targetHeight ?? BENTO_ROW_HEIGHT;
  const uid = makeUid("badge", opts);
  const hasSidePanel = w >= 632;

  const statusMeta: Record<DevBadgeConfig["status"], { label: string; color: string }> = {
    shipping: { label: "SHIPPING", color: t.tertiary },
    open: { label: "OPEN TO OSS", color: t.accent },
    focus: { label: "DEEP FOCUS", color: t.highlight },
    hiring: { label: "COLLAB OPEN", color: t.secondary },
  };
  const st = statusMeta[cfg.status] ?? statusMeta.shipping;
  const meterVal = Math.max(0, Math.min(100, Math.round(cfg.meterValue || 0)));

  const frame = renderThemeFrame({
    uid,
    themeId: opts.themeId,
    mode: opts.mode,
    tokens: t,
    width: w,
    height: h,
    tag: "DEV PASS",
    rightMeta: st.label,
  });

  const leftX = frame.padX;
  const sidePanelW = w >= 846 ? 226 : 186;
  const mainRight = hasSidePanel ? w - sidePanelW - 18 : w - frame.padX;
  const mainW = mainRight - leftX;
  const topY = frame.contentTop + 14;
  const headFont = themeHeadingFont(opts.themeId);

  const pillW = Math.round(estimateTextPx(st.label, 9, true) + 22);
  const pillX = mainRight - pillW;

  const safeHandle = escapeXml(
    fitText(cfg.handle || "@your-handle", mainW - pillW - 12, 18, opts.themeId === "crt-terminal")
  );
  const safeRole = escapeXml(
    fitText(cfg.role || "Systems & Design Engineer", mainW, 12, opts.themeId === "crt-terminal")
  );
  const safeFocus = escapeXml(
    fitText(cfg.focus || "Building local-first AI tools", mainW - 46, 11.5, opts.themeId === "crt-terminal")
  );
  const safeLoc = escapeXml(fitText(cfg.location || "UTC+8 · Shanghai", mainW - 140, 10, true));
  const safeMeterLabel = escapeXml(fitText(cfg.meterLabel || "FOCUS", 74, 9.5, true));

  const segCount = 10;
  const litSegs = Math.round((meterVal / 100) * segCount);
  const segX0 = mainRight - segCount * 8;
  const segY = topY + 75;
  const segments = Array.from({ length: segCount }, (_, i) => {
    const filled = i < litSegs;
    return `<rect x="${segX0 + i * 8}" y="${segY}" width="6" height="9" fill="${filled ? t.accent : t.borderSoft}" shape-rendering="crispEdges"/>`;
  }).join("");

  const sideX = w - sidePanelW + 14;
  const barBoxW = sidePanelW - 34;
  const barCount = Math.floor((barBoxW - 12) / 7);
  const rightPanel = hasSidePanel
    ? `
  <line x1="${w - sidePanelW}" y1="${frame.contentTop + 4}" x2="${w - sidePanelW}" y2="${frame.contentBottom - 4}" stroke="${t.borderSoft}" stroke-width="1"/>
  <text x="${sideX}" y="${topY + 2}" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="0.8" fill="${t.muted}">CLEARANCE · 2026</text>
  <rect x="${sideX}" y="${topY + 12}" width="${barBoxW}" height="38" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  ${Array.from({ length: barCount }, (_, i) => {
    const bw = (i * 7 + 3) % 3 === 0 ? 4 : i % 2 === 0 ? 2 : 1.5;
    const bx = sideX + 7 + i * 7;
    return `<rect x="${bx}" y="${topY + 18}" width="${bw}" height="20" fill="${i % 7 === 0 ? t.accent : t.ink}" fill-opacity="${i % 7 === 0 ? "1" : "0.78"}"/>`;
  }).join("")}
  <text x="${sideX}" y="${topY + 70}" font-family='${FONT_MONO}' font-size="10" fill="${t.sub}">${safeMeterLabel}</text>
  <text x="${sideX + barBoxW}" y="${topY + 70}" text-anchor="end" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.accent}">${meterVal}%</text>
  <rect x="${sideX}" y="${topY + 78}" width="${barBoxW}" height="7" fill="${t.borderSoft}"/>
  <rect x="${sideX}" y="${topY + 78}" width="${Math.round((barBoxW * meterVal) / 100)}" height="7" fill="${t.accent}"/>`
    : "";

  const styleBlock = opts.animated
    ? `
  <style>
    @keyframes pulse_${uid} { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
    .dot-${uid} { animation: pulse_${uid} 2.2s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) { .dot-${uid} { animation: none !important; } }
  </style>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeHandle} — ${safeRole}">
  <title>${safeHandle} — Dev Status Badge</title>${frame.defs ? `\n  <defs>${frame.defs}\n  </defs>` : ""}${styleBlock}
  ${frame.chrome}
  <text x="${leftX}" y="${topY + 6}" font-family='${headFont}' font-size="18" font-weight="700" fill="${t.ink}">${safeHandle}</text>
  <rect x="${pillX}" y="${topY - 9}" width="${pillW}" height="19" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <circle class="dot-${uid}" cx="${pillX + 9}" cy="${topY + 0.5}" r="3" fill="${st.color}"/>
  <text x="${pillX + 16}" y="${topY + 4}" font-family='${FONT_MONO}' font-size="9" font-weight="700" fill="${t.ink}">${escapeXml(st.label)}</text>
  <text x="${leftX}" y="${topY + 26}" font-family='${opts.themeId === "crt-terminal" ? FONT_MONO : FONT_SANS}' font-size="12" fill="${t.sub}">${safeRole}</text>
  <line x1="${leftX}" y1="${topY + 37}" x2="${mainRight}" y2="${topY + 37}" stroke="${t.borderSoft}" stroke-width="0.9"/>
  <rect x="${leftX}" y="${topY + 46}" width="34" height="16" fill="${t.accent}"/>
  <text x="${leftX + 17}" y="${topY + 57.5}" text-anchor="middle" font-family='${FONT_MONO}' font-size="9" font-weight="700" fill="${t.accentFg}">NOW</text>
  <text x="${leftX + 42}" y="${topY + 58}" font-family='${opts.themeId === "crt-terminal" ? FONT_MONO : FONT_SANS}' font-size="11.5" font-weight="600" fill="${t.ink}">${safeFocus}</text>
  <text x="${leftX}" y="${topY + 83}" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">${safeLoc}</text>
  ${!hasSidePanel ? `<text x="${segX0 - 6}" y="${topY + 83}" text-anchor="end" font-family='${FONT_MONO}' font-size="9" fill="${t.muted}">${safeMeterLabel}</text>${segments}` : `<text x="${mainRight}" y="${topY + 83}" text-anchor="end" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">STATUS: ONLINE</text>`}
  ${rightPanel}
</svg>`;
}

function renderSkillDock(cfg: SkillDockConfig, opts: WidgetRenderOptions): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = colSpanToPx(opts.colSpan);
  const uid = makeUid("skills", opts);

  const items = cfg.skills
    .split(/[,，/\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 18);
  const list = items.length ? items : ["Rust", "TypeScript", "Python", "React", "Docker"];

  const padX = opts.themeId === "blueprint-cad" ? 20 : opts.themeId === "editorial-zine" ? 18 : 16;
  const contentTop = opts.themeId === "editorial-zine" ? 43 : opts.themeId === "blueprint-cad" ? 42 : 36;
  const maxX = w - padX;
  const chipH = 25;
  const gapX = 7;
  const gapY = 7;
  const forcedH = opts.targetHeight;
  const maxBottomY = forcedH ? forcedH - 16 : Number.POSITIVE_INFINITY;

  interface PlacedChip {
    label: string;
    x: number;
    y: number;
    w: number;
    color: string;
  }

  const dotColors = [t.accent, t.secondary, t.tertiary, t.highlight];
  const placed: PlacedChip[] = [];
  let cx = padX;
  let cy = contentTop + 32;
  let overflowCount = 0;

  for (let idx = 0; idx < list.length; idx++) {
    const rawLabel = list[idx];
    const maxChipLabelPx = w <= 418 ? 105 : 148;
    const label = fitText(rawLabel, maxChipLabelPx, 11, true);
    const chipW = Math.max(
      56,
      Math.round(estimateTextPx(label, 11, true) + (opts.themeId === "crt-terminal" ? 22 : 26))
    );
    if (cx + chipW > maxX && cx > padX) {
      cx = padX;
      cy += chipH + gapY;
    }
    if (cy + chipH > maxBottomY) {
      overflowCount = list.length - idx;
      break;
    }
    placed.push({
      label,
      x: cx,
      y: cy,
      w: Math.min(chipW, maxX - padX),
      color: dotColors[idx % dotColors.length],
    });
    cx += chipW + gapX;
  }

  if (overflowCount > 0 && placed.length > 0) {
    const last = placed[placed.length - 1];
    last.label = `+${overflowCount + 1} more`;
    last.w = Math.max(66, Math.round(estimateTextPx(last.label, 10.5, true) + 22));
  }

  const h = forcedH ?? Math.max(BENTO_ROW_HEIGHT, cy + chipH + 22);
  const frame = renderThemeFrame({
    uid,
    themeId: opts.themeId,
    mode: opts.mode,
    tokens: t,
    width: w,
    height: h,
    tag: "SKILL DOCK",
    rightMeta: `${String(list.length).padStart(2, "0")} MODULES`,
  });

  const headFont = themeHeadingFont(opts.themeId);
  const safeTitle = escapeXml(
    fitText(cfg.title || "Core Stack & Toolchain", w - padX * 2 - 115, 15.5, opts.themeId === "crt-terminal")
  );
  const safeSub = escapeXml(fitText(cfg.subtitle || "DAILY DRIVERS", 110, 9.5, true));

  const chipsSvg = placed
    .map((chip) => {
      const safe = escapeXml(chip.label);
      if (opts.themeId === "blueprint-cad") {
        return `<g>
    <polygon points="${chamferPolygon(chip.x, chip.y, chip.w, chipH, 5)}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
    <rect x="${chip.x + 8}" y="${chip.y + 10}" width="5" height="5" fill="${chip.color}" shape-rendering="crispEdges"/>
    <text x="${chip.x + 18}" y="${chip.y + 16}" font-family='${FONT_MONO}' font-size="10.5" font-weight="600" fill="${t.ink}">${safe}</text>
  </g>`;
      }
      if (opts.themeId === "editorial-zine") {
        return `<g>
    <rect x="${chip.x}" y="${chip.y}" width="${chip.w}" height="${chipH}" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
    <rect x="${chip.x}" y="${chip.y}" width="${chip.w}" height="2.2" fill="${chip.color}"/>
    <text x="${chip.x + chip.w / 2}" y="${chip.y + 16.5}" text-anchor="middle" font-family='${FONT_MONO}' font-size="10.5" font-weight="600" fill="${t.ink}">${safe}</text>
  </g>`;
      }
      if (opts.themeId === "crt-terminal") {
        return `<g>
    <rect x="${chip.x}" y="${chip.y}" width="${chip.w}" height="${chipH}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
    <text x="${chip.x + 8}" y="${chip.y + 16}" font-family='${FONT_MONO}' font-size="10.5" font-weight="700" fill="${chip.color}">$</text>
    <text x="${chip.x + 18}" y="${chip.y + 16}" font-family='${FONT_MONO}' font-size="10.5" fill="${t.ink}">${safe}</text>
  </g>`;
      }
      return `<g>
    <rect x="${chip.x}" y="${chip.y}" width="${chip.w}" height="${chipH}" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
    <rect x="${chip.x + 8}" y="${chip.y + 9.5}" width="6" height="6" fill="${chip.color}" shape-rendering="crispEdges"/>
    <text x="${chip.x + 20}" y="${chip.y + 16.5}" font-family='${FONT_MONO}' font-size="10.5" font-weight="600" fill="${t.ink}">${safe}</text>
  </g>`;
    })
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <title>${safeTitle}</title>${frame.defs ? `\n  <defs>${frame.defs}\n  </defs>` : ""}
  ${frame.chrome}
  <text x="${padX}" y="${contentTop + 17}" font-family='${headFont}' font-size="15.5" font-weight="700" fill="${t.ink}">${safeTitle}</text>
  <text x="${w - padX}" y="${contentTop + 17}" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" letter-spacing="0.8" fill="${t.muted}">${safeSub}</text>
  ${chipsSvg}
</svg>`;
}

function renderQuoteBanner(cfg: QuoteBannerConfig, opts: WidgetRenderOptions): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = colSpanToPx(opts.colSpan);
  const h = opts.targetHeight ?? (opts.inBentoRow ? BENTO_ROW_HEIGHT : 122);
  const uid = makeUid("quote", opts);

  const frame = renderThemeFrame({
    uid,
    themeId: opts.themeId,
    mode: opts.mode,
    tokens: t,
    width: w,
    height: h,
    tag: cfg.tag || "MANIFESTO",
    rightMeta: opts.themeId === "crt-terminal" ? "$ fortune --short" : "NOTE // 01",
  });

  const leftX = frame.padX;
  const bodyX = leftX + (opts.themeId === "swiss-bauhaus-pixel" ? 26 : 18);
  const maxQuoteW = w - bodyX - frame.padX - 18;
  const isMono = opts.themeId === "crt-terminal";
  const quoteFont =
    opts.themeId === "editorial-zine"
      ? FONT_SERIF
      : opts.themeId === "crt-terminal"
        ? FONT_MONO
        : FONT_SANS;
  const quoteSize = w <= 418 ? 13 : opts.themeId === "editorial-zine" ? 16.5 : 15;
  const maxLines = h >= 150 ? 3 : 2;
  const lines = wrapText(
    cfg.quote || "Make it crisp, deterministic, and worth starring.",
    maxQuoteW,
    quoteSize,
    maxLines,
    isMono
  );
  const safeAuthor = escapeXml(fitText(cfg.author || "FIELD NOTE · 2026", maxQuoteW, 10, true));

  const barH = h - frame.contentTop - 24;
  const accentDecor =
    opts.themeId === "swiss-bauhaus-pixel"
      ? `${bauhausWeave(leftX, frame.contentTop + 8, 14, barH, t.patternBg, t.patternFg, 6)}<rect x="${leftX}" y="${frame.contentTop + 8}" width="14" height="${barH}" fill="none" stroke="${t.border}" stroke-width="1"/>`
      : `<rect x="${leftX}" y="${frame.contentTop + 10}" width="4" height="${barH - 4}" fill="${t.accent}"/>`;

  const lineStartY = frame.contentTop + (h >= 150 ? 34 : lines.length === 1 ? 35 : 27);
  const lastLine = lines[lines.length - 1] ?? "";
  const cursorX =
    bodyX + Math.min(maxQuoteW - 10, Math.round(estimateTextPx(lastLine, quoteSize, isMono) + 6));
  const cursorY = lineStartY + (lines.length - 1) * 21 - 12;

  const styleBlock = opts.animated
    ? `
  <style>
    @keyframes blink_${uid} { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.15; } }
    .cur-${uid} { animation: blink_${uid} 1.4s steps(1, end) infinite; }
    @media (prefers-reduced-motion: reduce) { .cur-${uid} { animation: none !important; } }
  </style>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(cfg.quote)}">
  <title>${escapeXml(cfg.tag || "Quote Banner")}</title>${frame.defs ? `\n  <defs>${frame.defs}\n  </defs>` : ""}${styleBlock}
  ${frame.chrome}
  ${accentDecor}
  ${lines
    .map(
      (line, idx) =>
        `<text x="${bodyX}" y="${lineStartY + idx * 21}" font-family='${quoteFont}' font-size="${quoteSize}" font-weight="${opts.themeId === "editorial-zine" ? "400" : "700"}"${opts.themeId === "editorial-zine" ? ' font-style="italic"' : ""} fill="${t.ink}">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  ${opts.themeId === "crt-terminal" ? `<rect class="cur-${uid}" x="${cursorX}" y="${cursorY}" width="8" height="14" fill="${t.accent}"/>` : ""}
  <text x="${bodyX}" y="${h - 19}" font-family='${FONT_MONO}' font-size="10" letter-spacing="0.6" fill="${t.muted}">— ${safeAuthor}</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// W06: Hero Corner Sticker / Peeker Charm (132x92 standalone/overlay, or 204x160 in Bento row)
// ---------------------------------------------------------------------------
function renderHeroStickerCore(
  cfg: HeroStickerConfig,
  opts: WidgetRenderOptions,
  uid: string
): { innerSvg: string; styleCss: string; safeLabel: string } {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = 132;
  const h = 92;
  const safeLabel = escapeXml(fitText((cfg.label || "SHIPPING").toUpperCase(), 108, 9.5, true));
  const safeSub = escapeXml(fitText(cfg.sublabel || "LIVE · 2026", 108, 8.5, true));

  let shell = "";
  if (opts.themeId === "blueprint-cad") {
    shell = `
  <polygon points="${chamferPolygon(1, 1, w - 2, h - 2, 8)}" fill="${t.surface}" fill-opacity="0.96" stroke="${t.border}" stroke-width="1.2"/>
  <polygon points="${chamferPolygon(4, 4, w - 8, h - 8, 6)}" fill="none" stroke="${t.borderSoft}" stroke-dasharray="2 2" stroke-width="0.7"/>`;
  } else if (opts.themeId === "editorial-zine") {
    shell = `
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="${t.surface}" stroke="${t.border}" stroke-width="1.1"/>
  <rect x="4" y="4" width="${w - 8}" height="2" fill="${t.accent}"/>`;
  } else if (opts.themeId === "crt-terminal") {
    shell = `
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="${t.surface}" stroke="${t.border}" stroke-width="1.2"/>
  <rect x="2" y="2" width="${w - 4}" height="12" fill="${t.patternBg}"/>
  <circle cx="9" cy="8" r="2" fill="${t.highlight}"/>
  <circle cx="16" cy="8" r="2" fill="${t.accent}"/>
  <text x="${w - 7}" y="10.5" text-anchor="end" font-family='${FONT_MONO}' font-size="7.2" fill="${t.muted}">CHARM</text>`;
  } else {
    shell = `
  <rect x="4" y="4" width="${w - 4}" height="${h - 4}" fill="${t.border}"/>
  <rect x="1" y="1" width="${w - 5}" height="${h - 5}" fill="${t.surface}" stroke="${t.border}" stroke-width="1.2"/>`;
  }

  let body = "";
  let animCss = "";

  if (cfg.motif === "peeker") {
    const pal = {
      O: "#F59E0B",
      B: "#FDE68A",
      K: "#111214",
      W: "#FFFFFF",
      P: "#FB7185",
    };
    const open = gridToPaths(PEEKER_CAT_OPEN, pal, 38, 16, 4);
    const blink = gridToPaths(PEEKER_CAT_BLINK, pal, 38, 16, 4);
    body = `
  <g class="stkbob-${uid}">
    <g class="stka-${uid}">${open}</g>
    ${opts.animated ? `<g class="stkb-${uid}">${blink}</g>` : ""}
  </g>
  <rect x="10" y="51" width="${w - 20}" height="2" fill="${t.border}"/>
  <rect x="10" y="57" width="${w - 20}" height="16" fill="${t.accent}"/>
  <text x="${w / 2}" y="68" text-anchor="middle" font-family='${FONT_MONO}' font-size="9" font-weight="700" letter-spacing="0.6" fill="${t.accentFg}">${safeLabel}</text>
  <text x="${w / 2}" y="82.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="8" fill="${t.muted}">${safeSub}</text>`;
    animCss = `
    @keyframes stka_${uid} { 0%, 82%, 100% { opacity: 1; } 83%, 99% { opacity: 0; } }
    @keyframes stkb_${uid} { 0%, 82%, 100% { opacity: 0; } 83%, 99% { opacity: 1; } }
    @keyframes stkbob_${uid} { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-2px); } }
    .stka-${uid} { animation: stka_${uid} 3.8s steps(1, end) infinite; }
    .stkb-${uid} { opacity: 0; animation: stkb_${uid} 3.8s steps(1, end) infinite; }
    .stkbob-${uid} { animation: stkbob_${uid} 2.8s ease-in-out infinite; }`;
  } else if (cfg.motif === "stamp") {
    const cx = 66;
    const cy = 44;
    const ticks = Array.from({ length: 16 }, (_, i) => {
      const ang = (i * 22.5 * Math.PI) / 180;
      const r1 = i % 4 === 0 ? 19 : 22;
      const r2 = 25;
      return `<line x1="${(cx + Math.cos(ang) * r1).toFixed(1)}" y1="${(cy + Math.sin(ang) * r1).toFixed(1)}" x2="${(cx + Math.cos(ang) * r2).toFixed(1)}" y2="${(cy + Math.sin(ang) * r2).toFixed(1)}" stroke="${i % 4 === 0 ? t.accent : t.border}" stroke-width="${i % 4 === 0 ? "1.6" : "0.9"}"/>`;
    }).join("");
    const ribbonW = 92;
    const ribbonX = cx - ribbonW / 2;
    body = `
  <g class="stkrot-${uid}" style="transform-origin:${cx}px ${cy}px">
    <circle cx="${cx}" cy="${cy}" r="25" fill="none" stroke="${t.border}" stroke-dasharray="3 2" stroke-width="1"/>
    ${ticks}
    <circle cx="${cx}" cy="${cy - 19}" r="2.2" fill="${t.accent}"/>
  </g>
  <rect x="${ribbonX}" y="${cy - 8.5}" width="${ribbonW}" height="17" fill="${t.accent}" stroke="${t.surface}" stroke-width="1.2"/>
  <text x="${cx}" y="${cy + 3.2}" text-anchor="middle" font-family='${FONT_MONO}' font-size="8.6" font-weight="700" letter-spacing="0.6" fill="${t.accentFg}">${escapeXml(fitText((cfg.label || "SHIPPING").toUpperCase(), ribbonW - 10, 8.6, true))}</text>
  <text x="${w / 2}" y="82.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="8" font-weight="700" letter-spacing="0.5" fill="${t.muted}">${safeSub}</text>`;
    animCss = `
    @keyframes stkrot_${uid} { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .stkrot-${uid} { animation: stkrot_${uid} 18s linear infinite; }`;
  } else if (cfg.motif === "coffee") {
    const mugPal = {
      C: t.ink,
      B: t.highlight,
      W: t.bg,
      A: t.accent,
    };
    const mug = gridToPaths(PIXEL_MUG, mugPal, 42, 23, 4);
    body = `
  <g fill="${t.accent}" shape-rendering="crispEdges">
    <rect class="stm1-${uid}" x="52" y="18" width="3" height="7"/>
    <rect class="stm2-${uid}" x="60" y="15" width="3" height="9"/>
    <rect class="stm3-${uid}" x="68" y="18" width="3" height="7"/>
  </g>
  ${mug}
  <text x="${w / 2}" y="71" text-anchor="middle" font-family='${FONT_MONO}' font-size="9" font-weight="700" fill="${t.ink}">${safeLabel}</text>
  <text x="${w / 2}" y="82.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="8" fill="${t.muted}">${safeSub}</text>`;
    animCss = `
    @keyframes stm_${uid} { 0% { transform: translateY(3px); opacity: 0; } 40% { opacity: 0.9; } 100% { transform: translateY(-7px); opacity: 0; } }
    .stm1-${uid} { animation: stm_${uid} 2.2s ease-out infinite; }
    .stm2-${uid} { animation: stm_${uid} 2.2s ease-out 0.7s infinite; }
    .stm3-${uid} { animation: stm_${uid} 2.2s ease-out 1.4s infinite; }`;
  } else {
    const cx = 66;
    const cy = 44;
    body = `
  <circle cx="${cx}" cy="${cy}" r="22" fill="${t.patternBg}" stroke="${t.border}" stroke-width="1"/>
  <circle cx="${cx}" cy="${cy}" r="14" fill="none" stroke="${t.borderSoft}" stroke-width="0.8"/>
  <circle cx="${cx}" cy="${cy}" r="6" fill="none" stroke="${t.borderSoft}" stroke-width="0.8"/>
  <line x1="${cx - 22}" y1="${cy}" x2="${cx + 22}" y2="${cy}" stroke="${t.borderSoft}" stroke-width="0.7"/>
  <line x1="${cx}" y1="${cy - 22}" x2="${cx}" y2="${cy + 22}" stroke="${t.borderSoft}" stroke-width="0.7"/>
  <g class="stksw-${uid}" style="transform-origin:${cx}px ${cy}px">
    <path d="M ${cx} ${cy} L ${cx} ${cy - 21} A 21 21 0 0 1 ${cx + 16} ${cy - 13} Z" fill="${t.accent}" fill-opacity="0.32"/>
    <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 21}" stroke="${t.accent}" stroke-width="1.5"/>
  </g>
  <circle class="stkblp-${uid}" cx="${cx + 9}" cy="${cy - 8}" r="2.4" fill="${t.tertiary}"/>
  <circle cx="${cx}" cy="${cy}" r="2.2" fill="${t.ink}"/>
  <text x="${w / 2}" y="81.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="8.6" font-weight="700" letter-spacing="0.5" fill="${t.ink}">${safeLabel}</text>`;
    animCss = `
    @keyframes stksw_${uid} { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes stkblp_${uid} { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
    .stksw-${uid} { animation: stksw_${uid} 5.5s linear infinite; }
    .stkblp-${uid} { animation: stkblp_${uid} 1.8s ease-in-out infinite; }`;
  }

  return {
    innerSvg: `${shell}\n${body}`,
    styleCss: opts.animated
      ? `${animCss}
    @media (prefers-reduced-motion: reduce) {
      .stka-${uid}, .stkb-${uid}, .stkbob-${uid}, .stkrot-${uid}, .stm1-${uid}, .stm2-${uid}, .stm3-${uid}, .stksw-${uid}, .stkblp-${uid} { animation: none !important; }
    }`
      : "",
    safeLabel,
  };
}

function renderHeroSticker(cfg: HeroStickerConfig, opts: WidgetRenderOptions): string {
  const uid = makeUid("stk", opts);
  const core = renderHeroStickerCore(cfg, opts, uid);

  // If placed inside a 1-col Bento row (204x160), wrap neatly inside a matching Bento frame!
  if (opts.inBentoRow) {
    const t = resolveTokens(opts.tokens, opts.accentOverride);
    const w = colSpanToPx(opts.colSpan);
    const h = opts.targetHeight ?? BENTO_ROW_HEIGHT;
    const frame = renderThemeFrame({
      uid: `bf-${uid}`,
      themeId: opts.themeId,
      mode: opts.mode,
      tokens: t,
      width: w,
      height: h,
      tag: "CHARM",
      rightMeta: cfg.motif.toUpperCase(),
    });
    const tx = Math.round((w - 132) / 2);
    const ty = Math.round(frame.contentTop + (h - frame.contentTop - 12 - 92) / 2);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${core.safeLabel} — GitSkins Charm">
  <title>${core.safeLabel} — Charm</title>${frame.defs ? `\n  <defs>${frame.defs}\n  </defs>` : ""}${core.styleCss ? `\n  <style>${core.styleCss}\n  </style>` : ""}
  ${frame.chrome}
  <g transform="translate(${tx}, ${ty})">
    ${core.innerSvg}
  </g>
</svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="132" height="92" viewBox="0 0 132 92" role="img" aria-label="${core.safeLabel} — GitSkins Sticker Charm">
  <title>${core.safeLabel} — Sticker Charm</title>${core.styleCss ? `\n  <style>${core.styleCss}\n  </style>` : ""}
  ${core.innerSvg}
</svg>`;
}

// ---------------------------------------------------------------------------
// W07: Pixel Patrol Runway / Marquee Ticker / EKG Wave Strip (846x48)
// ---------------------------------------------------------------------------
function renderPixelRunway(cfg: PixelRunwayConfig, opts: WidgetRenderOptions): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = 846;
  const h = 48;
  const uid = makeUid("rwy", opts);
  const safeTag = escapeXml(fitText((cfg.tag || cfg.mode).toUpperCase(), 76, 9.5, true));
  const speedSec = cfg.speed === "brisk" ? 10 : cfg.speed === "calm" ? 24 : 16;

  const tagBoxW = Math.max(76, Math.round(estimateTextPx(safeTag, 9.5, true) + 24));
  const trackLeft = tagBoxW + 14;
  const trackRight = w - 16;
  const trackW = trackRight - trackLeft;

  let defs = "";
  let bgChrome = "";
  if (opts.themeId === "blueprint-cad") {
    defs += `
    <pattern id="rgrid-${uid}" width="12" height="12" patternUnits="userSpaceOnUse">
      <path d="M 12 0 L 0 0 0 12" fill="none" stroke="${t.borderSoft}" stroke-opacity="0.55" stroke-width="0.6"/>
    </pattern>`;
    bgChrome = `
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1.1"/>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="url(#rgrid-${uid})"/>
  <polygon points="${chamferPolygon(8, 10, tagBoxW, 28, 5)}" fill="${t.accent}"/>
  <text x="${8 + tagBoxW / 2}" y="27.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="0.7" fill="${t.accentFg}">${safeTag}</text>`;
  } else if (opts.themeId === "editorial-zine") {
    bgChrome = `
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="12" y="5" width="${w - 24}" height="1.8" fill="${t.border}"/>
  <line x1="12" y1="42.5" x2="${w - 12}" y2="42.5" stroke="${t.borderSoft}" stroke-width="0.8"/>
  <rect x="12" y="19" width="6" height="6" fill="${t.accent}"/>
  <text x="24" y="26.5" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="1.1" fill="${t.accent}">${safeTag}</text>
  <line x1="${tagBoxW + 6}" y1="12" x2="${tagBoxW + 6}" y2="36" stroke="${t.borderSoft}" stroke-width="1"/>`;
  } else if (opts.themeId === "crt-terminal") {
    bgChrome = `
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <rect x="1" y="1" width="${tagBoxW + 4}" height="${h - 2}" fill="${t.patternBg}"/>
  <line x1="${tagBoxW + 5.5}" y1="1" x2="${tagBoxW + 5.5}" y2="${h - 1}" stroke="${t.border}" stroke-width="1"/>
  <circle cx="14" cy="24" r="3" fill="${t.accent}"/>
  <text x="23" y="27.5" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.ink}">${safeTag}</text>`;
  } else {
    bgChrome = `
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <rect x="0.5" y="0.5" width="${tagBoxW + 4}" height="${h - 1}" fill="${t.accent}" stroke="${t.border}" stroke-width="1"/>
  <text x="${(tagBoxW + 4) / 2}" y="27.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="0.6" fill="${t.accentFg}">${safeTag}</text>`;
  }

  let content = "";
  let animCss = "";

  if (cfg.mode === "patrol") {
    const spriteRows = RUNNER_SPRITES[cfg.runner] ?? RUNNER_SPRITES.cat;
    const pal = {
      O: "#F59E0B",
      K: "#111214",
      P: "#FB7185",
      A: t.accent,
      M: "#64748B",
      D: "#0F172A",
      W: "#FFFFFF",
    };
    const runnerG = gridToPaths(spriteRows, pal, trackLeft + 8, 12, 3);
    const captionZoneW = 186;
    const laneRight = trackRight - captionZoneW - 12;
    const laneW = Math.max(220, laneRight - trackLeft);
    const travelPx = Math.max(160, laneW - 48);
    const milestones = [0.22, 0.52, 0.82]
      .map((ratio, i) => {
        const mx = Math.round(trackLeft + laneW * ratio);
        return `<g shape-rendering="crispEdges">
        <rect x="${mx}" y="22" width="2" height="14" fill="${t.border}"/>
        <rect x="${mx + 2}" y="22" width="7" height="5" fill="${i === 1 ? t.accent : t.secondary}"/>
      </g>`;
      })
      .join("");
    const safeCaption = escapeXml(
      fitText(cfg.text || "PATROL MODE · ONLINE", captionZoneW - 12, 9.5, true)
    );
    defs += `<clipPath id="rclip-${uid}"><rect x="${trackLeft}" y="4" width="${laneW}" height="${h - 8}"/></clipPath>`;
    content = `
  <g clip-path="url(#rclip-${uid})">
    <line x1="${trackLeft}" y1="36.5" x2="${laneRight}" y2="36.5" stroke="${t.borderSoft}" stroke-dasharray="4 3" stroke-width="1.2"/>
    ${milestones}
    <g class="rwalk-${uid}">
      <g class="rhop-${uid}">${runnerG}</g>
    </g>
  </g>
  <line x1="${laneRight + 8}" y1="11" x2="${laneRight + 8}" y2="37" stroke="${t.borderSoft}" stroke-width="1"/>
  <text x="${trackRight - 2}" y="27.5" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${safeCaption}</text>`;
    animCss = `
    @keyframes rwalk_${uid} { 0%, 100% { transform: translateX(0px); } 50% { transform: translateX(${travelPx}px); } }
    @keyframes rhop_${uid} { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-3px); } }
    .rwalk-${uid} { animation: rwalk_${uid} ${speedSec}s ease-in-out infinite; }
    .rhop-${uid} { animation: rhop_${uid} 0.7s steps(2, end) infinite; }`;
  } else if (cfg.mode === "ticker") {
    const rawMsg = (
      cfg.text || "SHIPPING LOCAL-FIRST AI TOOLS · RUST · TYPESCRIPT · PYTHON · OPEN SOURCE"
    ).trim();
    const unitText = `${rawMsg}   ✦   `;
    const unitPx = Math.max(360, Math.round(estimateTextPx(unitText, 11.5, true) + 20));
    const safeUnit = escapeXml(unitText);
    defs += `<clipPath id="rclip-${uid}"><rect x="${trackLeft}" y="6" width="${trackW}" height="${h - 12}"/></clipPath>`;
    content = `
  <g clip-path="url(#rclip-${uid})">
    <g class="rtick-${uid}">
      <text x="${trackLeft}" y="28" font-family='${FONT_MONO}' font-size="11.5" font-weight="600" letter-spacing="0.5" fill="${t.ink}">${safeUnit}</text>
      <text x="${trackLeft + unitPx}" y="28" font-family='${FONT_MONO}' font-size="11.5" font-weight="600" letter-spacing="0.5" fill="${t.ink}">${safeUnit}</text>
      <text x="${trackLeft + unitPx * 2}" y="28" font-family='${FONT_MONO}' font-size="11.5" font-weight="600" letter-spacing="0.5" fill="${t.ink}">${safeUnit}</text>
    </g>
  </g>`;
    animCss = `
    @keyframes rtick_${uid} { from { transform: translateX(0px); } to { transform: translateX(-${unitPx}px); } }
    .rtick-${uid} { animation: rtick_${uid} ${speedSec}s linear infinite; }`;
  } else {
    const segs: string[] = [];
    const step = 44;
    let x = trackLeft;
    segs.push(`M ${x} 24`);
    while (x < trackRight - 140) {
      segs.push(
        `L ${x + 12} 24 L ${x + 17} 13 L ${x + 23} 35 L ${x + 29} 19 L ${x + 34} 24 L ${x + step} 24`
      );
      x += step;
    }
    const wavePath = segs.join(" ");
    const safeStat = escapeXml(fitText(cfg.text || "HEARTBEAT · 72 BPM", 132, 9.5, true));
    content = `
  <line x1="${trackLeft}" y1="24" x2="${trackRight - 136}" y2="24" stroke="${t.borderSoft}" stroke-dasharray="2 4" stroke-width="0.9"/>
  <path d="${wavePath}" fill="none" stroke="${t.borderSoft}" stroke-width="1.2"/>
  <path class="rwave-${uid}" d="${wavePath}" fill="none" stroke="${t.accent}" stroke-width="2" stroke-dasharray="70 120"/>
  <text x="${trackRight - 2}" y="27.5" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.ink}">${safeStat}</text>`;
    animCss = `
    @keyframes rwave_${uid} { from { stroke-dashoffset: 190; } to { stroke-dashoffset: 0; } }
    .rwave-${uid} { animation: rwave_${uid} ${(speedSec / 4).toFixed(1)}s linear infinite; }`;
  }

  const styleBlock = opts.animated
    ? `
  <style>${animCss}
    @media (prefers-reduced-motion: reduce) {
      .rwalk-${uid}, .rhop-${uid}, .rtick-${uid}, .rwave-${uid} { animation: none !important; }
    }
  </style>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTag} — GitSkins Runway Strip">
  <title>${safeTag} — Runway Strip</title>${defs ? `\n  <defs>${defs}\n  </defs>` : ""}${styleBlock}
  ${bgChrome}
  ${content}
</svg>`;
}

// ---------------------------------------------------------------------------
// W08: Mini Animated Bento Tile (204x160 in 1-col Bento or 418x160 in 2-col)
// Aligns top-to-bottom pixel-for-pixel with all 160px Bento cards!
// ---------------------------------------------------------------------------
function renderMiniTile(cfg: MiniTileConfig, opts: WidgetRenderOptions): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = colSpanToPx(opts.colSpan);
  const h = opts.targetHeight ?? BENTO_ROW_HEIGHT;
  const uid = makeUid("tile", opts);

  const sceneTag: Record<MiniTileConfig["scene"], { tag: string; meta: string }> = {
    coffee: { tag: "BREW", meta: "HOT" },
    weather: { tag: cfg.weather.toUpperCase(), meta: "SKY" },
    hourglass: { tag: "FOCUS", meta: "FLOW" },
    pulse: { tag: "SYNTH", meta: "HI-FI" },
  };

  const frame = renderThemeFrame({
    uid,
    themeId: opts.themeId,
    mode: opts.mode,
    tokens: t,
    width: w,
    height: h,
    tag: sceneTag[cfg.scene].tag,
    rightMeta: sceneTag[cfg.scene].meta,
  });

  const safeTitle = escapeXml(
    fitText(cfg.title || "Caffeine Loop", w - 28, 13, opts.themeId === "crt-terminal")
  );
  const safeSub = escapeXml(fitText(cfg.subtitle || "ACTIVE · 24/7", w - 28, 9, true));
  const headFont = themeHeadingFont(opts.themeId);

  const boxX = 14;
  const boxY = frame.contentTop + 3;
  const boxW = w - 28;
  const boxH = h - boxY - 40; // ~74px when h=160
  const cx = Math.round(w / 2);
  const midY = Math.round(boxY + boxH / 2);
  const clipId = `tclip-${uid}`;
  let sceneSvg = "";
  let animCss = "";

  if (cfg.scene === "coffee") {
    const mugPal = { C: t.ink, B: t.highlight, W: t.bg, A: t.accent };
    const mug = gridToPaths(PIXEL_MUG, mugPal, cx - 27, boxY + 22, 4.5);
    sceneSvg = `
  <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <g clip-path="url(#${clipId})">
    <g fill="${t.accent}" shape-rendering="crispEdges">
      <rect class="ts1-${uid}" x="${cx - 14}" y="${boxY + 13}" width="3" height="9"/>
      <rect class="ts2-${uid}" x="${cx - 2}" y="${boxY + 10}" width="3" height="11"/>
      <rect class="ts3-${uid}" x="${cx + 10}" y="${boxY + 13}" width="3" height="9"/>
    </g>
    ${mug}
    <line x1="${cx - 42}" y1="${boxY + boxH - 6}" x2="${cx + 42}" y2="${boxY + boxH - 6}" stroke="${t.border}" stroke-width="1.3"/>
  </g>`;
    animCss = `
    @keyframes ts_${uid} { 0% { transform: translateY(4px); opacity: 0; } 45% { opacity: 0.95; } 100% { transform: translateY(-8px); opacity: 0; } }
    .ts1-${uid} { animation: ts_${uid} 2.4s ease-out infinite; }
    .ts2-${uid} { animation: ts_${uid} 2.4s ease-out 0.8s infinite; }
    .ts3-${uid} { animation: ts_${uid} 2.4s ease-out 1.6s infinite; }`;
  } else if (cfg.scene === "weather") {
    let sky = "";
    if (cfg.weather === "sunny") {
      const rays = Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 * Math.PI) / 180;
        return `<line x1="${(cx + Math.cos(a) * 16).toFixed(1)}" y1="${(midY + Math.sin(a) * 16).toFixed(1)}" x2="${(cx + Math.cos(a) * 23).toFixed(1)}" y2="${(midY + Math.sin(a) * 23).toFixed(1)}" stroke="${t.highlight}" stroke-width="2.2"/>`;
      }).join("");
      sky = `
    <g class="tsun-${uid}" style="transform-origin:${cx}px ${midY}px">${rays}</g>
    <circle cx="${cx}" cy="${midY}" r="11.5" fill="${t.highlight}"/>
    <circle cx="${cx}" cy="${midY}" r="7" fill="${t.accent}" fill-opacity="0.35"/>`;
      animCss = `
    @keyframes tsun_${uid} { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .tsun-${uid} { animation: tsun_${uid} 20s linear infinite; }`;
    } else if (cfg.weather === "snow") {
      const cols = [-52, -30, -10, 12, 34, 54];
      const flakes = cols
        .map(
          (dx, i) =>
            `<rect class="tflk-${uid}-${i}" x="${cx + dx}" y="${boxY + 18 + (i % 2) * 8}" width="4" height="4" fill="${i % 2 === 0 ? t.ink : t.accent}" shape-rendering="crispEdges"/>`
        )
        .join("");
      sky = `
    <rect x="${cx - 42}" y="${boxY + 12}" width="84" height="14" fill="${t.borderSoft}"/>
    <rect x="${cx - 28}" y="${boxY + 6}" width="52" height="10" fill="${t.borderSoft}"/>
    ${flakes}
    <rect x="${boxX + 1}" y="${boxY + boxH - 8}" width="${boxW - 2}" height="7" fill="${t.borderSoft}" fill-opacity="0.7"/>`;
      animCss = `
    @keyframes tflk_${uid} { 0% { transform: translateY(-4px); opacity: 0; } 25% { opacity: 1; } 100% { transform: translateY(34px); opacity: 0; } }
    ${cols
      .map(
        (_, i) =>
          `.tflk-${uid}-${i} { animation: tflk_${uid} ${(2.4 + (i % 3) * 0.5).toFixed(1)}s linear ${(i * 0.32).toFixed(2)}s infinite; }`
      )
      .join("\n    ")}`;
    } else {
      const drops = [-44, -26, -8, 10, 28, 46]
        .map(
          (dx, i) =>
            `<line class="tdrp-${uid}-${i}" x1="${cx + dx}" y1="${boxY + 28}" x2="${cx + dx - 4}" y2="${boxY + 38}" stroke="${i % 2 === 0 ? t.accent : t.secondary}" stroke-width="1.9"/>`
        )
        .join("");
      sky = `
    <rect x="${cx - 46}" y="${boxY + 14}" width="92" height="13" fill="${t.border}"/>
    <rect x="${cx - 30}" y="${boxY + 8}" width="54" height="9" fill="${t.border}"/>
    ${drops}`;
      animCss = `
    @keyframes tdrp_${uid} { 0% { transform: translate(0px, -4px); opacity: 0; } 30% { opacity: 1; } 100% { transform: translate(-7px, 28px); opacity: 0; } }
    ${[0, 1, 2, 3, 4, 5]
      .map(
        (i) =>
          `.tdrp-${uid}-${i} { animation: tdrp_${uid} 1.45s linear ${(i * 0.22).toFixed(2)}s infinite; }`
      )
      .join("\n    ")}`;
    }
    sceneSvg = `
  <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" fill="${t.patternBg}" stroke="${t.border}" stroke-width="1"/>
  <g clip-path="url(#${clipId})">${sky}</g>
  <line x1="${cx}" y1="${boxY}" x2="${cx}" y2="${boxY + boxH}" stroke="${t.border}" stroke-opacity="0.2" stroke-width="1"/>
  <line x1="${boxX}" y1="${midY}" x2="${boxX + boxW}" y2="${midY}" stroke="${t.border}" stroke-opacity="0.2" stroke-width="1"/>`;
  } else if (cfg.scene === "hourglass") {
    const topY = boxY + 9;
    const botY = boxY + boxH - 9;
    sceneSvg = `
  <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="${cx - 24}" y="${topY}" width="48" height="4" fill="${t.border}"/>
  <rect x="${cx - 24}" y="${botY - 4}" width="48" height="4" fill="${t.border}"/>
  <polygon points="${cx - 18},${topY + 4} ${cx + 18},${topY + 4} ${cx + 2.5},${midY} ${cx - 2.5},${midY}" fill="${t.patternBg}" stroke="${t.border}" stroke-width="1.1"/>
  <polygon points="${cx - 2.5},${midY} ${cx + 2.5},${midY} ${cx + 18},${botY - 4} ${cx - 18},${botY - 4}" fill="${t.patternBg}" stroke="${t.border}" stroke-width="1.1"/>
  <polygon points="${cx - 11},${topY + 11} ${cx + 11},${topY + 11} ${cx + 1.5},${midY - 2} ${cx - 1.5},${midY - 2}" fill="${t.accent}"/>
  <rect class="tsnd-${uid}" x="${cx - 1.2}" y="${midY}" width="2.4" height="17" fill="${t.accent}"/>
  <polygon points="${cx - 12},${botY - 5} ${cx + 12},${botY - 5} ${cx},${botY - 16}" fill="${t.highlight}"/>`;
    animCss = `
    @keyframes tsnd_${uid} { 0% { opacity: 0.25; transform: translateY(-2px); } 50% { opacity: 1; transform: translateY(3px); } 100% { opacity: 0.25; transform: translateY(-2px); } }
    .tsnd-${uid} { animation: tsnd_${uid} 1.4s ease-in-out infinite; }`;
  } else {
    // synth spectrum scales bar count cleanly with tile width!
    const count = opts.colSpan >= 2 ? 17 : 9;
    const pattern = [22, 42, 30, 52, 40, 56, 34, 46, 26];
    const barW = 10;
    const barGap = 6;
    const totalBarsW = count * barW + (count - 1) * barGap;
    const startX = Math.round(cx - totalBarsW / 2);
    const baseY = boxY + boxH - 8;
    const barSvg = Array.from({ length: count }, (_, i) => {
      const bh = pattern[i % pattern.length];
      const bx = startX + i * (barW + barGap);
      const color = i % 3 === 0 ? t.accent : i % 3 === 1 ? t.secondary : t.tertiary;
      return `<rect class="tbar-${uid}-${i}" x="${bx}" y="${baseY - bh}" width="${barW}" height="${bh}" fill="${color}" shape-rendering="crispEdges"/>`;
    }).join("");
    sceneSvg = `
  <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <line x1="${boxX + 8}" y1="${baseY + 2}" x2="${boxX + boxW - 8}" y2="${baseY + 2}" stroke="${t.border}" stroke-width="1"/>
  ${barSvg}`;
    animCss = `
    @keyframes tbar_${uid} { 0%, 100% { transform: scaleY(0.32); } 50% { transform: scaleY(1); } }
    ${Array.from({ length: count }, (_, i) => {
      const bx = startX + i * (barW + barGap) + barW / 2;
      return `.tbar-${uid}-${i} { transform-origin: ${bx}px ${baseY}px; animation: tbar_${uid} ${(1.0 + (i % 4) * 0.24).toFixed(2)}s ease-in-out ${(i * 0.08).toFixed(2)}s infinite; }`;
    }).join("\n    ")}`;
  }

  const extraDefs = `<clipPath id="${clipId}"><rect x="${boxX + 1}" y="${boxY + 1}" width="${boxW - 2}" height="${boxH - 2}"/></clipPath>`;
  const styleBlock = opts.animated
    ? `
  <style>${animCss}
    @media (prefers-reduced-motion: reduce) {
      .ts1-${uid}, .ts2-${uid}, .ts3-${uid}, .tsun-${uid}, .tsnd-${uid}, [class^="tflk-${uid}"], [class^="tdrp-${uid}"], [class^="tbar-${uid}"] { animation: none !important; }
    }
  </style>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${safeTitle}">
  <title>${safeTitle}</title>
  <defs>${frame.defs}${extraDefs}
  </defs>${styleBlock}
  ${frame.chrome}
  ${sceneSvg}
  <text x="${cx}" y="${h - 23}" text-anchor="middle" font-family='${headFont}' font-size="13" font-weight="700" fill="${t.ink}">${safeTitle}</text>
  <text x="${cx}" y="${h - 10}" text-anchor="middle" font-family='${FONT_MONO}' font-size="8.8" letter-spacing="0.4" fill="${t.muted}">${safeSub}</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// L01–L04: GitHub Actions Live Auto-Updating Widgets (160px Bento height)
// Browser preview renderers matching live-widgets/generate_live_widgets.py
// ---------------------------------------------------------------------------
function fmtCompact(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.max(0, Math.round(n)));
}

function renderGitHubStats(cfg: GitHubStatsConfig, opts: WidgetRenderOptions): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = colSpanToPx(opts.colSpan);
  const h = opts.targetHeight ?? BENTO_ROW_HEIGHT;
  const uid = makeUid("lstats", opts);
  const handle = (cfg.username || "Furina-he").replace(/^@+/, "");

  const frame = renderThemeFrame({
    uid,
    themeId: opts.themeId,
    mode: opts.mode,
    tokens: t,
    width: w,
    height: h,
    tag: "GITHUB STATS",
    rightMeta: `@${fitText(handle, 110, 9.5, true)}`,
  });

  const pad = frame.padX;
  const innerW = w - pad * 2;
  const kpis: [string, string, string][] = [
    ["STARS", fmtCompact(cfg.stars), t.accent],
    ["REPOS", fmtCompact(cfg.repos), t.secondary],
    ["FOLLOWERS", fmtCompact(cfg.followers), t.tertiary],
    ["PULL REQS", fmtCompact(cfg.prs), t.highlight],
  ];
  const gap = 8;
  const cellW = (innerW - gap * 3) / 4;
  const kpiY = frame.contentTop + 6;
  const headFont = themeHeadingFont(opts.themeId);

  const kpiSvg = kpis
    .map(([lbl, val, col], idx) => {
      const x = pad + idx * (cellW + gap);
      return `<rect x="${x.toFixed(1)}" y="${kpiY}" width="${cellW.toFixed(1)}" height="46" fill="${t.surface}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="${(x + 8).toFixed(1)}" y="${kpiY + 9}" width="5" height="5" fill="${col}" shape-rendering="crispEdges"/>
  <text x="${(x + 17).toFixed(1)}" y="${kpiY + 14.5}" font-family='${FONT_MONO}' font-size="8.2" font-weight="700" fill="${t.muted}">${lbl}</text>
  <text x="${(x + 8).toFixed(1)}" y="${kpiY + 36}" font-family='${headFont}' font-size="16.5" font-weight="800" fill="${t.ink}">${escapeXml(val)}</text>`;
    })
    .join("\n  ");

  const parsedLangs = (cfg.languages || "Rust:42, TypeScript:31, Python:19, Shell:8")
    .split(/[,，\n]+/)
    .map((part) => {
      const [rawName, rawPct] = part.split(":");
      const name = (rawName || "").trim();
      const pct = Math.max(1, parseInt((rawPct || "20").trim(), 10) || 20);
      return name ? ([name, pct] as [string, number]) : null;
    })
    .filter((x): x is [string, number] => x !== null)
    .slice(0, 4);
  const langs = parsedLangs.length ? parsedLangs : ([["TypeScript", 60], ["Python", 40]] as [string, number][]);

  const totalPct = langs.reduce((s, [, p]) => s + p, 0) || 100;
  const barY = kpiY + 62;
  const barColors = [t.accent, t.secondary, t.tertiary, t.highlight];
  let bx = pad;
  let lx = pad;
  const barParts: string[] = [];
  const legParts: string[] = [];

  langs.forEach(([lname, pct], idx) => {
    let segW = Math.max(8, innerW * (pct / totalPct));
    if (idx === langs.length - 1) segW = Math.max(4, pad + innerW - bx);
    const col = barColors[idx % barColors.length];
    barParts.push(
      `<rect x="${bx.toFixed(1)}" y="${barY}" width="${segW.toFixed(1)}" height="8" fill="${col}" shape-rendering="crispEdges"/>`
    );
    bx += segW;
    const tagTxt = `${lname} ${Math.round((pct * 100) / totalPct)}%`;
    const est = estimateTextPx(tagTxt, 9.5, true) + 18;
    if (lx + est <= w - pad + 4) {
      legParts.push(
        `<rect x="${lx.toFixed(1)}" y="${barY + 18}" width="6" height="6" fill="${col}" shape-rendering="crispEdges"/>` +
          `<text x="${(lx + 10).toFixed(1)}" y="${barY + 24.5}" font-family='${FONT_MONO}' font-size="9.5" fill="${t.sub}">${escapeXml(tagTxt)}</text>`
      );
      lx += est;
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="GitHub Stats for @${escapeXml(handle)}">
  <title>GitHub Stats — @${escapeXml(handle)}</title>${frame.defs ? `\n  <defs>${frame.defs}\n  </defs>` : ""}
  ${frame.chrome}
  ${kpiSvg}
  <rect x="${pad}" y="${barY}" width="${innerW}" height="8" fill="${t.borderSoft}"/>
  ${barParts.join("\n  ")}
  ${legParts.join("\n  ")}
</svg>`;
}

function renderCodingRhythm(cfg: CodingRhythmConfig, opts: WidgetRenderOptions): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = colSpanToPx(opts.colSpan);
  const h = opts.targetHeight ?? BENTO_ROW_HEIGHT;
  const uid = makeUid("lrhythm", opts);

  const presets: Record<
    CodingRhythmConfig["persona"],
    { label: string; peak: string; hours: number[]; periods: [string, number][] }
  > = {
    early: {
      label: "EARLY BIRD",
      peak: "09:00",
      hours: [1, 0, 0, 0, 2, 6, 12, 18, 22, 24, 19, 15, 11, 10, 9, 8, 6, 5, 4, 3, 2, 1, 1, 1],
      periods: [["06-12", 58], ["12-18", 25], ["18-24", 11], ["00-06", 6]],
    },
    day: {
      label: "DAY BUILDER",
      peak: "15:00",
      hours: [1, 0, 0, 0, 0, 1, 3, 6, 11, 14, 16, 15, 14, 19, 22, 24, 20, 16, 11, 8, 5, 3, 2, 1],
      periods: [["06-12", 31], ["12-18", 50], ["18-24", 16], ["00-06", 3]],
    },
    evening: {
      label: "EVENING CODER",
      peak: "21:00",
      hours: [4, 2, 1, 0, 0, 1, 2, 4, 7, 10, 12, 10, 9, 12, 14, 12, 10, 9, 14, 18, 22, 24, 18, 11],
      periods: [["06-12", 20], ["12-18", 29], ["18-24", 44], ["00-06", 7]],
    },
    night: {
      label: "NIGHT OWL",
      peak: "01:00",
      hours: [21, 24, 18, 12, 6, 2, 1, 1, 3, 6, 9, 10, 9, 11, 13, 11, 9, 8, 12, 15, 18, 20, 22, 23],
      periods: [["06-12", 11], ["12-18", 22], ["18-24", 39], ["00-06", 28]],
    },
  };
  const p = presets[cfg.persona] ?? presets.evening;
  const tzStr = `UTC${cfg.tzOffset >= 0 ? "+" : ""}${cfg.tzOffset}`;

  const frame = renderThemeFrame({
    uid,
    themeId: opts.themeId,
    mode: opts.mode,
    tokens: t,
    width: w,
    height: h,
    tag: "CODING RHYTHM",
    rightMeta: `${tzStr} · PEAK ${p.peak}`,
  });

  const pad = frame.padX;
  const innerW = w - pad * 2;
  const maxV = Math.max(...p.hours, 1);
  const pillW = Math.round(estimateTextPx(p.label, 9, true) + 18);
  const chartTop = frame.contentTop + 26;
  const chartH = 54;
  const baseY = chartTop + chartH;
  const slotW = innerW / 24;
  const barW = Math.max(4, slotW - 3);
  const headFont = themeHeadingFont(opts.themeId);

  const bars = p.hours
    .map((val, hr) => {
      const bh = Math.max(4, (val / maxV) * (chartH - 4));
      const bx = pad + hr * slotW + (slotW - barW) / 2;
      const fill = val === maxV ? t.accent : val > maxV * 0.55 ? t.secondary : t.borderSoft;
      return `<rect x="${bx.toFixed(1)}" y="${(baseY - bh).toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" fill="${fill}" shape-rendering="crispEdges"/>`;
    })
    .join("\n  ");

  const pY = baseY + 18;
  const pStep = innerW / 4;
  const periodsSvg = p.periods
    .map(([rng, pct], idx) => {
      const px = pad + idx * pStep;
      return `<text x="${px.toFixed(1)}" y="${pY}" font-family='${FONT_MONO}' font-size="9.2" fill="${t.muted}">${rng} <tspan font-weight="700" fill="${t.ink}">${pct}%</tspan></text>`;
    })
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Coding Rhythm — ${p.label}">
  <title>Coding Rhythm — ${p.label}</title>${frame.defs ? `\n  <defs>${frame.defs}\n  </defs>` : ""}
  ${frame.chrome}
  <text x="${pad}" y="${frame.contentTop + 16}" font-family='${headFont}' font-size="14.5" font-weight="800" fill="${t.ink}">Commit Cadence</text>
  <rect x="${w - pad - pillW}" y="${frame.contentTop + 3}" width="${pillW}" height="18" fill="${t.accent}"/>
  <text x="${w - pad - pillW / 2}" y="${frame.contentTop + 15}" text-anchor="middle" font-family='${FONT_MONO}' font-size="9" font-weight="700" fill="${t.accentFg}">${p.label}</text>
  <line x1="${pad}" y1="${baseY + 1.5}" x2="${w - pad}" y2="${baseY + 1.5}" stroke="${t.border}" stroke-width="1"/>
  ${bars}
  ${periodsSvg}
</svg>`;
}

function renderRssFeed(cfg: RssFeedConfig, opts: WidgetRenderOptions): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = colSpanToPx(opts.colSpan);
  const h = opts.targetHeight ?? BENTO_ROW_HEIGHT;
  const uid = makeUid("lrss", opts);
  const src = fitText(cfg.source || "blog.example.com", Math.max(110, w - 190), 9.5, true);

  const frame = renderThemeFrame({
    uid,
    themeId: opts.themeId,
    mode: opts.mode,
    tokens: t,
    width: w,
    height: h,
    tag: "LATEST POSTS",
    rightMeta: src,
  });

  const pad = frame.padX;
  const headFont = themeHeadingFont(opts.themeId);
  const titleMaxW = w - pad * 2 - 96;
  const items: [string, string][] = [
    [cfg.post1 || "Designing Deterministic SVG Themes for AI Agents", "11-26"],
    [cfg.post2 || "Zero-503 GitHub Profile Widgets via GitHub Actions", "11-22"],
    [cfg.post3 || "4-Column 846px Bento Grids Without Wrap Glitches", "11-18"],
  ];

  const rowsSvg = items
    .map(([title, dt], idx) => {
      const y = frame.contentTop + 20 + idx * 33;
      const rule =
        idx > 0
          ? `<line x1="${pad}" y1="${y - 18}" x2="${w - pad}" y2="${y - 18}" stroke="${t.borderSoft}" stroke-width="0.9"/>`
          : "";
      const col = [t.accent, t.secondary, t.tertiary][idx % 3];
      const safeT = escapeXml(fitText(title, titleMaxW, 12, opts.themeId === "crt-terminal"));
      return `${rule}
  <rect x="${pad}" y="${y - 10}" width="22" height="15" fill="${col}"/>
  <text x="${pad + 11}" y="${y + 1}" text-anchor="middle" font-family='${FONT_MONO}' font-size="8.5" font-weight="700" fill="${t.accentFg}">0${idx + 1}</text>
  <text x="${pad + 30}" y="${y + 1}" font-family='${headFont}' font-size="12" font-weight="700" fill="${t.ink}">${safeT}</text>
  <text x="${w - pad}" y="${y + 1}" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${dt}</text>`;
    })
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Latest RSS posts from ${escapeXml(src)}">
  <title>Latest Posts — ${escapeXml(src)}</title>${frame.defs ? `\n  <defs>${frame.defs}\n  </defs>` : ""}
  ${frame.chrome}
  ${rowsSvg}
</svg>`;
}

function renderLiveWeather(cfg: LiveWeatherConfig, opts: WidgetRenderOptions): string {
  const t = resolveTokens(opts.tokens, opts.accentOverride);
  const w = colSpanToPx(opts.colSpan);
  const h = opts.targetHeight ?? BENTO_ROW_HEIGHT;
  const uid = makeUid("lwx", opts);
  const tempVal = Math.round(cfg.temp ?? 19);
  const tempStr = `${tempVal}°${cfg.unit === "F" ? "F" : "C"}`;
  const condLabels: Record<LiveWeatherConfig["condition"], string> = {
    sunny: "CLEAR SKY",
    cloudy: "CLOUDY",
    rain: "LIGHT RAIN",
    snow: "SNOWFALL",
  };
  const label = condLabels[cfg.condition] ?? "CLEAR SKY";
  const humStr = `${Math.max(0, Math.min(100, Math.round(cfg.humidity ?? 72)))}%`;

  const frame = renderThemeFrame({
    uid,
    themeId: opts.themeId,
    mode: opts.mode,
    tokens: t,
    width: w,
    height: h,
    tag: "WEATHER",
    rightMeta: tempStr,
  });

  const pad = frame.padX;
  const wide = opts.colSpan >= 2;
  const boxX = pad;
  const boxY = frame.contentTop + 4;
  const boxW = wide ? 136 : w - pad * 2;
  const boxH = wide ? 98 : h - boxY - 40;
  const cx = boxX + boxW / 2;
  const midY = boxY + boxH / 2;
  const clipId = `lwclip-${uid}`;
  const headFont = themeHeadingFont(opts.themeId);

  let sky = "";
  let animCss = "";
  if (cfg.condition === "sunny") {
    const rays = Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      return `<line x1="${(cx + Math.cos(a) * 16).toFixed(1)}" y1="${(midY + Math.sin(a) * 16).toFixed(1)}" x2="${(cx + Math.cos(a) * 23).toFixed(1)}" y2="${(midY + Math.sin(a) * 23).toFixed(1)}" stroke="${t.highlight}" stroke-width="2.2"/>`;
    }).join("");
    sky = `<g class="wsun-${uid}" style="transform-origin:${cx.toFixed(1)}px ${midY.toFixed(1)}px">${rays}</g><circle cx="${cx.toFixed(1)}" cy="${midY.toFixed(1)}" r="11.5" fill="${t.highlight}"/>`;
    animCss = `@keyframes wsun_${uid} { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .wsun-${uid} { animation: wsun_${uid} 20s linear infinite; }`;
  } else if (cfg.condition === "snow") {
    const cols = [-42, -22, -4, 14, 34];
    const flakes = cols
      .map(
        (dx, i) =>
          `<rect class="wflk-${uid}-${i}" x="${(cx + dx).toFixed(1)}" y="${boxY + 22 + (i % 2) * 8}" width="4" height="4" fill="${i % 2 === 0 ? t.ink : t.accent}" shape-rendering="crispEdges"/>`
      )
      .join("");
    sky = `<rect x="${(cx - 38).toFixed(1)}" y="${boxY + 12}" width="76" height="13" fill="${t.borderSoft}"/>${flakes}`;
    animCss =
      `@keyframes wflk_${uid} { 0% { transform: translateY(-4px); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(34px); opacity: 0; } } ` +
      cols
        .map(
          (_, i) =>
            `.wflk-${uid}-${i} { animation: wflk_${uid} ${(2.4 + (i % 3) * 0.4).toFixed(1)}s linear ${(i * 0.3).toFixed(2)}s infinite; }`
        )
        .join(" ");
  } else if (cfg.condition === "cloudy") {
    sky =
      `<circle cx="${(cx + 16).toFixed(1)}" cy="${boxY + 26}" r="10" fill="${t.highlight}"/>` +
      `<rect class="wcld-${uid}" x="${(cx - 36).toFixed(1)}" y="${boxY + 26}" width="72" height="16" fill="${t.border}"/>` +
      `<rect class="wcld-${uid}" x="${(cx - 22).toFixed(1)}" y="${boxY + 18}" width="44" height="12" fill="${t.border}"/>`;
    animCss = `@keyframes wcld_${uid} { 0%, 100% { transform: translateX(-4px); } 50% { transform: translateX(4px); } } .wcld-${uid} { animation: wcld_${uid} 5s ease-in-out infinite; }`;
  } else {
    const cols = [-38, -20, -2, 16, 34];
    const drops = cols
      .map(
        (dx, i) =>
          `<line class="wdrp-${uid}-${i}" x1="${(cx + dx).toFixed(1)}" y1="${boxY + 28}" x2="${(cx + dx - 4).toFixed(1)}" y2="${boxY + 38}" stroke="${i % 2 === 0 ? t.accent : t.secondary}" stroke-width="1.9"/>`
      )
      .join("");
    sky = `<rect x="${(cx - 40).toFixed(1)}" y="${boxY + 14}" width="80" height="13" fill="${t.border}"/><rect x="${(cx - 26).toFixed(1)}" y="${boxY + 8}" width="48" height="9" fill="${t.border}"/>${drops}`;
    animCss =
      `@keyframes wdrp_${uid} { 0% { transform: translate(0, -4px); opacity: 0; } 30% { opacity: 1; } 100% { transform: translate(-7px, 28px); opacity: 0; } } ` +
      cols
        .map(
          (_, i) =>
            `.wdrp-${uid}-${i} { animation: wdrp_${uid} 1.45s linear ${(i * 0.24).toFixed(2)}s infinite; }`
        )
        .join(" ");
  }

  const styleBlock =
    opts.animated && animCss
      ? `\n  <style>${animCss} @media (prefers-reduced-motion: reduce) { .wsun-${uid}, .wcld-${uid}, [class^="wflk-${uid}"], [class^="wdrp-${uid}"] { animation: none !important; } }</style>`
      : "";

  const safeCity = escapeXml(fitText(cfg.city || "Shanghai", wide ? w - boxX - boxW - pad - 18 : w - 24, 13));
  const info = wide
    ? `
  <text x="${boxX + boxW + 18}" y="${boxY + 26}" font-family='${headFont}' font-size="26" font-weight="800" fill="${t.ink}">${escapeXml(tempStr)}</text>
  <text x="${w - pad}" y="${boxY + 20}" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.accent}">${label}</text>
  <text x="${boxX + boxW + 18}" y="${boxY + 48}" font-family='${FONT_SANS}' font-size="13" font-weight="700" fill="${t.sub}">${safeCity}</text>
  <line x1="${boxX + boxW + 18}" y1="${boxY + 60}" x2="${w - pad}" y2="${boxY + 60}" stroke="${t.borderSoft}" stroke-width="0.9"/>
  <text x="${boxX + boxW + 18}" y="${boxY + 80}" font-family='${FONT_MONO}' font-size="10" fill="${t.muted}">HUMIDITY <tspan fill="${t.ink}" font-weight="700">${humStr}</tspan></text>
  <text x="${w - pad}" y="${boxY + 80}" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">OPEN-METEO</text>`
    : `
  <text x="${w / 2}" y="${h - 23}" text-anchor="middle" font-family='${headFont}' font-size="13" font-weight="700" fill="${t.ink}">${safeCity}</text>
  <text x="${w / 2}" y="${h - 10}" text-anchor="middle" font-family='${FONT_MONO}' font-size="8.8" fill="${t.muted}">${label} · ${humStr}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Live Weather in ${safeCity}: ${escapeXml(tempStr)}">
  <title>${safeCity} — ${escapeXml(tempStr)}</title>
  <defs>${frame.defs}<clipPath id="${clipId}"><rect x="${boxX + 1}" y="${boxY + 1}" width="${boxW - 2}" height="${boxH - 2}"/></clipPath></defs>${styleBlock}
  ${frame.chrome}
  <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" fill="${t.patternBg}" stroke="${t.border}" stroke-width="1"/>
  <g clip-path="url(#${clipId})">${sky}</g>
  ${info}
</svg>`;
}

export function renderWidgetSvg<K extends WidgetId>(
  widgetId: K,
  config: WidgetConfigMap[K],
  opts: WidgetRenderOptions
): string {
  switch (widgetId) {
    case "pixel-companion":
      return renderPixelCompanion(config as PixelCompanionConfig, opts);
    case "now-playing":
      return renderNowPlaying(config as NowPlayingConfig, opts);
    case "dev-badge":
      return renderDevBadge(config as DevBadgeConfig, opts);
    case "skill-dock":
      return renderSkillDock(config as SkillDockConfig, opts);
    case "quote-banner":
      return renderQuoteBanner(config as QuoteBannerConfig, opts);
    case "hero-sticker":
      return renderHeroSticker(config as HeroStickerConfig, opts);
    case "pixel-runway":
      return renderPixelRunway(config as PixelRunwayConfig, opts);
    case "mini-tile":
      return renderMiniTile(config as MiniTileConfig, opts);
    case "github-stats":
      return renderGitHubStats(config as GitHubStatsConfig, opts);
    case "coding-rhythm":
      return renderCodingRhythm(config as CodingRhythmConfig, opts);
    case "rss-feed":
      return renderRssFeed(config as RssFeedConfig, opts);
    case "live-weather":
      return renderLiveWeather(config as LiveWeatherConfig, opts);
  }
}
