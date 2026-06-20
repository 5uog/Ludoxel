# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass, field
from functools import lru_cache
from typing import Iterable

ACTION_MOVE_FORWARD = "move_forward"
ACTION_MOVE_BACKWARD = "move_backward"
ACTION_MOVE_LEFT = "move_left"
ACTION_MOVE_RIGHT = "move_right"
ACTION_JUMP = "jump"
ACTION_CROUCH = "crouch"
ACTION_SPRINT = "sprint"
ACTION_TOGGLE_INVENTORY = "toggle_inventory"
ACTION_TOGGLE_CREATIVE_MODE = "toggle_creative_mode"
ACTION_CYCLE_CAMERA_PERSPECTIVE = "cycle_camera_perspective"
ACTION_TOGGLE_GAMEPLAY_HUD = "toggle_gameplay_hud"
ACTION_TOGGLE_DEBUG_HUD = "toggle_debug_hud"
ACTION_TOGGLE_DEBUG_SHADOW = "toggle_debug_shadow"
ACTION_CLEAR_SELECTED_SLOT = "clear_selected_slot"

HOTBAR_ACTIONS: tuple[str, ...] = tuple(f"hotbar_slot_{int(index) + 1}" for index in range(9))

KEYBIND_ACTION_ORDER: tuple[str, ...] = (
  ACTION_MOVE_FORWARD,
  ACTION_MOVE_BACKWARD,
  ACTION_MOVE_LEFT,
  ACTION_MOVE_RIGHT,
  ACTION_JUMP,
  ACTION_CROUCH,
  ACTION_SPRINT,
  ACTION_TOGGLE_INVENTORY,
  ACTION_TOGGLE_CREATIVE_MODE,
  ACTION_CYCLE_CAMERA_PERSPECTIVE,
  ACTION_TOGGLE_GAMEPLAY_HUD,
  ACTION_TOGGLE_DEBUG_HUD,
  ACTION_TOGGLE_DEBUG_SHADOW,
  ACTION_CLEAR_SELECTED_SLOT,
) + HOTBAR_ACTIONS

KEYBIND_DISPLAY_NAMES: dict[str, str] = {
  ACTION_MOVE_FORWARD: "Move Forward",
  ACTION_MOVE_BACKWARD: "Move Backward",
  ACTION_MOVE_LEFT: "Move Left",
  ACTION_MOVE_RIGHT: "Move Right",
  ACTION_JUMP: "Jump",
  ACTION_CROUCH: "Crouch",
  ACTION_SPRINT: "Sprint",
  ACTION_TOGGLE_INVENTORY: "Inventory",
  ACTION_TOGGLE_CREATIVE_MODE: "Creative Mode",
  ACTION_CYCLE_CAMERA_PERSPECTIVE: "Cycle Camera Perspective",
  ACTION_TOGGLE_GAMEPLAY_HUD: "Hide or Show HUD",
  ACTION_TOGGLE_DEBUG_HUD: "Debug HUD",
  ACTION_TOGGLE_DEBUG_SHADOW: "Debug Shadow",
  ACTION_CLEAR_SELECTED_SLOT: "Clear Selected Slot",
}
for _index, _action in enumerate(HOTBAR_ACTIONS, start=1):
  KEYBIND_DISPLAY_NAMES[_action] = f"Hotbar Slot {int(_index)}"

CONTROL_SECTION_MOVEMENT: tuple[str, ...] = (ACTION_MOVE_FORWARD, ACTION_MOVE_BACKWARD, ACTION_MOVE_LEFT, ACTION_MOVE_RIGHT, ACTION_JUMP, ACTION_CROUCH, ACTION_SPRINT)
CONTROL_SECTION_GAMEPLAY: tuple[str, ...] = (
  ACTION_TOGGLE_INVENTORY,
  ACTION_TOGGLE_CREATIVE_MODE,
  ACTION_CYCLE_CAMERA_PERSPECTIVE,
  ACTION_TOGGLE_GAMEPLAY_HUD,
  ACTION_CLEAR_SELECTED_SLOT,
  ACTION_TOGGLE_DEBUG_HUD,
  ACTION_TOGGLE_DEBUG_SHADOW,
)

DEFAULT_KEYBINDS: dict[str, str] = {
  ACTION_MOVE_FORWARD: "W",
  ACTION_MOVE_BACKWARD: "S",
  ACTION_MOVE_LEFT: "A",
  ACTION_MOVE_RIGHT: "D",
  ACTION_JUMP: "Space",
  ACTION_CROUCH: "Shift",
  ACTION_SPRINT: "Control",
  ACTION_TOGGLE_INVENTORY: "E",
  ACTION_TOGGLE_CREATIVE_MODE: "B",
  ACTION_CYCLE_CAMERA_PERSPECTIVE: "F5",
  ACTION_TOGGLE_GAMEPLAY_HUD: "F1",
  ACTION_TOGGLE_DEBUG_HUD: "F3",
  ACTION_TOGGLE_DEBUG_SHADOW: "F4",
  ACTION_CLEAR_SELECTED_SLOT: "Q",
}
for _index, _action in enumerate(HOTBAR_ACTIONS, start=1):
  DEFAULT_KEYBINDS[_action] = str(int(_index))

_QT_KEY_SPACE = 0x20
_QT_KEY_DIGIT_START = 0x30
_QT_KEY_LETTER_START = 0x41
_QT_KEY_ESCAPE = 0x01000000
_QT_KEY_TAB = 0x01000001
_QT_KEY_BACKTAB = 0x01000002
_QT_KEY_BACKSPACE = 0x01000003
_QT_KEY_RETURN = 0x01000004
_QT_KEY_ENTER = 0x01000005
_QT_KEY_INSERT = 0x01000006
_QT_KEY_DELETE = 0x01000007
_QT_KEY_PAUSE = 0x01000008
_QT_KEY_PRINT = 0x01000009
_QT_KEY_CLEAR = 0x0100000B
_QT_KEY_HOME = 0x01000010
_QT_KEY_END = 0x01000011
_QT_KEY_LEFT = 0x01000012
_QT_KEY_UP = 0x01000013
_QT_KEY_RIGHT = 0x01000014
_QT_KEY_DOWN = 0x01000015
_QT_KEY_PAGE_UP = 0x01000016
_QT_KEY_PAGE_DOWN = 0x01000017
_QT_KEY_SHIFT = 0x01000020
_QT_KEY_CONTROL = 0x01000021
_QT_KEY_META = 0x01000022
_QT_KEY_ALT = 0x01000023
_QT_KEY_CAPS_LOCK = 0x01000024
_QT_KEY_NUM_LOCK = 0x01000025
_QT_KEY_SCROLL_LOCK = 0x01000026
_QT_KEY_F1 = 0x01000030

_KEY_NAME_BY_CODE: dict[int, str] = {
  _QT_KEY_SPACE: "Space",
  _QT_KEY_ESCAPE: "Esc",
  _QT_KEY_TAB: "Tab",
  _QT_KEY_BACKTAB: "Backtab",
  _QT_KEY_BACKSPACE: "Backspace",
  _QT_KEY_RETURN: "Return",
  _QT_KEY_ENTER: "Enter",
  _QT_KEY_INSERT: "Ins",
  _QT_KEY_DELETE: "Del",
  _QT_KEY_PAUSE: "Pause",
  _QT_KEY_PRINT: "Print",
  _QT_KEY_CLEAR: "Clear",
  _QT_KEY_HOME: "Home",
  _QT_KEY_END: "End",
  _QT_KEY_LEFT: "Left",
  _QT_KEY_UP: "Up",
  _QT_KEY_RIGHT: "Right",
  _QT_KEY_DOWN: "Down",
  _QT_KEY_PAGE_UP: "PgUp",
  _QT_KEY_PAGE_DOWN: "PgDown",
  _QT_KEY_SHIFT: "Shift",
  _QT_KEY_CONTROL: "Control",
  _QT_KEY_META: "Meta",
  _QT_KEY_ALT: "Alt",
  _QT_KEY_CAPS_LOCK: "CapsLock",
  _QT_KEY_NUM_LOCK: "NumLock",
  _QT_KEY_SCROLL_LOCK: "ScrollLock",
}
_KEY_NAME_BY_CODE.update({int(_QT_KEY_DIGIT_START + index): str(index) for index in range(10)})
_KEY_NAME_BY_CODE.update({int(_QT_KEY_LETTER_START + index): chr(_QT_KEY_LETTER_START + index) for index in range(26)})
_KEY_NAME_BY_CODE.update({int(_QT_KEY_F1 + index): f"F{int(index) + 1}" for index in range(35)})

_KEY_ALIASES: dict[str, str] = {
  "": "",
  "esc": "Esc",
  "escape": "Esc",
  "space": "Space",
  "spacebar": "Space",
  "tab": "Tab",
  "backtab": "Backtab",
  "backspace": "Backspace",
  "return": "Return",
  "enter": "Enter",
  "ins": "Ins",
  "insert": "Ins",
  "del": "Del",
  "delete": "Del",
  "pause": "Pause",
  "print": "Print",
  "printscreen": "Print",
  "clear": "Clear",
  "home": "Home",
  "end": "End",
  "left": "Left",
  "arrowleft": "Left",
  "up": "Up",
  "arrowup": "Up",
  "right": "Right",
  "arrowright": "Right",
  "down": "Down",
  "arrowdown": "Down",
  "pgup": "PgUp",
  "pageup": "PgUp",
  "pgdown": "PgDown",
  "pagedown": "PgDown",
  "shift": "Shift",
  "control": "Control",
  "ctrl": "Control",
  "meta": "Meta",
  "command": "Meta",
  "cmd": "Meta",
  "alt": "Alt",
  "option": "Alt",
  "capslock": "CapsLock",
  "caps lock": "CapsLock",
  "numlock": "NumLock",
  "num lock": "NumLock",
  "scrolllock": "ScrollLock",
  "scroll lock": "ScrollLock",
}
_KEY_ALIASES.update({str(index): str(index) for index in range(10)})
_KEY_ALIASES.update({chr(_QT_KEY_LETTER_START + index).lower(): chr(_QT_KEY_LETTER_START + index) for index in range(26)})
_KEY_ALIASES.update({f"f{int(index) + 1}": f"F{int(index) + 1}" for index in range(35)})

_KEY_CODE_BY_NAME: dict[str, int] = {str(name): int(code) for code, name in _KEY_NAME_BY_CODE.items()}


def keybind_actions() -> tuple[str, ...]:
  return KEYBIND_ACTION_ORDER


def default_keybinds_map() -> dict[str, str]:
  return dict(DEFAULT_KEYBINDS)


def action_display_name(action: str) -> str:
  normalized = str(action).strip()
  return str(KEYBIND_DISPLAY_NAMES.get(normalized, normalized))


def hotbar_action_for_index(index: int) -> str | None:
  idx = int(index)
  if 0 <= idx < len(HOTBAR_ACTIONS):
    return str(HOTBAR_ACTIONS[idx])
  return None


def hotbar_index_for_action(action: str | None) -> int | None:
  normalized = "" if action is None else str(action).strip()
  for index, candidate in enumerate(HOTBAR_ACTIONS):
    if normalized == str(candidate):
      return int(index)
  return None


@lru_cache(maxsize=256)
def portable_text_for_key(key: int) -> str:
  try:
    normalized_key = int(key)
  except Exception:
    return ""
  return str(_KEY_NAME_BY_CODE.get(int(normalized_key), "")).strip()


def normalize_key_code(key: int) -> str:
  try:
    normalized_key = int(key)
  except Exception:
    return ""
  if normalized_key <= 0:
    return ""
  return portable_text_for_key(int(normalized_key))


@lru_cache(maxsize=512)
def _normalize_binding_text_cached(raw: str) -> str:
  source = str(raw).strip()
  if not source:
    return ""
  if "+" in source or "," in source:
    return ""
  compact = " ".join(source.replace("_", " ").replace("-", " ").split()).lower()
  collapsed = compact.replace(" ", "")
  return str(_KEY_ALIASES.get(compact, _KEY_ALIASES.get(collapsed, ""))).strip()


def normalize_binding_text(value: object) -> str:
  return _normalize_binding_text_cached(str(value))


@lru_cache(maxsize=512)
def _binding_to_key_cached(normalized_binding: str) -> int | None:
  if not normalized_binding:
    return None
  key = _KEY_CODE_BY_NAME.get(str(normalized_binding))
  return int(key) if key is not None and int(key) > 0 else None


def binding_to_key(binding: str | None) -> int | None:
  normalized = normalize_binding_text("" if binding is None else binding)
  return _binding_to_key_cached(str(normalized))


@lru_cache(maxsize=512)
def _display_text_for_binding_cached(normalized_binding: str) -> str:
  if not normalized_binding:
    return "Unbound"
  if binding_to_key(str(normalized_binding)) is None:
    return "Unbound"
  return str(normalized_binding)


def display_text_for_binding(binding: str | None) -> str:
  normalized = normalize_binding_text("" if binding is None else binding)
  return _display_text_for_binding_cached(str(normalized))


def _normalized_bindings_from_items(items: Iterable[tuple[str, str]]) -> dict[str, str]:
  normalized = {str(action): "" for action in KEYBIND_ACTION_ORDER}
  seen_by_binding: dict[str, str] = {}

  for action, binding in items:
    normalized_action = str(action).strip()
    if normalized_action not in normalized:
      continue

    normalized_binding = normalize_binding_text(binding)
    if normalized_binding:
      previous_action = seen_by_binding.get(str(normalized_binding))
      if previous_action is not None and previous_action in normalized:
        normalized[str(previous_action)] = ""
      seen_by_binding[str(normalized_binding)] = str(normalized_action)

    normalized[str(normalized_action)] = str(normalized_binding)

  return normalized


def _key_maps_for_bindings(bindings: dict[str, str]) -> tuple[dict[str, int | None], dict[int, str]]:
  keys_by_action: dict[str, int | None] = {}
  action_by_key: dict[int, str] = {}

  for action in KEYBIND_ACTION_ORDER:
    key = binding_to_key(bindings.get(str(action), ""))
    keys_by_action[str(action)] = key
    if key is not None:
      action_by_key[int(key)] = str(action)

  return keys_by_action, action_by_key


@dataclass(frozen=True)
class KeybindSettings:
  bindings: dict[str, str] = field(default_factory=default_keybinds_map)
  _keys_by_action: dict[str, int | None] = field(init=False, repr=False, compare=False)
  _action_by_key: dict[int, str] = field(init=False, repr=False, compare=False)

  def __post_init__(self) -> None:
    seeded = default_keybinds_map()
    for action, value in dict(self.bindings).items():
      normalized_action = str(action).strip()
      if normalized_action not in seeded:
        continue
      seeded[normalized_action] = "" if value is None else str(value)

    canonical = _normalized_bindings_from_items((str(action), str(seeded.get(str(action), ""))) for action in KEYBIND_ACTION_ORDER)
    object.__setattr__(self, "bindings", canonical)

    keys_by_action, action_by_key = _key_maps_for_bindings(canonical)
    object.__setattr__(self, "_keys_by_action", keys_by_action)
    object.__setattr__(self, "_action_by_key", action_by_key)

  def normalized(self) -> "KeybindSettings":
    return self

  def binding_for_action(self, action: str) -> str:
    return str(self.bindings.get(str(action).strip(), ""))

  def key_for_action(self, action: str) -> int | None:
    return self._keys_by_action.get(str(action).strip())

  def action_for_key_code(self, key: int) -> str | None:
    try:
      normalized_key = int(key)
    except Exception:
      return None
    return self._action_by_key.get(int(normalized_key))

  def display_text_for_action(self, action: str) -> str:
    return display_text_for_binding(self.binding_for_action(str(action)))

  def with_binding(self, action: str, binding: str | None) -> "KeybindSettings":
    normalized_action = str(action).strip()
    if normalized_action not in self.bindings:
      return self

    updated = dict(self.bindings)
    updated[normalized_action] = normalize_binding_text("" if binding is None else binding)
    return KeybindSettings(bindings=updated)

  def to_dict(self) -> dict[str, str]:
    return {str(action): str(self.bindings.get(str(action), "")) for action in KEYBIND_ACTION_ORDER}

  @staticmethod
  def from_dict(data: object) -> "KeybindSettings":
    seeded = default_keybinds_map()
    if isinstance(data, dict):
      for action in KEYBIND_ACTION_ORDER:
        if action in data:
          seeded[str(action)] = "" if data[action] is None else str(data[action])
    return KeybindSettings(bindings=seeded)


def action_for_key(key: int, bindings: "KeybindSettings") -> str | None:
  return bindings.normalized().action_for_key_code(int(key))
