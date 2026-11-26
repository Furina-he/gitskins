<!-- LANG:EN -->
Redesign my GitHub Profile README (`<my-username>/<my-username>`) using the **Retro CRT Terminal TUI** theme from GitSkins.

### Reference Blueprint
- Visual spec: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/crt-terminal/SPEC.md
- Reference SVG generator: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/crt-terminal/generator.py

### Execution Steps
1. **Auto-detect my GitHub identity**: Check `gh auth status` / `gh api user` (or `git config`) for my username, display name, bio, public repositories, stars, releases, and live websites. Only ask me if no GitHub account is detected locally.
2. **Use real profile telemetry**: Pick my top 4 flagship projects, verify live links return HTTP 200, and fill the `neofetch` readout with factual repo stats and tech stack.
3. **Generate the Terminal TUI SVG suite**:
   - Follow `SPEC.md` and adapt `generator.py` to emit paired Light (Solarized Paper Terminal) and Dark (Phosphor CRT Terminal) SVGs in `assets/`: `846x306` split `tmux` Hero with a custom pixel monogram for my initials, `$ whoami` blinking cursor, `neofetch` key-value panel, 8-swatch ANSI palette bar, and `tmux` status bar; CLI command buttons; shell-prompt section dividers; and `2x2` numbered `tmux` project panes (`[1]`–`[4]`).
   - Add `.github/workflows/snake.yml` if appropriate for daily contribution tracking.
4. **Validate & Visually Inspect**: Parse all SVGs as strict XML, visually verify Light & Dark renders at `846px` width for clean monospace alignment, then commit and push to `<username>/<username>`.

<!-- LANG:ZH -->
请使用 GitSkins 的 **「复古终端 TUI 仪表盘（Retro CRT Terminal TUI）」** 主题，帮我设计并更新我的 GitHub 个人主页介绍（`<我的用户名>/<我的用户名>` 仓库）。

### 主题参考规范
- 视觉规范：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/crt-terminal/SPEC.md
- SVG 参考生成器：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/crt-terminal/generator.py

### 执行要求
1. **自动识别我的 GitHub 账号**：优先通过本地 `gh auth status` / `gh api user`（或 `git config`）获取我的用户名、昵称、简介及公开仓库信息（描述、语言、Star、Release、官网）；仅当无法自动获取时再询问我。
2. **数据完全真实**：精选我的 4 个代表仓库，校验官网链接可访问性，`neofetch` 信息栏与技术栈均基于真实数据填写。
3. **定制深浅双主题终端 SVG**：
   - 参考 `SPEC.md` 并改写 `generator.py`，生成完整的 Light（Solarized 纸感终端）与 Dark（荧光绿 CRT 终端）SVG 套件：`846×306` tmux 双栏分屏 Hero（按我用户名首字母定制的像素徽记、`$ whoami` 慢闪光标、`neofetch` 系统面板、ANSI 8 色标条与底部 tmux 状态栏）、命令行快捷按钮、Shell 分节头，以及 2×2 编号 tmux 项目子面板（`[1]`–`[4]`）。
   - 如合适可配套 `.github/workflows/snake.yml` 每日更新贡献图。
4. **校验后发布上线**：全部 SVG 通过严格 XML 解析，并在 `846px` 宽度下检查 Light / Dark 渲染无对齐偏差与溢出后，推送至我的同名主页仓库。
