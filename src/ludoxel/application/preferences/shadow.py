# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

SHADOW_MAP_QUALITY_LOWEST: int = 1
SHADOW_MAP_QUALITY_LOW: int = 2
SHADOW_MAP_QUALITY_STANDARD: int = 3
SHADOW_MAP_QUALITY_HIGH: int = 4
SHADOW_MAP_QUALITY_ULTRA: int = 5

SHADOW_MAP_QUALITY_MIN: int = SHADOW_MAP_QUALITY_LOWEST
SHADOW_MAP_QUALITY_MAX: int = SHADOW_MAP_QUALITY_ULTRA
SHADOW_MAP_QUALITY_DEFAULT: int = SHADOW_MAP_QUALITY_STANDARD

SHADOW_MAP_QUALITY_ORDER: tuple[int, ...] = (SHADOW_MAP_QUALITY_LOWEST, SHADOW_MAP_QUALITY_LOW, SHADOW_MAP_QUALITY_STANDARD, SHADOW_MAP_QUALITY_HIGH, SHADOW_MAP_QUALITY_ULTRA)

SHADOW_MAP_QUALITY_LABELS: dict[int, str] = {
  SHADOW_MAP_QUALITY_LOWEST: "Lowest",
  SHADOW_MAP_QUALITY_LOW: "Low",
  SHADOW_MAP_QUALITY_STANDARD: "Standard",
  SHADOW_MAP_QUALITY_HIGH: "High",
  SHADOW_MAP_QUALITY_ULTRA: "Ultra",
}


def normalize_shadow_map_quality(value: object) -> int:
  """
  shadow map / shadow shader の実効品質を選ぶ離散段階を、`[1, 5]` の整数 5 段階のいずれかへ正規化する。
  段階は 1 を `Lowest`、2 を `Low`、3 を `Standard`、4 を `High`、5 を `Ultra` とし、
  値が大きいほど shadow map の実効 texel 密度と PCF の鋭さが上がる。
  この設定は render distance とは独立した shadow 専用の品質方針であり、render distance chunks を変更しても段階値は変化しない。
  入力は persistence、settings UI、renderer state が共有する保存値であり、
  型不一致、欠落、旧形式、`[1, 5]` の範囲外といった不正値はいずれも安全側として `Standard` (3) へ収束させる。
  返値は常に有効な段階 `SHADOW_MAP_QUALITY_MIN <= quality <= SHADOW_MAP_QUALITY_MAX` を満たす。
  """
  try:
    quality = int(value)
  except (TypeError, ValueError):
    return int(SHADOW_MAP_QUALITY_DEFAULT)
  if quality < int(SHADOW_MAP_QUALITY_MIN) or quality > int(SHADOW_MAP_QUALITY_MAX):
    return int(SHADOW_MAP_QUALITY_DEFAULT)
  return int(quality)
