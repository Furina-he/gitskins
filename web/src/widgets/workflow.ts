import type {
  CodingRhythmConfig,
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
]);

export const RAW_LIVE_GENERATOR_URL =
  "https://raw.githubusercontent.com/Furina-he/gitskins/main/live-widgets/generate_live_widgets.py";

export function isLiveWidgetId(id: WidgetId): boolean {
  return LIVE_IDS.has(id);
}

function escapeShellDoubleQuote(val: string): string {
  return val.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\$/g, "\\$").replace(/`/g, "\\`");
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
    if (isLiveWidgetId(w.widgetId) && !seen.has(w.widgetId)) {
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

  const city = weatherCfg?.city || "Shanghai";
  const unit = weatherCfg?.unit || "C";
  const tzOffset = rhythmCfg?.tzOffset ?? 8;
  const rssUrl = rssCfg?.feedUrl || "";
  const cron = rhythmCfg?.schedule === "daily" ? "0 0 * * *" : "0 */6 * * *";
  const effectiveAccent =
    accentOverride || active.find((w) => w.accentOverride)?.accentOverride || "";

  const extraFlags: string[] = [];
  if (effectiveAccent) {
    extraFlags.push(`            --accent "${escapeShellDoubleQuote(effectiveAccent)}" \\`);
  }
  if (!animated || active.every((w) => !w.animated)) {
    extraFlags.push(`            --static \\`);
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
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
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
