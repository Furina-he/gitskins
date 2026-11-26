# DIY Widgets & 4-Column Bento Composition Specification

本文档约束 GitSkins 主题联动小挂件（DIY Widgets）的 **多实例模型、4 列 846px Bento 行拼装栅格、幽灵补位交互与整行合成 SVG 导出规范**。

---

## 1. Core Principles

1. **Multi-Instance First（多实例自由添加）**：每种挂件类型均可添加多个独立实例（各自拥有独立 `uid`、参数、配色、占宽与插槽），支持一排放 4 个不同场景的小方砖，或在 Hero 多角落贴不同挂坠。
2. **4-Column `846px` Bento Grid（严丝合缝消除留白）**：`846px` 按 `10px` 间距拆分为 4 等宽列，任意凑满 4 格的异形组合上下齐平、零多余空白。
3. **Composite Bento Row SVG（GitHub 零换行错位）**：同一行的多块挂件导出时原生合成为单张 `846×160` SVG（顶部提升 `<defs>` 与 `<style>` 并隔离命名空间），在 GitHub README 中只需一行 `<picture width="100%">`，杜绝小数像素导致的意外换行。
4. **Theme-Aware Parity（一键换肤）**：全部挂件与合成行严格继承 [architecture.md](architecture.md) 中的 `ThemeTokens` 与 4 套主题视觉语法。

---

## 2. 4-Column `846px` Bento Width & Height Math

总宽 `846px`，列间距 `10px`：

```text
colWidth(span) = span * 204 + (span - 1) * 10
```

| `colSpan` | Exact Width | Bento Row Height | Typical Widgets |
| :--- | :--- | :--- | :--- |
| `1` 格 | `204px` | `160px`（独立方砖可选 `204px`） | `W08` 迷你动态方砖（咖啡 / 天气 / 沙漏 / 频谱） |
| `2` 格 | `418px` | `160px` | `W01` 桌宠、`W02` 磁带/黑胶、`W03` 工牌、`W04` 技术栈、`W05` 宣言、`W08` 宽方砖 |
| `3` 格 | `632px` | `160px` | `W01`–`W05` 宽版（与 `1` 格方砖组成 `1+3` 或 `3+1` 满行） |
| `4` 格 | `846px` | `160px` / 自适应 / `48px`（跑道） | 通栏卡片、`W07` 巡逻跑道（`846×48`） |
| `sticker` | `132×92` | 嵌入 Hero 四角 | `W06` 角落动态贴纸（`hero-overlay` 合成进 `hero.svg`） |

### Valid Full-Row (`4/4`) Combinations
- `1 + 1 + 1 + 1`：四联动态方砖（`204 + 10 + 204 + 10 + 204 + 10 + 204 = 846`）
- `2 + 1 + 1` / `1 + 2 + 1` / `1 + 1 + 2`：核心卡片 + 双动态方砖（`418 + 10 + 204 + 10 + 204 = 846`）
- `1 + 3` / `3 + 1`：单方砖 + 3 格宽版技术栈/工牌/桌宠（`204 + 10 + 632 = 846`）
- `2 + 2`：经典双栏卡片（`418 + 10 + 418 = 846`）
- `4`：通栏卡片或 `846×48` 巡逻跑道

---

## 3. Instance & Row Packing Schema

```ts
export type BentoColSpan = 1 | 2 | 3 | 4;

export interface WidgetInstance<K extends WidgetId = WidgetId> {
  uid: string;
  widgetId: K;
  colSpan: BentoColSpan;
  placement: WidgetPlacement; // "top" | "hero-overlay" | "under-hero" | "under-cards" | "bottom"
  accentOverride: string;
  animated: boolean;
  config: WidgetConfigMap[K];
}
```

### Greedy Row Packing Rules (Per Slot)
1. 同一插槽内按实例顺序遍历。
2. `pixel-runway`（`846×48`）独占一行（`isStrip = true`）。
3. 其余挂件只要 `row.usedCols + item.colSpan <= 4` 即拼入当前行，否则另起新行。
4. 任何非满行（`usedCols < 4`）在预览框与装机区右侧自动显示虚线 **幽灵补位槽（Ghost Slot）**，仅推荐 `colSpan <= remainingCols` 的挂件或提供「拉宽现有挂件填满」快捷按钮。

---

## 4. Composite Bento Row SVG Contract

当一行包含 `>= 2` 个挂件时，通过 `renderCompositeBentoRowSvg()` 合并为单张 `846 × 160` SVG：
1. 逐块以 `widthPx = colWidth(item.colSpan)`、`heightPx = 160` 与唯一 `instanceId` 渲染子 SVG。
2. 提取每块内部的 `<defs>` 与 `<style>` 统一提升至顶层 `<svg>`，将主体图形包入 `<g transform="translate(xOffset, 0)">`。
3. 所有导出 SVG（包括合并行、合并 Hero 贴纸与单挂件）均须通过 `DOMParser("image/svg+xml")` 严格 XML 校验。

---

## 5. Built-in Bento Presets

| Preset ID | 组合名称 | 列布局 | 组成 |
| :--- | :--- | :--- | :--- |
| `desk-trio` | 极客桌面三联 | `2 + 1 + 1` | 像素桌宠(2) + 热咖啡(1) + 像素雨天气窗(1) |
| `vibe-trio` | 深夜听歌三联 | `1 + 2 + 1` | 专注沙漏(1) + 复古磁带(2) + 跳动频谱(1) |
| `tile-quad` | 全动效四联方砖 | `1 + 1 + 1 + 1` | 热咖啡(1) + 落雪天气(1) + 沙漏(1) + 频谱(1) |
| `stack-duo` | 极简开发双拼 | `1 + 3` | 热咖啡(1) + 3 格技术栈机架(3) |
