#!/usr/bin/env python3
"""Build the ZIP for manual import into MacHelper."""

import json
import re
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "MacHelperExtension"
EXCLUDED = {"marketplace", "node_modules", "__pycache__", "ai_deployment.md"}


def runtime_files(directory):
    for path in sorted(directory.iterdir()):
        if path.name.startswith(".") or path.name.casefold() in EXCLUDED:
            continue
        if path.is_symlink():
            raise ValueError(f"Source packages cannot contain symbolic links: {path.relative_to(PACKAGE)}")
        if path.is_dir():
            yield from runtime_files(path)
        elif path.is_file():
            yield path
        else:
            raise ValueError(f"Expected a regular source file: {path.relative_to(PACKAGE)}")


def main():
    manifest = json.loads((PACKAGE / "extension.json").read_text(encoding="utf-8"))
    name, version = manifest["displayName"], manifest["version"]
    if not re.fullmatch(r"[A-Za-z0-9_-]+", name) or not re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+", version):
        raise ValueError("Expected a simple package name and numeric major.minor.patch version.")
    folder = f"{name}-{version}"
    paths = list(runtime_files(PACKAGE))
    output = ROOT / "dist" / f"{folder}.zip"
    output.parent.mkdir(exist_ok=True)
    with ZipFile(output, "w") as archive:
        for path in paths:
            member = ZipInfo(f"{folder}/{path.relative_to(PACKAGE).as_posix()}")
            archive.writestr(member, path.read_bytes(), ZIP_DEFLATED)
    print(output)


if __name__ == "__main__":
    main()
