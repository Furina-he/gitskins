<!-- LANG:EN -->
Redesign my GitHub Profile README (`<my-username>/<my-username>`) using the **Seal Ink Monograph** theme from GitSkins.

### Reference Blueprint
- Visual spec: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/seal-ink-scroll/SPEC.md
- Reference SVG generator: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/seal-ink-scroll/generator.py

### Execution Steps
1. **Auto-detect my GitHub identity**: Use `gh auth status` / `gh api user` (or `git config`) to read my real username, display name, bio, public repositories, stars, and live URLs. Never fabricate data.
2. **Generate the Seal Ink SVG suite**:
   - Follow `SPEC.md` and adapt `generator.py` to output paired Light (warm Xuan paper) and Dark (inkstone charcoal) SVGs into `assets/`: `846x300` Hero scroll with double-hairline framing, corner fretwork, carved cinnabar seal stamp, layered geometric ink-mountain horizon (`prefers-reduced-motion`), and 4-column colophon; bookmark link buttons; chapter section dividers; and `2x2` monograph project folio cards (`417x196`).
3. **Validate & Publish**: Run strict XML parsing on all SVGs, inspect `846px` Light/Dark contrast and whitespace, wire `<picture>` blocks in `README.md`, and push to `<username>/<username>`.

<!-- LANG:ZH -->
请使用 GitSkins 的 **「东方印章水墨卷轴（Seal Ink Monograph）」** 主题，帮我设计并更新我的 GitHub 个人主页（`<我的用户名>/<我的用户名>` 仓库）。

### 主题参考规范
- 视觉规范：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/seal-ink-scroll/SPEC.md
- SVG 参考生成器：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/seal-ink-scroll/generator.py

### 执行要求
1. **自动识别我的 GitHub 账号**：优先通过本地 `gh` 或 `git config` 读取我的真实用户名、简介、公开仓库与官网链接，绝不编造虚假指标。
2. **生成印章水墨双主题 SVG 套件**：
   - 参考 `SPEC.md` 与 `generator.py`，生成完整的 Light（暖调宣纸朱印）与 Dark（端砚墨石朱砂）SVG：`846×300` 卷轴主图（古籍双线框、四角回纹装饰、朱砂雕刻方印、叠墨远山层次与流云微动效、4 栏题跋指标）、书签链接条、章节分隔眉条，以及 2×2 项目笺卡（`417×196`）。
3. **严格校验后推送**：确认全部 SVG 通过严格 XML 校验且具备 `prefers-reduced-motion` 保护，检查 `846px` 深浅渲染无重叠截断，用 `<picture>` 写入 `README.md` 并推送。
