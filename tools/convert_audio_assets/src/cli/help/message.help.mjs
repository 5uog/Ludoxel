/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const AUDIO_ASSET_HELP_MESSAGES = Object.freeze({
  ja: Object.freeze({
    title: 'audio asset conversion',
    labels: Object.freeze({
      purpose: '目的',
      synopsis: '起動形式',
      options: 'オプション',
      defaultBehavior: '既定動作',
    }),
    purpose: 'assets/audio/ 配下の .ogg から対応する .wav を生成または検査する。',
    synopsis: Object.freeze(['npm run assets:audio:convert -- help', 'npm run assets:audio:convert -- --dry-run', 'npm run assets:audio:convert -- --overwrite', 'npm run assets:audio:check', 'npm run assets:audio:check -- --require-ffmpeg', 'npm run assets:audio:check -- --require-wav']),
    options: Object.freeze([
      Object.freeze({ flag: 'help, --help, -h', description: 'このヘルプを表示して終了する。' }),
      Object.freeze({ flag: '--dry-run', description: 'ffmpeg を実行せず、変換予定だけを表示する。' }),
      Object.freeze({ flag: '--overwrite', description: '既存の .wav を上書きする。' }),
      Object.freeze({ flag: '--require-ffmpeg', description: 'ffmpeg が存在しない場合に失敗させる。' }),
      Object.freeze({ flag: '--require-wav', description: '派生 .wav が不足している場合に失敗させる。' }),
      Object.freeze({ flag: '--lang ja|en', description: 'ヘルプ表示言語を指定する。' }),
    ]),
    defaultBehavior: Object.freeze(['check は .ogg と派生 .wav の状態を報告する。ambient は .ogg を直接参照するため、', '派生 .wav の不足は既定では警告として扱う。']),
  }),
  en: Object.freeze({
    title: 'audio asset conversion',
    labels: Object.freeze({
      purpose: 'Purpose',
      synopsis: 'Synopsis',
      options: 'Options',
      defaultBehavior: 'Default behavior',
    }),
    purpose: 'Generate or check matching .wav derivatives from .ogg files under assets/audio/.',
    synopsis: Object.freeze(['npm run assets:audio:convert -- help', 'npm run assets:audio:convert -- --dry-run', 'npm run assets:audio:convert -- --overwrite', 'npm run assets:audio:check', 'npm run assets:audio:check -- --require-ffmpeg', 'npm run assets:audio:check -- --require-wav']),
    options: Object.freeze([
      Object.freeze({ flag: 'help, --help, -h', description: 'Print this help and exit.' }),
      Object.freeze({ flag: '--dry-run', description: 'List planned conversions without running ffmpeg.' }),
      Object.freeze({ flag: '--overwrite', description: 'Overwrite existing .wav files.' }),
      Object.freeze({ flag: '--require-ffmpeg', description: 'Fail if ffmpeg is not available.' }),
      Object.freeze({ flag: '--require-wav', description: 'Fail if derived .wav files are missing.' }),
      Object.freeze({ flag: '--lang ja|en', description: 'Select help language.' }),
    ]),
    defaultBehavior: Object.freeze(['check reports the .ogg and derived .wav state. Ambient audio references .ogg directly,', 'so missing derived .wav files are warnings by default.']),
  }),
});

export function audioAssetHelpMessagesFor(language) {
  return AUDIO_ASSET_HELP_MESSAGES[language] || AUDIO_ASSET_HELP_MESSAGES.ja;
}
