import { useEffect, useMemo, useRef, useState } from "react";
import WidgetsStudio, { svgToDataUri } from "./components/WidgetsStudio";
import { COPY } from "./i18n";
import {
  GitHubProfileError,
  createDemoProfileData,
  fetchGitHubProfile,
  type FetchProfileErrorCode,
  type LiveProfileData,
} from "./profile/githubApi";
import {
  DEFAULT_OVERRIDES,
  appendParametricOverridesToPrompt,
  buildProfileZipEntries,
  hasActiveOverrides,
  renderProfileSuite,
  type CopyLangPref,
  type ProfileOverrides,
} from "./profile/renderProfileTheme";
import { downloadZipArchive } from "./profile/zipExport";
import type { Lang, PreviewMode, PromptKind, SkinTheme } from "./types";
import {
  BENTO_PRESETS,
  packBentoRows,
  renderCompositeBentoRowSvg,
} from "./widgets/bento";
import {
  ACCENT_PRESETS,
  STANDARD_PLACEMENTS,
  WIDGET_CATALOG,
  buildCombinedProfilePrompt,
  colSpanLabel,
  createDefaultWidgetInstance,
  downloadSvgFile,
  getWidgetMeta,
  placementLabel,
} from "./widgets/catalog";
import { renderWidgetSvg } from "./widgets/renderers";
import { isLiveWidgetId } from "./widgets/workflow";
import type {
  BentoColSpan,
  BentoRow,
  HeroStickerConfig,
  MiniTileConfig,
  MiniTileScene,
  WidgetId,
  WidgetInstance,
  WidgetPlacement,
} from "./widgets/types";

type ActiveTab = "skins" | "widgets";
type RowSlot = Exclude<WidgetPlacement, "hero-overlay">;

interface GhostFillTarget {
  slot: RowSlot;
  afterUid: string;
  remainingCols: number;
  lastItemUid: string;
}

const STORAGE_KEY_V2 = "gitskins:bento-v2";
const STORAGE_KEY_V1 = "gitskins:diy-widgets-v1";

function detectInitialLang(): Lang {
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("zh")) {
    return "zh";
  }
  return "en";
}

function buildInitialDrafts(): Record<WidgetId, WidgetInstance> {
  const map = {} as Record<WidgetId, WidgetInstance>;
  for (const entry of WIDGET_CATALOG) {
    map[entry.id] = createDefaultWidgetInstance(entry.id);
  }
  return map;
}

function normalizeInstance(raw: Partial<WidgetInstance>): WidgetInstance | null {
  if (!raw.widgetId) return null;
  const entry = WIDGET_CATALOG.find((w) => w.id === raw.widgetId);
  if (!entry) return null;

  // Migrate legacy size -> colSpan if needed
  const legacySize = (raw as { size?: string }).size;
  let colSpan: BentoColSpan = entry.defaultColSpan;
  if (raw.colSpan && entry.supportedColSpans.includes(raw.colSpan)) {
    colSpan = raw.colSpan;
  } else if (legacySize === "full" || legacySize === "strip") {
    colSpan = 4;
  } else if (legacySize === "half") {
    colSpan = 2;
  } else if (legacySize === "tile" || legacySize === "sticker") {
    colSpan = 1;
  }

  const placement =
    raw.placement && entry.supportedPlacements.includes(raw.placement)
      ? raw.placement
      : entry.defaultPlacement;

  return {
    uid: raw.uid || `${entry.id}-${Math.random().toString(36).slice(2, 7)}`,
    widgetId: entry.id,
    colSpan,
    placement,
    accentOverride: typeof raw.accentOverride === "string" ? raw.accentOverride : "",
    animated: typeof raw.animated === "boolean" ? raw.animated : true,
    config: { ...entry.defaultConfig, ...(raw.config ?? {}) },
  };
}

function loadSavedBentoState(): {
  drafts: Record<WidgetId, WidgetInstance>;
  mounted: WidgetInstance[];
} {
  const defaults = buildInitialDrafts();
  if (typeof window === "undefined") {
    return { drafts: defaults, mounted: [] };
  }
  try {
    const rawV2 = window.localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as {
        drafts?: Partial<Record<WidgetId, Partial<WidgetInstance>>>;
        mounted?: Partial<WidgetInstance>[];
      };
      const mergedDrafts = { ...defaults };
      if (parsed.drafts) {
        for (const entry of WIDGET_CATALOG) {
          const norm = normalizeInstance(parsed.drafts[entry.id] ?? {});
          if (norm) mergedDrafts[entry.id] = norm;
        }
      }
      const mounted = Array.isArray(parsed.mounted)
        ? parsed.mounted.map(normalizeInstance).filter((x): x is WidgetInstance => x !== null)
        : [];
      return { drafts: mergedDrafts, mounted };
    }

    // Migrate v1 state seamlessly
    const rawV1 = window.localStorage.getItem(STORAGE_KEY_V1);
    if (rawV1) {
      const parsed = JSON.parse(rawV1) as {
        drafts?: Partial<Record<WidgetId, Partial<WidgetInstance>>>;
        loadoutIds?: WidgetId[];
      };
      const mergedDrafts = { ...defaults };
      if (parsed.drafts) {
        for (const entry of WIDGET_CATALOG) {
          const norm = normalizeInstance(parsed.drafts[entry.id] ?? {});
          if (norm) mergedDrafts[entry.id] = norm;
        }
      }
      const mounted: WidgetInstance[] = [];
      if (Array.isArray(parsed.loadoutIds)) {
        for (const id of parsed.loadoutIds) {
          const base = mergedDrafts[id];
          if (base) mounted.push({ ...base, config: { ...base.config } });
        }
      }
      return { drafts: mergedDrafts, mounted };
    }
  } catch {
    /* ignore corrupt storage */
  }
  return { drafts: defaults, mounted: [] };
}

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" fill="#111214" />
      <rect x="7" y="7" width="50" height="50" fill="none" stroke="#F3F2EC" strokeWidth="2.5" />
      <rect x="13" y="13" width="23" height="16" fill="#00A3CC" />
      <rect x="40" y="13" width="11" height="16" fill="#F3F2EC" />
      <rect x="13" y="33" width="16" height="18" fill="#F3F2EC" />
      <rect x="33" y="33" width="18" height="18" fill="#E45847" />
    </svg>
  );
}

export default function App() {
  const [themes, setThemes] = useState<SkinTheme[]>([]);
  const [activeId, setActiveId] = useState<string>("swiss-bauhaus-pixel");
  const [activeTab, setActiveTab] = useState<ActiveTab>(() =>
    typeof window !== "undefined" && window.location.hash === "#widgets" ? "widgets" : "skins"
  );
  const [previewMode, setPreviewMode] = useState<PreviewMode>("light");
  const [lang, setLang] = useState<Lang>(detectInitialLang);
  const [promptKind, setPromptKind] = useState<PromptKind>("quick");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [exportedZipCount, setExportedZipCount] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const quickFillRef = useRef<HTMLDivElement | null>(null);
  const livePyRef = useRef<string | null>(null);

  // Live GitHub Preview & Parametric Overrides
  const [ghInput, setGhInput] = useState("");
  const [liveProfile, setLiveProfile] = useState<LiveProfileData | null>(null);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState<FetchProfileErrorCode | null>(null);
  const [overrides, setOverrides] = useState<ProfileOverrides>(DEFAULT_OVERRIDES);

  // Multi-Instance 4-Column Bento Widget State
  const initialBento = useMemo(() => loadSavedBentoState(), []);
  const [widgetDrafts, setWidgetDrafts] = useState<Record<WidgetId, WidgetInstance>>(
    initialBento.drafts
  );
  const [mountedWidgets, setMountedWidgets] = useState<WidgetInstance[]>(initialBento.mounted);
  const [selectedWidgetId, setSelectedWidgetId] = useState<WidgetId>("mini-tile");
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [presetTargetSlot, setPresetTargetSlot] = useState<RowSlot>("under-hero");
  const [ghostFillTarget, setGhostFillTarget] = useState<GhostFillTarget | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY_V2,
        JSON.stringify({ drafts: widgetDrafts, mounted: mountedWidgets })
      );
    } catch {
      /* ignore storage errors */
    }
  }, [widgetDrafts, mountedWidgets]);

  useEffect(() => {
    fetch("/themes/manifest.json")
      .then((res) => res.json())
      .then((data: SkinTheme[]) => {
        setThemes(data);
        const hash = window.location.hash.replace("#", "").trim();
        if (hash === "widgets") {
          setActiveTab("widgets");
          if (data.length > 0) setActiveId(data[0].id);
        } else if (hash && data.some((t) => t.id === hash)) {
          setActiveId(hash);
        } else if (data.length > 0) {
          setActiveId(data[0].id);
        }
      })
      .catch((err) => console.error("Failed to load theme manifest:", err));
  }, []);

  const activeTheme = useMemo(
    () => themes.find((t) => t.id === activeId) ?? themes[0] ?? null,
    [themes, activeId]
  );

  const demoProfile = useMemo(() => createDemoProfileData(), []);
  const effectiveProfile = liveProfile ?? demoProfile;
  const overridesActive = hasActiveOverrides(overrides);
  const useParametricRender = Boolean(liveProfile) || overridesActive;

  const renderedSuite = useMemo(() => {
    if (!activeTheme || !useParametricRender) return null;
    return renderProfileSuite(effectiveProfile, activeTheme, previewMode, overrides);
  }, [activeTheme, useParametricRender, effectiveProfile, previewMode, overrides]);

  const widgetsBySlot = useMemo(() => {
    const map: Record<WidgetPlacement, WidgetInstance[]> = {
      top: [],
      "hero-overlay": [],
      "under-hero": [],
      "under-cards": [],
      bottom: [],
    };
    for (const w of mountedWidgets) {
      map[w.placement].push(w);
    }
    return map;
  }, [mountedWidgets]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (activeTab !== "skins" || !themes.length) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      const idx = themes.findIndex((t) => t.id === activeId);
      if (e.key === "ArrowRight") {
        const next = themes[(idx + 1) % themes.length];
        selectTheme(next.id, false);
      } else if (e.key === "ArrowLeft") {
        const prev = themes[(idx - 1 + themes.length) % themes.length];
        selectTheme(prev.id, false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [themes, activeId, activeTab]);

  const t = COPY[lang];

  function selectTheme(id: string, scrollToStage: boolean) {
    setActiveId(id);
    setCopiedPrompt(false);
    if (activeTab === "skins") {
      window.history.replaceState(null, "", `#${id}`);
    }
    if (scrollToStage && stageRef.current) {
      stageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function switchTab(next: ActiveTab) {
    setActiveTab(next);
    setCopiedPrompt(false);
    setGhostFillTarget(null);
    window.history.replaceState(
      null,
      "",
      next === "widgets" ? "#widgets" : `#${activeTheme?.id ?? "swiss-bauhaus-pixel"}`
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleFetchGitHub(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = ghInput.trim().replace(/^@+/, "");
    if (!cleaned) {
      setLiveProfile(null);
      setGhError(null);
      return;
    }
    setGhLoading(true);
    setGhError(null);
    try {
      const data = await fetchGitHubProfile(cleaned);
      setLiveProfile(data);
      setCopiedPrompt(false);
    } catch (err) {
      if (err instanceof GitHubProfileError) {
        setGhError(err.code);
      } else {
        setGhError("network");
      }
    } finally {
      setGhLoading(false);
    }
  }

  function handleResetGitHub() {
    setGhInput("");
    setLiveProfile(null);
    setGhError(null);
    setCopiedPrompt(false);
  }

  async function handleExportZip() {
    if (!activeTheme) return;
    const hasLive = mountedWidgets.some((w) => isLiveWidgetId(w.widgetId));
    let liveGeneratorPy = livePyRef.current ?? undefined;
    if (hasLive && !liveGeneratorPy) {
      try {
        const res = await fetch("/live-widgets/generate_live_widgets.py");
        if (res.ok) {
          liveGeneratorPy = await res.text();
          livePyRef.current = liveGeneratorPy;
        }
      } catch {
        /* fallback: workflow YAML auto-downloads script if absent */
      }
    }
    const entries = buildProfileZipEntries({
      profile: effectiveProfile,
      theme: activeTheme,
      overrides,
      mountedWidgets,
      lang,
      liveGeneratorPy,
    });
    const safeUser = effectiveProfile.username.toLowerCase().replace(/[^a-z0-9-]/g, "");
    downloadZipArchive(`gitskins-${safeUser}-${activeTheme.id}.zip`, entries);
    setExportedZipCount(entries.length);
    window.setTimeout(() => setExportedZipCount(null), 2600);
  }

  function handleDownloadCompositeRow(slot: RowSlot, row: BentoRow, rIdx: number) {
    if (!activeTheme) return;
    const base = `bento-${slot}-r${rIdx + 1}`;
    const lSvg = renderCompositeBentoRowSvg(row, {
      themeId: activeTheme.id,
      mode: "light",
      tokens: activeTheme.tokens.light,
      globalAccent: overrides.accentOverride,
      globalAnimated: overrides.animated,
      rowKey: `dl-${slot}-r${rIdx}-l`,
    });
    const dSvg = renderCompositeBentoRowSvg(row, {
      themeId: activeTheme.id,
      mode: "dark",
      tokens: activeTheme.tokens.dark,
      globalAccent: overrides.accentOverride,
      globalAnimated: overrides.animated,
      rowKey: `dl-${slot}-r${rIdx}-d`,
    });
    downloadSvgFile(`${base}-light.svg`, lSvg);
    window.setTimeout(() => downloadSvgFile(`${base}-dark.svg`, dSvg), 180);
  }

  // Multi-instance handlers
  function handleUpdateWidgetDraft(id: WidgetId, next: WidgetInstance) {
    setWidgetDrafts((prev) => ({ ...prev, [id]: next }));
  }

  function handleResetWidgetDraft(id: WidgetId) {
    setWidgetDrafts((prev) => ({ ...prev, [id]: createDefaultWidgetInstance(id) }));
  }

  function handleAddInstance(inst: WidgetInstance) {
    setMountedWidgets((prev) => [...prev, inst]);
    setCopiedPrompt(false);
  }

  function handleUpdateMountedInstance(uid: string, next: WidgetInstance) {
    setMountedWidgets((prev) => prev.map((w) => (w.uid === uid ? next : w)));
    setCopiedPrompt(false);
  }

  function handleRemoveInstance(uid: string) {
    setMountedWidgets((prev) => prev.filter((w) => w.uid !== uid));
    if (editingUid === uid) setEditingUid(null);
    setGhostFillTarget(null);
    setCopiedPrompt(false);
  }

  function handleDuplicateInstance(uid: string) {
    setMountedWidgets((prev) => {
      const idx = prev.findIndex((w) => w.uid === uid);
      if (idx < 0) return prev;
      const src = prev[idx];
      const copy: WidgetInstance = {
        ...src,
        uid: `${src.widgetId}-${Math.random().toString(36).slice(2, 7)}`,
        config: { ...src.config },
      };
      const out = [...prev];
      out.splice(idx + 1, 0, copy);
      return out;
    });
    setCopiedPrompt(false);
  }

  function handleMoveInstanceInSlot(uid: string, delta: -1 | 1) {
    setMountedWidgets((prev) => {
      const target = prev.find((w) => w.uid === uid);
      if (!target) return prev;
      const sameSlotIndices = prev
        .map((w, i) => (w.placement === target.placement ? i : -1))
        .filter((i) => i >= 0);
      const posInSlot = sameSlotIndices.findIndex((i) => prev[i].uid === uid);
      const swapSlotPos = posInSlot + delta;
      if (posInSlot < 0 || swapSlotPos < 0 || swapSlotPos >= sameSlotIndices.length) return prev;
      const idxA = sameSlotIndices[posInSlot];
      const idxB = sameSlotIndices[swapSlotPos];
      const out = [...prev];
      const tmp = out[idxA];
      out[idxA] = out[idxB];
      out[idxB] = tmp;
      return out;
    });
  }

  function handleChangeInstanceSlot(uid: string, placement: WidgetPlacement) {
    setMountedWidgets((prev) =>
      prev.map((w) => (w.uid === uid ? { ...w, placement } : w))
    );
    setGhostFillTarget(null);
    setCopiedPrompt(false);
  }

  function handleChangeInstanceSpan(uid: string, colSpan: BentoColSpan) {
    setMountedWidgets((prev) =>
      prev.map((w) => (w.uid === uid ? { ...w, colSpan } : w))
    );
    setGhostFillTarget(null);
    setCopiedPrompt(false);
  }

  function handleApplyBentoPreset(presetId: string) {
    const preset = BENTO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const newItems = preset.build(presetTargetSlot);
    setMountedWidgets((prev) => [...prev, ...newItems]);
    setGhostFillTarget(null);
    setCopiedPrompt(false);
  }

  function openInstanceInStudio(w: WidgetInstance) {
    setSelectedWidgetId(w.widgetId);
    setEditingUid(w.uid);
    switchTab("widgets");
  }

  function openGhostFill(slot: RowSlot, row: BentoRow) {
    const last = row.items[row.items.length - 1];
    setGhostFillTarget({
      slot,
      afterUid: last.uid,
      remainingCols: row.remainingCols,
      lastItemUid: last.uid,
    });
    window.setTimeout(() => {
      quickFillRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  }

  function insertIntoGhostSlot(newInst: WidgetInstance) {
    if (!ghostFillTarget) return;
    setMountedWidgets((prev) => {
      const idx = prev.findIndex((w) => w.uid === ghostFillTarget.afterUid);
      const out = [...prev];
      if (idx >= 0) out.splice(idx + 1, 0, newInst);
      else out.push(newInst);
      return out;
    });
    setGhostFillTarget(null);
    setCopiedPrompt(false);
  }

  function insertMiniTileSceneIntoGhost(
    scene: MiniTileScene,
    title: string,
    subtitle: string
  ) {
    if (!ghostFillTarget) return;
    const base = createDefaultWidgetInstance("mini-tile", {
      colSpan: 1,
      placement: ghostFillTarget.slot,
    });
    base.config = {
      ...(base.config as MiniTileConfig),
      scene,
      title,
      subtitle,
    };
    insertIntoGhostSlot(base);
  }

  function stretchLastItemInGhostRow() {
    if (!ghostFillTarget) return;
    const target = mountedWidgets.find((w) => w.uid === ghostFillTarget.lastItemUid);
    if (!target) return;
    const meta = getWidgetMeta(target.widgetId);
    const desired = Math.min(4, target.colSpan + ghostFillTarget.remainingCols) as BentoColSpan;
    const candidates = meta.supportedColSpans.filter(
      (s) => s > target.colSpan && s <= desired
    );
    if (!candidates.length) return;
    const best = candidates[candidates.length - 1];
    handleChangeInstanceSpan(target.uid, best);
  }

  function renderSlotBento(slot: RowSlot) {
    if (!activeTheme) return null;
    const list = widgetsBySlot[slot];
    if (!list.length) return null;
    const rows = packBentoRows(list);
    return (
      <div className={`gh-mounted-widgets slot-${slot}`}>
        {rows.map((row, rIdx) => {
          if (row.isStrip) {
            const w = row.items[0];
            const svg = renderWidgetSvg(w.widgetId, w.config, {
              themeId: activeTheme.id,
              mode: previewMode,
              tokens: activeTheme.tokens[previewMode],
              colSpan: 4,
              accentOverride: w.accentOverride || overrides.accentOverride,
              animated: w.animated && overrides.animated,
              instanceId: `stage-${slot}-r${rIdx}-${w.uid}`,
            });
            const meta = getWidgetMeta(w.widgetId);
            return (
              <div key={`${slot}-strip-${w.uid}`} className="gh-row">
                <button
                  type="button"
                  className="gh-widget-slot"
                  title={
                    lang === "zh"
                      ? `点击定制「${meta.nameZh}」`
                      : `Click to customize ${meta.name}`
                  }
                  onClick={() => openInstanceInStudio(w)}
                >
                  <img
                    className="widget-svg-img"
                    src={svgToDataUri(svg)}
                    alt={lang === "zh" ? meta.nameZh : meta.name}
                  />
                </button>
              </div>
            );
          }

          return (
            <div
              key={`${slot}-row-${rIdx}-${row.items.map((x) => x.uid).join("-")}`}
              className="gh-row gh-bento-row"
            >
              {row.items.map((w) => {
                const svg = renderWidgetSvg(w.widgetId, w.config, {
                  themeId: activeTheme.id,
                  mode: previewMode,
                  tokens: activeTheme.tokens[previewMode],
                  colSpan: w.colSpan,
                  targetHeight: row.items.length > 1 || w.widgetId !== "skill-dock" ? row.rowHeight : undefined,
                  inBentoRow: true,
                  accentOverride: w.accentOverride || overrides.accentOverride,
                  animated: w.animated && overrides.animated,
                  instanceId: `stage-${slot}-r${rIdx}-${w.uid}`,
                });
                const meta = getWidgetMeta(w.widgetId);
                return (
                  <button
                    key={w.uid}
                    type="button"
                    className="gh-widget-slot gh-bento-cell"
                    style={{ gridColumn: `span ${w.colSpan}` }}
                    title={
                      lang === "zh"
                        ? `点击实时编辑「${meta.nameZh}」`
                        : `Click to customize ${meta.name}`
                    }
                    onClick={() => openInstanceInStudio(w)}
                  >
                    <img
                      className="widget-svg-img"
                      src={svgToDataUri(svg)}
                      alt={lang === "zh" ? meta.nameZh : meta.name}
                    />
                  </button>
                );
              })}

              {/* Interactive Ghost Slot for unfilled columns — zero awkward empty void! */}
              {row.remainingCols > 0 && (
                <button
                  type="button"
                  className={`gh-ghost-slot ${
                    ghostFillTarget?.afterUid === row.items[row.items.length - 1].uid
                      ? "active"
                      : ""
                  }`}
                  style={{ gridColumn: `span ${row.remainingCols}` }}
                  onClick={() => openGhostFill(slot, row)}
                >
                  <span className="ghost-slot-plus">
                    {t.bentoFillColsPrefix} {row.remainingCols} {t.bentoFillColsSuffix}
                  </span>
                  <span className="ghost-slot-sub">
                    {row.usedCols}/4 ·{" "}
                    {lang === "zh"
                      ? "点此拼入挂件或拉宽填满"
                      : "Click to combine widget or stretch"}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const basePrompt = activeTheme ? activeTheme.prompts[promptKind][lang] : "";
  const currentPrompt = useMemo(() => {
    if (!activeTheme) return "";
    const withWidgets = buildCombinedProfilePrompt(basePrompt, mountedWidgets, activeTheme, lang);
    return appendParametricOverridesToPrompt(withWidgets, liveProfile, overrides, lang);
  }, [basePrompt, mountedWidgets, activeTheme, liveProfile, overrides, lang]);

  async function handleCopyPrompt() {
    if (!currentPrompt) return;
    try {
      await navigator.clipboard.writeText(currentPrompt);
      setCopiedPrompt(true);
      window.setTimeout(() => setCopiedPrompt(false), 2200);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = currentPrompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedPrompt(true);
      window.setTimeout(() => setCopiedPrompt(false), 2200);
    }
  }

  async function handleCopyHex(hex: string) {
    try {
      await navigator.clipboard.writeText(hex);
    } catch {
      /* ignore */
    }
    setCopiedHex(hex);
    window.setTimeout(() => setCopiedHex(null), 1400);
  }

  const ghErrorMessage =
    ghError === "invalid"
      ? t.tryGhErrInvalid
      : ghError === "not-found"
        ? t.tryGhErrNotFound
        : ghError === "rate-limit"
          ? t.tryGhErrRateLimit
          : ghError === "network"
            ? t.tryGhErrNetwork
            : "";

  const assetBase = activeTheme ? `/themes/${activeTheme.id}/assets` : "";
  const activeAccentDisplay = overrides.accentOverride || activeTheme?.accent || "#00A3CC";

  // Check if the last block of active ghostFillTarget can be stretched
  const ghostStretchable = useMemo(() => {
    if (!ghostFillTarget) return false;
    const item = mountedWidgets.find((w) => w.uid === ghostFillTarget.lastItemUid);
    if (!item) return false;
    const meta = getWidgetMeta(item.widgetId);
    const maxSpan = Math.min(4, item.colSpan + ghostFillTarget.remainingCols);
    return meta.supportedColSpans.some((s) => s > item.colSpan && s <= maxSpan);
  }, [ghostFillTarget, mountedWidgets]);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a
            className="brand"
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              switchTab("skins");
            }}
          >
            <BrandMark />
            <div className="brand-text">
              <span className="brand-name">GitSkins</span>
              <span className="brand-sub">{t.subtitle}</span>
            </div>
          </a>

          <div className="topbar-actions">
            <nav className="studio-nav" role="tablist" aria-label="Workspace mode">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "skins"}
                className={`studio-nav-btn ${activeTab === "skins" ? "active" : ""}`}
                onClick={() => switchTab("skins")}
              >
                {t.navSkins}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "widgets"}
                className={`studio-nav-btn ${activeTab === "widgets" ? "active" : ""}`}
                onClick={() => switchTab("widgets")}
              >
                <span>{t.navWidgets}</span>
                {mountedWidgets.length > 0 && (
                  <span className="nav-count-badge">{mountedWidgets.length}</span>
                )}
              </button>
            </nav>

            <div className="lang-switch" role="group" aria-label="Language">
              <button
                type="button"
                className={`lang-btn ${lang === "en" ? "active" : ""}`}
                onClick={() => setLang("en")}
              >
                EN
              </button>
              <button
                type="button"
                className={`lang-btn ${lang === "zh" ? "active" : ""}`}
                onClick={() => setLang("zh")}
              >
                中文
              </button>
            </div>
            <a
              className="repo-link"
              href="https://github.com/Furina-he/gitskins"
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </header>

      <main className="shell" id="top">
        {activeTab === "widgets" && activeTheme ? (
          <WidgetsStudio
            themes={themes}
            activeTheme={activeTheme}
            onSelectTheme={(id) => selectTheme(id, false)}
            previewMode={previewMode}
            onChangePreviewMode={setPreviewMode}
            lang={lang}
            selectedWidgetId={selectedWidgetId}
            onSelectWidgetId={setSelectedWidgetId}
            drafts={widgetDrafts}
            onUpdateDraft={handleUpdateWidgetDraft}
            onResetDraft={handleResetWidgetDraft}
            mountedWidgets={mountedWidgets}
            editingUid={editingUid}
            onExitEditInstance={() => setEditingUid(null)}
            onUpdateMountedInstance={handleUpdateMountedInstance}
            onAddInstance={handleAddInstance}
            onDuplicateInstance={handleDuplicateInstance}
            onRemoveInstance={handleRemoveInstance}
            onJumpToProfile={() => switchTab("skins")}
          />
        ) : (
          <>
            <section className="hero-band">
              <h1 className="hero-title">
                {t.heroTitleA}
                <br />
                <span className="hero-title-muted">{t.heroTitleB}</span>
              </h1>
              <div className="hero-meta">
                <p className="hero-lead">{t.heroLead}</p>
                <div className="steps-strip">
                  <span className="step-pill">
                    <span className="step-num">1</span>
                    {t.step1}
                  </span>
                  <span className="step-pill">
                    <span className="step-num">2</span>
                    {t.step2}
                  </span>
                  <span className="step-pill">
                    <span className="step-num">3</span>
                    {t.step3}
                  </span>
                </div>
              </div>
            </section>

            {/* Horizontal Skin Switcher */}
            <nav className="skin-rail" aria-label="Theme skins" ref={stageRef}>
              {themes.map((skin) => {
                const isActive = skin.id === activeTheme?.id;
                const swatches = skin.palette[previewMode].slice(0, 5);
                return (
                  <button
                    key={skin.id}
                    type="button"
                    className={`skin-tab ${isActive ? "active" : ""}`}
                    onClick={() => selectTheme(skin.id, false)}
                  >
                    <div className="skin-tab-top">
                      <span className="skin-index">0{skin.order}</span>
                      <span className="skin-swatches">
                        {swatches.map((hex) => (
                          <span
                            key={hex}
                            className="swatch-mini"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </span>
                    </div>
                    <div className="skin-tab-name">
                      {lang === "zh" ? skin.nameZh : skin.name}
                    </div>
                    <div className="skin-tab-cat">
                      {lang === "zh" ? skin.categoryZh : skin.category}
                    </div>
                  </button>
                );
              })}
            </nav>

            {activeTheme && (
              <section className="workspace" aria-label="Interactive theme specimen">
                {/* Left: Live 846px GitHub Profile Stage */}
                <div className="stage-card">
                  <div className="stage-toolbar">
                    <div className="stage-path">
                      <span
                        className="stage-dot"
                        style={{ backgroundColor: activeAccentDisplay }}
                      />
                      <span>
                        themes/{activeTheme.id} · <strong>846px</strong> GitHub frame
                      </span>
                    </div>

                    <div className="stage-controls">
                      <button
                        type="button"
                        className={`zip-toolbar-btn ${exportedZipCount ? "done" : ""}`}
                        onClick={handleExportZip}
                      >
                        {exportedZipCount
                          ? `✓ ${t.exportZipDone} (${exportedZipCount})`
                          : `↓ ZIP`}
                      </button>

                      <div className="mode-switch" role="group" aria-label="Preview color scheme">
                        <button
                          type="button"
                          className={`mode-btn ${previewMode === "light" ? "active" : ""}`}
                          onClick={() => setPreviewMode("light")}
                        >
                          {t.ghLight}
                        </button>
                        <button
                          type="button"
                          className={`mode-btn ${previewMode === "dark" ? "active" : ""}`}
                          onClick={() => setPreviewMode("dark")}
                        >
                          {t.ghDark}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Try with Your GitHub Live Preview Bar */}
                  <div className="try-github-bar">
                    <form className="try-github-form" onSubmit={handleFetchGitHub}>
                      <div className="try-github-input-wrap">
                        <span className="try-gh-at">@</span>
                        <input
                          type="text"
                          value={ghInput}
                          onChange={(e) => setGhInput(e.target.value)}
                          placeholder={t.tryGhPlaceholder}
                          aria-label="GitHub username"
                        />
                      </div>
                      <button
                        type="submit"
                        className="try-gh-submit"
                        disabled={ghLoading}
                      >
                        {ghLoading ? t.tryGhLoading : t.tryGhBtn}
                      </button>
                      {liveProfile && (
                        <button
                          type="button"
                          className="try-gh-reset"
                          onClick={handleResetGitHub}
                        >
                          {t.tryGhReset}
                        </button>
                      )}
                    </form>
                    {liveProfile && (
                      <div className="try-gh-status">
                        <span className="live-dot" />
                        <span>
                          {t.tryGhLivePrefix}: <strong>@{liveProfile.username}</strong> ·{" "}
                          {liveProfile.publicRepos} repos · ★ {liveProfile.totalStars}
                        </span>
                      </div>
                    )}
                    {ghErrorMessage && (
                      <p className="try-gh-error" role="alert">
                        {ghErrorMessage}
                      </p>
                    )}
                  </div>

                  <div className={`gh-stage ${previewMode}`}>
                    <div className="gh-readme-box">
                      <div className="gh-readme-meta">
                        <span>{effectiveProfile.username} / README.md</span>
                        <span>
                          {previewMode === "dark"
                            ? "prefers-color-scheme: dark"
                            : "prefers-color-scheme: light"}
                        </span>
                      </div>

                      {/* Slot 1: Above Hero */}
                      {renderSlotBento("top")}

                      {/* Hero + Embedded Hero Corner Stickers */}
                      <div className="gh-row gh-hero-wrap">
                        <img
                          className="gh-hero-img"
                          src={
                            renderedSuite
                              ? svgToDataUri(renderedSuite.hero)
                              : `${assetBase}/hero-${previewMode}.svg`
                          }
                          alt={`${effectiveProfile.username} — ${activeTheme.name} Hero`}
                        />
                        {widgetsBySlot["hero-overlay"].map((w) => {
                          const anchor = (w.config as HeroStickerConfig).anchor || "bottom-right";
                          const svg = renderWidgetSvg(w.widgetId, w.config, {
                            themeId: activeTheme.id,
                            mode: previewMode,
                            tokens: activeTheme.tokens[previewMode],
                            colSpan: 1,
                            accentOverride: w.accentOverride || overrides.accentOverride,
                            animated: w.animated && overrides.animated,
                            instanceId: `hero-ov-${w.uid}`,
                          });
                          const meta = getWidgetMeta(w.widgetId);
                          return (
                            <button
                              key={w.uid}
                              type="button"
                              className={`gh-hero-sticker anchor-${anchor}`}
                              title={
                                lang === "zh"
                                  ? `点击编辑 Hero 角落贴纸「${meta.nameZh}」`
                                  : `Click to customize ${meta.name}`
                              }
                              onClick={() => openInstanceInStudio(w)}
                            >
                              <img
                                className="widget-svg-img"
                                src={svgToDataUri(svg)}
                                alt={lang === "zh" ? meta.nameZh : meta.name}
                              />
                            </button>
                          );
                        })}
                      </div>

                      <div
                        className={`gh-row gh-buttons ${
                          activeTheme.id === "blueprint-cad" ? "tall" : ""
                        }`}
                      >
                        {renderedSuite
                          ? renderedSuite.buttons.map((btn) => (
                              <a
                                key={btn.id}
                                href={btn.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img src={svgToDataUri(btn.svg)} alt={btn.label} />
                              </a>
                            ))
                          : activeTheme.buttons.map((btn) => (
                              <a
                                key={btn.id}
                                href={btn.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={`${assetBase}/btn-${btn.id}-${previewMode}.svg`}
                                  alt={btn.label}
                                />
                              </a>
                            ))}
                      </div>

                      {/* Slot 2: Under Hero */}
                      {renderSlotBento("under-hero")}

                      <div className="gh-row">
                        <img
                          className="gh-sec-img"
                          src={
                            renderedSuite
                              ? svgToDataUri(renderedSuite.secWork)
                              : `${assetBase}/sec-work-${previewMode}.svg`
                          }
                          alt="Selected projects section"
                        />
                      </div>

                      <div className="gh-row gh-cards-grid">
                        {renderedSuite
                          ? renderedSuite.cards.map((card) => (
                              <a
                                key={card.id}
                                href={card.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img src={svgToDataUri(card.svg)} alt={card.title} />
                              </a>
                            ))
                          : activeTheme.cards.map((card) => (
                              <a
                                key={card.id}
                                href={card.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={`${assetBase}/card-${card.id}-${previewMode}.svg`}
                                  alt={card.title}
                                />
                              </a>
                            ))}
                      </div>

                      {!liveProfile && (
                        <div className="gh-sublinks">
                          {activeTheme.subLinks.map((grp, gIdx) => (
                            <span key={grp.group}>
                              {gIdx > 0 && "  |  "}
                              {grp.group}:{" "}
                              {grp.items.map((item, iIdx) => (
                                <span key={item.label}>
                                  {iIdx > 0 && " · "}
                                  <a href={item.url} target="_blank" rel="noreferrer">
                                    {item.label}
                                  </a>
                                </span>
                              ))}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Slot 3: Under Project Cards */}
                      {renderSlotBento("under-cards")}

                      <div className="gh-row" style={{ marginTop: 14 }}>
                        <img
                          className="gh-sec-img"
                          src={
                            renderedSuite
                              ? svgToDataUri(renderedSuite.secActivity)
                              : `${assetBase}/sec-activity-${previewMode}.svg`
                          }
                          alt="Activity section"
                        />
                      </div>

                      <div className="gh-snake-strip">{t.snakeNote}</div>

                      {/* Slot 4: Bottom Footer */}
                      {renderSlotBento("bottom")}
                    </div>
                  </div>

                  {/* 4-Column Bento Loadout Composer & Presets */}
                  <div className="loadout-dock">
                    <div className="loadout-dock-head">
                      <span className="section-micro-label" style={{ margin: 0 }}>
                        {t.loadoutTitle} ({mountedWidgets.length})
                      </span>
                      <div className="loadout-dock-tools">
                        {mountedWidgets.length > 0 && (
                          <button
                            type="button"
                            className="reset-link"
                            onClick={() => {
                              setMountedWidgets([]);
                              setGhostFillTarget(null);
                            }}
                          >
                            {t.bentoClearAll}
                          </button>
                        )}
                        <button
                          type="button"
                          className="mini-action-btn"
                          onClick={() => {
                            setEditingUid(null);
                            switchTab("widgets");
                          }}
                        >
                          + {t.loadoutOpenStudio} →
                        </button>
                      </div>
                    </div>

                    {/* Inline Ghost Slot Quick-Fill Picker */}
                    {ghostFillTarget && (
                      <div className="ghost-fill-drawer" ref={quickFillRef}>
                        <div className="ghost-fill-head">
                          <span>
                            {t.bentoQuickFillTitle}{" "}
                            <strong>
                              {ghostFillTarget.remainingCols}/4{" "}
                              {lang === "zh" ? "格" : "cols"}
                            </strong>{" "}
                            ({placementLabel(ghostFillTarget.slot, lang)})
                          </span>
                          <button
                            type="button"
                            className="reset-link"
                            onClick={() => setGhostFillTarget(null)}
                          >
                            {t.bentoClose}
                          </button>
                        </div>

                        <div className="ghost-fill-options">
                          {ghostStretchable && (
                            <button
                              type="button"
                              className="ghost-option-btn highlight"
                              onClick={stretchLastItemInGhostRow}
                            >
                              {t.bentoStretchFill}
                            </button>
                          )}

                          {/* 1-col Mini Tile instant scenes */}
                          <button
                            type="button"
                            className="ghost-option-btn"
                            onClick={() =>
                              insertMiniTileSceneIntoGhost("coffee", "Hot Brew", "CAFFEINE · 92%")
                            }
                          >
                            + {lang === "zh" ? "热咖啡方砖 (1格)" : "Coffee Tile (1/4)"}
                          </button>
                          <button
                            type="button"
                            className="ghost-option-btn"
                            onClick={() =>
                              insertMiniTileSceneIntoGhost("weather", "Rainy Dev", "RAIN · 19°C")
                            }
                          >
                            + {lang === "zh" ? "天气窗方砖 (1格)" : "Weather Tile (1/4)"}
                          </button>
                          <button
                            type="button"
                            className="ghost-option-btn"
                            onClick={() =>
                              insertMiniTileSceneIntoGhost("hourglass", "Deep Focus", "45M SPRINT")
                            }
                          >
                            + {lang === "zh" ? "专注沙漏 (1格)" : "Hourglass (1/4)"}
                          </button>
                          <button
                            type="button"
                            className="ghost-option-btn"
                            onClick={() =>
                              insertMiniTileSceneIntoGhost("pulse", "Lo-Fi Synth", "BPM · 96")
                            }
                          >
                            + {lang === "zh" ? "跳动频谱 (1格)" : "Synth Pulse (1/4)"}
                          </button>

                          {/* Any multi-col widgets that fit <= remainingCols */}
                          {WIDGET_CATALOG.filter(
                            (item) =>
                              !item.isStrip &&
                              !item.isSticker &&
                              item.id !== "mini-tile" &&
                              item.supportedColSpans.some((s) => s <= ghostFillTarget.remainingCols)
                          ).map((item) => {
                            const fitSpan = item.supportedColSpans
                              .filter((s) => s <= ghostFillTarget.remainingCols)
                              .slice(-1)[0];
                            return (
                              <button
                                key={item.id}
                                type="button"
                                className="ghost-option-btn"
                                onClick={() =>
                                  insertIntoGhostSlot(
                                    createDefaultWidgetInstance(item.id, {
                                      colSpan: fitSpan,
                                      placement: ghostFillTarget.slot,
                                    })
                                  )
                                }
                              >
                                + {lang === "zh" ? item.nameZh : item.name} (
                                {lang === "zh" ? `${fitSpan}格` : `${fitSpan}/4`})
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 1-Click Full 4/4 Bento Presets */}
                    <div className="bento-presets-block">
                      <div className="bento-presets-head">
                        <span className="bento-presets-title">{t.bentoPresetsLabel}</span>
                        <label className="bento-target-label">
                          <span>{t.bentoPresetTarget}:</span>
                          <select
                            className="loadout-slot-select"
                            value={presetTargetSlot}
                            onChange={(e) => setPresetTargetSlot(e.target.value as RowSlot)}
                          >
                            {STANDARD_PLACEMENTS.map((s) => (
                              <option key={s} value={s}>
                                {placementLabel(s, lang)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="bento-presets-grid">
                        {BENTO_PRESETS.map((preset) => {
                          const isLivePreset = preset.id.startsWith("live-");
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              className={`bento-preset-card ${isLivePreset ? "is-live" : ""}`}
                              onClick={() => handleApplyBentoPreset(preset.id)}
                            >
                              <div className="bento-preset-top">
                                <strong>{lang === "zh" ? preset.nameZh : preset.name}</strong>
                                <span className="bento-preset-tags">
                                  {isLivePreset && (
                                    <span className="live-pill">{t.widgetLiveBadge}</span>
                                  )}
                                  <span className="bento-layout-tag">{preset.layoutTag}</span>
                                </span>
                              </div>
                              <span className="bento-preset-desc">
                                {lang === "zh" ? preset.descZh : preset.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Visual Row-by-Row Mounted Instances */}
                    {mountedWidgets.length === 0 ? (
                      <p className="loadout-empty">{t.loadoutEmptyHint}</p>
                    ) : (
                      <div className="bento-composer-slots">
                        {/* Hero Overlay Stickers if any */}
                        {widgetsBySlot["hero-overlay"].length > 0 && (
                          <div className="bento-row-card">
                            <div className="bento-row-head">
                              <span className="bento-row-title">
                                {placementLabel("hero-overlay", lang)} ·{" "}
                                {widgetsBySlot["hero-overlay"].length}{" "}
                                {lang === "zh" ? "枚贴纸" : "sticker(s)"}
                              </span>
                            </div>
                            <div className="loadout-chips">
                              {widgetsBySlot["hero-overlay"].map((w) => {
                                const meta = getWidgetMeta(w.widgetId);
                                const anchor = (w.config as HeroStickerConfig).anchor;
                                return (
                                  <div key={w.uid} className="loadout-chip">
                                    <span className="loadout-chip-code">{meta.code}</span>
                                    <span className="loadout-chip-name">
                                      {lang === "zh" ? meta.nameZh : meta.name} ({anchor})
                                    </span>
                                    <select
                                      className="loadout-slot-select"
                                      aria-label={t.widgetPlacementLabel}
                                      value={w.placement}
                                      onChange={(e) =>
                                        handleChangeInstanceSlot(
                                          w.uid,
                                          e.target.value as WidgetPlacement
                                        )
                                      }
                                    >
                                      {meta.supportedPlacements.map((s) => (
                                        <option key={s} value={s}>
                                          {placementLabel(s, lang)}
                                        </option>
                                      ))}
                                    </select>
                                    <div className="loadout-chip-actions">
                                      <button
                                        type="button"
                                        onClick={() => openInstanceInStudio(w)}
                                      >
                                        {t.loadoutEdit}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDuplicateInstance(w.uid)}
                                      >
                                        {t.bentoDuplicate}
                                      </button>
                                      <button
                                        type="button"
                                        className="danger"
                                        title={t.loadoutRemove}
                                        onClick={() => handleRemoveInstance(w.uid)}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 4-Col Bento Rows per Slot */}
                        {(["top", "under-hero", "under-cards", "bottom"] as RowSlot[]).map(
                          (slot) => {
                            const slotItems = widgetsBySlot[slot];
                            if (!slotItems.length) return null;
                            const rows = packBentoRows(slotItems);
                            return rows.map((row, rIdx) => (
                              <div
                                key={`composer-${slot}-r${rIdx}`}
                                className="bento-row-card"
                              >
                                <div className="bento-row-head">
                                  <span className="bento-row-title">
                                    {placementLabel(slot, lang)} · Row {rIdx + 1}
                                    {row.items.some((w) => isLiveWidgetId(w.widgetId)) && (
                                      <span className="live-pill" style={{ marginLeft: 6 }}>
                                        {t.widgetLiveBadge} · ACTIONS
                                      </span>
                                    )}
                                  </span>
                                  <div className="bento-row-head-right">
                                    <span
                                      className={`bento-fill-pill ${
                                        row.remainingCols === 0 ? "full" : "partial"
                                      }`}
                                    >
                                      {row.remainingCols === 0
                                        ? t.bentoFullRowBadge
                                        : `${row.usedCols}/4 ${lang === "zh" ? "格" : "cols"}`}
                                    </span>
                                    {row.remainingCols > 0 && (
                                      <button
                                        type="button"
                                        className="row-mini-btn fill"
                                        onClick={() => openGhostFill(slot, row)}
                                      >
                                        + {lang === "zh" ? `补${row.remainingCols}格` : `Fill ${row.remainingCols}`}
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      className="row-mini-btn"
                                      onClick={() => handleDownloadCompositeRow(slot, row, rIdx)}
                                    >
                                      {t.bentoDownloadRow}
                                    </button>
                                  </div>
                                </div>

                                <div className="loadout-chips">
                                  {row.items.map((w) => {
                                    const meta = getWidgetMeta(w.widgetId);
                                    const slotPos = slotItems.findIndex((x) => x.uid === w.uid);
                                    return (
                                      <div key={w.uid} className="loadout-chip">
                                        <span className="loadout-chip-code">{meta.code}</span>
                                        {meta.isLive && (
                                          <span className="live-pill">{t.widgetLiveBadge}</span>
                                        )}
                                        <span className="loadout-chip-name">
                                          {lang === "zh" ? meta.nameZh : meta.name}
                                        </span>

                                        {meta.supportedColSpans.length > 1 ? (
                                          <select
                                            className="loadout-slot-select"
                                            aria-label="Column span"
                                            value={w.colSpan}
                                            onChange={(e) =>
                                              handleChangeInstanceSpan(
                                                w.uid,
                                                Number(e.target.value) as BentoColSpan
                                              )
                                            }
                                          >
                                            {meta.supportedColSpans.map((sp) => (
                                              <option key={sp} value={sp}>
                                                {colSpanLabel(sp, lang)}
                                              </option>
                                            ))}
                                          </select>
                                        ) : (
                                          <span className="loadout-chip-size">
                                            {colSpanLabel(w.colSpan, lang, meta.isStrip, meta.isSticker)}
                                          </span>
                                        )}

                                        <select
                                          className="loadout-slot-select"
                                          aria-label={t.widgetPlacementLabel}
                                          value={w.placement}
                                          onChange={(e) =>
                                            handleChangeInstanceSlot(
                                              w.uid,
                                              e.target.value as WidgetPlacement
                                            )
                                          }
                                        >
                                          {meta.supportedPlacements.map((s) => (
                                            <option key={s} value={s}>
                                              {placementLabel(s, lang)}
                                            </option>
                                          ))}
                                        </select>

                                        <div className="loadout-chip-actions">
                                          <button
                                            type="button"
                                            disabled={slotPos === 0}
                                            title={t.loadoutMoveUp}
                                            onClick={() => handleMoveInstanceInSlot(w.uid, -1)}
                                          >
                                            ←
                                          </button>
                                          <button
                                            type="button"
                                            disabled={slotPos === slotItems.length - 1}
                                            title={t.loadoutMoveDown}
                                            onClick={() => handleMoveInstanceInSlot(w.uid, 1)}
                                          >
                                            →
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => openInstanceInStudio(w)}
                                          >
                                            {t.loadoutEdit}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDuplicateInstance(w.uid)}
                                          >
                                            {t.bentoDuplicate}
                                          </button>
                                          <button
                                            type="button"
                                            className="danger"
                                            title={t.loadoutRemove}
                                            onClick={() => handleRemoveInstance(w.uid)}
                                          >
                                            ×
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ));
                          }
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Zero-Config Agent Prompt, Parametric Builder & ZIP Export */}
                <aside className="inspector">
                  <div className="inspector-head">
                    <div className="inspector-badges">
                      <span className="cat-badge">
                        {lang === "zh" ? activeTheme.categoryZh : activeTheme.category}
                      </span>
                      <span className="svg-count">
                        {activeTheme.svgCount} {t.svgUnit}
                      </span>
                    </div>
                    <h2 className="inspector-title">
                      {lang === "zh" ? activeTheme.nameZh : activeTheme.name}
                    </h2>
                    <p className="inspector-desc">
                      {lang === "zh" ? activeTheme.taglineZh : activeTheme.tagline}
                    </p>
                  </div>

                  <div className="inspector-section">
                    <button
                      type="button"
                      className={`copy-cta ${copiedPrompt ? "copied" : ""}`}
                      onClick={handleCopyPrompt}
                    >
                      {copiedPrompt ? `✓ ${t.copied}` : `⌘ ${t.copyPrompt}`}
                    </button>
                    <button
                      type="button"
                      className={`secondary-full-btn ${exportedZipCount ? "zip-ok" : ""}`}
                      onClick={handleExportZip}
                    >
                      {exportedZipCount
                        ? `✓ ${t.exportZipDone} (${exportedZipCount} files)`
                        : `↓ ${t.exportZipBtn}`}
                    </button>
                    <p className="agents-caption">{t.agentsLabel}</p>

                    {(mountedWidgets.length > 0 || liveProfile || overridesActive) && (
                      <div className="loadout-merged-note">
                        <span
                          className="stage-dot"
                          style={{ backgroundColor: activeAccentDisplay }}
                        />
                        <span>
                          {mountedWidgets.length > 0
                            ? `+${mountedWidgets.length} ${t.loadoutMergedBadge}`
                            : t.paramMergedBadge}
                        </span>
                      </div>
                    )}

                    {mountedWidgets.some((w) => isLiveWidgetId(w.widgetId)) && (
                      <div className="loadout-merged-note live-note">
                        <span className="live-dot" />
                        <span>{t.liveZipIncluded}</span>
                      </div>
                    )}

                    <div className="prompt-tabs" role="tablist">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={promptKind === "quick"}
                        className={`prompt-tab ${promptKind === "quick" ? "active" : ""}`}
                        onClick={() => setPromptKind("quick")}
                      >
                        {t.quickMode}
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={promptKind === "full"}
                        className={`prompt-tab ${promptKind === "full" ? "active" : ""}`}
                        onClick={() => setPromptKind("full")}
                      >
                        {t.fullMode}
                      </button>
                    </div>

                    <p className="prompt-hint">
                      {promptKind === "quick" ? t.quickHint : t.fullHint}
                    </p>
                    <pre className="prompt-box">{currentPrompt}</pre>
                  </div>

                  {/* Parametric Prompt & Preview Tweaks */}
                  <div className="inspector-section">
                    <div className="widget-prompt-head">
                      <p className="section-micro-label" style={{ margin: 0 }}>
                        {t.paramHeading}
                      </p>
                      {overridesActive && (
                        <button
                          type="button"
                          className="reset-link"
                          onClick={() => setOverrides(DEFAULT_OVERRIDES)}
                        >
                          {t.paramReset}
                        </button>
                      )}
                    </div>

                    <div className="diy-form">
                      <div className="diy-field">
                        <label>{t.paramAccent}</label>
                        <div className="accent-picker-row">
                          {ACCENT_PRESETS.map((preset) => {
                            const active = overrides.accentOverride === preset.hex;
                            return (
                              <button
                                key={preset.label}
                                type="button"
                                title={lang === "zh" ? preset.labelZh : preset.label}
                                className={`accent-dot-btn ${active ? "active" : ""}`}
                                onClick={() =>
                                  setOverrides((prev) => ({
                                    ...prev,
                                    accentOverride: preset.hex,
                                  }))
                                }
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
                              value={overrides.accentOverride || activeTheme.accent}
                              onChange={(e) =>
                                setOverrides((prev) => ({
                                  ...prev,
                                  accentOverride: e.target.value,
                                }))
                              }
                            />
                            <span>HEX</span>
                          </label>
                        </div>
                      </div>

                      <div className="diy-field-row">
                        <div className="diy-field">
                          <label>{t.paramCards}</label>
                          <div className="seg-group cols-3">
                            {([2, 4, 6] as const).map((cnt) => (
                              <button
                                key={cnt}
                                type="button"
                                className={`seg-btn ${overrides.cardCount === cnt ? "active" : ""}`}
                                onClick={() =>
                                  setOverrides((prev) => ({ ...prev, cardCount: cnt }))
                                }
                              >
                                {cnt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="diy-field">
                          <label>{t.paramMotion}</label>
                          <div className="seg-group">
                            <button
                              type="button"
                              className={`seg-btn ${overrides.animated ? "active" : ""}`}
                              onClick={() =>
                                setOverrides((prev) => ({ ...prev, animated: true }))
                              }
                            >
                              {lang === "zh" ? "克制" : "Calm"}
                            </button>
                            <button
                              type="button"
                              className={`seg-btn ${!overrides.animated ? "active" : ""}`}
                              onClick={() =>
                                setOverrides((prev) => ({ ...prev, animated: false }))
                              }
                            >
                              {lang === "zh" ? "静态" : "Static"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="diy-field">
                        <label>{t.paramCopyLang}</label>
                        <div className="seg-group cols-4">
                          {(
                            [
                              { id: "auto", label: t.paramLangAuto },
                              { id: "en", label: t.paramLangEn },
                              { id: "zh", label: t.paramLangZh },
                              { id: "bilingual", label: t.paramLangBi },
                            ] as { id: CopyLangPref; label: string }[]
                          ).map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              className={`seg-btn ${overrides.copyLang === opt.id ? "active" : ""}`}
                              onClick={() =>
                                setOverrides((prev) => ({ ...prev, copyLang: opt.id }))
                              }
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="inspector-section">
                    <p className="section-micro-label">{t.paletteLabel}</p>
                    <div className="palette-row">
                      {activeTheme.palette[previewMode].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          className="swatch-chip"
                          onClick={() => handleCopyHex(hex)}
                        >
                          <span className="swatch-box" style={{ backgroundColor: hex }} />
                          <span>{copiedHex === hex ? t.copiedHex : hex}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="inspector-section">
                    <p className="section-micro-label">{t.bestFor}</p>
                    <div className="tag-row">
                      {(lang === "zh" ? activeTheme.bestForZh : activeTheme.bestFor).map((item) => (
                        <span key={item} className="tag-chip">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="inspector-section">
                    <p className="section-micro-label">{t.includedLabel}</p>
                    <ul className="feature-list">
                      {(lang === "zh" ? activeTheme.featuresZh : activeTheme.features).map((feat) => (
                        <li key={feat}>
                          <span
                            className="feature-dot"
                            style={{ backgroundColor: activeAccentDisplay }}
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="inspector-section">
                    <div className="source-links">
                      <a
                        className="source-btn"
                        href={activeTheme.links.spec}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t.openSpec} ↗
                      </a>
                      <a
                        className="source-btn"
                        href={activeTheme.links.generator}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t.openGen} ↗
                      </a>
                      <a
                        className="source-btn"
                        href={activeTheme.links.folder}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t.openRepo} ↗
                      </a>
                    </div>
                  </div>
                </aside>
              </section>
            )}

            {/* All Skins Contact Sheet */}
            <section className="section-block">
              <div className="section-head">
                <div>
                  <h2 className="section-title">{t.contactHeading}</h2>
                  <p className="section-sub">{t.contactSub}</p>
                </div>
                <div className="mode-switch" role="group" aria-label="Gallery preview theme">
                  <button
                    type="button"
                    className={`mode-btn ${previewMode === "light" ? "active" : ""}`}
                    onClick={() => setPreviewMode("light")}
                  >
                    {t.ghLight}
                  </button>
                  <button
                    type="button"
                    className={`mode-btn ${previewMode === "dark" ? "active" : ""}`}
                    onClick={() => setPreviewMode("dark")}
                  >
                    {t.ghDark}
                  </button>
                </div>
              </div>

              <div className="contact-grid">
                {themes.map((skin) => {
                  const isActive = skin.id === activeTheme?.id;
                  return (
                    <button
                      key={skin.id}
                      type="button"
                      className={`contact-card ${isActive ? "active" : ""}`}
                      onClick={() => selectTheme(skin.id, true)}
                    >
                      <div className={`contact-preview ${previewMode}`}>
                        <img
                          src={`/themes/${skin.id}/assets/hero-${previewMode}.svg`}
                          alt={`${skin.name} preview`}
                          loading="lazy"
                        />
                      </div>
                      <div className="contact-body">
                        <div>
                          <h3 className="contact-name">
                            0{skin.order} · {lang === "zh" ? skin.nameZh : skin.name}
                          </h3>
                          <p className="contact-tagline">
                            {lang === "zh" ? skin.taglineZh : skin.tagline}
                          </p>
                        </div>
                        <span className="contact-cta">
                          {isActive ? t.selectedBadge : `${t.previewSkin} →`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* How It Works */}
            <section className="section-block">
              <div className="section-head">
                <h2 className="section-title">{t.howHeading}</h2>
              </div>
              <div className="how-grid">
                {t.howItems.map((item) => (
                  <article key={item.num} className="how-card">
                    <div className="how-num">({item.num})</div>
                    <h3 className="how-title">{item.title}</h3>
                    <p className="how-body">{item.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        <footer className="footer">
          <span>{t.footerNote}</span>
          <div className="footer-links">
            <a
              href="https://github.com/Furina-he/gitskins/blob/main/ROADMAP.md"
              target="_blank"
              rel="noreferrer"
            >
              Roadmap ↗
            </a>
            <a
              href="https://github.com/Furina-he/gitskins/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noreferrer"
            >
              {t.submitSkin} ↗
            </a>
            <a
              href="https://github.com/Furina-he/gitskins"
              target="_blank"
              rel="noreferrer"
            >
              Furina-he/gitskins ↗
            </a>
            <a
              href="https://github.com/Furina-he"
              target="_blank"
              rel="noreferrer"
            >
              Live Demo (@Furina-he) ↗
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
