# persistence と sessions の境界

`application.persistence` と `application.sessions` は、
domain state を application runtime と保存形式へ接続する。
これらは domain rule の所有者ではなく、presentation implementation の所有者でもない。

## 1. persistence の責務

`application.persistence` は、保存に関する application-level structure を扱う。

- persisted settings
- persisted inventory
- persisted player state
- persisted world state
- persisted play-space state
- persisted Othello session state
- JSON file store
- application state store
- runtime integrity manifest
- protected runtime file policy
- migration policy

persistence schema は、simulation の domain 型と application の preference 型を
参照できる。Qt widget、HUD component、renderer backend、audio playback、
presentation constant を参照してはならない。

現行 schema の分割は次の通りである。

```text
schema/settings.py       persisted runtime preference values
schema/inventory.py      persisted hotbar branches
schema/player.py         persisted local player pose and health
schema/world.py          persisted world block snapshot
schema/ai_player.py      persisted AI actor codec and AiPlayerState conversion
schema/play_space.py     My World persisted space bundle
schema/othello.py        Othello persisted space bundle
schema/files.py          player_state.json and world_state.json envelopes
schema/app.py            in-memory AppState aggregate
```

`schema/app.py` は `AppState` の集約だけを扱う。file version、旧形式移行、
inventory branch codec、AI actor codec を `app.py` へ戻してはならない。

## 2. sessions の責務

`application.sessions` は、実行時の組立と進行を扱う。

- play-space context
- session factory wiring
- session manager orchestration
- runtime-state application
- fixed-step advancement
- save/load coordination

session code は simulation rule を呼び出せる。ただし、movement、collision、
combat、placement、AI planning、Othello legality の本体を所有してはならない。

## 3. 分割規律

persistence や session の file が肥大化した場合は、実行責務に基づいて分割する。

```text
settings schema
inventory schema
player schema
world schema
play-space schema
AI-player schema
Othello schema
stepping
interactions
snapshots
AI coordination
state application
```

分割は、独立した責務と実行内容が存在する場合に限る。forwarding だけの file、
空 file、将来用 file は architecture boundary にならない。

## 4. integrity 境界

runtime integrity は、user-writable file の検証に関わるため application
persistence に属する。simulation は純粋な state と codec を提供できるが、
manifest 更新、integrity key 読込、runtime storage path 決定を行わない。

現行では `persistence/stores/othello_book.py` が opening book storage hook を
simulation に登録する。hook 登録は application bootstrap の起動前処理で行い、
user book file、compiled cache file、manifest 更新、import/export file IO を
application persistence 側で完結させる。

`sessions/pipelines/render_snapshot.py` は session から presentation renderer へ渡す
DTO を所有する。Qt widget、OpenGL/wgpu backend、HUD payload はこの file に置かない。
