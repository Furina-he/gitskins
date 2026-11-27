import type { Lang } from "./types";

export const COPY: Record<
  Lang,
  {
    subtitle: string;
    navSkins: string;
    navRepo: string;
    navWidgets: string;
    heroTitleA: string;
    heroTitleB: string;
    heroLead: string;
    step1: string;
    step2: string;
    step3: string;
    ghLight: string;
    ghDark: string;
    ghBoth: string;
    copyPrompt: string;
    copied: string;
    quickMode: string;
    fullMode: string;
    quickHint: string;
    fullHint: string;
    bestFor: string;
    paletteLabel: string;
    copiedHex: string;
    includedLabel: string;
    openSpec: string;
    openGen: string;
    openRepo: string;
    contactHeading: string;
    contactSub: string;
    selectedBadge: string;
    previewSkin: string;
    howHeading: string;
    howItems: { num: string; title: string; body: string }[];
    footerNote: string;
    submitSkin: string;
    svgUnit: string;
    snakeNote: string;
    agentsLabel: string;
    // Loadout & DIY Widgets Studio
    loadoutTitle: string;
    loadoutEmptyHint: string;
    loadoutOpenStudio: string;
    loadoutMergedBadge: string;
    loadoutEdit: string;
    loadoutRemove: string;
    loadoutMoveUp: string;
    loadoutMoveDown: string;
    widgetsHeroTitleA: string;
    widgetsHeroTitleB: string;
    widgetsHeroLead: string;
    widgetMountedBadge: string;
    widgetMountBtn: string;
    widgetMountedBtn: string;
    widgetViewProfile: string;
    widgetSkinLabel: string;
    widgetPlacementLabel: string;
    widgetWidthLabel: string;
    widgetWidthHalf: string;
    widgetWidthFull: string;
    widgetAccentLabel: string;
    widgetMotionLabel: string;
    widgetMotionOn: string;
    widgetMotionOff: string;
    widgetReset: string;
    widgetXmlValid: string;
    widgetExportHeading: string;
    widgetDownloadBoth: string;
    widgetDownloadMergedHero: string;
    widgetDownloadLight: string;
    widgetDownloadDark: string;
    widgetCopyMd: string;
    widgetCopiedMd: string;
    widgetMdStandard: string;
    widgetMdFloatRight: string;
    widgetStickerOnHero: string;
    widgetStickerStandalone: string;
    widgetPromptHeading: string;
    widgetCopyPrompt: string;
    widgetParamsHeading: string;
    // Widget field labels
    fieldPet: string;
    fieldPetName: string;
    fieldMood: string;
    fieldMessage: string;
    fieldFooterTag: string;
    fieldMedia: string;
    fieldTrack: string;
    fieldArtist: string;
    fieldNote: string;
    fieldProgress: string;
    fieldHandle: string;
    fieldRole: string;
    fieldFocus: string;
    fieldLocation: string;
    fieldStatus: string;
    fieldMeterLabel: string;
    fieldMeterValue: string;
    fieldStackTitle: string;
    fieldStackSubtitle: string;
    fieldSkills: string;
    fieldQuote: string;
    fieldAuthor: string;
    fieldTag: string;
    // New W06 / W07 / W08 fields
    fieldMotif: string;
    fieldStickerLabel: string;
    fieldStickerSub: string;
    fieldAnchor: string;
    fieldRunwayMode: string;
    fieldRunner: string;
    fieldRunwayTag: string;
    fieldRunwayText: string;
    fieldRunwaySpeed: string;
    fieldTileScene: string;
    fieldWeather: string;
    fieldTileTitle: string;
    fieldTileSub: string;
    // v0.3 Live GitHub Preview, Parametric Overrides & ZIP Export
    tryGhPlaceholder: string;
    tryGhBtn: string;
    tryGhLoading: string;
    tryGhReset: string;
    tryGhLivePrefix: string;
    tryGhErrInvalid: string;
    tryGhErrNotFound: string;
    tryGhErrRateLimit: string;
    tryGhErrNetwork: string;
    exportZipBtn: string;
    exportZipDone: string;
    paramHeading: string;
    paramReset: string;
    paramAccent: string;
    paramCards: string;
    paramMotion: string;
    paramCopyLang: string;
    paramLangAuto: string;
    paramLangEn: string;
    paramLangZh: string;
    paramLangBi: string;
    paramMergedBadge: string;
    // 4-col Bento Grid Composer
    bentoPresetsLabel: string;
    bentoPresetTarget: string;
    bentoFillColsPrefix: string;
    bentoFillColsSuffix: string;
    bentoFullRowBadge: string;
    bentoStretchFill: string;
    bentoDownloadRow: string;
    bentoDuplicate: string;
    bentoClearAll: string;
    bentoAddInstanceBtn: string;
    bentoEditingBanner: string;
    bentoNewModeBtn: string;
    bentoColSpanLabel: string;
    bentoQuickFillTitle: string;
    bentoClose: string;
    // v0.4 Live Auto-Updating Widgets (GitHub Actions)
    widgetFilterAll: string;
    widgetFilterStatic: string;
    widgetFilterLive: string;
    widgetLiveBadge: string;
    widgetLiveWorkflowHeading: string;
    widgetLiveWorkflowHint: string;
    widgetCopyYaml: string;
    widgetCopiedYaml: string;
    widgetDownloadYaml: string;
    widgetDownloadPy: string;
    liveZipIncluded: string;
    fieldGhUsername: string;
    fieldGhStars: string;
    fieldGhRepos: string;
    fieldGhFollowers: string;
    fieldGhPrs: string;
    fieldGhLanguages: string;
    fieldLivePreviewNote: string;
    fieldTzOffset: string;
    fieldPersona: string;
    fieldCronSchedule: string;
    fieldRssUrl: string;
    fieldRssSource: string;
    fieldRssPost1: string;
    fieldRssPost2: string;
    fieldRssPost3: string;
    fieldCity: string;
    fieldTempUnit: string;
    fieldWeatherCond: string;
    fieldTempPreview: string;
    fieldHumidity: string;
    // v0.5 Repo Skins, Badge & Agent Skill / CLI
    repoHeroTitleA: string;
    repoHeroTitleB: string;
    repoHeroLead: string;
    repoTryPlaceholder: string;
    repoTryBtn: string;
    repoLivePrefix: string;
    repoErrInvalid: string;
    repoErrNotFound: string;
    repoInspectorSub: string;
    repoCopyPrompt: string;
    repoExportZipBtn: string;
    repoCliHeading: string;
    repoCliCopy: string;
    repoCliCopied: string;
    repoOpenSkill: string;
    repoOpenCliSource: string;
    repoFeatureCount: string;
    repoArchToggle: string;
    gitskinsBadgeLabel: string;
    repoFieldsHeading: string;
    repoFieldName: string;
    repoFieldVersion: string;
    repoFieldTagline: string;
    repoFieldInstall: string;
    repoFieldArch: string;
    repoFieldFeatures: string;
    // v0.6 WakaTime & Spotify Live Fields
    fieldWakaTotal: string;
    fieldWakaAvg: string;
    fieldWakaEditor: string;
    fieldWakaSecretNote: string;
    fieldSpotifyAlbum: string;
    fieldSpotifyDuration: string;
    fieldSpotifySecretNote: string;
    // v0.7 Scalable ThemePicker, Compact Widget Catalog & L07 Contribution Snake
    pickerAllSkins: string;
    pickerSearchPlaceholder: string;
    pickerGroupAll: string;
    pickerGroupGrid: string;
    pickerGroupTech: string;
    pickerGroupRetro: string;
    pickerGroupArt: string;
    pickerPrev: string;
    pickerNext: string;
    pickerShortcutHint: string;
    pickerNoMatch: string;
    widgetCatalogExpand: string;
    widgetCatalogCompact: string;
    fieldSnakeEngine: string;
    fieldSnakeEnginePlatane: string;
    fieldSnakeEngineNative: string;
    fieldSnakeSpeed: string;
    fieldSnakeNotePlatane: string;
    fieldSnakeNoteNative: string;
    widgetSnakeWorkflowHeading: string;
    widgetSnakeWorkflowHint: string;
    snakeStageCta: string;
    // v0.8 High-Recognition Widgets (W09-W12, L08-L10)
    fieldKeycapTitle: string;
    fieldKeycapKeys: string;
    fieldKeycapAccent: string;
    fieldKeycapHardware: string;
    fieldFlapHeader: string;
    fieldFlapLine1: string;
    fieldFlapLine2: string;
    fieldFlapCode: string;
    fieldRadarTitle: string;
    fieldRadarSub: string;
    fieldRadarAxes: string;
    fieldQrUrl: string;
    fieldQrTitle: string;
    fieldQrSub: string;
    fieldQrBadge: string;
    fieldSkylineWeeks: string;
    fieldSkylineCommits: string;
    fieldStreakCurrent: string;
    fieldStreakLongest: string;
    fieldActivityEvent1: string;
    fieldActivityEvent2: string;
    fieldActivityEvent3: string;
    sharePreviewBtn: string;
    sharePreviewCopied: string;
  }
> = {
  en: {
    subtitle: "Agent-ready GitHub profile themes & DIY widgets",
    navSkins: "Profile Skins",
    navRepo: "Repo Skins",
    navWidgets: "DIY Widgets",
    heroTitleA: "Copy one prompt.",
    heroTitleB: "Re-skin your GitHub profile.",
    heroLead:
      "Handcrafted Light & Dark SVG theme systems and multi-form DIY widgets — cards, hero corner stickers, patrol runways, and mini bento tiles.",
    step1: "Pick a skin",
    step2: "Place DIY widgets anywhere",
    step3: "Copy prompt or export SVGs",
    ghLight: "GitHub Light",
    ghDark: "GitHub Dark",
    ghBoth: "Light + Dark",
    copyPrompt: "Copy Agent Prompt",
    copied: "Prompt Copied",
    quickMode: "Quick Prompt",
    fullMode: "Full Prompt",
    quickHint: "Compact prompt pointing your agent to live SPEC.md & generator.py on GitHub.",
    fullHint: "Self-contained multi-step prompt ready for any agent environment.",
    bestFor: "Best for",
    paletteLabel: "Theme Palette (click to copy)",
    copiedHex: "Copied",
    includedLabel: "What your agent generates",
    openSpec: "SPEC.md",
    openGen: "generator.py",
    openRepo: "Source",
    contactHeading: "Compare All Skins",
    contactSub: "Same real developer profile rendered across every theme. Click any poster to inspect and copy its prompt.",
    selectedBadge: "ACTIVE",
    previewSkin: "Inspect skin",
    howHeading: "Engineered so AI agents nail the layout on the first try",
    howItems: [
      {
        num: "01",
        title: "Zero-Config Identity Detection",
        body: "Prompts instruct your agent to read your local gh CLI or git config, fetch your real avatar, repos, stars, and live URLs—no web forms and no fabricated stats.",
      },
      {
        num: "02",
        title: "Multi-Form Theme-Aware Widgets",
        body: "Craft cards, hero corner stickers merged directly into hero.svg, 846x48 animated patrol strips, and 204px mini bento tiles—all inheriting your skin's semantic tokens.",
      },
      {
        num: "03",
        title: "Open-Source & Extensible",
        body: "Each skin lives in a self-contained folder under themes/. Run one build script to schema-check tokens, validate strict XML, and sync the live showcase.",
      },
    ],
    footerNote: "Open-source MIT project maintained by Furina-he.",
    submitSkin: "Submit a Theme via PR",
    svgUnit: "XML-validated SVGs",
    snakeNote: "Daily contribution snake workflow (.github/workflows/snake.yml) included in every skin.",
    agentsLabel: "Works with Claude Code · Codex · Cursor · Antigravity · Gemini CLI · Windsurf",
    loadoutTitle: "Mounted DIY Widgets",
    loadoutEmptyHint: "Mount corner stickers on your Hero, an 846x48 patrol runway, 204px mini tiles, or cards anywhere on the page.",
    loadoutOpenStudio: "Open DIY Widgets Studio",
    loadoutMergedBadge: "DIY widgets merged into prompt",
    loadoutEdit: "Edit",
    loadoutRemove: "Remove",
    loadoutMoveUp: "Move up",
    loadoutMoveDown: "Move down",
    widgetsHeroTitleA: "Craft custom widgets.",
    widgetsHeroTitleB: "Place them anywhere on your profile.",
    widgetsHeroLead:
      "22 skin-adaptive widgets: 12 Static DIY blocks (keycaps, split-flap, radar, scannable QR, pets, tiles) + 10 Zero-503 GitHub Actions Live Widgets (Stats, Rhythm, RSS, Weather, WakaTime, Spotify, Snake, 3D Skyline, Streak, Activity).",
    widgetMountedBadge: "MOUNTED",
    widgetMountBtn: "Mount to Profile Loadout",
    widgetMountedBtn: "Mounted in Loadout (Remove)",
    widgetViewProfile: "Preview on Profile",
    widgetSkinLabel: "Adapt to Skin",
    widgetPlacementLabel: "Profile Slot Placement",
    widgetWidthLabel: "README Form Factor",
    widgetWidthHalf: "Half · 417px (49%)",
    widgetWidthFull: "Full · 846px (100%)",
    widgetAccentLabel: "Accent Color",
    widgetMotionLabel: "SVG Motion",
    widgetMotionOn: "Calm CSS Motion",
    widgetMotionOff: "Static SVG",
    widgetReset: "Reset Defaults",
    widgetXmlValid: "Strict XML Valid",
    widgetExportHeading: "Zero-Agent Export (Light & Dark SVGs + Markdown)",
    widgetDownloadBoth: "Download Light + Dark SVGs",
    widgetDownloadMergedHero: "Download Merged Hero SVGs",
    widgetDownloadLight: "Light SVG",
    widgetDownloadDark: "Dark SVG",
    widgetCopyMd: "Copy Markdown",
    widgetCopiedMd: "Markdown Copied",
    widgetMdStandard: "Standard <picture>",
    widgetMdFloatRight: 'Float Right (align="right")',
    widgetStickerOnHero: "On Hero SVG",
    widgetStickerStandalone: "Standalone 132×92",
    widgetPromptHeading: "Single-Widget Agent Prompt",
    widgetCopyPrompt: "Copy Widget Prompt",
    widgetParamsHeading: "Widget Parameters",
    fieldPet: "Companion Sprite",
    fieldPetName: "Name",
    fieldMood: "Activity Status",
    fieldMessage: "Speech Bubble",
    fieldFooterTag: "Footer Telemetry",
    fieldMedia: "Playback Medium",
    fieldTrack: "Track Title",
    fieldArtist: "Artist / Playlist",
    fieldNote: "Deck Label",
    fieldProgress: "Progress",
    fieldHandle: "Handle / Display Name",
    fieldRole: "Role / Bio Line",
    fieldFocus: "Currently Building",
    fieldLocation: "Timezone / Location",
    fieldStatus: "Status Pill",
    fieldMeterLabel: "Meter Label",
    fieldMeterValue: "Meter Level",
    fieldStackTitle: "Rack Title",
    fieldStackSubtitle: "Right Subtitle",
    fieldSkills: "Skills (comma separated)",
    fieldQuote: "Quote / Manifesto",
    fieldAuthor: "Attribution",
    fieldTag: "Header Stamp",
    fieldMotif: "Animated Charm Motif",
    fieldStickerLabel: "Primary Stamp Text",
    fieldStickerSub: "Secondary Label",
    fieldAnchor: "Hero Corner Anchor",
    fieldRunwayMode: "Runway Animation Mode",
    fieldRunner: "Patrolling Sprite",
    fieldRunwayTag: "Left Badge",
    fieldRunwayText: "Ticker / Status Copy",
    fieldRunwaySpeed: "Speed",
    fieldTileScene: "Mini Tile Animation",
    fieldWeather: "Weather Effect",
    fieldTileTitle: "Tile Title",
    fieldTileSub: "Bottom Micro-Label",
    tryGhPlaceholder: "Try any GitHub username (e.g. antfu, torvalds)...",
    tryGhBtn: "Live Preview",
    tryGhLoading: "Fetching...",
    tryGhReset: "Reset Demo",
    tryGhLivePrefix: "Live GitHub",
    tryGhErrInvalid: "Enter a valid GitHub username (letters, numbers, single hyphens).",
    tryGhErrNotFound: "GitHub user not found. Check the spelling and try again.",
    tryGhErrRateLimit: "GitHub public API rate limit reached (60 req/hr). Try again shortly or use Agent Prompt.",
    tryGhErrNetwork: "Could not reach api.github.com. Check your network connection.",
    exportZipBtn: "Export ZIP (SVGs + README)",
    exportZipDone: "ZIP Downloaded",
    paramHeading: "Parametric Tweaks",
    paramReset: "Reset",
    paramAccent: "Accent Override",
    paramCards: "Project Cards",
    paramMotion: "SVG Motion",
    paramCopyLang: "Copy Language",
    paramLangAuto: "Auto",
    paramLangEn: "EN",
    paramLangZh: "中文",
    paramLangBi: "EN+中",
    paramMergedBadge: "Custom profile / parameters injected",
    bentoPresetsLabel: "1-Click Full 4/4 Bento Presets",
    bentoPresetTarget: "Insert into",
    bentoFillColsPrefix: "+ Fill",
    bentoFillColsSuffix: "remaining col(s)",
    bentoFullRowBadge: "4/4 FULL",
    bentoStretchFill: "↔ Stretch block to fill row",
    bentoDownloadRow: "↓ Row SVG",
    bentoDuplicate: "Copy",
    bentoClearAll: "Clear all",
    bentoAddInstanceBtn: "Add Instance to Profile",
    bentoEditingBanner: "Editing mounted instance (live synced)",
    bentoNewModeBtn: "Switch to New Instance",
    bentoColSpanLabel: "Bento Width (4-Col 846px Grid)",
    bentoQuickFillTitle: "Pick a widget to fill remaining",
    bentoClose: "Close",
    widgetFilterAll: "All Widgets",
    widgetFilterStatic: "Static DIY",
    widgetFilterLive: "Live Actions",
    widgetLiveBadge: "LIVE",
    widgetLiveWorkflowHeading: "GitHub Actions Auto-Update (Zero-503)",
    widgetLiveWorkflowHint:
      "Commit .github/workflows/gitskins-widgets.yml to your profile repo. Actions runs a zero-dependency Python stdlib script on schedule and refreshes assets/live-*.svg.",
    widgetCopyYaml: "Copy Workflow YAML",
    widgetCopiedYaml: "YAML Copied",
    widgetDownloadYaml: "Download .yml",
    widgetDownloadPy: "Download Python Script",
    liveZipIncluded: "ZIP bundles .github/workflows/gitskins-widgets.yml + Python generator",
    fieldGhUsername: "GitHub Username",
    fieldGhStars: "Preview Stars",
    fieldGhRepos: "Preview Repos",
    fieldGhFollowers: "Preview Followers",
    fieldGhPrs: "Preview Merged PRs",
    fieldGhLanguages: "Preview Languages (Name:Pct, ...)",
    fieldLivePreviewNote: "Preview values only — GitHub Actions fetches real API data automatically on schedule.",
    fieldTzOffset: "UTC Timezone Offset",
    fieldPersona: "Preview Circadian Pattern",
    fieldCronSchedule: "Actions Refresh Schedule",
    fieldRssUrl: "RSS 2.0 / Atom Feed URL",
    fieldRssSource: "Blog / Feed Label",
    fieldRssPost1: "Preview Entry #1",
    fieldRssPost2: "Preview Entry #2",
    fieldRssPost3: "Preview Entry #3",
    fieldCity: "Target City (Open-Meteo)",
    fieldTempUnit: "Temperature Unit",
    fieldWeatherCond: "Preview Sky Condition",
    fieldTempPreview: "Preview Temp",
    fieldHumidity: "Preview Humidity",
    repoHeroTitleA: "Same sharp aesthetics.",
    repoHeroTitleB: "Now for your open-source repo README.",
    repoHeroLead:
      "Turn any GitHub repository into a cohesive 846px Light & Dark visual spec: Project Hero Banner, Quick Install strip, Feature Cards, Architecture Pipeline, and an optional GitSkins badge.",
    repoTryPlaceholder: "Try any public repo (e.g. Furina-he/gitskins, vitejs/vite)...",
    repoTryBtn: "Load Repo",
    repoLivePrefix: "Live Repo",
    repoErrInvalid: "Enter a valid owner/repo slug or GitHub repository URL.",
    repoErrNotFound: "Public repository not found. Check owner/repo spelling.",
    repoInspectorSub:
      "Generate Light & Dark SVGs for your project repository via Agent Prompt, zero-dependency CLI, or one-click ZIP.",
    repoCopyPrompt: "Copy Repo Agent Prompt",
    repoExportZipBtn: "Export Repo ZIP (SVGs + README)",
    repoCliHeading: "Agent-Native CLI & Standard SKILL.md",
    repoCliCopy: "Copy CLI Command",
    repoCliCopied: "CLI Copied",
    repoOpenSkill: "Agent SKILL.md",
    repoOpenCliSource: "CLI Source",
    repoFeatureCount: "Feature Cards",
    repoArchToggle: "Arch Diagram",
    gitskinsBadgeLabel: "GitSkins Badge",
    repoFieldsHeading: "Repository Modules",
    repoFieldName: "Repository Name",
    repoFieldVersion: "Version / Ref",
    repoFieldTagline: "One-Line Tagline",
    repoFieldInstall: "Quick Install Command",
    repoFieldArch: "Architecture Flow (Title | Sub -> ...)",
    repoFieldFeatures: "Feature Cards (Tag + Title)",
    fieldWakaTotal: "Preview 7-Day Total",
    fieldWakaAvg: "Preview Daily Avg",
    fieldWakaEditor: "Primary Editor",
    fieldWakaSecretNote: "Add repo secret WAKATIME_API_KEY in GitHub Actions to auto-refresh real 7-day coding stats.",
    fieldSpotifyAlbum: "Album / Playlist",
    fieldSpotifyDuration: "Duration",
    fieldSpotifySecretNote: "Add SPOTIFY_CLIENT_ID / SECRET / REFRESH_TOKEN secrets in Actions to sync your real Spotify playback.",
    pickerAllSkins: "All Skins",
    pickerSearchPlaceholder: "Filter by name, style, or keyword...",
    pickerGroupAll: "All",
    pickerGroupGrid: "Editorial & Grid",
    pickerGroupTech: "Hardware & Eng",
    pickerGroupRetro: "Retro & Pixel",
    pickerGroupArt: "Print & Ink",
    pickerPrev: "Previous skin",
    pickerNext: "Next skin",
    pickerShortcutHint: "Use ← / → to switch · K to toggle gallery · Esc to close",
    pickerNoMatch: "No matching skin found for this filter.",
    widgetCatalogExpand: "Expand details",
    widgetCatalogCompact: "Compact rail",
    fieldSnakeEngine: "Snake Actions Engine",
    fieldSnakeEnginePlatane: "Platane/snk (Themed)",
    fieldSnakeEngineNative: "GitSkins Framed SVG",
    fieldSnakeSpeed: "Animation Pace",
    fieldSnakeNotePlatane:
      "Exports .github/workflows/snake.yml using Platane/snk/svg-only@v3 with your active skin's exact Light & Dark color_snake and 5-level color_dots palette.",
    fieldSnakeNoteNative:
      "Generates assets/live-contribution-snake-{light,dark}.svg directly inside scripts/generate_live_widgets.py with theme frame & real GitHub GraphQL contributions (no extra output branch).",
    widgetSnakeWorkflowHeading: "Contribution Snake Workflow (.github/workflows/snake.yml)",
    widgetSnakeWorkflowHint:
      "Runs Platane/snk/svg-only@v3 daily with Light & Dark color_snake and color_dots matched to your active GitSkins theme, pushing to the output branch.",
    snakeStageCta: "Click to customize L07 Contribution Snake (Platane/snk themed palette or framed SVG)",
    fieldKeycapTitle: "Deck Label",
    fieldKeycapKeys: "Keycaps (comma separated)",
    fieldKeycapAccent: "Accent Modifier Keys",
    fieldKeycapHardware: "Hardware Spec Footer",
    fieldFlapHeader: "Board Header",
    fieldFlapLine1: "Top Flap Row (A–Z / 0–9)",
    fieldFlapLine2: "Bottom Flap Row",
    fieldFlapCode: "Gate / Status Tag",
    fieldRadarTitle: "Radar Header",
    fieldRadarSub: "Right Badge",
    fieldRadarAxes: "6 Axes (Label:Score, ...)",
    fieldQrUrl: "Target URL (Scannable QR)",
    fieldQrTitle: "Card Title",
    fieldQrSub: "Display Domain / Handle",
    fieldQrBadge: "Top-Right Stamp",
    fieldSkylineWeeks: "Rendered Weeks (12–22)",
    fieldSkylineCommits: "Preview Total Commits",
    fieldStreakCurrent: "Preview Current Streak (days)",
    fieldStreakLongest: "Preview Longest Streak (days)",
    fieldActivityEvent1: "Preview Event #1 (TYPE | Text | Age)",
    fieldActivityEvent2: "Preview Event #2 (TYPE | Text | Age)",
    fieldActivityEvent3: "Preview Event #3 (TYPE | Text | Age)",
    sharePreviewBtn: "↗ Share Link",
    sharePreviewCopied: "✓ Link Copied",
  },
  zh: {
    subtitle: "面向 AI 编程 Agent 的 GitHub 主页主题与挂件工坊",
    navSkins: "主页皮肤",
    navRepo: "仓库皮肤",
    navWidgets: "DIY 挂件工坊",
    heroTitleA: "复制一条提示词，",
    heroTitleB: "给你的 GitHub 主页换皮肤。",
    heroLead:
      "每一套主题都配有独立视觉规范、Light/Dark 双主题纯 SVG 与多形态主题联动小挂件——支持 Hero 角落贴纸、巡逻跑道、迷你小方砖与信息卡片自由插槽拼装。",
    step1: "挑选喜欢的皮肤",
    step2: "任意位置拼装小挂件",
    step3: "复制提示词或导出 SVG",
    ghLight: "GitHub 浅色",
    ghDark: "GitHub 深色",
    ghBoth: "深浅双显",
    copyPrompt: "一键复制 Agent 提示词",
    copied: "已复制到剪贴板",
    quickMode: "极简提示词",
    fullMode: "完整提示词",
    quickHint: "精简一行指令，让 Agent 直接拉取 GitHub 上的 SPEC.md 与 generator.py 执行。",
    fullHint: "包含完整分步执行清单，适合任何本地或受限网络环境的 Agent。",
    bestFor: "适合人群",
    paletteLabel: "主题色板（点击复制色值）",
    copiedHex: "已复制",
    includedLabel: "该皮肤包含内容",
    openSpec: "规范 SPEC",
    openGen: "生成脚本",
    openRepo: "源码目录",
    contactHeading: "全主题同框对比",
    contactSub: "同一位开发者的真实仓库在 11 套完全不同美学体系下的效果对比，点击任意海报立即切换预览与复制提示词。",
    selectedBadge: "当前预览",
    previewSkin: "查看这套皮肤",
    howHeading: "为什么复制提示词后，Agent 能一次稳定出好图？",
    howItems: [
      {
        num: "01",
        title: "零表单自动识别账号",
        body: "提示词会引导 Agent 自动读取你本地的 gh CLI 或 git config，获取真实头像、公开仓库、Star 与官网链接，绝不编造虚假数据。",
      },
      {
        num: "02",
        title: "多形态主题联动挂件",
        body: "不止底栏卡片：支持直接合进 Hero 角落的动态贴纸、846×48 像素巡逻跑道、204² 迷你动态小方砖与 10 款 Actions 活挂件，自动继承全部 11 套皮肤语义令牌。",
      },
      {
        num: "03",
        title: "完全开源，持续扩充",
        body: "每套主题独立存放在 themes/ 目录下，跑一遍构建脚本即可自动校验语义令牌、严格 XML 并同步到展示站。",
      },
    ],
    footerNote: "MIT 开源项目 · 由 Furina-he 持续维护",
    submitSkin: "通过 PR 投稿新主题",
    svgUnit: "张严格校验双主题 SVG",
    snakeNote: "每套主题均支持自动配置 .github/workflows/snake.yml 每日更新贡献图贪吃蛇。",
    agentsLabel: "兼容 Claude Code · Codex · Cursor · Antigravity · Gemini CLI · Windsurf",
    loadoutTitle: "已挂载的 DIY 小挂件",
    loadoutEmptyHint: "可挂载 Hero 角落动态贴纸、846×48 像素巡逻跑道、204² 迷你小方砖或信息卡，并自由放在页面任意插槽。",
    loadoutOpenStudio: "进入 DIY 挂件工坊",
    loadoutMergedBadge: "个 DIY 挂件已自动拼入提示词",
    loadoutEdit: "定制",
    loadoutRemove: "移除",
    loadoutMoveUp: "上移",
    loadoutMoveDown: "下移",
    widgetsHeroTitleA: "自由 DIY 小挂件，",
    widgetsHeroTitleB: "任意位置、多种形态自动换肤。",
    widgetsHeroLead:
      "22 款主题联动挂件：12 款纯前端 DIY 积木（机械键帽、翻页屏、六维雷达、可扫二维码、桌宠、方砖）+ 10 款零 503 GitHub Actions 活挂件（统计、作息、RSS、天气、WakaTime、Spotify、贡献图贪吃蛇、3D 天际线、连胜火炬、动态日志）。",
    widgetMountedBadge: "已挂载",
    widgetMountBtn: "挂载到主页套装",
    widgetMountedBtn: "已挂载到套装（点击移出）",
    widgetViewProfile: "回主页看整页效果",
    widgetSkinLabel: "联动皮肤风格",
    widgetPlacementLabel: "主页挂载位置（插槽）",
    widgetWidthLabel: "README 宽度规格",
    widgetWidthHalf: "半宽 · 417px (49%)",
    widgetWidthFull: "通栏 · 846px (100%)",
    widgetAccentLabel: "主强调色覆盖",
    widgetMotionLabel: "SVG 动效",
    widgetMotionOn: "克制 CSS 动效",
    widgetMotionOff: "纯静态 SVG",
    widgetReset: "恢复默认",
    widgetXmlValid: "严格 XML 校验通过",
    widgetExportHeading: "免 Agent 直接带走（双主题 SVG + Markdown）",
    widgetDownloadBoth: "下载深浅双主题 SVG",
    widgetDownloadMergedHero: "下载合成版 Hero 双主题 SVG",
    widgetDownloadLight: "浅色 SVG",
    widgetDownloadDark: "深色 SVG",
    widgetCopyMd: "复制 Markdown",
    widgetCopiedMd: "已复制 Markdown",
    widgetMdStandard: "标准 <picture>",
    widgetMdFloatRight: '右侧浮动 (align="right")',
    widgetStickerOnHero: "叠在 Hero 上预览",
    widgetStickerStandalone: "独立 132×92 贴片",
    widgetPromptHeading: "单挂件 Agent 提示词",
    widgetCopyPrompt: "复制单挂件提示词",
    widgetParamsHeading: "挂件参数定制",
    fieldPet: "像素角色",
    fieldPetName: "宠物名称",
    fieldMood: "当前状态",
    fieldMessage: "气泡台词",
    fieldFooterTag: "底部状态栏文案",
    fieldMedia: "播放器形态",
    fieldTrack: "歌曲 / 曲目名",
    fieldArtist: "歌手 / 歌单",
    fieldNote: "顶部角标",
    fieldProgress: "播放进度",
    fieldHandle: "昵称 / ID",
    fieldRole: "职业头衔 / 简介",
    fieldFocus: "当前正在做",
    fieldLocation: "城市 / 时区",
    fieldStatus: "状态标签",
    fieldMeterLabel: "能量条名称",
    fieldMeterValue: "能量值",
    fieldStackTitle: "机架标题",
    fieldStackSubtitle: "右侧副标",
    fieldSkills: "技术栈列表（逗号分隔）",
    fieldQuote: "宣言 / 座右铭",
    fieldAuthor: "署名 / 出处",
    fieldTag: "顶部印章",
    fieldMotif: "动态挂坠图案",
    fieldStickerLabel: "主标签文案",
    fieldStickerSub: "底部小字",
    fieldAnchor: "Hero 贴纸锚点角落",
    fieldRunwayMode: "跑道动效模式",
    fieldRunner: "巡逻像素精灵",
    fieldRunwayTag: "左侧角标",
    fieldRunwayText: "跑马灯 / 状态文案",
    fieldRunwaySpeed: "移动速度",
    fieldTileScene: "方砖动画场景",
    fieldWeather: "天气效果",
    fieldTileTitle: "方砖标题",
    fieldTileSub: "底部小标签",
    tryGhPlaceholder: "输入任意 GitHub 用户名真身预览（如 antfu、torvalds）...",
    tryGhBtn: "真身预览",
    tryGhLoading: "拉取中...",
    tryGhReset: "恢复演示",
    tryGhLivePrefix: "实时真身",
    tryGhErrInvalid: "请输入合法的 GitHub 用户名（字母、数字与连字符）。",
    tryGhErrNotFound: "未找到该 GitHub 账号，请检查拼写后重试。",
    tryGhErrRateLimit: "已触发 GitHub 公开 API 匿名限流（每小时 60 次），稍后再试或直接使用 Agent 提示词。",
    tryGhErrNetwork: "无法连接 api.github.com，请检查网络环境。",
    exportZipBtn: "一键打包下载 ZIP（SVG + README）",
    exportZipDone: "已导出 ZIP 套件",
    paramHeading: "参数化微调（同步预览与提示词）",
    paramReset: "重置",
    paramAccent: "主强调色覆盖",
    paramCards: "项目卡片数",
    paramMotion: "SVG 动效",
    paramCopyLang: "文案语言",
    paramLangAuto: "自动",
    paramLangEn: "纯英",
    paramLangZh: "纯中",
    paramLangBi: "双语",
    paramMergedBadge: "自定义账号 / 参数已注入提示词",
    bentoPresetsLabel: "一键满行 Bento 组合预设（4/4 无留白）",
    bentoPresetTarget: "装入位置",
    bentoFillColsPrefix: "+ 补齐剩余",
    bentoFillColsSuffix: "格空位",
    bentoFullRowBadge: "4/4 满行 ✓",
    bentoStretchFill: "↔ 拉宽前一块填满本行",
    bentoDownloadRow: "↓ 整行 SVG",
    bentoDuplicate: "复制",
    bentoClearAll: "清空全部",
    bentoAddInstanceBtn: "添加此挂件到主页套装",
    bentoEditingBanner: "正在实时编辑主页中的该挂件实例",
    bentoNewModeBtn: "切回新建模式",
    bentoColSpanLabel: "4 列 Bento 占宽（846px 栅格）",
    bentoQuickFillTitle: "挑选挂件填满当前行剩余",
    bentoClose: "收起",
    widgetFilterAll: "全部挂件",
    widgetFilterStatic: "纯前端 DIY",
    widgetFilterLive: "Actions 活挂件",
    widgetLiveBadge: "定时活",
    widgetLiveWorkflowHeading: "GitHub Actions 定时自更新（零 503）",
    widgetLiveWorkflowHint:
      "将 .github/workflows/gitskins-widgets.yml 提交到你的主页仓库，Actions 会按计划运行零依赖 Python 脚本自动更新 assets/live-*.svg。",
    widgetCopyYaml: "复制 Workflow YAML",
    widgetCopiedYaml: "已复制 YAML",
    widgetDownloadYaml: "下载 .yml",
    widgetDownloadPy: "下载 Python 脚本",
    liveZipIncluded: "导出 ZIP 将自动打包 Actions 工作流与 Python 生成脚本",
    fieldGhUsername: "GitHub 用户名",
    fieldGhStars: "预览 Stars",
    fieldGhRepos: "预览公开仓库数",
    fieldGhFollowers: "预览粉丝数",
    fieldGhPrs: "预览合并 PR",
    fieldGhLanguages: "语言占比预览（语言:百分比）",
    fieldLivePreviewNote: "上方数值仅用于网页预览，启用 GitHub Actions 后会自动拉取你的真实 API 数据。",
    fieldTzOffset: "所在时区偏移（UTC）",
    fieldPersona: "预览作息曲线",
    fieldCronSchedule: "Actions 定时刷新频率",
    fieldRssUrl: "RSS 2.0 / Atom 订阅源 URL",
    fieldRssSource: "博客 / 站点名称",
    fieldRssPost1: "预览文章 #1",
    fieldRssPost2: "预览文章 #2",
    fieldRssPost3: "预览文章 #3",
    fieldCity: "目标城市（Open-Meteo 实时天气）",
    fieldTempUnit: "温度单位",
    fieldWeatherCond: "预览天气动画",
    fieldTempPreview: "预览气温",
    fieldHumidity: "预览湿度",
    repoHeroTitleA: "同款高辨识度美学，",
    repoHeroTitleB: "现在延伸到你的开源仓库 README。",
    repoHeroLead:
      "一键将 11 大视觉体系套用到项目仓库：846px 项目海报 Banner、快速安装命令条、特性卡片矩阵、架构流程图与可选 Styled with GitSkins 尾标，支持真仓库拉取、CLI 脚手架与 ZIP 打包。",
    repoTryPlaceholder: "输入公开仓库 owner/repo（如 Furina-he/gitskins、vitejs/vite）...",
    repoTryBtn: "拉取仓库",
    repoLivePrefix: "实时仓库",
    repoErrInvalid: "请输入合法的 owner/repo 或 GitHub 仓库链接。",
    repoErrNotFound: "未找到该公开仓库，请检查拼写后重试。",
    repoInspectorSub:
      "支持复制 Agent 提示词让 AI 读取本地仓库自动生成，也可直接打包 ZIP 或使用零依赖 CLI 一键初始化。",
    repoCopyPrompt: "一键复制仓库 Agent 提示词",
    repoExportZipBtn: "一键打包仓库 ZIP（SVG + README）",
    repoCliHeading: "Agent 原生 CLI 与标准 SKILL.md",
    repoCliCopy: "复制 CLI 命令",
    repoCliCopied: "已复制 CLI",
    repoOpenSkill: "查看 SKILL.md",
    repoOpenCliSource: "CLI 源码",
    repoFeatureCount: "特性卡片数",
    repoArchToggle: "架构流程图",
    gitskinsBadgeLabel: "GitSkins 尾标",
    repoFieldsHeading: "仓库内容定制",
    repoFieldName: "项目名称",
    repoFieldVersion: "版本 / 分支",
    repoFieldTagline: "项目一句话简介",
    repoFieldInstall: "快速安装命令",
    repoFieldArch: "架构流程（阶段 | 说明 -> 下一阶段）",
    repoFieldFeatures: "特性卡片（角标 + 标题）",
    fieldWakaTotal: "预览近 7 天总时长",
    fieldWakaAvg: "预览日均时长",
    fieldWakaEditor: "常用编辑器",
    fieldWakaSecretNote: "在 GitHub 仓库 Secrets 中配置 WAKATIME_API_KEY 即可定时同步真实 7 天编程时长（未配置时优雅回退）。",
    fieldSpotifyAlbum: "所属专辑 / 歌单",
    fieldSpotifyDuration: "歌曲时长",
    fieldSpotifySecretNote: "在仓库 Secrets 配置 SPOTIFY_CLIENT_ID / SECRET / REFRESH_TOKEN 即可定时同步真实正在播放或最近曲目。",
    pickerAllSkins: "全部皮肤",
    pickerSearchPlaceholder: "按名称、风格或关键词筛选皮肤...",
    pickerGroupAll: "全部",
    pickerGroupGrid: "几何/排版",
    pickerGroupTech: "硬件/工程",
    pickerGroupRetro: "复古/像素",
    pickerGroupArt: "东方/艺术",
    pickerPrev: "上一套皮肤",
    pickerNext: "下一套皮肤",
    pickerShortcutHint: "键盘 ← / → 秒切皮肤 · K 键开关图鉴 · Esc 关闭",
    pickerNoMatch: "没有匹配当前筛选条件的皮肤。",
    widgetCatalogExpand: "展开详情卡片",
    widgetCatalogCompact: "收起紧凑条",
    fieldSnakeEngine: "贪吃蛇生成引擎",
    fieldSnakeEnginePlatane: "Platane/snk 同款",
    fieldSnakeEngineNative: "原生皮肤框版",
    fieldSnakeSpeed: "贪吃蛇速度",
    fieldSnakeNotePlatane:
      "自动导出 .github/workflows/snake.yml，基于 GitHub 经典 Platane/snk/svg-only@v3 并按当前皮肤自动注入深/浅色 color_snake 与 5 级 color_dots 色板。",
    fieldSnakeNoteNative:
      "直接由 scripts/generate_live_widgets.py 调用 GITHUB_TOKEN GraphQL 生成带当前皮肤边框的 assets/live-contribution-snake-{light,dark}.svg，无需新建 output 分支。",
    widgetSnakeWorkflowHeading: "贡献图贪吃蛇工作流（.github/workflows/snake.yml）",
    widgetSnakeWorkflowHint:
      "每天定时运行 Platane/snk/svg-only@v3 并注入当前皮肤的深浅色板，输出到 output 分支，完美替代默认绿/紫配色。",
    snakeStageCta: "点击前往挂件工坊定制 L07 贡献图贪吃蛇（支持 Platane/snk 自动配色或皮肤框版）",
    fieldKeycapTitle: "键盘标题",
    fieldKeycapKeys: "键帽列表（逗号分隔）",
    fieldKeycapAccent: "高亮功能键（逗号分隔）",
    fieldKeycapHardware: "底部硬件配置条",
    fieldFlapHeader: "翻页屏顶标",
    fieldFlapLine1: "上排翻页文案（字母/数字）",
    fieldFlapLine2: "下排翻页文案",
    fieldFlapCode: "登机口 / 状态角标",
    fieldRadarTitle: "雷达标题",
    fieldRadarSub: "右上角标",
    fieldRadarAxes: "六维指标（名称:分值，逗号分隔）",
    fieldQrUrl: "扫码目标网址（真可扫码）",
    fieldQrTitle: "名片标题",
    fieldQrSub: "展示域名 / 账号",
    fieldQrBadge: "右上认证章",
    fieldSkylineWeeks: "展示周数（12–22 周）",
    fieldSkylineCommits: "预览年度总提交数",
    fieldStreakCurrent: "预览当前连胜天数",
    fieldStreakLongest: "预览历史最长连胜",
    fieldActivityEvent1: "预览动态 #1（类型 | 内容 | 时间）",
    fieldActivityEvent2: "预览动态 #2（类型 | 内容 | 时间）",
    fieldActivityEvent3: "预览动态 #3（类型 | 内容 | 时间）",
    sharePreviewBtn: "↗ 分享直链",
    sharePreviewCopied: "✓ 已复制直链",
  },
};
