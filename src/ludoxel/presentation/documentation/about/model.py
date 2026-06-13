# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AboutRun:
  """
  About paragraph 内で通常文又は inline code として描画する文字列 run を表す。
  Markdown 風の推測ではなく、renderer が明示的に kind を見て描画する。
  """

  kind: str
  text: str


@dataclass(frozen=True)
class AboutBlock:
  """
  About text から分解された paragraph、inline code を含む paragraph、又は code block を表す。
  """

  kind: str
  text: str = ""
  runs: tuple[AboutRun, ...] = ()


def text_run(text: str) -> AboutRun:
  return AboutRun(kind="text", text=str(text))


def code_run(text: str) -> AboutRun:
  return AboutRun(kind="code", text=str(text))


def paragraph(text: str) -> AboutBlock:
  return AboutBlock(kind="paragraph", text=str(text))


def paragraph_runs(*runs: AboutRun) -> AboutBlock:
  return AboutBlock(kind="paragraph_runs", runs=tuple(runs))


def code_block(text: str) -> AboutBlock:
  return AboutBlock(kind="code", text=str(text).rstrip("\n"))
