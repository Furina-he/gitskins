# GitHub Actions Live Auto-Updating Widgets Specification

本文档定义 GitSkins `v0.4` 零 503「活挂件（Live Widgets）」的架构、数据源、Python 零依赖生成器契约与 GitHub Actions 自动化模板。

---

## 1. Why GitHub Actions Baked SVGs?

传统第三方在线统计卡片依赖公共无服务器端点，存在频繁 503、限流超时、样式与主页割裂三大痛点。  
GitSkins 采用 **「用户侧 GitHub Actions 定时烘焙」** 模式：
- **零服务器运维 & 永不 503**：SVG 直接作为静态文件提交在用户自己的 `<username>/<username>` 仓库中，由 GitHub CDN 直接分发。
- **零 `pip` 依赖**：生成器 `live-widgets/generate_live_widgets.py` 仅使用 Python 3.10+ 标准库（`urllib.request` / `json` / `xml.etree.ElementTree` / `datetime`），Actions 启动即跑，单次耗时 < 5 秒。
- **100% 皮肤与 4 列 Bento 统一**：共享 [architecture.md](architecture.md) 语义令牌与 [widgets-system.md](widgets-system.md) 的 `204 / 418 / 632 / 846 × 160` 栅格尺寸，可直接与静态 DIY 挂件同排混拼。

---

## 2. Live Widget Catalog (`L01`–`L10`)

| Code | ID | 名称 | 支持格数 | 数据源（全部免费、免自建后端） |
| :--- | :--- | :--- | :--- | :--- |
| `L01` | `github-stats` | 同皮肤 GitHub 统计仪表盘 | `2 / 3 / 4` 格 | GitHub REST API（使用 Actions 原生 `GITHUB_TOKEN`，5000 req/h）：Stars / Repos / Followers / Commits + 比例语言条 |
| `L02` | `coding-rhythm` | 编码作息分布图 | `2 / 3 / 4` 格 | GitHub Events API 按用户 `TZ_OFFSET` 统计早/午/晚/深夜提交分布 + 24h 柱状图与作息标签（Early Bird / Night Owl） |
| `L03` | `rss-feed` | 最近博客 / RSS 动态列表 | `2 / 3 / 4` 格 | 标准库 XML 解析任意 RSS 2.0 / Atom 订阅源，提取最新 3 篇文章标题、发布日期与来源域名 |
| `L04` | `live-weather` | 城市实时像素天气窗 | `1 / 2` 格 | Open-Meteo 免费开放接口（免 Key）：按城市名解析经纬度，拉取实时温度与 WMO 天气码并自动切换晴/多云/雨/雪动画 |
| `L05` | `wakatime-weekly` | WakaTime 编程时长雷达 | `2 / 3 / 4` 格 | WakaTime API（可选 `WAKATIME_API_KEY` Secret）：近 7 天总时长、日均时长、常用编辑器与语言占比 |
| `L06` | `spotify-recent` | Spotify 最近循环黑胶 | `2 / 3 / 4` 格 | Spotify Web API（可选 OAuth Refresh Token Secrets）：正在播放或最近曲目 + 旋转黑胶动效 |
| `L07` | `contribution-snake` | 贡献图贪吃蛇 | `4` 格通栏 (`846px`) | 双引擎：支持经典 `Platane/snk/svg-only@v3` 自动注入皮肤深/浅 `color_snake` 与 5 级 `color_dots` 色板，或零分支 GitHub GraphQL 原生皮肤框版（仅内置 `GITHUB_TOKEN`） |
| `L08` | `contrib-skyline` | 3D 贡献天际线 | `3 / 4` 格 | GitHub GraphQL `contributionsCollection`（仅内置 `GITHUB_TOKEN`）：最近 14–18 周提交热力图等轴测 3D 立体柱状天际线 |
| `L09` | `commit-streak` | 连续提交火炬 | `1 / 2` 格 | GitHub GraphQL `contributionsCollection`（仅内置 `GITHUB_TOKEN`）：当前连胜天数、历史最长纪录、年度提交与近 14 天像素火苗条 |
| `L10` | `recent-activity` | 近期动态日志 | `2 / 3 / 4` 格 | GitHub Public Events API（仅内置 `GITHUB_TOKEN`）：自动拉取最新 3 条公开 Push / Release / PR / Star 事件 |

---

## 3. CLI & Workflow Contract

### Generator CLI (`live-widgets/generate_live_widgets.py`)
```bash
python scripts/generate_live_widgets.py \
  --username "<github-user>" \
  --theme "blueprint-cad" \
  --widgets "github-stats:2,coding-rhythm:2,live-weather:1,rss-feed:3" \
  --city "Shanghai" \
  --unit "C" \
  --tz-offset "+8" \
  --rss-url "https://example.com/rss.xml" \
  --accent "" \
  --out-dir "assets"
```
- 支持 `--demo` 模式：跳过外网请求，使用确定性演示数据生成并校验全部 SVG（供 `scripts/build_all.py` 集成验证）。
- 所有生成的 `assets/live-<id>-{light,dark}.svg` 必须通过 `xml.etree.ElementTree.fromstring()` 严格 XML 解析。
- 外网数据源（如 RSS 超时或天气接口抖动）出现异常时，优雅降级输出带提示的安全 SVG 或保留已有数据，不中断整套流水线。

### GitHub Actions Template (`live-widgets/gitskins-widgets.yml`)
- 触发器：`schedule`（默认 `0 */6 * * *`，可自定义） + `workflow_dispatch`（支持手动立即刷新）。
- 权限：最小化 `permissions: { contents: write }`。
- 幂等提交：仅当 `assets/live-*.svg` 内容真实变化时才 `git commit` 与 `git push`。

---

## 4. Studio & ZIP Integration

1. 展示站 `DIY Widgets Studio` 提供分类筛选（`全部` / `静态 DIY` / `定时活挂件`），`L01`–`L07` 均支持在线实时预览、调参与加入 4 列 Bento 画布。
2. 选中任意活挂件时，导出区额外提供 **「GitHub Actions YAML 一键复制 / 下载」**，自动填入当前皮肤、强调色、城市、时区、RSS 地址或 `Platane/snk` 主题色板参数。
3. 当主页套装中挂载了任意 `L01`–`L07` 时，一键导出 ZIP 自动附带：
   - `.github/workflows/gitskins-widgets.yml`（已预填全部参数，含 `L07` 原生皮肤框模式）
   - `.github/workflows/snake.yml`（当挂载 `L07` 且引擎为 `Platane/snk` 时自动附带深浅主题色板配置）
   - `scripts/generate_live_widgets.py`（零依赖自托管脚本）
   - 初始预览版 Light / Dark SVG 与 `README.md`
