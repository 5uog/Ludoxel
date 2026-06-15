# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

STYLE_SHEET_FILES: tuple[str, ...] = ("base.qss", "hud.qss", "surfaces.qss", "cards.qss", "buttons.qss", "controls.qss", "about.qss", "adjuncts.qss")


def load_theme_stylesheet(styles_dir: Path) -> str:
  """
  責務別に分割された theme QSS 群を `STYLE_SHEET_FILES` が定める固定順序で結合し、application 全体へ適用する単一の QSS 文字列を返す。
  入力 `styles_dir` は分割 QSS file を収めた `theme/styles` directory の path であり、各 file は `STYLE_SHEET_FILES` の並び順に読み込まれる。
  QSS の selector は objectName と widget 型で互いに素であるため、この結合順序は cascade の結果を変えないが、将来 selector が衝突した場合に挙動を一義に保つため、読み込み順序を文字列 tuple として実装上明示的に固定する。
  返値は arrow icon の差し替え用 placeholder (`__ARROW_UP__`、`__ARROW_DOWN__`) を未置換のまま含み、resource path への置換は呼び出し側 composition root が resource root 確定後に一度だけ行う。
  存在しない file は欠落として無視し、読み込めた file だけを改行で連結する。すべての file が欠落していた場合は空文字列を返し、呼び出し側は font stylesheet のみを適用する経路へ退避できる。
  """
  base = Path(styles_dir)
  fragments: list[str] = []
  for name in STYLE_SHEET_FILES:
    path = base / name
    if not path.is_file():
      continue
    fragments.append(path.read_text(encoding="utf-8"))
  return "\n".join(fragments)
