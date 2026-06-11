# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PyQt6.QtCore import QObject, Qt, pyqtSignal
from PyQt6.QtGui import QImage, QMovie, QPainter, QPixmap

from ludoxel.presentation.interface.common.special_item_art import build_special_item_icon_image
from ludoxel.presentation.resources.asset_roots import VisualAssetRoots, resolve_visual_asset_roots
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.states.codec import parse_state
from ludoxel.simulation.inventories.special_items.registry import get_special_item_descriptor

_ICON_EDGE_MARGIN_PX = 1


@dataclass(frozen=True)
class PhotoPaths:
  """
  選択済み visual asset family から item 表示に必要な thumbnail root と平面 texture root を導出する。
  inventory、hotbar、item selection が renderer と異なる family を個別選択しないため、path の正本は `VisualAssetRoots` に限定する。
  """

  roots: VisualAssetRoots

  def thumbs_dir(self) -> Path:
    return self.roots.block_thumbnail_dir

  def item_dir(self) -> Path:
    """
    block thumbnail が存在しない通常 item を解決する平面 texture directory を返す。
    返値は同じ asset family の `textures/item` であり、呼び出し側で Minecraft 又は Ludoxel を再判定しない。
    """
    return self.roots.item_texture_dir


class ItemPhotoProvider(QObject):
  pixmap_changed = pyqtSignal(str)

  def __init__(self, *, resource_root: Path, registry: BlockRegistry, icon_size: int = 36) -> None:
    super().__init__(None)
    self._resource_root = Path(resource_root)
    self._reg = registry
    self._icon = int(max(16, icon_size))
    self._paths = PhotoPaths(roots=resolve_visual_asset_roots(self._resource_root / "assets", required_texture_names=self._reg.required_texture_names()))
    self._animations_enabled = True
    self._active = False

    self._pix_cache: dict[str, QPixmap] = {}
    self._movies: dict[str, QMovie] = {}
    self._animated_pix_cache: dict[str, QPixmap] = {}

  def set_animations_enabled(self, enabled: bool) -> None:
    next_enabled = bool(enabled)
    if next_enabled == bool(self._animations_enabled):
      return
    self._animations_enabled = bool(next_enabled)
    for block_id, movie in self._movies.items():
      self._sync_movie_playback_state(str(block_id), movie)

  def set_active(self, active: bool) -> None:
    next_active = bool(active)
    if next_active == bool(self._active):
      return
    self._active = bool(next_active)
    for block_id, movie in self._movies.items():
      self._sync_movie_playback_state(str(block_id), movie)

  def pixmap_for_item(self, item_state_or_id: str) -> QPixmap | None:
    raw = str(item_state_or_id)
    base_id, _p = parse_state(raw)
    bid = str(base_id)

    if not bid:
      return None

    cached = self._pix_cache.get(bid)
    if cached is not None:
      return cached

    special = get_special_item_descriptor(bid)
    if special is not None:
      pm = self._render_special_item_pixmap(str(special.icon_key))
      self._pix_cache[bid] = pm
      return pm

    defn = self._reg.get(bid)
    if defn is None:
      return None

    name = self._basename_no_ns(bid)

    gif_path = self._paths.thumbs_dir() / f"{name}.gif"
    if gif_path.exists():
      return self._ensure_movie_pixmap(str(bid), gif_path)

    p = self._paths.thumbs_dir() / f"{name}.png"
    if not p.exists():
      p = self._paths.item_dir() / f"{name}.png"

    if not p.exists():
      return None

    img = QImage(str(p))
    if img.isNull():
      return None

    pm = QPixmap.fromImage(self._normalize_item_image(img))
    self._pix_cache[bid] = pm
    return pm

  def tooltip_for_item(self, item_id: str) -> str:
    bid = str(item_id)
    special = get_special_item_descriptor(bid)
    if special is not None:
      return f"{special.display_name}\n{special.item_id}"
    d = self._reg.get(bid)
    dn = str(d.display_name) if d is not None else bid
    return f"{dn}\n{bid}"

  def pixmap_for_block(self, block_state_or_id: str) -> QPixmap | None:
    return self.pixmap_for_item(block_state_or_id)

  def tooltip_for_block(self, block_id: str) -> str:
    return self.tooltip_for_item(block_id)

  @staticmethod
  def _basename_no_ns(block_id: str) -> str:
    s = str(block_id)
    if ":" in s:
      return s.split(":", 1)[1]
    return s

  def _movie_should_run(self) -> bool:
    return bool(self._active) and bool(self._animations_enabled)

  def _render_special_item_pixmap(self, icon_key: str) -> QPixmap:
    return QPixmap.fromImage(self._normalize_item_image(build_special_item_icon_image(str(icon_key), size=int(self._icon))))

  def _movie_pixmap(self, movie: QMovie) -> QPixmap | None:
    pixmap = movie.currentPixmap()
    if not pixmap.isNull():
      return QPixmap.fromImage(self._normalize_item_image(pixmap.toImage()))

    image = movie.currentImage()
    if image.isNull():
      return None

    return QPixmap.fromImage(self._normalize_item_image(image))

  def _normalize_item_image(self, image: QImage) -> QImage:
    """
    item art の alpha-weighted visual centroid を共通 icon canvas の幾何中心へ移す。
    元画像の透明余白、17x17 item、300x300 block thumbnail、special item の生成差を吸収し、slot state や button border に依存しない中心基準を返す。
    """
    source = QImage(image).convertToFormat(QImage.Format.Format_RGBA8888)
    canvas = QImage(int(self._icon), int(self._icon), QImage.Format.Format_RGBA8888)
    canvas.fill(Qt.GlobalColor.transparent)
    if source.isNull():
      return canvas
    fitted_extent = max(1, int(self._icon) - (2 * int(_ICON_EDGE_MARGIN_PX)))
    scaled = source.scaled(int(fitted_extent), int(fitted_extent), Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.FastTransformation)
    alpha_sum = 0.0
    weighted_x = 0.0
    weighted_y = 0.0
    min_x = int(scaled.width())
    min_y = int(scaled.height())
    max_x = -1
    max_y = -1
    for y in range(int(scaled.height())):
      for x in range(int(scaled.width())):
        alpha = int(scaled.pixelColor(int(x), int(y)).alpha())
        if alpha <= 0:
          continue
        weight = float(alpha)
        alpha_sum += weight
        weighted_x += (float(x) + 0.5) * weight
        weighted_y += (float(y) + 0.5) * weight
        min_x = min(int(min_x), int(x))
        min_y = min(int(min_y), int(y))
        max_x = max(int(max_x), int(x))
        max_y = max(int(max_y), int(y))
    base_x = (int(self._icon) - int(scaled.width())) // 2
    base_y = (int(self._icon) - int(scaled.height())) // 2
    if alpha_sum > 0.0:
      target = float(self._icon) * 0.5
      base_x = int(round(target - (weighted_x / alpha_sum)))
      base_y = int(round(target - (weighted_y / alpha_sum)))
      base_x = min(max(int(base_x), -int(min_x)), int(self._icon) - 1 - int(max_x))
      base_y = min(max(int(base_y), -int(min_y)), int(self._icon) - 1 - int(max_y))
    painter = QPainter(canvas)
    painter.setCompositionMode(QPainter.CompositionMode.CompositionMode_SourceOver)
    painter.drawImage(int(base_x), int(base_y), scaled)
    painter.end()
    return canvas

  def _sync_movie_playback_state(self, block_id: str, movie: QMovie) -> None:
    if self._movie_should_run():
      if movie.state() != QMovie.MovieState.Running:
        movie.start()
      return

    if movie.state() != QMovie.MovieState.NotRunning:
      movie.stop()
    movie.jumpToFrame(0)

    pixmap = self._movie_pixmap(movie)
    if pixmap is None or pixmap.isNull():
      return

    self._animated_pix_cache[str(block_id)] = QPixmap(pixmap)
    self.pixmap_changed.emit(str(block_id))

  def _ensure_movie_pixmap(self, block_id: str, path: Path) -> QPixmap | None:
    cached = self._animated_pix_cache.get(str(block_id))
    if cached is not None and not cached.isNull():
      return cached

    movie = self._movies.get(str(block_id))
    if movie is None:
      movie = QMovie(str(path))
      if not movie.isValid():
        return None
      movie.frameChanged.connect(lambda _frame, bid=str(block_id), mv=movie: self._on_movie_frame_changed(str(bid), mv))
      self._movies[str(block_id)] = movie

    self._sync_movie_playback_state(str(block_id), movie)

    pixmap = self._movie_pixmap(movie)
    if pixmap is None or pixmap.isNull():
      return None

    self._animated_pix_cache[str(block_id)] = QPixmap(pixmap)
    return self._animated_pix_cache[str(block_id)]

  def _on_movie_frame_changed(self, block_id: str, movie: QMovie) -> None:
    if not self._movie_should_run():
      return
    pixmap = self._movie_pixmap(movie)
    if pixmap is None or pixmap.isNull():
      return
    self._animated_pix_cache[str(block_id)] = QPixmap(pixmap)
    self.pixmap_changed.emit(str(block_id))
