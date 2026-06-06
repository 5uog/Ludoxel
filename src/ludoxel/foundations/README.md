# foundations 層

`ludoxel.foundations` は、Ludoxel の全実装層が依拠する基礎層である。
この層は、アプリケーション固有の実行手順、ゲーム規則、永続化形式、
表示実装、描画バックエンド、音声再生装置から独立した機構だけを保持する。

本層に置かれるコードは、上位層から再利用される前提を持つ。したがって、
その意味内容は、特定の play space、session manager、Qt widget、renderer、
audio device、package resource policy によって変化してはならない。

## 1. 責務

`foundations` は、次の責務を担う。

- package identity と version metadata の提供
- project root、resource root、runtime data root の解決
- frozen application 判定
- 実行環境に関する軽量診断
- scalar、vector、matrix、transform の基礎演算
- ray、AABB、frustum、voxel traversal、chunk coordinate の処理
- native acceleration の対象となる数値 kernel の Python fallback 実装

これらは、Ludoxel の具体的な gameplay や UI 表示に従属しない。
たとえば `Vec3`、`AABB`、ray intersection、voxel DDA は本層に属する。
player movement の規則、block collision の policy、Othello の評価関数、
crosshair の表示形状、skin preview の構成は本層に属さない。

## 2. 依存規律

`foundations` が import できる Ludoxel 内部 package は次に限定される。

```text
ludoxel.foundations.*
```

`foundations` は次を import してはならない。

```text
ludoxel.simulation.*
ludoxel.application.*
ludoxel.presentation.*
PyQt6
OpenGL
wgpu
rendercanvas
QtMultimedia
```

この制限は、循環 import を避けるための便宜的規則にとどまらない。
下位層が上位層を参照した瞬間に、基礎概念が domain、runtime、
presentation の都合に拘束され、層分離の意味が失われる。

## 3. 配置判断

ある module を `foundations` に置くためには、次の条件を満たす必要がある。

- Ludoxel の domain rule を含まないこと
- persisted schema、runtime preference、session state を含まないこと
- Qt、renderer、audio の実装型を含まないこと
- resource の表示上の意味や UI 文言を含まないこと
- 上位層の都合による別名集約になっていないこと

複数層から使われる値であっても、意味内容が domain に属する場合は
`simulation` に置く。実行時設定や保存形式に属する場合は `application`
に置く。表示、描画、音声に属する場合は `presentation` に置く。

## 4. package 境界

`ludoxel.foundations.__init__` は `__version__` だけを lazy に公開する。
root resolver、diagnostics、数学 kernel は direct module import を基本とする。
`foundations/mathematics/__init__.py` は空 boundary であり、linear、geometry、
voxels、chunks、frustums、scalars を横断 re-export しない。

## 5. 監査

本層を変更した場合は、少なくとも次を確認する。

```bash
grep -R "ludoxel.simulation" -n src/ludoxel/foundations
grep -R "ludoxel.application" -n src/ludoxel/foundations
grep -R "ludoxel.presentation" -n src/ludoxel/foundations
grep -R "PyQt6\|OpenGL\|wgpu\|rendercanvas\|QtMultimedia" -n src/ludoxel/foundations
python -m compileall src/ludoxel/foundations
```
