# application import 規律

`ludoxel.application` は、下位層を実行単位へ組み立てる。presentation の実装型を
参照して application schema、preference、session behavior を定義してはならない。

## 1. 許容される import

```text
ludoxel.application.*
ludoxel.simulation.*
ludoxel.foundations.*
```

## 2. composition root 例外

次の file は、presentation shell の entry point を import できる。

```text
src/ludoxel/application/bootstrap/run.py
```

この例外は、起動時の最終接続点としてだけ認められる。persistence、preferences、
sessions、pipelines、runners、stores に拡張してはならない。

## 3. 禁止される import

composition root 以外の application module は、次を import してはならない。

```text
ludoxel.presentation.*
PyQt6 widget classes
renderer backend implementations
audio playback implementations
```

## 4. 定数と識別子の所有

persisted settings が crosshair mode、player skin kind、camera mode、
cloud-flow direction などの識別子を必要とする場合、その識別子は UI 非依存の
契約として適切な層に置く。

presentation は、それらの値を編集し、表示し、描画へ反映する。application schema は
presentation の描画実装や widget 定義に依存して persisted meaning を得てはならない。

現行の UI 非依存 contract は次である。

```text
application.preferences.crosshair
application.preferences.player_skin
application.preferences.cloud_flow
application.sessions.pipelines.render_snapshot
```

`application.preferences.session` は使わない。simulation が必要とする runtime
domain config は `simulation.worlds.config.session` を import する。

## 5. 監査

```bash
grep -R "from ludoxel.presentation" -n src/ludoxel/application
grep -R "import ludoxel.presentation" -n src/ludoxel/application
```
