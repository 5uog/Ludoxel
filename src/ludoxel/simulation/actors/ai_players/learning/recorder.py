# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

from collections.abc import Iterable
from typing import Any

from ludoxel.simulation.actors.ai_players.learning.dataset import DatasetSink, DemonstrationRecord, is_record_kind
from ludoxel.simulation.actors.ai_players.learning.observation import AiObservation

_DEFAULT_FLUSH_THRESHOLD: int = 64
_MAX_BUFFER: int = 4096


class DemonstrationRecorder:
  """
  player 実演と AI の意思決定・失敗・死亡・route 失敗・脱出試行を、画面画像ではなくゲーム状態と行動として buffer へ蓄積する記録器である。
  本記録器は simulation 層に属し、保存 file path や user data root を一切知らない。実際の永続化は flush に渡される DatasetSink(application 層が実装)へ委譲し、これにより層境界(simulation は保存 path を持たない)を保つ。記録は enabled が真で、かつ対象種別が capture 対象集合に含まれる場合にのみ buffer へ積まれ、enabled が偽(Learning Mode の Off に対応)では一切記録しないため、記録機能は AI 挙動へ干渉しない。Observe Only 相当の運用では enabled を真にしつつ AI の行動決定を変えず、観測と行動の対だけを buffer へ積む。
  buffer は flush_threshold 到達時に呼び出し側が flush する batch 方式を想定し、上限 _MAX_BUFFER を超える古い記録は破棄して通常 gameplay 中の無制限な memory 増加を防ぐ。flush 未完了の記録が残ったまま終了する場合に備え、shutdown_flush で sink へ確実に吐き出す経路を提供する。
  """

  def __init__(self, *, enabled: bool = False, captured_kinds: Iterable[str] | None = None, flush_threshold: int = _DEFAULT_FLUSH_THRESHOLD) -> None:
    """
    記録の有効状態、capture 対象種別、自動 flush 推奨閾値を確定して初期化する。
    captured_kinds は記録対象とする種別の反復可能列であり、未知種別は除外する。省略時は空集合とし、種別が選択されるまで記録は積まれない。flush_threshold は buffer 件数がこの値以上になったことを should_flush で通知するための推奨閾値(下限 1)であり、呼び出し側の batch 処理判断に用いる。enabled が偽の間は record 系呼び出しが副作用を持たない。
    """
    self._enabled = bool(enabled)
    self._captured_kinds: set[str] = set(kind for kind in (captured_kinds or ()) if is_record_kind(kind))
    self._flush_threshold = max(1, int(flush_threshold))
    self._buffer: list[DemonstrationRecord] = []

  @property
  def enabled(self) -> bool:
    """
    現在記録が有効であるかを返す。
    偽の場合 record 系は副作用を持たず、AI 挙動へ干渉しない。Learning Mode の Off は enabled を偽として設定することに対応する。
    """
    return bool(self._enabled)

  def configure(self, *, enabled: bool, captured_kinds: Iterable[str]) -> None:
    """
    記録の有効状態と capture 対象種別を更新する。
    enabled を偽へ更新しても buffer 内の既存記録は破棄せず、後続 flush で永続化できる。captured_kinds は未知種別を除外して新たな対象集合へ置き換える。設定変更そのものは軽量であり、settings の開閉や mode 切替で重い再構築を生じない。
    """
    self._enabled = bool(enabled)
    self._captured_kinds = set(kind for kind in (captured_kinds or ()) if is_record_kind(kind))

  def captures(self, kind: str) -> bool:
    """
    指定種別が現在記録対象であるかを返す。
    enabled が真で、かつ kind が capture 対象集合に含まれる場合のみ真を返す。呼び出し側は重い observation 構築の前にこの述語で記録要否を判定し、不要な構築費用を避けられる。
    """
    return bool(self._enabled) and str(kind) in self._captured_kinds

  def record(
    self,
    *,
    kind: str,
    observation: AiObservation | dict[str, Any] | None = None,
    action: str | None = None,
    success: bool | None = None,
    reward: float | None = None,
    tick: int = 0,
    actor_id: str = "",
    detail: dict[str, Any] | None = None,
  ) -> bool:
    """
    一件の demonstration 記録を buffer へ積む。
    enabled が偽、又は kind が capture 対象でない場合は何も積まず偽を返し、記録機能が AI 挙動へ干渉しないことを保証する。observation は AiObservation 又はその to_dict 形式 mapping を受け取り、いずれでも JSON 直列化可能な mapping として保持する。buffer 件数が _MAX_BUFFER を超える場合は最古の記録を 1 件破棄してから積み、通常 gameplay 中の無制限な memory 増加を防ぐ。記録を積んだ場合は真を返す。
    """
    if not self.captures(kind):
      return False
    observation_dict: dict[str, Any]
    if isinstance(observation, AiObservation):
      observation_dict = observation.to_dict()
    elif isinstance(observation, dict):
      observation_dict = dict(observation)
    else:
      observation_dict = {}
    entry = DemonstrationRecord(
      kind=str(kind),
      tick=int(tick),
      actor_id=str(actor_id),
      observation=observation_dict,
      action=(None if action is None else str(action)),
      success=(None if success is None else bool(success)),
      reward=(None if reward is None else float(reward)),
      detail=dict(detail or {}),
    )
    if len(self._buffer) >= int(_MAX_BUFFER):
      del self._buffer[0]
    self._buffer.append(entry)
    return True

  def pending_count(self) -> int:
    """
    flush 待ちの buffer 件数を返す。
    呼び出し側は shutdown 前の未完了記録の有無確認に用いる。
    """
    return len(self._buffer)

  def should_flush(self) -> bool:
    """
    buffer 件数が自動 flush 推奨閾値に達したかを返す。
    真の場合、呼び出し側は次の安全な機会に flush して buffer を排出することが望ましい。これにより毎 frame の同期書き込みを避けつつ、記録の滞留を抑える。
    """
    return len(self._buffer) >= int(self._flush_threshold)

  def flush(self, sink: DatasetSink) -> int:
    """
    buffer 内の全記録を sink へ書き出し、書き出した件数を返す。
    buffer が空の場合は sink を呼ばず 0 を返す。sink への書き出しが成功した場合に限り buffer を空へ戻し、sink が例外を送出した場合は buffer を保持したまま例外を呼び出し側へ伝播することで、記録の損失と二重書き込みのいずれも避ける。書き出し I/O は呼び出し側が background 又は安全な時点で行う前提であり、本 method 自体は通常 gameplay tick 上での同期 I/O を強制しない。
    """
    if not self._buffer:
      return 0
    rows = tuple(record.to_dict() for record in self._buffer)
    written = int(sink.write_records(rows))
    self._buffer.clear()
    return written

  def shutdown_flush(self, sink: DatasetSink) -> int:
    """
    終了時に未完了記録を sink へ確実に書き出し、書き出した件数を返す。
    flush と同義の排出を行い、sink が例外を送出した場合は記録を保持したまま伝播する。shutdown 経路はこの method を介して flush 未完了の記録を失わないことを意図する。
    """
    return self.flush(sink)

  def discard(self) -> int:
    """
    buffer 内の未 flush 記録を破棄し、破棄件数を返す。
    記録を永続化せずに捨てる明示操作であり、dataset の clear 操作や記録停止時の即時破棄に用いる。永続化済み dataset には影響しない。
    """
    count = len(self._buffer)
    self._buffer.clear()
    return int(count)
