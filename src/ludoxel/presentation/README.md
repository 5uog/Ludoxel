# presentation 層

`ludoxel.presentation` は、Ludoxel の最上位層である。
本層は、desktop UI、input adapter、viewport lifecycle、HUD、overlay、
settings surface、renderer contract、renderer backend、visual composition、
shader resource、audio playback を扱う。

本層は application、simulation、foundations を利用できる。
下位層が本層を利用する構造は、層分離に反する。

## 1. 責務

`presentation` は、次の責務を担う。

- Qt window と dialog
- viewport widget と lifecycle
- platform input adapter
- HUD、overlay、inventory、pause、death、settings、Othello UI
- common interface component
- theme と QSS resource
- renderer contract
- OpenGL backend
- wgpu backend
- shader resource
- renderer-facing snapshot
- visual builder
- audio catalog
- audio playback

macOS gameplay mouse capture は `interface/input/game_input.py` と
`interface/input/macos_cursor.py` が担う。keyboard event tap は
`macos_guard.py` に限定し、mouse capture を keyboard guard へ混ぜない。

audio playback は `audio/playback/manager.py` が orchestration を持ち、source
pool、effect slot、ambient selection、listener helper は
`audio/playback/{sources,effects,ambient,listener}.py` に分ける。

## 2. 依存規律

`presentation` が import できる Ludoxel 内部 package は次のとおりである。

```text
ludoxel.presentation.*
ludoxel.application.*
ludoxel.simulation.*
ludoxel.foundations.*
```

下位層は次を import してはならない。

```text
ludoxel.presentation.*
```

## 3. presentation 内部の境界

本層は最上位層であるが、内部に無制限な依存を許すわけではない。

interface code は renderer-neutral contract と factory を利用する。
OpenGL や wgpu の backend runtime 内部へ直接依存しない。

renderer backend は contracts、snapshots、resources、backend-local helper を利用する。
viewport widget、dialog、HUD widget、settings surface を import してはならない。

visual builder は domain state を描画用構造へ変換できる。
ただし、domain rule の本体を所有しない。

renderer snapshot DTO の application/session contract は
`application.sessions.pipelines.render_snapshot` に置く。presentation 側の
`rendering/snapshots/dto.py` は backend build helper の callable type に限定する。

## 4. 監査

```bash
grep -R "from ludoxel.presentation" -n \
  src/ludoxel/application src/ludoxel/simulation src/ludoxel/foundations

grep -R "import ludoxel.presentation" -n \
  src/ludoxel/application src/ludoxel/simulation src/ludoxel/foundations

python -m compileall src/ludoxel/presentation
```
