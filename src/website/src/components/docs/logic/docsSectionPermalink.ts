/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
export function createDocsSectionPermalink(sectionId: string): string {
  const url = new URL(window.location.href);

  url.hash = sectionId;

  return url.toString();
}

function copyTextWithFallback(text: string): void {
  const textArea = document.createElement('textarea');

  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.top = '0';

  document.body.appendChild(textArea);
  textArea.select();
  textArea.setSelectionRange(0, textArea.value.length);

  const copied = document.execCommand('copy');

  document.body.removeChild(textArea);

  if (!copied) {
    throw new Error('Clipboard fallback copy failed.');
  }
}

export async function copyTextToClipboard(text: string): Promise<void> {
  if (window.isSecureContext && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }

  copyTextWithFallback(text);
}
