import { useEffect, useMemo, useRef, useState } from "react";
import { COPY } from "../i18n";
import type { Lang, PreviewMode, SkinTheme } from "../types";
import {
  ACCENT_PRESETS,
  WIDGET_CATALOG,
  buildSingleWidgetPrompt,
  buildWidgetMarkdown,
  colSpanLabel,
  downloadSvgFile,
  getWidgetMeta,
  mergeStickerIntoHeroSvg,
  placementLabel,
  validateSvgXml,
} from "../widgets/catalog";
import { colSpanToPx, renderWidgetSvg } from "../widgets/renderers";
import {
  buildLiveWorkflowYaml,
  buildSnakePlataneMarkdown,
  buildSnakeWorkflowYaml,
  getSnakePaletteForTheme,
  isLiveWidgetId,
  isPlataneSnakeInstance,
} from "../widgets/workflow";
import ThemePicker from "./ThemePicker";
import type {
  BentoColSpan,
  CodingRhythmConfig,
  CommitStreakConfig,
  ContribSkylineConfig,
  ContributionSnakeConfig,
  DevBadgeConfig,
  DevStatus,
  GitHubStatsConfig,
  HeroAnchor,
  HeroStickerConfig,
  KeycapRigConfig,
  LiveWeatherCondition,
  LiveWeatherConfig,
  MediaKind,
  MiniTileConfig,
  MiniTileScene,
  NowPlayingConfig,
  PetKind,
  PetMood,
  PixelCompanionConfig,
  PixelRunwayConfig,
  QrPassConfig,
  QuoteBannerConfig,
  RecentActivityConfig,
  RhythmPersona,
  RssFeedConfig,
  RunwayMode,
  RunwaySpeed,
  SkillDockConfig,
  SkillRadarConfig,
  SnakeEngine,
  SplitFlapConfig,
  SpotifyRecentConfig,
  StickerMotif,
  WakaTimeWeeklyConfig,
  WeatherKind,
  WidgetConfigMap,
  WidgetId,
  WidgetInstance,
} from "../widgets/types";

type StageScheme = PreviewMode | "both";
type MarkdownMode = "standard" | "float-right";
type CatalogFilter = "all" | "static" | "live";

interface WidgetsStudioProps {
  themes: SkinTheme[];
  activeTheme: SkinTheme;
  onSelectTheme: (id: string) => void;
  previewMode: PreviewMode;
  onChangePreviewMode: (mode: PreviewMode) => void;
  lang: Lang;
  selectedWidgetId: WidgetId;
  onSelectWidgetId: (id: WidgetId) => void;
  drafts: Record<WidgetId, WidgetInstance>;
  onUpdateDraft: (id: WidgetId, next: WidgetInstance) => void;
  onResetDraft: (id: WidgetId) => void;
  mountedWidgets: WidgetInstance[];
  editingUid: string | null;
  onExitEditInstance: () => void;
  onUpdateMountedInstance: (uid: string, next: WidgetInstance) => void;
  onAddInstance: (inst: WidgetInstance) => void;
  onDuplicateInstance: (uid: string) => void;
  onRemoveInstance: (uid: string) => void;
  onJumpToProfile: () => void;
}

export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

function downloadTextFile(filename: string, content: string, mime = "text/plain;charset=utf-8"): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function WidgetsStudio({
  themes,
  activeTheme,
  onSelectTheme,
  previewMode,
  onChangePreviewMode,
  lang,
  selectedWidgetId,
  onSelectWidgetId,
  drafts,
  onUpdateDraft,
  onResetDraft,
  mountedWidgets,
  editingUid,
  onExitEditInstance,
  onUpdateMountedInstance,
  onAddInstance,
  onDuplicateInstance,
  onRemoveInstance,
  onJumpToProfile,
}: WidgetsStudioProps) {
  const t = COPY[lang];
  const [stageScheme, setStageScheme] = useState<StageScheme>("both");
  const [mdMode, setMdMode] = useState<MarkdownMode>("standard");
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>("all");
  const [catalogExpanded, setCatalogExpanded] = useState(false);
  const [stickerPreviewOnHero, setStickerPreviewOnHero] = useState(true);
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [heroRaw, setHeroRaw] = useState<{ light: string; dark: string }>({
    light: "",
    dark: "",
  });
  const heroCacheRef = useRef<Record<string, { light: string; dark: string }>>({});

  const editingInstance = useMemo(
    () => (editingUid ? mountedWidgets.find((w) => w.uid === editingUid) ?? null : null),
    [editingUid, mountedWidgets]
  );

  const activeWidgetId: WidgetId = editingInstance ? editingInstance.widgetId : selectedWidgetId;
  const meta = getWidgetMeta(activeWidgetId);
  const current = editingInstance ?? drafts[activeWidgetId];

  const isHeroSticker = activeWidgetId === "hero-sticker";
  const isLiveWidget = isLiveWidgetId(activeWidgetId);
  const isPlataneSnake = isPlataneSnakeInstance(current);
  const svgFileBase = isLiveWidget ? `live-${activeWidgetId}` : `widget-${activeWidgetId}`;
  const showOverlayPreview = isHeroSticker && stickerPreviewOnHero && current.placement === "hero-overlay";
  const supportsFloatRight = current.colSpan === 1;

  const filteredCatalog = useMemo(() => {
    if (catalogFilter === "live") return WIDGET_CATALOG.filter((item) => item.isLive);
    if (catalogFilter === "static") return WIDGET_CATALOG.filter((item) => !item.isLive);
    return WIDGET_CATALOG;
  }, [catalogFilter]);

  const staticCount = useMemo(() => WIDGET_CATALOG.filter((item) => !item.isLive).length, []);
  const liveCount = useMemo(() => WIDGET_CATALOG.filter((item) => item.isLive).length, []);

  useEffect(() => {
    if (!isHeroSticker) return;
    setStickerPreviewOnHero(current.placement === "hero-overlay");
  }, [isHeroSticker, current.placement]);

  useEffect(() => {
    if (!isHeroSticker) return;
    const cached = heroCacheRef.current[activeTheme.id];
    if (cached) {
      setHeroRaw(cached);
      return;
    }
    let cancelled = false;
    Promise.all([
      fetch(`/themes/${activeTheme.id}/assets/hero-light.svg`).then((r) => r.text()),
      fetch(`/themes/${activeTheme.id}/assets/hero-dark.svg`).then((r) => r.text()),
    ])
      .then(([light, dark]) => {
        if (cancelled) return;
        const pair = { light, dark };
        heroCacheRef.current[activeTheme.id] = pair;
        setHeroRaw(pair);
      })
      .catch(() => {
        if (!cancelled) setHeroRaw({ light: "", dark: "" });
      });
    return () => {
      cancelled = true;
    };
  }, [isHeroSticker, activeTheme.id]);

  const lightSvg = useMemo(
    () =>
      renderWidgetSvg(activeWidgetId, current.config, {
        themeId: activeTheme.id,
        mode: "light",
        tokens: activeTheme.tokens.light,
        colSpan: current.colSpan,
        inBentoRow: isHeroSticker && current.placement !== "hero-overlay",
        accentOverride: current.accentOverride,
        animated: current.animated,
        instanceId: "studio-light",
      }),
    [activeWidgetId, current, activeTheme, isHeroSticker]
  );

  const darkSvg = useMemo(
    () =>
      renderWidgetSvg(activeWidgetId, current.config, {
        themeId: activeTheme.id,
        mode: "dark",
        tokens: activeTheme.tokens.dark,
        colSpan: current.colSpan,
        inBentoRow: isHeroSticker && current.placement !== "hero-overlay",
        accentOverride: current.accentOverride,
        animated: current.animated,
        instanceId: "studio-dark",
      }),
    [activeWidgetId, current, activeTheme, isHeroSticker]
  );

  const mergedHeroLight = useMemo(() => {
    if (!isHeroSticker || !heroRaw.light) return "";
    const anchor = (current.config as HeroStickerConfig).anchor;
    return mergeStickerIntoHeroSvg(heroRaw.light, lightSvg, anchor);
  }, [isHeroSticker, heroRaw.light, lightSvg, current.config]);

  const mergedHeroDark = useMemo(() => {
    if (!isHeroSticker || !heroRaw.dark) return "";
    const anchor = (current.config as HeroStickerConfig).anchor;
    return mergeStickerIntoHeroSvg(heroRaw.dark, darkSvg, anchor);
  }, [isHeroSticker, heroRaw.dark, darkSvg, current.config]);

  const previewLightSvg = showOverlayPreview && mergedHeroLight ? mergedHeroLight : lightSvg;
  const previewDarkSvg = showOverlayPreview && mergedHeroDark ? mergedHeroDark : darkSvg;

  const xmlOk = useMemo(
    () => validateSvgXml(previewLightSvg) && validateSvgXml(previewDarkSvg),
    [previewLightSvg, previewDarkSvg]
  );

  const altText = lang === "zh" ? `${meta.nameZh} — GitSkins` : `${meta.name} — GitSkins`;
  const effectiveMdMode: MarkdownMode = supportsFloatRight ? mdMode : "standard";

  const markdownSnippet = useMemo(() => {
    if (showOverlayPreview) {
      return [
        `<picture>`,
        `  <source media="(prefers-color-scheme: dark)" srcset="./assets/hero-dark.svg">`,
        `  <img src="./assets/hero-light.svg" alt="${activeTheme.name} Hero + Sticker" width="100%">`,
        `</picture>`,
      ].join("\n");
    }
    if (isPlataneSnake) {
      const sc = current.config as ContributionSnakeConfig;
      return buildSnakePlataneMarkdown(sc.username || "your-username");
    }
    return buildWidgetMarkdown(
      svgFileBase,
      altText,
      current.colSpan,
      effectiveMdMode,
      isHeroSticker && current.placement === "hero-overlay"
    );
  }, [
    showOverlayPreview,
    isPlataneSnake,
    current.config,
    activeTheme.name,
    svgFileBase,
    altText,
    current.colSpan,
    current.placement,
    effectiveMdMode,
    isHeroSticker,
  ]);

  const liveWorkflowYaml = useMemo(() => {
    if (!isLiveWidget) return "";
    if (isPlataneSnake) {
      const sc = current.config as ContributionSnakeConfig;
      return buildSnakeWorkflowYaml({
        theme: activeTheme,
        username: sc.username,
        accentOverride: current.accentOverride,
        schedule: sc.schedule,
      });
    }
    return buildLiveWorkflowYaml({
      themeId: activeTheme.id,
      liveWidgets: [current],
      accentOverride: current.accentOverride,
      animated: current.animated,
    });
  }, [isLiveWidget, isPlataneSnake, activeTheme, current]);

  const singlePrompt = useMemo(
    () => buildSingleWidgetPrompt(current, activeTheme, lang),
    [current, activeTheme, lang]
  );

  function commitUpdate(next: WidgetInstance) {
    if (editingInstance) {
      onUpdateMountedInstance(editingInstance.uid, next);
    } else {
      onUpdateDraft(activeWidgetId, next);
    }
  }

  function patchInstance(partial: Partial<WidgetInstance>) {
    commitUpdate({ ...current, ...partial });
  }

  function patchConfig<K extends WidgetId>(partial: Partial<WidgetConfigMap[K]>) {
    commitUpdate({
      ...current,
      config: { ...current.config, ...partial },
    });
  }

  function handleAddNewInstance() {
    const fresh: WidgetInstance = {
      ...current,
      uid: `${activeWidgetId}-${Math.random().toString(36).slice(2, 7)}`,
      config: { ...current.config },
    };
    onAddInstance(fresh);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  }

  function handleSchemeSelect(next: StageScheme) {
    setStageScheme(next);
    if (next === "light" || next === "dark") {
      onChangePreviewMode(next);
    }
  }

  async function handleCopyMarkdown() {
    await copyText(markdownSnippet);
    setCopiedMd(true);
    window.setTimeout(() => setCopiedMd(false), 2000);
  }

  async function handleCopyYaml() {
    if (!liveWorkflowYaml) return;
    await copyText(liveWorkflowYaml);
    setCopiedYaml(true);
    window.setTimeout(() => setCopiedYaml(false), 2000);
  }

  async function handleDownloadPythonScript() {
    try {
      const res = await fetch("/live-widgets/generate_live_widgets.py");
      if (!res.ok) return;
      const py = await res.text();
      downloadTextFile("generate_live_widgets.py", py, "text/x-python;charset=utf-8");
    } catch {
      /* ignore offline fetch error */
    }
  }

  async function handleCopyWidgetPrompt() {
    await copyText(singlePrompt);
    setCopiedPrompt(true);
    window.setTimeout(() => setCopiedPrompt(false), 2000);
  }

  function handleDownloadBoth() {
    if (showOverlayPreview && mergedHeroLight && mergedHeroDark) {
      downloadSvgFile("hero-light.svg", mergedHeroLight);
      window.setTimeout(() => downloadSvgFile("hero-dark.svg", mergedHeroDark), 180);
      return;
    }
    downloadSvgFile(`${svgFileBase}-light.svg`, lightSvg);
    window.setTimeout(() => {
      downloadSvgFile(`${svgFileBase}-dark.svg`, darkSvg);
    }, 180);
  }

  const effectiveScheme: StageScheme = stageScheme === "both" ? "both" : previewMode;
  const previewMaxPx = showOverlayPreview
    ? 846
    : isHeroSticker && current.placement === "hero-overlay"
      ? 180
      : colSpanToPx(current.colSpan);

  return (
    <>
      <section className="hero-band">
        <h1 className="hero-title">
          {t.widgetsHeroTitleA}
          <br />
          <span className="hero-title-muted">{t.widgetsHeroTitleB}</span>
        </h1>
        <div className="hero-meta">
          <p className="hero-lead">{t.widgetsHeroLead}</p>
        </div>
      </section>

      {/* Catalog Category Filter + Compact/Expanded Widget Selector */}
      <div className="widget-catalog-head">
        <div className="widget-filter-bar" role="tablist" aria-label="Widget category filter">
          <button
            type="button"
            role="tab"
            aria-selected={catalogFilter === "all"}
            className={`widget-filter-btn ${catalogFilter === "all" ? "active" : ""}`}
            onClick={() => setCatalogFilter("all")}
          >
            {t.widgetFilterAll} ({WIDGET_CATALOG.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={catalogFilter === "static"}
            className={`widget-filter-btn ${catalogFilter === "static" ? "active" : ""}`}
            onClick={() => setCatalogFilter("static")}
          >
            {t.widgetFilterStatic} ({staticCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={catalogFilter === "live"}
            className={`widget-filter-btn live ${catalogFilter === "live" ? "active" : ""}`}
            onClick={() => setCatalogFilter("live")}
          >
            <span className="live-dot" />
            <span>
              {t.widgetFilterLive} ({liveCount})
            </span>
          </button>
        </div>

        <button
          type="button"
          className="widget-view-toggle"
          aria-expanded={catalogExpanded}
          onClick={() => setCatalogExpanded((prev) => !prev)}
        >
          <span>{catalogExpanded ? t.widgetCatalogCompact : t.widgetCatalogExpand}</span>
          <span aria-hidden="true">{catalogExpanded ? "▴" : "▾"}</span>
        </button>
      </div>

      {catalogExpanded ? (
        <nav className="widget-rail" aria-label="DIY Widgets catalog">
          {filteredCatalog.map((item) => {
            const active = item.id === activeWidgetId;
            const count = mountedWidgets.filter((w) => w.widgetId === item.id).length;
            return (
              <button
                key={item.id}
                type="button"
                className={`skin-tab widget-tab ${active ? "active" : ""} ${item.isLive ? "is-live" : ""}`}
                onClick={() => {
                  if (editingUid) onExitEditInstance();
                  onSelectWidgetId(item.id);
                }}
              >
                <div className="skin-tab-top">
                  <span className="skin-index-group">
                    <span className="skin-index">{item.code}</span>
                    {item.isLive && <span className="live-pill">{t.widgetLiveBadge}</span>}
                  </span>
                  {count > 0 ? (
                    <span className="mounted-pill">
                      {t.widgetMountedBadge} ×{count}
                    </span>
                  ) : (
                    <span className="size-tag">
                      {colSpanLabel(item.defaultColSpan, lang, item.isStrip, item.isSticker)}
                    </span>
                  )}
                </div>
                <div className="skin-tab-name">
                  {lang === "zh" ? item.nameZh : item.name}
                </div>
                <div className="skin-tab-cat">
                  {lang === "zh" ? item.descZh : item.desc}
                </div>
              </button>
            );
          })}
        </nav>
      ) : (
        <nav className="widget-rail-compact" aria-label="DIY Widgets catalog">
          {filteredCatalog.map((item) => {
            const active = item.id === activeWidgetId;
            const count = mountedWidgets.filter((w) => w.widgetId === item.id).length;
            return (
              <button
                key={item.id}
                type="button"
                className={`widget-chip ${active ? "active" : ""}`}
                title={lang === "zh" ? item.descZh : item.desc}
                onClick={() => {
                  if (editingUid) onExitEditInstance();
                  onSelectWidgetId(item.id);
                }}
              >
                {item.isLive && <span className="widget-chip-live-dot" aria-hidden="true" />}
                <span className="widget-chip-code">{item.code}</span>
                <span>{lang === "zh" ? item.nameZh : item.name}</span>
                {count > 0 && <span className="widget-chip-count">×{count}</span>}
              </button>
            );
          })}
        </nav>
      )}

      <section className="workspace" aria-label="DIY widget customizer">
        {/* Left: Live Specimen Stage + Zero-Agent Export */}
        <div className="stage-card">
          <div className="stage-toolbar">
            <ThemePicker
              themes={themes}
              activeTheme={activeTheme}
              previewMode={previewMode}
              lang={lang}
              variant="compact"
              onSelectTheme={onSelectTheme}
              onChangePreviewMode={onChangePreviewMode}
              ariaLabel={t.widgetSkinLabel}
            />

            <div className="stage-controls">
              {isHeroSticker && current.placement === "hero-overlay" && (
                <div className="mode-switch" role="group" aria-label="Sticker preview mode">
                  <button
                    type="button"
                    className={`mode-btn ${stickerPreviewOnHero ? "active" : ""}`}
                    onClick={() => setStickerPreviewOnHero(true)}
                  >
                    {t.widgetStickerOnHero}
                  </button>
                  <button
                    type="button"
                    className={`mode-btn ${!stickerPreviewOnHero ? "active" : ""}`}
                    onClick={() => setStickerPreviewOnHero(false)}
                  >
                    {t.widgetStickerStandalone}
                  </button>
                </div>
              )}

              <div className="mode-switch" role="group" aria-label="Widget color scheme preview">
                <button
                  type="button"
                  className={`mode-btn ${effectiveScheme === "both" ? "active" : ""}`}
                  onClick={() => handleSchemeSelect("both")}
                >
                  {t.ghBoth}
                </button>
                <button
                  type="button"
                  className={`mode-btn ${effectiveScheme === "light" ? "active" : ""}`}
                  onClick={() => handleSchemeSelect("light")}
                >
                  {t.ghLight}
                </button>
                <button
                  type="button"
                  className={`mode-btn ${effectiveScheme === "dark" ? "active" : ""}`}
                  onClick={() => handleSchemeSelect("dark")}
                >
                  {t.ghDark}
                </button>
              </div>
            </div>
          </div>

          <div className="widget-preview-stack">
            {(effectiveScheme === "both" || effectiveScheme === "light") && (
              <div className="gh-stage light widget-stage-pane">
                <div className="gh-readme-box">
                  <div className="gh-readme-meta">
                    <span>
                      {showOverlayPreview
                        ? "assets/hero-light.svg (merged with sticker)"
                        : `assets/${svgFileBase}-light.svg · ${colSpanLabel(current.colSpan, lang, meta.isStrip, meta.isSticker && current.placement === "hero-overlay")}`}
                    </span>
                    <span>prefers-color-scheme: light</span>
                  </div>
                  <div
                    className="widget-frame-wrap"
                    style={{ maxWidth: previewMaxPx, margin: "0 auto" }}
                  >
                    <img
                      className="widget-svg-img"
                      src={svgToDataUri(previewLightSvg)}
                      alt={`${altText} (Light)`}
                    />
                  </div>
                </div>
              </div>
            )}

            {(effectiveScheme === "both" || effectiveScheme === "dark") && (
              <div className="gh-stage dark widget-stage-pane">
                <div className="gh-readme-box">
                  <div className="gh-readme-meta">
                    <span>
                      {showOverlayPreview
                        ? "assets/hero-dark.svg (merged with sticker)"
                        : `assets/${svgFileBase}-dark.svg · ${colSpanLabel(current.colSpan, lang, meta.isStrip, meta.isSticker && current.placement === "hero-overlay")}`}
                    </span>
                    <span>prefers-color-scheme: dark</span>
                  </div>
                  <div
                    className="widget-frame-wrap"
                    style={{ maxWidth: previewMaxPx, margin: "0 auto" }}
                  >
                    <img
                      className="widget-svg-img"
                      src={svgToDataUri(previewDarkSvg)}
                      alt={`${altText} (Dark)`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Direct Zero-Agent Export Panel */}
          <div className="widget-export-bar">
            <div className="widget-export-head">
              <span className="section-micro-label" style={{ margin: 0 }}>
                {t.widgetExportHeading}
              </span>
              <span className={`xml-badge ${xmlOk ? "ok" : "err"}`}>
                {xmlOk ? `✓ ${t.widgetXmlValid}` : "XML Error"}
              </span>
            </div>

            {supportsFloatRight && !showOverlayPreview && (
              <div className="seg-group" style={{ maxWidth: 380 }}>
                <button
                  type="button"
                  className={`seg-btn ${effectiveMdMode === "standard" ? "active" : ""}`}
                  onClick={() => setMdMode("standard")}
                >
                  {t.widgetMdStandard}
                </button>
                <button
                  type="button"
                  className={`seg-btn ${effectiveMdMode === "float-right" ? "active" : ""}`}
                  onClick={() => setMdMode("float-right")}
                >
                  {t.widgetMdFloatRight}
                </button>
              </div>
            )}

            <div className="export-actions-row">
              <button
                type="button"
                className="export-btn primary"
                onClick={handleDownloadBoth}
              >
                ↓ {showOverlayPreview ? t.widgetDownloadMergedHero : t.widgetDownloadBoth}
              </button>
              <button
                type="button"
                className="export-btn"
                onClick={() =>
                  downloadSvgFile(
                    showOverlayPreview ? "hero-light.svg" : `${svgFileBase}-light.svg`,
                    previewLightSvg
                  )
                }
              >
                {t.widgetDownloadLight}
              </button>
              <button
                type="button"
                className="export-btn"
                onClick={() =>
                  downloadSvgFile(
                    showOverlayPreview ? "hero-dark.svg" : `${svgFileBase}-dark.svg`,
                    previewDarkSvg
                  )
                }
              >
                {t.widgetDownloadDark}
              </button>
              <button
                type="button"
                className={`export-btn ${copiedMd ? "copied" : ""}`}
                onClick={handleCopyMarkdown}
              >
                {copiedMd ? `✓ ${t.widgetCopiedMd}` : t.widgetCopyMd}
              </button>
            </div>

            <pre className="prompt-box compact">{markdownSnippet}</pre>

            {isLiveWidget && (
              <div className="live-workflow-box">
                <div className="widget-export-head">
                  <span className="section-micro-label" style={{ margin: 0 }}>
                    {isPlataneSnake
                      ? t.widgetSnakeWorkflowHeading
                      : t.widgetLiveWorkflowHeading}
                  </span>
                  <span className="live-pill">
                    {isPlataneSnake ? "PLATANE/SNK · ACTIONS" : `${t.widgetLiveBadge} · ACTIONS`}
                  </span>
                </div>
                <p className="live-workflow-hint">
                  {isPlataneSnake ? t.widgetSnakeWorkflowHint : t.widgetLiveWorkflowHint}
                </p>
                <div className="export-actions-row">
                  <button
                    type="button"
                    className={`export-btn primary ${copiedYaml ? "copied" : ""}`}
                    onClick={handleCopyYaml}
                  >
                    {copiedYaml ? `✓ ${t.widgetCopiedYaml}` : t.widgetCopyYaml}
                  </button>
                  <button
                    type="button"
                    className="export-btn"
                    onClick={() =>
                      downloadTextFile(
                        isPlataneSnake ? "snake.yml" : "gitskins-widgets.yml",
                        liveWorkflowYaml,
                        "text/yaml;charset=utf-8"
                      )
                    }
                  >
                    ↓ {isPlataneSnake ? "snake.yml" : t.widgetDownloadYaml}
                  </button>
                  {!isPlataneSnake && (
                    <button
                      type="button"
                      className="export-btn"
                      onClick={handleDownloadPythonScript}
                    >
                      ↓ {t.widgetDownloadPy}
                    </button>
                  )}
                </div>
                <pre className="prompt-box compact">{liveWorkflowYaml}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sticky Customizer & Multi-Instance Actions */}
        <aside className="inspector">
          <div className="inspector-head">
            <div className="inspector-badges">
              <span className="cat-badge">
                {meta.code} · {colSpanLabel(current.colSpan, lang, meta.isStrip, meta.isSticker && current.placement === "hero-overlay")}
              </span>
              {editingInstance ? (
                <button
                  type="button"
                  className="reset-link"
                  onClick={onExitEditInstance}
                >
                  {t.bentoNewModeBtn}
                </button>
              ) : (
                <button
                  type="button"
                  className="reset-link"
                  onClick={() => onResetDraft(activeWidgetId)}
                >
                  {t.widgetReset}
                </button>
              )}
            </div>
            <h2 className="inspector-title">
              {lang === "zh" ? meta.nameZh : meta.name}
            </h2>
            <p className="inspector-desc">
              {lang === "zh" ? meta.descZh : meta.desc}
            </p>
          </div>

          <div className="inspector-section">
            {editingInstance ? (
              <>
                <div className="editing-live-banner">
                  <span className="live-dot" />
                  <span>{t.bentoEditingBanner}</span>
                </div>
                <button
                  type="button"
                  className="copy-cta"
                  onClick={onJumpToProfile}
                >
                  ✓ {t.widgetViewProfile} →
                </button>
                <div className="edit-instance-actions">
                  <button
                    type="button"
                    className="secondary-full-btn"
                    onClick={() => onDuplicateInstance(editingInstance.uid)}
                  >
                    + {t.bentoDuplicate}
                  </button>
                  <button
                    type="button"
                    className="secondary-full-btn danger-btn"
                    onClick={() => {
                      onRemoveInstance(editingInstance.uid);
                      onExitEditInstance();
                    }}
                  >
                    × {t.loadoutRemove}
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`copy-cta ${justAdded ? "copied" : ""}`}
                  onClick={handleAddNewInstance}
                >
                  {justAdded
                    ? `✓ ${t.widgetMountedBadge} (+1)`
                    : `+ ${t.bentoAddInstanceBtn}`}
                </button>
                {mountedWidgets.length > 0 && (
                  <button
                    type="button"
                    className="secondary-full-btn"
                    onClick={onJumpToProfile}
                  >
                    {t.widgetViewProfile} ({mountedWidgets.length}) →
                  </button>
                )}
              </>
            )}
          </div>

          {/* Slot Placement, 4-Col Span, Accent & Motion */}
          <div className="inspector-section">
            <p className="section-micro-label">{t.widgetPlacementLabel}</p>
            <div className="seg-group cols-4">
              {meta.supportedPlacements.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`seg-btn ${current.placement === slot ? "active" : ""}`}
                  onClick={() => patchInstance({ placement: slot })}
                >
                  {placementLabel(slot, lang)}
                </button>
              ))}
            </div>

            {meta.supportedColSpans.length > 1 && (
              <>
                <p className="section-micro-label" style={{ marginTop: 12 }}>
                  {t.bentoColSpanLabel}
                </p>
                <div
                  className={`seg-group ${
                    meta.supportedColSpans.length === 3 ? "cols-3" : ""
                  }`}
                >
                  {meta.supportedColSpans.map((span: BentoColSpan) => (
                    <button
                      key={span}
                      type="button"
                      className={`seg-btn ${current.colSpan === span ? "active" : ""}`}
                      onClick={() => patchInstance({ colSpan: span })}
                    >
                      {colSpanLabel(span, lang)}
                    </button>
                  ))}
                </div>
              </>
            )}

            <p className="section-micro-label" style={{ marginTop: 12 }}>
              {t.widgetAccentLabel}
            </p>
            <div className="accent-picker-row">
              {ACCENT_PRESETS.map((preset) => {
                const active = current.accentOverride === preset.hex;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    title={lang === "zh" ? preset.labelZh : preset.label}
                    className={`accent-dot-btn ${active ? "active" : ""}`}
                    onClick={() => patchInstance({ accentOverride: preset.hex })}
                  >
                    <span
                      className="accent-dot-fill"
                      style={{
                        backgroundColor: preset.hex || activeTheme.accent,
                      }}
                    />
                    {preset.hex === "" && (
                      <span className="accent-auto-tag">
                        {lang === "zh" ? "自动" : "Auto"}
                      </span>
                    )}
                  </button>
                );
              })}
              <label className="accent-color-input" title="Custom hex color">
                <input
                  type="color"
                  value={current.accentOverride || activeTheme.accent}
                  onChange={(e) => patchInstance({ accentOverride: e.target.value })}
                />
                <span>HEX</span>
              </label>
            </div>

            <p className="section-micro-label" style={{ marginTop: 12 }}>
              {t.widgetMotionLabel}
            </p>
            <div className="seg-group">
              <button
                type="button"
                className={`seg-btn ${current.animated ? "active" : ""}`}
                onClick={() => patchInstance({ animated: true })}
              >
                {t.widgetMotionOn}
              </button>
              <button
                type="button"
                className={`seg-btn ${!current.animated ? "active" : ""}`}
                onClick={() => patchInstance({ animated: false })}
              >
                {t.widgetMotionOff}
              </button>
            </div>
          </div>

          {/* Widget-Specific Form Controls */}
          <div className="inspector-section">
            <p className="section-micro-label">{t.widgetParamsHeading}</p>

            {activeWidgetId === "pixel-companion" && (() => {
              const cfg = current.config as PixelCompanionConfig;
              const pets: { id: PetKind; en: string; zh: string }[] = [
                { id: "cat", en: "Cat", zh: "橘猫" },
                { id: "bot", en: "Bot", zh: "机器人" },
                { id: "slime", en: "Slime", zh: "史莱姆" },
                { id: "ghost", en: "Ghost", zh: "幽灵" },
              ];
              const moods: { id: PetMood; en: string; zh: string }[] = [
                { id: "coding", en: "Coding", zh: "编码中" },
                { id: "coffee", en: "Coffee", zh: "喝咖啡" },
                { id: "debugging", en: "Debug", zh: "修 Bug" },
                { id: "afking", en: "AFK", zh: "挂机中" },
              ];
              return (
                <div className="diy-form">
                  <div className="diy-field">
                    <label>{t.fieldPet}</label>
                    <div className="seg-group cols-4">
                      {pets.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className={`seg-btn ${cfg.pet === p.id ? "active" : ""}`}
                          onClick={() => patchConfig<"pixel-companion">({ pet: p.id })}
                        >
                          {lang === "zh" ? p.zh : p.en}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldPetName}</label>
                    <input
                      type="text"
                      maxLength={24}
                      value={cfg.name}
                      onChange={(e) => patchConfig<"pixel-companion">({ name: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldMood}</label>
                    <div className="seg-group cols-4">
                      {moods.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          className={`seg-btn ${cfg.mood === m.id ? "active" : ""}`}
                          onClick={() => patchConfig<"pixel-companion">({ mood: m.id })}
                        >
                          {lang === "zh" ? m.zh : m.en}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldMessage}</label>
                    <input
                      type="text"
                      maxLength={80}
                      value={cfg.message}
                      onChange={(e) => patchConfig<"pixel-companion">({ message: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldFooterTag}</label>
                    <input
                      type="text"
                      maxLength={40}
                      value={cfg.footerTag}
                      onChange={(e) => patchConfig<"pixel-companion">({ footerTag: e.target.value })}
                    />
                  </div>
                </div>
              );
            })()}

            {activeWidgetId === "now-playing" && (() => {
              const cfg = current.config as NowPlayingConfig;
              const mediaList: { id: MediaKind; en: string; zh: string }[] = [
                { id: "cassette", en: "Cassette Tape", zh: "复古磁带" },
                { id: "vinyl", en: "Vinyl Record", zh: "黑胶唱片" },
              ];
              return (
                <div className="diy-form">
                  <div className="diy-field">
                    <label>{t.fieldMedia}</label>
                    <div className="seg-group">
                      {mediaList.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          className={`seg-btn ${cfg.media === m.id ? "active" : ""}`}
                          onClick={() => patchConfig<"now-playing">({ media: m.id })}
                        >
                          {lang === "zh" ? m.zh : m.en}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldTrack}</label>
                    <input
                      type="text"
                      maxLength={48}
                      value={cfg.track}
                      onChange={(e) => patchConfig<"now-playing">({ track: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldArtist}</label>
                    <input
                      type="text"
                      maxLength={48}
                      value={cfg.artist}
                      onChange={(e) => patchConfig<"now-playing">({ artist: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldNote}</label>
                    <input
                      type="text"
                      maxLength={32}
                      value={cfg.note}
                      onChange={(e) => patchConfig<"now-playing">({ note: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>
                      {t.fieldProgress}: <strong>{cfg.progress}%</strong>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={cfg.progress}
                      onChange={(e) =>
                        patchConfig<"now-playing">({ progress: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
              );
            })()}

            {activeWidgetId === "dev-badge" && (() => {
              const cfg = current.config as DevBadgeConfig;
              const statuses: { id: DevStatus; en: string; zh: string }[] = [
                { id: "shipping", en: "Shipping", zh: "迭代中" },
                { id: "open", en: "Open OSS", zh: "开源共建" },
                { id: "focus", en: "Focus", zh: "专注中" },
                { id: "hiring", en: "Collab", zh: "可合作" },
              ];
              return (
                <div className="diy-form">
                  <div className="diy-field">
                    <label>{t.fieldHandle}</label>
                    <input
                      type="text"
                      maxLength={32}
                      value={cfg.handle}
                      onChange={(e) => patchConfig<"dev-badge">({ handle: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldRole}</label>
                    <input
                      type="text"
                      maxLength={52}
                      value={cfg.role}
                      onChange={(e) => patchConfig<"dev-badge">({ role: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldFocus}</label>
                    <input
                      type="text"
                      maxLength={64}
                      value={cfg.focus}
                      onChange={(e) => patchConfig<"dev-badge">({ focus: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldLocation}</label>
                    <input
                      type="text"
                      maxLength={32}
                      value={cfg.location}
                      onChange={(e) => patchConfig<"dev-badge">({ location: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldStatus}</label>
                    <div className="seg-group cols-4">
                      {statuses.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className={`seg-btn ${cfg.status === s.id ? "active" : ""}`}
                          onClick={() => patchConfig<"dev-badge">({ status: s.id })}
                        >
                          {lang === "zh" ? s.zh : s.en}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="diy-field-row">
                    <div className="diy-field">
                      <label>{t.fieldMeterLabel}</label>
                      <input
                        type="text"
                        maxLength={14}
                        value={cfg.meterLabel}
                        onChange={(e) =>
                          patchConfig<"dev-badge">({ meterLabel: e.target.value })
                        }
                      />
                    </div>
                    <div className="diy-field">
                      <label>
                        {t.fieldMeterValue}: <strong>{cfg.meterValue}%</strong>
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={cfg.meterValue}
                        onChange={(e) =>
                          patchConfig<"dev-badge">({ meterValue: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {activeWidgetId === "skill-dock" && (() => {
              const cfg = current.config as SkillDockConfig;
              return (
                <div className="diy-form">
                  <div className="diy-field">
                    <label>{t.fieldStackTitle}</label>
                    <input
                      type="text"
                      maxLength={44}
                      value={cfg.title}
                      onChange={(e) => patchConfig<"skill-dock">({ title: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldStackSubtitle}</label>
                    <input
                      type="text"
                      maxLength={24}
                      value={cfg.subtitle}
                      onChange={(e) => patchConfig<"skill-dock">({ subtitle: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldSkills}</label>
                    <textarea
                      rows={3}
                      value={cfg.skills}
                      onChange={(e) => patchConfig<"skill-dock">({ skills: e.target.value })}
                    />
                  </div>
                </div>
              );
            })()}

            {activeWidgetId === "quote-banner" && (() => {
              const cfg = current.config as QuoteBannerConfig;
              return (
                <div className="diy-form">
                  <div className="diy-field">
                    <label>{t.fieldQuote}</label>
                    <textarea
                      rows={2}
                      maxLength={120}
                      value={cfg.quote}
                      onChange={(e) => patchConfig<"quote-banner">({ quote: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldAuthor}</label>
                    <input
                      type="text"
                      maxLength={40}
                      value={cfg.author}
                      onChange={(e) => patchConfig<"quote-banner">({ author: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldTag}</label>
                    <input
                      type="text"
                      maxLength={18}
                      value={cfg.tag}
                      onChange={(e) => patchConfig<"quote-banner">({ tag: e.target.value })}
                    />
                  </div>
                </div>
              );
            })()}

            {activeWidgetId === "hero-sticker" && (() => {
              const cfg = current.config as HeroStickerConfig;
              const motifs: { id: StickerMotif; en: string; zh: string }[] = [
                { id: "peeker", en: "Peeker", zh: "扒边猫" },
                { id: "stamp", en: "Stamp", zh: "旋转章" },
                { id: "coffee", en: "Coffee", zh: "热咖啡" },
                { id: "radar", en: "Radar", zh: "雷达" },
              ];
              const anchors: { id: HeroAnchor; en: string; zh: string }[] = [
                { id: "top-left", en: "↖ TL", zh: "↖ 左上" },
                { id: "top-right", en: "↗ TR", zh: "↗ 右上" },
                { id: "bottom-left", en: "↙ BL", zh: "↙ 左下" },
                { id: "bottom-right", en: "↘ BR", zh: "↘ 右下" },
              ];
              return (
                <div className="diy-form">
                  <div className="diy-field">
                    <label>{t.fieldMotif}</label>
                    <div className="seg-group cols-4">
                      {motifs.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          className={`seg-btn ${cfg.motif === m.id ? "active" : ""}`}
                          onClick={() => patchConfig<"hero-sticker">({ motif: m.id })}
                        >
                          {lang === "zh" ? m.zh : m.en}
                        </button>
                      ))}
                    </div>
                  </div>
                  {current.placement === "hero-overlay" && (
                    <div className="diy-field">
                      <label>{t.fieldAnchor}</label>
                      <div className="seg-group cols-4">
                        {anchors.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            className={`seg-btn ${cfg.anchor === a.id ? "active" : ""}`}
                            onClick={() => patchConfig<"hero-sticker">({ anchor: a.id })}
                          >
                            {lang === "zh" ? a.zh : a.en}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="diy-field-row">
                    <div className="diy-field">
                      <label>{t.fieldStickerLabel}</label>
                      <input
                        type="text"
                        maxLength={14}
                        value={cfg.label}
                        onChange={(e) => patchConfig<"hero-sticker">({ label: e.target.value })}
                      />
                    </div>
                    <div className="diy-field">
                      <label>{t.fieldStickerSub}</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={cfg.sublabel}
                        onChange={(e) => patchConfig<"hero-sticker">({ sublabel: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {activeWidgetId === "pixel-runway" && (() => {
              const cfg = current.config as PixelRunwayConfig;
              const modes: { id: RunwayMode; en: string; zh: string }[] = [
                { id: "patrol", en: "Patrol", zh: "小宠巡逻" },
                { id: "ticker", en: "LED Ticker", zh: "跑马灯" },
                { id: "wave", en: "EKG Wave", zh: "示波器" },
              ];
              const runners: { id: "cat" | "bot" | "slime"; en: string; zh: string }[] = [
                { id: "cat", en: "Cat", zh: "橘猫" },
                { id: "bot", en: "Bot", zh: "机器人" },
                { id: "slime", en: "Slime", zh: "史莱姆" },
              ];
              const speeds: { id: RunwaySpeed; en: string; zh: string }[] = [
                { id: "calm", en: "Calm", zh: "慢速" },
                { id: "normal", en: "Normal", zh: "适中" },
                { id: "brisk", en: "Brisk", zh: "轻快" },
              ];
              return (
                <div className="diy-form">
                  <div className="diy-field">
                    <label>{t.fieldRunwayMode}</label>
                    <div className="seg-group cols-3">
                      {modes.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          className={`seg-btn ${cfg.mode === m.id ? "active" : ""}`}
                          onClick={() => patchConfig<"pixel-runway">({ mode: m.id })}
                        >
                          {lang === "zh" ? m.zh : m.en}
                        </button>
                      ))}
                    </div>
                  </div>
                  {cfg.mode === "patrol" && (
                    <div className="diy-field">
                      <label>{t.fieldRunner}</label>
                      <div className="seg-group cols-3">
                        {runners.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            className={`seg-btn ${cfg.runner === r.id ? "active" : ""}`}
                            onClick={() => patchConfig<"pixel-runway">({ runner: r.id })}
                          >
                            {lang === "zh" ? r.zh : r.en}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="diy-field-row">
                    <div className="diy-field">
                      <label>{t.fieldRunwayTag}</label>
                      <input
                        type="text"
                        maxLength={12}
                        value={cfg.tag}
                        onChange={(e) => patchConfig<"pixel-runway">({ tag: e.target.value })}
                      />
                    </div>
                    <div className="diy-field">
                      <label>{t.fieldRunwaySpeed}</label>
                      <div className="seg-group cols-3">
                        {speeds.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            className={`seg-btn ${cfg.speed === s.id ? "active" : ""}`}
                            onClick={() => patchConfig<"pixel-runway">({ speed: s.id })}
                          >
                            {lang === "zh" ? s.zh : s.en}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldRunwayText}</label>
                    <input
                      type="text"
                      maxLength={96}
                      value={cfg.text}
                      onChange={(e) => patchConfig<"pixel-runway">({ text: e.target.value })}
                    />
                  </div>
                </div>
              );
            })()}

            {activeWidgetId === "mini-tile" && (() => {
              const cfg = current.config as MiniTileConfig;
              const scenes: { id: MiniTileScene; en: string; zh: string }[] = [
                { id: "coffee", en: "Coffee", zh: "热咖啡" },
                { id: "weather", en: "Weather", zh: "天气窗" },
                { id: "hourglass", en: "Timer", zh: "沙漏" },
                { id: "pulse", en: "Synth", zh: "频谱仪" },
              ];
              const weathers: { id: WeatherKind; en: string; zh: string }[] = [
                { id: "rain", en: "Rain", zh: "像素雨" },
                { id: "snow", en: "Snow", zh: "落雪" },
                { id: "sunny", en: "Sunny", zh: "晴朗" },
              ];
              return (
                <div className="diy-form">
                  <div className="diy-field">
                    <label>{t.fieldTileScene}</label>
                    <div className="seg-group cols-4">
                      {scenes.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className={`seg-btn ${cfg.scene === s.id ? "active" : ""}`}
                          onClick={() => patchConfig<"mini-tile">({ scene: s.id })}
                        >
                          {lang === "zh" ? s.zh : s.en}
                        </button>
                      ))}
                    </div>
                  </div>
                  {cfg.scene === "weather" && (
                    <div className="diy-field">
                      <label>{t.fieldWeather}</label>
                      <div className="seg-group cols-3">
                        {weathers.map((w) => (
                          <button
                            key={w.id}
                            type="button"
                            className={`seg-btn ${cfg.weather === w.id ? "active" : ""}`}
                            onClick={() => patchConfig<"mini-tile">({ weather: w.id })}
                          >
                            {lang === "zh" ? w.zh : w.en}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="diy-field">
                    <label>{t.fieldTileTitle}</label>
                    <input
                      type="text"
                      maxLength={22}
                      value={cfg.title}
                      onChange={(e) => patchConfig<"mini-tile">({ title: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldTileSub}</label>
                    <input
                      type="text"
                      maxLength={24}
                      value={cfg.subtitle}
                      onChange={(e) => patchConfig<"mini-tile">({ subtitle: e.target.value })}
                    />
                  </div>
                </div>
              );
            })()}

            {activeWidgetId === "github-stats" && (() => {
              const cfg = current.config as GitHubStatsConfig;
              return (
                <div className="diy-form">
                  <div className="diy-field">
                    <label>{t.fieldGhUsername}</label>
                    <input
                      type="text"
                      maxLength={39}
                      value={cfg.username}
                      onChange={(e) => patchConfig<"github-stats">({ username: e.target.value })}
                    />
                  </div>
                  <div className="diy-field-row">
                    <div className="diy-field">
                      <label>{t.fieldGhStars}</label>
                      <input
                        type="number"
                        min={0}
                        max={999999}
                        value={cfg.stars}
                        onChange={(e) =>
                          patchConfig<"github-stats">({ stars: Math.max(0, Number(e.target.value) || 0) })
                        }
                      />
                    </div>
                    <div className="diy-field">
                      <label>{t.fieldGhRepos}</label>
                      <input
                        type="number"
                        min={0}
                        max={9999}
                        value={cfg.repos}
                        onChange={(e) =>
                          patchConfig<"github-stats">({ repos: Math.max(0, Number(e.target.value) || 0) })
                        }
                      />
                    </div>
                  </div>
                  <div className="diy-field-row">
                    <div className="diy-field">
                      <label>{t.fieldGhFollowers}</label>
                      <input
                        type="number"
                        min={0}
                        max={999999}
                        value={cfg.followers}
                        onChange={(e) =>
                          patchConfig<"github-stats">({
                            followers: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                      />
                    </div>
                    <div className="diy-field">
                      <label>{t.fieldGhPrs}</label>
                      <input
                        type="number"
                        min={0}
                        max={99999}
                        value={cfg.prs}
                        onChange={(e) =>
                          patchConfig<"github-stats">({ prs: Math.max(0, Number(e.target.value) || 0) })
                        }
                      />
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldGhLanguages}</label>
                    <input
                      type="text"
                      maxLength={100}
                      value={cfg.languages}
                      onChange={(e) => patchConfig<"github-stats">({ languages: e.target.value })}
                    />
                  </div>
                  <p className="diy-hint-note">{t.fieldLivePreviewNote}</p>
                </div>
              );
            })()}

            {activeWidgetId === "coding-rhythm" && (() => {
              const cfg = current.config as CodingRhythmConfig;
              const personas: { id: RhythmPersona; en: string; zh: string }[] = [
                { id: "early", en: "Early", zh: "早鸟" },
                { id: "day", en: "Day", zh: "日间" },
                { id: "evening", en: "Evening", zh: "晚间" },
                { id: "night", en: "Night", zh: "夜猫" },
              ];
              return (
                <div className="diy-form">
                  <div className="diy-field">
                    <label>
                      {t.fieldTzOffset}:{" "}
                      <strong>
                        UTC{cfg.tzOffset >= 0 ? `+${cfg.tzOffset}` : cfg.tzOffset}
                      </strong>
                    </label>
                    <input
                      type="range"
                      min={-12}
                      max={14}
                      value={cfg.tzOffset}
                      onChange={(e) =>
                        patchConfig<"coding-rhythm">({ tzOffset: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldPersona}</label>
                    <div className="seg-group cols-4">
                      {personas.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className={`seg-btn ${cfg.persona === p.id ? "active" : ""}`}
                          onClick={() => patchConfig<"coding-rhythm">({ persona: p.id })}
                        >
                          {lang === "zh" ? p.zh : p.en}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldCronSchedule}</label>
                    <div className="seg-group">
                      <button
                        type="button"
                        className={`seg-btn ${cfg.schedule === "6h" ? "active" : ""}`}
                        onClick={() => patchConfig<"coding-rhythm">({ schedule: "6h" })}
                      >
                        {lang === "zh" ? "每 6 小时" : "Every 6 hours"}
                      </button>
                      <button
                        type="button"
                        className={`seg-btn ${cfg.schedule === "daily" ? "active" : ""}`}
                        onClick={() => patchConfig<"coding-rhythm">({ schedule: "daily" })}
                      >
                        {lang === "zh" ? "每日 0 点" : "Daily UTC"}
                      </button>
                    </div>
                  </div>
                  <p className="diy-hint-note">{t.fieldLivePreviewNote}</p>
                </div>
              );
            })()}

            {activeWidgetId === "rss-feed" && (() => {
              const cfg = current.config as RssFeedConfig;
              return (
                <div className="diy-form">
                  <div className="diy-field">
                    <label>{t.fieldRssUrl}</label>
                    <input
                      type="url"
                      maxLength={180}
                      value={cfg.feedUrl}
                      placeholder="https://yourblog.dev/rss.xml"
                      onChange={(e) => patchConfig<"rss-feed">({ feedUrl: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldRssSource}</label>
                    <input
                      type="text"
                      maxLength={40}
                      value={cfg.source}
                      onChange={(e) => patchConfig<"rss-feed">({ source: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldRssPost1}</label>
                    <input
                      type="text"
                      maxLength={80}
                      value={cfg.post1}
                      onChange={(e) => patchConfig<"rss-feed">({ post1: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldRssPost2}</label>
                    <input
                      type="text"
                      maxLength={80}
                      value={cfg.post2}
                      onChange={(e) => patchConfig<"rss-feed">({ post2: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldRssPost3}</label>
                    <input
                      type="text"
                      maxLength={80}
                      value={cfg.post3}
                      onChange={(e) => patchConfig<"rss-feed">({ post3: e.target.value })}
                    />
                  </div>
                  <p className="diy-hint-note">{t.fieldLivePreviewNote}</p>
                </div>
              );
            })()}

            {activeWidgetId === "live-weather" && (() => {
              const cfg = current.config as LiveWeatherConfig;
              const conds: { id: LiveWeatherCondition; en: string; zh: string }[] = [
                { id: "sunny", en: "Sun", zh: "晴" },
                { id: "cloudy", en: "Cloud", zh: "多云" },
                { id: "rain", en: "Rain", zh: "雨" },
                { id: "snow", en: "Snow", zh: "雪" },
              ];
              return (
                <div className="diy-form">
                  <div className="diy-field-row">
                    <div className="diy-field">
                      <label>{t.fieldCity}</label>
                      <input
                        type="text"
                        maxLength={32}
                        value={cfg.city}
                        onChange={(e) => patchConfig<"live-weather">({ city: e.target.value })}
                      />
                    </div>
                    <div className="diy-field">
                      <label>{t.fieldTempUnit}</label>
                      <div className="seg-group">
                        <button
                          type="button"
                          className={`seg-btn ${cfg.unit === "C" ? "active" : ""}`}
                          onClick={() => patchConfig<"live-weather">({ unit: "C" })}
                        >
                          °C
                        </button>
                        <button
                          type="button"
                          className={`seg-btn ${cfg.unit === "F" ? "active" : ""}`}
                          onClick={() => patchConfig<"live-weather">({ unit: "F" })}
                        >
                          °F
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldWeatherCond}</label>
                    <div className="seg-group cols-4">
                      {conds.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className={`seg-btn ${cfg.condition === c.id ? "active" : ""}`}
                          onClick={() => patchConfig<"live-weather">({ condition: c.id })}
                        >
                          {lang === "zh" ? c.zh : c.en}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="diy-field-row">
                    <div className="diy-field">
                      <label>
                        {t.fieldTempPreview}: <strong>{cfg.temp}°{cfg.unit}</strong>
                      </label>
                      <input
                        type="range"
                        min={cfg.unit === "F" ? -10 : -25}
                        max={cfg.unit === "F" ? 115 : 45}
                        value={cfg.temp}
                        onChange={(e) =>
                          patchConfig<"live-weather">({ temp: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="diy-field">
                      <label>
                        {t.fieldHumidity}: <strong>{cfg.humidity}%</strong>
                      </label>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={cfg.humidity}
                        onChange={(e) =>
                          patchConfig<"live-weather">({ humidity: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                  <p className="diy-hint-note">{t.fieldLivePreviewNote}</p>
                </div>
              );
            })()}

            {activeWidgetId === "wakatime-weekly" && (() => {
              const cfg = current.config as WakaTimeWeeklyConfig;
              return (
                <div className="diy-form">
                  <div className="diy-field-row">
                    <div className="diy-field">
                      <label>{t.fieldWakaTotal}</label>
                      <input
                        type="text"
                        maxLength={18}
                        value={cfg.totalHours}
                        onChange={(e) =>
                          patchConfig<"wakatime-weekly">({ totalHours: e.target.value })
                        }
                      />
                    </div>
                    <div className="diy-field">
                      <label>{t.fieldWakaAvg}</label>
                      <input
                        type="text"
                        maxLength={18}
                        value={cfg.dailyAvg}
                        onChange={(e) =>
                          patchConfig<"wakatime-weekly">({ dailyAvg: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldWakaEditor}</label>
                    <input
                      type="text"
                      maxLength={24}
                      value={cfg.editor}
                      onChange={(e) => patchConfig<"wakatime-weekly">({ editor: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldGhLanguages}</label>
                    <input
                      type="text"
                      maxLength={100}
                      value={cfg.languages}
                      onChange={(e) =>
                        patchConfig<"wakatime-weekly">({ languages: e.target.value })
                      }
                    />
                  </div>
                  <p className="diy-hint-note">{t.fieldWakaSecretNote}</p>
                </div>
              );
            })()}

            {activeWidgetId === "spotify-recent" && (() => {
              const cfg = current.config as SpotifyRecentConfig;
              const statuses: SpotifyRecentConfig["status"][] = [
                "NOW PLAYING",
                "RECENTLY PLAYED",
                "PAUSED",
              ];
              return (
                <div className="diy-form">
                  <div className="diy-field">
                    <label>{t.fieldTrack}</label>
                    <input
                      type="text"
                      maxLength={48}
                      value={cfg.track}
                      onChange={(e) => patchConfig<"spotify-recent">({ track: e.target.value })}
                    />
                  </div>
                  <div className="diy-field-row">
                    <div className="diy-field">
                      <label>{t.fieldArtist}</label>
                      <input
                        type="text"
                        maxLength={36}
                        value={cfg.artist}
                        onChange={(e) =>
                          patchConfig<"spotify-recent">({ artist: e.target.value })
                        }
                      />
                    </div>
                    <div className="diy-field">
                      <label>{t.fieldSpotifyDuration}</label>
                      <input
                        type="text"
                        maxLength={10}
                        value={cfg.duration}
                        onChange={(e) =>
                          patchConfig<"spotify-recent">({ duration: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldSpotifyAlbum}</label>
                    <input
                      type="text"
                      maxLength={48}
                      value={cfg.album}
                      onChange={(e) => patchConfig<"spotify-recent">({ album: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldStatus}</label>
                    <div className="seg-group cols-3">
                      {statuses.map((st) => (
                        <button
                          key={st}
                          type="button"
                          className={`seg-btn ${cfg.status === st ? "active" : ""}`}
                          onClick={() => patchConfig<"spotify-recent">({ status: st })}
                        >
                          {st === "NOW PLAYING" ? "LIVE" : st === "RECENTLY PLAYED" ? "RECENT" : "PAUSED"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>
                      {t.fieldProgress}: <strong>{cfg.progress}%</strong>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={cfg.progress}
                      onChange={(e) =>
                        patchConfig<"spotify-recent">({ progress: Number(e.target.value) })
                      }
                    />
                  </div>
                  <p className="diy-hint-note">{t.fieldSpotifySecretNote}</p>
                </div>
              );
            })()}

            {activeWidgetId === "contribution-snake" && (() => {
              const cfg = current.config as ContributionSnakeConfig;
              const engines: { id: SnakeEngine; label: string }[] = [
                { id: "platane-snk", label: t.fieldSnakeEnginePlatane },
                { id: "gitskins-svg", label: t.fieldSnakeEngineNative },
              ];
              const speeds: { id: RunwaySpeed; en: string; zh: string }[] = [
                { id: "calm", en: "Calm", zh: "舒缓" },
                { id: "normal", en: "Normal", zh: "标准" },
                { id: "brisk", en: "Brisk", zh: "轻快" },
              ];
              const lightPal = getSnakePaletteForTheme(
                activeTheme.id,
                "light",
                activeTheme.tokens.light,
                current.accentOverride
              );
              const darkPal = getSnakePaletteForTheme(
                activeTheme.id,
                "dark",
                activeTheme.tokens.dark,
                current.accentOverride
              );
              return (
                <div className="diy-form">
                  <div className="diy-field">
                    <label>{t.fieldGhUsername}</label>
                    <input
                      type="text"
                      maxLength={39}
                      value={cfg.username}
                      onChange={(e) =>
                        patchConfig<"contribution-snake">({ username: e.target.value })
                      }
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldSnakeEngine}</label>
                    <div className="seg-group">
                      {engines.map((eng) => (
                        <button
                          key={eng.id}
                          type="button"
                          className={`seg-btn ${cfg.engine === eng.id ? "active" : ""}`}
                          onClick={() => patchConfig<"contribution-snake">({ engine: eng.id })}
                        >
                          {eng.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldSnakeSpeed}</label>
                    <div className="seg-group cols-3">
                      {speeds.map((sp) => (
                        <button
                          key={sp.id}
                          type="button"
                          className={`seg-btn ${cfg.speed === sp.id ? "active" : ""}`}
                          onClick={() => patchConfig<"contribution-snake">({ speed: sp.id })}
                        >
                          {lang === "zh" ? sp.zh : sp.en}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldCronSchedule}</label>
                    <div className="seg-group">
                      <button
                        type="button"
                        className={`seg-btn ${cfg.schedule === "daily" ? "active" : ""}`}
                        onClick={() => patchConfig<"contribution-snake">({ schedule: "daily" })}
                      >
                        {lang === "zh" ? "每日 0 点" : "Daily UTC"}
                      </button>
                      <button
                        type="button"
                        className={`seg-btn ${cfg.schedule === "6h" ? "active" : ""}`}
                        onClick={() => patchConfig<"contribution-snake">({ schedule: "6h" })}
                      >
                        {lang === "zh" ? "每 6 小时" : "Every 6 hours"}
                      </button>
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>
                      {lang === "zh" ? "自动同步的主题蛇配色（Light / Dark）" : "Synced Theme Palette (Light / Dark)"}
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, fontFamily: "var(--font-mono)" }}>
                        <span style={{ minWidth: 38, color: "var(--studio-muted)" }}>LIGHT</span>
                        <span className="swatch-mini" style={{ backgroundColor: lightPal.snake, width: 12, height: 12 }} title={`snake ${lightPal.snake}`} />
                        <span style={{ color: "var(--studio-muted)" }}>→</span>
                        {lightPal.dots.map((hex, i) => (
                          <span key={`l-${i}`} className="swatch-mini" style={{ backgroundColor: hex, width: 12, height: 12 }} title={hex} />
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, fontFamily: "var(--font-mono)" }}>
                        <span style={{ minWidth: 38, color: "var(--studio-muted)" }}>DARK</span>
                        <span className="swatch-mini" style={{ backgroundColor: darkPal.snake, width: 12, height: 12 }} title={`snake ${darkPal.snake}`} />
                        <span style={{ color: "var(--studio-muted)" }}>→</span>
                        {darkPal.dots.map((hex, i) => (
                          <span key={`d-${i}`} className="swatch-mini" style={{ backgroundColor: hex, width: 12, height: 12 }} title={hex} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="diy-hint-note">
                    {cfg.engine === "gitskins-svg" ? t.fieldSnakeNoteNative : t.fieldSnakeNotePlatane}
                  </p>
                </div>
              );
            })()}

            {activeWidgetId === "keycap-rig" && (() => {
              const cfg = current.config as KeycapRigConfig;
              return (
                <div className="diy-form">
                  <div className="diy-field">
                    <label>{t.fieldKeycapTitle}</label>
                    <input
                      type="text"
                      maxLength={24}
                      value={cfg.title}
                      onChange={(e) => patchConfig<"keycap-rig">({ title: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldKeycapKeys}</label>
                    <input
                      type="text"
                      maxLength={120}
                      value={cfg.keys}
                      onChange={(e) => patchConfig<"keycap-rig">({ keys: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldKeycapAccent}</label>
                    <input
                      type="text"
                      maxLength={60}
                      value={cfg.accentKeys}
                      onChange={(e) => patchConfig<"keycap-rig">({ accentKeys: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldKeycapHardware}</label>
                    <input
                      type="text"
                      maxLength={70}
                      value={cfg.hardware}
                      onChange={(e) => patchConfig<"keycap-rig">({ hardware: e.target.value })}
                    />
                  </div>
                </div>
              );
            })()}

            {activeWidgetId === "split-flap" && (() => {
              const cfg = current.config as SplitFlapConfig;
              return (
                <div className="diy-form">
                  <div className="diy-field-row">
                    <div className="diy-field">
                      <label>{t.fieldFlapHeader}</label>
                      <input
                        type="text"
                        maxLength={24}
                        value={cfg.header}
                        onChange={(e) => patchConfig<"split-flap">({ header: e.target.value })}
                      />
                    </div>
                    <div className="diy-field">
                      <label>{t.fieldFlapCode}</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={cfg.code}
                        onChange={(e) => patchConfig<"split-flap">({ code: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldFlapLine1}</label>
                    <input
                      type="text"
                      maxLength={24}
                      value={cfg.line1}
                      onChange={(e) => patchConfig<"split-flap">({ line1: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldFlapLine2}</label>
                    <input
                      type="text"
                      maxLength={24}
                      value={cfg.line2}
                      onChange={(e) => patchConfig<"split-flap">({ line2: e.target.value })}
                    />
                  </div>
                </div>
              );
            })()}

            {activeWidgetId === "skill-radar" && (() => {
              const cfg = current.config as SkillRadarConfig;
              return (
                <div className="diy-form">
                  <div className="diy-field-row">
                    <div className="diy-field">
                      <label>{t.fieldRadarTitle}</label>
                      <input
                        type="text"
                        maxLength={24}
                        value={cfg.title}
                        onChange={(e) => patchConfig<"skill-radar">({ title: e.target.value })}
                      />
                    </div>
                    <div className="diy-field">
                      <label>{t.fieldRadarSub}</label>
                      <input
                        type="text"
                        maxLength={24}
                        value={cfg.subtitle}
                        onChange={(e) => patchConfig<"skill-radar">({ subtitle: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldRadarAxes}</label>
                    <input
                      type="text"
                      maxLength={100}
                      value={cfg.axes}
                      onChange={(e) => patchConfig<"skill-radar">({ axes: e.target.value })}
                    />
                  </div>
                </div>
              );
            })()}

            {activeWidgetId === "qr-pass" && (() => {
              const cfg = current.config as QrPassConfig;
              return (
                <div className="diy-form">
                  <div className="diy-field">
                    <label>{t.fieldQrUrl}</label>
                    <input
                      type="url"
                      maxLength={78}
                      value={cfg.url}
                      onChange={(e) => patchConfig<"qr-pass">({ url: e.target.value })}
                    />
                  </div>
                  <div className="diy-field-row">
                    <div className="diy-field">
                      <label>{t.fieldQrTitle}</label>
                      <input
                        type="text"
                        maxLength={24}
                        value={cfg.title}
                        onChange={(e) => patchConfig<"qr-pass">({ title: e.target.value })}
                      />
                    </div>
                    <div className="diy-field">
                      <label>{t.fieldQrBadge}</label>
                      <input
                        type="text"
                        maxLength={14}
                        value={cfg.badge}
                        onChange={(e) => patchConfig<"qr-pass">({ badge: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldQrSub}</label>
                    <input
                      type="text"
                      maxLength={32}
                      value={cfg.subtitle}
                      onChange={(e) => patchConfig<"qr-pass">({ subtitle: e.target.value })}
                    />
                  </div>
                </div>
              );
            })()}

            {activeWidgetId === "contrib-skyline" && (() => {
              const cfg = current.config as ContribSkylineConfig;
              return (
                <div className="diy-form">
                  <div className="diy-field-row">
                    <div className="diy-field">
                      <label>{t.fieldGhUsername}</label>
                      <input
                        type="text"
                        maxLength={39}
                        value={cfg.username}
                        onChange={(e) => patchConfig<"contrib-skyline">({ username: e.target.value })}
                      />
                    </div>
                    <div className="diy-field">
                      <label>{t.fieldSkylineCommits}</label>
                      <input
                        type="number"
                        min={0}
                        max={99999}
                        value={cfg.totalCommits}
                        onChange={(e) =>
                          patchConfig<"contrib-skyline">({ totalCommits: Number(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>
                      {t.fieldSkylineWeeks}: <strong>{cfg.weeks}W</strong>
                    </label>
                    <input
                      type="range"
                      min={12}
                      max={22}
                      value={cfg.weeks}
                      onChange={(e) =>
                        patchConfig<"contrib-skyline">({ weeks: Number(e.target.value) })
                      }
                    />
                  </div>
                  <p className="diy-hint-note">{t.fieldLivePreviewNote}</p>
                </div>
              );
            })()}

            {activeWidgetId === "commit-streak" && (() => {
              const cfg = current.config as CommitStreakConfig;
              return (
                <div className="diy-form">
                  <div className="diy-field">
                    <label>{t.fieldGhUsername}</label>
                    <input
                      type="text"
                      maxLength={39}
                      value={cfg.username}
                      onChange={(e) => patchConfig<"commit-streak">({ username: e.target.value })}
                    />
                  </div>
                  <div className="diy-field-row">
                    <div className="diy-field">
                      <label>{t.fieldStreakCurrent}</label>
                      <input
                        type="number"
                        min={0}
                        max={3650}
                        value={cfg.currentStreak}
                        onChange={(e) =>
                          patchConfig<"commit-streak">({ currentStreak: Number(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="diy-field">
                      <label>{t.fieldStreakLongest}</label>
                      <input
                        type="number"
                        min={0}
                        max={3650}
                        value={cfg.longestStreak}
                        onChange={(e) =>
                          patchConfig<"commit-streak">({ longestStreak: Number(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldSkylineCommits}</label>
                    <input
                      type="number"
                      min={0}
                      max={99999}
                      value={cfg.totalCommits}
                      onChange={(e) =>
                        patchConfig<"commit-streak">({ totalCommits: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <p className="diy-hint-note">{t.fieldLivePreviewNote}</p>
                </div>
              );
            })()}

            {activeWidgetId === "recent-activity" && (() => {
              const cfg = current.config as RecentActivityConfig;
              return (
                <div className="diy-form">
                  <div className="diy-field">
                    <label>{t.fieldGhUsername}</label>
                    <input
                      type="text"
                      maxLength={39}
                      value={cfg.username}
                      onChange={(e) => patchConfig<"recent-activity">({ username: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldActivityEvent1}</label>
                    <input
                      type="text"
                      maxLength={96}
                      value={cfg.event1}
                      onChange={(e) => patchConfig<"recent-activity">({ event1: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldActivityEvent2}</label>
                    <input
                      type="text"
                      maxLength={96}
                      value={cfg.event2}
                      onChange={(e) => patchConfig<"recent-activity">({ event2: e.target.value })}
                    />
                  </div>
                  <div className="diy-field">
                    <label>{t.fieldActivityEvent3}</label>
                    <input
                      type="text"
                      maxLength={96}
                      value={cfg.event3}
                      onChange={(e) => patchConfig<"recent-activity">({ event3: e.target.value })}
                    />
                  </div>
                  <p className="diy-hint-note">{t.fieldLivePreviewNote}</p>
                </div>
              );
            })()}
          </div>

          {/* Single-Widget Agent Prompt */}
          <div className="inspector-section">
            <div className="widget-prompt-head">
              <p className="section-micro-label" style={{ margin: 0 }}>
                {t.widgetPromptHeading}
              </p>
              <button
                type="button"
                className={`mini-copy-btn ${copiedPrompt ? "copied" : ""}`}
                onClick={handleCopyWidgetPrompt}
              >
                {copiedPrompt ? `✓ ${t.copied}` : t.widgetCopyPrompt}
              </button>
            </div>
            <pre className="prompt-box compact">{singlePrompt}</pre>
          </div>
        </aside>
      </section>
    </>
  );
}
