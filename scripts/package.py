#!/usr/bin/env python3
"""Create a runnable source bundle without local caches or Git history."""
import argparse
from pathlib import Path
import subprocess
import sys
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parent.parent
TOP_FILES = {"README.md", "CREDITS.md", ".gitignore", "index.html", "prompts.md"}
TOP_DIRS = {"src", "scripts", "gallery", "docs"}
SKIP = {".DS_Store", "__pycache__", "node_modules"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=ROOT.parent / (ROOT.name + ".zip"))
    args = parser.parse_args()
    output = args.out.resolve()
    subprocess.run([sys.executable, str(ROOT / "scripts/build.py")], check=True)
    files = [p for p in ROOT.rglob("*") if p.is_file()
             and (p.relative_to(ROOT).parts[0] in TOP_DIRS or p.relative_to(ROOT).as_posix() in TOP_FILES)
             and not any(part in SKIP for part in p.relative_to(ROOT).parts)
             and p.suffix not in {".zip", ".pyc", ".pyo"} and p != output]
    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output, "w", ZIP_DEFLATED) as archive:
        for p in sorted(files):
            archive.write(p, ROOT.name + "/" + p.relative_to(ROOT).as_posix())
    with ZipFile(output) as archive:
        assert archive.testzip() is None, "ZIP CRC check failed"
        for p in files:
            assert archive.read(ROOT.name + "/" + p.relative_to(ROOT).as_posix()) == p.read_bytes()
    print(f"Packaged: {output} ({len(files)} files, {output.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
