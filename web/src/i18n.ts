import type { Lang } from "./types";

export const COPY: Record<
  Lang,
  {
    subtitle: string;
    heroTitleA: string;
    heroTitleB: string;
    heroLead: string;
    step1: string;
    step2: string;
    step3: string;
    ghLight: string;
    ghDark: string;
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
  }
> = {
  en: {
    subtitle: "Agent-ready GitHub profile themes",
    heroTitleA: "Copy one prompt.",
    heroTitleB: "Re-skin your GitHub profile.",
    heroLead:
      "Handcrafted Light & Dark SVG theme systems with deterministic generators. Zero forms—paste into your AI coding agent and it auto-detects your GitHub handle, avatar, and real repos.",
    step1: "Pick a skin",
    step2: "Copy Agent Prompt",
    step3: "Paste into your coding agent",
    ghLight: "GitHub Light",
    ghDark: "GitHub Dark",
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
        title: "Deterministic SVG Generators",
        body: "Every skin ships with a strict SPEC.md and reference Python generator.py, preventing misaligned hand-written SVGs and guaranteeing Light/Dark parity.",
      },
      {
        num: "03",
        title: "Open-Source & Extensible",
        body: "Each skin lives in a self-contained folder under themes/. Add a folder, run one build script, and submit a PR to publish a new theme to the gallery.",
      },
    ],
    footerNote: "Open-source MIT project maintained by Furina-he.",
    submitSkin: "Submit a Theme via PR",
    svgUnit: "XML-validated SVGs",
    snakeNote: "Daily contribution snake workflow (.github/workflows/snake.yml) included in every skin.",
    agentsLabel: "Works with Claude Code · Codex · Cursor · Antigravity · Gemini CLI · Windsurf",
  },
  zh: {
    subtitle: "面向 AI 编程 Agent 的 GitHub 主页主题库",
    heroTitleA: "复制一条提示词，",
    heroTitleB: "给你的 GitHub 主页换皮肤。",
    heroLead:
      "每一套主题都配有独立视觉规范、Light/Dark 双主题纯 SVG 与确定性生成脚本。无需填表——复制提示词丢给你的 AI Agent，自动读取你的账号、头像和真实项目完成改造。",
    step1: "挑选喜欢的皮肤",
    step2: "一键复制提示词",
    step3: "粘贴给你的 AI Agent",
    ghLight: "GitHub 浅色",
    ghDark: "GitHub 深色",
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
        title: "规范文档 + 确定性生成器",
        body: "每套皮肤都附带精确坐标规范 SPEC.md 和 Python 生成脚本骨架，避免模型手写 SVG 错位溢出，并自带深/浅双主题与严格 XML 校验。",
      },
      {
        num: "03",
        title: "完全开源，持续扩充皮肤",
        body: "每套主题独立存放在 themes/ 目录下，新增目录跑一遍构建脚本即可自动收录到展示站，欢迎通过 PR 共建更多风格。",
      },
    ],
    footerNote: "MIT 开源项目 · 由 Furina-he 持续维护",
    submitSkin: "通过 PR 投稿新主题",
    svgUnit: "张严格校验双主题 SVG",
    snakeNote: "每套主题均支持自动配置 .github/workflows/snake.yml 每日更新贡献图贪吃蛇。",
    agentsLabel: "兼容 Claude Code · Codex · Cursor · Antigravity · Gemini CLI · Windsurf",
  },
};
