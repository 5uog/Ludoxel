# presentation import 規律

`ludoxel.presentation` は上位層として下位層を参照できる。
ただし、presentation 内部では、interface、rendering contract、
backend、visual、audio の境界を維持する。

## 1. 許容される下位層 import

```text
ludoxel.application.*
ludoxel.simulation.*
ludoxel.foundations.*
```

## 2. interface の制限

`presentation.interface.*` は、renderer-neutral な契約を参照する。

```text
presentation.rendering.contracts
application.sessions.pipelines.render_snapshot
presentation.rendering.snapshots.dto
presentation.rendering.visuals
public renderer factory modules
```

interface code は backend runtime 内部へ直接依存しない。たとえば次の依存は
認めない。

```text
presentation.interface.* -> presentation.rendering.backends.opengl.runtime.renderer
presentation.interface.* -> presentation.rendering.backends.wgpu.runtime.backend
```

## 3. backend の制限

`presentation.rendering.backends.*` は、contracts、snapshots、resources、
backend-local helper を利用する。viewport widget、settings dialog、HUD widget、
overlay class を import しない。

認めない依存の例は次のとおりである。

```text
presentation.rendering.backends.* -> presentation.interface.viewport.widgets
presentation.rendering.backends.* -> presentation.interface.overlays
presentation.rendering.backends.* -> presentation.interface.settings
```

## 4. 下位層から presentation への依存

`application`、`simulation`、`foundations` から `presentation` への import は、
application bootstrap の composition-root 例外を除き、層違反である。

macOS `.app` の input 修正は presentation 内に閉じる。`macos_cursor.py` は
CoreGraphics cursor warp だけを扱い、simulation、application、renderer backend へ
platform mouse capture の実装を広げない。

## 5. 監査

```bash
grep -R "presentation.rendering.backends" -n src/ludoxel/presentation/interface
grep -R "presentation.interface" -n src/ludoxel/presentation/rendering/backends
grep -R "ludoxel.presentation" -n \
  src/ludoxel/application src/ludoxel/simulation src/ludoxel/foundations
grep -R "CoreGraphics\\|CGWarpMouseCursorPosition" -n src/ludoxel/presentation/interface/input
```
