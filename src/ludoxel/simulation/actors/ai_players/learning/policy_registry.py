# SPDX-FileCopyrightText: 2026 Kento Konishi
# SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
from __future__ import annotations

import json
from collections.abc import Callable
from importlib.resources import files

from ludoxel.simulation.actors.ai_players.learning.policy import POLICY_ID_BUILTIN, Policy, builtin_deterministic_policy, load_policy

POLICY_KIND_BUILTIN: str = "builtin_deterministic"
POLICY_KIND_BUNDLED: str = "bundled_learned"
POLICY_KIND_USER: str = "user_learned"
POLICY_KIND_EXPERIMENTAL: str = "experimental"

POLICY_KINDS: tuple[str, str] = (POLICY_KIND_BUILTIN, POLICY_KIND_BUNDLED)
POLICY_KIND_LABELS: tuple[tuple[str, str], ...] = (
  (POLICY_KIND_BUILTIN, "Built-in Deterministic AI"),
  (POLICY_KIND_BUNDLED, "Bundled Learned Policy"),
  (POLICY_KIND_USER, "User Learned Policy"),
  (POLICY_KIND_EXPERIMENTAL, "Experimental Policy"),
)

_BUNDLED_RESOURCE_PACKAGE: str = "ludoxel.simulation.actors.ai_players.learning"
_BUNDLED_RESOURCE_PARTS: tuple[str, str] = ("resources", "policies")


def normalize_policy_kind(value: object) -> str:
  """
  policy 種別を四値の何れかへ正規化する。
  入力は任意 object を許容し、文字列化と前後空白除去の後に bundled_learned、user_learned、experimental と明示一致した場合だけその値を採用し、欠落値・未知値は組み込み deterministic を表す builtin_deterministic へ退避する。fallback を builtin へ寄せるのは、未知種別でも必ず使用可能 policy を解決できる不変条件を保つためである。
  """
  raw = str(value).strip()
  if raw == POLICY_KIND_BUNDLED:
    return POLICY_KIND_BUNDLED
  if raw == POLICY_KIND_USER:
    return POLICY_KIND_USER
  if raw == POLICY_KIND_EXPERIMENTAL:
    return POLICY_KIND_EXPERIMENTAL
  return POLICY_KIND_BUILTIN


def _load_bundled_policies() -> dict[str, Policy]:
  """
  同梱 policy resource directory 内の全 JSON artifact を読み込み、policy_id から Policy への mapping で返す。
  resource は package data として配置され、importlib.resources の Traversable 経由で列挙する。JSON 解釈失敗、形式不正、policy_id 欠落の artifact は個別に無視し、健全な artifact だけを収める。resource directory が存在しない frozen 構成や読み取り例外でも空 mapping を返し、registry は組み込み deterministic へ退避できる。組み込み deterministic の id は同梱 artifact と衝突しないよう除外する。
  """
  policies: dict[str, Policy] = {}
  try:
    root = files(_BUNDLED_RESOURCE_PACKAGE)
    for part in _BUNDLED_RESOURCE_PARTS:
      root = root.joinpath(part)
    if not root.is_dir():
      return policies
    for entry in root.iterdir():
      if not entry.name.endswith(".json"):
        continue
      try:
        payload = json.loads(entry.read_text(encoding="utf-8"))
      except (OSError, ValueError, json.JSONDecodeError):
        continue
      policy = load_policy(payload)
      if policy is None or str(policy.policy_id) == str(POLICY_ID_BUILTIN):
        continue
      policies[str(policy.policy_id)] = policy
  except (FileNotFoundError, ModuleNotFoundError, OSError):
    return policies
  return policies


class PolicyRegistry:
  """
  policy 種別と識別子から実使用する Policy を解決し、常に使用可能 policy を返すことを保証する registry である。
  本段階の registry は同梱 JSON artifact を対象とし、組み込み deterministic baseline を最終 fallback として保持する。bundled 種別は同梱 artifact から、user 種別は注入された user_policy_loader から、experimental 種別は同梱又は user から解決を試み、いずれも見つからない・壊れている・評価未通過(is_usable が偽)の場合は組み込み deterministic へ退避する。これにより壊れた policy でも例外や起動不能を生じず、AI は必ず deterministic baseline で機能する。
  user_policy_loader は user data root からの読み込みを担う application 層の callable であり、simulation 層は保存 path を知らずに user policy を取り込む。
  """

  def __init__(self, *, user_policy_loader: Callable[[str], Policy | None] | None = None) -> None:
    """
    同梱 policy を一度だけ読み込み、user policy 解決用 loader を保持して初期化する。
    user_policy_loader は policy_id を受け取り Policy 又は None を返す callable であり、未注入の場合 user 種別は組み込み deterministic へ退避する。読み込み済み同梱 policy は instance 寿命の間 cache し、毎回の resource 走査を避ける。
    """
    self._bundled: dict[str, Policy] = _load_bundled_policies()
    self._user_policy_loader = user_policy_loader
    self._builtin: Policy = builtin_deterministic_policy()

  def bundled_policies(self) -> tuple[Policy, ...]:
    """
    読み込み済みの同梱 policy を policy_id 昇順で返す。
    UI の policy 一覧表示と選択肢提示はこの列を用いる。返値は cache 済み Policy への参照であり、再走査は行わない。
    """
    return tuple(self._bundled[key] for key in sorted(self._bundled.keys()))

  def builtin_policy(self) -> Policy:
    """
    組み込み deterministic baseline の artifact を返す。
    本 policy は常に使用可能であり、registry の最終 fallback として用いる。
    """
    return self._builtin

  def _usable_or_none(self, policy: Policy | None) -> Policy | None:
    """
    与えた policy が使用可能なら返し、None 又は使用不能なら None を返す。
    使用可能性は Policy.is_usable に委ね、schema・compatibility の不一致と評価未通過を本番使用から除外する。
    """
    if isinstance(policy, Policy) and bool(policy.is_usable()):
      return policy
    return None

  def resolve(self, *, kind: str, policy_id: str = "") -> Policy:
    """
    種別と識別子から実使用 policy を解決し、必ず使用可能な Policy を返す。
    builtin 種別は組み込み deterministic を返す。bundled 種別は policy_id 指定があればその同梱 artifact を、無指定なら任意の使用可能な同梱 artifact を試み、得られなければ組み込みへ退避する。user 種別は user_policy_loader から policy_id の policy を試み、得られなければ組み込みへ退避する。experimental 種別は user_policy_loader を優先し、無ければ同梱から試み、いずれも不可なら組み込みへ退避する。解決結果が使用不能(壊れている・評価未通過)の場合も組み込みへ退避するため、返値は常に使用可能である。
    """
    normalized_kind = normalize_policy_kind(kind)
    requested_id = str(policy_id).strip()

    if normalized_kind == POLICY_KIND_BUILTIN:
      return self._builtin

    if normalized_kind == POLICY_KIND_BUNDLED:
      if requested_id:
        candidate = self._usable_or_none(self._bundled.get(requested_id))
        if candidate is not None:
          return candidate
      else:
        for key in sorted(self._bundled.keys()):
          candidate = self._usable_or_none(self._bundled.get(key))
          if candidate is not None:
            return candidate
      return self._builtin

    if normalized_kind == POLICY_KIND_USER:
      candidate = self._resolve_user_policy(requested_id)
      return candidate if candidate is not None else self._builtin

    candidate = self._resolve_user_policy(requested_id)
    if candidate is not None:
      return candidate
    if requested_id:
      bundled_candidate = self._usable_or_none(self._bundled.get(requested_id))
      if bundled_candidate is not None:
        return bundled_candidate
    return self._builtin

  def _resolve_user_policy(self, policy_id: str) -> Policy | None:
    """
    注入された loader を介して user policy を解決し、使用可能なら返す。
    loader 未注入、loader が None を返す、loader が例外を送出する、又は得た policy が使用不能の場合は None を返す。loader の例外を握り潰すのは、不正な user data によって AI 解決全体が失敗しない安定性を与えるためであり、握り潰しは fallback 退避のみを意味し、誤った policy を本番使用させない。
    """
    if self._user_policy_loader is None:
      return None
    try:
      loaded = self._user_policy_loader(str(policy_id))
    except Exception:
      return None
    return self._usable_or_none(loaded)
