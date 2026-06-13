# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Callable, Iterable

from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QLabel, QSizePolicy, QVBoxLayout, QWidget

from ludoxel.presentation.documentation.about.model import AboutBlock, AboutRun, code_block, code_run, paragraph, paragraph_runs, text_run
from ludoxel.presentation.interface.settings.about.widgets import about_code_block, about_inline_paragraph


def _fence_length(line: str) -> int:
  stripped = str(line).strip()
  if not stripped.startswith("```"):
    return 0
  count = 0
  for char in stripped:
    if char != "`":
      break
    count += 1
  return count if count >= 3 else 0


def _inline_runs_from_text(text: str) -> tuple[AboutRun, ...]:
  source = str(text)
  runs: list[AboutRun] = []
  text_buffer: list[str] = []
  code_buffer: list[str] = []
  in_code = False
  index = 0

  while index < len(source):
    char = source[index]
    if char == "`":
      if in_code:
        runs.append(code_run("".join(code_buffer)))
        code_buffer.clear()
        in_code = False
      else:
        if text_buffer:
          runs.append(text_run("".join(text_buffer)))
          text_buffer.clear()
        in_code = True
      index += 1
      continue

    if in_code:
      code_buffer.append(char)
    else:
      text_buffer.append(char)
    index += 1

  if in_code:
    text_buffer.append("`")
    text_buffer.extend(code_buffer)
  if text_buffer:
    runs.append(text_run("".join(text_buffer)))

  if len(runs) == 1 and str(runs[0].kind) == "text":
    return ()
  return tuple(runs)


def _paragraph_block_from_lines(lines: list[str]) -> AboutBlock | None:
  text = " ".join(line.strip() for line in lines if line.strip()).strip()
  if not text:
    return None
  runs = _inline_runs_from_text(text)
  if runs:
    return paragraph_runs(*runs)
  return paragraph(text)


def blocks_from_about_text(text: str) -> tuple[AboutBlock, ...]:
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
    block = _paragraph_block_from_lines(paragraph_lines)
    paragraph_lines.clear()
    if block is not None:
      blocks.append(block)

  def flush_code() -> None:
    if not code_lines:
      return
    blocks.append(code_block("\n".join(code_lines).rstrip("\n")))
    code_lines.clear()

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


def render_about_text(*, parent: QWidget, layout: QVBoxLayout, text: str, text_factory: Callable[[QWidget, str, str], QWidget], object_name: str = "subtitle") -> None:
  layout.setAlignment(Qt.AlignmentFlag.AlignTop)
  for block in blocks_from_about_text(str(text)):
    kind = str(block.kind).strip().lower()
    if kind == "code":
      layout.addWidget(about_code_block(parent, block.text))
    elif kind == "paragraph_runs":
      layout.addWidget(about_inline_paragraph(parent, block.runs, object_name=object_name))
    else:
      layout.addWidget(text_factory(parent, block.text, object_name))


def render_about_paragraphs(*, parent: QWidget, layout: QVBoxLayout, paragraphs: Iterable[str], text_factory: Callable[[QWidget, str, str], QWidget], object_name: str = "subtitle") -> None:
  layout.setAlignment(Qt.AlignmentFlag.AlignTop)
  for paragraph_text in tuple(paragraphs):
    render_about_text(parent=parent, layout=layout, text=str(paragraph_text), text_factory=text_factory, object_name=object_name)


def add_about_section_title(parent: QWidget, layout: QVBoxLayout, title: str) -> None:
  heading = QLabel(str(title), parent)
  heading.setObjectName("aboutSectionTitle")
  heading.setWordWrap(True)
  heading.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
  layout.addWidget(heading)
