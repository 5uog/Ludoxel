# play space と Othello 境界

`ludoxel.simulation.spaces` は、play space の domain 定義を保持する。
ここで扱う対象は、状態、規則、初期値、domain resource である。
desktop shell、session orchestration、file persistence、window、
renderer backend、audio playback は対象外である。

## 1. My World

`simulation.spaces.my_world` は、sandbox play space の domain 構成を扱う。
spawn、初期 world state、domain default、space 固有の rule 入力は本 package に属する。

次の処理は本 package に置かない。

```text
SessionManager construction
AppState application
file persistence
Qt window construction
renderer backend selection
audio playback
```

## 2. Othello

`simulation.spaces.othello` は、Othello の domain を扱う。

- board representation
- square coordinate
- legal move generation
- game state
- turn state
- clock state as domain data
- match transition
- engine facade
- search logic
- opening book state
- canonical board transform
- book lookup
- learning transform
- bundled read-only book resource

## 3. 永続化との分離

bundled opening book resource は、immutable domain resource として simulation
package に置くことができる。

user-authored book extension、compiled cache、runtime manifest、integrity key、
storage path、migration は application persistence に属する。simulation がこれら
を import すると、domain book logic が保存媒体と改竄検出方式に拘束される。

user book の storage は application の hook で接続する。
`simulation.spaces.othello.books.opening` は hook type、登録関数、payload codec だけを持ち、
manifest key、runtime data root、user/cache file path、file-store policy を所有しない。

## 4. engine 分割

Othello engine は、実装量と責務が成立する場合に次の単位へ分ける。

```text
bitboards.py       board encoding and primitive bitboard operations
evaluation.py      static evaluation and profile application
search.py          search procedure and result construction
ordering.py        move-ordering policy
transposition.py   transposition-table records and lookup policy
classic.py         classic engine facade
insane.py          high-strength engine cache and root orchestration
worker.py          worker entry and message handling
```

分割は、実行される責務が移動する場合に限る。空 file、将来用 file、
forwarding だけの file は境界を形成しない。

現行では上記の `bitboards.py`、`evaluation.py`、`ordering.py`、`search.py`、
`transposition.py` に実装を移している。`classic.py` は classic engine facade と
forecast を残す。
