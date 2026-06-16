# Ludoxel AI Learning ガイド

この文書は、Ludoxel の AI Learning 機能の使い方を説明する。AI Learning は、AI プレイヤーの行動を実演データから学習し、評価し、live のゲームプレイへ反映するための軽量な仕組みである。巨大な neural network や外部の機械学習 framework は用いず、Ludoxel 内の simulation 規則だけで完結する。

## Learning tab の場所

Learning 設定は、AI Settings ダイアログ内の `Learning` タブにある。ゲーム中に AI プレイヤーを選択して AI Settings を開くと、左側のサイドバーに `Identity`、`Display`、`Skin`、`Health`、`Behavior`、`Block Placement` と並んで `Learning` タブが表示される。

`Learning` タブの設定は特定の AI 一体ではなく、AI Learning 基盤全体に共通する設定である。設定はその場で保存され、AI Settings ダイアログを閉じた時点で live のセッションへ反映される。

## Learning Mode の意味

`Learning Mode` は次の 5 つから選ぶ。

- **Off**: 記録も学習 policy の使用も行わない。AI は組み込みの決定論的挙動で動く。
- **Observe Only**: AI の挙動を一切変えずに、プレイヤーの操作と AI の意思決定を実演データとして記録する。
- **Use Learned Policy**: 評価を通過した選択中の policy を、AI の意思決定の補正として live で使用する。policy は決定論的挙動を置き換えるのではなく、その効用スコアを補正する。
- **Train From Player Data**: 記録済みの実演データから policy を学習する。学習はバックグラウンドで実行され、完了後に自動で評価され、`Use Learned Policy` へ切り替わる。
- **Train In Sandbox**: headless の sandbox 内で reinforcement-style の学習を実行し、決定論的 baseline 以上のスコアを出した policy を生成する。完了後に `Use Learned Policy` へ切り替わる。

`Off`、`Observe Only`、`Use Learned Policy` は通常プレイ中に有効な mode である。`Train From Player Data` と `Train In Sandbox` は mode を選択した時点で 1 回の学習処理を起動する操作であり、学習中は UI が二重起動を抑止する。

## 実際の使用手順

1. AI を 1 体スポーンし、AI Settings を開いて `Learning` タブを選ぶ。
2. `Learning Mode` を `Observe Only` にする。
3. `Data Capture` で記録したい種別(プレイヤーの移動・戦闘・配置・破壊、AI の意思決定・失敗など)を有効にする。
4. AI Settings を閉じ、しばらく通常どおりプレイする。プレイヤーの操作と AI の意思決定が実演データとして user data root へ蓄積される。`Learning` タブの `Dataset size` で蓄積量を確認できる。
5. 再び `Learning` タブを開き、`Learning Mode` を `Train From Player Data` にする。学習がバックグラウンドで走り、完了すると policy が生成・評価され、`Use Learned Policy` へ切り替わる。
6. 生成された policy が評価を通過していれば、その policy が live の AI 意思決定へ反映される。挙動の傾向(間合いの取り方、退避と攻撃の選好など)が記録した実演に近づく。
7. `Train In Sandbox` を選ぶと、実演データに依らず sandbox 内の課題に対して policy を改善できる。

評価だけを行いたい場合は、`Policy Selection` で対象 policy を選び、`Evaluation` の `Run evaluation` を押す。評価結果(合否とスコア)が表示・保存される。

## 保存先

すべての user 生成データは user data root の `state/learning/` 配下に保存され、リポジトリ・`src`・`assets`・`resources`・`third-party` には書き込まれない。

```text
state/ai_learning.json                     学習設定の状態
state/learning/demonstrations/*.jsonl      記録した実演データ(JSON Lines)
state/learning/policies/*.json             学習 policy artifact
state/learning/evaluations/*.json          評価結果
state/learning/training_runs/*.json        学習実行の履歴
```

user data root は OS により異なり、Windows では `%LOCALAPPDATA%\Ludoxel`、macOS では `~/Library/Application Support/Ludoxel`、その他では XDG 規則に従う。環境変数 `LUDOXEL_DATA_ROOT` を設定すると、その場所が優先される。

旧構成として `state/learning/<dataset>.jsonl` に保存された既存データは、読み込み互換として参照され、破壊されない。

## 壊れた policy、未評価 policy、unsafe action の扱い

- **壊れた policy / schema 不一致 / 互換性不一致**: 読み込みに失敗するか、互換版が一致しない policy は使用されず、AI は組み込みの決定論的挙動へ fallback する。起動が止まることはない。
- **未評価 policy**: 評価を通過していない policy は live で使用されない。`Train From Player Data` で生成した直後の policy も、評価を通過するまでは使われない。生成直後に自動評価が走り、合格した場合にのみ使用可能になる。
- **unsafe action**: policy が選んだ行動は、必ず action mask を通る。奈落へ歩く、自分の足場を破壊する、配置できない場所へ置く、射程外で攻撃する、cooldown を無視するといった危険な行動は、policy がどれだけ選好しても最終的に実行されない。退避・横移動の補正後も縁の安全判定を再適用するため、policy 起因で奈落へ踏み出すことはない。
- 半ブロック・階段・フェンス・フェンスゲート・壁などの形状は、観測と安全判定で full block 前提に単純化せず、実際の block 形状規則に基づいて扱う。

## FPS 低下を避けるための注意

- 記録の書き込みは毎 frame ではなく一定間隔(既定で約 2 秒)でまとめて行うため、通常プレイの frame loop を止めない。
- 学習(`Train From Player Data` / `Train In Sandbox`)と評価はバックグラウンドのワーカーで実行され、UI thread と frame loop を塞がない。実行中は実行中表示が出て、他の操作は一時的に抑止される。
- `Off` の間は観測の構築も記録も行われないため、AI Learning による負荷は発生しない。
- 蓄積した実演データが大きくなった場合は、`Data Management` の `Clear player demonstration data` で削除できる。

## 期待できる挙動変化と、期待してはいけないこと

本機能は、決定論的 AI を置き換える学習ではなく、決定論的 AI の効用スコアに状況依存の補正を加える軽量な選好補正層である。この前提の上で、何ができて何ができないかを正直に述べる。

できること(policy が選好し、action mask が許可すれば、実ゲームの実行経路へ到達する)。

- 接近時に前進だけでなく斜め前進(W+A / W+D)や sprint を選ぶ。
- 戦闘で後退攻撃(backpedal)や横移動攻撃(strafe)を選ぶ。
- 低体力時に、単純突撃ではなく後退・横移動・距離取りを選ぶ。
- 前方の gap に対して bridge block を配置する。
- 接近者に対して defensive block を配置する。
- 脱出のために前方の block を破壊する(自分の足場は破壊しない)。
- tower up(跳躍して足元に block を置き高さを得る)。
- 隣接するフェンスゲートを開閉する。
- route が閉塞した場合に route 再計画を要求する。

これらの戦術行動は、policy 決定が PlayerStepInput、placement、breaking、route 更新といった実際の実行経路へ変換されることで反映される。

期待してはいけないこと。

- 決定論的 AI の完全な置き換え。既存の navigation・combat・placement・parkour・recovery・route 処理はそのまま使われ、policy はその上で選好を補正するだけである。
- 安全規則の超越。危険な行動を学習させても、action mask と縁の安全判定により最終実行されない。
- 人間超えの戦術や、長時間学習による劇的な能力獲得。本機能は feature 条件付きの軽量な選好学習であり、巨大 neural network や外部 ML framework は用いない。
- learning policy が無くても、決定論的 AI 自体は低体力時に後退・横移動を選ぶよう改善されているが、これも限定的な改善である。

## トラブルシューティング

- **`Train From Player Data` が失敗する**: 実演データが空、又は feature 条件付きの選好が得られない場合に失敗する。`Observe Only` で十分な量と多様性のプレイを記録してから再実行する。`Dataset size` で蓄積量を確認する。
- **`Use Learned Policy` にしても挙動が変わらない**: 選択中の policy が未評価、又は評価不合格の可能性がある。`Run evaluation` で評価し、合格を確認する。`Policy source` が `Built-in Deterministic AI` の場合は決定論的挙動のままである。`Bundled` 又は `User` の policy を選ぶ。
- **記録が増えない**: `Learning Mode` が `Observe Only` であること、`Data Capture` で対象種別が有効であることを確認する。`Off` では記録されない。
- **壊れた JSONL 行がある**: 学習時に壊れた行は skip され、件数が学習結果の報告に残る。健全な行だけが学習に使われる。
- **挙動を元に戻したい**: `Data Management` の `Reset learned policy` で組み込みの決定論的挙動へ戻す。`Restore bundled policy` で同梱 policy を選択し直す。
- **何が選ばれているか確認したい(開発者向け)**: 環境変数 `LUDOXEL_AI_DEBUG=1` を設定して起動すると、AI の意思決定ごとに、actor id、mode、選択 policy と使用可否、観測 feature、許可・禁止 action、deterministic 上位行動、policy 補正後上位行動、選択行動、行動源、最終制御、世界変更実行有無が一時 debug log として標準出力に出る。既定では無効であり、通常プレイでは出力されない。
