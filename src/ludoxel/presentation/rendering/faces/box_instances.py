# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Sequence

import numpy as np

from ludoxel.presentation.rendering.faces.row_utils import model_matrix_for_local_box
from ludoxel.simulation.blocks.models.common import LocalBox


def cube_rows_from_boxes(boxes: Sequence[LocalBox], parent_transform: np.ndarray) -> np.ndarray:
  """
  各 local box `j` について `M_j = M_parent T(c_j) S(s_j)` を構成し、4x4 行列を row-major の 16 成分として積み上げる。
  shadow caster など、UV を必要としない cuboid instance payload はこの `n x 16` 配列を入力契約とする。
  """
  if not boxes:
    return np.zeros((0, 16), dtype=np.float32)

  rows = []
  for box in boxes:
    rows.append(np.asarray(model_matrix_for_local_box(parent_transform, box), dtype=np.float32).reshape(16))
  return np.ascontiguousarray(np.vstack(rows), dtype=np.float32)
