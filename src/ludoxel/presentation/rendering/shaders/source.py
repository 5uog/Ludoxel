# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import re
from pathlib import Path

_INCLUDE_RE = re.compile(r'^\s*#include\s+"([^"]+)"\s*$')


def shader_source_root() -> Path:
  return Path(__file__).resolve().parent


def _expand(path: Path, *, collapse_blank_before_include: bool, stack: tuple[Path, ...]) -> str:
  src = Path(path).resolve()
  if src in stack:
    chain = " -> ".join(str(p) for p in (*stack, src))
    raise RuntimeError(f"Shader include cycle detected: {chain}")

  try:
    raw = src.read_text(encoding="utf-8")
  except OSError as exc:
    raise RuntimeError(f"Unable to read shader source: {src}") from exc

  next_stack = (*stack, src)
  out: list[str] = []

  for raw_line in raw.splitlines(keepends=True):
    line = raw_line.rstrip("\r\n")
    match = _INCLUDE_RE.match(line)
    if match is None:
      out.append(raw_line)
      continue

    if bool(collapse_blank_before_include):
      while out and out[-1].strip() == "":
        out.pop()

    included = _expand(src.parent / match.group(1), collapse_blank_before_include=collapse_blank_before_include, stack=next_stack)
    if included and (not included.endswith("\n")):
      included += "\n"
    out.append(included)

  return "".join(out)


def expand_shader_source(path: Path, *, collapse_blank_before_include: bool = False) -> str:
  return _expand(Path(path), collapse_blank_before_include=bool(collapse_blank_before_include), stack=())


def load_shader_source(name: str, *, collapse_blank_before_include: bool = False) -> str:
  return expand_shader_source(shader_source_root() / str(name), collapse_blank_before_include=bool(collapse_blank_before_include))
