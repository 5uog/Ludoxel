/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export function decodeHashTarget(hash: string): string {
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}

export function scrollToHashTarget(hash: string): void {
  const target = document.getElementById(decodeHashTarget(hash));

  if (target !== null) {
    target.scrollIntoView({ block: 'start' });
  }
}
