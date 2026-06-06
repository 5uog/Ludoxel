# simulation import 規律

`ludoxel.simulation` は、domain 層として `foundations` の基礎型を利用し、
simulation 内部の状態と規則を構成する。本層は、application orchestration と
presentation implementation を参照しない。

## 1. 許容される import

```text
ludoxel.foundations.*
ludoxel.simulation.*
```

## 2. 禁止される import

```text
ludoxel.application.*
ludoxel.presentation.*
PyQt6
OpenGL
wgpu
rendercanvas
QtMultimedia
```

## 3. 設定型の所有

movement、collision、placement、combat、AI behavior、Othello engine に必要な
設定型は、domain input として `simulation` に置く。`application.preferences`
は、それらを保存、読込、UI 入力へ接続する上位層である。

simulation 側の rule が `application.preferences` の型を直接 import すると、
domain rule が保存形式と UI 入力形態に拘束される。この構造は認めない。

現行では `SessionSettings` は `simulation.worlds.config.session` の domain
config である。application schema や runtime preferences へ戻してはならない。

## 4. 永続化境界

simulation は、domain value の純粋な codec を持つことができる。たとえば、
Othello board の canonical transform や book lookup の key 生成は domain
処理である。

次の処理は `application.persistence` に属する。

```text
runtime data root
user state file path
cache file path
integrity manifest
HMAC verification
JSON file-store policy
migration policy
```

Othello opening book は `configure_opening_book_storage()` の hook だけを受け取る。
hook の install、runtime data root、user/cache JSON file IO、manifest 更新は
`application.persistence.stores.othello_book` と `application.bootstrap.run` が
担当し、book module は manifest implementation や storage path を import しない。

## 5. 監査

```bash
grep -R "from ludoxel.application" -n src/ludoxel/simulation
grep -R "import ludoxel.application" -n src/ludoxel/simulation
grep -R "from ludoxel.presentation" -n src/ludoxel/simulation
grep -R "import ludoxel.presentation" -n src/ludoxel/simulation
```
