import { useEffect, useMemo, useRef, useState } from "react";
import { COPY } from "../i18n";
import type { Lang, PreviewMode, SkinTheme } from "../types";

export type SkinGroupKey = "all" | "editorial" | "engineering" | "retro" | "craft";

export interface ThemePickerProps {
  themes: SkinTheme[];
  activeTheme: SkinTheme | null;
  previewMode: PreviewMode;
  lang: Lang;
  variant?: "rail" | "compact";
  onSelectTheme: (id: string) => void;
  onChangePreviewMode?: (mode: PreviewMode) => void;
  ariaLabel?: string;
}

export function formatSkinIndex(order: number): string {
  return String(order).padStart(2, "0");
}

function classifySkin(skin: SkinTheme): Exclude<SkinGroupKey, "all"> {
  const hay = `${skin.id} ${skin.category} ${skin.name}`.toLowerCase();
  if (
    hay.includes("blueprint") ||
    hay.includes("cad") ||
    hay.includes("pcb") ||
    hay.includes("synth") ||
    hay.includes("hardware") ||
    hay.includes("terminal") ||
    hay.includes("crt")
  ) {
    return "engineering";
  }
  if (
    hay.includes("pixel-rpg") ||
    hay.includes("rpg") ||
    hay.includes("classic") ||
    hay.includes("retro") ||
    hay.includes("os") ||
    hay.includes("game")
  ) {
    return "retro";
  }
  if (
    hay.includes("seal") ||
    hay.includes("ink") ||
    hay.includes("riso") ||
    hay.includes("east asian") ||
    hay.includes("monograph")
  ) {
    return "craft";
  }
  return "editorial";
}

function shortSkinLabel(skin: SkinTheme, lang: Lang): string {
  if (lang === "zh") {
    if (skin.id === "swiss-bauhaus-pixel") return "瑞士包豪斯";
    if (skin.id === "blueprint-cad") return "工程蓝图";
    if (skin.id === "editorial-zine") return "报刊杂志";
    if (skin.id === "crt-terminal") return "复古终端";
    if (skin.id === "pixel-rpg-hud") return "像素 RPG";
    if (skin.id === "seal-ink-scroll") return "东方水墨";
    if (skin.id === "synth-hardware") return "工业合成器";
    if (skin.id === "pcb-solder-mask") return "沉金 PCB";
    if (skin.id === "transit-boarding") return "登机牌票据";
    if (skin.id === "classic-desktop-os") return "经典桌面";
    if (skin.id === "riso-duotone") return "孔版叠印";
    return skin.nameZh.length > 6 ? skin.nameZh.slice(0, 6) : skin.nameZh;
  }
  if (skin.id === "swiss-bauhaus-pixel") return "Bauhaus";
  if (skin.id === "blueprint-cad") return "Blueprint";
  if (skin.id === "editorial-zine") return "Broadsheet";
  if (skin.id === "crt-terminal") return "CRT TUI";
  if (skin.id === "pixel-rpg-hud") return "Pixel RPG";
  if (skin.id === "seal-ink-scroll") return "Seal Ink";
  if (skin.id === "synth-hardware") return "Synth OP";
  if (skin.id === "pcb-solder-mask") return "PCB Gold";
  if (skin.id === "transit-boarding") return "Boarding";
  if (skin.id === "classic-desktop-os") return "Classic OS";
  if (skin.id === "riso-duotone") return "Riso Print";
  return skin.name.split(" ").slice(0, 2).join(" ");
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 3.5L5.5 8L10 12.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
    </svg>
  );
}

function GridDrawerIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="2" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="9" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
    </svg>
  );
}

function SwatchPair({ skin, mode }: { skin: SkinTheme; mode: PreviewMode }) {
  const tok = skin.tokens[mode];
  return (
    <span className="tp-swatch-duo" aria-hidden="true">
      <span className="tp-swatch-cell" style={{ backgroundColor: tok.bg }} />
      <span className="tp-swatch-cell" style={{ backgroundColor: tok.accent }} />
      <span className="tp-swatch-cell" style={{ backgroundColor: tok.secondary }} />
    </span>
  );
}

export default function ThemePicker({
  themes,
  activeTheme,
  previewMode,
  lang,
  variant = "rail",
  onSelectTheme,
  onChangePreviewMode,
  ariaLabel = "Theme skins",
}: ThemePickerProps) {
  const t = COPY[lang];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [group, setGroup] = useState<SkinGroupKey>("all");
  const [query, setQuery] = useState("");
  const stripRef = useRef<HTMLDivElement | null>(null);
  const activePillRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const activeIdx = useMemo(
    () => (activeTheme ? themes.findIndex((s) => s.id === activeTheme.id) : 0),
    [themes, activeTheme]
  );

  // Auto-scroll active pill gently into view on the horizontal rail
  useEffect(() => {
    if (variant !== "rail" || !activePillRef.current) return;
    activePillRef.current.scrollIntoView({
      behavior: "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [activeTheme?.id, variant]);

  // Global keyboard shortcuts: Escape closes drawer; 'k' toggles skin drawer when not typing
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawerOpen) {
        setDrawerOpen(false);
        return;
      }
      if (
        variant === "rail" &&
        (e.key === "k" || e.key === "K") &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        )
      ) {
        e.preventDefault();
        setDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, variant]);

  useEffect(() => {
    if (drawerOpen) {
      window.setTimeout(() => searchRef.current?.focus(), 40);
    } else {
      setQuery("");
      setGroup("all");
    }
  }, [drawerOpen]);

  const groupCounts = useMemo(() => {
    const counts: Record<SkinGroupKey, number> = {
      all: themes.length,
      editorial: 0,
      engineering: 0,
      retro: 0,
      craft: 0,
    };
    for (const skin of themes) {
      counts[classifySkin(skin)]++;
    }
    return counts;
  }, [themes]);

  const filteredThemes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return themes.filter((skin) => {
      if (group !== "all" && classifySkin(skin) !== group) return false;
      if (!q) return true;
      const hay = `${formatSkinIndex(skin.order)} ${skin.id} ${skin.name} ${skin.nameZh} ${skin.category} ${skin.categoryZh} ${skin.tagline} ${skin.taglineZh}`.toLowerCase();
      return hay.includes(q);
    });
  }, [themes, group, query]);

  function stepTheme(delta: -1 | 1) {
    if (!themes.length) return;
    const base = activeIdx >= 0 ? activeIdx : 0;
    const next = themes[(base + delta + themes.length) % themes.length];
    onSelectTheme(next.id);
  }

  function handleStripWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (!stripRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const el = stripRef.current;
      if (el.scrollWidth > el.clientWidth + 2) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    }
  }

  const groups: { key: SkinGroupKey; label: string }[] = [
    { key: "all", label: t.pickerGroupAll },
    { key: "editorial", label: t.pickerGroupGrid },
    { key: "engineering", label: t.pickerGroupTech },
    { key: "retro", label: t.pickerGroupRetro },
    { key: "craft", label: t.pickerGroupArt },
  ];

  return (
    <>
      {variant === "compact" ? (
        <div className="tp-compact-stepper" role="group" aria-label={ariaLabel}>
          <button
            type="button"
            className="tp-step-btn"
            onClick={() => stepTheme(-1)}
            aria-label={t.pickerPrev}
            title={t.pickerPrev}
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            className="tp-compact-current"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-haspopup="dialog"
          >
            {activeTheme && <SwatchPair skin={activeTheme} mode={previewMode} />}
            <span className="tp-pill-index">
              {activeTheme ? formatSkinIndex(activeTheme.order) : "01"}
            </span>
            <span className="tp-compact-name">
              {activeTheme ? shortSkinLabel(activeTheme, lang) : "..."}
            </span>
            <span className="tp-compact-caret" aria-hidden="true">
              <GridDrawerIcon />
            </span>
          </button>
          <button
            type="button"
            className="tp-step-btn"
            onClick={() => stepTheme(1)}
            aria-label={t.pickerNext}
            title={t.pickerNext}
          >
            <ChevronRightIcon />
          </button>
        </div>
      ) : (
        <nav className="tp-rail-bar" aria-label={ariaLabel}>
          <button
            type="button"
            className="tp-rail-arrow"
            onClick={() => stepTheme(-1)}
            aria-label={t.pickerPrev}
            title={`${t.pickerPrev} (←)`}
          >
            <ChevronLeftIcon />
          </button>

          <div className="tp-strip-wrap">
            <div className="tp-strip" ref={stripRef} onWheel={handleStripWheel}>
              {themes.map((skin) => {
                const isActive = skin.id === activeTheme?.id;
                return (
                  <button
                    key={skin.id}
                    ref={isActive ? activePillRef : null}
                    type="button"
                    className={`tp-pill ${isActive ? "active" : ""}`}
                    onClick={() => onSelectTheme(skin.id)}
                    aria-pressed={isActive}
                    title={`${formatSkinIndex(skin.order)} · ${lang === "zh" ? skin.nameZh : skin.name} — ${lang === "zh" ? skin.categoryZh : skin.category}`}
                  >
                    <SwatchPair skin={skin} mode={previewMode} />
                    <span className="tp-pill-index">{formatSkinIndex(skin.order)}</span>
                    <span className="tp-pill-name">{shortSkinLabel(skin, lang)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="tp-rail-arrow"
            onClick={() => stepTheme(1)}
            aria-label={t.pickerNext}
            title={`${t.pickerNext} (→)`}
          >
            <ChevronRightIcon />
          </button>

          <button
            type="button"
            className={`tp-drawer-trigger ${drawerOpen ? "open" : ""}`}
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-haspopup="dialog"
          >
            <GridDrawerIcon />
            <span>
              {t.pickerAllSkins} ({themes.length})
            </span>
            <kbd className="tp-kbd">K</kbd>
          </button>
        </nav>
      )}

      {drawerOpen && (
        <div
          className="tp-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={t.pickerAllSkins}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawerOpen(false);
          }}
        >
          <div className="tp-modal-panel">
            <div className="tp-modal-head">
              <div className="tp-modal-title-group">
                <h2 className="tp-modal-title">
                  {t.pickerAllSkins}
                  <span className="tp-modal-count">{themes.length}</span>
                </h2>
                <span className="tp-modal-hint">{t.pickerShortcutHint}</span>
              </div>

              <div className="tp-modal-head-right">
                {onChangePreviewMode && (
                  <div className="mode-switch" role="group" aria-label="Gallery preview mode">
                    <button
                      type="button"
                      className={`mode-btn ${previewMode === "light" ? "active" : ""}`}
                      onClick={() => onChangePreviewMode("light")}
                    >
                      {t.ghLight}
                    </button>
                    <button
                      type="button"
                      className={`mode-btn ${previewMode === "dark" ? "active" : ""}`}
                      onClick={() => onChangePreviewMode("dark")}
                    >
                      {t.ghDark}
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  className="tp-modal-close"
                  onClick={() => setDrawerOpen(false)}
                  aria-label={t.bentoClose}
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div className="tp-modal-controls">
              <div className="tp-filter-pills" role="tablist" aria-label="Skin aesthetic filter">
                {groups
                  .filter((g) => g.key === "all" || groupCounts[g.key] > 0)
                  .map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      role="tab"
                      aria-selected={group === g.key}
                      className={`tp-filter-pill ${group === g.key ? "active" : ""}`}
                      onClick={() => setGroup(g.key)}
                    >
                      <span>{g.label}</span>
                      <span className="tp-filter-num">{groupCounts[g.key]}</span>
                    </button>
                  ))}
              </div>

              <input
                ref={searchRef}
                type="search"
                className="tp-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.pickerSearchPlaceholder}
                aria-label={t.pickerSearchPlaceholder}
              />
            </div>

            <div className="tp-modal-grid">
              {filteredThemes.length === 0 ? (
                <div className="tp-empty-state">{t.pickerNoMatch}</div>
              ) : (
                filteredThemes.map((skin) => {
                  const isActive = skin.id === activeTheme?.id;
                  const swatches = skin.palette[previewMode].slice(0, 5);
                  return (
                    <button
                      key={skin.id}
                      type="button"
                      className={`tp-card ${isActive ? "active" : ""}`}
                      onClick={() => {
                        onSelectTheme(skin.id);
                        setDrawerOpen(false);
                      }}
                    >
                      <div className={`tp-card-thumb ${previewMode}`}>
                        <img
                          src={`/themes/${skin.id}/assets/hero-${previewMode}.svg`}
                          alt={`${skin.name} thumbnail`}
                          loading="lazy"
                        />
                        {isActive && <span className="tp-card-active-badge">{t.selectedBadge}</span>}
                      </div>
                      <div className="tp-card-body">
                        <div className="tp-card-meta">
                          <span className="tp-card-idx">{formatSkinIndex(skin.order)}</span>
                          <span className="tp-card-cat">
                            {lang === "zh" ? skin.categoryZh : skin.category}
                          </span>
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
                        <div className="tp-card-name">
                          {lang === "zh" ? skin.nameZh : skin.name}
                        </div>
                        <div className="tp-card-tagline">
                          {lang === "zh" ? skin.taglineZh : skin.tagline}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
