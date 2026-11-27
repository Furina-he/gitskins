import type { PreviewMode, SkinTheme, ThemeTokens } from "../types";
import type {
  CodingRhythmConfig,
  ContributionSnakeConfig,
  LiveWeatherConfig,
  RssFeedConfig,
  WidgetId,
  WidgetInstance,
} from "./types";

const LIVE_IDS = new Set<WidgetId>([
  "github-stats",
  "coding-rhythm",
  "rss-feed",
  "live-weather",
  "wakatime-weekly",
  "spotify-recent",
  "contribution-snake",
  "contrib-skyline",
  "commit-streak",
  "recent-activity",
]);

export const RAW_LIVE_GENERATOR_URL =
  "https://raw.githubusercontent.com/Furina-he/gitskins/main/live-widgets/generate_live_widgets.py";

export function isLiveWidgetId(id: WidgetId): boolean {
  return LIVE_IDS.has(id);
}

export function isPlataneSnakeInstance(w: WidgetInstance): boolean {
  return (
    w.widgetId === "contribution-snake" &&
    (w.config as ContributionSnakeConfig).engine !== "gitskins-svg"
  );
}

export interface SnakeThemePalette {
  snake: string;
  dots: [string, string, string, string, string];
}

const CURATED_SNAKE_PALETTES: Record<
  string,
  Record<PreviewMode, SnakeThemePalette>
> = {
  "swiss-bauhaus-pixel": {
    light: {
      snake: "#00A3CC",
      dots: ["#EAE8E1", "#B5E2F2", "#5AC1E4", "#2370E8", "#111214"],
    },
    dark: {
      snake: "#38BDF8",
      dots: ["#1B1F29", "#143A54", "#1D5E87", "#38BDF8", "#F5B700"],
    },
  },
  "blueprint-cad": {
    light: {
      snake: "#1D5BB8",
      dots: ["#E3ECF7", "#B8D3F2", "#6DA6E6", "#1D5BB8", "#0C2340"],
    },
    dark: {
      snake: "#38BDF8",
      dots: ["#10294A", "#164070", "#1E63A6", "#38BDF8", "#FBBF24"],
    },
  },
  "editorial-zine": {
    light: {
      snake: "#C93B2B",
      dots: ["#EAE3D5", "#D4C8B4", "#A49987", "#524D45", "#141311"],
    },
    dark: {
      snake: "#E45847",
      dots: ["#221F1B", "#3D372F", "#6F665B", "#B5ABA0", "#F0EBE1"],
    },
  },
  "crt-terminal": {
    light: {
      snake: "#0E7C5B",
      dots: ["#E4DFD2", "#B4DFD0", "#5BBF9F", "#0E7C5B", "#182026"],
    },
    dark: {
      snake: "#34D399",
      dots: ["#141E24", "#103D31", "#146E53", "#34D399", "#A7F3D0"],
    },
  },
  "pixel-rpg-hud": {
    light: {
      snake: "#D97706",
      dots: ["#E6DFCB", "#C7DEC0", "#6DBE7D", "#15803D", "#D97706"],
    },
    dark: {
      snake: "#FACC15",
      dots: ["#1F2640", "#1E4D3C", "#2E8555", "#4ADE80", "#FACC15"],
    },
  },
  "seal-ink-scroll": {
    light: {
      snake: "#C4362C",
      dots: ["#EAE2D3", "#CFC5B4", "#9E9485", "#575049", "#1C1917"],
    },
    dark: {
      snake: "#E0564A",
      dots: ["#23201C", "#3E3932", "#6B6358", "#A89E8E", "#F2ECE1"],
    },
  },
  "synth-hardware": {
    light: {
      snake: "#FF5200",
      dots: ["#DFDBD2", "#F5C6AE", "#FF9361", "#FF5200", "#141517"],
    },
    dark: {
      snake: "#FF6B2B",
      dots: ["#1D1F26", "#4A271A", "#8F3E1D", "#FF6B2B", "#FACC15"],
    },
  },
  "pcb-solder-mask": {
    light: {
      snake: "#B87D14",
      dots: ["#E3E7E2", "#BFE0CE", "#63B08B", "#1C6B4A", "#B87D14"],
    },
    dark: {
      snake: "#E5B84B",
      dots: ["#112B20", "#174A36", "#227554", "#34D399", "#E5B84B"],
    },
  },
  "transit-boarding": {
    light: {
      snake: "#D93829",
      dots: ["#EAE3D5", "#BDD2EE", "#6899D9", "#1B56B5", "#D93829"],
    },
    dark: {
      snake: "#F59E0B",
      dots: ["#1D2028", "#2B3A57", "#3D67A8", "#60A5FA", "#F59E0B"],
    },
  },
  "classic-desktop-os": {
    light: {
      snake: "#2455C8",
      dots: ["#D8D6CE", "#B8C7E8", "#7496DF", "#2455C8", "#111111"],
    },
    dark: {
      snake: "#60A5FA",
      dots: ["#22242C", "#1F375C", "#2E5A9E", "#60A5FA", "#FACC15"],
    },
  },
  "riso-duotone": {
    light: {
      snake: "#FF4F5E",
      dots: ["#EAE3D3", "#B5D2F2", "#5C9EE6", "#0066CC", "#FF4F5E"],
    },
    dark: {
      snake: "#FF5E7E",
      dots: ["#1E212E", "#164457", "#187E9C", "#22D3EE", "#FF5E7E"],
    },
  },
};

function parseHexRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixHex(a: string, b: string, ratio: number): string {
  const ra = parseHexRgb(a);
  const rb = parseHexRgb(b);
  if (!ra || !rb) return b;
  const r = Math.round(ra[0] + (rb[0] - ra[0]) * ratio);
  const g = Math.round(ra[1] + (rb[1] - ra[1]) * ratio);
  const bl = Math.round(ra[2] + (rb[2] - ra[2]) * ratio);
  return `#${[r, g, bl].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

export function getSnakePaletteForTheme(
  themeId: string,
  mode: PreviewMode,
  tokens: ThemeTokens,
  accentOverride?: string
): SnakeThemePalette {
  const cleanAccent =
    accentOverride && /^#[0-9a-fA-F]{6}$/.test(accentOverride.trim())
      ? accentOverride.trim().toUpperCase()
      : "";
  const curated = CURATED_SNAKE_PALETTES[themeId]?.[mode];
  if (curated && !cleanAccent) {
    return curated;
  }
  const snake = cleanAccent || tokens.accent;
  const empty = curated ? curated.dots[0] : mixHex(tokens.surface, tokens.borderSoft, mode === "dark" ? 0.42 : 0.38);
  return {
    snake,
    dots: [
      empty,
      mixHex(empty, snake, 0.28),
      mixHex(empty, snake, 0.56),
      snake,
      mode === "dark" ? tokens.highlight : tokens.ink,
    ],
  };
}

function escapeShellDoubleQuote(val: string): string {
  return val.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\$/g, "\\$").replace(/`/g, "\\`");
}

export function buildSnakeWorkflowYaml(params: {
  theme: SkinTheme;
  username?: string;
  accentOverride?: string;
  schedule?: "daily" | "6h";
}): string {
  const { theme, username = "", accentOverride = "", schedule = "daily" } = params;
  const lightPal = getSnakePaletteForTheme(theme.id, "light", theme.tokens.light, accentOverride);
  const darkPal = getSnakePaletteForTheme(theme.id, "dark", theme.tokens.dark, accentOverride);
  const cron = schedule === "6h" ? "0 */6 * * *" : "0 0 * * *";
  const userExpr = username.trim()
    ? username.trim().replace(/^@+/, "")
    : "${{ github.repository_owner }}";

  const lightQuery = `color_snake=${lightPal.snake}&color_dots=${lightPal.dots.join(",")}`;
  const darkQuery = `palette=github-dark&color_snake=${darkPal.snake}&color_dots=${darkPal.dots.join(",")}`;

  return `name: Generate GitSkins Contribution Snake

on:
  schedule:
    - cron: "${cron}"
  workflow_dispatch:
  push:
    branches:
      - main

jobs:
  generate:
    permissions:
      contents: write
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: Generate theme-matched GitHub contribution snake (${theme.id})
        uses: Platane/snk/svg-only@v3
        with:
          github_user_name: ${userExpr}
          outputs: |
            dist/github-contribution-grid-snake.svg?${lightQuery}
            dist/github-contribution-grid-snake-dark.svg?${darkQuery}

      - name: Push snake SVGs to output branch
        uses: crazy-max/ghaction-github-pages@v3.1.0
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;
}

export function buildSnakePlataneMarkdown(username: string): string {
  const cleanUser = (username || "<your-username>").replace(/^@+/, "");
  return [
    `<picture>`,
    `  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${cleanUser}/${cleanUser}/output/github-contribution-grid-snake-dark.svg">`,
    `  <img src="https://raw.githubusercontent.com/${cleanUser}/${cleanUser}/output/github-contribution-grid-snake.svg" alt="${cleanUser} GitHub contribution snake animation" width="100%">`,
    `</picture>`,
  ].join("\n");
}

export function buildLiveWorkflowYaml(params: {
  themeId: string;
  liveWidgets: WidgetInstance[];
  accentOverride?: string;
  animated?: boolean;
}): string {
  const { themeId, liveWidgets, accentOverride = "", animated = true } = params;
  const seen = new Map<WidgetId, WidgetInstance>();
  for (const w of liveWidgets) {
    if (isLiveWidgetId(w.widgetId) && !isPlataneSnakeInstance(w) && !seen.has(w.widgetId)) {
      seen.set(w.widgetId, w);
    }
  }
  const active = Array.from(seen.values());
  const widgetArg = active.length
    ? active.map((w) => `${w.widgetId}:${w.colSpan}`).join(",")
    : "github-stats:2,coding-rhythm:2";

  const weatherInst = seen.get("live-weather");
  const weatherCfg = weatherInst ? (weatherInst.config as LiveWeatherConfig) : null;
  const rhythmInst = seen.get("coding-rhythm");
  const rhythmCfg = rhythmInst ? (rhythmInst.config as CodingRhythmConfig) : null;
  const rssInst = seen.get("rss-feed");
  const rssCfg = rssInst ? (rssInst.config as RssFeedConfig) : null;
  const snakeInst = seen.get("contribution-snake");
  const snakeCfg = snakeInst ? (snakeInst.config as ContributionSnakeConfig) : null;

  const city = weatherCfg?.city || "Shanghai";
  const unit = weatherCfg?.unit || "C";
  const tzOffset = rhythmCfg?.tzOffset ?? 8;
  const rssUrl = rssCfg?.feedUrl || "";
  const cron =
    rhythmCfg?.schedule === "daily" || (!rhythmCfg && snakeCfg?.schedule === "daily")
      ? "0 0 * * *"
      : "0 */6 * * *";
  const effectiveAccent =
    accentOverride || active.find((w) => w.accentOverride)?.accentOverride || "";

  const extraFlags: string[] = [];
  if (effectiveAccent) {
    extraFlags.push(`            --accent "${escapeShellDoubleQuote(effectiveAccent)}" \\`);
  }
  if (!animated || active.every((w) => !w.animated)) {
    extraFlags.push(`            --static \\`);
  }

  const extraEnvLines: string[] = [`          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`];
  if (seen.has("wakatime-weekly")) {
    extraEnvLines.push(`          WAKATIME_API_KEY: \${{ secrets.WAKATIME_API_KEY }}`);
  }
  if (seen.has("spotify-recent")) {
    extraEnvLines.push(`          SPOTIFY_CLIENT_ID: \${{ secrets.SPOTIFY_CLIENT_ID }}`);
    extraEnvLines.push(`          SPOTIFY_CLIENT_SECRET: \${{ secrets.SPOTIFY_CLIENT_SECRET }}`);
    extraEnvLines.push(`          SPOTIFY_REFRESH_TOKEN: \${{ secrets.SPOTIFY_REFRESH_TOKEN }}`);
  }

  return `name: Update GitSkins Live Widgets

on:
  schedule:
    - cron: "${cron}"
  workflow_dispatch:

permissions:
  contents: write

jobs:
  update-live-widgets:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout profile repository
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Generate theme-matched live SVGs (zero pip deps)
        env:
${extraEnvLines.join("\n")}
        run: |
          if [ ! -f scripts/generate_live_widgets.py ]; then
            mkdir -p scripts
            curl -fsSL "${RAW_LIVE_GENERATOR_URL}" -o scripts/generate_live_widgets.py
          fi
          python scripts/generate_live_widgets.py \\
            --username "\${{ github.repository_owner }}" \\
            --theme "${themeId}" \\
            --widgets "${widgetArg}" \\
            --city "${escapeShellDoubleQuote(city)}" \\
            --unit "${unit}" \\
            --tz-offset "${tzOffset}" \\
            --rss-url "${escapeShellDoubleQuote(rssUrl)}" \\
${extraFlags.length ? extraFlags.join("\n") + "\n" : ""}            --out-dir "assets"

      - name: Commit & push updated SVGs if changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add assets/live-*.svg
          if ! git diff --cached --quiet; then
            git commit -m "chore(gitskins): refresh live profile widgets"
            git push
          fi
`;
}
