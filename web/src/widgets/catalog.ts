import type { Lang, SkinTheme } from "../types";
import { packBentoRows } from "./bento";
import { colSpanToPx } from "./renderers";
import type {
  BentoColSpan,
  HeroAnchor,
  HeroStickerConfig,
  WidgetCatalogEntry,
  WidgetId,
  WidgetInstance,
  WidgetPlacement,
} from "./types";

export const STANDARD_PLACEMENTS: WidgetPlacement[] = [
  "top",
  "under-hero",
  "under-cards",
  "bottom",
];

export const STICKER_PLACEMENTS: WidgetPlacement[] = [
  "hero-overlay",
  "under-hero",
  "under-cards",
  "bottom",
];

export const WIDGET_CATALOG: WidgetCatalogEntry[] = [
  {
    id: "pixel-companion",
    code: "W01",
    name: "Pixel Companion",
    nameZh: "像素伴侣 / 代码桌宠",
    desc: "Animated 14x12 pixel pet with speech bubble, mood LED, and 2/3/4-col Bento sizing.",
    descZh: "自带双帧眨眼动效与自定义台词气泡的像素桌宠，支持 2/3/4 格灵活拼装。",
    defaultColSpan: 2,
    supportedColSpans: [2, 3, 4],
    defaultPlacement: "under-cards",
    supportedPlacements: STANDARD_PLACEMENTS,
    defaultConfig: {
      pet: "cat",
      name: "Mochi",
      mood: "coding",
      message: "Shipping GitSkins 4-col Bento widgets — crisp SVGs.",
      footerTag: "LV.08 · DESK COMPANION",
    },
  },
  {
    id: "now-playing",
    code: "W02",
    name: "Now Playing Deck",
    nameZh: "复古磁带 / 黑胶唱片机",
    desc: "Spinning cassette tape or vinyl record card with equalizer and 2/3/4-col layouts.",
    descZh: "支持双卷轴磁带与黑胶唱片切换，带旋转动效、均衡器与 2/3/4 格自适应。",
    defaultColSpan: 2,
    supportedColSpans: [2, 3, 4],
    defaultPlacement: "under-cards",
    supportedPlacements: STANDARD_PLACEMENTS,
    defaultConfig: {
      media: "cassette",
      track: "Luv(sic.) pt3 (Instrumental)",
      artist: "Nujabes · Late Night Coding",
      note: "ON REPEAT · SIDE A",
      progress: 64,
    },
  },
  {
    id: "dev-badge",
    code: "W03",
    name: "Developer Status Pass",
    nameZh: "开发者状态牌 / 极客工牌",
    desc: "Workstation ID card with status pill, current build focus, timezone, and focus meter.",
    descZh: "包含在线状态灯、当前专注项目、时区坐标与分段能量条的个人工牌（2/3/4 格）。",
    defaultColSpan: 2,
    supportedColSpans: [2, 3, 4],
    defaultPlacement: "under-cards",
    supportedPlacements: STANDARD_PLACEMENTS,
    defaultConfig: {
      handle: "@Furina-he",
      role: "Indie Developer · Local-First AI Tools",
      focus: "Modular GitHub profile widgets & agent guardrails",
      location: "UTC+8 · Shanghai",
      status: "shipping",
      meterLabel: "FOCUS",
      meterValue: 82,
    },
  },
  {
    id: "skill-dock",
    code: "W04",
    name: "Themed Skill Dock",
    nameZh: "主题化技术栈机架",
    desc: "Uniform skin-matched tech stack rack (2/3/4-col) replacing mismatched badges.",
    descZh: "按当前皮肤自动重绘的统一技术栈矩阵，支持 2/3/4 格与方砖混拼。",
    defaultColSpan: 4,
    supportedColSpans: [2, 3, 4],
    defaultPlacement: "under-cards",
    supportedPlacements: STANDARD_PLACEMENTS,
    defaultConfig: {
      title: "Core Stack & Daily Toolchain",
      subtitle: "PRODUCTION STACK",
      skills: "Rust, TypeScript, Python, React, Tauri, Electron, Docker, Linux, Cloudflare, SQLite",
    },
  },
  {
    id: "quote-banner",
    code: "W05",
    name: "Manifesto Banner",
    nameZh: "极简宣言 / 终端名言条幅",
    desc: "Typographic motto banner (2/3/4-col) adapting from Swiss poster to CRT fortune block.",
    descZh: "支持 2/3/4 格的宣言横幅，在瑞士海报、蓝图标注、报刊引文与终端间自动变形。",
    defaultColSpan: 4,
    supportedColSpans: [2, 3, 4],
    defaultPlacement: "bottom",
    supportedPlacements: STANDARD_PLACEMENTS,
    defaultConfig: {
      quote: "Build tools that stay calm, deterministic, and sharp on every screen.",
      author: "ENGINEERING NOTE · 2026",
      tag: "MANIFESTO",
    },
  },
  {
    id: "hero-sticker",
    code: "W06",
    name: "Hero Corner Sticker",
    nameZh: "Hero 角落贴纸 / 扒边挂坠",
    desc: "Compact animated charm embedded directly onto Hero corners or a 1-col Bento slot.",
    descZh: "可直接合成到 Hero 四角动的小挂坠（扒边猫/旋转章/热咖啡/雷达），也可拼入 1 格 Bento。",
    defaultColSpan: 1,
    supportedColSpans: [1],
    isSticker: true,
    defaultPlacement: "hero-overlay",
    supportedPlacements: STICKER_PLACEMENTS,
    defaultConfig: {
      motif: "peeker",
      label: "SHIPPING",
      sublabel: "MOCHI · LIVE",
      anchor: "bottom-right",
    },
  },
  {
    id: "pixel-runway",
    code: "W07",
    name: "Animated Runway Strip",
    nameZh: "像素巡逻跑道 / 跑马灯条",
    desc: "846x48 living divider with patrolling pixel sprite, LED ticker, or EKG pulse wave.",
    descZh: "846×48 超薄动态分割线：像素小宠整行巡逻、复古 LED 滚动字幕或示波器波形。",
    defaultColSpan: 4,
    supportedColSpans: [4],
    isStrip: true,
    defaultPlacement: "under-hero",
    supportedPlacements: STANDARD_PLACEMENTS,
    defaultConfig: {
      mode: "patrol",
      runner: "cat",
      tag: "PATROL",
      text: "SHIPPING LOCAL-FIRST AI TOOLS · RUST · TYPESCRIPT · PYTHON · OPEN SOURCE",
      speed: "normal",
    },
  },
  {
    id: "mini-tile",
    code: "W08",
    name: "Mini Bento Tile",
    nameZh: "迷你动态方砖 (1~2 格)",
    desc: "204x160 Bento tile (coffee, weather, hourglass, synth) — combine 4-up or mix with cards!",
    descZh: "160px 等高动态小方砖（咖啡/天气窗/沙漏/频谱），支持四联或与任意卡片无留白混拼。",
    defaultColSpan: 1,
    supportedColSpans: [1, 2],
    defaultPlacement: "under-hero",
    supportedPlacements: STANDARD_PLACEMENTS,
    defaultConfig: {
      scene: "weather",
      weather: "rain",
      title: "Rainy Compile",
      subtitle: "SHANGHAI · 19°C",
    },
  },
];

export const ACCENT_PRESETS = [
  { label: "Skin Default", labelZh: "跟随皮肤", hex: "" },
  { label: "Hydro Cyan", labelZh: "水蓝", hex: "#00A3CC" },
  { label: "Vermilion", labelZh: "朱红", hex: "#E45847" },
  { label: "Phosphor", labelZh: "荧光绿", hex: "#10B981" },
  { label: "Cobalt", labelZh: "钴蓝", hex: "#2563EB" },
  { label: "Amber", labelZh: "琥珀", hex: "#D97706" },
  { label: "Orchid", labelZh: "紫罗兰", hex: "#9333EA" },
];

export function getWidgetMeta(id: WidgetId): WidgetCatalogEntry {
  return WIDGET_CATALOG.find((w) => w.id === id) ?? WIDGET_CATALOG[0];
}

export function createDefaultWidgetInstance(
  widgetId: WidgetId,
  overrides?: { colSpan?: BentoColSpan; placement?: WidgetPlacement }
): WidgetInstance {
  const meta = getWidgetMeta(widgetId);
  return {
    uid: `${widgetId}-${Math.random().toString(36).slice(2, 7)}`,
    widgetId,
    colSpan: overrides?.colSpan ?? meta.defaultColSpan,
    placement: overrides?.placement ?? meta.defaultPlacement,
    accentOverride: "",
    animated: true,
    config: { ...meta.defaultConfig },
  };
}

export function placementLabel(p: WidgetPlacement, lang: Lang): string {
  const map: Record<WidgetPlacement, { en: string; zh: string }> = {
    top: { en: "Above Hero", zh: "Hero 顶部" },
    "hero-overlay": { en: "On Hero Corner", zh: "叠在 Hero 上" },
    "under-hero": { en: "Under Hero", zh: "Hero 下方" },
    "under-cards": { en: "Under Projects", zh: "项目卡下方" },
    bottom: { en: "Page Footer", zh: "最底部" },
  };
  return lang === "zh" ? map[p].zh : map[p].en;
}

export function colSpanLabel(span: BentoColSpan, lang: Lang, isStrip?: boolean, isSticker?: boolean): string {
  if (isStrip) return "846×48";
  if (isSticker) return "132×92";
  const px = colSpanToPx(span);
  return lang === "zh" ? `${span}格 · ${px}px` : `${span} col${span > 1 ? "s" : ""} · ${px}px`;
}

export function buildWidgetMarkdown(
  fileBase: string,
  alt: string,
  colSpan: BentoColSpan,
  layoutStyle: "standard" | "float-right" = "standard",
  isSticker = false
): string {
  if (layoutStyle === "float-right") {
    const px = isSticker ? "160" : "204";
    return [
      `<picture>`,
      `  <source media="(prefers-color-scheme: dark)" srcset="./assets/${fileBase}-dark.svg">`,
      `  <img align="right" src="./assets/${fileBase}-light.svg" alt="${alt}" width="${px}">`,
      `</picture>`,
    ].join("\n");
  }
  const widthAttr =
    colSpan === 4
      ? 'width="100%"'
      : colSpan === 3
        ? 'width="74%"'
        : colSpan === 2
          ? 'width="49%"'
          : isSticker
            ? 'width="156"'
            : 'width="24%"';
  return [
    `<picture>`,
    `  <source media="(prefers-color-scheme: dark)" srcset="./assets/${fileBase}-dark.svg">`,
    `  <img src="./assets/${fileBase}-light.svg" alt="${alt}" ${widthAttr}>`,
    `</picture>`,
  ].join("\n");
}

export function validateSvgXml(svg: string): boolean {
  if (typeof DOMParser === "undefined") {
    return svg.startsWith("<svg") && svg.endsWith("</svg>");
  }
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  return doc.getElementsByTagName("parsererror").length === 0;
}

export function downloadSvgFile(filename: string, svg: string): void {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function mergeStickerIntoHeroSvg(
  heroSvg: string,
  stickerSvg: string,
  anchor: HeroAnchor
): string {
  const vbMatch = heroSvg.match(/viewBox="0\s+0\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)"/);
  const heroW = vbMatch ? parseFloat(vbMatch[1]) : 846;
  const heroH = vbMatch ? parseFloat(vbMatch[2]) : 294;
  const sw = 132;
  const sh = 92;
  const scale = 0.88;
  const effW = sw * scale;
  const effH = sh * scale;
  const padX = 16;
  const padTop = 34;
  const padBot = 32;

  const posMap: Record<HeroAnchor, { x: number; y: number }> = {
    "top-left": { x: padX, y: padTop },
    "top-right": { x: Math.round(heroW - effW - padX), y: padTop },
    "bottom-left": { x: padX, y: Math.round(heroH - effH - padBot) },
    "bottom-right": { x: Math.round(heroW - effW - padX), y: Math.round(heroH - effH - padBot) },
  };
  const { x, y } = posMap[anchor] ?? posMap["bottom-right"];

  const inner = stickerSvg
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .trim();

  const overlayBlock = `\n  <!-- GitSkins Embedded Hero Sticker (${anchor}) -->\n  <g id="gitskins-hero-sticker-${anchor}" transform="translate(${x}, ${y}) scale(${scale})">\n${inner}\n  </g>\n`;
  const closingIdx = heroSvg.lastIndexOf("</svg>");
  if (closingIdx < 0) return heroSvg;
  return `${heroSvg.slice(0, closingIdx)}${overlayBlock}${heroSvg.slice(closingIdx)}`;
}

export function buildSingleWidgetPrompt(
  instance: WidgetInstance,
  theme: SkinTheme,
  lang: Lang
): string {
  const meta = getWidgetMeta(instance.widgetId);
  const cfgJson = JSON.stringify(instance.config);
  const slotText = placementLabel(instance.placement, lang);

  if (instance.widgetId === "hero-sticker" && instance.placement === "hero-overlay") {
    const anchor = (instance.config as HeroStickerConfig).anchor;
    if (lang === "zh") {
      return [
        `请将 GitSkins 动态角落贴纸「${meta.nameZh}（${instance.widgetId}）」直接嵌入合成到我的 GitHub 主页 Hero SVG（assets/hero-light.svg 与 assets/hero-dark.svg）中。`,
        `- 视觉风格跟随主题：${theme.nameZh}（${theme.id}），参考规范：${theme.links.spec}`,
        `- 贴纸尺寸与锚点：132×92，嵌入在 Hero 的 ${anchor} 角落（直接作为 <g transform="translate(...) scale(0.88)"> 图层写入 hero.svg 内）`,
        `- 强调色覆盖：${instance.accentOverride || "跟随主题默认"}，动效：${instance.animated ? "克制 CSS 动效（含 prefers-reduced-motion）" : "纯静态"}`,
        `- 贴纸配置：${cfgJson}`,
      ].join("\n");
    }
    return [
      `Embed the GitSkins animated corner sticker "${meta.name}" (${instance.widgetId}) directly into my GitHub Profile Hero SVGs (assets/hero-light.svg & assets/hero-dark.svg).`,
      `- Match theme system: ${theme.name} (${theme.id}) — spec: ${theme.links.spec}`,
      `- Sticker anchor: 132x92 embedded at the ${anchor} corner of hero.svg as a native <g transform="translate(...) scale(0.88)"> layer`,
      `- Accent override: ${instance.accentOverride || "theme default"}, motion: ${instance.animated ? "calm CSS keyframes with prefers-reduced-motion" : "static SVG"}`,
      `- Config: ${cfgJson}`,
    ].join("\n");
  }

  const sizeText = colSpanLabel(instance.colSpan, lang, meta.isStrip, meta.isSticker);
  if (lang === "zh") {
    return [
      `请为我的 GitHub 个人主页新增一个 GitSkins DIY 小挂件「${meta.nameZh}（${instance.widgetId}）」。`,
      `- 视觉风格跟随主题：${theme.nameZh}（${theme.id}），参考规范：${theme.links.spec}`,
      `- 4 列 Bento 占宽与插槽：${sizeText}，位置：${slotText}，强调色：${instance.accentOverride || "跟随主题默认"}，动效：${instance.animated ? "克制 CSS 动效" : "纯静态"}`,
      `- 自定义配置：${cfgJson}`,
      `- 输出 Light / Dark 双主题 SVG 到 assets/widget-${instance.widgetId}-{light,dark}.svg，严格 XML 校验并用 <picture> 挂载。`,
    ].join("\n");
  }

  return [
    `Add a GitSkins DIY widget "${meta.name}" (${instance.widgetId}) to my GitHub Profile README.`,
    `- Match theme system: ${theme.name} (${theme.id}) — spec: ${theme.links.spec}`,
    `- 4-col Bento width & slot: ${sizeText} at "${slotText}", accent: ${instance.accentOverride || "theme default"}, motion: ${instance.animated ? "calm CSS keyframes" : "static SVG"}`,
    `- Config: ${cfgJson}`,
    `- Export paired assets/widget-${instance.widgetId}-{light,dark}.svg, validate strict XML, and mount via <picture>.`,
  ].join("\n");
}

export function buildCombinedProfilePrompt(
  basePrompt: string,
  loadout: WidgetInstance[],
  theme: SkinTheme,
  lang: Lang
): string {
  if (!loadout.length) return basePrompt;

  const slotOrder: WidgetPlacement[] = ["hero-overlay", "top", "under-hero", "under-cards", "bottom"];
  const sections: string[] = [];

  for (const slot of slotOrder) {
    const items = loadout.filter((w) => w.placement === slot);
    if (!items.length) continue;
    const slotName = placementLabel(slot, lang);

    if (slot === "hero-overlay") {
      const list = items.map((w, i) => {
        const anchor = (w.config as HeroStickerConfig).anchor;
        return `  - Sticker #${i + 1}: anchor=${anchor}, accent=${w.accentOverride || "theme"}, config=${JSON.stringify(w.config)}`;
      });
      sections.push(`- [${slotName}] (embed inside hero-{light,dark}.svg):\n${list.join("\n")}`);
      continue;
    }

    const rows = packBentoRows(items);
    const rowLines = rows.map((row, rIdx) => {
      const desc = row.items
        .map((w) => {
          const m = getWidgetMeta(w.widgetId);
          return `[${w.widgetId} (${w.colSpan}/4) "${lang === "zh" ? m.nameZh : m.name}" cfg=${JSON.stringify(w.config)}]`;
        })
        .join(" + ");
      const composeHint =
        row.items.length > 1
          ? lang === "zh"
            ? " -> 合并为单张 846×160 整行 Bento SVG"
            : " -> compose into one 846x160 row SVG"
          : "";
      return `  - Row ${rIdx + 1} (${row.usedCols}/4 cols): ${desc}${composeHint}`;
    });
    sections.push(`- [${slotName}]:\n${rowLines.join("\n")}`);
  }

  if (lang === "zh") {
    return `${basePrompt}\n\n### 附加 DIY Bento 挂件拼装方案（4 列 846px 栅格，160px 等高对齐）\n所有挂件继承「${theme.nameZh}」Light/Dark 语义令牌；同一行含多个挂件时直接合成为单张 846×160 的整行 SVG（width="100%"）避免 GitHub 换行错位：\n${sections.join("\n")}`;
  }

  return `${basePrompt}\n\n### Mounted DIY Bento Widgets (4-column 846px grid, 160px uniform row height)\nStyle all widgets with "${theme.name}" Light/Dark semantic tokens; compose any multi-widget row into a single 846x160 row SVG (width="100%") to avoid GitHub line-wrap drift:\n${sections.join("\n")}`;
}
