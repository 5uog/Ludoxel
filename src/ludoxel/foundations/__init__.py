# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

__all__ = ["__version__"]


def __getattr__(name: str):
  if str(name) == "__version__":
    from ludoxel.foundations.identity.version import __version__

    return __version__
  raise AttributeError(str(name))
