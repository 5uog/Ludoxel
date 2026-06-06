# foundations import 規律

`ludoxel.foundations` は、Ludoxel 内部における import の終端層である。
上位層は本層を利用できるが、本層は上位層を利用しない。
この方向性は、単なる整理上の約束ではなく、概念上の所有関係を表す。

## 1. 許容される import

本層の module は、次を import できる。

```text
ludoxel.foundations.*
```

Python 標準ライブラリ、および基礎実装に必要な軽量な第三者 package は、
当該 module の責務に照らして必要な範囲で使用できる。

## 2. 禁止される import

本層の module は、次を import してはならない。

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

上位層の import は、基礎型の意味を上位概念に従属させる。たとえば、
数学型が player state を知る構造、root 解決が UI resource の表示意味を知る
構造、diagnostics が renderer backend の実装型を知る構造は認めない。

## 3. 判定基準

import 先の symbol が次の意味を持つ場合、その import は本層に適合しない。

- player、AI、block、inventory、Othello などの domain 意味
- runtime preference、persisted schema、session orchestration の意味
- Qt widget、event、signal、dialog、window の意味
- renderer backend、shader program、GPU resource の意味
- audio playback、sound source、device state の意味

`foundations` は、上位層が使用するための土台を提供する。上位層の都合を
取り込んだ時点で、本層の抽象度は破壊される。

## 4. direct module import

次の package は public facade に helper を集約せず、実 module から import する。

```text
foundations.mathematics.linear
foundations.mathematics.geometry
foundations.mathematics.voxels
foundations.mathematics.chunks
foundations.mathematics.frustums
```

これにより、native fallback module と純 Python helper の境界を `__init__.py` で隠さない。

## 5. 監査

```bash
grep -R "from ludoxel.simulation" -n src/ludoxel/foundations
grep -R "import ludoxel.simulation" -n src/ludoxel/foundations
grep -R "from ludoxel.application" -n src/ludoxel/foundations
grep -R "import ludoxel.application" -n src/ludoxel/foundations
grep -R "from ludoxel.presentation" -n src/ludoxel/foundations
grep -R "import ludoxel.presentation" -n src/ludoxel/foundations
```
