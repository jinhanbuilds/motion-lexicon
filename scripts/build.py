#!/usr/bin/env python3
"""Build the standalone lexicon, source gallery, and readable keyword handbook."""
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
LEX = ROOT / "src" / "lexicon"
GALLERY = ROOT / "src" / "gallery"


def inline_js(text):
    return text.replace("</script", "<\\/script").replace("<!--", "<\\!--")


def inline_json(data):
    return json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def standalone(body, title, description):
    return ("<!doctype html>\n<html lang=\"zh-CN\">\n<head>\n"
            "<meta charset=\"utf-8\">\n"
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n"
            f"<title>{title}</title>\n<meta name=\"description\" content=\"{description}\">\n"
            "<style>body{margin:0}</style>\n</head>\n<body>\n" + body + "\n</body>\n</html>\n")


def validate(data, catalog, demos):
    ids = [k["id"] for k in data["keywords"]]
    assert len(ids) == len(set(ids)), "Duplicate keyword IDs"
    known = set(ids)
    registered = set(re.findall(r"LEX\.register\(\s*['\"]([^'\"]+)['\"]", demos))
    registered.update(re.findall(r"combo\(\s*'(sc-[^']+)'", demos))
    required = known | {"sc-" + s["id"] for s in data["scenarios"]}
    assert required <= registered, f"Missing demos: {sorted(required - registered)}"
    for keyword in data["keywords"]:
        assert set(keyword["pairs"]) <= known, f"Unknown pairs: {keyword['id']}"
    for scenario in data["scenarios"]:
        assert set(scenario["keys"]) <= known, f"Unknown recipe keys: {scenario['id']}"
        assert set(scenario["show"]) <= set(scenario["keys"]), scenario["id"]
    for rewrite in data["method"]["rewrites"]:
        assert set(rewrite["keys"]) <= known, rewrite["vague"]
    for step in data["anatomy"]:
        assert set(step["add"]) <= known, step["title"]
    case_ids = {item["id"] for item in catalog["items"]}
    assert len(case_ids) == len(catalog["items"]), "Duplicate case IDs"
    for item in catalog["items"]:
        assert (ROOT / "gallery" / "demos" / (item["id"] + ".html")).is_file(), item["id"]
    for keyword in data["keywords"]:
        case_refs = {ref for ref in keyword["src"] if re.match(r"^[vw]\d+-", ref)}
        assert case_refs <= case_ids, f"Unknown case sources: {keyword['id']}"
    assert data["gallery"] == "gallery/index.html", "Gallery must resolve within this package"


def handbook(data):
    lines = ["# 动效关键词手册", "", "[打开交互词典](../index.html) · [配方器使用说明书](usage.md)", "",
             f"词条来源数据截至 {data['as_of']}。文字版由当前词典数据生成，共 {len(data['keywords'])} 个词。", ""]
    for layer in data["layers"]:
        lines.extend([f"## {layer['id']} {layer['zh']}", "", layer["what"], ""])
        for k in (k for k in data["keywords"] if k["layer"] == layer["id"]):
            lines.extend([f"### {k['zh']} · `{k['id']}`", "", k["what"], "",
                          "**中文写法**", "", k["zh_phrase"], "", "**英文写法**", "", "```text", k["en"], "```", "",
                          f"**看点：**{k['see']}", "", f"**适用：**{'、'.join(k['when'])}", ""])
            if k["avoid"]:
                lines.extend([f"**避坑：**{k['avoid']}", ""])
            if k["src"]:
                refs = [f"[{ref}](../gallery/index.html#{ref})" if re.match(r"^[vw]\d+-", ref) else ref for ref in k["src"]]
                lines.extend(["**来源：**" + " · ".join(refs), ""])
    return "\n".join(lines)


def main():
    subprocess.run([sys.executable, str(ROOT / "scripts/generate_lexicon.py")], check=True, stdout=subprocess.DEVNULL)
    data = json.loads((LEX / "data/lexicon.json").read_text(encoding="utf-8"))
    catalog = json.loads((GALLERY / "catalog.json").read_text(encoding="utf-8"))
    demos = "\n".join(f"/* ── {p.name} ── */\n" + p.read_text(encoding="utf-8") for p in sorted((LEX / "demos").glob("*.js")))
    validate(data, catalog, demos)
    page = (LEX / "shell/index.html").read_text(encoding="utf-8")
    replacements = {
        "/*__RUNTIME__*/": inline_js((LEX / "runtime/lex-runtime.js").read_text(encoding="utf-8")),
        "/*__SCENE__*/": inline_js((LEX / "shell/scene.js").read_text(encoding="utf-8")),
        "/*__DEMOS__*/": inline_js(demos),
        "__LEXICON__": inline_json(data),
    }
    for placeholder, value in replacements.items():
        assert page.count(placeholder) == 1, f"Expected one placeholder: {placeholder}"
        page = page.replace(placeholder, value, 1)
    (ROOT / "index.html").write_text(standalone(page, "动效词典", "75 个实时动效词、10 套场景配方，选词与内容组装成中英文提示词。"), encoding="utf-8")
    gallery = (GALLERY / "index.html").read_text(encoding="utf-8")
    assert gallery.count("__CATALOG__") == 1
    gallery = gallery.replace("__CATALOG__", inline_json(catalog))
    gallery = gallery.replace("<title>Opus 5.5 动效片库</title>\n", "", 1)
    (ROOT / "gallery/index.html").write_text(standalone(gallery, "Opus 5.5 动效片库", "22 条动效案例，保留提示词、演示与原始出处。"), encoding="utf-8")
    (ROOT / "docs/keywords.md").write_text(handbook(data), encoding="utf-8")
    print(f"Built: {len(data['keywords'])} keywords, {len(data['scenarios'])} recipes, {len(catalog['items'])} source cases")


if __name__ == "__main__":
    main()
