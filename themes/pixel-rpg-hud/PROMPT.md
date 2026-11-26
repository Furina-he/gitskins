<!-- LANG:EN -->
Redesign my GitHub Profile README (`<my-username>/<my-username>`) using the **16-bit Pixel RPG HUD** theme from GitSkins.

### Reference Blueprint
- Visual spec: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/pixel-rpg-hud/SPEC.md
- Reference SVG generator: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/pixel-rpg-hud/generator.py

### Execution Steps
1. **Auto-detect my GitHub identity**: Use `gh auth status` / `gh api user` (or `git config`) to read my real username, bio, public repos, stars, languages, and live URLs. Never fabricate stats.
2. **Generate the 16-bit RPG HUD SVG suite**:
   - Follow `SPEC.md` and adapt `generator.py` to output paired Light (handheld parchment) and Dark (16-bit battle HUD) SVGs into `assets/`: `846x304` Hero status sheet with stepped pixel bevels, HP/MP/XP bars, twinkling pixel crest (`prefers-reduced-motion`), and 4-column inventory stats; stepped command buttons; quest-log section headers; and `2x2` quest cards (`417x196`) with custom `12x12` pixel-art relic icons.
3. **Validate & Ship**: Parse every SVG with strict XML validation, check `846px` Light/Dark readability with zero overlap, wire `<picture>` blocks in `README.md`, and push to `<username>/<username>`.

<!-- LANG:ZH -->
请使用 GitSkins 的 **「16-bit 像素 RPG 冒险面板（16-bit Pixel RPG HUD）」** 主题，帮我设计并更新我的 GitHub 个人主页（`<我的用户名>/<我的用户名>` 仓库）。

### 主题参考规范
- 视觉规范：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/pixel-rpg-hud/SPEC.md
- SVG 参考生成器：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/pixel-rpg-hud/generator.py

### 执行要求
1. **自动识别我的 GitHub 账号**：通过本地 `gh` 或 `git config` 读取我的真实用户名、简介、公开仓库、Star 与官网链接，绝不编造虚假数据。
2. **生成 16-bit RPG 双主题 SVG 套件**：
   - 参考 `SPEC.md` 与 `generator.py`，生成完整的 Light（经典掌机羊皮纸）与 Dark（16-bit 战斗菜单深蓝金框）SVG：`846×304` 勇者状态主图（阶梯像素双框、HP/MP/XP 分段槽、闪烁像素徽章、4 栏装备数据）、像素指令按钮、任务日志分区条、以及 2×2 任务卷轴项目卡（每张内置 12×12 像素装备图标）。
3. **严格校验后推送**：确认全部 SVG 通过严格 XML 校验、内置 `prefers-reduced-motion` 且在 `846px` 宽度下深浅清晰无重叠，用 `<picture>` 写入 `README.md` 并推送。
