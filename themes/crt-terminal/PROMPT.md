<!-- LANG:EN -->
Redesign my GitHub Profile README (`<my-username>/<my-username>`) using the **Retro CRT Terminal TUI** theme from GitSkins.

### Reference Blueprint
- Visual spec: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/crt-terminal/SPEC.md
- Reference SVG generator: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/crt-terminal/generator.py

### Execution Steps
1. **Auto-detect my GitHub identity**: Check `gh auth status` / `gh api user` (or `git config`) for my username, display name, bio, `avatar_url`, public repositories, stars, releases, and live websites. Only ask me if no GitHub account is detected locally.
2. **Use real profile telemetry (never reuse demo entries)**: Pick up to 4 of my flagship projects (adapt cleanly if I have fewer), verify live links return HTTP 200, and fill the `neofetch` readout with factual repo stats and tech stack.
3. **Generate the Terminal TUI SVG suite**:
   - Follow `SPEC.md` and rewrite `generator.py` with my real data to emit paired Light (Solarized Paper Terminal) and Dark (Phosphor CRT Terminal) SVGs in `assets/`: `846x306` split `tmux` Hero with `$ whoami` blinking cursor, `neofetch` key-value panel, 8-swatch ANSI palette bar, and `tmux` status bar; CLI command buttons; shell-prompt section dividers; and `2x2` numbered `tmux` project panes (`[1]`–`[4]`).
   - **Left Identity Pane (Avatar or Initials)**: Either downsample & color-quantize my real GitHub `avatar_url` (`?s=96`) into a crisp `24x24` `<path shape-rendering="crispEdges">` pixel portrait (matching the GitSkins Web Studio live preview), or render a custom pixel monogram of my actual initials — never leave the demo `FH` monogram.
   - Add `.github/workflows/snake.yml` or GitSkins Zero-503 Live Widgets if appropriate.
4. **Validate, Verify Zero Demo Leakage & Ship**:
   - Parse all SVGs as strict XML (zero `<script>`, zero external `<image href="http...">`, `prefers-reduced-motion` guarded).
   - **Zero Demo-Data Leakage Check**: Scan all generated `assets/*.svg` and `README.md` to confirm zero leftover template strings (`Furina-he`, `NeverGiveUp`, `cloudlink`, `openpet`, `myfurina`, `blessc.com` — except `gitskins.blessc.com` if I opt into the optional `Styled with GitSkins` footer badge).
   - Visually verify Light & Dark renders at `846px` width for clean monospace alignment, then commit and push to `<username>/<username>`.

<!-- LANG:ZH -->
请使用 GitSkins 的 **「复古终端 TUI 仪表盘（Retro CRT Terminal TUI）」** 主题，帮我设计并更新我的 GitHub 个人主页介绍（`<我的用户名>/<我的用户名>` 仓库）。

### 主题参考规范
- 视觉规范：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/crt-terminal/SPEC.md
- SVG 参考生成器：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/crt-terminal/generator.py

### 执行要求
1. **自动识别我的 GitHub 账号**：优先通过本地 `gh auth status` / `gh api user`（或 `git config`）获取我的用户名、昵称、简介、`avatar_url` 头像及公开仓库信息（描述、语言、Star、Release、官网）；仅当无法自动获取时再询问我。
2. **数据完全真实（禁止照搬演示项）**：精选我的 4 个代表仓库（不足 4 个按真实数量排版），校验官网链接可访问性，`neofetch` 信息栏与技术栈均基于真实数据填写。
3. **定制深浅双主题终端 SVG**：
   - 参考 `SPEC.md` 并基于我的真实信息改写 `generator.py`，生成完整的 Light（Solarized 纸感终端）与 Dark（荧光绿 CRT 终端）SVG 套件：`846×306` tmux 双栏分屏 Hero（`$ whoami` 慢闪光标、`neofetch` 系统面板、ANSI 8 色标条与底部 tmux 状态栏）、命令行快捷按钮、Shell 分节头，以及 2×2 编号 tmux 项目子面板（`[1]`–`[4]`）。
   - **左侧身份窗格（真实像素头像或首字母徽记）**：与 GitSkins 在线工坊保持一致，优先将我真实的 GitHub `avatar_url`（`?s=96`）用 Python 下采样量化为清晰的 `24×24` 矢量像素肖像（`<path shape-rendering="crispEdges">`），或按我自己的用户名首字母绘制像素徽记，严禁保留演示用的 `FH` 字母。
   - 如合适可配套 `.github/workflows/snake.yml` 或 GitSkins 零 503 活挂件。
4. **校验、零演示残留检查后发布上线**：
   - 全部 SVG 通过严格 XML 解析（零 `<script>`、零外链 `<image>`、含 `prefers-reduced-motion` 保护）。
   - **零演示数据残留门禁**：交付前全局检查生成的全部 `assets/*.svg` 与 `README.md`，确认绝对不包含任何模板演示残留字符串（`Furina-he`、`NeverGiveUp`、`cloudlink`、`openpet`、`myfurina`、`blessc.com`；仅可选的 `Styled with GitSkins` 尾标允许指向 `gitskins.blessc.com`）。
   - 在 `846px` 宽度下检查 Light / Dark 渲染无对齐偏差与溢出后，推送至我的同名主页仓库。
