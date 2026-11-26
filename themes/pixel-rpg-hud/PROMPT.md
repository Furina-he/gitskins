<!-- LANG:EN -->
Redesign my GitHub Profile README (`<my-username>/<my-username>`) using the **16-bit Pixel RPG HUD** theme from GitSkins.

### Reference Blueprint
- Visual spec: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/pixel-rpg-hud/SPEC.md
- Reference SVG generator: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/pixel-rpg-hud/generator.py

### Execution Steps
1. **Auto-detect my GitHub identity**: Use `gh auth status` / `gh api user` (or `git config`) to read my real username, display name, bio, `avatar_url`, public repos, stars, languages, releases, and live URLs. Only ask me if no GitHub account is detected locally.
2. **Select real quests (never reuse demo entries)**: Pick up to 4 of my flagship repositories (adapt cleanly if I have fewer), verify live links return HTTP 200, and derive all RPG level, HP/MP/XP, and inventory stats transparently from my real GitHub data. Never fabricate stats.
3. **Generate the 16-bit RPG HUD SVG suite & pixelize my real avatar**:
   - Follow `SPEC.md` and rewrite `generator.py` with my real data to output paired Light (handheld parchment) and Dark (16-bit battle HUD) SVGs into `assets/`: `846x304` Hero status sheet with stepped pixel bevels, HP/MP/XP bars, twinkling accents (`prefers-reduced-motion`), and 4-column inventory stats; stepped command buttons; quest-log section headers; and `2x2` quest cards (`417x196`) with custom `12x12` pixel-art relic icons tailored to my projects.
   - **Real Avatar Character Portrait**: Matching the GitSkins Web Studio live preview, download my real GitHub `avatar_url` (`?s=96`) and programmatically downsample + color-quantize it (e.g. via Python `Pillow` or stdlib script) into a crisp `24x24` `<path shape-rendering="crispEdges">` character portrait inside the right-hand framed HUD slot (fall back to a themed pixel emblem only if no avatar is available).
   - Add `.github/workflows/snake.yml` or GitSkins Zero-503 Live Widgets if appropriate.
4. **Validate, Verify Zero Demo Leakage & Ship**:
   - Parse every SVG with strict XML validation (zero `<script>`, zero external `<image href="http...">`, `prefers-reduced-motion` guarded).
   - **Zero Demo-Data Leakage Check**: Scan all generated `assets/*.svg` and `README.md` to confirm zero leftover template strings (`Furina-he`, `NeverGiveUp`, `cloudlink`, `openpet`, `myfurina`, `blessc.com` — except `gitskins.blessc.com` if I opt into the optional `Styled with GitSkins` footer badge).
   - Check `846px` Light/Dark readability with zero overlap, wire `<picture>` blocks in `README.md`, and push to `<username>/<username>`.

<!-- LANG:ZH -->
请使用 GitSkins 的 **「16-bit 像素 RPG 冒险面板（16-bit Pixel RPG HUD）」** 主题，帮我设计并更新我的 GitHub 个人主页（`<我的用户名>/<我的用户名>` 仓库）。

### 主题参考规范
- 视觉规范：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/pixel-rpg-hud/SPEC.md
- SVG 参考生成器：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/pixel-rpg-hud/generator.py

### 执行要求
1. **自动识别我的 GitHub 账号**：优先通过本地 `gh auth status` / `gh api user`（或 `git config`）读取我的真实用户名、昵称、简介、`avatar_url` 头像、公开仓库、Star、语言与官网链接；仅当本地无法获取账号时再询问我。
2. **基于真实项目选材（禁止照搬演示项）**：挑选我最具代表性的 4 个旗舰项目（不足 4 个按真实数量排版），校验官网链接可访问，所有等级、HP/MP/XP 与装备栏统计均基于我的真实数据换算，绝不编造虚假指标。
3. **生成 16-bit RPG 双主题 SVG 套件并嵌入真实像素头像**：
   - 参考 `SPEC.md` 并基于我的真实信息改写 `generator.py`，生成完整的 Light（经典掌机羊皮纸）与 Dark（16-bit 战斗菜单深蓝金框）SVG：`846×304` 勇者状态主图（阶梯像素双框、HP/MP/XP 分段槽、4 栏装备数据）、像素指令按钮、任务日志分区条、以及 2×2 任务卷轴项目卡（每张内置贴合该项目的 12×12 像素装备图标）。
   - **右侧角色立绘框（真实头像像素化）**：与 GitSkins 在线工坊保持一致，下载我真实的 GitHub `avatar_url`（加 `?s=96`），用 Python 下采样并量化配色为清晰的 `24×24` 矢量像素肖像（`<path shape-rendering="crispEdges">`）放入右侧角色框（仅在无法拉取头像时回退到定制像素徽章）。
   - 如合适可配套 `.github/workflows/snake.yml` 或 GitSkins 零 503 活挂件。
4. **严格校验、零演示残留检查后推送**：
   - 确认全部 SVG 通过严格 XML 校验（零 `<script>`、零外链 `<image>`、内置 `prefers-reduced-motion`）。
   - **零演示数据残留门禁**：交付前全局检查生成的全部 `assets/*.svg` 与 `README.md`，确认绝对不包含任何模板演示残留字符串（`Furina-he`、`NeverGiveUp`、`cloudlink`、`openpet`、`myfurina`、`blessc.com`；仅可选的 `Styled with GitSkins` 尾标允许指向 `gitskins.blessc.com`）。
   - 检查 `846px` 宽度下深浅渲染清晰无重叠，用 `<picture>` 写入 `README.md` 并推送至我的同名主页仓库。
