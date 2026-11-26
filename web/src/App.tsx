import { useEffect, useMemo, useRef, useState } from "react";
import { COPY } from "./i18n";
import type { Lang, PreviewMode, PromptKind, SkinTheme } from "./types";

function detectInitialLang(): Lang {
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("zh")) {
    return "zh";
  }
  return "en";
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
  const [previewMode, setPreviewMode] = useState<PreviewMode>("dark");
  const [lang, setLang] = useState<Lang>(detectInitialLang);
  const [promptKind, setPromptKind] = useState<PromptKind>("quick");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/themes/manifest.json")
      .then((res) => res.json())
      .then((data: SkinTheme[]) => {
        setThemes(data);
        const hash = window.location.hash.replace("#", "").trim();
        if (hash && data.some((t) => t.id === hash)) {
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!themes.length) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
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
  }, [themes, activeId]);

  const t = COPY[lang];

  function selectTheme(id: string, scrollToStage: boolean) {
    setActiveId(id);
    setCopiedPrompt(false);
    window.history.replaceState(null, "", `#${id}`);
    if (scrollToStage && stageRef.current) {
      stageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const currentPrompt = activeTheme
    ? activeTheme.prompts[promptKind][lang]
    : "";

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

  const assetBase = activeTheme ? `/themes/${activeTheme.id}/assets` : "";

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#top">
            <BrandMark />
            <div className="brand-text">
              <span className="brand-name">GitSkins</span>
              <span className="brand-sub">{t.subtitle}</span>
            </div>
          </a>

          <div className="topbar-actions">
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
                    style={{ backgroundColor: activeTheme.accent }}
                  />
                  <span>
                    themes/{activeTheme.id} · <strong>846px</strong> GitHub frame
                  </span>
                </div>

                <div className="stage-controls">
                  <div className="mode-switch" role="group" aria-label="Preview color scheme">
                    <button
                      type="button"
                      className={`mode-btn ${previewMode === "light" ? "active" : ""}`}
                      onClick={() => setPreviewMode("light")}
                    >
                      ☀ {t.ghLight}
                    </button>
                    <button
                      type="button"
                      className={`mode-btn ${previewMode === "dark" ? "active" : ""}`}
                      onClick={() => setPreviewMode("dark")}
                    >
                      ☾ {t.ghDark}
                    </button>
                  </div>
                </div>
              </div>

              <div className={`gh-stage ${previewMode}`}>
                <div className="gh-readme-box">
                  <div className="gh-readme-meta">
                    <span>Furina-he / README.md</span>
                    <span>
                      {previewMode === "dark" ? "prefers-color-scheme: dark" : "prefers-color-scheme: light"}
                    </span>
                  </div>

                  <div className="gh-row">
                    <img
                      className="gh-hero-img"
                      src={`${assetBase}/hero-${previewMode}.svg`}
                      alt={`${activeTheme.name} Hero`}
                    />
                  </div>

                  <div className={`gh-row gh-buttons ${activeTheme.id === "blueprint-cad" ? "tall" : ""}`}>
                    {activeTheme.buttons.map((btn) => (
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

                  <div className="gh-row">
                    <img
                      className="gh-sec-img"
                      src={`${assetBase}/sec-work-${previewMode}.svg`}
                      alt="Selected projects section"
                    />
                  </div>

                  <div className="gh-row gh-cards-grid">
                    {activeTheme.cards.map((card) => (
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

                  <div className="gh-row" style={{ marginTop: 14 }}>
                    <img
                      className="gh-sec-img"
                      src={`${assetBase}/sec-activity-${previewMode}.svg`}
                      alt="Activity section"
                    />
                  </div>

                  <div className="gh-snake-strip">{t.snakeNote}</div>
                </div>
              </div>
            </div>

            {/* Right: Zero-Config Agent Prompt & Skin Anatomy */}
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
                <p className="agents-caption">{t.agentsLabel}</p>

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
                        style={{ backgroundColor: activeTheme.accent }}
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
                ☀ {t.ghLight}
              </button>
              <button
                type="button"
                className={`mode-btn ${previewMode === "dark" ? "active" : ""}`}
                onClick={() => setPreviewMode("dark")}
              >
                ☾ {t.ghDark}
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

        <footer className="footer">
          <span>{t.footerNote}</span>
          <div className="footer-links">
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
