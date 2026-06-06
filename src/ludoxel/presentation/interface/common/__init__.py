# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

__all__ = [
  "DraggableItemButton",
  "ITEM_SLOT_MIME_TYPE",
  "ItemPhotoProvider",
  "PhotoPaths",
  "SidebarDialogBase",
  "StatusOverlayFrame",
  "ThemedNoticeDialog",
  "apply_item_slot_state",
  "hotbar_binding_text",
  "hotbar_index_from_key",
  "hotbar_slot_tooltip",
  "item_id_from_mime",
  "refresh_widget_style",
  "show_themed_notice",
  "start_item_drag",
]


def __getattr__(name: str):
  if str(name) in {"hotbar_binding_text", "hotbar_index_from_key", "refresh_widget_style"}:
    from ludoxel.presentation.interface.common.hotbar_support import hotbar_binding_text, hotbar_index_from_key, refresh_widget_style

    return {"hotbar_binding_text": hotbar_binding_text, "hotbar_index_from_key": hotbar_index_from_key, "refresh_widget_style": refresh_widget_style}[str(name)]
  if str(name) == "hotbar_slot_tooltip":
    from ludoxel.presentation.interface.common.hotbar_visuals import hotbar_slot_tooltip

    return hotbar_slot_tooltip
  if str(name) in {"ItemPhotoProvider", "PhotoPaths"}:
    from ludoxel.presentation.interface.common.item_photo_provider import ItemPhotoProvider, PhotoPaths

    return {"ItemPhotoProvider": ItemPhotoProvider, "PhotoPaths": PhotoPaths}[str(name)]
  if str(name) in {"ITEM_SLOT_MIME_TYPE", "DraggableItemButton", "apply_item_slot_state", "item_id_from_mime", "start_item_drag"}:
    from ludoxel.presentation.interface.common.item_slots import ITEM_SLOT_MIME_TYPE, DraggableItemButton, apply_item_slot_state, item_id_from_mime, start_item_drag

    return {
      "ITEM_SLOT_MIME_TYPE": ITEM_SLOT_MIME_TYPE,
      "DraggableItemButton": DraggableItemButton,
      "apply_item_slot_state": apply_item_slot_state,
      "item_id_from_mime": item_id_from_mime,
      "start_item_drag": start_item_drag,
    }[str(name)]
  if str(name) == "SidebarDialogBase":
    from ludoxel.presentation.interface.common.sidebar_dialog import SidebarDialogBase

    return SidebarDialogBase
  if str(name) == "StatusOverlayFrame":
    from ludoxel.presentation.interface.common.status_overlay import StatusOverlayFrame

    return StatusOverlayFrame
  if str(name) in {"ThemedNoticeDialog", "show_themed_notice"}:
    from ludoxel.presentation.interface.common.themed_notice_dialog import ThemedNoticeDialog, show_themed_notice

    return {"ThemedNoticeDialog": ThemedNoticeDialog, "show_themed_notice": show_themed_notice}[str(name)]
  raise AttributeError(str(name))
