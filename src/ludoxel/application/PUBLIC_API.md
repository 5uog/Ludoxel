# application public API 規律

`ludoxel.application` の public API は、起動、永続化、session 構成に関する
安定契約に限定する。内部処理を短く import するための集約場所ではない。

## 1. 公開条件

application package の `__init__.py` から symbol を re-export する場合は、
次のいずれかに該当する必要がある。

- application startup entry
- stable persisted schema type
- stable store type
- stable runtime preference type
- presentation が使用する stable session construction contract
- package 外から明示的に使用される narrow pipeline entry

## 2. 公開に適する symbol

公開候補は、たとえば次のようなものである。

```text
run_app
AppState
AppStateStore
RuntimePreferences
KeybindSettings
```

実際の公開一覧は、実装に存在する symbol と一致させる。

## 3. 公開に適さない symbol

次の symbol は public facade に出さない。

- schema coercion helper
- JSON helper
- manifest helper
- integrity-key 内部処理
- session stepping helper
- AI orchestration 内部処理
- fixed-step timing 内部処理
- 旧 path 互換 alias
- presentation 専用 convenience import

## 4. lazy facade

facade export が循環 import や presentation import を引き起こす場合は、
lazy `__getattr__` を使うか、direct module import を要求する。
wrapper により import-order defect を隠す処理は認めない。

現行の `ludoxel.application.__init__` は `run_app` だけを lazy に公開する。
`application.persistence.__init__` は `AppStateStore` と stable persisted schema
型を lazy に公開する。schema package 自体は `schema/__init__.py` で
`AppState`、`PersistedSettings`、`PersistedInventory`、`PersistedPlayer`、
`PersistedWorld`、`PersistedAiPlayer`、`PersistedPlaySpace`、
`PersistedOthelloSpace`、`PlayerStateFile`、`WorldStateFile` を公開する。
schema coercion helper、session manager、render snapshot DTO、integrity helper は
direct module import を基本とする。

## 5. 検証

```bash
python - <<'PY'
from ludoxel.application import run_app
from ludoxel.application.persistence import AppState, AppStateStore
print("application public API ok")
PY
```

検証対象は実在する public contract と一致させる。
存在しない symbol を `__init__.py` に追加して検証だけを通す処理は認めない。
