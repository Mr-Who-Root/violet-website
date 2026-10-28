"""Stamp local asset URLs with a content hash.

GitHub Pages lets browsers cache CSS and JS for 10 minutes. Without a version
in the URL, a visitor can get a new page with an old stylesheet. Run this after
changing any file under assets/ and before committing:

    python3 tools/stamp.py
"""
import hashlib
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ("index.html", "404.html")
ASSET_REF = re.compile(r'((?:href|src)="(assets/[^"?]+))(?:\?v=[0-9a-f]+)?"')


def digest(relative_path: str) -> str:
    target = ROOT / relative_path
    if not target.is_file():
        sys.exit(f"missing asset referenced by a page: {relative_path}")
    return hashlib.sha256(target.read_bytes()).hexdigest()[:10]


def main() -> None:
    for page in PAGES:
        path = ROOT / page
        text = path.read_text(encoding="utf-8")
        stamped = ASSET_REF.sub(lambda m: f'{m.group(1)}?v={digest(m.group(2))}"', text)
        if stamped != text:
            path.write_text(stamped, encoding="utf-8")
            print(f"stamped {page}")
        else:
            print(f"{page} already current")


if __name__ == "__main__":
    main()
