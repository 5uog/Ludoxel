# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PyQt6.QtCore import QObject, Qt, pyqtSignal
from PyQt6.QtGui import QImage, QMovie, QPainter, QPixmap

from ludoxel.presentation.interface.common.special_item_art import build_special_item_icon_layout
from ludoxel.presentation.resources.asset_roots import VisualAssetRoots, resolve_visual_asset_roots
from ludoxel.simulation.blocks.registries.block import BlockRegistry
from ludoxel.simulation.blocks.states.codec import parse_state
from ludoxel.simulation.inventories.special_items.registry import get_special_item_descriptor

DEFAULT_ITEM_PHOTO_ICON_SIZE_PX = 36
MIN_ITEM_PHOTO_ICON_SIZE_PX = 16
_SPECIAL_ICON_EDGE_MARGIN_PX = 1


@dataclass(frozen=True)
class PhotoPaths:
  roots: VisualAssetRoots

  def thumbs_dir(self) -> Path:
    return self.roots.block_thumbnail_dir

  def item_dir(self) -> Path:
    return self.roots.item_texture_dir


class ItemPhotoProvider(QObject):
  pixmap_changed = pyqtSignal(str)

  def __init__(self, *, resource_root: Path, registry: BlockRegistry, icon_size: int = DEFAULT_ITEM_PHOTO_ICON_SIZE_PX) -> None:
    super().__init__(None)
    self._resource_root = Path(resource_root)
    self._reg = registry
    self._icon = int(max(MIN_ITEM_PHOTO_ICON_SIZE_PX, icon_size))
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

    pm = QPixmap.fromImage(self._thumbnail_source_image(img))
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
    image, visual_anchor = build_special_item_icon_layout(str(icon_key), size=int(self._icon))
    return QPixmap.fromImage(self._anchored_special_item_image(image, source_anchor=visual_anchor))

  def _movie_pixmap(self, movie: QMovie) -> QPixmap | None:
    pixmap = movie.currentPixmap()
    if not pixmap.isNull():
      return QPixmap.fromImage(self._thumbnail_source_image(pixmap.toImage()))

    image = movie.currentImage()
    if image.isNull():
      return None

    return QPixmap.fromImage(self._thumbnail_source_image(image))

  @staticmethod
  def _thumbnail_source_image(image: QImage) -> QImage:
    source = QImage(image).convertToFormat(QImage.Format.Format_RGBA8888)
    if source.isNull():
      return QImage()
    return source

  def _anchored_special_item_image(self, image: QImage, *, source_anchor: tuple[float, float]) -> QImage:
    source = QImage(image).convertToFormat(QImage.Format.Format_RGBA8888)
    canvas = QImage(int(self._icon), int(self._icon), QImage.Format.Format_RGBA8888)
    canvas.fill(Qt.GlobalColor.transparent)
    if source.isNull():
      return canvas

    fitted_extent = max(1, int(self._icon) - (2 * int(_SPECIAL_ICON_EDGE_MARGIN_PX)))
    anchor_x = float(source_anchor[0])
    anchor_y = float(source_anchor[1])
    scaled = source.scaled(int(fitted_extent), int(fitted_extent), Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.FastTransformation)
    scaled_anchor_x = float(anchor_x) * float(scaled.width()) / float(max(1, int(source.width())))
    scaled_anchor_y = float(anchor_y) * float(scaled.height()) / float(max(1, int(source.height())))
    target_center = float(self._icon) * 0.5
    base_x = int(round(float(target_center) - float(scaled_anchor_x)))
    base_y = int(round(float(target_center) - float(scaled_anchor_y)))

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
