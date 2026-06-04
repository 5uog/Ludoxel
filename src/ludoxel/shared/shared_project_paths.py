# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import os
import sys
from pathlib import Path


def _start_directory(path: Path) -> Path:
  resolved = Path(path).resolve()
  return resolved.parent if resolved.is_file() else resolved


def is_frozen_application() -> bool:
  return bool(getattr(sys, "frozen", False))


def frozen_application_root() -> Path | None:
  if not is_frozen_application():
    return None
  try:
    return Path(sys.executable).resolve().parent
  except Exception:
    return None


def frozen_resource_root() -> Path | None:
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
  root = Path(path).resolve()
  if (root / "pyproject.toml").is_file():
    return True
  return (root / "assets").is_dir() and (root / "src").is_dir()


def search_project_root(start: Path) -> Path | None:
  cursor = _start_directory(start)

  while True:
    if is_project_root(cursor):
      return cursor

    parent = cursor.parent
    if parent == cursor:
      return None
    cursor = parent


def default_project_root(start: Path) -> Path:
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
  return Path(data_root) / "state"


def runtime_cache_root(data_root: Path) -> Path:
  return Path(data_root) / "cache"


def runtime_state_manifest_path(data_root: Path) -> Path:
  return runtime_state_root(data_root) / "state_manifest.json"


def runtime_integrity_key_path(data_root: Path) -> Path:
  return runtime_state_root(data_root) / "integrity_key.bin"


def previous_configs_root(project_root: Path) -> Path:
  return Path(project_root) / "configs"
