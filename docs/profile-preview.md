# Live GitHub Preview, Parametric Overrides & ZIP Export

本文档定义 GitSkins `v0.3` 的核心能力约束：前端真身实时预览、参数化提示词微调器与免 Agent 一键打包导出。

---

## 1. Try with Your GitHub（零后端真身预览）

### Data Fetching Contract
- 输入任意 GitHub 用户名（支持自动去除前导 `@` 与空白），浏览器端直连公开 GitHub REST API（无需登录、无服务端中转）：
  - `GET https://api.github.com/users/{username}`
  - `GET https://api.github.com/users/{username}/repos?per_page=30&sort=updated`
- **选仓排序**：优先过滤非 Fork 仓库（若全部为 Fork 则回退展示全部），按 `stargazers_count` 与近期活跃度综合排序，截取前 6 个供 `2 / 4 / 6` 卡片档位实时切换。
- **像素肖像生成**：通过 `avatars.githubusercontent.com` CORS 加载用户头像，在浏览器离屏 `24×24` Canvas 采样并色阶量化为纯矢量 `<path shape-rendering="crispEdges">`（零外部 `<image>` 外链，100% 兼容 GitHub Camo）；若离线或跨域失败，自动降级为几何首字母像素徽记。
- **状态与缓存**：同一会话内按小写用户名内存缓存请求结果，显式区分 `loading` / `not-found (404)` / `rate-limited (403)` / `network-error` 状态，并随时支持一键恢复默认演示（`@Furina-he`）。

---

## 2. Parametric Overrides（参数化微调器）

在主题 Inspector 中提供 4 项轻量参数微调，所有改动**同时驱动前端预览与右侧 Agent Prompt**：

| Parameter | Options | Preview Effect | Prompt Injection |
| :--- | :--- | :--- | :--- |
| `accentOverride` | `""`（跟随皮肤）或任意 `#RRGGBB` | 实时覆盖主题 `tokens.accent` 并自动计算高对比 `accentFg`，同步作用于 Hero、按钮、项目卡与未单独覆色的挂件 | 写入 `Accent Override: #RRGGBB` |
| `cardCount` | `2` / `4` / `6` | 实时增减项目卡片网格数量 | 写入 `Flagship Project Cards: N` |
| `animated` | `true` / `false` | 控制 SVG 内联 CSS `@keyframes` 开关 | 写入 `Motion: calm / static` |
| `copyLang` | `"auto"` / `"en"` / `"zh"` / `"bilingual"` | 传递给 Agent 决定主页文案语言 | 写入 `README Copy Language` |

- **零退化原则**：当未输入自定义用户名且所有参数为默认值时，主舞台继续直接展示 `themes/<id>/assets/*.svg` 原始手工静态稿。

---

## 3. Zero-Agent ZIP Bundle Export

提供零依赖纯前端 ZIP 打包器（标准 STORE ZIP + CRC-32 校验），一键导出可直接推入 `<username>/<username>` 仓库的完整目录：

```text
gitskins-<username>-<theme-id>.zip
├── README.md                          # 含 <picture> 深浅双主题标签、按钮、项目卡与按插槽挂载的挂件
└── assets/
    ├── hero-light.svg                 # 若挂载了 Hero 角落贴纸，自动输出合并后的单文件 Hero SVG
    ├── hero-dark.svg
    ├── btn-*-{light,dark}.svg
    ├── sec-work-{light,dark}.svg
    ├── sec-activity-{light,dark}.svg
    ├── card-*-{light,dark}.svg
    └── widget-*-{light,dark}.svg      # 所有非 hero-overlay 挂载挂件的双主题 SVG
```

所有写入 ZIP 的 SVG 均须通过严格 XML 校验（`DOMParser("image/svg+xml")`）。
