<!-- LANG:EN -->
Redesign my GitHub Profile README (`<my-username>/<my-username>`) using the **Swiss-Bauhaus Pixel Poster** theme from GitSkins.

### Reference Blueprint
- Visual spec: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/swiss-bauhaus-pixel/SPEC.md
- Reference SVG generator: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/swiss-bauhaus-pixel/generator.py

### Execution Steps
1. **Auto-detect my GitHub identity**: Check `gh auth status` / `gh api user` (or `git config`) to get my GitHub username, display name, bio, avatar image, public repositories, stars, releases, and live websites. Only ask me if no GitHub account is detected locally.
2. **Select real content**: Pick my top 4 flagship repositories (or fewer if I have fewer) and verify any live site URLs before linking them. Never invent fake metrics, websites, or claims.
3. **Adapt the theme to me**:
   - Follow `SPEC.md` and adapt `generator.py` to produce a complete Light & Dark SVG suite (`assets/`): split Hero poster (`846x294`) with my handle in 9-row pixel display glyphs, a custom `28x28` blinking pixel portrait drawn from my real GitHub avatar, 4 factual pixel metrics, sharp `0px` action buttons, section dividers, and flush `2x2` weave-topped project cards with bespoke `16x16` pixel emblems.
   - Tune the Hero right-field weave accent to harmonize with my avatar/brand palette while preserving the Swiss-Bauhaus `0px` crisp geometry.
   - Include a daily GitHub contribution snake workflow (`.github/workflows/snake.yml`) unless I already have a preferred telemetry widget.
4. **Validate & Visually Inspect**: Parse every SVG as strict XML, render both Light and Dark previews at `846px` width to fix any text overflow, cursor misalignment, or pill padding issues, then commit and push to my `<username>/<username>` profile repository.

<!-- LANG:ZH -->
请使用 GitSkins 的 **「瑞士包豪斯像素海报（Swiss-Bauhaus Pixel Poster）」** 主题，帮我设计并更新我的 GitHub 个人主页介绍（`<我的用户名>/<我的用户名>` 仓库）。

### 主题参考规范
- 视觉规范：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/swiss-bauhaus-pixel/SPEC.md
- SVG 参考生成器：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/swiss-bauhaus-pixel/generator.py

### 执行要求
1. **自动识别我的 GitHub 账号**：先通过本地 `gh auth status` / `gh api user`（或 `git config`）自动获取我的 GitHub 用户名、昵称、简介、头像以及公开仓库（含描述、语言、Star、Release、官网链接）；仅当本地无法获取账号时再询问我。
2. **基于真实项目选材**：从我的真实仓库中挑选最具代表性的 4 个旗舰项目（并检查官网链接可访问性），所有数字、技术栈与描述必须真实可验证，不编造虚假数据。
3. **按我的风格定制整套双主题 SVG**：
   - 严格参考 `SPEC.md` 并改写 `generator.py`，生成完整的 Light / Dark 双主题 SVG 套件（`assets/`）：`846×294` 分栏海报 Hero（9 行粗体像素大字用户名、按我真实头像绘制的 28×28 柔和眨眼像素肖像、底部 4 栏像素指标）、`0px` 直角快捷按钮、分区标头、以及 2×2 正交编织纹项目海报卡（每张配 16×16 专属像素徽标）。
   - 主强调色可根据我的头像或代表项目色调微调，同时保持瑞士包豪斯 `0px` 直角与 `1px` 实线网格语言。
   - 如合适可一并配置 `.github/workflows/snake.yml` 每日自动更新深/浅色贡献图贪吃蛇。
4. **严格校验后上线**：确保所有 SVG 通过严格 XML 解析，并在 `846px` 宽度下分别预览检查 Light / Dark 渲染效果（无文字溢出、光标位置准确、标签边距均衡），确认无误后推送到我的同名主页仓库。
