import type { PreviewMode, ThemeTokens } from "../types";

export const FONT_SANS =
  '"Inter Tight", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans CJK SC", Arial, sans-serif';
export const FONT_MONO =
  '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace';
export const FONT_SERIF =
  'Georgia, "Times New Roman", "Noto Serif CJK SC", serif';

export function escapeXml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function charUnits(ch: string): number {
  const code = ch.codePointAt(0) ?? 32;
  // CJK / fullwidth ranges
  if (
    (code >= 0x2e80 && code <= 0x9fff) ||
    (code >= 0xac00 && code <= 0xd7af) ||
    (code >= 0xf900 && code <= 0xfaff) ||
    (code >= 0xff00 && code <= 0xffef)
  ) {
    return 1.85;
  }
  if (ch === " " || ch === "." || ch === "," || ch === ":" || ch === "i" || ch === "l" || ch === "!") {
    return 0.56;
  }
  if (ch >= "A" && ch <= "Z") {
    return 1.12;
  }
  if (ch === "W" || ch === "M" || ch === "m" || ch === "w" || ch === "@") {
    return 1.25;
  }
  return 0.92;
}

export function estimateTextPx(text: string, fontSize: number, mono = false): number {
  let units = 0;
  for (const ch of text) {
    if (mono) {
      const code = ch.codePointAt(0) ?? 32;
      units += code > 0x2e7f ? 1.85 : 1.0;
    } else {
      units += charUnits(ch);
    }
  }
  return units * fontSize * (mono ? 0.61 : 0.56);
}

export function fitText(text: string, maxPx: number, fontSize: number, mono = false): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (estimateTextPx(clean, fontSize, mono) <= maxPx) return clean;
  const ellipsis = "…";
  const ellipsisPx = estimateTextPx(ellipsis, fontSize, mono);
  let out = "";
  let acc = 0;
  for (const ch of clean) {
    const w = estimateTextPx(ch, fontSize, mono);
    if (acc + w + ellipsisPx > maxPx) break;
    out += ch;
    acc += w;
  }
  return `${out.trimEnd()}${ellipsis}`;
}

export function wrapText(
  text: string,
  maxPx: number,
  fontSize: number,
  maxLines: number,
  mono = false
): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [""];

  const lines: string[] = [];
  let current = "";
  const chars = Array.from(clean);

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = current + ch;
    if (estimateTextPx(next, fontSize, mono) <= maxPx) {
      current = next;
      continue;
    }
    if (lines.length === maxLines - 1) {
      lines.push(fitText(current + chars.slice(i).join(""), maxPx, fontSize, mono));
      return lines;
    }
    // Prefer breaking at last space for Latin phrases
    const lastSpace = current.lastIndexOf(" ");
    if (lastSpace > current.length * 0.45) {
      lines.push(current.slice(0, lastSpace).trimEnd());
      current = (current.slice(lastSpace + 1) + ch).trimStart();
    } else {
      lines.push(current.trimEnd());
      current = ch.trimStart();
    }
  }
  if (current) {
    lines.push(fitText(current, maxPx, fontSize, mono));
  }
  return lines.slice(0, maxLines);
}

function hexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0.5;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

export function resolveTokens(tokens: ThemeTokens, accentOverride?: string): ThemeTokens {
  const hex = accentOverride?.trim();
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    return tokens;
  }
  const lum = hexLuminance(hex);
  return {
    ...tokens,
    accent: hex,
    accentFg: lum > 0.42 ? "#0A0A0A" : "#FFFFFF",
  };
}

export function gridToPaths(
  grid: string[],
  palette: Record<string, string>,
  ox: number,
  oy: number,
  px: number
): string {
  const byColor = new Map<string, string[]>();
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    let c = 0;
    while (c < row.length) {
      const sym = row[c];
      if (sym !== "." && palette[sym]) {
        const start = c;
        while (c < row.length && row[c] === sym) c++;
        const rx = ox + start * px;
        const ry = oy + r * px;
        const rw = (c - start) * px;
        const color = palette[sym];
        const seg = `M${rx} ${ry}h${rw}v${px}h-${rw}z`;
        const list = byColor.get(color);
        if (list) list.push(seg);
        else byColor.set(color, [seg]);
      } else {
        c++;
      }
    }
  }
  const paths: string[] = [];
  byColor.forEach((segs, color) => {
    paths.push(`<path fill="${color}" d="${segs.join("")}"/>`);
  });
  return `<g shape-rendering="crispEdges">${paths.join("")}</g>`;
}

export function bauhausWeave(
  x: number,
  y: number,
  w: number,
  h: number,
  bg: string,
  fg: string,
  cell = 6
): string {
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  const segs: string[] = [];
  for (let r = 0; r < rows; r++) {
    const rm = r % 6;
    let c = 0;
    while (c < cols) {
      const cm = c % 6;
      const hit =
        (rm === 1 && cm <= 2) ||
        (cm === 1 && rm <= 2) ||
        (rm === 4 && cm >= 3) ||
        (cm === 4 && rm >= 3);
      if (hit) {
        const start = c;
        while (c < cols) {
          const cm2 = c % 6;
          const hit2 =
            (rm === 1 && cm2 <= 2) ||
            (cm2 === 1 && rm <= 2) ||
            (rm === 4 && cm2 >= 3) ||
            (cm2 === 4 && rm >= 3);
          if (!hit2) break;
          c++;
        }
        const rx = x + start * cell;
        const ry = y + r * cell;
        const rw = Math.min(w - start * cell, (c - start) * cell);
        const rh = Math.min(h - r * cell, cell);
        if (rw > 0 && rh > 0) {
          segs.push(`M${rx} ${ry}h${rw}v${rh}h-${rw}z`);
        }
      } else {
        c++;
      }
    }
  }
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}"/><path fill="${fg}" shape-rendering="crispEdges" d="${segs.join("")}"/>`;
}

export function chamferPolygon(x: number, y: number, w: number, h: number, cut = 6): string {
  return `${x + cut},${y} ${x + w},${y} ${x + w},${y + h - cut} ${x + w - cut},${y + h} ${x},${y + h} ${x},${y + cut}`;
}

export function themeHeadingFont(themeId: string): string {
  if (themeId === "editorial-zine" || themeId === "seal-ink-scroll") return FONT_SERIF;
  if (
    themeId === "crt-terminal" ||
    themeId === "pixel-rpg-hud" ||
    themeId === "pcb-solder-mask" ||
    themeId === "classic-desktop-os"
  ) {
    return FONT_MONO;
  }
  return FONT_SANS;
}

export interface FrameResult {
  defs: string;
  chrome: string;
  contentTop: number;
  contentBottom: number;
  padX: number;
}

export function renderThemeFrame(opts: {
  uid: string;
  themeId: string;
  mode: PreviewMode;
  tokens: ThemeTokens;
  width: number;
  height: number;
  tag: string;
  rightMeta: string;
}): FrameResult {
  const { uid, themeId, mode, tokens: t, width: w, height: h, tag, rightMeta } = opts;
  const safeTag = escapeXml(tag);
  const safeMeta = escapeXml(rightMeta);

  if (themeId === "blueprint-cad") {
    const gridMin = `gmin-${uid}`;
    const gridMaj = `gmaj-${uid}`;
    const defs = `
    <pattern id="${gridMin}" width="12" height="12" patternUnits="userSpaceOnUse">
      <path d="M 12 0 L 0 0 0 12" fill="none" stroke="${t.borderSoft}" stroke-opacity="${mode === "dark" ? "0.45" : "0.65"}" stroke-width="0.6"/>
    </pattern>
    <pattern id="${gridMaj}" width="48" height="48" patternUnits="userSpaceOnUse">
      <rect width="48" height="48" fill="url(#${gridMin})"/>
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="${t.borderSoft}" stroke-opacity="${mode === "dark" ? "0.75" : "0.95"}" stroke-width="0.9"/>
    </pattern>`;
    const tagW = Math.min(148, Math.max(82, Math.round(estimateTextPx(tag, 9.5, true) + 22)));
    const cross = (cx: number, cy: number) =>
      `<g stroke="${t.border}" stroke-opacity="0.65" stroke-width="0.8" fill="none"><circle cx="${cx}" cy="${cy}" r="3"/><line x1="${cx - 5.5}" y1="${cy}" x2="${cx + 5.5}" y2="${cy}"/><line x1="${cx}" y1="${cy - 5.5}" x2="${cx}" y2="${cy + 5.5}"/></g>`;
    const chrome = `
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="url(#${gridMaj})"/>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="none" stroke="${t.border}" stroke-width="1.2"/>
  <rect x="6.5" y="6.5" width="${w - 13}" height="${h - 13}" fill="none" stroke="${t.border}" stroke-opacity="0.45" stroke-width="0.8"/>
  ${cross(12, 12)}
  ${cross(w - 12, 12)}
  ${cross(12, h - 12)}
  ${cross(w - 12, h - 12)}
  <polygon points="${chamferPolygon(22, 12, tagW, 18, 5)}" fill="${t.accent}"/>
  <text x="${22 + tagW / 2}" y="24" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="0.6" fill="${t.accentFg}">${safeTag}</text>
  <text x="${w - 24}" y="24" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" letter-spacing="0.5" fill="${t.muted}">${safeMeta}</text>
  <line x1="16" y1="35.5" x2="${w - 16}" y2="35.5" stroke="${t.borderSoft}" stroke-dasharray="3 3" stroke-width="0.9"/>`;
    return { defs, chrome, contentTop: 42, contentBottom: h - 16, padX: 20 };
  }

  if (themeId === "editorial-zine") {
    const chrome = `
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="16" y="11" width="${w - 32}" height="2" fill="${t.border}"/>
  <line x1="16" y1="16" x2="${w - 16}" y2="16" stroke="${t.border}" stroke-width="0.7"/>
  <rect x="16" y="23" width="6" height="6" fill="${t.accent}"/>
  <text x="28" y="29" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="1.1" fill="${t.accent}">${safeTag}</text>
  <text x="${w - 16}" y="29" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" letter-spacing="0.8" fill="${t.muted}">${safeMeta}</text>
  <line x1="16" y1="36.5" x2="${w - 16}" y2="36.5" stroke="${t.borderSoft}" stroke-width="0.9"/>
  <line x1="16" y1="${h - 11.5}" x2="${w - 16}" y2="${h - 11.5}" stroke="${t.borderSoft}" stroke-width="0.8"/>`;
    return { defs: "", chrome, contentTop: 43, contentBottom: h - 16, padX: 18 };
  }

  if (themeId === "crt-terminal") {
    const scanId = `scan-${uid}`;
    const defs = `
    <pattern id="${scanId}" width="4" height="4" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="4" y2="0" stroke="${mode === "dark" ? "#FFFFFF" : "#000000"}" stroke-opacity="${mode === "dark" ? "0.045" : "0.02"}" stroke-width="1"/>
    </pattern>`;
    const chrome = `
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <rect x="1" y="1" width="${w - 2}" height="24" fill="${t.patternBg}"/>
  <line x1="1" y1="25.5" x2="${w - 1}" y2="25.5" stroke="${t.border}" stroke-width="1"/>
  <circle cx="14" cy="13" r="3.2" fill="${t.highlight}"/>
  <circle cx="25" cy="13" r="3.2" fill="${t.secondary}"/>
  <circle cx="36" cy="13" r="3.2" fill="${t.accent}"/>
  <text x="49" y="16.5" font-family='${FONT_MONO}' font-size="10" font-weight="700" fill="${t.ink}">[${safeTag.toLowerCase()}]</text>
  <text x="${w - 14}" y="16.5" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${safeMeta}</text>
  <rect x="1" y="26" width="${w - 2}" height="${h - 27}" fill="url(#${scanId})"/>`;
    return { defs, chrome, contentTop: 35, contentBottom: h - 12, padX: 16 };
  }

  if (themeId === "pixel-rpg-hud") {
    const chrome = `
  <rect x="2" y="2" width="${w - 4}" height="${h - 4}" fill="${t.bg}" stroke="${t.border}" stroke-width="2" shape-rendering="crispEdges"/>
  <rect x="6" y="6" width="${w - 12}" height="${h - 12}" fill="none" stroke="${t.borderSoft}" stroke-width="1" shape-rendering="crispEdges"/>
  <rect x="0" y="0" width="5" height="5" fill="${t.border}" shape-rendering="crispEdges"/>
  <rect x="${w - 5}" y="0" width="5" height="5" fill="${t.border}" shape-rendering="crispEdges"/>
  <rect x="0" y="${h - 5}" width="5" height="5" fill="${t.border}" shape-rendering="crispEdges"/>
  <rect x="${w - 5}" y="${h - 5}" width="5" height="5" fill="${t.border}" shape-rendering="crispEdges"/>
  <rect x="7" y="7" width="${w - 14}" height="22" fill="${t.patternBg}"/>
  <line x1="6" y1="29.5" x2="${w - 6}" y2="29.5" stroke="${t.border}" stroke-width="1.2"/>
  <rect x="15" y="15" width="6" height="6" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="27" y="21.5" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.ink}">${safeTag}</text>
  <text x="${w - 16}" y="21.5" text-anchor="end" font-family='${FONT_MONO}' font-size="9" font-weight="700" fill="${t.accent}">${safeMeta}</text>`;
    return { defs: "", chrome, contentTop: 36, contentBottom: h - 12, padX: 18 };
  }

  if (themeId === "seal-ink-scroll") {
    const chrome = `
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.borderSoft}" stroke-width="1"/>
  <rect x="6.5" y="6.5" width="${w - 13}" height="${h - 13}" fill="none" stroke="${t.border}" stroke-opacity="0.7" stroke-width="0.9"/>
  <path d="M 10 20 L 10 10 L 20 10" fill="none" stroke="${t.accent}" stroke-width="1.2"/>
  <path d="M ${w - 20} 10 L ${w - 10} 10 L ${w - 10} 20" fill="none" stroke="${t.accent}" stroke-width="1.2"/>
  <path d="M 10 ${h - 20} L 10 ${h - 10} L 20 ${h - 10}" fill="none" stroke="${t.accent}" stroke-width="1.2"/>
  <path d="M ${w - 20} ${h - 10} L ${w - 10} ${h - 10} L ${w - 10} ${h - 20}" fill="none" stroke="${t.accent}" stroke-width="1.2"/>
  <rect x="18" y="16" width="11" height="11" rx="1" fill="${t.accent}"/>
  <rect x="20.5" y="18.5" width="6" height="6" fill="none" stroke="${t.accentFg}" stroke-width="0.9"/>
  <text x="36" y="25" font-family='${FONT_MONO}' font-size="9.2" font-weight="700" letter-spacing="0.9" fill="${t.ink}">${safeTag}</text>
  <text x="${w - 18}" y="25" text-anchor="end" font-family='${FONT_MONO}' font-size="9.2" fill="${t.muted}">${safeMeta}</text>
  <line x1="16" y1="32.5" x2="${w - 16}" y2="32.5" stroke="${t.borderSoft}" stroke-width="0.9"/>`;
    return { defs: "", chrome, contentTop: 38, contentBottom: h - 14, padX: 18 };
  }

  if (themeId === "synth-hardware") {
    const screw = (cx: number, cy: number) =>
      `<g><circle cx="${cx}" cy="${cy}" r="3" fill="${t.patternBg}" stroke="${t.border}" stroke-width="0.8"/><line x1="${cx - 1.8}" y1="${cy}" x2="${cx + 1.8}" y2="${cy}" stroke="${t.muted}" stroke-width="0.7"/></g>`;
    const chrome = `
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="3" fill="${t.bg}" stroke="${t.border}" stroke-width="1.2"/>
  <rect x="5" y="5" width="${w - 10}" height="22" fill="${t.patternBg}" stroke="${t.borderSoft}" stroke-width="0.8"/>
  ${screw(12, 16)}
  ${screw(w - 12, 16)}
  ${screw(12, h - 10)}
  ${screw(w - 12, h - 10)}
  <circle cx="24" cy="16" r="3" fill="${t.accent}"/>
  <circle cx="33" cy="16" r="2.2" fill="${t.secondary}"/>
  <text x="42" y="19.5" font-family='${FONT_MONO}' font-size="9.2" font-weight="700" letter-spacing="0.6" fill="${t.ink}">${safeTag}</text>
  <text x="${w - 22}" y="19.5" text-anchor="end" font-family='${FONT_MONO}' font-size="9" fill="${t.muted}">${safeMeta}</text>`;
    return { defs: "", chrome, contentTop: 34, contentBottom: h - 14, padX: 18 };
  }

  if (themeId === "pcb-solder-mask") {
    const via = (cx: number, cy: number) =>
      `<g><circle cx="${cx}" cy="${cy}" r="3.6" fill="${t.accent}"/><circle cx="${cx}" cy="${cy}" r="1.5" fill="${t.bg}"/></g>`;
    const chrome = `
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1.3"/>
  <rect x="6" y="6" width="${w - 12}" height="${h - 12}" fill="none" stroke="${t.borderSoft}" stroke-width="0.8"/>
  <path d="M 16 28 L 32 28 L 40 20 L ${w - 20} 20" fill="none" stroke="${t.borderSoft}" stroke-opacity="0.7" stroke-width="0.9"/>
  ${via(12, 12)}
  ${via(w - 12, 12)}
  ${via(12, h - 12)}
  ${via(w - 12, h - 12)}
  <rect x="24" y="12" width="6" height="6" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="35" y="18.5" font-family='${FONT_MONO}' font-size="9.2" font-weight="700" fill="${t.ink}">${safeTag}</text>
  <text x="${w - 24}" y="18.5" text-anchor="end" font-family='${FONT_MONO}' font-size="9" fill="${t.accent}">${safeMeta}</text>
  <line x1="16" y1="30.5" x2="${w - 16}" y2="30.5" stroke="${t.borderSoft}" stroke-width="0.9"/>`;
    return { defs: "", chrome, contentTop: 36, contentBottom: h - 14, padX: 18 };
  }

  if (themeId === "transit-boarding") {
    const chrome = `
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1.1"/>
  <rect x="1" y="1" width="${w - 2}" height="24" fill="${t.accent}"/>
  <circle cx="14" cy="13" r="4" fill="none" stroke="${t.accentFg}" stroke-width="1.4"/>
  <text x="25" y="16.5" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" letter-spacing="0.8" fill="${t.accentFg}">${safeTag}</text>
  <text x="${w - 14}" y="16.5" text-anchor="end" font-family='${FONT_MONO}' font-size="9" font-weight="700" fill="${t.accentFg}" fill-opacity="0.9">${safeMeta}</text>
  <line x1="14" y1="${h - 10.5}" x2="${w - 14}" y2="${h - 10.5}" stroke="${t.borderSoft}" stroke-dasharray="3 3" stroke-width="0.9"/>`;
    return { defs: "", chrome, contentTop: 33, contentBottom: h - 14, padX: 16 };
  }

  if (themeId === "classic-desktop-os") {
    const stripeLines = [7, 10, 13, 16, 19]
      .map((sy) => `<line x1="26" y1="${sy}" x2="${w - 14}" y2="${sy}" stroke="${t.borderSoft}" stroke-width="0.9"/>`)
      .join("");
    const tagW = Math.min(160, Math.max(70, Math.round(estimateTextPx(tag, 9.2, true) + 16)));
    const chrome = `
  <rect x="2.5" y="2.5" width="${w - 3}" height="${h - 3}" fill="${t.border}" fill-opacity="0.18"/>
  <rect x="0.5" y="0.5" width="${w - 3}" height="${h - 3}" fill="${t.surface}" stroke="${t.border}" stroke-width="1.2"/>
  <rect x="1" y="1" width="${w - 4}" height="23" fill="${t.bg}"/>
  ${stripeLines}
  <rect x="8" y="6" width="12" height="12" fill="${t.surface}" stroke="${t.border}" stroke-width="1"/>
  <rect x="${Math.round(w / 2 - tagW / 2)}" y="4" width="${tagW}" height="17" fill="${t.bg}"/>
  <text x="${Math.round(w / 2)}" y="15.5" text-anchor="middle" font-family='${FONT_MONO}' font-size="9.2" font-weight="700" fill="${t.ink}">${safeTag}</text>
  <line x1="0.5" y1="24.5" x2="${w - 2.5}" y2="24.5" stroke="${t.border}" stroke-width="1.1"/>
  <text x="${w - 14}" y="15.5" text-anchor="end" font-family='${FONT_MONO}' font-size="8.4" fill="${t.muted}">${fitText(rightMeta, 78, 8.4, true)}</text>`;
    return { defs: "", chrome, contentTop: 33, contentBottom: h - 13, padX: 16 };
  }

  if (themeId === "riso-duotone") {
    const dotPat = `riso-${uid}`;
    const defs = `
    <pattern id="${dotPat}" width="6" height="6" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="0.85" fill="${t.patternFg}" fill-opacity="${mode === "dark" ? "0.4" : "0.65"}"/>
    </pattern>`;
    const reg = (cx: number, cy: number) =>
      `<g stroke="${t.secondary}" stroke-width="0.8" fill="none"><circle cx="${cx}" cy="${cy}" r="2.6"/><line x1="${cx - 4.5}" y1="${cy}" x2="${cx + 4.5}" y2="${cy}"/><line x1="${cx}" y1="${cy - 4.5}" x2="${cx}" y2="${cy + 4.5}"/></g>`;
    const chrome = `
  <rect x="2.5" y="2.5" width="${w - 3}" height="${h - 3}" fill="${t.secondary}" fill-opacity="0.22"/>
  <rect x="0.5" y="0.5" width="${w - 3}" height="${h - 3}" fill="${t.bg}" stroke="${t.border}" stroke-width="1.2"/>
  <rect x="1" y="1" width="${w - 4}" height="24" fill="url(#${dotPat})"/>
  <line x1="0.5" y1="25.5" x2="${w - 2.5}" y2="25.5" stroke="${t.border}" stroke-width="1"/>
  ${reg(13, 13)}
  <text x="25" y="16.5" font-family='${FONT_MONO}' font-size="9.5" font-weight="700" fill="${t.accent}">${safeTag}</text>
  <text x="${w - 14}" y="16.5" text-anchor="end" font-family='${FONT_MONO}' font-size="9" fill="${t.secondary}">${safeMeta}</text>`;
    return { defs, chrome, contentTop: 34, contentBottom: h - 13, padX: 16 };
  }

  // Default: swiss-bauhaus-pixel
  const chrome = `
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="${t.bg}" stroke="${t.border}" stroke-width="1"/>
  <rect x="1" y="1" width="${w - 2}" height="26" fill="${t.surface}"/>
  <line x1="0.5" y1="27.5" x2="${w - 0.5}" y2="27.5" stroke="${t.border}" stroke-width="1"/>
  <rect x="14" y="11" width="6" height="6" fill="${t.accent}" shape-rendering="crispEdges"/>
  <text x="27" y="18" font-family='${FONT_MONO}' font-size="10" font-weight="700" letter-spacing="0.4" fill="${t.ink}">(${safeTag.toLowerCase()})</text>
  <text x="${w - 14}" y="18" text-anchor="end" font-family='${FONT_MONO}' font-size="9.5" fill="${t.muted}">${safeMeta}</text>`;
  return { defs: "", chrome, contentTop: 36, contentBottom: h - 12, padX: 16 };
}
