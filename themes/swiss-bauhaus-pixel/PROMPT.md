<!-- LANG:EN -->
Redesign my GitHub Profile README (`<my-username>/<my-username>`) using the **Swiss-Bauhaus Pixel Poster** theme from GitSkins.

### Reference Blueprint
- Visual spec: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/swiss-bauhaus-pixel/SPEC.md
- Reference SVG generator: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/swiss-bauhaus-pixel/generator.py

### Execution Steps
1. **Auto-detect my GitHub identity**: Check `gh auth status` / `gh api user` (or `git config`) to get my GitHub username, display name, bio, `avatar_url`, public repositories, stars, releases, and live websites. Only ask me if no GitHub account is detected locally.
2. **Select real content (never reuse demo entries)**: Pick up to 4 of my flagship repositories (or fewer if I have fewer — adapt the layout cleanly instead of padding with fake repos) and verify any live site URLs before linking them. Never invent metrics, websites, or claims.
3. **Adapt the theme & pixelize my real avatar**:
   - Follow `SPEC.md` and rewrite `generator.py` with my data to produce a complete Light & Dark SVG suite (`assets/`): split Hero poster (`846x294`) with my handle in 9-row pixel display glyphs, 4 factual pixel metrics, sharp `0px` action buttons, section dividers, and flush `2x2` weave-topped project cards with bespoke `16x16` pixel emblems.
   - **Real Avatar Pixel Portrait**: Download my actual GitHub `avatar_url` (with `?s=96`) and programmatically downsample + color-quantize it (e.g. via Python `Pillow` or stdlib PNG decoder) into a crisp `24x24` or `28x28` `<path shape-rendering="crispEdges">` pixel portrait with a calm blink animation (`@media (prefers-reduced-motion: reduce)`). Do NOT keep the author's demo portrait matrix or hand-draw a crude generic face.
   - Tune the Hero right-field weave accent to harmonize with my avatar/brand palette while preserving the Swiss-Bauhaus `0px` crisp geometry.
   - Include a daily GitHub contribution snake workflow (`.github/workflows/snake.yml`) or GitSkins Zero-503 Live Widgets if appropriate.
4. **Validate, Verify Zero Demo Leakage & Ship**:
   - Parse every SVG as strict XML (zero `<script>`, zero external `<image href="http...">`, `prefers-reduced-motion` guarded).
   - **Zero Demo-Data Leakage Check**: Scan all generated `assets/*.svg` and `README.md` to confirm zero leftover template strings (`Furina-he`, `NeverGiveUp`, `cloudlink`, `openpet`, `myfurina`, `blessc.com` — except `gitskins.blessc.com` if I opt into the optional `Styled with GitSkins` footer badge).
   - Visually inspect both Light and Dark renders at `846px` width to fix any text overflow, cursor misalignment, or pill padding issues, then commit and push to my `<username>/<username>` profile repository.

<!-- LANG:ZH -->
请使用 GitSkins 的 **「瑞士包豪斯像素海报（Swiss-Bauhaus Pixel Poster）」** 主题，帮我设计并更新我的 GitHub 个人主页介绍（`<我的用户名>/<我的用户名>` 仓库）。

### 主题参考规范
- 视觉规范：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/swiss-bauhaus-pixel/SPEC.md
- SVG 参考生成器：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/swiss-bauhaus-pixel/generator.py

### 执行要求
1. **自动识别我的 GitHub 账号**：先通过本地 `gh auth status` / `gh api user`（或 `git config`）自动获取我的 GitHub 用户名、昵称、简介、`avatar_url` 头像以及公开仓库（含描述、语言、Star、Release、官网链接）；仅当本地无法获取账号时再询问我。
2. **基于真实项目选材（禁止照搬演示项）**：从我的真实仓库中挑选最具代表性的 4 个旗舰项目（若不足 4 个则按真实数量排版，不凑假项目），并检查官网链接可访问性；若无个人网站则不要保留任何演示链接。
3. **按我的真实信息定制整套双主题 SVG 与像素头像**：
   - 严格参考 `SPEC.md` 并改写 `generator.py`，生成完整的 Light / Dark 双主题 SVG 套件（`assets/`）：`846×294` 分栏海报 Hero（9 行粗体像素大字用户名、底部 4 栏像素指标）、`0px` 直角快捷按钮、分区标头、以及 2×2 正交编织纹项目海报卡（每张配 16×16 专属像素徽标）。
   - **真实头像像素化**：直接下载我真实的 GitHub `avatar_url`（加 `?s=96`），用 Python（如 `Pillow` 或标准库脚本）下采样并量化配色，生成清晰的 `24×24` 或 `28×28` 矢量像素 `<path shape-rendering="crispEdges">` 肖像（配柔和眨眼动效与 `prefers-reduced-motion`），**严禁保留原作者演示头像矩阵或随手画粗糙替代脸**。
   - 主强调色可根据我的头像或代表项目色调微调，同时保持瑞士包豪斯 `0px` 直角与 `1px` 实线网格语言。
   - 如合适可一并配置 `.github/workflows/snake.yml` 或 GitSkins 零 503 活挂件工作流。
4. **严格校验、零演示残留检查后上线**：
   - 确保所有 SVG 通过严格 XML 解析（零 `<script>`、零外链 `<image>`、含 `prefers-reduced-motion` 保护）。
   - **零演示数据残留门禁**：交付前全局检查生成的全部 `assets/*.svg` 与 `README.md`，确认绝对不包含任何模板演示残留字符串（`Furina-he`、`NeverGiveUp`、`cloudlink`、`openpet`、`myfurina`、`blessc.com`；仅可选的 `Styled with GitSkins` 尾标允许指向 `gitskins.blessc.com`）。
   - 在 `846px` 宽度下分别预览检查 Light / Dark 渲染效果（无文字溢出、光标位置准确、标签边距均衡），确认无误后推送到我的同名主页仓库。
