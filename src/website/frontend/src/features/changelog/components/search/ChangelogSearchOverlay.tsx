/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */

type ChangelogSearchOverlayProps = {
  isClosing: boolean;
  onClose: () => void;
};

export default function ChangelogSearchOverlay({ isClosing, onClose }: ChangelogSearchOverlayProps): React.JSX.Element {
  const className = isClosing ? 'search-dialog-backdrop search-dialog-backdrop-exit fixed inset-0 bg-black/55' : 'search-dialog-backdrop fixed inset-0 bg-black/55';

  return <button aria-label="Close changelog search and filters" className={className} type="button" onClick={onClose} />;
}
