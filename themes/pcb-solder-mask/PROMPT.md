<!-- LANG:EN -->
Redesign my GitHub Profile README (`<my-username>/<my-username>`) using the **Solder Mask PCB** theme from GitSkins.

### Reference Blueprint
- Visual spec: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/pcb-solder-mask/SPEC.md
- Reference SVG generator: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/pcb-solder-mask/generator.py

### Execution Steps
1. **Auto-detect my GitHub identity**: Use `gh auth status` / `gh api user` (or `git config`) to inspect my real username, display name, bio, public repositories, stars, languages, releases, and live URLs. Only ask me if no GitHub account is detected locally.
2. **Use factual data only (never reuse demo entries)**: Pick up to 4 of my flagship repositories (adapt cleanly if I have fewer), verify live URLs return HTTP 200, omit website buttons if I have no personal site, and compute all 4 bottom `PIN 01`–`PIN 04` metrics directly from my real GitHub account. Never fabricate stats.
3. **Generate the Solder Mask PCB SVG suite & personalize the `U1` IC stamp**:
   - Follow `SPEC.md` and rewrite `generator.py` with my real data to output paired Light (matte-white solder mask) and Dark (deep emerald ENIG PCB) SVGs into `assets/`:
     - `846x300` Hero PCB (`hero-{light,dark}.svg`): pure hardware circuit aesthetic — **no photo portrait by design**; instead, laser-etch the right-hand **QFP-32 Silicon IC Package (`U1`)** stamp with my own GitHub handle, custom SoC designation (e.g., `U1 · <MY-SOC>`), and real revision code alongside gull-wing gold pins, `R01`/`C02` SMD passives, 45° copper traces, animated gold signal pulses (`prefers-reduced-motion` guarded), and `PIN 01`–`PIN 04` metric pads.
     - Gold-finger edge-connector link buttons (`height="30"`, `J1`–`J4`).
     - Silkscreen bus dividers (`846x40`) with gold via anchors and 45° trace jogs.
     - `2x2` SMD/IC component footprint cards (`417x196`, `U1`–`U4`) with corner gold vias, Pin-1 dot, left/right IC lead pins, and bottom `TP1`–`TP4` test-point spec bars.
   - Add `.github/workflows/snake.yml` or GitSkins Zero-503 Live Widgets if appropriate.
4. **Validate, Verify Zero Demo Leakage & Ship**:
   - Run strict XML validation on all generated SVGs (`python` `xml.etree.ElementTree.fromstring` and/or `node cli/gitskins.mjs validate ./assets`) confirming zero `<script>` tags, zero `on*=` handlers, zero external `<image href="http...">`, and `@media (prefers-reduced-motion: reduce)` around every `@keyframes`.
   - **Zero Demo-Data Leakage Check**: Scan all generated `assets/*.svg` and `README.md` to confirm zero leftover demo/template strings (`Furina-he`, `NeverGiveUp`, `cloudlink`, `openpet`, `myfurina`, `blessc.com` — except `gitskins.blessc.com` if I opt into the optional `Styled with GitSkins` footer badge).
   - Verify `846px` Light/Dark contrast and spacing without text clipping, wire `<picture>` blocks in `README.md`, and push to `<username>/<username>`.

<!-- LANG:ZH -->
请使用 GitSkins 的 **「沉金 PCB 电路板（Solder Mask PCB）」** 主题，帮我设计并更新我的 GitHub 个人主页（`<我的用户名>/<我的用户名>` 仓库）。

### 主题参考规范
- 视觉规范：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/pcb-solder-mask/SPEC.md
- SVG 参考生成器：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/pcb-solder-mask/generator.py

### 执行要求
1. **自动识别我的 GitHub 账号**：优先通过本地 `gh auth status` / `gh api user`（或 `git config`）读取我的真实用户名、昵称、简介、公开仓库、Star、主要语言、Release 与官网链接；仅当本地无法识别时再询问我。
2. **基于真实数据排版（禁止照搬演示内容）**：精选我最具代表性的 4 个项目（不足 4 个按真实数量排版），校验官网链接可正常访问（无个人网站则省略对应按钮），底部 `PIN 01`–`PIN 04` 指标严格来自我的真实 GitHub 数据，绝不编造虚假数字。
3. **生成沉金 PCB 深浅双主题 SVG 并定制 `U1` 芯片丝印**：
   - 参考 `SPEC.md` 并基于我的真实信息改写 `generator.py`，在 `assets/` 中生成完整的 Light（哑光白阻焊板）与 Dark（深翡翠绿沉金 PCB）双主题 SVG：
     - `846×300` 主板 Hero（本套主题为纯硬件电路板美学，**无需照片头像**；请将右侧 **QFP-32 封装主芯片 `U1`** 的丝印铭牌定制为我的真实用户名 / 个人芯片型号与版本号，保留四角 ENIG 沉金安装孔、鸥翼金引脚、`R01`/`C02` 贴片元件丝印、45° 铜箔走线、受 `prefers-reduced-motion` 保护的沉金信号脉冲以及底部 `PIN 01`–`PIN 04` 排针焊盘指标）。
     - 金手指边缘连接器按钮（`height="30"`，`J1`–`J4` 丝印连接器与焊盘点）。
     - `846×40` 丝印总线分隔条（`BUS 01` / `BUS 02`，带沉金过孔锚点与 45° 差分走线拐角）。
     - `2×2` SMD/IC 元件封装项目卡（`417×196`，`U1`–`U4`，含四角沉金过孔、Pin-1 丝印圆点、左右 IC 引脚及底部 `TP1`–`TP4` 测试点技术栈栏）。
   - 如合适可一并配置 `.github/workflows/snake.yml` 或 GitSkins 零 503 活挂件。
4. **严格校验、零演示残留检查后推送**：
   - 确保全部 SVG 通过严格 XML 校验（零 `<script>`、零 `on*=` 事件、零外链 `<image href="http...">`，全部 `@keyframes` 均带有 `@media (prefers-reduced-motion: reduce)` 保护）。
   - **零演示数据残留门禁**：交付前全局扫描生成的全部 `assets/*.svg` 与 `README.md`，确认绝对不包含任何模板演示残留字符串（`Furina-he`、`NeverGiveUp`、`cloudlink`、`openpet`、`myfurina`、`blessc.com`；仅可选的 `Styled with GitSkins` 尾标允许指向 `gitskins.blessc.com`）。
   - 检查 `846px` 深浅渲染对比度与留白无截断重叠，用 `<picture>` 写入 `README.md` 并推送至我的同名主页仓库。
