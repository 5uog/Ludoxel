# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from dataclasses import dataclass

from ludoxel.foundations.mathematics.scalars.numeric import clampf

AUDIO_CATEGORY_MASTER = "master"
AUDIO_CATEGORY_AMBIENT = "ambient"
AUDIO_CATEGORY_BLOCK = "block"
AUDIO_CATEGORY_PLAYER = "player"

AUDIO_CATEGORY_ORDER: tuple[str, ...] = (AUDIO_CATEGORY_MASTER, AUDIO_CATEGORY_AMBIENT, AUDIO_CATEGORY_BLOCK, AUDIO_CATEGORY_PLAYER)


def _clamp_volume(value: object, *, default: float = 1.0) -> float:
  """
  任意の入力を実数へ変換したうえで、音量係数を閉区間 [0, 1] へ射影する。
  変換不能な値は default に退避させるため、ミキサーへ渡る gain は常に有限な正規化値となる。
  """
  try:
    numeric = float(value)
  except Exception:
    numeric = float(default)
  return float(clampf(float(numeric), 0.0, 1.0))


@dataclass(frozen=True)
class AudioPreferences:
  """
  master、ambient、block、player の四つの音量係数を保持する設定値である。
  各成分は [0, 1] に正規化され、presentation.audio の再生管理はこの値をカテゴリ別の実効音量へ合成する。
  """

  master: float = 1.0
  ambient: float = 1.0
  block: float = 1.0
  player: float = 1.0

  def __post_init__(self) -> None:
    """
    生成時に全音量係数を `_clamp_volume` へ通し、
    データクラス内部の値を保存形式と再生処理が共有できる正規形に固定する。
    """
    object.__setattr__(self, "master", _clamp_volume(self.master))
    object.__setattr__(self, "ambient", _clamp_volume(self.ambient))
    object.__setattr__(self, "block", _clamp_volume(self.block))
    object.__setattr__(self, "player", _clamp_volume(self.player))

  def normalized(self) -> "AudioPreferences":
    """
    この型は生成時点で正規化済みであるため、追加の複製を行わず同一インスタンスを返す。
    """
    return self

  def volume_for(self, category: str) -> float:
    """
    カテゴリ音量は master とカテゴリ別係数の積として求める。
    master 自体を照会した場合又は未知カテゴリの場合は、全体音量として master のみを返す。
    """
    key = str(category).strip().lower()
    if key == AUDIO_CATEGORY_AMBIENT:
      return float(self.master) * float(self.ambient)
    if key == AUDIO_CATEGORY_BLOCK:
      return float(self.master) * float(self.block)
    if key == AUDIO_CATEGORY_PLAYER:
      return float(self.master) * float(self.player)
    return float(self.master)

  def to_dict(self) -> dict[str, float]:
    """
    正規化済みの音量ベクトルを、永続化 schema がそのまま保存できるカテゴリ識別子付きの平坦な辞書へ変換する。
    """
    return {AUDIO_CATEGORY_MASTER: float(self.master), AUDIO_CATEGORY_AMBIENT: float(self.ambient), AUDIO_CATEGORY_BLOCK: float(self.block), AUDIO_CATEGORY_PLAYER: float(self.player)}

  @staticmethod
  def from_dict(data: object) -> "AudioPreferences":
    """
    外部入力が辞書である場合に限りカテゴリ別音量を読み取り、
    各成分を [0, 1] へ射影して `AudioPreferences` を構成する。
    辞書以外の値は既定設定として扱う。
    """
    if not isinstance(data, dict):
      return AudioPreferences()
    return AudioPreferences(
      master=_clamp_volume(data.get(AUDIO_CATEGORY_MASTER, 1.0)),
      ambient=_clamp_volume(data.get(AUDIO_CATEGORY_AMBIENT, 1.0)),
      block=_clamp_volume(data.get(AUDIO_CATEGORY_BLOCK, 1.0)),
      player=_clamp_volume(data.get(AUDIO_CATEGORY_PLAYER, 1.0)),
    )
