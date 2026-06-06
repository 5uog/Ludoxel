# foundations public API 規律

`ludoxel.foundations` の public API は、上位層が安定して依存できる基礎契約
だけを公開する。package facade は、内部実装を便利に束ねる場所ではない。

## 1. 公開条件

本層の `__init__.py` から symbol を re-export する場合は、次の条件を満たす。

1. symbol の意味が foundations 層に属すること。
2. import 時に UI、renderer、audio、persistence、native build の副作用を発生させないこと。
3. 内部 file 配置の変更後も、外部層が依存できる契約として維持すること。
4. 単一 call site の省略目的ではなく、package 境界上の公開価値を持つこと。
5. 上位層の symbol を間接的に露出させないこと。

## 2. 公開に適する symbol

次のような symbol は、公開候補になり得る。

- version metadata
- root resolution function
- scalar utility
- vector type
- matrix type
- geometry type
- voxel traversal function
- 軽量 diagnostics entry

公開候補であっても、package 直下に大量 re-export する必要はない。
数学系の symbol は、`mathematics.linear`、`mathematics.geometry` など、
意味の近い subpackage facade で扱う。

現行では、package 直下の public facade は `ludoxel.foundations.__version__`
に限定する。root resolver と native kernel は direct module import を要求する。

## 3. 公開に適さない symbol

次の symbol は public facade に出さない。

- private helper
- cache helper
- platform probe の内部関数
- native fallback 選択の内部関数
- generated binary artifact
- 上位層の便宜のためだけの alias
- import 時に上位層や重い backend を巻き込む symbol

## 4. 検証

```bash
python - <<'PY'
from ludoxel.foundations.locations.roots import (
  default_project_root,
  default_resource_root,
  default_runtime_data_root,
)
from ludoxel.foundations.mathematics.linear.vec3 import Vec3
from ludoxel.foundations.mathematics.geometry.aabb import AABB
print("foundations public API ok")
PY
```
