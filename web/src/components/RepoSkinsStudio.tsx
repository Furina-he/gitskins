import { useMemo, useState } from "react";
import { COPY } from "../i18n";
import { downloadZipArchive } from "../profile/zipExport";
import {
  DEFAULT_REPO_OPTIONS,
  buildRepoSkinPrompt,
  buildRepoZipEntries,
  renderRepoSkinSuite,
  type RepoSkinOptions,
} from "../repo/renderRepoSkin";
import {
  GitHubRepoError,
  createDefaultRepoData,
  fetchGitHubRepo,
  type FetchRepoErrorCode,
  type RepoSkinData,
} from "../repo/repoGithubApi";
import type { Lang, PreviewMode, SkinTheme } from "../types";
import { ACCENT_PRESETS, validateSvgXml } from "../widgets/catalog";
import { svgToDataUri } from "./WidgetsStudio";

interface RepoSkinsStudioProps {
  themes: SkinTheme[];
  activeTheme: SkinTheme;
  onSelectTheme: (id: string) => void;
  previewMode: PreviewMode;
  onChangePreviewMode: (mode: PreviewMode) => void;
  lang: Lang;
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

export default function RepoSkinsStudio({
  themes,
  activeTheme,
  onSelectTheme,
  previewMode,
  onChangePreviewMode,
  lang,
}: RepoSkinsStudioProps) {
  const t = COPY[lang];
  const [repo, setRepo] = useState<RepoSkinData>(() => createDefaultRepoData());
  const [options, setOptions] = useState<RepoSkinOptions>(DEFAULT_REPO_OPTIONS);
  const [slugInput, setSlugInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errCode, setErrCode] = useState<FetchRepoErrorCode | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  const [exportedCount, setExportedCount] = useState<number | null>(null);

  const effectiveRepo = useMemo(() => {
    if (!repo.isDemo) return repo;
    if (/^node cli\/gitskins\.mjs init --mode repo --theme [a-z0-9-]+$/.test(repo.installCommand.trim())) {
      return {
        ...repo,
        installCommand: `node cli/gitskins.mjs init --mode repo --theme ${activeTheme.id}`,
      };
    }
    return repo;
  }, [repo, activeTheme.id]);

  const suite = useMemo(
    () => renderRepoSkinSuite(effectiveRepo, activeTheme, previewMode, options),
    [effectiveRepo, activeTheme, previewMode, options]
  );

  const xmlOk = useMemo(
    () =>
      validateSvgXml(suite.hero) &&
      validateSvgXml(suite.install) &&
      validateSvgXml(suite.arch) &&
      validateSvgXml(suite.badge) &&
      suite.features.every((s) => validateSvgXml(s)),
    [suite]
  );

  const promptText = useMemo(
    () => buildRepoSkinPrompt(effectiveRepo, activeTheme, options, lang),
    [effectiveRepo, activeTheme, options, lang]
  );

  const cliCommand = useMemo(() => {
    const parts = [
      `node cli/gitskins.mjs init --mode repo --theme ${activeTheme.id}`,
      `--repo "${repo.owner}/${repo.name}"`,
    ];
    if (options.accentOverride) parts.push(`--accent "${options.accentOverride}"`);
    if (!options.animated) parts.push(`--static`);
    if (options.showBadge) parts.push(`--badge`);
    return parts.join(" ");
  }, [activeTheme.id, repo.owner, repo.name, options]);

  async function handleFetchRepo(e: React.FormEvent) {
    e.preventDefault();
    if (!slugInput.trim()) {
      setRepo(createDefaultRepoData());
      setErrCode(null);
      return;
    }
    setLoading(true);
    setErrCode(null);
    try {
      const next = await fetchGitHubRepo(slugInput);
      setRepo(next);
      setCopiedPrompt(false);
    } catch (err) {
      if (err instanceof GitHubRepoError) {
        setErrCode(err.code);
      } else {
        setErrCode("network");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleResetDemo() {
    setSlugInput("");
    setRepo(createDefaultRepoData());
    setOptions(DEFAULT_REPO_OPTIONS);
    setErrCode(null);
    setCopiedPrompt(false);
  }

  function handleExportZip() {
    const entries = buildRepoZipEntries({
      repo: effectiveRepo,
      theme: activeTheme,
      options,
      lang,
    });
    const safeName = repo.name.toLowerCase().replace(/[^a-z0-9-]/g, "") || "repo";
    downloadZipArchive(`gitskins-repo-${safeName}-${activeTheme.id}.zip`, entries);
    setExportedCount(entries.length);
    window.setTimeout(() => setExportedCount(null), 2600);
  }

  async function handleCopyPrompt() {
    await copyText(promptText);
    setCopiedPrompt(true);
    window.setTimeout(() => setCopiedPrompt(false), 2000);
  }

  async function handleCopyCli() {
    await copyText(cliCommand);
    setCopiedCli(true);
    window.setTimeout(() => setCopiedCli(false), 2000);
  }

  function updateFeature(index: number, field: "tag" | "title" | "desc", value: string) {
    setRepo((prev) => {
      const nextFeatures = prev.features.map((f, i) =>
        i === index ? { ...f, [field]: value } : f
      );
      return { ...prev, features: nextFeatures };
    });
  }

  const errMsg =
    errCode === "invalid"
      ? t.repoErrInvalid
      : errCode === "not-found"
        ? t.repoErrNotFound
        : errCode === "rate-limit"
          ? t.tryGhErrRateLimit
          : errCode === "network"
            ? t.tryGhErrNetwork
            : "";

  const activeAccent = options.accentOverride || activeTheme.accent;

  return (
    <>
      <section className="hero-band">
        <h1 className="hero-title">
          {t.repoHeroTitleA}
          <br />
          <span className="hero-title-muted">{t.repoHeroTitleB}</span>
        </h1>
        <div className="hero-meta">
          <p className="hero-lead">{t.repoHeroLead}</p>
        </div>
      </section>

      {/* 4-Skin Switcher */}
      <nav className="skin-rail" aria-label="Repo theme skins">
        {themes.map((skin) => {
          const isActive = skin.id === activeTheme.id;
          const swatches = skin.palette[previewMode].slice(0, 5);
          return (
            <button
              key={skin.id}
              type="button"
              className={`skin-tab ${isActive ? "active" : ""}`}
              onClick={() => onSelectTheme(skin.id)}
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

      <section className="workspace" aria-label="Repo skins studio">
        {/* Left: Authentic 846px GitHub Repository README Stage */}
        <div className="stage-card">
          <div className="stage-toolbar">
            <div className="stage-path">
              <span className="stage-dot" style={{ backgroundColor: activeAccent }} />
              <span>
                repo-skins/{activeTheme.id} · <strong>846px</strong> README
              </span>
            </div>

            <div className="stage-controls">
              <button
                type="button"
                className={`zip-toolbar-btn ${exportedCount ? "done" : ""}`}
                onClick={handleExportZip}
              >
                {exportedCount ? `✓ ${t.exportZipDone} (${exportedCount})` : "↓ ZIP"}
              </button>

              <div className="mode-switch" role="group" aria-label="Preview color scheme">
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
            </div>
          </div>

          {/* Try Any Public GitHub Repository */}
          <div className="try-github-bar">
            <form className="try-github-form" onSubmit={handleFetchRepo}>
              <div className="try-github-input-wrap">
                <span className="try-gh-at">repo</span>
                <input
                  type="text"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value)}
                  placeholder={t.repoTryPlaceholder}
                  aria-label="GitHub owner/repo"
                />
              </div>
              <button type="submit" className="try-gh-submit" disabled={loading}>
                {loading ? t.tryGhLoading : t.repoTryBtn}
              </button>
              {!repo.isDemo && (
                <button
                  type="button"
                  className="try-gh-reset"
                  onClick={handleResetDemo}
                >
                  {t.tryGhReset}
                </button>
              )}
            </form>
            {!repo.isDemo && (
              <div className="try-gh-status">
                <span className="live-dot" />
                <span>
                  {t.repoLivePrefix}: <strong>{repo.owner}/{repo.name}</strong> · ★ {repo.stars} ·{" "}
                  {repo.language} · {repo.license}
                </span>
              </div>
            )}
            {errMsg && (
              <p className="try-gh-error" role="alert">
                {errMsg}
              </p>
            )}
          </div>

          {/* 846px GitHub Repo README Simulation */}
          <div className={`gh-stage ${previewMode}`}>
            <div className="gh-readme-box">
              <div className="gh-readme-meta">
                <span>
                  {repo.owner} / {repo.name} · README.md
                </span>
                <span>
                  {previewMode === "dark"
                    ? "prefers-color-scheme: dark"
                    : "prefers-color-scheme: light"}
                </span>
              </div>

              <div className="gh-row">
                <img
                  className="gh-hero-img"
                  src={svgToDataUri(suite.hero)}
                  alt={`${repo.owner}/${repo.name} Hero`}
                />
              </div>

              <div className="gh-row">
                <img
                  className="gh-sec-img"
                  src={svgToDataUri(suite.install)}
                  alt={`Install ${repo.name}`}
                />
              </div>

              <div className="gh-row" style={{ marginTop: 14 }}>
                <img
                  className="gh-sec-img"
                  src={svgToDataUri(suite.secFeatures)}
                  alt="Key Capabilities"
                />
              </div>

              <div className="gh-row gh-cards-grid">
                {suite.features.map((svg, idx) => (
                  <img
                    key={`rf-${idx}`}
                    className="widget-svg-img"
                    src={svgToDataUri(svg)}
                    alt={repo.features[idx]?.title || `Feature ${idx + 1}`}
                  />
                ))}
              </div>

              {options.showArch && (
                <>
                  <div className="gh-row" style={{ marginTop: 14 }}>
                    <img
                      className="gh-sec-img"
                      src={svgToDataUri(suite.secArch)}
                      alt="System Architecture"
                    />
                  </div>
                  <div className="gh-row">
                    <img
                      className="gh-sec-img"
                      src={svgToDataUri(suite.arch)}
                      alt="Architecture Pipeline"
                    />
                  </div>
                </>
              )}

              {options.showBadge && (
                <div className="gh-badge-footer">
                  <a href="https://gitskins.blessc.com" target="_blank" rel="noreferrer">
                    <img
                      src={svgToDataUri(suite.badge)}
                      alt="Styled with GitSkins"
                      height={32}
                    />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Agent-Native CLI & SKILL.md Dock */}
          <div className="widget-export-bar">
            <div className="widget-export-head">
              <span className="section-micro-label" style={{ margin: 0 }}>
                {t.repoCliHeading}
              </span>
              <span className={`xml-badge ${xmlOk ? "ok" : "err"}`}>
                {xmlOk ? `✓ ${t.widgetXmlValid}` : "XML Error"}
              </span>
            </div>
            <div className="export-actions-row">
              <button
                type="button"
                className={`export-btn primary ${copiedCli ? "copied" : ""}`}
                onClick={handleCopyCli}
              >
                {copiedCli ? `✓ ${t.repoCliCopied}` : t.repoCliCopy}
              </button>
              <a
                className="export-btn"
                href="/skill/SKILL.md"
                target="_blank"
                rel="noreferrer"
              >
                {t.repoOpenSkill} ↗
              </a>
              <a
                className="export-btn"
                href="https://github.com/Furina-he/gitskins/tree/main/cli"
                target="_blank"
                rel="noreferrer"
              >
                {t.repoOpenCliSource} ↗
              </a>
            </div>
            <pre className="prompt-box compact">{cliCommand}</pre>
          </div>
        </div>

        {/* Right: Sticky Inspector & Repo Skin Controls */}
        <aside className="inspector">
          <div className="inspector-head">
            <div className="inspector-badges">
              <span className="cat-badge">REPO SKINS · R01–R05</span>
              <button type="button" className="reset-link" onClick={handleResetDemo}>
                {t.widgetReset}
              </button>
            </div>
            <h2 className="inspector-title">
              {lang === "zh" ? activeTheme.nameZh : activeTheme.name}
            </h2>
            <p className="inspector-desc">{t.repoInspectorSub}</p>
          </div>

          <div className="inspector-section">
            <button
              type="button"
              className={`copy-cta ${copiedPrompt ? "copied" : ""}`}
              onClick={handleCopyPrompt}
            >
              {copiedPrompt ? `✓ ${t.copied}` : `⌘ ${t.repoCopyPrompt}`}
            </button>
            <button
              type="button"
              className={`secondary-full-btn ${exportedCount ? "zip-ok" : ""}`}
              onClick={handleExportZip}
            >
              {exportedCount
                ? `✓ ${t.exportZipDone} (${exportedCount} files)`
                : `↓ ${t.repoExportZipBtn}`}
            </button>
            <p className="agents-caption">{t.agentsLabel}</p>
            <pre className="prompt-box compact" style={{ marginTop: 10 }}>
              {promptText}
            </pre>
          </div>

          {/* Style & Layout Switches */}
          <div className="inspector-section">
            <p className="section-micro-label">{t.paramHeading}</p>

            <p className="section-micro-label" style={{ marginTop: 8 }}>
              {t.paramAccent}
            </p>
            <div className="accent-picker-row">
              {ACCENT_PRESETS.map((preset) => {
                const active = options.accentOverride === preset.hex;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    title={lang === "zh" ? preset.labelZh : preset.label}
                    className={`accent-dot-btn ${active ? "active" : ""}`}
                    onClick={() =>
                      setOptions((prev) => ({ ...prev, accentOverride: preset.hex }))
                    }
                  >
                    <span
                      className="accent-dot-fill"
                      style={{ backgroundColor: preset.hex || activeTheme.accent }}
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
                  value={options.accentOverride || activeTheme.accent}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, accentOverride: e.target.value }))
                  }
                />
                <span>HEX</span>
              </label>
            </div>

            <div className="diy-field-row" style={{ marginTop: 12 }}>
              <div className="diy-field">
                <label>{t.repoFeatureCount}</label>
                <div className="seg-group">
                  {([2, 4] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`seg-btn ${options.featureCount === n ? "active" : ""}`}
                      onClick={() => setOptions((prev) => ({ ...prev, featureCount: n }))}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="diy-field">
                <label>{t.paramMotion}</label>
                <div className="seg-group">
                  <button
                    type="button"
                    className={`seg-btn ${options.animated ? "active" : ""}`}
                    onClick={() => setOptions((prev) => ({ ...prev, animated: true }))}
                  >
                    {lang === "zh" ? "克制" : "Calm"}
                  </button>
                  <button
                    type="button"
                    className={`seg-btn ${!options.animated ? "active" : ""}`}
                    onClick={() => setOptions((prev) => ({ ...prev, animated: false }))}
                  >
                    {lang === "zh" ? "静态" : "Static"}
                  </button>
                </div>
              </div>
            </div>

            <div className="diy-field-row" style={{ marginTop: 10 }}>
              <div className="diy-field">
                <label>{t.repoArchToggle}</label>
                <div className="seg-group">
                  <button
                    type="button"
                    className={`seg-btn ${options.showArch ? "active" : ""}`}
                    onClick={() => setOptions((prev) => ({ ...prev, showArch: true }))}
                  >
                    {lang === "zh" ? "开启" : "On"}
                  </button>
                  <button
                    type="button"
                    className={`seg-btn ${!options.showArch ? "active" : ""}`}
                    onClick={() => setOptions((prev) => ({ ...prev, showArch: false }))}
                  >
                    {lang === "zh" ? "隐藏" : "Off"}
                  </button>
                </div>
              </div>
              <div className="diy-field">
                <label>{t.gitskinsBadgeLabel}</label>
                <div className="seg-group">
                  <button
                    type="button"
                    className={`seg-btn ${options.showBadge ? "active" : ""}`}
                    onClick={() => setOptions((prev) => ({ ...prev, showBadge: true }))}
                  >
                    {lang === "zh" ? "显示" : "Show"}
                  </button>
                  <button
                    type="button"
                    className={`seg-btn ${!options.showBadge ? "active" : ""}`}
                    onClick={() => setOptions((prev) => ({ ...prev, showBadge: false }))}
                  >
                    {lang === "zh" ? "隐藏" : "Hide"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Repository Content Customizer */}
          <div className="inspector-section">
            <p className="section-micro-label">{t.repoFieldsHeading}</p>
            <div className="diy-form">
              <div className="diy-field-row">
                <div className="diy-field">
                  <label>{t.repoFieldName}</label>
                  <input
                    type="text"
                    maxLength={40}
                    value={repo.name}
                    onChange={(e) => setRepo((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="diy-field">
                  <label>{t.repoFieldVersion}</label>
                  <input
                    type="text"
                    maxLength={18}
                    value={repo.version}
                    onChange={(e) => setRepo((p) => ({ ...p, version: e.target.value }))}
                  />
                </div>
              </div>

              <div className="diy-field">
                <label>{t.repoFieldTagline}</label>
                <textarea
                  rows={2}
                  maxLength={140}
                  value={repo.tagline}
                  onChange={(e) => setRepo((p) => ({ ...p, tagline: e.target.value }))}
                />
              </div>

              <div className="diy-field">
                <label>{t.repoFieldInstall}</label>
                <input
                  type="text"
                  maxLength={96}
                  value={effectiveRepo.installCommand}
                  onChange={(e) => setRepo((p) => ({ ...p, installCommand: e.target.value }))}
                />
              </div>

              {options.showArch && (
                <div className="diy-field">
                  <label>{t.repoFieldArch}</label>
                  <textarea
                    rows={2}
                    maxLength={220}
                    value={repo.architecture}
                    onChange={(e) => setRepo((p) => ({ ...p, architecture: e.target.value }))}
                  />
                </div>
              )}

              <div className="diy-field">
                <label>{t.repoFieldFeatures}</label>
                <div className="repo-feat-editor-list">
                  {repo.features.slice(0, options.featureCount).map((f, idx) => (
                    <div key={`fe-${idx}`} className="repo-feat-editor-row">
                      <input
                        type="text"
                        maxLength={12}
                        className="repo-feat-tag-input"
                        value={f.tag}
                        aria-label={`Feature ${idx + 1} tag`}
                        onChange={(e) => updateFeature(idx, "tag", e.target.value)}
                      />
                      <input
                        type="text"
                        maxLength={38}
                        value={f.title}
                        aria-label={`Feature ${idx + 1} title`}
                        onChange={(e) => updateFeature(idx, "title", e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
