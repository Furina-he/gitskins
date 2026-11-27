<!-- LANG:EN -->
Redesign my GitHub Profile README (`<my-username>/<my-username>`) using the **Classic Desktop OS** theme from GitSkins.

### Reference Blueprint
- Visual spec: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/classic-desktop-os/SPEC.md
- Reference SVG generator: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/classic-desktop-os/generator.py

### Execution Steps
1. **Auto-detect my GitHub identity**: Use `gh auth status` / `gh api user` (or `git config`) to read my real username, display name, bio, `avatar_url`, public repos, stars, primary languages, releases, and live website URLs. Only ask me if no GitHub account is detected locally.
2. **Select real desktop apps (never reuse demo entries)**: Pick up to 4 of my flagship repositories (adapt cleanly if I have fewer than 4 repos or no personal website), verify any live links return HTTP 200, and compute all memory/disk stat bars and Finder item counts directly from my real GitHub data. Never fabricate stats.
3. **Generate the Classic Desktop OS SVG suite & pixelize my real avatar**:
   - Follow `SPEC.md` and rewrite `generator.py` with my real data to output paired Light (Macintosh System 7 / Platinum) and Dark (NeXTSTEP Midnight Workstation) SVGs into `assets/`: `846x300` Hero desktop with 1-bit Bayer dot-dither backdrop, top OS menu bar, `About This Developer` window with 6-line pin-stripe titlebar, close box, hard `3px` shadow, and 4 classic memory/disk bars; double-border default-action and bevelled OS push buttons (`height="30"`); Finder folder section strips (`846x40`); and `2x2` mini app-window cards (`417x196`) with pin-stripe titlebars, bottom-right resize grip lines, and bespoke `12x12` pixel app icons tailored to my projects.
   - **Real Avatar in `About This Developer` Portrait Slot**: Matching the GitSkins Web Studio live preview, download my real GitHub `avatar_url` (`?s=96`) and programmatically downsample + color-quantize it (e.g. via Python `Pillow` or stdlib script) into a crisp `24x24` `<path shape-rendering="crispEdges">` vector portrait inside the right-hand framed portrait slot of the `About This Developer` window (fall back to a classic OS pixel emblem only if no avatar is available). Keep any cursor/blink `@keyframes` guarded with `@media (prefers-reduced-motion: reduce)`.
   - Add `.github/workflows/snake.yml` or GitSkins Zero-503 Live Widgets if appropriate.
4. **Validate, Verify Zero Demo Leakage & Ship**:
   - Parse every SVG with strict XML validation (zero `<script>`, zero `on*=` handlers, zero external `<image href="http...">`, and `prefers-reduced-motion` guarded).
   - **Zero Demo-Data Leakage Check**: Scan all generated `assets/*.svg` and `README.md` to confirm zero leftover demo/template strings (`Furina-he`, `NeverGiveUp`, `cloudlink`, `openpet`, `myfurina`, `blessc.com` — except `gitskins.blessc.com` if I opt into the optional `Styled with GitSkins` footer badge).
   - Verify `846px` Light/Dark contrast and readability with zero overlap, wire `<picture>` blocks in `README.md`, and push to `<username>/<username>`.

<!-- LANG:ZH -->
请使用 GitSkins 的 **「经典桌面窗口 OS（Classic Desktop OS）」** 主题，帮我设计并更新我的 GitHub 个人主页（`<我的用户名>/<我的用户名>` 仓库）。

### 主题参考规范
- 视觉规范：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/classic-desktop-os/SPEC.md
- SVG 参考生成器：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/classic-desktop-os/generator.py

### 执行要求
1. **自动识别我的 GitHub 账号**：优先通过本地 `gh auth status` / `gh api user`（或 `git config`）读取我的真实用户名、昵称、简介、`avatar_url` 头像、公开仓库、Star、主要语言、Release 与官网链接；仅当本地无法获取账号时再询问我。
2. **基于真实项目选材（禁止照搬演示项）**：挑选我最具代表性的 4 个旗舰项目（不足 4 个或无独立网站时按真实情况优雅排版），校验官网链接可访问，所有底部内存/磁盘状态条与 Finder 项数均基于我的真实数据计算，绝不编造虚假指标。
3. **生成经典桌面双主题 SVG 套件并嵌入真实像素头像**：
   - 参考 `SPEC.md` 并基于我的真实信息改写 `generator.py`，在 `assets/` 中生成完整的 Light（经典 Macintosh System 7 / Platinum 浅灰桌面）与 Dark（NeXTSTEP 午夜工作站深灰窗口）双主题 SVG：`846×300` 桌面主图（1-bit 点阵抖动壁纸、顶部系统菜单栏、带 6 道水平条纹标题栏与关闭方框及硬边 `3px` 阴影的 `About This Developer` 窗口、底部 4 栏内存/磁盘进度条）；双线默认按钮与立体像素按钮（`height="30"`）；Finder 文件夹条纹分区条（`846×40`）；以及 2×2 迷你应用窗口项目卡（`417×196`，含条纹标题栏、右下角缩放斜纹与贴合各项目的 `12×12` 像素应用图标）。
   - **真实头像像素化放入 `About This Developer` 肖像框**：与 GitSkins 在线工坊保持一致，下载我真实的 GitHub `avatar_url`（加 `?s=96`），用 Python 下采样并量化配色为清晰的 `24×24` 矢量像素肖像（`<path shape-rendering="crispEdges">`）放入 `About This Developer` 窗口右侧头像框（仅在无法拉取头像时回退到经典系统像素图标），并确保光标/眨眼 `@keyframes` 动效全部包含 `@media (prefers-reduced-motion: reduce)` 保护。
   - 如合适可配套 `.github/workflows/snake.yml` 或 GitSkins 零 503 活挂件。
4. **严格校验、零演示数据残留检查后推送**：
   - 确认全部 SVG 通过严格 XML 校验（零 `<script>`、零 `on*=` 事件属性、零外链 `<image href="http...">`、内置 `prefers-reduced-motion` 保护）。
   - **零演示数据残留检查**：交付前全局扫描生成的全部 `assets/*.svg` 与 `README.md`，确认绝对不包含任何模板演示残留字符串（`Furina-he`、`NeverGiveUp`、`cloudlink`、`openpet`、`myfurina`、`blessc.com`；仅可选的 `Styled with GitSkins` 尾标允许指向 `gitskins.blessc.com`）。
   - 检查 `846px` 宽度下深浅渲染清晰无重叠、对比度达标，用 `<picture>` 写入 `README.md` 并推送至我的同名主页仓库。
