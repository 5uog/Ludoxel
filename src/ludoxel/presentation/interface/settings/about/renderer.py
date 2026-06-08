# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Callable, Iterable

from PyQt6.QtWidgets import QLabel, QVBoxLayout, QWidget

from ludoxel.presentation.interface.settings.about.content import AboutBlock, AboutSection
from ludoxel.presentation.interface.settings.about.widgets import about_code_block


def _fence_length(line: str) -> int:
  stripped = str(line).strip()
  if not stripped.startswith("``"):
    return 0
  count = 0
  for char in stripped:
    if char != "`":
      break
    count += 1
  if count >= 3:
    return 3
  if count >= 2:
    return 2
  return 0


def _paragraph_blocks_from_text(text: str) -> tuple[AboutBlock, ...]:
  lines = str(text).splitlines()
  if not lines:
    return ()

  blocks: list[AboutBlock] = []
  paragraph_lines: list[str] = []
  code_lines: list[str] = []
  active_fence = 0

  def flush_paragraph() -> None:
    if not paragraph_lines:
      return
    paragraph = " ".join(line.strip() for line in paragraph_lines if line.strip()).strip()
    paragraph_lines.clear()
    if paragraph:
      blocks.append(AboutBlock(kind="paragraph", text=paragraph))

  def flush_code() -> None:
    if not code_lines:
      return
    code = "\n".join(code_lines).rstrip("\n")
    code_lines.clear()
    if code:
      blocks.append(AboutBlock(kind="code", text=code))

  for raw_line in lines:
    line = str(raw_line)
    fence = _fence_length(line)
    if active_fence:
      if fence >= active_fence:
        flush_code()
        active_fence = 0
      else:
        code_lines.append(line)
      continue

    if fence:
      flush_paragraph()
      active_fence = int(fence)
      continue

    if not line.strip():
      flush_paragraph()
      continue

    paragraph_lines.append(line)

  if active_fence:
    flush_code()
  flush_paragraph()
  return tuple(blocks)


def _normalized_blocks(blocks: Iterable[AboutBlock]) -> tuple[AboutBlock, ...]:
  normalized: list[AboutBlock] = []
  for block in tuple(blocks):
    kind = str(block.kind).strip().lower()
    text = str(block.text)
    if not text.strip():
      continue
    if kind == "code":
      normalized.append(AboutBlock(kind="code", text=text))
      continue
    normalized.extend(_paragraph_blocks_from_text(text))
  return tuple(normalized)


def render_about_sections(
  *,
  parent: QWidget,
  layout: QVBoxLayout,
  sections: Iterable[AboutSection],
  text_factory: Callable[[QWidget, str, str], QLabel],
) -> None:
  for section in tuple(sections):
    title = str(section.title).strip()
    if title:
      heading = QLabel(title, parent)
      heading.setObjectName("aboutSectionTitle")
      heading.setWordWrap(True)
      layout.addWidget(heading)

    for block in _normalized_blocks(section.blocks):
      if block.kind == "code":
        layout.addWidget(about_code_block(parent, block.text))
      else:
        layout.addWidget(text_factory(parent, block.text, "subtitle"))
