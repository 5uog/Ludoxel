/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { WEB_SOURCE_TOOLS } from './tool.config.mjs';

export const WEB_SOURCE_QUALITY_TASKS = Object.freeze({
  LINT: 'lint',
  LINT_JS: 'lint:js',
  LINT_JS_FIX: 'lint:js:fix',
  LINT_CSS: 'lint:css',
  LINT_CSS_FIX: 'lint:css:fix',
  FORMAT: 'format',
  FORMAT_WEB: 'format:web',
  FORMAT_CHECK: 'format:check',
  FORMAT_WEB_CHECK: 'format:web:check',
});

const TASKS = Object.freeze([
  {
    name: WEB_SOURCE_QUALITY_TASKS.LINT,
    npmScript: 'lint',
    entryFile: 'lint.run.mjs',
    kind: 'sequence',
    sequence: [WEB_SOURCE_QUALITY_TASKS.LINT_JS, WEB_SOURCE_QUALITY_TASKS.LINT_CSS],
    tools: [WEB_SOURCE_TOOLS.ESLINT, WEB_SOURCE_TOOLS.STYLELINT],
    text: {
      ja: {
        label: 'Web / Node source lint',
        description: 'ESLint による JavaScript / MJS / CJS 検査と、CSS がある場合の Stylelint 検査を順に実行する。',
        targetScope: 'lint:js と lint:css を順に実行する。',
      },
      en: {
        label: 'Web / Node source lint',
        description: 'Run ESLint for JavaScript/MJS/CJS, then Stylelint when CSS targets exist.',
        targetScope: 'Runs lint:js and lint:css in order.',
      },
    },
  },
  {
    name: WEB_SOURCE_QUALITY_TASKS.LINT_JS,
    npmScript: 'lint:js',
    entryFile: 'lint-js.run.mjs',
    kind: 'eslint',
    fix: false,
    text: {
      ja: {
        label: 'JavaScript lint',
        description: 'ルートの eslint.config.cjs を使って JavaScript / MJS / CJS を検査する。',
        targetScope: 'eslint.config.cjs の ignores と files に従う。',
      },
      en: {
        label: 'JavaScript lint',
        description: 'Run ESLint with root eslint.config.cjs.',
        targetScope: 'Uses files and ignores from eslint.config.cjs.',
      },
    },
  },
  {
    name: WEB_SOURCE_QUALITY_TASKS.LINT_JS_FIX,
    npmScript: 'lint:js:fix',
    entryFile: 'lint-js-fix.run.mjs',
    kind: 'eslint',
    fix: true,
    text: {
      ja: {
        label: 'JavaScript lint fix',
        description: 'ESLint --fix を実行する。',
        targetScope: 'eslint.config.cjs の対象。',
      },
      en: {
        label: 'JavaScript lint fix',
        description: 'Run ESLint --fix.',
        targetScope: 'Targets selected by eslint.config.cjs.',
      },
    },
  },
  {
    name: WEB_SOURCE_QUALITY_TASKS.LINT_CSS,
    npmScript: 'lint:css',
    entryFile: 'lint-css.run.mjs',
    kind: 'stylelint',
    fix: false,
    text: {
      ja: {
        label: 'CSS lint',
        description: 'CSS が存在する場合に Stylelint を実行する。CSS が存在しない場合は対象なしとして正常終了する。',
        targetScope: '存在する CSS ファイル。',
      },
      en: {
        label: 'CSS lint',
        description: 'Run Stylelint when CSS files exist. Succeeds when there are no CSS files.',
        targetScope: 'Existing CSS files.',
      },
    },
  },
  {
    name: WEB_SOURCE_QUALITY_TASKS.LINT_CSS_FIX,
    npmScript: 'lint:css:fix',
    entryFile: 'lint-css-fix.run.mjs',
    kind: 'stylelint',
    fix: true,
    text: {
      ja: {
        label: 'CSS lint fix',
        description: 'CSS が存在する場合に Stylelint --fix を実行する。',
        targetScope: '存在する CSS ファイル。',
      },
      en: {
        label: 'CSS lint fix',
        description: 'Run Stylelint --fix when CSS files exist.',
        targetScope: 'Existing CSS files.',
      },
    },
  },
  {
    name: WEB_SOURCE_QUALITY_TASKS.FORMAT,
    npmScript: 'format',
    entryFile: 'format.run.mjs',
    kind: 'sequence',
    sequence: [WEB_SOURCE_QUALITY_TASKS.FORMAT_WEB],
    tools: [WEB_SOURCE_TOOLS.PRETTIER],
    text: {
      ja: {
        label: 'format',
        description: 'Prettier 管理対象を整形する。Python は format:py が担当する。',
        targetScope: 'format:web を実行する。',
      },
      en: {
        label: 'format',
        description: 'Format Prettier-managed files. Python is handled by format:py.',
        targetScope: 'Runs format:web.',
      },
    },
  },
  {
    name: WEB_SOURCE_QUALITY_TASKS.FORMAT_WEB,
    npmScript: 'format:web',
    entryFile: 'format-web.run.mjs',
    kind: 'prettier',
    check: false,
    text: {
      ja: {
        label: 'format web',
        description: 'Prettier --write を実行する。',
        targetScope: 'Prettier target.config.mjs の対象。',
      },
      en: {
        label: 'format web',
        description: 'Run Prettier --write.',
        targetScope: 'Targets defined in target.config.mjs.',
      },
    },
  },
  {
    name: WEB_SOURCE_QUALITY_TASKS.FORMAT_CHECK,
    npmScript: 'format:check',
    entryFile: 'format-check.run.mjs',
    kind: 'sequence',
    sequence: [WEB_SOURCE_QUALITY_TASKS.FORMAT_WEB_CHECK],
    tools: [WEB_SOURCE_TOOLS.PRETTIER],
    text: {
      ja: {
        label: 'format check',
        description: 'Prettier 管理対象の整形状態を検査する。Python は format:py:check が担当する。',
        targetScope: 'format:web:check を実行する。',
      },
      en: {
        label: 'format check',
        description: 'Check Prettier-managed files. Python is handled by format:py:check.',
        targetScope: 'Runs format:web:check.',
      },
    },
  },
  {
    name: WEB_SOURCE_QUALITY_TASKS.FORMAT_WEB_CHECK,
    npmScript: 'format:web:check',
    entryFile: 'format-web-check.run.mjs',
    kind: 'prettier',
    check: true,
    text: {
      ja: {
        label: 'format web check',
        description: 'Prettier --check を実行する。',
        targetScope: 'Prettier target.config.mjs の対象。',
      },
      en: {
        label: 'format web check',
        description: 'Run Prettier --check.',
        targetScope: 'Targets defined in target.config.mjs.',
      },
    },
  },
]);

const TASK_MAP = new Map(TASKS.map((task) => [task.name, Object.freeze(task)]));

export function getWebSourceQualityTask(taskName) {
  const task = TASK_MAP.get(String(taskName || ''));
  if (!task) {
    throw new Error(`Unknown Web source quality task: ${taskName}`);
  }
  return task;
}
