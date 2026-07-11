/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export const RUST_SOURCE_QUALITY_TASKS = Object.freeze({
  FORMAT: 'format',
  FORMAT_CHECK: 'format-check',
});

const TASKS = Object.freeze([
  {
    name: RUST_SOURCE_QUALITY_TASKS.FORMAT,
    npmScript: 'format:rust',
    entryFile: 'format.run.mjs',
    check: false,
    text: {
      ja: {
        description: 'native/ 配下の全 Rust crate と Cargo workspace に cargo fmt を実行し、Rust source を整形する。',
      },
      en: {
        description: 'Run cargo fmt for every Rust crate and Cargo workspace under native/.',
      },
    },
  },
  {
    name: RUST_SOURCE_QUALITY_TASKS.FORMAT_CHECK,
    npmScript: 'format:rust:check',
    entryFile: 'format-check.run.mjs',
    check: true,
    text: {
      ja: {
        description: 'native/ 配下の全 Rust source を cargo fmt -- --check で検査し、file は変更しない。',
      },
      en: {
        description: 'Check every Rust source under native/ with cargo fmt -- --check without writing files.',
      },
    },
  },
]);

const TASK_MAP = new Map(TASKS.map((task) => [task.name, Object.freeze(task)]));

export function getRustSourceQualityTask(taskName) {
  const task = TASK_MAP.get(String(taskName || ''));
  if (!task) {
    throw new Error(`Unknown Rust source quality task: ${taskName}`);
  }
  return task;
}
