# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import re
from pathlib import Path
from typing import TYPE_CHECKING

from PyQt6.QtWidgets import QApplication, QFileDialog, QMessageBox

import ludoxel.presentation.interface.viewport.controllers.overlay_navigation as overlay_controller
import ludoxel.presentation.interface.viewport.controllers.settings as settings_controller
from ludoxel.application.persistence.packages.ldxworld import LDXWORLD_EXTENSION, LdxworldError, export_world_package, read_world_package
from ludoxel.application.persistence.schedulers.state import capture_my_world_space_from_session, load_my_world_space_into_session
from ludoxel.application.persistence.schema.world_library import world_game_mode_from_creative, world_game_mode_is_creative
from ludoxel.application.persistence.stores.app import default_new_world_space
from ludoxel.application.persistence.stores.world_library import WorldLibraryStore
from ludoxel.application.sessions.game_mode import apply_game_mode
from ludoxel.application.sessions.pipelines.runtime_state import apply_world_inventory_to_runtime, persisted_world_inventory_from_runtime
from ludoxel.simulation.worlds.state.play_space import PLAY_SPACE_MY_WORLD, PLAY_SPACE_OTHELLO

if TYPE_CHECKING:
  from ludoxel.presentation.interface.viewport.widgets.renderer import RendererViewportWidget


def _library(viewport: "RendererViewportWidget") -> WorldLibraryStore:
  return WorldLibraryStore(project_root=viewport._project_root, data_root=viewport._data_root)


def _safe_filename(name: str) -> str:
  cleaned = re.sub(r"[^A-Za-z0-9 _-]+", "", str(name)).strip().replace(" ", "_")
  return cleaned or "world"


def bind_menu(viewport: "RendererViewportWidget") -> None:
  menu = viewport._menu
  menu.enter_my_world_requested.connect(lambda world_id: enter_my_world(viewport, str(world_id)))
  menu.enter_othello_requested.connect(lambda: enter_othello(viewport))
  menu.change_skin_requested.connect(lambda: settings_controller.change_player_skin(viewport))
  menu.reset_skin_requested.connect(lambda: settings_controller.reset_player_skin(viewport))
  menu.preview_changed.connect(lambda: _on_menu_preview_changed(viewport))
  menu.quit_requested.connect(lambda: quit_application(viewport))
  menu.create_world_requested.connect(lambda: viewport._menu.show_create())
  menu.import_world_requested.connect(lambda: import_world(viewport))
  menu.edit_world_requested.connect(lambda world_id: open_world_editor(viewport, str(world_id)))
  menu.create_world_confirmed.connect(lambda name, game_mode: create_world(viewport, str(name), str(game_mode)))
  menu.rename_world_confirmed.connect(lambda world_id, name: rename_world(viewport, str(world_id), str(name)))
  menu.export_world_requested.connect(lambda world_id: export_world(viewport, str(world_id)))
  menu.delete_world_confirmed.connect(lambda world_id: delete_world(viewport, str(world_id)))


def _on_menu_preview_changed(viewport: "RendererViewportWidget") -> None:
  viewport._invalidate_menu_preview_cache()
  viewport.update()


def refresh_library(viewport: "RendererViewportWidget") -> None:
  viewport._menu.set_worlds(_library(viewport).list_summaries())


def quit_application(viewport: "RendererViewportWidget") -> None:
  try:
    viewport.shutdown()
  except Exception:
    pass
  host = viewport.window()
  if host is not None:
    host.close()
  app = QApplication.instance()
  if app is not None:
    app.quit()


def open_startup_menu(viewport: "RendererViewportWidget") -> None:
  refresh_library(viewport)
  settings_controller.sync_player_skin(viewport)
  viewport._menu.show_menu()
  viewport._set_menu_overlay(True)
  pending = str(getattr(viewport, "_pending_open_ldxworld", "") or "")
  if pending:
    viewport._pending_open_ldxworld = ""
    request_open_ldxworld(viewport, Path(pending))


def request_open_ldxworld(viewport: "RendererViewportWidget", path: Path) -> None:
  in_menu = bool(viewport._overlays.menu_open())
  if not import_world_package_path(viewport, Path(path), announce_failure=True):
    return
  if in_menu:
    viewport._menu.show_library()
  else:
    QMessageBox.information(viewport.window(), "World Imported", "The world package was imported into your My World library. Open Play My World to view it.")


def _load_world_into_runtime(viewport: "RendererViewportWidget", entry) -> None:
  creative = world_game_mode_is_creative(entry.metadata.game_mode)
  load_my_world_space_into_session(viewport._sessions.my_world, entry.space, allow_flying=creative)
  apply_world_inventory_to_runtime(viewport._state, entry.space.inventory)
  apply_game_mode(viewport._state, (viewport._sessions.my_world,), creative=creative)
  settings_controller.sync_hotbar_widgets(viewport)


def enter_my_world(viewport: "RendererViewportWidget", world_id: str) -> None:
  library = _library(viewport)
  target = library.load_entry(world_id)
  if target is None:
    refresh_library(viewport)
    return

  creative_now = bool(viewport._state.creative_mode)
  loaded_id = str(getattr(viewport, "_loaded_my_world_id", "") or library.active_world_id())
  if loaded_id and loaded_id != str(world_id) and library.load_entry(loaded_id) is not None:
    space = capture_my_world_space_from_session(viewport._sessions.my_world, allow_flying=creative_now, inventory=persisted_world_inventory_from_runtime(viewport._state))
    thumbnail_bytes = viewport._capture_active_world_thumbnail_bytes()
    library.save_space(loaded_id, space, game_mode=world_game_mode_from_creative(creative_now), thumbnail_bytes=thumbnail_bytes)

  library.set_active_world(world_id)
  viewport._loaded_my_world_id = str(world_id)
  viewport._clear_world_thumbnail_cache()
  _load_world_into_runtime(viewport, target)
  viewport._set_menu_overlay(False)
  overlay_controller.force_enter_space(viewport, PLAY_SPACE_MY_WORLD)


def enter_othello(viewport: "RendererViewportWidget") -> None:
  viewport._set_menu_overlay(False)
  overlay_controller.force_enter_space(viewport, PLAY_SPACE_OTHELLO)


def create_world(viewport: "RendererViewportWidget", name: str, game_mode: str) -> None:
  library = _library(viewport)
  library.create_world(name=str(name), game_mode=str(game_mode), space=default_new_world_space())
  refresh_library(viewport)
  viewport._menu.show_library()


def open_world_editor(viewport: "RendererViewportWidget", world_id: str) -> None:
  entry = _library(viewport).load_entry(world_id)
  if entry is None:
    refresh_library(viewport)
    viewport._menu.show_library()
    return
  viewport._menu.show_world_editor(world_id=str(world_id), name=entry.metadata.name, game_mode=entry.metadata.game_mode)


def rename_world(viewport: "RendererViewportWidget", world_id: str, name: str) -> None:
  library = _library(viewport)
  if library.load_entry(world_id) is None:
    refresh_library(viewport)
    viewport._menu.show_library()
    return
  library.rename_world(world_id, str(name))
  refresh_library(viewport)
  entry = library.load_entry(world_id)
  if entry is not None:
    viewport._menu.show_world_editor(world_id=str(world_id), name=entry.metadata.name, game_mode=entry.metadata.game_mode)


def delete_world(viewport: "RendererViewportWidget", world_id: str) -> None:
  library = _library(viewport)
  library.delete_world(world_id)
  if str(getattr(viewport, "_loaded_my_world_id", "") or "") == str(world_id):
    viewport._loaded_my_world_id = str(library.active_world_id())
    viewport._clear_world_thumbnail_cache()
  refresh_library(viewport)
  viewport._menu.show_library()


def export_world(viewport: "RendererViewportWidget", world_id: str) -> None:
  library = _library(viewport)
  entry = library.load_entry(world_id)
  if entry is None:
    refresh_library(viewport)
    return
  default_name = f"{_safe_filename(entry.metadata.name)}{LDXWORLD_EXTENSION}"
  path, _selected = QFileDialog.getSaveFileName(viewport.window(), "Export World", default_name, f"Ludoxel World (*{LDXWORLD_EXTENSION})")
  if not path:
    return
  if not str(path).lower().endswith(LDXWORLD_EXTENSION):
    path = f"{path}{LDXWORLD_EXTENSION}"
  thumbnail = library.read_thumbnail_bytes(world_id)
  try:
    export_world_package(Path(path), entry=entry, thumbnail_bytes=thumbnail)
  except LdxworldError as error:
    QMessageBox.warning(viewport.window(), "Export Failed", str(error))


def import_world(viewport: "RendererViewportWidget") -> None:
  path, _selected = QFileDialog.getOpenFileName(viewport.window(), "Import World", "", f"Ludoxel World (*{LDXWORLD_EXTENSION})")
  if not path:
    return
  if import_world_package_path(viewport, Path(path), announce_failure=True):
    viewport._menu.show_library()


def import_world_package_path(viewport: "RendererViewportWidget", path: Path, *, announce_failure: bool = False) -> bool:
  library = _library(viewport)
  try:
    package = read_world_package(Path(path))
  except LdxworldError as error:
    if announce_failure:
      QMessageBox.warning(viewport.window(), "Import Failed", str(error))
    return False
  library.import_entry(package.entry, thumbnail_bytes=package.thumbnail_bytes)
  refresh_library(viewport)
  return True
