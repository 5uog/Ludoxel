# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import json
import os
from collections.abc import Iterable
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ludoxel.application.persistence.schema.ai_learning import PersistedAiLearningState
from ludoxel.application.persistence.stores.json_file import JsonFileStore
from ludoxel.foundations.locations.roots import default_runtime_data_root, runtime_state_root
from ludoxel.simulation.actors.ai_players.learning.dataset import RECORD_KINDS, DatasetSummary, decode_record_line, encode_record_line

_DATASET_DIR_NAME: str = "learning"
_SETTINGS_FILE_NAME: str = "ai_learning.json"
_SAFE_DATASET_CHARS: frozenset[str] = frozenset("abcdefghijklmnopqrstuvwxyz0123456789_-")


def _safe_dataset_name(dataset_id: str) -> str:
  """
  論理 dataset 識別子を file 名として安全な要素へ正規化する。
  小文字化した識別子のうち英数字と下線と hyphen だけを残し、それ以外の文字は下線へ置換する。これにより path separator、dot、空白などによる file 名注入と親 directory 脱出を防ぐ。正規化結果が空になる場合は "default" を用いる。
  """
  lowered = str(dataset_id).strip().lower()
  filtered = "".join(character if character in _SAFE_DATASET_CHARS else "_" for character in lowered).strip("_")
  return filtered or "default"


@dataclass
class DemonstrationDatasetWriter:
  """
  demonstration 記録を user data root 配下の JSON Lines file へ追記する DatasetSink 実装である。
  本 writer は application 層に属し、simulation 層の DemonstrationRecorder が知らない保存 file path と user data root の解決を担う。記録は repository root、assets、src、resources ではなく user data root の runtime state directory(`<data_root>/state/learning/<dataset>.jsonl`)へ書き込み、player 生 data を package 配布物や source tree へ混入させない。追記方式により既存記録を上書きせず、肥大化した dataset は clear で削除できる。
  write_records は記録 mapping 列を一括追記し、書き込み件数を返す。flush 単位の追記で済むため、毎 frame の同期書き込みや巨大 file 全書き換えを避けられる。
  """

  path: Path

  def write_records(self, rows: Iterable[dict[str, Any]]) -> int:
    """
    記録 mapping 列を dataset file へ JSON Lines として追記し、追記件数を返す。
    各 row は DemonstrationRecord.to_dict 形式の mapping を想定し、改行終端の単一行へ直列化する。空列の場合は file を開かず 0 を返す。parent directory が無い場合は作成し、追記 open で末尾へ書き足す。直列化に失敗した row は除外し、健全な記録だけを書き込むことで一件の不正値が全体の追記を失敗させないようにする。返値は実際に書き込んだ件数である。
    """
    lines: list[str] = []
    for row in rows:
      try:
        lines.append(json.dumps(dict(row), ensure_ascii=False, sort_keys=True, separators=(",", ":")))
      except (TypeError, ValueError):
        continue
    if not lines:
      return 0
    target = Path(self.path)
    target.parent.mkdir(parents=True, exist_ok=True)
    with open(target, "a", encoding="utf-8", newline="\n") as handle:
      for line in lines:
        handle.write(line)
        handle.write("\n")
      handle.flush()
      os.fsync(handle.fileno())
    return len(lines)


@dataclass
class AiLearningStore:
  """
  AI 学習基盤の設定状態と demonstration dataset を user data root 上で永続化する store である。
  設定状態(PersistedAiLearningState)は runtime state directory 直下の `ai_learning.json` に JSON として保存し、dataset は `state/learning/<dataset>.jsonl` に JSON Lines として蓄積する。いずれも user data root を基準とし、repository root や package resource へは書き込まない。設定 file は player_state.json などの critical save state とは別管理の preference であり、本 store は専用 file を読み書きする。dataset の規模要約、削除(clear)、書き出し(export)、取り込み(import)を提供し、肥大化しても削除できる運用を保証する。
  project_root は data_root 未指定時の runtime data root 解決に用い、data_root を明示した場合はその directory を基準とする(test と移行で有用)。
  """

  project_root: Path
  data_root: Path | None = None

  def _data_root(self) -> Path:
    """
    実際に用いる runtime data root を返す。
    data_root が明示されていればそれを、未指定なら project_root を起点に OS 標準位置から解決した user data root を返す。state file と dataset file はこの root 配下に置かれる。
    """
    if self.data_root is not None:
      return Path(self.data_root)
    return default_runtime_data_root(Path(self.project_root))

  def _settings_path(self) -> Path:
    """
    学習設定 file の絶対 path を返す。
    返値は runtime state directory 直下の `ai_learning.json` であり、設定状態の読み書きはこの path に対して行う。
    """
    return runtime_state_root(self._data_root()) / _SETTINGS_FILE_NAME

  def dataset_path(self, dataset_id: str) -> Path:
    """
    指定 dataset 識別子に対応する JSON Lines file の絶対 path を返す。
    識別子は _safe_dataset_name で file 名安全な要素へ正規化され、返値は `<data_root>/state/learning/<safe>.jsonl` である。recorder の sink、要約、削除、書き出し、取り込みはこの path を共有する。
    """
    return runtime_state_root(self._data_root()) / _DATASET_DIR_NAME / f"{_safe_dataset_name(dataset_id)}.jsonl"

  def load_state(self) -> PersistedAiLearningState:
    """
    保存済みの学習状態を読み込み、存在しない・破損している場合は既定状態を返す。
    JsonFileStore が JSON 復元に失敗した場合は None を返すため、その際は既定状態へ退避する。これにより設定 file の欠落や破損で起動が妨げられず、Learning Mode は安全側の off 既定から始まる。
    """
    raw = JsonFileStore(path=self._settings_path()).read()
    if raw is None:
      return PersistedAiLearningState.default()
    return PersistedAiLearningState.from_dict(raw)

  def save_state(self, state: PersistedAiLearningState) -> None:
    """
    学習状態を JSON として原子的に保存する。
    JsonFileStore の write は一時 file への書き込みと os.replace による置換で行われ、書き込み途中の状態を残さない。本 store は設定 preference を保存するものであり、player_state.json などの integrity 保護対象 file とは独立に管理する。
    """
    JsonFileStore(path=self._settings_path()).write(state.to_dict())

  def dataset_writer(self, dataset_id: str) -> DemonstrationDatasetWriter:
    """
    指定 dataset への追記 sink を返す。
    返値は dataset_path が定める JSON Lines file を追記対象とする DemonstrationDatasetWriter であり、simulation 層の recorder へ flush 先として渡せる。sink は path だけを保持し、書き込み時に parent directory を必要に応じて作成する。
    """
    return DemonstrationDatasetWriter(path=self.dataset_path(dataset_id))

  def dataset_summary(self, dataset_id: str) -> DatasetSummary:
    """
    指定 dataset の規模を走査して要約を返す。
    file が存在しない場合は空要約を返す。存在する場合は file の byte 長を記録し、各行を decode_record_line で検証して有効記録数と種別別件数を集計する。途中で切れた行や空行は無効として計数せず、健全な記録だけを数える。本 method は UI の dataset size 表示と保存要約の更新に用い、毎 frame ではなく要求時にのみ呼ぶ前提である。
    """
    path = self.dataset_path(dataset_id)
    if not path.is_file():
      return DatasetSummary()
    try:
      byte_size = int(path.stat().st_size)
    except OSError:
      byte_size = 0
    kinds: dict[str, int] = {kind: 0 for kind in RECORD_KINDS}
    record_count = 0
    try:
      with open(path, "r", encoding="utf-8") as handle:
        for line in handle:
          record = decode_record_line(line)
          if record is None:
            continue
          record_count += 1
          kinds[str(record.kind)] = int(kinds.get(str(record.kind), 0)) + 1
    except OSError:
      return DatasetSummary(record_count=0, byte_size=int(byte_size), kinds={})
    populated = {kind: int(count) for kind, count in kinds.items() if int(count) > 0}
    return DatasetSummary(record_count=int(record_count), byte_size=int(byte_size), kinds=populated)

  def clear_dataset(self, dataset_id: str) -> bool:
    """
    指定 dataset の蓄積記録を削除する。
    file が存在すれば削除して真を返し、存在しなければ偽を返す。削除は dataset file のみを対象とし、設定状態や他の dataset には影響しない。肥大化した記録を利用者が明示的に破棄できる経路を提供する。
    """
    path = self.dataset_path(dataset_id)
    if not path.is_file():
      return False
    try:
      path.unlink()
    except OSError:
      return False
    return True

  def export_dataset(self, dataset_id: str, destination: Path) -> int:
    """
    指定 dataset の有効記録を外部 file へ書き出し、書き出した件数を返す。
    source dataset が存在しない場合は 0 を返す。各行を decode_record_line で検証し、健全な記録だけを destination へ JSON Lines として書き出すため、途中で切れた行や不正値を含まない export が得られる。destination の parent directory は必要に応じて作成する。
    """
    source = self.dataset_path(dataset_id)
    if not source.is_file():
      return 0
    target = Path(destination)
    target.parent.mkdir(parents=True, exist_ok=True)
    written = 0
    with open(source, "r", encoding="utf-8") as reader, open(target, "w", encoding="utf-8", newline="\n") as writer:
      for line in reader:
        record = decode_record_line(line)
        if record is None:
          continue
        writer.write(encode_record_line(record))
        writer.write("\n")
        written += 1
    return int(written)

  def import_dataset(self, dataset_id: str, source: Path) -> int:
    """
    外部 file の有効記録を指定 dataset へ追記し、取り込んだ件数を返す。
    source file が存在しない場合は 0 を返す。各行を decode_record_line で検証し、健全な記録だけを既存 dataset の末尾へ追記する。不正な行や非 demonstration JSON を取り込まないため、外部 file の混入による dataset 破損を防ぐ。返値は実際に追記した件数である。
    """
    origin = Path(source)
    if not origin.is_file():
      return 0
    rows: list[dict[str, Any]] = []
    with open(origin, "r", encoding="utf-8") as reader:
      for line in reader:
        record = decode_record_line(line)
        if record is None:
          continue
        rows.append(record.to_dict())
    if not rows:
      return 0
    return int(self.dataset_writer(dataset_id).write_records(rows))
