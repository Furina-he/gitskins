# GitSkins Roadmap

GitSkins 正在从「4 套精选 GitHub 主页主题库」演进为 **「面向 AI Agent 与开发者的模块化 GitHub 皮肤与挂件系统」**。  
所有重大功能先在 `docs/` 中沉淀清晰的数据契约与视觉规范，再落地生成器与展示站实现。

---

## v0.1 — Foundation & Curated Themes（已上线）

- [x] 4 套独立美学的 Light / Dark 双主题 SVG 皮肤：
  - `01` Swiss-Bauhaus Pixel Poster（瑞士包豪斯像素海报）
  - `02` Architectural Blueprint CAD（工程蓝图 CAD 制图）
  - `03` Editorial Broadsheet Zine（瑞士报刊杂志排版）
  - `04` Retro CRT Terminal TUI（复古终端 TUI 仪表盘）
- [x] 每套主题独立自包含目录（`meta.json` / `SPEC.md` / `PROMPT.md` / `generator.py` / `README.demo.md`）
- [x] `scripts/build_all.py` 自动化构建、严格 XML 校验与 `manifest.json` 同步
- [x] 静态展示站 `gitskins.blessc.com`（846px 仿真预览、中英双语、Quick / Full Agent Prompt 一键复制，部署于 Cloudflare Workers Static Assets）

---

## v0.1.x — 工程规范与令牌底座（前置基建）

> 在引入挂件系统前先通过 `docs/` 统一架构与数据契约，让主题、挂件、前端预览与 Agent Prompt 共享同一事实来源（Single Source of Truth）。

- [x] 建立系统架构与 SVG 兼容性规范（[docs/architecture.md](docs/architecture.md)）
- [x] 编写 DIY 小挂件系统设计规范（[docs/widgets-system.md](docs/widgets-system.md)）
- [x] 定义 **Semantic Theme Token Contract（语义皮肤令牌契约）**：在 `meta.json` 中补充 `tokens.{light,dark}` 语义字段，支撑跨主题挂件自动换肤
- [x] 在 `scripts/build_all.py` 中增加 `meta.json` 与语义令牌的 Schema 校验

---

## v0.2 — DIY Widgets Studio（主题联动小挂件工坊）

> 让用户不再局限于固定模板，而是像搭积木一样自由 DIY、拼装与换肤。

- [x] **Theme-Aware 多形态 4 列 Bento 挂件引擎**：
  - 按 `846px = 204×4 + 10×3` 严丝合缝拆分为 `1 / 2 / 3 / 4` 格 Bento 栅格，统一 `160px` 标准行高，支持多实例任意混拼（`2+1+1`、`1+2+1`、`1+3`、`1+1+1+1`、`2+2`、`4`）彻底消灭单方砖右侧留白
  - 支持 **整行合成 Bento SVG**（多块合并为单张 `846×160` SVG，GitHub README 永不换行错位）与 **幽灵补位槽（Ghost Slot）** / **一键满行组合预设**
  - 所有挂件自动适配 4 大主题皮肤令牌，并支持独立自定义强调色与动效开关
- [x] **首批 8 款纯前端实时 DIY 挂件（零后端成本）**：
  - [x] **像素伴侣 / 代码桌宠**：眨眼、敲代码、喝咖啡等克制 CSS 帧动画 + 自定义台词气泡
  - [x] **Now Playing 磁带 / 黑胶挂件**：自定义最近循环曲目/歌手，带缓速旋转或波形动效
  - [x] **开发者状态牌 / 极客工牌（ID Badge）**：Currently building、所在地与时区、Open to work、分段能量条
  - [x] **主题化技术栈机架（Skill Dock）**：按当前皮肤风格统一重绘技术栈展示，告别风格割裂的第三方徽章
  - [x] **极简语录条 / 终端名言条幅（Manifesto Banner）**
  - [x] **Hero 角落动态贴纸 / 扒边挂坠（Overlay Sticker）**：支持直接合成进 `hero-{light,dark}.svg` 四角（扒边像素猫 / 旋转印章 / 热气咖啡 / 脉冲雷达）或导出右侧浮动贴片
  - [x] **像素巡逻跑道 / LED 跑马灯分割线（Animated Runway）**：`846×48` 像素小宠整行巡逻、复古滚动字幕与示波器波形
  - [x] **迷你动态小方砖（Mini Bento Tile）**：`204×204` 像素咖啡杯 / 雨雪天气窗 / 沙漏 / 迷你频谱，支持 4 联并排或 `<img align="right">` 文字右侧浮动
- [x] **自由挂载位置与两条无缝使用路径**：
  - [x] **5 个自由插槽**：支持将挂件任意放置到 `Hero 顶部`、`叠在 Hero 上`、`Hero 下方`、`项目卡下方`、`最底部`
  - [x] **单挂件独立工坊**：网页端调参 → 实时 Light / Dark 预览 → 一键下载双主题 SVG（及合成版 Hero SVG）+ 复制 `<picture>` / 右侧浮动 Markdown，或复制单挂件 Agent 提示词
  - [x] **主题 + 挂件「装机清单（Loadout Builder）」**：在 846px 预览舞台分插槽实时预览、排序与切位，右侧动态实时拼装组合 Agent Prompt
- [x] 更新 [CONTRIBUTING.md](CONTRIBUTING.md) 明确主题与 DIY 挂件双贡献路径，降低社区 PR 门槛

---

## v0.3 — 真身实时预览 & 参数化提示词引擎

> 规范文档：[docs/profile-preview.md](docs/profile-preview.md)

- [x] **Try with Your GitHub（输入用户名实时预览）**：
  - 在预览舞台顶部输入任意 GitHub 用户名，前端直连公开 GitHub REST API（无需登录、零后端）
  - 实时将 Hero 与 Top 2 / 4 / 6 项目卡片替换为访客自己的像素化头像、昵称、简介与真实公开仓库
- [x] **免 Agent 一键打包导出（ZIP）**：
  - 直接将前端渲染好的个人专属 Light / Dark SVG 套件（含合成版 Hero 贴纸与全部挂载挂件）与 `README.md` 打包下载，覆盖无 AI 编程工具的普通开发者
- [x] **参数化微调器（Parametric Prompt Builder）**：
  - 支持在 Inspector 中微调主强调色（Accent Override）、项目卡片数量（2 / 4 / 6）、动效强度（克制动效 / 纯静态）与文案语言（EN / 中文 / 双语）
  - 改动实时反映到预览画面，并自动序列化为参数块注入右侧 Agent Prompt

---

## v0.4 — GitHub Actions 定时「活挂件」（零 503 动态数据套件）

> 规范文档：[docs/live-widgets.md](docs/live-widgets.md)  
> 替代容易限流、503 且风格不统一的第三方在线统计卡片：由用户仓库内的 GitHub Actions 定时运行同款 Python 脚本生成并提交 SVG，零服务器维护成本、稳定可用且 100% 匹配 GitSkins 皮肤风格。

- [x] 标准化零依赖 Python 活挂件生成器（`live-widgets/generate_live_widgets.py`）与 `.github/workflows/gitskins-widgets.yml` 模板，自动接入 `build_all.py` 32 张严格 XML 校验与一键 ZIP 打包
- [x] 首批 4 款主题联动活挂件（`L01`–`L04`，支持 4 列 Bento 栅格与网页工坊 Workflow YAML 导出）：
  - [x] **同皮肤 GitHub 统计仪表盘（`L01`）**（Stars / Repos / Followers / Merged PRs / 语言分布条）
  - [x] **编码作息分布图（`L02`）**（24 小时提交热力柱 + 早鸟 / 夜猫子作息标签）
  - [x] **最近博客 / RSS 动态列表（`L03`）**（零依赖 XML 解析 RSS 2.0 / Atom 订阅源最新 3 篇）
  - [x] **城市像素天气窗（`L04`）**（免费免 Key 接入 Open-Meteo 实时气温，自动切换晴 / 多云 / 雨 / 雪像素动画）
- [x] 第二批扩展活挂件（`L05`–`L06`）：
  - [x] **WakaTime 7 天编程时长雷达（`L05`）**（可选 `WAKATIME_API_KEY` Secret，自动同步总时长 / 日均 / 编辑器 / 语言占比）
  - [x] **Spotify 最近循环黑胶（`L06`）**（可选 Spotify OAuth Refresh Token Secrets，同步正在听或最近单曲 + 旋转黑胶动效）

---

## v0.5 — 生态扩展：仓库 README 皮肤 & Agent Skill / CLI

> 规范文档：[docs/repo-skins.md](docs/repo-skins.md)

- [x] **Repo Skins（开源项目仓库 README 皮肤）**：
  - 将同一套 4 大视觉体系延伸到项目仓库：Project Hero Banner（`846×248`）、快速安装命令条（`846×72`）、特性卡片矩阵（`417×152`）与架构流程图（`846×168`）
  - 支持公开 GitHub 仓库（`owner/repo`）零后端实时拉取、一键复制仓库 Agent 提示词与一键打包仓库 ZIP
- [x] **Agent-Native 分发升级**：
  - 提供标准 Agent Skill（[skill/gitskins/SKILL.md](skill/gitskins/SKILL.md)，同步上线 `/skill/SKILL.md`）
  - 提供零依赖 Node 18+ CLI（[cli/gitskins.mjs](cli/gitskins.mjs)：`list` / `init --mode repo|profile` / `validate`），让 Claude Code / Codex / Cursor / Antigravity 直接拉取规范、脚手架生成并严格校验 SVG
- [x] 提供可选的极简 `Styled with GitSkins` 尾标挂件（`216×32` 双主题同皮肤适配，支持主页与仓库 README 自由开关）
- [x] **持续扩充主题与社区共创（v0.6）**：
  - [x] 新增 `05` **16-bit Pixel RPG HUD（16-bit 像素 RPG 冒险面板）** — 阶梯像素边框、HP/MP/XP 分段槽与任务卷轴卡片（22 张双主题 SVG + 全套挂件 & 仓库皮肤联动）
  - [x] 新增 `06` **Seal Ink Monograph（东方印章水墨卷轴）** — 暖调宣纸/端砚墨黑、朱砂雕刻方印、回纹角饰与远山叠墨层次（22 张双主题 SVG + 全套挂件 & 仓库皮肤联动）
  - [ ] 社区主题共建：欢迎通过 [CONTRIBUTING.md](CONTRIBUTING.md) PR 投稿更多高辨识度皮肤（如 Bento Grid、Cyberpunk Wireframe 等）

---

## 里程碑优先级原则

1. **保持纯静态与零运维**：核心展示站、DIY 工坊、实时预览均在浏览器端完成，动态数据优先通过用户侧 GitHub Actions 闭环，不引入重后端。
2. **严守 846px & Light/Dark 双主题纪律**：所有新主题与新挂件必须同时通过浅色/深色对比度、严格 XML 校验与 `prefers-reduced-motion` 检查。
3. **Agent 与普通用户双兼容**：既能让 AI 编程 Agent 一键全自动生成整页，也能让普通访客所见即所得地单挑一个小挂件直接带走。
