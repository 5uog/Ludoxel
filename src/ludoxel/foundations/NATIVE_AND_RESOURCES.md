# foundations native artifact 規律

`ludoxel.foundations.mathematics` には、optional native acceleration の対象となる
数値 kernel が存在する。設計上の source of truth は Python 実装であり、
生成された binary artifact は source tree の設計単位ではない。

## 1. native source target

native acceleration の対象は、明示的に選択された数値計算 module に限定する。

```text
ludoxel.foundations.mathematics.geometry.ray_aabb
ludoxel.foundations.mathematics.voxels.dda
ludoxel.foundations.mathematics.linear.view_angles
```

各 target は Python 実装を保持する。
生成 binary が存在しない環境でも、source tree から実行できることが前提である。

## 2. native extension artifact の扱い

次の拡張子を持つ file は、native build によって生成される extension artifact　である。

```text
*.so
*.pyd
*.dylib
*.dll
*.cpython-*.so
```

これらは Python source file ではない。したがって、責務分離や import path の
再設計において、手作業で編集する実装単位として扱わない。構造変更時に維持すべき
対象は、対応する `.py` source module、native build の module name、source path、
検証 command、clean 対象、配布時の同梱規則である。

ただし、これらの artifact は runtime 上無意味な file ではないことは理解すべきである。
Python は `.so` や `.pyd` を native extension module として import し得る。
wheel、PyInstaller bundle、macOS app bundle、Windows executable distribution では、
supported build process によって生成された extension artifact を同梱対象にする
必要が生じる場合がある。この runtime / distribution 上の必要性は、当該 artifact
を source file として扱う根拠にはならない。

tracked されている生成物は、repository に native binary を保持する明示的方針が
存在しない限り、version control から除外する。untracked の生成物は、local build
output として報告し、cleanup rule の対象に含める。

構造変更時には、次を確認する。

```text
.py source module path
native build module name
native build source path
native build verification command
generated suffix cleanup target
wheel / desktop bundle packaging rule
```

生成済み binary を手で移動して構造変更を成立させた扱いにしてはならない。

現行の source tree で in-place build により `.cpython-*.so` が存在する場合でも、
それは `src/ludoxel/foundations/mathematics/**` の実装ファイルではない。
移設・責務分離・tree 報告では `.py` source だけを source of truth として扱う。

## 3. tool との関係

native source path や module name を変更した場合は、次の領域を確認する。

```text
tools/build_native_extensions/
tools/clean_build_artifacts/
MANIFEST.in
pyproject.toml
```

build tool は、source module と生成 artifact を区別する必要がある。
cleanup tool は生成 suffix を漏れなく対象にする必要がある。
package metadata は生成 binary を配布 source として含めてはならない。

## 4. 監査

```bash
find src/ludoxel/foundations/mathematics \( \
  -name "*.so" -o \
  -name "*.pyd" -o \
  -name "*.dylib" -o \
  -name "*.dll" \
\)

grep -R "ray_aabb\|voxels.dda\|view_angles" -n \
  tools pyproject.toml MANIFEST.in README.md package.json
```
