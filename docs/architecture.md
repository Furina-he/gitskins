# GitSkins System Architecture & Contracts

本文档定义 GitSkins 的系统结构、数据契约、SVG 兼容规范、提示词防残留约束与扩展检查清单，作为主题、挂件、构建脚本、CLI 与展示站共享的工程基准。

---

## 1. Repository Layout

```text
gitskins/
├── AGENTS.md                 # AI Agent 协作防回归总纲与扩展清单
├── assets/                   # 品牌标准图标 logo.svg 与本仓库自用的双主题 Repo Skin SVGs
├── cli/                      # 零依赖 Node 18+ CLI（@furina-he/gitskins：list / init / validate）
├── docs/
│   ├── architecture.md       # 系统架构、语义令牌契约、SVG 兼容与提示词防残留规范
│   ├── widgets-system.md     # 4 列 Bento DIY 挂件架构、Schema 与整行合成规范
│   ├── profile-preview.md    # 零后端真身实时预览与 ZIP 打包规范
│   ├── live-widgets.md       # 零 503 GitHub Actions 活挂件规范（L01–L06）
│   └── repo-skins.md         # 开源仓库 Repo Skins、Agent Skill 与 CLI 规范
├── live-widgets/             # 零依赖 Python 标准库活挂件生成器与 Actions 模板
├── scripts/
│   └── build_all.py          # 主题生成、Schema/Prompt/品牌图标/XML 校验与 manifest 同步
├── skill/gitskins/SKILL.md   # 标准 Agent Skill 定义（同步至 web/public/skill/SKILL.md）
├── themes/<theme-id>/        # 自包含主题目录（meta/SPEC/PROMPT/generator/README.demo/assets）
├── web/                      # 纯静态展示站与工坊（React + Vite + Cloudflare Workers Static Assets）
│   └── public/               # favicon.svg 及 build_all.py 同步产物（themes/ live-widgets/ skill/）
├── README.md / README_ZH.md  # 中英双语开源首页（含 2×3 实时视觉主题画廊）
├── ROADMAP.md                # 里程碑与演进路线
└── CONTRIBUTING.md           # 主题与挂件贡献指南
```

### Architecture Principles
1. **Static-First & Zero Backend**: 展示站（`gitskins.blessc.com`）部署为 Cloudflare Workers Static Assets（`web/wrangler.jsonc`）。DIY 挂件渲染、真身实时预览、Repo Skins 渲染与 ZIP 导出均在浏览器端完成；动态活挂件统一走用户侧 GitHub Actions，彻底避免第三方服务 `503`。
2. **Single Source of Truth**: 主题元数据与 14 项语义令牌定义在 `themes/<id>/meta.json`，经 `scripts/build_all.py` 校验后同步到 `web/public/themes/manifest.json`，前端 `web/src/types.ts` 严格对齐该结构。
3. **Dual Consumption Paths**: 所有资产同时服务三类路径——**Web Studio 零门槛导出**、**AI Coding Agents（`SKILL.md` / `PROMPT.md`）**与 **零依赖本地 CLI（`node cli/gitskins.mjs`）**。

---

## 2. Semantic Theme Token Contract

每个主题的 `meta.json` 必须同时提供：
- `palette`: `{ light: string[], dark: string[] }`（用于展示色卡与一键复制）
- `tokens`: `{ light: ThemeTokens, dark: ThemeTokens }`（用于挂件与 Repo Skins 跨主题自动换肤）

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

### Theme Visual Idioms (`01`–`06`)
跨主题组件除读取 `tokens` 颜色外，按 `theme.id` 映射对应结构语法与头像策略：
- `01` `swiss-bauhaus-pixel`：`0px` 直角、`1px` 实线网格、6×6 正交像素编织纹、硬阴影框；**支持真实像素头像框**（`24×24`/`28×28` 眨眼肖像）。
- `02` `blueprint-cad`：双精度毫米坐标网格、四角十字准星（`⊕`）、45° 工程倒角标签；纯工程制图风格（无照片头像）。
- `03` `editorial-zine`：双发丝线报刊刊头、衬线标题（Georgia / Noto Serif）、朱红方块印记；纯印刷排版风格（无照片头像）。
- `04` `crt-terminal`：`tmux` 顶部窗格条与状态标签、极轻水平扫描线、等宽命令行语法；左侧身份窗格**支持真实像素头像或首字母像素徽记**。
- `05` `pixel-rpg-hud`：阶梯 `2px` 像素斜角框、四角铆钉、HP/MP/XP 分段槽与 `12×12` 像素遗物图标；右侧角色框**支持真实像素头像**（无头像时回退主题像素徽章）。
- `06` `seal-ink-scroll`：暖调宣纸/端砚双线框、回纹角饰、朱砂雕刻方印与叠墨远山；无照片头像，**支持按用户姓名/首字母定制朱砂印章**。

---

## 3. GitHub README SVG Compatibility Contract

GitHub 通过 Camo 代理渲染 README 中的 SVG，会剥离脚本与外部资源。**所有主题、Repo Skin 与挂件 SVG 必须遵守以下硬约束：**

1. **严格 XML 合法性**：必须通过标准 XML 解析器（Python `xml.etree.ElementTree.fromstring` / 浏览器 `DOMParser("image/svg+xml")` / `node cli/gitskins.mjs validate`），所有动态文案必须转义 `& < > " '`。
2. **宽度与栅格纪律**：
   - 通栏模块（`full`）：`viewBox="0 0 846 H"`，README 中使用 `width="100%"`
   - 半宽模块（`half`）：`viewBox="0 0 417 H"`，README 中两张并排使用 `width="49%"` + `&nbsp;`
   - 4 列 Bento 挂件：`colWidth(span) = span * 204 + (span - 1) * 10`，统一行高 `160px`
3. **双主题 `<picture>` 规范**：每个模块必须同时输出 `-light.svg` 与 `-dark.svg`，禁止仅靠滤镜反色：
   ```html
   <picture>
     <source media="(prefers-color-scheme: dark)" srcset="./assets/<name>-dark.svg">
     <img src="./assets/<name>-light.svg" alt="..." width="100%">
   </picture>
   ```
4. **安全静态与克制动效**：
   - 禁止 `<script>`、`<foreignObject>` 依赖、`@import` 外部字体、`onload` 等事件处理器、以及外链 `<image href="https://...">`（真实头像必须转为矢量像素 `<path>`）。
   - 动效仅限内联 `<style>` 的 CSS `@keyframes`（低频、非闪烁），且必须包裹：
     ```css
     @media (prefers-reduced-motion: reduce) { ... animation: none !important; }
     ```
5. **跨平台字体回退与宽度预算**：必须声明系统安全回退链，并按较宽等宽字体（macOS SFMono / Menlo / Linux Liberation Mono ≈ `0.602em`）预留字符宽度，避免光标或分隔线碰撞。
6. **可读性与对比度**：正文与标签对比度 `>= 4.5:1`（尤其注意在浅蓝 `#7CC4FA` 等着色标题条上使用深墨 `#0A0A0A` 而非浅灰）。

---

## 4. Build & Validation Pipeline

运行 `python scripts/build_all.py` 时自动执行以下门禁：
1. 遍历 `themes/*/`，运行 `generator.py` 生成双主题 SVG。
2. 校验 `meta.json` 必填字段、`palette` 与全部 14 项 `tokens.{light,dark}` 十六进制色值格式。
3. 校验 `PROMPT.md` 同时包含 `<!-- LANG:EN -->` 与 `<!-- LANG:ZH -->` 块、严格 XML 校验要求及 **零演示数据残留门禁**。
4. 使用 `ET.fromstring` 对全部主题 `assets/*.svg` 做严格 XML 校验并同步至 `web/public/themes/`。
5. 运行 `live-widgets/generate_live_widgets.py --check-all` 校验全部主题 × 活挂件 SVG 并同步脚本与工作流模板。
6. 校验品牌图标一致性：`assets/logo.svg` 与 `web/public/favicon.svg` 逐字节一致。
7. 同步 `skill/gitskins/SKILL.md` 到 `web/public/skill/SKILL.md`。

---

## 5. Prompt Personalization & Zero Demo-Leakage Contract

因为仓库内 `themes/<id>/generator.py` 包含作者的演示数据，为保证外部用户通过 Agent 提示词修改时 100% 替换为个人真实信息，所有主题的 `PROMPT.md` 与 `SKILL.md` 必须强制遵守：
1. **自动识别与兜底**：优先通过 `gh auth status` / `gh api user` / `git config` 获取真实信息；仅在本地无法识别时再询问用户；仓库不足 4 个或无个人官网时自适应精简，严禁填充假项目或保留演示链接。
2. **前后端头像策略一致**：含头像框的主题（`01`、`04` 可选、`05`）必须指引 Agent 下载用户的 `avatar_url?s=96` 并用 Python 下采样量化为 `<path shape-rendering="crispEdges">` 矢量像素肖像，禁止保留演示矩阵或外链 `<image>`；纯排版/印章主题（`02`、`03`、`06`）应明确说明无照片头像并按用户身份定制对应视觉锚点（如 `06` 朱砂印章）。
3. **零演示残留自检门禁**：交付前必须扫描生成的全部 `assets/*.svg` 与 `README.md`，确保不含 `Furina-he`、`NeverGiveUp`、`cloudlink`、`openpet`、`myfurina`、`blessc.com` 等演示残留（仅用户主动勾选的 `Styled with GitSkins` 尾标允许链接至 `gitskins.blessc.com`）。

---

## 6. Brand Icon & Extension Guardrails

- **唯一品牌图标源**：`assets/logo.svg`、`web/public/favicon.svg` 与 `web/src/App.tsx` 中的 `BrandMark` 共享同一套 `64×64` 瑞士包豪斯 4 色块网格几何；修改品牌图标时须三处同步，并同步更新 `assets/repo-hero-{light,dark}.svg` 与 `assets/gitskins-badge-{light,dark}.svg`。
- **CLI 包名约束**：npm 上无作用域包名 `gitskins` 已被第三方项目占用；本仓库 CLI 包名为 `@furina-he/gitskins`（`cli/package.json`），文档与工坊演示统一使用 `node cli/gitskins.mjs ...`。
- **新增主题 / 挂件完整联动清单**：请对照 [AGENTS.md](../AGENTS.md) 与 [CONTRIBUTING.md](../CONTRIBUTING.md) 逐项勾核，确保主题、挂件、活挂件、CLI、工坊前端与双语 README 全部同步。
