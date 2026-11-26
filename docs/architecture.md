# GitSkins System Architecture & Contracts

本文档定义 GitSkins 的系统结构、数据契约与 GitHub README 兼容性约束，作为主题、挂件、构建脚本与展示站共享的工程基准。

---

## 1. Repository Layout

```text
gitskins/
├── docs/
│   ├── architecture.md       # 系统架构、语义令牌契约、SVG 兼容规范
│   └── widgets-system.md     # DIY 小挂件架构、Schema 与双路径导出规范
├── scripts/
│   └── build_all.py          # 主题生成、Schema/XML 校验与 manifest 同步
├── themes/<theme-id>/        # 自包含主题目录（meta/SPEC/PROMPT/generator/assets）
├── web/                      # 纯静态展示站与 DIY 挂件工坊（React + Vite + Cloudflare Assets）
│   └── public/themes/        # build_all.py 同步产物（SVGs + manifest.json）
├── ROADMAP.md                # 里程碑与演进路线
└── CONTRIBUTING.md           # 主题与挂件贡献指南
```

### Architecture Principles
1. **Static-First & Zero Backend**: 展示站（`gitskins.blessc.com`）部署为 Cloudflare Workers Static Assets（`web/wrangler.jsonc`）。DIY 挂件渲染、SVG 导出与 Prompt 拼装均在浏览器端完成；动态数据未来统一走用户侧 GitHub Actions。
2. **Single Source of Truth**: 主题元数据与语义令牌定义在 `themes/<id>/meta.json`，经 `scripts/build_all.py` 校验后同步到 `web/public/themes/manifest.json`，前端 `web/src/types.ts` 严格对齐该结构。
3. **Dual Consumption Paths**: 所有资产同时服务两类用户——**AI Agent 用户**（复制组合 Prompt 自动定制推送）与 **零 Agent 用户**（网页 DIY 后直接下载 Light/Dark SVG 与 Markdown）。

---

## 2. Semantic Theme Token Contract

每个主题的 `meta.json` 必须同时提供：
- `palette`: `{ light: string[], dark: string[] }`（用于展示色卡与一键复制）
- `tokens`: `{ light: ThemeTokens, dark: ThemeTokens }`（用于挂件跨主题自动换肤）

### `ThemeTokens` Schema

| Field | Type | Purpose |
| :--- | :--- | :--- |
| `bg` | `#RRGGBB` | 画布主背景色 |
| `surface` | `#RRGGBB` | 卡片 / 面板 / 子模块底色 |
| `ink` | `#RRGGBB` | 主文字与高对比前景色 |
| `sub` | `#RRGGBB` | 正文 / 次级说明文字 |
| `muted` | `#RRGGBB` | 元信息 / 脚注 / 低权重标签 |
| `border` | `#RRGGBB` | 主结构边框 / 强分割线 |
| `borderSoft` | `#RRGGBB` | 辅助发丝线 / 内部网格线 |
| `accent` | `#RRGGBB` | 主题核心强调色（支持用户自定义覆盖） |
| `accentFg` | `#RRGGBB` | `accent` 实心背景上的高对比文字色 |
| `secondary` | `#RRGGBB` | 第二功能强调色（徽标/进度/次级状态） |
| `tertiary` | `#RRGGBB` | 第三功能强调色（成功/在线/正态指标） |
| `highlight` | `#RRGGBB` | 高亮警示或点缀色（星标/里程碑） |
| `patternBg` | `#RRGGBB` | 装饰区域（编织/网格/终端顶栏）底色 |
| `patternFg` | `#RRGGBB` | 装饰区域纹理前景色 |

### Theme Visual Idiom (`id`)
跨主题组件除读取 `tokens` 颜色外，按 `theme.id` 映射对应结构语法：
- `swiss-bauhaus-pixel`：`0px` 直角、`1px` 实线网格、6×6 正交像素编织纹、硬阴影框
- `blueprint-cad`：双精度毫米坐标网格、四角十字准星（`⊕`）、45° 工程倒角标签
- `editorial-zine`：双发丝线报刊刊头、衬线标题（Georgia / Noto Serif）、朱红方块印记
- `crt-terminal`：`tmux` 顶部窗格条与状态标签、极轻水平扫描线、等宽命令行语法

---

## 3. GitHub README SVG Compatibility Contract

GitHub 通过 Camo 代理渲染 README 中的 SVG，会剥离脚本与外部资源。**所有主题与挂件 SVG 必须遵守以下硬约束：**

1. **严格 XML 合法性**：必须通过标准 XML 解析器（Python `xml.etree.ElementTree.fromstring` / 浏览器 `DOMParser("image/svg+xml")`），所有动态文案必须转义 `& < > " '`。
2. **宽度与栅格纪律**：
   - 通栏模块（`full`）：`viewBox="0 0 846 H"`，README 中使用 `width="100%"`
   - 半宽模块（`half`）：`viewBox="0 0 417 H"`，README 中两张并排使用 `width="49%"` + `&nbsp;`
3. **双主题 `<picture>` 规范**：每个模块必须同时输出 `-light.svg` 与 `-dark.svg`，禁止仅靠滤镜反色：
   ```html
   <picture>
     <source media="(prefers-color-scheme: dark)" srcset="./assets/<name>-dark.svg">
     <img src="./assets/<name>-light.svg" alt="..." width="100%">
   </picture>
   ```
4. **安全静态与克制动效**：
   - 禁止 `<script>`、`<foreignObject>` 依赖、`@import` 外部字体、`onload` 等事件处理器
   - 动效仅限内联 `<style>` 的 CSS `@keyframes`（低频、非闪烁），且必须包裹：
     ```css
     @media (prefers-reduced-motion: reduce) { ... animation: none !important; }
     ```
5. **跨平台字体回退**：必须声明系统安全回退链（`Inter Tight / -apple-system / Segoe UI / Noto Sans CJK SC / sans-serif`、`JetBrains Mono / Consolas / monospace`、`Georgia / Noto Serif CJK SC / serif`）。
6. **可读性与对比度**：正文与标签对比度 `>= 4.5:1`，文案需按字符宽预算截断或换行，避免与右侧图标/装饰区重叠。

---

## 4. Build & Validation Pipeline

运行 `python scripts/build_all.py` 时执行：
1. 遍历 `themes/*/`，运行 `generator.py`（若存在）。
2. 校验 `meta.json` 必填字段、`palette` 与 `tokens.{light,dark}` 完整性和十六进制色值格式。
3. 使用 `ET.fromstring` 对全部 `assets/*.svg` 做严格 XML 校验。
4. 同步 SVG 与聚合后的 `manifest.json` 到 `web/public/themes/`。
