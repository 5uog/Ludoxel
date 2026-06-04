/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const HELP_COMMANDS = Object.freeze([
  {
    name: 'help',
    npmScript: 'help',
    usage: 'npm run help -- [command] [--lang ja|en]',
    description: {
      ja: 'Ludoxel の repository tool と npm script を一覧または個別表示する。',
      en: 'List Ludoxel repository tools and npm scripts, or show one command.',
    },
    options: ['--help, -h', '--lang ja|en', '--language ja|en', '--locale ja|en'],
    examples: ['npm run help', 'npm run help -- lint:js', 'npm run help -- tools:export -- --lang ja'],
  },
  {
    name: 'package:check',
    npmScript: 'package:check',
    usage: 'npm run package:check -- [options]',
    description: {
      ja: 'package.json、npm scripts、禁止された旧 scripts/ 経路、tool entrypoint の整合性を検査する。',
      en: 'Check package.json, npm scripts, prohibited retired scripts/ paths, and tool entrypoints.',
    },
    options: ['--help, -h', '--lang ja|en'],
    examples: ['npm run package:check', 'npm run package:check -- --help --lang en'],
  },
  {
    name: 'docs:check',
    npmScript: 'docs:check',
    usage: 'npm run docs:check -- [options]',
    description: {
      ja: 'README、NOTICE、GitHub policy などの文書から旧経路や禁止構造を検査する。',
      en: 'Check README, NOTICE, GitHub policy files, and documentation for stale paths and banned structures.',
    },
    options: ['--help, -h', '--lang ja|en'],
    examples: ['npm run docs:check', 'npm run docs:check -- --help --lang en'],
  },
  {
    name: 'license:check',
    npmScript: 'license:check',
    usage: 'npm run license:check -- [options]',
    description: {
      ja: 'LICENSE、NOTICE、third-party、SPDX header、配布用 legal material の整合性を検査する。',
      en: 'Check LICENSE, NOTICE, third-party material, SPDX headers, and distribution legal material.',
    },
    options: ['--help, -h', '--lang ja|en'],
    examples: ['npm run license:check', 'npm run license:check -- --help --lang en'],
  },
  {
    name: 'resources:check',
    npmScript: 'resources:check',
    usage: 'npm run resources:check -- [options]',
    description: {
      ja: 'resources、runtime data、生成物除外、configs/ 廃止方針の整合性を検査する。',
      en: 'Check resources, runtime data policy, generated exclusions, and the retired configs/ layout.',
    },
    options: ['--help, -h', '--lang ja|en'],
    examples: ['npm run resources:check', 'npm run resources:check -- --help --lang en'],
  },
  {
    name: 'shader:check',
    npmScript: 'shader:check',
    usage: 'npm run shader:check -- [options]',
    description: {
      ja: 'platform 別 renderer の shader 契約を静的検査する。',
      en: 'Statically check shader sources for the platform-specific renderer contracts.',
    },
    options: ['--help, -h', '--lang ja|en'],
    examples: ['npm run shader:check', 'npm run shader:check -- --help --lang en'],
  },
  {
    name: 'lint',
    npmScript: 'lint',
    usage: 'npm run lint',
    description: {
      ja: 'JavaScript、CSS、Python の lint を順に実行する集約 command。',
      en: 'Run JavaScript, CSS, and Python lint commands in sequence.',
    },
    options: ['個別 command の --help を参照する。'],
    examples: ['npm run lint', 'npm run lint:js', 'npm run lint:py'],
  },
  {
    name: 'lint:js',
    npmScript: 'lint:js',
    usage: 'npm run lint:js -- [options]',
    description: {
      ja: 'ESLint を実行し、Node 製 tools と JavaScript / MJS / CJS 設定ファイルを検査する。',
      en: 'Run ESLint for Node tools and JavaScript/MJS/CJS configuration files.',
    },
    options: ['--help, -h', '--lang ja|en'],
    examples: ['npm run lint:js', 'npm run lint:js -- --help', 'npm run lint:js:fix'],
  },
  {
    name: 'lint:js:fix',
    npmScript: 'lint:js:fix',
    usage: 'npm run lint:js:fix -- [options]',
    description: {
      ja: 'ESLint の修正可能な指摘を Node tools / JS 設定へ適用する。',
      en: 'Apply ESLint auto-fixes to Node tools and JavaScript configuration files.',
    },
    options: ['--help, -h', '--lang ja|en'],
    examples: ['npm run lint:js:fix', 'npm run lint:js:fix -- --help'],
  },
  {
    name: 'lint:css',
    npmScript: 'lint:css',
    usage: 'npm run lint:css -- [options]',
    description: {
      ja: 'CSS が存在する場合に Stylelint を実行する。CSS が存在しない場合は対象なしとして正常終了する。',
      en: 'Run Stylelint when CSS exists. Succeeds as no CSS target when none exists.',
    },
    options: ['--help, -h', '--lang ja|en'],
    examples: ['npm run lint:css', 'npm run lint:css -- --help', 'npm run lint:css:fix'],
  },
  {
    name: 'lint:css:fix',
    npmScript: 'lint:css:fix',
    usage: 'npm run lint:css:fix -- [options]',
    description: {
      ja: 'CSS が存在する場合に Stylelint の修正可能な指摘を適用する。対象なしなら正常終了する。',
      en: 'Apply Stylelint auto-fixes when CSS exists. Succeeds as no CSS target when none exists.',
    },
    options: ['--help, -h', '--lang ja|en'],
    examples: ['npm run lint:css:fix', 'npm run lint:css:fix -- --help'],
  },
  {
    name: 'lint:py',
    npmScript: 'lint:py',
    usage: 'npm run lint:py -- [options]',
    description: {
      ja: 'Ruff check を実行し、Python ソースを検査する。',
      en: 'Run Ruff check for Python sources.',
    },
    options: ['--help, -h', '--lang ja|en'],
    examples: ['npm run lint:py', 'npm run lint:py -- --help'],
  },
  {
    name: 'format',
    npmScript: 'format',
    usage: 'npm run format',
    description: {
      ja: 'Web/Node/Markdown/YAML と Python を整形する集約 command。',
      en: 'Format web, Node, Markdown, YAML, and Python sources.',
    },
    options: ['個別 command の --help を参照する。'],
    examples: ['npm run format', 'npm run format:web', 'npm run format:py'],
  },
  {
    name: 'format:web',
    npmScript: 'format:web',
    usage: 'npm run format:web -- [options]',
    description: {
      ja: 'Prettier を実行し、Web / Node / JSON / Markdown / YAML 系ファイルを整形する。',
      en: 'Run Prettier for web, Node, JSON, Markdown, and YAML files.',
    },
    options: ['--help, -h', '--lang ja|en'],
    examples: ['npm run format:web', 'npm run format:web:check'],
  },
  {
    name: 'format:web:check',
    npmScript: 'format:web:check',
    usage: 'npm run format:web:check -- [options]',
    description: {
      ja: 'Prettier 対象の整形状態を検査し、書き換えは行わない。',
      en: 'Check Prettier formatting without writing changes.',
    },
    options: ['--help, -h', '--lang ja|en'],
    examples: ['npm run format:web:check', 'npm run format:check'],
  },
  {
    name: 'format:py',
    npmScript: 'format:py',
    usage: 'npm run format:py -- [options]',
    description: {
      ja: 'Ruff format を実行し、Python ソースを整形する。',
      en: 'Run Ruff format for Python sources.',
    },
    options: ['--help, -h', '--lang ja|en'],
    examples: ['npm run format:py', 'npm run format:py:check'],
  },
  {
    name: 'format:py:check',
    npmScript: 'format:py:check',
    usage: 'npm run format:py:check -- [options]',
    description: {
      ja: 'Ruff format の整形状態を検査し、2-space indent 方針を守る。',
      en: 'Check Ruff formatting while preserving the 2-space indentation policy.',
    },
    options: ['--help, -h', '--lang ja|en'],
    examples: ['npm run format:py:check', 'npm run format:check'],
  },
  {
    name: 'format:check',
    npmScript: 'format:check',
    usage: 'npm run format:check',
    description: {
      ja: 'Web/Node/Markdown/YAML と Python の format check を順に実行する。',
      en: 'Run web, Node, Markdown, YAML, and Python format checks in sequence.',
    },
    options: ['個別 command の --help を参照する。'],
    examples: ['npm run format:check', 'npm run check'],
  },
  {
    name: 'tools:export',
    npmScript: 'tools:export',
    usage: 'npm run tools:export -- [target] [options]',
    description: {
      ja: 'Sudoku 型の directory Markdown export を実行する。',
      en: 'Run the Sudoku-style directory Markdown exporter.',
    },
    options: ['--help, -h', '--lang ja|en', '--format tree|code|both', '--output <path>', '--overwrite', '--include-hidden', '--max-bytes <number|unlimited>'],
    examples: ['npm run tools:export:root', 'npm run tools:export:src', 'npm run tools:export -- root -- --format both --overwrite'],
  },
  {
    name: 'tools:export:help',
    npmScript: 'tools:export:help',
    usage: 'npm run tools:export:help',
    description: {
      ja: 'directory Markdown exporter の詳細 help を表示する。',
      en: 'Show detailed help for the directory Markdown exporter.',
    },
    options: ['なし。'],
    examples: ['npm run tools:export:help'],
  },
  {
    name: 'tools:export:root',
    npmScript: 'tools:export:root',
    usage: 'npm run tools:export:root',
    description: {
      ja: 'repository root を生成物・runtime data・参照用 Sudoku/ を除外して Markdown export する。',
      en: 'Export the repository root to Markdown while excluding generated data, runtime data, and reference Sudoku/.',
    },
    options: ['詳細は tools:export の --help を参照する。'],
    examples: ['npm run tools:export:root', 'npm run docs:export'],
  },
  {
    name: 'tools:export:src',
    npmScript: 'tools:export:src',
    usage: 'npm run tools:export:src',
    description: {
      ja: 'Ludoxel source tree を Markdown export する。',
      en: 'Export the Ludoxel source tree to Markdown.',
    },
    options: ['詳細は tools:export の --help を参照する。'],
    examples: ['npm run tools:export:src'],
  },
  {
    name: 'tools:export:archive',
    npmScript: 'tools:export:archive',
    usage: 'npm run tools:export:archive',
    description: {
      ja: 'archive 用の厳格な除外規則で repository を Markdown export する。',
      en: 'Export the repository to Markdown using strict archive-oriented exclusions.',
    },
    options: ['詳細は tools:export の --help を参照する。'],
    examples: ['npm run tools:export:archive'],
  },
  {
    name: 'tools:test',
    npmScript: 'tools:test',
    usage: 'npm run tools:test',
    description: {
      ja: 'export tool の help、root tree export、src code export を検査する。',
      en: 'Test export tool help, root tree export, and source code export paths.',
    },
    options: ['なし。'],
    examples: ['npm run tools:test', 'npm run check'],
  },
  {
    name: 'docs:export',
    npmScript: 'docs:export',
    usage: 'npm run docs:export',
    description: {
      ja: 'README / Codex 共有向けに repository root の Markdown export を生成する互換 alias。',
      en: 'Compatibility alias for repository root Markdown export for README/Codex sharing.',
    },
    options: ['tools:export:root と同じ。'],
    examples: ['npm run docs:export'],
  },
  {
    name: 'check',
    npmScript: 'check',
    usage: 'npm run check',
    description: {
      ja: 'format check、lint、export test、package/docs/license/resources/shader check を実行する。',
      en: 'Run format checks, lint, export tests, and package/docs/license/resources/shader checks.',
    },
    options: ['各下位 command の --help を参照する。'],
    examples: ['npm run check', 'npm run ci'],
  },
  {
    name: 'ci',
    npmScript: 'ci',
    usage: 'npm run ci',
    description: {
      ja: 'GitHub Actions と同じローカル CI entrypoint。現在は npm run check を実行する。',
      en: 'Local CI entrypoint matching GitHub Actions. Currently runs npm run check.',
    },
    options: ['なし。'],
    examples: ['npm run ci'],
  },
  {
    name: 'build:desktop',
    npmScript: 'build:desktop',
    usage: 'npm run build:desktop -- windows|macos [options]',
    description: {
      ja: 'desktop build dispatcher。windows/macos command により Windows/macOS 系処理へ分岐する。',
      en: 'Run the desktop build dispatcher, branching to Windows or macOS paths by command.',
    },
    options: ['help, --help, -h', 'windows, --windows', 'macos, --macos', '--dry-run', '--skip-native-build', '--keep-build-cache'],
    examples: ['npm run build:desktop -- --help', 'npm run build:desktop -- windows --dry-run'],
  },
  {
    name: 'build:desktop:help',
    npmScript: 'build:desktop:help',
    usage: 'npm run build:desktop:help',
    description: {
      ja: 'desktop build dispatcher の help を表示する。',
      en: 'Show desktop build dispatcher help.',
    },
    options: ['なし。'],
    examples: ['npm run build:desktop:help'],
  },
  {
    name: 'build:native',
    npmScript: 'build:native',
    usage: 'npm run build:native -- [options]',
    description: {
      ja: '既存 native extension build tool を実行する。',
      en: 'Run the existing native extension build tool.',
    },
    options: ['--help は既存 build_native_extensions 側で処理する。'],
    examples: ['npm run build:native', 'npm run build:native:check'],
  },
  {
    name: 'build:native:check',
    npmScript: 'build:native:check',
    usage: 'npm run build:native:check',
    description: {
      ja: 'native acceleration 対象 module と生成済み extension binary を検査する。',
      en: 'Check native acceleration modules and generated extension binaries.',
    },
    options: ['--help は build_native_extensions 側で処理する。'],
    examples: ['npm run build:native:check'],
  },
  {
    name: 'build:windows',
    npmScript: 'build:windows',
    usage: 'npm run build:windows -- [options]',
    description: {
      ja: '既存 Windows desktop build tool を実行する。',
      en: 'Run the existing Windows desktop build tool.',
    },
    options: ['--help', '--dry-run', '--skip-native-build', '--keep-build-cache'],
    examples: ['npm run build:windows:help', 'npm run build:windows'],
  },
  {
    name: 'build:windows:help',
    npmScript: 'build:windows:help',
    usage: 'npm run build:windows:help',
    description: {
      ja: 'Windows onefile EXE build の help を表示する。',
      en: 'Show help for the Windows onefile EXE build.',
    },
    options: ['なし。'],
    examples: ['npm run build:windows:help', 'npm run build:windows -- --dry-run'],
  },
  {
    name: 'build:macos',
    npmScript: 'build:macos',
    usage: 'npm run build:macos -- [options]',
    description: {
      ja: 'macOS app bundle 経路。現時点では未完成制約を明示し、status/check で確認する。',
      en: 'macOS app bundle path. Currently documents incomplete constraints through status/check commands.',
    },
    options: ['--help', '--dry-run'],
    examples: ['npm run build:macos:help', 'npm run build:macos:check'],
  },
  {
    name: 'build:macos:help',
    npmScript: 'build:macos:help',
    usage: 'npm run build:macos:help',
    description: {
      ja: 'macOS app bundle 対応状況を表示する。',
      en: 'Show macOS app-bundle status.',
    },
    options: ['既存 build_desktop_app 側の macos status/help を参照する。'],
    examples: ['npm run build:macos:help', 'npm run build:macos:check'],
  },
  {
    name: 'build:macos:check',
    npmScript: 'build:macos:check',
    usage: 'npm run build:macos:check',
    description: {
      ja: 'macOS app bundle 未完成理由が README に記録されていることを検査する。',
      en: 'Check that README records the current macOS app-bundle blockers.',
    },
    options: ['なし。'],
    examples: ['npm run build:macos:check'],
  },
  {
    name: 'clean',
    npmScript: 'clean',
    usage: 'npm run clean -- [options]',
    description: {
      ja: 'build/cache/export などの生成物 cleanup を実行する。',
      en: 'Clean generated build, cache, and export artifacts.',
    },
    options: ['--help', '--dry-run'],
    examples: ['npm run clean:check', 'npm run clean'],
  },
  {
    name: 'clean:check',
    npmScript: 'clean:check',
    usage: 'npm run clean:check',
    description: {
      ja: 'cleanup 対象を表示し、削除は行わない。',
      en: 'List cleanup targets without deleting them.',
    },
    options: ['なし。'],
    examples: ['npm run clean:check'],
  },
  {
    name: 'assets:audio:convert',
    npmScript: 'assets:audio:convert',
    usage: 'npm run assets:audio:convert -- [options]',
    description: {
      ja: 'assets/audio の .ogg から対応する生成 .wav を作る。ffmpeg が必要。',
      en: 'Generate matching .wav derivatives from assets/audio .ogg files. Requires ffmpeg.',
    },
    options: ['--help, -h', '--lang ja|en', '--dry-run', '--overwrite'],
    examples: ['npm run assets:audio:convert -- --dry-run', 'npm run assets:audio:convert'],
  },
  {
    name: 'assets:audio:check',
    npmScript: 'assets:audio:check',
    usage: 'npm run assets:audio:check -- [options]',
    description: {
      ja: 'assets/audio の .ogg と生成 .wav の対応を検査する。既定では .wav 不足を警告扱いにする。',
      en: 'Check assets/audio .ogg files and matching generated .wav files. Missing .wav files are warnings by default.',
    },
    options: ['--help, -h', '--lang ja|en', '--require-ffmpeg', '--require-wav'],
    examples: ['npm run assets:audio:check', 'npm run assets:audio:check -- --require-wav'],
  },
]);

export function findHelpCommand(name) {
  return HELP_COMMANDS.find((command) => command.name === name || command.npmScript === name) || null;
}
