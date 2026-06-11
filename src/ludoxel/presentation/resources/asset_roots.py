# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

_BLOCK_TEXTURE_FILE_ALIASES: dict[str, str] = {
  "dirt_path_side": "grass_path_side",
  "dirt_path_top": "grass_path_top",
  "quartz_column_side": "quartz_block_lines",
  "quartz_column_top": "quartz_block_lines_top",
  "smooth_quartz": "quartz_block_bottom",
}


@dataclass(frozen=True)
class VisualAssetRoots:
  """
  renderer texture と item thumbnail が共有する一つの asset family の root 群を表す。
  `family` は `ludoxel` 又は `minecraft` であり、block texture、item texture、thumbnail を同じ選択結果から導出する。
  """

  family: str
  family_root: Path
  texture_root: Path
  block_texture_dir: Path
  item_texture_dir: Path
  thumbnail_root: Path
  block_thumbnail_dir: Path


def resolve_block_texture_path(block_dir: Path, texture_name: str) -> Path:
  """
  registry の logical texture name を、選択済み asset family 内の実在 PNG path へ解決する。
  exact filename を優先し、歴史的な Minecraft file naming と catalog 名の差だけを共有 alias で吸収する。
  """
  directory = Path(block_dir)
  logical_name = str(texture_name).strip()
  exact = directory / f"{logical_name}.png"
  if exact.is_file():
    return exact
  alias_name = _BLOCK_TEXTURE_FILE_ALIASES.get(logical_name)
  if alias_name:
    alias = directory / f"{alias_name}.png"
    if alias.is_file():
      return alias
  return exact


def _has_required_block_textures(block_dir: Path, names: tuple[str, ...]) -> bool:
  """
  block atlas が要求する全 logical texture name に対応する PNG が存在する場合に真を返す。
  atlas が内部生成する `default` placeholder は file 要件から除外し、不完全な Ludoxel family へ renderer だけが切り替わる状態を防ぐ。
  """
  if not block_dir.is_dir():
    return False
  return all(resolve_block_texture_path(block_dir, name).is_file() for name in names if str(name) != "default")


def resolve_visual_asset_roots(assets_dir: Path, *, required_texture_names: list[str] | tuple[str, ...]) -> VisualAssetRoots:
  """
  `assets/ludoxel` が atlas contract を完全に満たす場合は自作 family を選び、それ以外は provenance-sensitive な `assets/minecraft` を選ぶ。
  OpenGL、WGPU、inventory、hotbar、item selection は同じ required texture list を渡し、片方だけが別 family へ移行しない。
  """
  assets_root = Path(assets_dir)
  names = tuple(sorted({str(name).strip() for name in required_texture_names if str(name).strip()}))
  ludoxel_root = assets_root / "ludoxel"
  minecraft_root = assets_root / "minecraft"
  family = "ludoxel" if names and _has_required_block_textures(ludoxel_root / "textures" / "block", names) else "minecraft"
  family_root = ludoxel_root if family == "ludoxel" else minecraft_root
  texture_root = family_root / "textures"
  thumbnail_root = family_root / "thumbnails"
  return VisualAssetRoots(
    family=str(family),
    family_root=family_root,
    texture_root=texture_root,
    block_texture_dir=texture_root / "block",
    item_texture_dir=texture_root / "item",
    thumbnail_root=thumbnail_root,
    block_thumbnail_dir=thumbnail_root / "blocks",
  )
