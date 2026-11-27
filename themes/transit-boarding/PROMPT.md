<!-- LANG:EN -->
Redesign my GitHub Profile README (`<my-username>/<my-username>`) using the **Transit & Boarding Pass** theme from GitSkins.

### Reference Blueprint
- Visual spec: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/transit-boarding/SPEC.md
- Reference SVG generator: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/transit-boarding/generator.py

### Execution Steps
1. **Auto-detect my GitHub identity**: Use `gh auth status` / `gh api user` (or `git config`) to read my real username, display name, bio, `avatar_url`, public repos, stars, languages, releases, and live URLs. Only ask me if no GitHub account is detected locally.
2. **Select real stations & transit stats (never reuse demo entries)**: Pick up to 4 of my flagship repositories (adapt cleanly if I have fewer than 4 or no personal website URLs), verify live links return HTTP 200, and map the 4 boarding boxes (`GATE`, `SEAT`, `CLASS`, `MILES`) transparently to my real GitHub data (flagship count, public repos, primary language/OSS class, stars/followers). Never fabricate metrics or links.
3. **Generate the Transit & Boarding Pass SVG suite & pixelize my real avatar**:
   - Follow `SPEC.md` and rewrite `generator.py` with my real data to output paired Light (Shinkansen / thermal boarding pass) and Dark (nocturnal split-flap departure board) SVGs into `assets/`:
     - `846×300` notched Boarding Pass Hero (`0..608` main pass + `608..846` detachable stub with semicircular punch notches and dashed perforation), `DEV ✈ OSS` route header, passenger name, bio, 4 boarding boxes (`GATE`, `SEAT`, `CLASS`, `MILES`), calm boarding-LED blink (`@keyframes` guarded by `prefers-reduced-motion`), and sharp vector barcode strip.
     - `height="30"` transit ticket validation / colored metro line pill buttons (`[L1]`..`[L4]`).
     - `846×40` metro station wayfinding section signboards (`L1`, `L2`) with line-badge circles and route arrows.
     - `417×196` metro-line station transfer project cards (`ST-01`..`ST-04`) with colored horizontal route bar, circular interchange nodes (`○—●—○`), and perforated fare/spec ticket line.
   - **Real Avatar Passport Photo**: Matching the GitSkins Web Studio live preview, download my real GitHub `avatar_url` (`?s=96`) and programmatically downsample + color-quantize it (e.g. via Python `Pillow` or stdlib script) into a crisp `24×24` `<path shape-rendering="crispEdges">` passport portrait inside the right-hand detachable stub frame (fall back to a themed pixel emblem only if no avatar is available).
   - Add `.github/workflows/snake.yml` or GitSkins Zero-503 Live Widgets if appropriate.
4. **Validate, Verify Zero Demo Leakage & Ship**:
   - Parse every SVG with strict XML validation (`xml.etree.ElementTree.fromstring` + `node cli/gitskins.mjs validate`): zero `<script>`, zero `on*=` attributes, zero external `<image href="http...">`, and `prefers-reduced-motion` guarded on all `@keyframes`.
   - **Zero Demo-Data Leakage Check**: Scan all generated `assets/*.svg` and `README.md` to confirm zero leftover template strings (`Furina-he`, `NeverGiveUp`, `cloudlink`, `openpet`, `myfurina`, `blessc.com` — except `gitskins.blessc.com` if I opt into the optional `Styled with GitSkins` footer badge).
   - Verify `846px` Light/Dark readability with zero text overlap, wire `<picture>` blocks in `README.md`, and push to `<username>/<username>`.

<!-- LANG:ZH -->
请使用 GitSkins 的 **「航空登机牌 / 电车票（Transit & Boarding Pass）」** 主题，帮我设计并更新我的 GitHub 个人主页（`<我的用户名>/<我的用户名>` 仓库）。

### 主题参考规范
- 视觉规范：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/transit-boarding/SPEC.md
- SVG 参考生成器：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/transit-boarding/generator.py

### 执行要求
1. **自动识别我的 GitHub 账号**：优先通过本地 `gh auth status` / `gh api user`（或 `git config`）读取我的真实用户名、昵称、简介、`avatar_url` 头像、公开仓库、Star、语言、Release 与官网链接；仅当本地无法获取账号时再询问我。
2. **基于真实项目选站（禁止照搬演示项）**：挑选我最具代表性的 4 个旗舰仓库（不足 4 个或无个人网站链接时优雅自适应），校验官网链接返回 HTTP 200，并将 4 个登机信息栏（`GATE`、`SEAT`、`CLASS`、`MILES`）透明映射到我的真实 GitHub 数据，绝不编造虚假统计。
3. **生成航空登机牌 / 电车票双主题 SVG 套件并嵌入真实像素护照头像**：
   - 参考 `SPEC.md` 并基于我的真实信息改写 `generator.py`，生成完整的 Light（新干线热敏登机牌）与 Dark（夜间机场翻牌屏）双主题 SVG 至 `assets/`：
     - `846×300` 检票缺口登机牌主图（左侧 `0..608` 主登机牌 + 右侧 `608..846` 可撕副联存根，含上下半圆检票缺口与虚线撕裂线）、`DEV ✈ OSS` 航线头、乘客姓名、简介、4 格登机数据栏、柔和登机指示灯动效（须内置 `prefers-reduced-motion` 保护）以及锐利矢量条形码。
     - `height="30"` 地铁线路色标检票按钮（`[L1]`..`[L4]`）。
     - `846×40` 轨道交通站台导视分区栏（`L1`、`L2` 圆形线路标 + 方向箭头）。
     - `417×196` 地铁换乘站风格项目卡（`ST-01`..`ST-04`），含彩色横向线路条、圆形换乘节点（`○—●—○`）与底部虚线票价/技术栈副联。
   - **右侧护照证件框（真实头像像素化）**：与 GitSkins 在线工坊保持一致，下载我真实的 GitHub `avatar_url`（加 `?s=96`），用 Python 下采样并量化配色为清晰的 `24×24` 矢量像素护照肖像（`<path shape-rendering="crispEdges">`）嵌入右侧可撕副联的证件框内（仅在无法拉取头像时回退到定制像素徽章）。
   - 如合适可配套 `.github/workflows/snake.yml` 或 GitSkins 零 503 活挂件。
4. **严格校验、零演示残留检查后推送**：
   - 确认全部 SVG 通过严格 XML 校验（零 `<script>`、零 `on*=` 事件属性、零外链 `<image href="http...">`、所有 `@keyframes` 均带 `prefers-reduced-motion` 降级保护）。
   - **零演示数据残留门禁**：交付前全局检查生成的全部 `assets/*.svg` 与 `README.md`，确认绝对不包含任何模板演示残留字符串（`Furina-he`、`NeverGiveUp`、`cloudlink`、`openpet`、`myfurina`、`blessc.com`；仅可选的 `Styled with GitSkins` 尾标允许指向 `gitskins.blessc.com`）。
   - 检查 `846px` 宽度下深浅渲染清晰无重叠，用 `<picture>` 写入 `README.md` 并推送至我的同名主页仓库。
