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

AI_BUNDLED_ALEX_SKIN_KEY: str = "alex"


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


def load_bundled_ai_alex_skin_image(resource_root: Path) -> QImage:
  """
  AI actor が同梱 Alex skin mode を選択した時に用いる、immutable resource root 配下の Alex skin 画像を 64x64 RGBA atlas として返す。
  対象は player skin の bundled default と同一の `assets/minecraft/skins/alex.png` であり、user-writable runtime state には依存しない。decode 失敗又は寸法不一致の場合は normalize_player_skin_image が ValueError 又は RuntimeError を送出するため、呼び出し側はこれを捕捉して AI 個別 skin texture を持たない状態(player skin fallback)へ退避できる。
  """
  image = QImage(str(default_player_skin_path(Path(resource_root))))
  if image.isNull():
    raise RuntimeError("The bundled Alex skin texture could not be loaded.")
  return normalize_player_skin_image(image)


def custom_ai_skin_relative_path(skin_id: object) -> str:
  """
  actor 固有 import skin identifier を runtime data root 配下の相対 PNG path 文字列へ変換する。
  identifier は domain normalizer が認める 32 桁 16 進 UUID hex のみを採用し、path separator、dot、空白を含む任意文字列は file 名注入を防ぐため拒否して ValueError を送出する。
  返値は `state/ai_skins/<skin_id>.png` 形式の posix 相対 path であり、integrity manifest entry と runtime file path の双方で同一表記として用いる。
  """
  normalized_id = normalize_ai_skin_id(skin_id)
  if not normalized_id:
    raise ValueError("The AI skin identifier is invalid.")
  return f"state/ai_skins/{normalized_id}.png"


def custom_ai_skin_path(data_root: Path, skin_id: object) -> Path:
  """
  writable runtime data root と actor 固有 import skin identifier から import skin file の絶対 path を構成する。
  identifier 検査は custom_ai_skin_relative_path() に委譲し、無効な identifier では ValueError を伝播する。
  """
  return Path(data_root) / Path(custom_ai_skin_relative_path(skin_id))


def load_custom_ai_skin_image(data_root: Path, skin_id: object) -> QImage | None:
  """
  actor 固有 import skin file が存在し、integrity manifest 検証と 64x64 atlas 検査の双方を満たす場合に限り正規化済み画像を返す。
  返値が None となるのは、identifier が無効である場合、integrity 検証に失敗した場合(改竄の疑い)、file が読み込めない場合、又は寸法が 64x64 でない場合であり、これらはすべて player skin への安全な fallback を許可する欠落として扱う。
  decode と寸法検査に成功した画像は RGBA8888 形式へ揃えられ、renderer の skin UV layout が仮定する寸法と一致することが保証される。
  """
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
  """
  actor 固有 import skin を 64x64 RGBA atlas へ正規化してから identifier 別の runtime PNG file へ保存する。
  保存対象 directory が無ければ生成し、保存に失敗した場合は RuntimeError を送出する。保存後は当該動的 path 一件分の HMAC entry だけを integrity manifest へ追加又は更新し、player skin など他の保護対象 entry には触れない。
  """
  normalized = normalize_player_skin_image(image)
  relative_path = custom_ai_skin_relative_path(skin_id)
  target = Path(data_root) / Path(relative_path)
  target.parent.mkdir(parents=True, exist_ok=True)
  if not normalized.save(str(target), "PNG"):
    raise RuntimeError(f"Unable to save the custom AI skin to {target}.")
  update_runtime_integrity_manifest(Path(data_root), (relative_path,))


def delete_custom_ai_skin(data_root: Path, skin_id: object) -> None:
  """
  actor 固有 import skin file と対応する integrity manifest entry を削除する冪等操作である。
  identifier が無効な場合と file が既に存在しない場合のいずれも例外を送出せず、当該 path 一件分の manifest entry 更新だけを行う。
  この操作は import skin を参照する actor が居なくなった時、又は明示的な削除操作時に stale な runtime asset を残さないために用いる。
  """
  try:
    relative_path = custom_ai_skin_relative_path(skin_id)
  except ValueError:
    return
  target = Path(data_root) / Path(relative_path)
  if target.exists():
    target.unlink()
  update_runtime_integrity_manifest(Path(data_root), (relative_path,))
