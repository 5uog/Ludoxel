/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
function lines(values) {
  return values.join('\n');
}

function option(flag, description) {
  return `  ${flag.padEnd(24)} ${description}`;
}

export function renderAudioAssetHelp() {
  return lines([
    'audio asset conversion',
    '',
    '目的',
    '  assets/audio/ 配下の .ogg から対応する .wav を生成または検査する。',
    '',
    '起動形式',
    '  npm run assets:audio:convert -- help',
    '  npm run assets:audio:convert -- --dry-run',
    '  npm run assets:audio:convert -- --overwrite',
    '  npm run assets:audio:check',
    '  npm run assets:audio:check -- --require-ffmpeg',
    '  npm run assets:audio:check -- --require-wav',
    '',
    'オプション',
    option('help, --help, -h', 'このヘルプを表示して終了する。'),
    option('--dry-run', 'ffmpeg を実行せず、変換予定だけを表示する。'),
    option('--overwrite', '既存の .wav を上書きする。'),
    option('--require-ffmpeg', 'ffmpeg が存在しない場合に失敗させる。'),
    option('--require-wav', '派生 .wav が不足している場合に失敗させる。'),
    option('--lang ja|en', 'ヘルプ表示言語を指定する。'),
    '',
    '既定動作',
    '  check は .ogg と派生 .wav の状態を報告する。ambient は .ogg を直接参照するため、',
    '  派生 .wav の不足は既定では警告として扱う。',
    '',
  ]);
}

export function renderAudioAssetErrors(errors) {
  return [...errors.map((error) => `Error: ${error}`), '', renderAudioAssetHelp()].join('\n');
}
