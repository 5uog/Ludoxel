# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

_MASK64: int = (1 << 64) - 1
_FNV64_OFFSET_BASIS: int = 0xCBF29CE484222325
_FNV64_PRIME: int = 0x100000001B3
_SPLITMIX64_GAMMA: int = 0x9E3779B97F4A7C15
_SPLITMIX64_MIX_A: int = 0xBF58476D1CE4E5B9
_SPLITMIX64_MIX_B: int = 0x94D049BB133111EB


def splitmix64(state: int) -> int:
  z = (int(state) + _SPLITMIX64_GAMMA) & _MASK64
  z = ((z ^ (z >> 30)) * _SPLITMIX64_MIX_A) & _MASK64
  z = ((z ^ (z >> 27)) * _SPLITMIX64_MIX_B) & _MASK64
  return (z ^ (z >> 31)) & _MASK64


def fnv1a_uint64(text: str) -> int:
  h = _FNV64_OFFSET_BASIS
  for byte in str(text).encode("utf-8"):
    h = (h ^ int(byte)) & _MASK64
    h = (h * _FNV64_PRIME) & _MASK64
  return h & _MASK64


def mix_uint64(*values: int) -> int:
  acc = _SPLITMIX64_GAMMA
  for value in values:
    folded = int(value) & _MASK64
    acc = splitmix64((acc ^ folded) & _MASK64)
  return acc & _MASK64


def uint64_to_unit_index(value: int, modulus: int) -> int:
  m = int(modulus)
  if m <= 1:
    return 0
  return int(value) % m
