# renderer backend 境界

`presentation.rendering` は、renderer-neutral contract と backend-specific
execution を分離する。この境界により、UI code が OpenGL や wgpu の内部型に
拘束されず、backend code が Qt widget の実装に拘束されない。

## 1. contracts

`presentation.rendering.contracts` は、interface と backend の間で共有される
中立的な型と entry contract を保持する。

contracts は次を露出させない。

```text
OpenGL handle
wgpu handle
Qt widget
platform window object
backend-local cache
```

## 2. snapshot DTO

renderer-facing snapshot DTO は `application.sessions.pipelines.render_snapshot`
が所有する。これは session orchestration と renderer input の間の UI 非依存 contract
であり、Qt widget と backend runtime を含まない。

`presentation.rendering.snapshots.dto` は、backend mesh build helper が使う
callable type alias に限定する。movement、collision、placement、AI behavior、
Othello legality を実装しない。

## 3. visuals

`presentation.rendering.visuals` は、描画に必要な構造を導出する。

- pose
- camera data
- selection outline
- player render state
- skin UV map
- held item geometry
- Othello scene state
- world visual state

visual code は、domain state を表示用に解釈する。domain state の遷移規則を
変更しない。

## 4. backend package

`presentation.rendering.backends.opengl` は、OpenGL 固有の runtime state、
program、buffer、pass、texture、shader path、frame execution を所有する。

`presentation.rendering.backends.wgpu` は、wgpu 固有の surface、resource、
pipeline、mesh upload、texture、shader source、uniform、frame execution を
所有する。

## 5. 方向規律

```text
interface -> contracts / factory / public renderer API
backend   -> contracts / snapshots / resources / backend-local helpers
backend   -X-> interface widgets
interface -X-> backend internals
```

## 6. 監査

```bash
grep -R "PyQt6" -n src/ludoxel/presentation/rendering/backends
grep -R "presentation.interface" -n src/ludoxel/presentation/rendering/backends
grep -R "presentation.rendering.backends" -n src/ludoxel/presentation/interface
npm run shader:check
```
