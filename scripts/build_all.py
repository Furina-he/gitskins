#!/usr/bin/env python3
"""Build all GitSkins themes, XML-validate every SVG, and sync assets + manifest into web/public/themes/."""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
THEMES_DIR = ROOT / "themes"
LIVE_WIDGETS_DIR = ROOT / "live-widgets"
SKILL_FILE = ROOT / "skill" / "gitskins" / "SKILL.md"
WEB_THEMES_DIR = ROOT / "web" / "public" / "themes"
WEB_LIVE_WIDGETS_DIR = ROOT / "web" / "public" / "live-widgets"
WEB_SKILL_DIR = ROOT / "web" / "public" / "skill"
REPO_RAW_BASE = "https://raw.githubusercontent.com/Furina-he/gitskins/main"
REPO_WEB_BASE = "https://github.com/Furina-he/gitskins/blob/main"
HEX_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")
REQUIRED_META_KEYS = (
    "id",
    "order",
    "name",
    "nameZh",
    "category",
    "categoryZh",
    "tagline",
    "taglineZh",
    "bestFor",
    "bestForZh",
    "author",
    "accent",
    "palette",
    "tokens",
    "features",
    "featuresZh",
    "buttons",
    "cards",
    "sections",
    "subLinks",
)
REQUIRED_TOKEN_KEYS = (
    "bg",
    "surface",
    "ink",
    "sub",
    "muted",
    "border",
    "borderSoft",
    "accent",
    "accentFg",
    "secondary",
    "tertiary",
    "highlight",
    "patternBg",
    "patternFg",
)


def validate_meta(meta: dict, folder_name: str) -> None:
    missing = [k for k in REQUIRED_META_KEYS if k not in meta]
    if missing:
        raise SystemExit(f"Theme {folder_name}/meta.json missing keys: {', '.join(missing)}")
    if meta["id"] != folder_name:
        raise SystemExit(f"Theme {folder_name}/meta.json id '{meta['id']}' != folder name '{folder_name}'")
    if not HEX_RE.match(str(meta["accent"])):
        raise SystemExit(f"Theme {folder_name}/meta.json invalid accent hex: {meta['accent']}")

    for mode in ("light", "dark"):
        pal = meta.get("palette", {}).get(mode)
        if not isinstance(pal, list) or not pal or not all(HEX_RE.match(str(c)) for c in pal):
            raise SystemExit(f"Theme {folder_name}/meta.json invalid palette.{mode}")

        tok = meta.get("tokens", {}).get(mode)
        if not isinstance(tok, dict):
            raise SystemExit(f"Theme {folder_name}/meta.json missing tokens.{mode}")
        missing_tok = [k for k in REQUIRED_TOKEN_KEYS if k not in tok]
        if missing_tok:
            raise SystemExit(
                f"Theme {folder_name}/meta.json tokens.{mode} missing keys: {', '.join(missing_tok)}"
            )
        for k in REQUIRED_TOKEN_KEYS:
            if not HEX_RE.match(str(tok[k])):
                raise SystemExit(f"Theme {folder_name}/meta.json tokens.{mode}.{k} invalid hex: {tok[k]}")


def parse_bilingual_prompt(text: str) -> dict[str, str]:
    en_match = re.search(r"<!--\s*LANG:EN\s*-->(.*?)(?=<!--\s*LANG:ZH\s*-->|$)", text, re.S)
    zh_match = re.search(r"<!--\s*LANG:ZH\s*-->(.*)$", text, re.S)
    if not en_match or not zh_match:
        raise SystemExit("PROMPT.md must contain both <!-- LANG:EN --> and <!-- LANG:ZH --> blocks")
    return {
        "en": en_match.group(1).strip(),
        "zh": zh_match.group(1).strip(),
    }


def validate_prompt(prompts: dict[str, str], tid: str) -> None:
    en = prompts["en"]
    zh = prompts["zh"]
    if len(en) < 120 or len(zh) < 100:
        raise SystemExit(f"Theme {tid}/PROMPT.md EN or ZH block is unexpectedly short")
    if "demo" not in en.lower() and "furina-he" not in en.lower():
        raise SystemExit(f"Theme {tid}/PROMPT.md EN block must include a zero demo-data leakage check")
    if "残留" not in zh and "演示" not in zh:
        raise SystemExit(f"Theme {tid}/PROMPT.md ZH block must include a 零演示数据残留检查")
    if "xml" not in en.lower() or "xml" not in zh.lower():
        raise SystemExit(f"Theme {tid}/PROMPT.md must require strict XML validation in both EN and ZH")


def validate_brand_icon_parity() -> None:
    logo = ROOT / "assets" / "logo.svg"
    favicon = ROOT / "web" / "public" / "favicon.svg"
    if logo.exists() and favicon.exists():
        logo_txt = logo.read_text(encoding="utf-8")
        fav_txt = favicon.read_text(encoding="utf-8")
        ET.fromstring(logo_txt)
        ET.fromstring(fav_txt)
        if logo_txt.strip() != fav_txt.strip():
            raise SystemExit("Brand icon drift: assets/logo.svg and web/public/favicon.svg must match byte-for-byte")


def sync_readme_counts(
    theme_count: int,
    svgs_per_theme: int,
    theme_svg_total: int,
    live_svg_total: int,
) -> None:
    catalog_path = ROOT / "web" / "src" / "widgets" / "catalog.ts"
    if not catalog_path.exists():
        return
    catalog_txt = catalog_path.read_text(encoding="utf-8")
    static_widgets = len(re.findall(r'code:\s*"W\d+"', catalog_txt))
    live_widgets = len(re.findall(r'code:\s*"L\d+"', catalog_txt))
    widget_total = static_widgets + live_widgets

    readme_en = ROOT / "README.md"
    if readme_en.exists():
        orig = readme_en.read_text(encoding="utf-8")
        txt = orig
        en_rules = [
            (r"Themes-\d+_Light_%26_Dark-E45847", f"Themes-{theme_count}_Light_%26_Dark-E45847"),
            (r'alt="\d+ Light & Dark Themes"', f'alt="{theme_count} Light & Dark Themes"'),
            (r"Widgets-\d+_Bento_%2B_Live-F5B700", f"Widgets-{widget_total}_Bento_%2B_Live-F5B700"),
            (r'alt="\d+ Widgets"', f'alt="{widget_total} Widgets"'),
            (r"across \d+ skins", f"across {theme_count} skins"),
            (
                r"static SVGs \(`\d+` per theme = `\d+` SVGs\)",
                f"static SVGs (`{svgs_per_theme}` per theme = `{theme_svg_total}` SVGs)",
            ),
            (r"All \*\*\d+ widgets\*\*", f"All **{widget_total} widgets**"),
            (
                r"# 1\. List all \d+ themes, \d+ widgets,",
                f"# 1. List all {theme_count} themes, {widget_total} widgets,",
            ),
            (
                r"# Builds \d+ themes \(\d+ SVGs\), validates \d+ live SVGs,",
                f"# Builds {theme_count} themes ({theme_svg_total} SVGs), validates {live_svg_total} live SVGs,",
            ),
            (
                r"# 1\. Regenerate all \d+ themes \(\d+ SVGs\), validate \d+ live widget SVGs,",
                f"# 1. Regenerate all {theme_count} themes ({theme_svg_total} SVGs), validate {live_svg_total} live widget SVGs,",
            ),
        ]
        for pat, rep in en_rules:
            txt = re.sub(pat, rep, txt)
        if txt != orig:
            readme_en.write_text(txt, encoding="utf-8")

    readme_zh = ROOT / "README_ZH.md"
    if readme_zh.exists():
        orig = readme_zh.read_text(encoding="utf-8")
        txt = orig
        zh_rules = [
            (r"精选皮肤-\d+套浅色%2F深色-E45847", f"精选皮肤-{theme_count}套浅色%2F深色-E45847"),
            (r'alt="\d+ 套双主题皮肤"', f'alt="{theme_count} 套双主题皮肤"'),
            (r"自适应挂件-\d+款_Bento%2B活挂件-F5B700", f"自适应挂件-{widget_total}款_Bento%2B活挂件-F5B700"),
            (r'alt="\d+ 款自适应挂件"', f'alt="{widget_total} 款自适应挂件"'),
            (
                r"全部 \d+ 套主题均配备成对 \*\*Light / Dark\*\* 语义令牌契约（`meta\.json#tokens`）、严格 XML 校验静态 SVG（每套 `\d+` 张，共 `\d+` 张）",
                f"全部 {theme_count} 套主题均配备成对 **Light / Dark** 语义令牌契约（`meta.json#tokens`）、严格 XML 校验静态 SVG（每套 `{svgs_per_theme}` 张，共 `{theme_svg_total}` 张）",
            ),
            (r"全部 \*\*\d+ 款挂件\*\*", f"全部 **{widget_total} 款挂件**"),
            (r"### \d+ 款静态 DIY 挂件", f"### {static_widgets} 款静态 DIY 挂件"),
            (r"### \d+ 款零 503 GitHub Actions 活挂件", f"### {live_widgets} 款零 503 GitHub Actions 活挂件"),
            (
                r"# 1\. 查看全部 \d+ 套主题、\d+ 款挂件与 Repo Skin 模块",
                f"# 1. 查看全部 {theme_count} 套主题、{widget_total} 款挂件与 Repo Skin 模块",
            ),
            (
                r"# 构建 \d+ 套主题（\d+ SVG）、校验 \d+ 张活挂件 SVG 并同步 web/public/",
                f"# 构建 {theme_count} 套主题（{theme_svg_total} SVG）、校验 {live_svg_total} 张活挂件 SVG 并同步 web/public/",
            ),
            (
                r"# 1\. 重新生成 \d+ 套主题（\d+ 张 SVG）、校验 \d+ 张活挂件 SVG 并同步到 web/public/",
                f"# 1. 重新生成 {theme_count} 套主题（{theme_svg_total} 张 SVG）、校验 {live_svg_total} 张活挂件 SVG 并同步到 web/public/",
            ),
        ]
        for pat, rep in zh_rules:
            txt = re.sub(pat, rep, txt)
        if txt != orig:
            readme_zh.write_text(txt, encoding="utf-8")

    print(
        f"Synced README counts ({theme_count} themes / {theme_svg_total} SVGs, "
        f"{widget_total} widgets [{static_widgets} DIY + {live_widgets} Live] / {live_svg_total} live SVGs)"
    )


def main() -> None:
    WEB_THEMES_DIR.mkdir(parents=True, exist_ok=True)
    manifest: list[dict] = []

    theme_dirs = sorted(p for p in THEMES_DIR.iterdir() if p.is_dir() and (p / "meta.json").exists())
    if not theme_dirs:
        raise SystemExit("No themes found in themes/")

    for tdir in theme_dirs:
        gen = tdir / "generator.py"
        if gen.exists():
            subprocess.run([sys.executable, str(gen)], check=True)

        meta = json.loads((tdir / "meta.json").read_text(encoding="utf-8"))
        validate_meta(meta, tdir.name)
        tid = meta["id"]
        assets_dir = tdir / "assets"
        svg_files = sorted(assets_dir.glob("*.svg"))
        if not svg_files:
            raise SystemExit(f"No SVGs generated for theme {tid}")

        # Validate strict XML & copy into web/public/themes/<id>/assets/
        dest_assets = WEB_THEMES_DIR / tid / "assets"
        if dest_assets.exists():
            shutil.rmtree(dest_assets)
        dest_assets.mkdir(parents=True, exist_ok=True)

        for svg in svg_files:
            ET.fromstring(svg.read_text(encoding="utf-8"))
            shutil.copy2(svg, dest_assets / svg.name)

        prompts = parse_bilingual_prompt((tdir / "PROMPT.md").read_text(encoding="utf-8"))
        validate_prompt(prompts, tid)
        spec_text = (tdir / "SPEC.md").read_text(encoding="utf-8").strip()
        if not spec_text:
            raise SystemExit(f"Theme {tid}/SPEC.md is empty")

        quick_prompt_en = (
            f"Redesign my GitHub Profile README using the GitSkins '{meta['name']}' theme. "
            f"Follow the instructions at {REPO_RAW_BASE}/themes/{tid}/PROMPT.md "
            f"(spec: {REPO_RAW_BASE}/themes/{tid}/SPEC.md, generator: {REPO_RAW_BASE}/themes/{tid}/generator.py). "
            f"Auto-detect my GitHub username, avatar_url, and real repositories via gh/git config, "
            f"pixelize my real avatar when the theme includes a portrait slot, ensure zero leftover demo strings, "
            f"validate strict XML & 846px Light/Dark renders, and push to my profile repo."
        )
        quick_prompt_zh = (
            f"请使用 GitSkins 的「{meta['nameZh']}」主题改造我的 GitHub 个人主页。"
            f"请直接读取执行规范 {REPO_RAW_BASE}/themes/{tid}/PROMPT.md "
            f"（视觉规范：{REPO_RAW_BASE}/themes/{tid}/SPEC.md ，参考生成器：{REPO_RAW_BASE}/themes/{tid}/generator.py ）。"
            f"请自动通过本地 gh / git config 识别我的 GitHub 账号、真实头像（含头像框的主题须下载我的 avatar_url 像素化）与真实公开仓库，"
            f"确保生成的 SVG 与 README 零模板演示残留，通过严格 XML 与 846px 深浅渲染校验后推送到我的同名主页仓库。"
        )

        entry = {
            **meta,
            "svgCount": len(svg_files),
            "prompts": {
                "full": prompts,
                "quick": {"en": quick_prompt_en, "zh": quick_prompt_zh},
            },
            "specMarkdown": spec_text,
            "links": {
                "spec": f"{REPO_WEB_BASE}/themes/{tid}/SPEC.md",
                "generator": f"{REPO_WEB_BASE}/themes/{tid}/generator.py",
                "promptRaw": f"{REPO_RAW_BASE}/themes/{tid}/PROMPT.md",
                "folder": f"https://github.com/Furina-he/gitskins/tree/main/themes/{tid}",
            },
        }
        manifest.append(entry)

    manifest.sort(key=lambda item: item.get("order", 99))
    out_file = WEB_THEMES_DIR / "manifest.json"
    out_file.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Synced {len(manifest)} themes into {WEB_THEMES_DIR} (manifest written)")

    # Validate and sync live-widgets Python generator & workflow template
    live_svg_total = 0
    live_gen = LIVE_WIDGETS_DIR / "generate_live_widgets.py"
    if live_gen.exists():
        res = subprocess.run(
            [sys.executable, str(live_gen), "--check-all"],
            check=True,
            capture_output=True,
            text=True,
        )
        if res.stdout:
            print(res.stdout.strip())
        m_live = re.search(r"Validated\s+(\d+)\s+strict XML SVGs", res.stdout or "")
        if m_live:
            live_svg_total = int(m_live.group(1))
        WEB_LIVE_WIDGETS_DIR.mkdir(parents=True, exist_ok=True)
        shutil.copy2(live_gen, WEB_LIVE_WIDGETS_DIR / "generate_live_widgets.py")
        wf_tpl = LIVE_WIDGETS_DIR / "gitskins-widgets.yml"
        if wf_tpl.exists():
            shutil.copy2(wf_tpl, WEB_LIVE_WIDGETS_DIR / "gitskins-widgets.yml")
        print(f"Synced live-widgets generator into {WEB_LIVE_WIDGETS_DIR}")

    # Auto-sync live theme / widget / SVG counts into README.md & README_ZH.md
    theme_svg_total = sum(int(item["svgCount"]) for item in manifest)
    svgs_per_theme = int(manifest[0]["svgCount"]) if manifest else 0
    sync_readme_counts(len(manifest), svgs_per_theme, theme_svg_total, live_svg_total)

    # Verify canonical brand icon parity (assets/logo.svg == web/public/favicon.svg)
    validate_brand_icon_parity()

    # Sync standard Agent Skill (SKILL.md) into web/public/skill/
    if SKILL_FILE.exists():
        WEB_SKILL_DIR.mkdir(parents=True, exist_ok=True)
        shutil.copy2(SKILL_FILE, WEB_SKILL_DIR / "SKILL.md")
        print(f"Synced Agent SKILL.md into {WEB_SKILL_DIR}")


if __name__ == "__main__":
    main()
