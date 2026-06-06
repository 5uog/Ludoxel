# application 層

`ludoxel.application` は、Ludoxel の orchestration 層である。
本層は、foundations の基礎機構と simulation の domain を、
実行可能な application runtime へ組み立てる。

本層は、起動、runtime preference、key binding、persistence schema、
store、integrity manifest、session construction、session management、
fixed-step 実行、state application を扱う。Qt widget、renderer backend、
audio playback、domain rule 本体は扱わない。

## 1. 責務

`application` は、次の責務を担う。

- bootstrap entry
- runtime preference
- key binding
- player identity preference
- persisted application schema
- JSON-backed store
- runtime integrity manifest
- play space context
- session factory
- session manager
- runtime-state pipeline
- fixed-step runner
- save/load scheduling

UI 非依存の persisted preference contract は application が所有する。
現行では crosshair pixel schema、player skin kind、cloud-flow direction を
`preferences/{crosshair,player_skin,cloud_flow}.py` に置き、presentation widget や
renderer visual 実装から application schema への逆参照を排除する。

persisted schema は `persistence/schema/app.py` に集約しない。
settings、inventory、player、world、AI player、play-space、Othello space、
file envelope はそれぞれ独立した schema module が所有し、`app.py` は
runtime で受け渡す `AppState` aggregate だけを持つ。

renderer-facing snapshot DTO は `sessions/pipelines/render_snapshot.py` に置く。
これは Qt widget や backend 実装を含まない application/session contract である。

## 2. 依存規律

`application` が import できる Ludoxel 内部 package は次のとおりである。

```text
ludoxel.application.*
ludoxel.simulation.*
ludoxel.foundations.*
```

presentation への import は、composition root に限定される。

```text
src/ludoxel/application/bootstrap/run.py
```

この file は、project root、resource root、data root を確定した後、
desktop shell の entry point へ制御を渡す役割を持つ。
他の application module が presentation を import する構造は認めない。

## 3. 配置判断

module が runtime state の組立、保存形式、設定の正規化、session の進行、
domain object の接続を扱う場合は、本層に属する。

module が domain rule を定義する場合は `simulation` に属する。module が Qt、
viewport、HUD、overlay、renderer、audio を扱う場合は `presentation` に属する。

Othello user book storage hook の install は application bootstrap が担当する。
simulation book module は manifest、runtime data root、user/cache file path を import しない。

## 4. 監査

```bash
grep -R "from ludoxel.presentation" -n src/ludoxel/application
grep -R "import ludoxel.presentation" -n src/ludoxel/application
python -m compileall src/ludoxel/application
```

grep 結果では、bootstrap の composition-root 例外と、通常 module の違反を必ず分けて扱う。
