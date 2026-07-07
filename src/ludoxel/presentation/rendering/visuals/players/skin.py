# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

from PyQt6.QtGui import QImage

from ludoxel.application.persistence.integrity.manifest import update_runtime_integrity_manifest, verify_runtime_file
from ludoxel.application.preferences.player_skin import PLAYER_SKIN_KIND_CUSTOM, normalize_player_skin_kind
from ludoxel.foundations.locations.roots import runtime_state_root
from ludoxel.simulation.actors.ai_players.state import normalize_ai_skin_id

_SKIN_WIDTH = 64
_SKIN_HEIGHT = 64

AI_BUNDLED_TIMO_SKIN_KEY: str = "timo"


def default_player_skin_path(resource_root: Path) -> Path:
  return Path(resource_root) / "assets" / "ludoxel" / "skins" / "timo.png"


def custom_player_skin_path(data_root: Path) -> Path:
  return runtime_state_root(Path(data_root)) / "player_skin.png"


def normalize_player_skin_image(image: QImage) -> QImage:
  candidate = QImage(image)
  if candidate.isNull():
    raise ValueError("The selected skin image could not be decoded.")
  if int(candidate.width()) != int(_SKIN_WIDTH) or int(candidate.height()) != int(_SKIN_HEIGHT):
    raise ValueError("Only modern 64x64 Minecraft skin textures are accepted.")
  return candidate.convertToFormat(QImage.Format.Format_RGBA8888)


def load_player_skin_image(data_root: Path, *, kind: object, resource_root: Path | None = None) -> QImage:
  normalized_kind = normalize_player_skin_kind(kind)
  if normalized_kind == PLAYER_SKIN_KIND_CUSTOM:
    custom_path = custom_player_skin_path(data_root)
    if not verify_runtime_file(Path(data_root), "state/player_skin.png"):
      custom_path = Path()
    custom_image = QImage(str(custom_path))
    if not custom_image.isNull():
      try:
        return normalize_player_skin_image(custom_image)
      except ValueError:
        pass
  bundled_root = Path(data_root if resource_root is None else resource_root)
  default_image = QImage(str(default_player_skin_path(bundled_root)))
  if default_image.isNull():
    raise RuntimeError("The bundled Timo skin texture could not be loaded.")
  return normalize_player_skin_image(default_image)


def write_custom_player_skin(data_root: Path, image: QImage) -> None:
  normalized = normalize_player_skin_image(image)
  target = custom_player_skin_path(data_root)
  target.parent.mkdir(parents=True, exist_ok=True)
  if not normalized.save(str(target), "PNG"):
    raise RuntimeError(f"Unable to save the custom player skin to {target}.")
  update_runtime_integrity_manifest(Path(data_root), ("state/player_skin.png",))


def delete_custom_player_skin(data_root: Path) -> None:
  target = custom_player_skin_path(data_root)
  if target.exists():
    target.unlink()
  update_runtime_integrity_manifest(Path(data_root), ("state/player_skin.png",))


def load_bundled_ai_timo_skin_image(resource_root: Path) -> QImage:
  image = QImage(str(default_player_skin_path(Path(resource_root))))
  if image.isNull():
    raise RuntimeError("The bundled Timo skin texture could not be loaded.")
  return normalize_player_skin_image(image)


def custom_ai_skin_relative_path(skin_id: object) -> str:
  normalized_id = normalize_ai_skin_id(skin_id)
  if not normalized_id:
    raise ValueError("The AI skin identifier is invalid.")
  return f"state/ai_skins/{normalized_id}.png"


def custom_ai_skin_path(data_root: Path, skin_id: object) -> Path:
  return Path(data_root) / Path(custom_ai_skin_relative_path(skin_id))


def load_custom_ai_skin_image(data_root: Path, skin_id: object) -> QImage | None:
  try:
    relative_path = custom_ai_skin_relative_path(skin_id)
  except ValueError:
    return None
  if not verify_runtime_file(Path(data_root), relative_path):
    return None
  image = QImage(str(Path(data_root) / Path(relative_path)))
  if image.isNull():
    return None
  try:
    return normalize_player_skin_image(image)
  except ValueError:
    return None


def write_custom_ai_skin(data_root: Path, skin_id: object, image: QImage) -> None:
  normalized = normalize_player_skin_image(image)
  relative_path = custom_ai_skin_relative_path(skin_id)
  target = Path(data_root) / Path(relative_path)
  target.parent.mkdir(parents=True, exist_ok=True)
  if not normalized.save(str(target), "PNG"):
    raise RuntimeError(f"Unable to save the custom AI skin to {target}.")
  update_runtime_integrity_manifest(Path(data_root), (relative_path,))


def delete_custom_ai_skin(data_root: Path, skin_id: object) -> None:
  try:
    relative_path = custom_ai_skin_relative_path(skin_id)
  except ValueError:
    return
  target = Path(data_root) / Path(relative_path)
  if target.exists():
    target.unlink()
  update_runtime_integrity_manifest(Path(data_root), (relative_path,))
