# simulation public API 規律

`ludoxel.simulation` の public API は、application と presentation が依存する
domain 契約である。内部 algorithm の作業領域や helper を外部に露出させる
場所ではない。

## 1. 公開条件

simulation package の `__init__.py` から symbol を re-export する場合は、
次のいずれかに該当する必要がある。

- domain state type
- domain constant
- rule entry point
- registry constructor
- catalog function
- state codec
- play space factory value
- AI state または behavior configuration
- Othello board、move、state、engine facade

## 2. 公開に適さない symbol

次の symbol は public facade に出さない。

- AI planner の scratch state
- route recovery の内部 helper
- collision 判定の中間 helper
- placement branch の内部 helper
- Othello search node の内部表現
- transposition table の内部操作
- worker thread の private function
- renderer 向け visual composition の詳細

## 3. facade 規律

`__init__.py` は、package 境界上の安定契約を表す。重い engine、background
worker、private helper、内部 cache を無差別に import する集約 file にしては
ならない。

folder import を成立させる package と、direct module import を要求する内部
実装を明確に分ける。

現行の folder import public API は `simulation.spaces.my_world` の
`MY_WORLD_SPAWN` と `make_my_world_state` を代表例とする。player damage、
interaction helper、Othello bitboard/search/transposition は direct module import
に限定し、package root には出さない。

## 4. 検証

```bash
python - <<'PY'
from ludoxel.simulation.spaces.my_world import (
  MY_WORLD_SPAWN,
  make_my_world_state,
)
print("simulation public API ok")
PY
```

検証対象の symbol は、実装上の public contract と一致させる。
存在しない symbol を facade に追加して、検証だけを通す処理は認めない。
