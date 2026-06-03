/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export function detectLinuxLibc() {
  const report = process.report?.getReport?.();
  if (report?.header?.glibcVersionRuntime) return 'gnu';
  return 'musl';
}

export function detectRuffTargetTriple() {
  const { platform, arch } = process;

  if (platform === 'darwin') {
    if (arch === 'arm64') return 'aarch64-apple-darwin';
    if (arch === 'x64') return 'x86_64-apple-darwin';
  }

  if (platform === 'win32') {
    if (arch === 'arm64') return 'aarch64-pc-windows-msvc';
    if (arch === 'x64') return 'x86_64-pc-windows-msvc';
    if (arch === 'ia32') return 'i686-pc-windows-msvc';
  }

  if (platform === 'linux') {
    const libc = detectLinuxLibc();

    if (arch === 'arm64') return `aarch64-unknown-linux-${libc}`;
    if (arch === 'x64') return `x86_64-unknown-linux-${libc}`;
    if (arch === 'ia32') return `i686-unknown-linux-${libc}`;
    if (arch === 'arm') return libc === 'gnu' ? 'armv7-unknown-linux-gnueabihf' : 'arm-unknown-linux-musleabihf';
  }

  throw new Error(`Unsupported platform/architecture combination: ${platform}/${arch}`);
}

export function getRuffArchiveExtension(targetTriple) {
  return targetTriple.includes('windows') ? 'zip' : 'tar.gz';
}

export function getRuffBinaryName() {
  return process.platform === 'win32' ? 'ruff.exe' : 'ruff';
}
