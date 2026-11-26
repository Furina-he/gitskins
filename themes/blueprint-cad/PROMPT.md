<!-- LANG:EN -->
Redesign my GitHub Profile README (`<my-username>/<my-username>`) using the **Architectural Blueprint CAD** theme from GitSkins.

### Reference Blueprint
- Visual spec: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/blueprint-cad/SPEC.md
- Reference SVG generator: https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/blueprint-cad/generator.py

### Execution Steps
1. **Auto-detect my GitHub identity**: Use `gh auth status` / `gh api user` (or `git config`) to inspect my username, display name, bio, public repositories, stars, releases, and live URLs. Only ask me if no GitHub account is detected locally.
2. **Use factual data only**: Select my top 4 flagship projects, verify live links return HTTP 200, and compute real repository metrics for the CAD title block.
3. **Generate the Blueprint SVG suite**:
   - Follow `SPEC.md` and adapt `generator.py` to output paired Light (vellum tracing sheet) and Dark (Prussian navy blueprint) SVGs into `assets/`: `846x300` Hero drafting sheet with millimeter grid, dimension lines, calibrated isometric reticle, and 4-column CAD title block; 45°-chamfered action tags; datum section headers; and `2x2` project blueprint sheets (`417x198`) each featuring a custom wireframe schematic tailored to that project's architecture.
   - Add `.github/workflows/snake.yml` if appropriate for daily contribution tracking.
4. **Validate & Visually Inspect**: Run strict XML parsing on all SVGs, render Light & Dark previews at `846px` width to confirm zero overlap between copy and schematic boxes, then commit and push to `<username>/<username>`.

<!-- LANG:ZH -->
请使用 GitSkins 的 **「工程蓝图 CAD 制图（Architectural Blueprint CAD）」** 主题，帮我设计并更新我的 GitHub 个人主页介绍（`<我的用户名>/<我的用户名>` 仓库）。

### 主题参考规范
- 视觉规范：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/blueprint-cad/SPEC.md
- SVG 参考生成器：https://raw.githubusercontent.com/Furina-he/gitskins/main/themes/blueprint-cad/generator.py

### 执行要求
1. **自动识别我的 GitHub 账号**：优先通过本地 `gh auth status` / `gh api user`（或 `git config`）获取我的用户名、昵称、简介及公开仓库信息（描述、语言、Star、Release、官网）；仅当本地无法识别时再询问我。
2. **真实数据驱动**：筛选我最具代表性的 4 个项目，校验官网链接可访问性，所有 CAD 图签栏指标与技术栈信息均使用真实数据。
3. **定制深浅双主题蓝图 SVG**：
   - 参考 `SPEC.md` 与 `generator.py`，生成完整的 Light（建筑硫酸纸描图风）与 Dark（经典普鲁士蓝图风）SVG 套件：含双精度坐标网格与四角准星的 `846×300` 工程主图、等轴测核心方位环、4 栏 CAD 图签栏、45° 倒角快捷标签、基准线分区标头，以及 2×2 项目原理图纸卡（每张右侧配有贴合该项目架构的线框示意图）。
   - 如合适可一并配置 `.github/workflows/snake.yml` 每日自动更新贡献图。
4. **校验后发布上线**：确保全部 SVG 通过严格 XML 校验，并在 `846px` 宽度下检查 Light / Dark 渲染无重叠和截断后，推送至我的同名主页仓库。
