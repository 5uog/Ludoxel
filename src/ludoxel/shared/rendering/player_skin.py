# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: Apache-2.0
from __future__ import annotations

from pathlib import Path

from PyQt6.QtGui import QImage

PLAYER_SKIN_KIND_ALEX = "alex"
PLAYER_SKIN_KIND_CUSTOM = "custom"

_SKIN_WIDTH = 64
_SKIN_HEIGHT = 64


def normalize_player_skin_kind(value: object) -> str:
    """I define K(value) as the normalized skin-kind discriminator over the finite set {alex, custom}, defaulting to alex. I use this function to collapse loose UI or persistence inputs onto the only kinds currently supported by the player-skin loader."""
    text = str(value or "").strip().lower()
    if text == PLAYER_SKIN_KIND_CUSTOM:
        return PLAYER_SKIN_KIND_CUSTOM
    return PLAYER_SKIN_KIND_ALEX


def default_player_skin_path(resource_root: Path) -> Path:
    """I define P_default(root_r) = root_r / 'assets' / 'minecraft' / 'skins' / 'alex.png'. I use this path constructor as the canonical location of the bundled fallback skin texture under the immutable resource root rather than under the writable runtime root."""
    return Path(resource_root) / "assets" / "minecraft" / "skins" / "alex.png"


def custom_player_skin_path(project_root: Path) -> Path:
    """I define P_custom(root) = root / 'configs' / 'player_skin.png'. I use this path constructor as the persistent location of the user-supplied override skin."""
    return Path(project_root) / "configs" / "player_skin.png"


def normalize_player_skin_image(image: QImage) -> QImage:
    """I define N(image) as the RGBA8888-converted image under the hard invariant width = 64 and height = 64. I enforce this normalization because the renderer and skin UV layout both assume the modern Minecraft skin atlas dimensions exactly."""
    candidate = QImage(image)
    if candidate.isNull():
        raise ValueError("The selected skin image could not be decoded.")
    if int(candidate.width()) != int(_SKIN_WIDTH) or int(candidate.height()) != int(_SKIN_HEIGHT):
        raise ValueError("Only modern 64x64 Minecraft skin textures are accepted.")
    return candidate.convertToFormat(QImage.Format.Format_RGBA8888)


def load_player_skin_image(project_root: Path, *, kind: object, resource_root: Path | None = None) -> QImage:
    """I define Load(root_w, kind, root_r) as the custom image at P_custom(root_w) when the custom variant exists and normalizes successfully, and otherwise as the bundled Alex image at P_default(root_r). I use this split-root fallback order so that mutable user state remains under the writable runtime tree while immutable packaged textures continue to load from the bundle data root."""
    normalized_kind = normalize_player_skin_kind(kind)
    if normalized_kind == PLAYER_SKIN_KIND_CUSTOM:
        custom_path = custom_player_skin_path(project_root)
        custom_image = QImage(str(custom_path))
        if not custom_image.isNull():
            try:
                return normalize_player_skin_image(custom_image)
            except ValueError:
                pass
    bundled_root = Path(project_root if resource_root is None else resource_root)
    default_image = QImage(str(default_player_skin_path(bundled_root)))
    if default_image.isNull():
        raise RuntimeError("The bundled Alex skin texture could not be loaded.")
    return normalize_player_skin_image(default_image)


def write_custom_player_skin(project_root: Path, image: QImage) -> None:
    """I define Save(root, image) as Normalize(image) followed by a PNG write to P_custom(root), creating parent directories as needed. I use this path to persist a user-selected skin in the same normalized format that the loader later expects."""
    normalized = normalize_player_skin_image(image)
    target = custom_player_skin_path(project_root)
    target.parent.mkdir(parents=True, exist_ok=True)
    if not normalized.save(str(target), "PNG"):
        raise RuntimeError(f"Unable to save the custom player skin to {target}.")


def delete_custom_player_skin(project_root: Path) -> None:
    """I define Delete(root) as the idempotent removal of P_custom(root) when that path exists. I use this operation to revert the player-skin selection to the bundled default without leaving stale override assets in place."""
    target = custom_player_skin_path(project_root)
    if target.exists():
        target.unlink()
