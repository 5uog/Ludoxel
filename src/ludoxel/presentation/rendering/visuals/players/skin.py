# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from pathlib import Path

from PyQt6.QtGui import QImage

from ludoxel.application.persistence.integrity.manifest import update_runtime_integrity_manifest, verify_runtime_file
from ludoxel.application.preferences.player_skin import PLAYER_SKIN_KIND_CUSTOM, normalize_player_skin_kind
from ludoxel.foundations.locations.roots import runtime_state_root

_SKIN_WIDTH = 64
_SKIN_HEIGHT = 64


def default_player_skin_path(resource_root: Path) -> Path:
  """
  immutable resource root の下にある bundled Alex skin path を返す。
  既定 skin は package resource として扱い、user-writable runtime state と同じ場所へ混在させない。
  """
  return Path(resource_root) / "assets" / "minecraft" / "skins" / "alex.png"


def custom_player_skin_path(data_root: Path) -> Path:
  """
  writable runtime data root の `state/player_skin.png` を返す。
  user-supplied skin は repository-level configs へ書き込まず、app-managed state として保存する。
  """
  return runtime_state_root(Path(data_root)) / "player_skin.png"


def normalize_player_skin_image(image: QImage) -> QImage:
  """
  入力画像を RGBA8888 に変換し、幅 64、高さ 64 の skin atlas であることを検査する。
  renderer と skin UV layout は modern Minecraft skin atlas の寸法を厳密に仮定している。
  """
  candidate = QImage(image)
  if candidate.isNull():
    raise ValueError("The selected skin image could not be decoded.")
  if int(candidate.width()) != int(_SKIN_WIDTH) or int(candidate.height()) != int(_SKIN_HEIGHT):
    raise ValueError("Only modern 64x64 Minecraft skin textures are accepted.")
  return candidate.convertToFormat(QImage.Format.Format_RGBA8888)


def load_player_skin_image(data_root: Path, *, kind: object, resource_root: Path | None = None) -> QImage:
  """
  custom skin が選択され、runtime root の custom file が正規化に成功する場合はそれを返し、その他の場合は bundled Alex skin を返す。
  mutable user state と immutable package resource の root 境界を維持した fallback loader である。
  """
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
    raise RuntimeError("The bundled Alex skin texture could not be loaded.")
  return normalize_player_skin_image(default_image)


def write_custom_player_skin(data_root: Path, image: QImage) -> None:
  """
  入力画像を正規化してから custom skin path へ PNG として保存する。
  保存される画像形式は loader と renderer が期待する 64x64 RGBA atlas に揃えられる。
  """
  normalized = normalize_player_skin_image(image)
  target = custom_player_skin_path(data_root)
  target.parent.mkdir(parents=True, exist_ok=True)
  if not normalized.save(str(target), "PNG"):
    raise RuntimeError(f"Unable to save the custom player skin to {target}.")
  update_runtime_integrity_manifest(Path(data_root), ("state/player_skin.png",))


def delete_custom_player_skin(data_root: Path) -> None:
  """
  custom skin path が存在する場合に削除する冪等操作である。
  stale override asset を残さず、player-skin 選択を bundled default へ戻すために使う。
  """
  target = custom_player_skin_path(data_root)
  if target.exists():
    target.unlink()
  update_runtime_integrity_manifest(Path(data_root), ("state/player_skin.png",))
