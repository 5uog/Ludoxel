# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import re

_COMPONENT_PATTERN = re.compile(r"\d+")


def parse_version(version_text: str) -> tuple[int, ...]:
  components: list[int] = []
  for raw_component in str(version_text).strip().split("."):
    match = _COMPONENT_PATTERN.match(raw_component)
    if match is None:
      break
    components.append(int(match.group(0)))
  return tuple(components) if components else (0,)


def compare_versions(left: str, right: str) -> int:
  left_parts = parse_version(left)
  right_parts = parse_version(right)
  length = max(len(left_parts), len(right_parts))
  left_padded = left_parts + (0,) * (length - len(left_parts))
  right_padded = right_parts + (0,) * (length - len(right_parts))

  if left_padded < right_padded:
    return -1
  if left_padded > right_padded:
    return 1
  return 0
