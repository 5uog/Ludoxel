# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

_EQUIP_RATE_PER_SECOND = 8.0
_SWAP_THRESHOLD = 0.05
_SWING_DURATION_S = 6.0 / 20.0


def _normalize_item_id(item_id: str | None) -> str | None:
  """
  item identifier を strip し、空文字列を `None` へ正規化する。
  animation state 内では空文字列 sentinel と item 欠落を同じ状態として扱う。
  """
  if item_id is None:
    return None
  text = str(item_id).strip()
  return text if text else None


@dataclass(frozen=True)
class FirstPersonMotionSample:
  """
  first-person motion controller から読み出される不変 snapshot である。
  visible item、target item、equip progress、swing progress、arm flag、view-model flag をまとめ、
  後段の render-state composer が mutable controller を触らずに済むようにする。
  """

  visible_item_id: str | None
  target_item_id: str | None
  equip_progress: float
  prev_equip_progress: float
  swing_progress: float
  prev_swing_progress: float
  show_arm: bool
  show_view_model: bool
  slim_arm: bool


class FirstPersonMotionController:
  """
  frame time `dt` に従って equip と swing の状態を進める有限状態機械である。
  可変 animation integrator をここへ閉じ込め、render-state construction は sample の純粋な読取りとして保つ。
  """

  def __init__(self, *, slim_arm: bool = True) -> None:
    """
    item が未表示で、equip は上がり切り、swing が停止した静止状態から controller を開始する。
    arm width mode もここで固定され、後続 sample は外部設定を再参照しない。
    """
    self.visible_item_id: str | None = None
    self.target_item_id: str | None = None

    self.equip_progress: float = 1.0
    self.prev_equip_progress: float = 1.0

    self.swing_progress: float = 0.0
    self.prev_swing_progress: float = 0.0

    self.show_arm: bool = True
    self.show_view_model: bool = True
    self.slim_arm: bool = bool(slim_arm)
    self.swing_duration_s: float = float(_SWING_DURATION_S)

    self._equip_lowering: bool = False
    self._equip_raising: bool = False
    self._swing_active: bool = False

  def prime(self, item_id: str | None) -> None:
    """
    現在見えている item と目標 item を同じ正規化 identifier へ即時同期し、equip を完了状態、swing を停止状態へ戻す。
    権威的な inventory 状態へ controller を強制整合させる入口である。
    """
    normalized = _normalize_item_id(item_id)
    self.visible_item_id = normalized
    self.target_item_id = normalized
    self.equip_progress = 1.0
    self.prev_equip_progress = 1.0
    self.swing_progress = 0.0
    self.prev_swing_progress = 0.0
    self.show_arm = normalized is None
    self._equip_lowering = False
    self._equip_raising = False
    self._swing_active = False

  def set_target_item_id(self, item_id: str | None) -> None:
    """
    target item を正規化して更新し、visible item と異なる場合は equip lowering phase に入る。
    item の差替えを即時反映せず、時間的に読める装備遷移として表現する。
    """
    normalized = _normalize_item_id(item_id)
    if normalized == self.target_item_id:
      return

    self.target_item_id = normalized
    if self.visible_item_id != self.target_item_id:
      self._equip_lowering = True
      self._equip_raising = False

  def set_view_model_visible(self, visible: bool) -> None:
    """
    view-model の表示可否だけを更新する。
    item targeting と独立した presentation policy として扱い、inventory transition へ混入させない。
    """
    self.show_view_model = bool(visible)

  def set_swing_duration_s(self, duration_s: float) -> None:
    """
    swing duration を `max(duration_s, 1e-6)` に制限して保存する。
    0 秒又は負値が渡っても、後続の progress 積分で除算や無限速度が生じない。
    """
    self.swing_duration_s = max(1e-6, float(duration_s))

  def trigger_left_swing(self) -> None:
    """
    left-hand swing を attack entry の標準 trigger として開始する。
    すべての entry path が同じ swing state reset を共有するよう、内部の swing starter へ委譲する。
    """
    self._start_swing()

  def trigger_right_swing(self, *, success: bool) -> None:
    """
    right-hand swing を成功した interaction の場合だけ開始する。
    失敗した右クリック操作が可視 swing budget を消費しないよう、成功条件を presentation animation の入口で反映する。
    """
    if bool(success):
      self._start_swing()

  def _start_swing(self) -> None:
    """
    swing progress、previous swing progress、active flag を `(0, 0, True)` へ戻す。
    連続した swing 要求は、途中位相へ重ねず常に初期位相から始まる。
    """
    self.swing_progress = 0.0
    self.prev_swing_progress = 0.0
    self._swing_active = True

  def update(self, dt: float) -> None:
    """
    `dt` により lowering、swap、raising、swing の各 phase を進める。
    状態変更は controller 内に閉じ、renderer は後で得る sample を frame data として不変に扱える。
    """
    step = max(0.0, float(dt))

    self.prev_equip_progress = float(self.equip_progress)
    self.prev_swing_progress = float(self.swing_progress)

    if (not self._equip_lowering) and (not self._equip_raising) and self.visible_item_id != self.target_item_id:
      self._equip_lowering = True

    if self._equip_lowering:
      next_progress = max(0.0, float(self.equip_progress) - float(_EQUIP_RATE_PER_SECOND) * step)
      crossed_swap = float(self.equip_progress) > float(_SWAP_THRESHOLD) and float(next_progress) <= float(_SWAP_THRESHOLD)
      self.equip_progress = float(next_progress)

      if (bool(crossed_swap) or float(self.equip_progress) <= float(_SWAP_THRESHOLD)) and self.visible_item_id != self.target_item_id:
        self.visible_item_id = self.target_item_id
        self.show_arm = self.visible_item_id is None
        self._equip_lowering = False
        self._equip_raising = True
      elif float(self.equip_progress) <= 0.0 and self.visible_item_id == self.target_item_id:
        self._equip_lowering = False
        self._equip_raising = True
    elif self._equip_raising:
      self.equip_progress = min(1.0, float(self.equip_progress) + float(_EQUIP_RATE_PER_SECOND) * step)
      if float(self.equip_progress) >= 1.0:
        self._equip_raising = False
        self._equip_lowering = False
    else:
      self.equip_progress = 1.0

    if self._swing_active:
      duration = max(1e-6, float(self.swing_duration_s))
      self.swing_progress = min(1.0, float(self.swing_progress) + step / duration)
      if float(self.swing_progress) >= 1.0:
        self.swing_progress = 0.0
        self._swing_active = False

  def sample(self) -> FirstPersonMotionSample:
    """
    controller の可変 field を `FirstPersonMotionSample` へ射影する。
    下流の render-state composition は、この snapshot を通じて live controller state を変更できない。
    """
    return FirstPersonMotionSample(
      visible_item_id=self.visible_item_id,
      target_item_id=self.target_item_id,
      equip_progress=float(self.equip_progress),
      prev_equip_progress=float(self.prev_equip_progress),
      swing_progress=float(self.swing_progress),
      prev_swing_progress=float(self.prev_swing_progress),
      show_arm=bool(self.show_arm),
      show_view_model=bool(self.show_view_model),
      slim_arm=bool(self.slim_arm),
    )
