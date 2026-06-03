# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets
from pathlib import Path

from ludoxel.shared.shared_project_paths import runtime_integrity_key_path, runtime_state_manifest_path

_ALGORITHM = "hmac-sha256"
PROTECTED_RUNTIME_RELATIVE_PATHS = ("state/player_state.json", "state/world_state.json", "state/player_skin.png", "state/othello_opening_book.json")


def _display_relative(path: str | Path) -> str:
  return Path(path).as_posix()


def _runtime_file_path(data_root: Path, relative_path: str | Path) -> Path:
  return Path(data_root) / Path(relative_path)


def _read_manifest(data_root: Path) -> dict[str, object]:
  manifest_path = runtime_state_manifest_path(Path(data_root))
  if not manifest_path.is_file():
    return {}
  try:
    raw = json.loads(manifest_path.read_text(encoding="utf-8"))
  except Exception:
    return {}
  return raw if isinstance(raw, dict) else {}


def _write_manifest(data_root: Path, manifest: dict[str, object]) -> None:
  manifest_path = runtime_state_manifest_path(Path(data_root))
  manifest_path.parent.mkdir(parents=True, exist_ok=True)
  payload = json.dumps(manifest, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
  tmp = manifest_path.with_suffix(manifest_path.suffix + ".tmp")
  tmp.write_text(payload, encoding="utf-8", newline="\n")
  os.replace(str(tmp), str(manifest_path))


def _load_or_create_integrity_key(data_root: Path) -> bytes:
  key_path = runtime_integrity_key_path(Path(data_root))
  if key_path.is_file():
    try:
      key = key_path.read_bytes()
      if len(key) >= 32:
        return bytes(key)
    except OSError:
      pass

  key_path.parent.mkdir(parents=True, exist_ok=True)
  key = secrets.token_bytes(32)
  tmp = key_path.with_suffix(key_path.suffix + ".tmp")
  tmp.write_bytes(key)
  os.replace(str(tmp), str(key_path))
  try:
    key_path.chmod(0o600)
  except OSError:
    pass
  return bytes(key)


def _file_hmac(data_root: Path, relative_path: str | Path, key: bytes) -> str | None:
  path = _runtime_file_path(Path(data_root), relative_path)
  if not path.is_file():
    return None
  digest = hmac.new(bytes(key), digestmod=hashlib.sha256)
  digest.update(_display_relative(relative_path).encode("utf-8"))
  digest.update(b"\0")
  with open(path, "rb") as handle:
    while True:
      chunk = handle.read(1024 * 1024)
      if not chunk:
        break
      digest.update(chunk)
  return str(digest.hexdigest())


def verify_runtime_file(data_root: Path, relative_path: str | Path) -> bool:
  path = _runtime_file_path(Path(data_root), relative_path)
  if not path.exists():
    return True

  manifest = _read_manifest(Path(data_root))
  files = manifest.get("files", {})
  if not isinstance(files, dict) or not files:
    return True

  key_path = runtime_integrity_key_path(Path(data_root))
  if not key_path.is_file():
    return False

  try:
    key = key_path.read_bytes()
  except OSError:
    return False

  expected_entry = files.get(_display_relative(relative_path))
  if not isinstance(expected_entry, dict):
    return True

  expected = expected_entry.get("hmac")
  actual = _file_hmac(Path(data_root), relative_path, bytes(key))
  return isinstance(expected, str) and isinstance(actual, str) and hmac.compare_digest(str(expected), str(actual))


def update_runtime_integrity_manifest(data_root: Path, relative_paths: tuple[str, ...] = PROTECTED_RUNTIME_RELATIVE_PATHS) -> None:
  root = Path(data_root)
  key = _load_or_create_integrity_key(root)
  existing = _read_manifest(root)
  files = existing.get("files", {})
  normalized_files = dict(files) if isinstance(files, dict) else {}

  for relative_path in tuple(relative_paths):
    display = _display_relative(relative_path)
    digest = _file_hmac(root, display, key)
    if digest is None:
      normalized_files.pop(display, None)
      continue
    normalized_files[display] = {"hmac": str(digest)}

  _write_manifest(root, {"version": 1, "algorithm": _ALGORITHM, "files": normalized_files})
