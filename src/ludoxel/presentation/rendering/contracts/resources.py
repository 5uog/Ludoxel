# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class BackendRendererInfo:
  vendor: str = ""
  renderer: str = ""
  api: str = ""
  shading_language: str = ""

  def as_gl_info_tuple(self) -> tuple[str, str, str, str]:
    return (str(self.vendor), str(self.renderer), str(self.api), str(self.shading_language))
