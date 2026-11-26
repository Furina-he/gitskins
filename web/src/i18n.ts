import type { Lang } from "./types";

export const COPY: Record<
  Lang,
  {
    subtitle: string;
    navSkins: string;
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
  }
> = {
  en: {
    subtitle: "Agent-ready GitHub profile themes & DIY widgets",
    navSkins: "Theme Skins",
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
      "8 skin-adaptive form factors: Hero corner stickers, 846x48 animated patrol runways, 204x204 mini tiles, and classic cards. Export standalone or merged Hero SVGs directly, or mount into your Loadout prompt.",
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
  },
  zh: {
    subtitle: "面向 AI 编程 Agent 的 GitHub 主页主题与挂件工坊",
    navSkins: "主题皮肤",
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
    contactSub: "同一位开发者的真实仓库在 4 套完全不同美学体系下的效果对比，点击任意海报立即切换预览与复制提示词。",
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
        body: "不止底栏卡片：支持直接合进 Hero 角落的动态贴纸、846×48 像素巡逻跑道、204² 迷你动态小方砖，自动继承 4 套皮肤语义令牌。",
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
      "8 款主题联动挂件：覆盖 Hero 角落贴纸、846×48 动态巡逻跑道、204² 迷你小方砖与经典卡片。免 AI 即可下载独立或合成版 Hero SVG，也可一键拼进主页套装提示词。",
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
  },
};
