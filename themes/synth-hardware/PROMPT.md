<!-- LANG:EN -->
Redesign my GitHub Profile README (`<my-username>/<my-username>`) using the **Tactile Industrial Synth** theme from GitSkins.

### Reference Blueprint
- Visual spec: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/synth-hardware/SPEC.md
- Reference SVG generator: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/synth-hardware/generator.py

### Execution Steps
1. **Auto-detect my GitHub identity**: Use `gh auth status` / `gh api user` (or `git config`) to read my real username, display name, bio, public repositories, total stars, primary languages, releases, and live websites. Only ask me if no GitHub account can be detected locally.
2. **Curate factual content (never reuse demo entries)**: Select up to 4 of my flagship repositories (adapt layout cleanly if I have fewer than 4 repos, and omit website buttons if I have no live domains — verify every live URL returns HTTP 200). Compute all 4 rotary-dial/patchbay KPI meters (`REPOS`, `STARS`, `LIVE`, `STACK`) from my real GitHub profile. Never fabricate metrics.
3. **Generate the Tactile Industrial Synth SVG suite & personalize hardware markings**:
   - Follow `SPEC.md` and rewrite `generator.py` with my real data to output paired Light (anodized aluminum) and Dark (matte Elektron charcoal) SVGs into `assets/`: `846x300` Hero chassis with corner hex screws, top silkscreen status bar, recessed OLED readout strip, 4 KPI dial meters, circular perforated speaker grill, animated AMOLED oscilloscope (`prefers-reduced-motion` guarded), and 4 color-coded rotary encoders; `height="30"` tactile LED keycap buttons (`[CH.1]`–`[CH.4]`); `846x40` brushed metal rack section dividers; and `2x2` Eurorack modular project cards (`417x196`) with `IN / OUT` patch jacks and mini rotary dials.
   - **Pure Hardware Visual Anchor (No Photo Portrait)**: Keep the pure hardware instrument layout without embedding a photo portrait. Instead, personalize the chassis silkscreen channel code (e.g., `OP-<MY-INITIALS> // FIELD SYNTH · CH-01`), OLED telemetry string, and the 4 rotary encoder parameter labels/angles to reflect my engineering focus.
   - Add `.github/workflows/snake.yml` or GitSkins Zero-503 Live Widgets if appropriate.
4. **Validate Strict XML, Verify Zero Demo-Data Leakage & Ship**:
   - Run strict XML validation on every generated SVG (zero `<script>`, zero `on*=` handlers, zero external `<image href="http...">`, zero `@import` web fonts, and every `@keyframes` wrapped in `@media (prefers-reduced-motion: reduce)`).
   - **Zero Demo-Data Leakage Check**: Scan every generated `assets/*.svg` and `README.md` to confirm zero leftover demo strings (`Furina-he`, `NeverGiveUp`, `cloudlink`, `openpet`, `myfurina`, `blessc.com` — except `gitskins.blessc.com` if I opt into the optional `Styled with GitSkins` footer badge).
   - Inspect `846px` Light/Dark contrast and monospace spacing headroom, wire `<picture>` blocks in `README.md`, and push to `<username>/<username>`.

<!-- LANG:ZH -->
请使用 GitSkins 的 **「工业合成器面板（Tactile Industrial Synth）」** 主题，帮我设计并更新我的 GitHub 个人主页（`<我的用户名>/<我的用户名>` 仓库）。

### 主题参考规范
- 视觉规范：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/synth-hardware/SPEC.md
- SVG 参考生成器：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/synth-hardware/generator.py

### 执行要求
1. **自动识别我的 GitHub 账号**：优先通过本地 `gh auth status` / `gh api user`（或 `git config`）读取我的真实用户名、昵称、简介、公开仓库、总 Star 数、常用语言与官网链接；仅当本地无法识别账号时再询问我。
2. **基于真实项目选材（禁止照搬演示项）**：精选我最具代表性的 4 个项目（不足 4 个按真实数量排版，若无个人官网则自动省略外链按键；保留的外链需验证可访问），左侧 4 组旋钮仪表指标（`REPOS`、`STARS`、`LIVE`、`STACK`）必须严格基于我的真实仓库统计，绝不编造虚假数据。
3. **生成工业合成器双主题 SVG 并定制面板丝印参数**：
   - 参考 `SPEC.md` 并基于我的真实信息改写 `generator.py`，生成完整的 Light（阳极氧化铝机身）与 Dark（Elektron 哑光黑机箱）双主题 SVG 至 `assets/`：`846×300` 合成器主面板（含四角内六角螺丝、顶部丝印状态条、内嵌 OLED 状态条、4 路旋钮 KPI 仪表、圆形穿孔扬声器点阵、带 `prefers-reduced-motion` 保护的 OLED 示波屏与 4 颗四色旋钮编码器）、`height="30"` 发光 LED 机械键帽按钮、`846×40` 金属机架分隔条，以及 2×2 Eurorack 模块化项目面板卡（`417×196`，带 `IN / OUT` 3.5mm 跳线孔与微型旋钮表盘）。
   - **纯硬件工业视觉锚点（无需照片头像）**：本套主题采用纯硬件乐器工业美学，不嵌入照片头像；请结合我的名字缩写、主攻方向定制机身顶部通道代号（如 `OP-<缩写> // FIELD SYNTH · CH-01`）、OLED 遥测状态行以及 4 颗旋钮的参数丝印与刻度角度。
   - 如合适可配套 `.github/workflows/snake.yml` 或 GitSkins 零 503 活挂件。
4. **严格 XML 校验、零演示数据残留门禁检查后推送**：
   - 确认全部 SVG 通过严格 XML 解析校验（零 `<script>`、零 `on*=` 事件、零外链 `<image href="http...">`、零 `@import` 字体，且所有 `@keyframes` 必须配有 `@media (prefers-reduced-motion: reduce)` 保护）。
   - **零演示数据残留门禁**：交付前全局扫描生成的全部 `assets/*.svg` 与 `README.md`，确认绝对不包含任何模板演示残留字符串（`Furina-he`、`NeverGiveUp`、`cloudlink`、`openpet`、`myfurina`、`blessc.com`；仅可选的 `Styled with GitSkins` 尾标允许指向 `gitskins.blessc.com`）。
   - 检查 `846px` 深浅对比度与等宽字体余量无重叠截断，用 `<picture>` 写入 `README.md` 并推送至我的同名主页仓库。
