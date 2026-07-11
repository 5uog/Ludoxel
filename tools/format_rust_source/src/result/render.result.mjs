/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export function renderRustCommandStart(command) {
  return `[format_rust_source] ${command.displayCommand}`;
}

export function renderRustCommandSuccess(command, task) {
  return `[format_rust_source] ${command.target.displayPath} ${task.check ? 'format check passed' : 'formatting completed'}.`;
}

export function renderRustCommandFailure(command, result) {
  if (result.error) {
    return `[format_rust_source] cargo could not be started for ${command.target.displayPath}: ${result.error.message || String(result.error)}. Install or expose the existing Rust toolchain; this tool does not download or change toolchains.`;
  }

  if (result.signal) {
    return `[format_rust_source] cargo fmt terminated by signal ${result.signal} for ${command.target.displayPath}.`;
  }

  return `[format_rust_source] cargo fmt failed for ${command.target.displayPath}. exitCode=${result.exitCode}`;
}

export function renderNoRustTargets() {
  return '[format_rust_source] no Cargo package or workspace manifests were found under native/.';
}
