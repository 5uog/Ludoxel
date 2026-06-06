# presentation public API 規律

`ludoxel.presentation` の public API は、application bootstrap、interface package、
検証 command が依存する狭い契約に限定する。backend 内部実装と widget 内部実装は公開しない。

## 1. 公開条件

presentation package の `__init__.py` から symbol を re-export する場合は、
次の条件を満たす必要がある。

- presentation 層の安定契約であること
- import 時に不要な backend 初期化を行わないこと
- private widget helper や backend cache を露出しないこと
- 下位層からの逆依存を誘発しないこと
- 実装に存在する symbol であること

## 2. 公開に適する symbol

次のような symbol は公開候補である。

- application shell entry point
- viewport input contract
- frame synchronization contract
- upload tracking contract
- common interface base class
- audio manager facade
- renderer contract type
- renderer factory entry
- lightweight theme-loading entry

## 3. 公開に適さない symbol

次の symbol は public facade に出さない。

- OpenGL pass class
- wgpu pipeline internal
- shader compiler helper
- texture cache internal
- Qt widget helper
- platform guard internal
- audio source internal
- overlay private state
- renderer backend resource cache

## 4. lazy import

public facade は、必要に応じて lazy `__getattr__` を使用できる。対象は、
Qt Multimedia、renderer backend、platform API、重い resource loader の早期
import を避ける場合に限る。

lazy import は境界維持のための手段である。存在しない symbol の偽装、旧 path
互換 wrapper、import error の隠蔽には使用しない。

現行では `presentation.audio.AudioManager`、`presentation.interface.viewport` の
`ViewportInput` / `ViewportFrameSync` / `WorldUploadTracker`、および
`presentation.interface.common` の代表 widget helper を lazy facade とする。
backend runtime、platform guard、audio source/effect helper は direct module import
専用の内部実装として扱う。

## 5. 検証

```bash
python - <<'PY'
from ludoxel.presentation.audio import AudioManager
from ludoxel.presentation.interface.viewport import (
  ViewportInput,
  ViewportFrameSync,
  WorldUploadTracker,
)
from ludoxel.presentation.interface.common import (
  ItemPhotoProvider,
  SidebarDialogBase,
)
print("presentation public API ok")
PY
```

検証対象は、実装上の public contract と一致させる。存在しない symbol を
`__init__.py` に追加して検証だけを通す処理は認めない。
