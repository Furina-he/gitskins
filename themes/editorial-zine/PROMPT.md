<!-- LANG:EN -->
Redesign my GitHub Profile README (`<my-username>/<my-username>`) using the **Editorial Broadsheet Zine** theme from GitSkins.

### Reference Blueprint
- Visual spec: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/editorial-zine/SPEC.md
- Reference SVG generator: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/editorial-zine/generator.py

### Execution Steps
1. **Auto-detect my GitHub identity**: Check `gh auth status` / `gh api user` (or `git config`) for my username, display name, bio, public repositories, stars, releases, and live websites. Only ask me if no local account is found.
2. **Curate factual content**: Pick my top 4 flagship projects, verify live URLs return HTTP 200, and keep every colophon metric accurate to my real GitHub profile.
3. **Generate the Editorial Broadsheet SVG suite**:
   - Follow `SPEC.md` and adapt `generator.py` to generate paired Light (archival paper) and Dark (obsidian press) SVGs into `assets/`: double-rule broadsheet Hero (`846x302`) with serif nameplate, italic deck, and 6-row colophon ledger; Roman-numeral folio buttons (`I`–`IV`); double-rule section headers; and `2x2` editorial feature plates (`PLATE I`–`PLATE IV`).
   - Add `.github/workflows/snake.yml` if appropriate for daily contribution tracking.
4. **Validate & Visually Inspect**: Verify strict XML parsing on every SVG, inspect rendered Light and Dark previews at `846px` width for clean typography and spacing, then push to `<username>/<username>`.

<!-- LANG:ZH -->
请使用 GitSkins 的 **「瑞士报刊杂志排版（Editorial Broadsheet Zine）」** 主题，帮我设计并更新我的 GitHub 个人主页介绍（`<我的用户名>/<我的用户名>` 仓库）。

### 主题参考规范
- 视觉规范：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/editorial-zine/SPEC.md
- SVG 参考生成器：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/editorial-zine/generator.py

### 执行要求
1. **自动识别我的 GitHub 账号**：优先通过本地 `gh auth status` / `gh api user`（或 `git config`）读取我的用户名、昵称、简介及公开仓库（描述、语言、Star、Release、官网）；仅在无法自动检测时再向我确认。
2. **内容真实克制**：精选我最具代表性的 4 个旗舰项目，校验全部官网链接可访问，出版索引栏数据严格基于我的真实仓库统计。
3. **定制深浅双主题报刊 SVG**：
   - 参考 `SPEC.md` 并改写 `generator.py`，生成完整的 Light（典藏新闻纸）与 Dark（黑曜石印刷）双主题 SVG 套件：`846×302` 双细线刊头 Hero（衬线大字署名 + 斜体导语 + 右侧 6 行出版索引栏）、罗马数字书目快捷按钮（`I`–`IV`）、报刊分节线，以及 2×2 杂志图版卡片（`PLATE I`–`PLATE IV`）。
   - 可按需配套 `.github/workflows/snake.yml` 每日更新贡献图。
4. **校验后发布上线**：全部 SVG 通过严格 XML 解析，并在 `846px` 宽度下核验 Light / Dark 排版无溢出与错位，推送至我的同名主页仓库。
