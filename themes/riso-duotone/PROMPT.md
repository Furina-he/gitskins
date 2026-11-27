<!-- LANG:EN -->
Redesign my GitHub Profile README (`<my-username>/<my-username>`) using the **Risograph Overprint Poster** theme from GitSkins.

### Reference Blueprint
- Visual spec: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/riso-duotone/SPEC.md
- Reference SVG generator: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/riso-duotone/generator.py

### Execution Steps
1. **Auto-detect my GitHub identity**: Use `gh auth status` / `gh api user` (or `git config`) to read my real username, display name, bio, public repositories, stars, languages, releases, and live URLs. Only ask me if no GitHub account is detected locally.
2. **Curate factual content (never reuse demo entries)**: Pick up to 4 of my flagship repositories (adapt cleanly to 1–3 cards if I have fewer than 4 repos, and omit or adapt website buttons if I have no custom website), verify live URLs return HTTP 200, and compute all 4 print-spec metric columns from my real GitHub profile. Never fabricate metrics.
3. **Generate the Risograph Overprint SVG suite & customize ink plates**:
   - Follow `SPEC.md` and rewrite `generator.py` with my real data to output paired Light (uncoated cream stock, Cobalt × Coral) and Dark (midnight cardstock, Fluorescent Cyan × Pink) SVGs into `assets/`: `846x300` Hero poster with four-corner registration crosshairs (`⊕`), halftone dot screen `<pattern>`, `2.5px` misregistered duotone headline, 4-column print-spec rail, and right-side overprinted geometric Bauhaus/Riso emblem (`prefers-reduced-motion` guarded); `height="30"` misregistered stamp link buttons; `846x40` `+ PLATE 01` / `+ PLATE 02` overprint section bands; and `2x2` art-print project cards (`417x196`) with `3px` colored ink shadows, halftone headers, bold `01`–`04` stamps, and ink-density footers.
   - **Pure Graphic Print Style (No Photo Portrait)**: This theme is pure Risograph poster graphic art by design — do not embed or pixelize a photo portrait. Instead, personalize the right-side overprinted Bauhaus/Riso emblem with my own 2-letter monogram initials, my edition stamp label (e.g., `EDITION 011` or my own edition tag), and optional custom 2-ink plate colors (`Plate A` & `Plate B`) while maintaining `>= 4.5:1` text contrast across Light & Dark modes.
   - Add `.github/workflows/snake.yml` or GitSkins Zero-503 Live Widgets if appropriate.
4. **Validate, Verify Zero Demo Leakage & Ship**:
   - Run strict XML validation on every generated SVG (`xml.etree.ElementTree.fromstring` and `node cli/gitskins.mjs validate ./assets` if available): confirm zero `<script>` tags, zero `on*=` attributes, zero external `<image href="http...">`, zero `@import` web fonts, and `@media (prefers-reduced-motion: reduce)` guarding every `@keyframes`.
   - **Zero Demo-Data Leakage Check**: Scan all generated `assets/*.svg` and `README.md` to confirm zero leftover template strings (`Furina-he`, `NeverGiveUp`, `cloudlink`, `openpet`, `myfurina`, `blessc.com` — except `gitskins.blessc.com` if I opt into the optional `Styled with GitSkins` footer badge).
   - Inspect `846px` Light/Dark contrast, alignment, and monospace headroom, wire `<picture>` blocks in `README.md`, and push to `<username>/<username>`.

<!-- LANG:ZH -->
请使用 GitSkins 的 **「孔版错位叠印海报（Risograph Overprint Poster）」** 主题，帮我设计并更新我的 GitHub 个人主页（`<我的用户名>/<我的用户名>` 仓库）。

### 主题参考规范
- 视觉规范：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/riso-duotone/SPEC.md
- SVG 参考生成器：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/riso-duotone/generator.py

### 执行要求
1. **自动识别我的 GitHub 账号**：优先通过本地 `gh auth status` / `gh api user`（或 `git config`）读取我的真实用户名、昵称、简介、公开仓库、Star、主要语言与官网链接；仅当本地无法获取账号时再询问我。
2. **基于真实项目选材（禁止照搬演示项）**：精选我最具代表性的 4 个项目（不足 4 个按真实数量排版，无个人网站时自动精简或替换为真实仓库/主页按钮），校验官网链接可正常访问，底部 4 栏印刷规格指标严格基于我的真实仓库统计，绝不编造虚假数据。
3. **生成孔版叠印双主题 SVG 并定制双色印版**：
   - 参考 `SPEC.md` 并基于我的真实信息改写 `generator.py`，生成完整的 Light（米白海报纸 · 钴蓝 × 荧光珊瑚红）与 Dark（午夜黑卡纸 · 荧光青 × 霓虹粉）SVG：`846×300` 海报主图（含四角套准十字标 `⊕`、网点半调 `<pattern>`、`2.5px` 错位双色叠印大标题、底部 4 栏印刷指标、右侧几何叠印包豪斯孔版徽标及 `prefers-reduced-motion` 动效保护）、`height="30"` 错位双色印章按钮、`846×40` `+ PLATE 01` / `+ PLATE 02` 叠印章节眉条，以及 2×2 孔版画项目卡（`417×196`，含 `3px` 错位色块阴影、网点头条、`01`–`04` 印号与油墨密度底栏）。
   - **纯图形海报风格（非照片头像）**：本套主题为纯粹的独立孔版海报艺术，无需嵌入或像素化照片头像；请将右侧几何叠印徽标中心定制为我的个人双字母缩写（Monogram）与专属版号印记（Edition Stamp），并可按需定制双色油墨印版配色（Plate A / Plate B），同时保证浅/深色模式下所有文字对比度 `>= 4.5:1`。
   - 如合适可配套 `.github/workflows/snake.yml` 或 GitSkins 零 503 活挂件。
4. **严格校验、零演示残留门禁后推送**：
   - 对全部生成的 SVG 执行严格 XML 校验（`xml.etree.ElementTree.fromstring` 及 `node cli/gitskins.mjs validate`）：确认零 `<script>`、零 `on*=` 事件属性、零外链 `<image href="http...">`、零 `@import` 字体，且所有 `@keyframes` 均包裹 `@media (prefers-reduced-motion: reduce)`。
   - **零演示数据残留门禁**：交付前全局检查生成的全部 `assets/*.svg` 与 `README.md`，确认绝对不包含任何模板演示残留字符串（`Furina-he`、`NeverGiveUp`、`cloudlink`、`openpet`、`myfurina`、`blessc.com`；仅可选的 `Styled with GitSkins` 尾标允许指向 `gitskins.blessc.com`）。
   - 检查 `846px` 深浅渲染对比度、留白与等宽字体余量无重叠截断，用 `<picture>` 写入 `README.md` 并推送至我的同名主页仓库。
