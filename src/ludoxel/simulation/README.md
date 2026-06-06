# simulation 層

`ludoxel.simulation` は、Ludoxel の domain 層である。本層は、world、block、
player、AI actor、inventory、movement、collision、placement、interaction、
falling block、Othello に関する状態と規則を所有する。

本層は、状態が何であり、どの規則に従って遷移するかを定義する。保存形式、
window、dialog、viewport、renderer backend、shader、audio device、desktop
package の構成は所有しない。

## 1. 責務

`simulation` は、次の責務を担う。

- world state と play space identifier
- block definition、state codec、catalog、model、registry
- block structure、connectivity、support、collision volume
- player entity、motion、kinematics、combat、damage、targeting
- AI player state、runtime behavior、planning、routing、navigation、placement
- movement、collision、gravity、picking、placement、interaction rule
- hotbar、inventory、special item の domain 定義
- Othello board、rule、state、clock、match、engine、book、resource

現行の分割では、player target picking は `actors/player/targets.py`、damage
application は `actors/player/damage.py`、placement support は
`rules/placement/support.py`、interaction の破壊・設置・toggle は
`rules/interaction/{breaking,placing,toggles}.py` が所有する。
Othello の high-strength engine は `engines/{bitboards,evaluation,ordering,search,transposition}.py`
へ分割し、`insane.py` は cache と root orchestration を扱う。

## 2. 依存規律

`simulation` が import できる Ludoxel 内部 package は次に限定される。

```text
ludoxel.simulation.*
ludoxel.foundations.*
```

`simulation` は次を import してはならない。

```text
ludoxel.application.*
ludoxel.presentation.*
PyQt6
OpenGL
wgpu
rendercanvas
QtMultimedia
```

application preference、persistence store、Qt widget、renderer backend、audio
playback に依存した domain rule は、上位層へ向かう逆依存を生むため認めない。

## 3. 配置判断

domain invariant、state transition、rule evaluation、search algorithm、
codec、registry、catalog は本層に属する。

session construction、runtime preference persistence、file store、manifest、
UI input adapter、HUD payload、renderer snapshot、audio event playback は本層に
属さない。

`SessionSettings` は simulation が movement、collision、render distance、AI
domain config を読むため `worlds/config/session.py` に置く。application はこれを
組み立てる上位層であり、simulation から `application.preferences` を参照しない。

## 4. 監査

```bash
grep -R "ludoxel.application" -n src/ludoxel/simulation
grep -R "ludoxel.presentation" -n src/ludoxel/simulation
grep -R "PyQt6\|OpenGL\|wgpu\|rendercanvas\|QtMultimedia" -n src/ludoxel/simulation
python -m compileall src/ludoxel/simulation
```
