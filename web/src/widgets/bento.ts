import type { PreviewMode, ThemeTokens } from "../types";
import {
  BENTO_GAP_PX,
  BENTO_ROW_HEIGHT,
  colSpanToPx,
  renderWidgetSvg,
} from "./renderers";
import type {
  BentoRow,
  WidgetInstance,
  WidgetPlacement,
} from "./types";

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Greedily pack widgets within a placement slot into 4-column Bento rows (846px total).
 * Strips (846x48) always occupy their own dedicated row.
 */
export function packBentoRows(items: WidgetInstance[]): BentoRow[] {
  const rows: BentoRow[] = [];
  let current: WidgetInstance[] = [];
  let usedCols = 0;

  const flush = () => {
    if (!current.length) return;
    const isSingleQuote = current.length === 1 && current[0].widgetId === "quote-banner";
    const rowHeight = isSingleQuote ? 122 : BENTO_ROW_HEIGHT;
    rows.push({
      items: current,
      usedCols,
      remainingCols: Math.max(0, 4 - usedCols),
      rowHeight,
      isStrip: false,
    });
    current = [];
    usedCols = 0;
  };

  for (const item of items) {
    if (item.widgetId === "pixel-runway") {
      flush();
      rows.push({
        items: [item],
        usedCols: 4,
        remainingCols: 0,
        rowHeight: 48,
        isStrip: true,
      });
      continue;
    }

    const span = item.colSpan;
    if (usedCols + span > 4) {
      flush();
    }
    current.push(item);
    usedCols += span;
    if (usedCols === 4) {
      flush();
    }
  }
  flush();
  return rows;
}

/**
 * Compose a multi-widget Bento row into a SINGLE standards-compliant 846xH SVG
 * with hoisted <defs> and <style> — zero line-wrap bugs on GitHub README!
 */
export function renderCompositeBentoRowSvg(
  row: BentoRow,
  opts: {
    themeId: string;
    mode: PreviewMode;
    tokens: ThemeTokens;
    globalAccent?: string;
    globalAnimated: boolean;
    rowKey: string;
  }
): string {
  const { themeId, mode, tokens, globalAccent, globalAnimated, rowKey } = opts;

  if (row.items.length === 1) {
    const solo = row.items[0];
    return renderWidgetSvg(solo.widgetId, solo.config, {
      themeId,
      mode,
      tokens,
      colSpan: solo.colSpan,
      targetHeight: row.isStrip ? 48 : solo.widgetId === "skill-dock" ? undefined : row.rowHeight,
      inBentoRow: !row.isStrip,
      accentOverride: solo.accentOverride || globalAccent,
      animated: solo.animated && globalAnimated,
      instanceId: `${rowKey}-0-${solo.uid}`,
    });
  }

  const defsChunks: string[] = [];
  const styleChunks: string[] = [];
  const groups: string[] = [];
  let xOffset = 0;

  row.items.forEach((item, idx) => {
    const childSvg = renderWidgetSvg(item.widgetId, item.config, {
      themeId,
      mode,
      tokens,
      colSpan: item.colSpan,
      targetHeight: row.rowHeight,
      inBentoRow: true,
      accentOverride: item.accentOverride || globalAccent,
      animated: item.animated && globalAnimated,
      instanceId: `${rowKey}-${idx}-${item.uid}`,
    });

    // Extract inner <defs> & <style> so outer composite <svg> is clean SVG 1.1
    let body = childSvg
      .replace(/^<svg[^>]*>/, "")
      .replace(/<\/svg>\s*$/, "")
      .replace(/<title>[\s\S]*?<\/title>/g, "");

    body = body.replace(/<defs>([\s\S]*?)<\/defs>/g, (_m, inner: string) => {
      if (inner.trim()) defsChunks.push(inner.trim());
      return "";
    });
    body = body.replace(/<style>([\s\S]*?)<\/style>/g, (_m, inner: string) => {
      if (inner.trim()) styleChunks.push(inner.trim());
      return "";
    });

    groups.push(`  <g transform="translate(${xOffset}, 0)">\n${body.trim()}\n  </g>`);
    xOffset += colSpanToPx(item.colSpan) + BENTO_GAP_PX;
  });

  // Always output full 846px canvas for 4/4 rows, or exact packed width for partial rows
  const totalW = row.usedCols === 4 ? 846 : Math.max(204, xOffset - BENTO_GAP_PX);
  const h = row.rowHeight;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${h}" viewBox="0 0 ${totalW} ${h}" role="img" aria-label="GitSkins Bento Row (${row.items.map((w) => w.widgetId).join(" + ")})">
  <title>GitSkins Bento Row</title>${defsChunks.length ? `\n  <defs>\n${defsChunks.join("\n")}\n  </defs>` : ""}${styleChunks.length ? `\n  <style>\n${styleChunks.join("\n")}\n  </style>` : ""}
${groups.join("\n")}
</svg>`;
}

export interface BentoPreset {
  id: string;
  layoutTag: string;
  name: string;
  nameZh: string;
  desc: string;
  descZh: string;
  build: (slot: Exclude<WidgetPlacement, "hero-overlay">) => WidgetInstance[];
}

export const BENTO_PRESETS: BentoPreset[] = [
  {
    id: "desk-trio",
    layoutTag: "2 + 1 + 1",
    name: "Desk Companion Trio",
    nameZh: "极客桌面三联",
    desc: "Pixel Companion (2) + Coffee Steam (1) + Rainy Window (1)",
    descZh: "像素桌宠(2格) + 热咖啡(1格) + 像素雨天气窗(1格)",
    build: (slot) => [
      {
        uid: uid("pet"),
        widgetId: "pixel-companion",
        colSpan: 2,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: {
          pet: "cat",
          name: "Mochi",
          mood: "coding",
          message: "Shipping clean 4-col Bento widgets.",
          footerTag: "LV.08 · DESK COMPANION",
        },
      },
      {
        uid: uid("tile"),
        widgetId: "mini-tile",
        colSpan: 1,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: {
          scene: "coffee",
          weather: "rain",
          title: "Hot Brew",
          subtitle: "CAFFEINE · 92%",
        },
      },
      {
        uid: uid("tile"),
        widgetId: "mini-tile",
        colSpan: 1,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: {
          scene: "weather",
          weather: "rain",
          title: "Rainy Compile",
          subtitle: "SHANGHAI · 19°C",
        },
      },
    ],
  },
  {
    id: "vibe-trio",
    layoutTag: "1 + 2 + 1",
    name: "Late-Night Vibe Trio",
    nameZh: "深夜听歌三联",
    desc: "Focus Hourglass (1) + Cassette Deck (2) + Synth Pulse (1)",
    descZh: "专注沙漏(1格) + 复古磁带机(2格) + 跳动频谱(1格)",
    build: (slot) => [
      {
        uid: uid("tile"),
        widgetId: "mini-tile",
        colSpan: 1,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: {
          scene: "hourglass",
          weather: "rain",
          title: "Deep Focus",
          subtitle: "45M SPRINT",
        },
      },
      {
        uid: uid("music"),
        widgetId: "now-playing",
        colSpan: 2,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: {
          media: "cassette",
          track: "Luv(sic.) pt3 (Instrumental)",
          artist: "Nujabes · Late Night Coding",
          note: "ON REPEAT · SIDE A",
          progress: 64,
        },
      },
      {
        uid: uid("tile"),
        widgetId: "mini-tile",
        colSpan: 1,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: {
          scene: "pulse",
          weather: "rain",
          title: "Lo-Fi Synth",
          subtitle: "HI-FI · LIVE",
        },
      },
    ],
  },
  {
    id: "tile-quad",
    layoutTag: "1 + 1 + 1 + 1",
    name: "4× Animated Mini Tiles",
    nameZh: "全动效四联方砖",
    desc: "Coffee + Snow Window + Hourglass + Synth Equalizer",
    descZh: "热咖啡 + 落雪天气窗 + 专注沙漏 + 跳动频谱",
    build: (slot) => [
      {
        uid: uid("tile"),
        widgetId: "mini-tile",
        colSpan: 1,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: { scene: "coffee", weather: "rain", title: "Hot Brew", subtitle: "ACTIVE · 24/7" },
      },
      {
        uid: uid("tile"),
        widgetId: "mini-tile",
        colSpan: 1,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: { scene: "weather", weather: "snow", title: "Winter Dev", subtitle: "SNOW · 2°C" },
      },
      {
        uid: uid("tile"),
        widgetId: "mini-tile",
        colSpan: 1,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: { scene: "hourglass", weather: "rain", title: "Pomodoro", subtitle: "25M FLOW" },
      },
      {
        uid: uid("tile"),
        widgetId: "mini-tile",
        colSpan: 1,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: { scene: "pulse", weather: "rain", title: "Synth Deck", subtitle: "BPM · 96" },
      },
    ],
  },
  {
    id: "stack-duo",
    layoutTag: "1 + 3",
    name: "Coffee + Wide Skill Dock",
    nameZh: "咖啡 + 3格技术栈双拼",
    desc: "Hot Brew Tile (1) + 3-col Themed Skill Dock (3)",
    descZh: "热咖啡方砖(1格) + 3格宽版技术栈机架(3格)",
    build: (slot) => [
      {
        uid: uid("tile"),
        widgetId: "mini-tile",
        colSpan: 1,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: { scene: "coffee", weather: "rain", title: "Brewing", subtitle: "DAILY STACK" },
      },
      {
        uid: uid("skills"),
        widgetId: "skill-dock",
        colSpan: 3,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: {
          title: "Core Stack & Toolchain",
          subtitle: "PRODUCTION",
          skills: "Rust, TypeScript, Python, React, Tauri, Docker, Linux, Cloudflare, SQLite",
        },
      },
    ],
  },
  {
    id: "live-telemetry",
    layoutTag: "LIVE · 2 + 2",
    name: "Zero-503 Live Stats & Rhythm",
    nameZh: "零 503 定时统计 + 作息双拼",
    desc: "Auto-updated GitHub Stats (2) + Coding Rhythm Histogram (2)",
    descZh: "GitHub Actions 定时刷新：统计仪表盘(2格) + 编码作息图(2格)",
    build: (slot) => [
      {
        uid: uid("lstats"),
        widgetId: "github-stats",
        colSpan: 2,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: {
          username: "Furina-he",
          stars: 148,
          repos: 16,
          followers: 52,
          prs: 38,
          languages: "Rust:42, TypeScript:31, Python:19, Shell:8",
        },
      },
      {
        uid: uid("lrhythm"),
        widgetId: "coding-rhythm",
        colSpan: 2,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: {
          tzOffset: 8,
          persona: "evening",
          schedule: "6h",
        },
      },
    ],
  },
  {
    id: "live-weather-rss",
    layoutTag: "LIVE · 1 + 3",
    name: "Live Weather + Blog RSS",
    nameZh: "实时城市天气 + 博客 RSS 双拼",
    desc: "Open-Meteo Weather Window (1) + Latest RSS Posts (3)",
    descZh: "城市实时像素天气窗(1格) + 最近博客 RSS 文章列表(3格)",
    build: (slot) => [
      {
        uid: uid("lwx"),
        widgetId: "live-weather",
        colSpan: 1,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: {
          city: "Shanghai",
          unit: "C",
          condition: "rain",
          temp: 19,
          humidity: 74,
        },
      },
      {
        uid: uid("lrss"),
        widgetId: "rss-feed",
        colSpan: 3,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: {
          feedUrl: "https://example.com/rss.xml",
          source: "gitskins.blessc.com",
          post1: "Designing Deterministic SVG Themes for AI Agents",
          post2: "Zero-503 GitHub Profile Widgets via GitHub Actions",
          post3: "4-Column 846px Bento Grids Without Wrap Glitches",
        },
      },
    ],
  },
  {
    id: "live-waka-spotify",
    layoutTag: "LIVE · 2 + 2",
    name: "WakaTime + Spotify Deck",
    nameZh: "WakaTime + Spotify 活挂件双拼",
    desc: "7-Day WakaTime Coding Hours (2) + Spotify Live Vinyl Deck (2)",
    descZh: "WakaTime 近7天编程时长(2格) + Spotify 最近循环黑胶(2格)",
    build: (slot) => [
      {
        uid: uid("lwaka"),
        widgetId: "wakatime-weekly",
        colSpan: 2,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: {
          totalHours: "38h 42m",
          dailyAvg: "5h 31m",
          editor: "VS Code",
          languages: "TypeScript:44, Rust:28, Python:18, CSS:10",
        },
      },
      {
        uid: uid("lspot"),
        widgetId: "spotify-recent",
        colSpan: 2,
        placement: slot,
        accentOverride: "",
        animated: true,
        config: {
          track: "Aruarian Dance",
          artist: "Nujabes",
          album: "Samurai Champloo OST",
          status: "NOW PLAYING",
          progress: 68,
          duration: "4:10",
        },
      },
    ],
  },
];
