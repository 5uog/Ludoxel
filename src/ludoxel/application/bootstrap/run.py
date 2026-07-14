# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import os
import sys
from pathlib import Path

from ludoxel.foundations.locations.roots import default_project_root, default_resource_root, default_runtime_data_root, is_frozen_application


def _preferred_python_314() -> Path | None:
  local_app_data = os.environ.get("LocalAppData", "").strip()
  candidates: list[Path] = []
  if local_app_data:
    candidates.append(Path(local_app_data) / "Programs" / "Python" / "Python314" / "python.exe")

  current_exe = Path(sys.executable).resolve()
  current_parent = current_exe.parent
  if str(current_parent.name).startswith("Python31"):
    candidates.append(current_parent.parent / "Python314" / "python.exe")

  for candidate in candidates:
    resolved = Path(candidate).resolve()
    if not resolved.is_file():
      continue
    if resolved == current_exe:
      continue
    return resolved
  return None


def _run_windows_python_314_child(argv: list[str], *, env: dict[str, str], cwd: Path) -> int:
  import subprocess

  process = subprocess.Popen(argv, env=env, cwd=str(cwd))
  while True:
    try:
      return int(process.wait())
    except KeyboardInterrupt:
      continue


def _ensure_python_314(project_root: Path) -> None:
  if is_frozen_application():
    return
  if sys.version_info[:2] == (3, 14):
    return

  candidate = _preferred_python_314()
  if candidate is None:
    return

  env = dict(os.environ)
  src_root = project_root / "src"
  if src_root.is_dir():
    existing_python_path = str(env.get("PYTHONPATH", "")).strip()
    env["PYTHONPATH"] = str(src_root) if not existing_python_path else str(src_root) + os.pathsep + str(existing_python_path)

  argv = [str(candidate), "-m", "ludoxel", *sys.argv[1:]]
  if os.name == "nt":
    raise SystemExit(int(_run_windows_python_314_child(argv, env=env, cwd=project_root)))

  os.execve(str(candidate), argv, env)


def run_app() -> None:
  project_root = default_project_root(Path(__file__))
  resource_root = default_resource_root(Path(__file__))
  data_root = default_runtime_data_root(project_root)
  _ensure_python_314(project_root)

  from ludoxel.application.persistence.stores.othello_book import install_othello_book_storage_hooks
  from ludoxel.presentation.interface.windows.main import run_app as _run

  install_othello_book_storage_hooks()
  _run(project_root=project_root, resource_root=resource_root, data_root=data_root)
