<!-- LANG:EN -->
Redesign my GitHub Profile README (`<my-username>/<my-username>`) using the **Seal Ink Monograph** theme from GitSkins.

### Reference Blueprint
- Visual spec: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/seal-ink-scroll/SPEC.md
- Reference SVG generator: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/seal-ink-scroll/generator.py

### Execution Steps
1. **Auto-detect my GitHub identity**: Use `gh auth status` / `gh api user` (or `git config`) to read my real username, display name, bio, public repositories, stars, languages, releases, and live URLs. Only ask me if no GitHub account is detected locally.
2. **Curate factual content (never reuse demo entries)**: Pick up to 4 of my flagship projects (adapt cleanly if I have fewer), verify live URLs return HTTP 200, and compute all 4-column colophon metrics from my real GitHub profile. Never fabricate data.
3. **Generate the Seal Ink SVG suite & personalize the vermilion seal**:
   - Follow `SPEC.md` and rewrite `generator.py` with my real data to output paired Light (warm Xuan paper) and Dark (inkstone charcoal) SVGs into `assets/`: `846x300` Hero scroll (pure East Asian stationery aesthetic — no photo portrait by design) with double-hairline framing, corner fretwork, layered geometric ink-mountain horizon (`prefers-reduced-motion`), and 4-column colophon; bookmark link buttons; chapter section dividers; and `2x2` monograph project folio cards (`417x196`).
   - **Personalized Cinnabar Seal Stamp**: Carve the right-hand vermilion square seal chop to reflect my own identity (using my Chinese name character(s), clean monogram initials, or geometric seal strokes) rather than leaving the generic placeholder seal unchanged.
   - Add `.github/workflows/snake.yml` or GitSkins Zero-503 Live Widgets if appropriate.
4. **Validate, Verify Zero Demo Leakage & Ship**:
   - Run strict XML parsing on all SVGs (zero `<script>`, zero external `<image href="http...">`, `prefers-reduced-motion` guarded).
   - **Zero Demo-Data Leakage Check**: Scan all generated `assets/*.svg` and `README.md` to confirm zero leftover template strings (`Furina-he`, `NeverGiveUp`, `cloudlink`, `openpet`, `myfurina`, `blessc.com` — except `gitskins.blessc.com` if I opt into the optional `Styled with GitSkins` footer badge).
   - Inspect `846px` Light/Dark contrast and whitespace, wire `<picture>` blocks in `README.md`, and push to `<username>/<username>`.

<!-- LANG:ZH -->
请使用 GitSkins 的 **「东方印章水墨卷轴（Seal Ink Monograph）」** 主题，帮我设计并更新我的 GitHub 个人主页（`<我的用户名>/<我的用户名>` 仓库）。

### 主题参考规范
- 视觉规范：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/seal-ink-scroll/SPEC.md
- SVG 参考生成器：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/seal-ink-scroll/generator.py

### 执行要求
1. **自动识别我的 GitHub 账号**：优先通过本地 `gh auth status` / `gh api user`（或 `git config`）读取我的真实用户名、昵称、简介、公开仓库、Star 与官网链接；仅当本地无法获取账号时再询问我。
2. **基于真实项目选材（禁止照搬演示项）**：精选我最具代表性的 4 个项目（不足 4 个按真实数量排版），校验官网链接可访问，题跋指标严格基于我的真实仓库统计，绝不编造虚假指标。
3. **生成印章水墨双主题 SVG 并定制朱砂印章**：
   - 参考 `SPEC.md` 并基于我的真实信息改写 `generator.py`，生成完整的 Light（暖调宣纸朱印）与 Dark（端砚墨石朱砂）SVG：`846×300` 卷轴主图（本套主题为东方古籍极简风格，无需照片头像；含古籍双线框、四角回纹装饰、叠墨远山层次与流云微动效、4 栏题跋指标）、书签链接条、章节分隔眉条，以及 2×2 项目笺卡（`417×196`）。
   - **专属朱砂方印**：结合我的中文名/昵称单字、英文缩写或专属几何篆刻风格定制右侧朱砂雕刻方印，使其带有个人印记。
   - 如合适可配套 `.github/workflows/snake.yml` 或 GitSkins 零 503 活挂件。
4. **严格校验、零演示残留检查后推送**：
   - 确认全部 SVG 通过严格 XML 校验（零 `<script>`、零外链 `<image>`、具备 `prefers-reduced-motion` 保护）。
   - **零演示数据残留门禁**：交付前全局检查生成的全部 `assets/*.svg` 与 `README.md`，确认绝对不包含任何模板演示残留字符串（`Furina-he`、`NeverGiveUp`、`cloudlink`、`openpet`、`myfurina`、`blessc.com`；仅可选的 `Styled with GitSkins` 尾标允许指向 `gitskins.blessc.com`）。
   - 检查 `846px` 深浅渲染无重叠截断，用 `<picture>` 写入 `README.md` 并推送至我的同名主页仓库。
