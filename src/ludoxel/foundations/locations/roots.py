# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import os
import sys
from pathlib import Path


def _start_directory(path: Path) -> Path:
  """
  探索開始点を file path と directory path の双方から同じ directory 基準へ正規化する。
  入力が file の場合は親 directory、directory の場合はその解決済み path を返し、project root 探索と resource root 探索の起点を一致させる。
  """
  resolved = Path(path).resolve()
  return resolved.parent if resolved.is_file() else resolved


def is_frozen_application() -> bool:
  """
  現在の Python 実行環境が PyInstaller などの frozen application であるかを判定する。
  `sys.frozen` の真偽だけを読み、application bootstrap と resource root 解決はこの基礎述語により source tree 実行と packaged 実行を分岐する。
  """
  return bool(getattr(sys, "frozen", False))


def frozen_application_root() -> Path | None:
  if not is_frozen_application():
    return None
  try:
    return Path(sys.executable).resolve().parent
  except Exception:
    return None


def frozen_resource_root() -> Path | None:
  """
  frozen application に同梱された resource root を PyInstaller の `_MEIPASS` 又は実行ファイル周辺から解決する。
  `_internal` directory が存在する場合はそれを優先し、解決不能時は application root を返すため、
  packaged build は source tree と異なる resource 配置を同じ契約で扱える。
  """
  if not is_frozen_application():
    return None

  try:
    meipass = getattr(sys, "_MEIPASS", None)
  except Exception:
    meipass = None

  if meipass:
    try:
      return Path(meipass).resolve()
    except Exception:
      pass

  application_root = frozen_application_root()
  if application_root is None:
    return None

  internal_root = application_root / "_internal"
  if internal_root.is_dir():
    try:
      return internal_root.resolve()
    except Exception:
      return internal_root

  return application_root


def is_project_root(path: Path) -> bool:
  """
  指定 directory が Ludoxel の project root とみなせるかを marker file と主要 directory で判定する。
  `pyproject.toml` が存在する場合を最優先とし、補助条件として `assets` と `src` の同時存在を認めるため、
  開発 tree と export tree の双方を探索対象にできる。
  """
  root = Path(path).resolve()
  if (root / "pyproject.toml").is_file():
    return True
  return (root / "assets").is_dir() and (root / "src").is_dir()


def search_project_root(start: Path) -> Path | None:
  """
  開始 path から親方向へ上昇し、最初に見つかった Ludoxel project root を返す。
  filesystem root に到達しても marker が見つからない場合は `None` を返し、
  bootstrap は working directory 又は start directory へ段階的に退避する。
  """
  cursor = _start_directory(start)

  while True:
    if is_project_root(cursor):
      return cursor

    parent = cursor.parent
    if parent == cursor:
      return None
    cursor = parent


def default_project_root(start: Path) -> Path:
  """
  実行形式と探索結果に基づき、application が project root として扱う directory を決定する。
  frozen root、module 起点からの project root、current working directory 起点の project root、
  start directory の順に選ぶため、`run_app` と Othello book storage は同じ root 解決規則を共有する。
  """
  frozen_root = frozen_application_root()
  if frozen_root is not None:
    return frozen_root

  module_root = search_project_root(start)
  if module_root is not None:
    return module_root

  working_root = search_project_root(Path.cwd())
  if working_root is not None:
    return working_root

  return _start_directory(start)


def default_resource_root(start: Path) -> Path:
  """
  package resource を探す基準 directory を source tree 実行と frozen 実行の双方で解決する。
  frozen resource root を優先し、source tree では project root 探索へ退避するため、
  theme、shader、opening book などの package data は実行形式の差を隠蔽して参照される。
  """
  frozen_root = frozen_resource_root()
  if frozen_root is not None:
    return frozen_root

  module_root = search_project_root(start)
  if module_root is not None:
    return module_root

  working_root = search_project_root(Path.cwd())
  if working_root is not None:
    return working_root

  return _start_directory(start)


def default_runtime_data_root(project_root: Path | None = None) -> Path:
  """
  ユーザー別 runtime data root を環境変数、OS 標準位置、XDG 規則から決定する。
  `LUDOXEL_DATA_ROOT` を最優先し、Windows は LocalAppData、macOS は Application Support、
  その他は XDG 又は `~/.local/share/ludoxel` を返すため、保存 file は repository root から分離される。
  """
  env_root = os.environ.get("LUDOXEL_DATA_ROOT", "").strip()
  if env_root:
    return Path(env_root).expanduser().resolve()

  if sys.platform.startswith("win"):
    base = os.environ.get("LOCALAPPDATA", "").strip() or os.environ.get("AppData", "").strip()
    if base:
      return (Path(base).expanduser() / "Ludoxel").resolve()

  if sys.platform == "darwin":
    return (Path.home() / "Library" / "Application Support" / "Ludoxel").resolve()

  xdg_data_home = os.environ.get("XDG_DATA_HOME", "").strip()
  if xdg_data_home:
    return (Path(xdg_data_home).expanduser() / "ludoxel").resolve()

  if project_root is not None:
    try:
      _ = Path(project_root).resolve()
    except Exception:
      pass

  return (Path.home() / ".local" / "share" / "ludoxel").resolve()


def runtime_state_root(data_root: Path) -> Path:
  """
  runtime data root の下にある永続状態 directory を返す。
  返値は `state` 固定の child path であり、player state、world state、integrity manifest、user opening book の保存先構成がこの関数に依存する。
  """
  return Path(data_root) / "state"


def runtime_cache_root(data_root: Path) -> Path:
  """
  runtime data root の下にある再生成可能 cache directory を返す。
  返値は `cache` 固定の child path であり、compiled opening book cache など state から再構築できる file の置き場として使われる。
  """
  return Path(data_root) / "cache"


def runtime_state_manifest_path(data_root: Path) -> Path:
  """
  runtime state directory 内の integrity manifest file path を返す。
  application persistence はこの path に HMAC manifest を保存し、foundations 層は保存内容の意味を所有せず path 契約だけを提供する。
  """
  return runtime_state_root(data_root) / "state_manifest.json"


def runtime_integrity_key_path(data_root: Path) -> Path:
  """
  runtime state directory 内の integrity key file path を返す。
  manifest 更新と検証は application persistence が行い、この関数は key file の配置を一貫させる基礎 path contract を与える。
  """
  return runtime_state_root(data_root) / "integrity_key.bin"


def previous_configs_root(project_root: Path) -> Path:
  """
  旧仕様の repository-local `configs` directory を project root から導く。
  application persistence は移行読取の補助 path として参照し、現在の通常保存先は runtime data root 系の path を用いる。
  """
  return Path(project_root) / "configs"
