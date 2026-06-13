# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AboutRun:
  """
  一つの paragraph 内で通常文又は inline code として描画する文字列 run を表す。
  `kind` は renderer の明示分岐に用い、`text` の空白、句読点、改行を Markdown 推測で変更しない。
  """

  kind: str
  text: str


@dataclass(frozen=True)
class AboutBlock:
  """
  About section 内の paragraph、run paragraph、code value、code block の一表示単位を表す。
  単純 block は `text`、構造化 paragraph は順序付き `runs` を使用し、両者の表示 semantics を混在させない。
  """

  kind: str
  text: str = ""
  runs: tuple[AboutRun, ...] = ()


@dataclass(frozen=True)
class AboutSection:
  """
  About page の見出しと、その直下へ順序付きで描画する block 列を保持する。
  content module はこの不変値だけを構築し、Qt widget の生成と layout 制御は settings 側 renderer に委ねる。
  """

  title: str
  blocks: tuple[AboutBlock, ...]


def text_run(text: str) -> AboutRun:
  """
  paragraph 内の通常文を表す run を生成する。
  renderer は入力順と文字列を変更せず、code run と連結した際の空白、句読点、改行位置を保持する。
  """
  return AboutRun(kind="text", text=str(text))


def code_run(text: str) -> AboutRun:
  """
  paragraph 内で code design を適用する値、path、command、identifier を表す run を生成する。
  値そのものだけを保持し、backtick delimiter は renderer 入力へ渡さない。
  """
  return AboutRun(kind="code", text=str(text))


def inline_code(text: str) -> AboutRun:
  """
  `code_run()` と同じ inline code contract を明示名で提供する。
  About content の文脈に応じて helper 名を選べるが、生成される run semantics は同一である。
  """
  return code_run(str(text))


def paragraph_runs(*runs: AboutRun) -> AboutBlock:
  """
  通常文と inline code を順序付き run 列として一つの paragraph block に固定する。
  renderer は Markdown parsing を行わず、この列をそのまま一文として描画する。
  """
  return AboutBlock(kind="paragraph_runs", runs=tuple(runs))


def paragraph(*parts: str | AboutRun) -> AboutBlock:
  """
  通常文又は明示的に構造化された text/code run 列から paragraph block を生成する。
  単一文字列は通常 paragraph とし、run が含まれる場合は入力順を保持した paragraph_runs として扱う。
  """
  if len(parts) == 1 and isinstance(parts[0], str):
    return AboutBlock(kind="paragraph", text=str(parts[0]))
  runs = tuple(text_run(part) if isinstance(part, str) else part for part in parts)
  return paragraph_runs(*runs)


def code_block(text: str) -> AboutBlock:
  """
  改行を含み得る独立 code block を生成する。
  renderer は入力文字列を等幅表示へ渡し、paragraph の inline code として再解釈しない。
  """
  return AboutBlock(kind="code", text=str(text))


def code_value(text: str) -> AboutBlock:
  """
  一行の独立した code value を複数行 code block と区別して生成する。
  path、metadata value、license identifier などを paragraph から分離して示す場合に用いる。
  """
  return AboutBlock(kind="code_value", text=str(text))
