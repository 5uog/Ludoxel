# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AboutRun:
  kind: str
  text: str


@dataclass(frozen=True)
class AboutBlock:
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
