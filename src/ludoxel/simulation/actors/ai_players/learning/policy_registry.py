# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import json
from collections.abc import Callable
from importlib.resources import files

from ludoxel.simulation.actors.ai_players.learning.policy import POLICY_ID_BUILTIN, Policy, builtin_deterministic_policy, load_policy

POLICY_KIND_BUILTIN: str = "builtin_deterministic"
POLICY_KIND_BUNDLED: str = "bundled_learned"
POLICY_KIND_USER: str = "user_learned"
POLICY_KIND_EXPERIMENTAL: str = "experimental"

POLICY_KINDS: tuple[str, str] = (POLICY_KIND_BUILTIN, POLICY_KIND_BUNDLED)
POLICY_KIND_LABELS: tuple[tuple[str, str], ...] = ((POLICY_KIND_BUILTIN, "Built-in Deterministic AI"), (POLICY_KIND_BUNDLED, "Bundled Learned Policy"), (POLICY_KIND_USER, "User Learned Policy"), (POLICY_KIND_EXPERIMENTAL, "Experimental Policy"))

_BUNDLED_RESOURCE_PACKAGE: str = "ludoxel.simulation.actors.ai_players.learning"
_BUNDLED_RESOURCE_PARTS: tuple[str, str] = ("resources", "policies")


def normalize_policy_kind(value: object) -> str:
  raw = str(value).strip()
  if raw == POLICY_KIND_BUNDLED:
    return POLICY_KIND_BUNDLED
  if raw == POLICY_KIND_USER:
    return POLICY_KIND_USER
  if raw == POLICY_KIND_EXPERIMENTAL:
    return POLICY_KIND_EXPERIMENTAL
  return POLICY_KIND_BUILTIN


def _load_bundled_policies() -> dict[str, Policy]:
  policies: dict[str, Policy] = {}
  try:
    root = files(_BUNDLED_RESOURCE_PACKAGE)
    for part in _BUNDLED_RESOURCE_PARTS:
      root = root.joinpath(part)
    if not root.is_dir():
      return policies
    for entry in root.iterdir():
      if not entry.name.endswith(".json"):
        continue
      try:
        payload = json.loads(entry.read_text(encoding="utf-8"))
      except (OSError, ValueError, json.JSONDecodeError):
        continue
      policy = load_policy(payload)
      if policy is None or str(policy.policy_id) == str(POLICY_ID_BUILTIN):
        continue
      policies[str(policy.policy_id)] = policy
  except (FileNotFoundError, ModuleNotFoundError, OSError):
    return policies
  return policies


class PolicyRegistry:
  def __init__(self, *, user_policy_loader: Callable[[str], Policy | None] | None = None) -> None:
    self._bundled: dict[str, Policy] = _load_bundled_policies()
    self._user_policy_loader = user_policy_loader
    self._builtin: Policy = builtin_deterministic_policy()

  def bundled_policies(self) -> tuple[Policy, ...]:
    return tuple(self._bundled[key] for key in sorted(self._bundled.keys()))

  def builtin_policy(self) -> Policy:
    return self._builtin

  def _usable_or_none(self, policy: Policy | None) -> Policy | None:
    if isinstance(policy, Policy) and bool(policy.is_usable()):
      return policy
    return None

  def resolve(self, *, kind: str, policy_id: str = "") -> Policy:
    normalized_kind = normalize_policy_kind(kind)
    requested_id = str(policy_id).strip()

    if normalized_kind == POLICY_KIND_BUILTIN:
      return self._builtin

    if normalized_kind == POLICY_KIND_BUNDLED:
      if requested_id:
        candidate = self._usable_or_none(self._bundled.get(requested_id))
        if candidate is not None:
          return candidate
      else:
        for key in sorted(self._bundled.keys()):
          candidate = self._usable_or_none(self._bundled.get(key))
          if candidate is not None:
            return candidate
      return self._builtin

    if normalized_kind == POLICY_KIND_USER:
      candidate = self._resolve_user_policy(requested_id)
      return candidate if candidate is not None else self._builtin

    candidate = self._resolve_user_policy(requested_id)
    if candidate is not None:
      return candidate
    if requested_id:
      bundled_candidate = self._usable_or_none(self._bundled.get(requested_id))
      if bundled_candidate is not None:
        return bundled_candidate
    return self._builtin

  def _resolve_user_policy(self, policy_id: str) -> Policy | None:
    if self._user_policy_loader is None:
      return None
    try:
      loaded = self._user_policy_loader(str(policy_id))
    except Exception:
      return None
    return self._usable_or_none(loaded)
