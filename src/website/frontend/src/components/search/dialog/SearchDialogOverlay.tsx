/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { getSearchDialogBackdropClassName } from '../logic/searchClassNames';

type SearchDialogOverlayProps = {
  isClosing: boolean;
  onClose: () => void;
};

export default function SearchDialogOverlay({ isClosing, onClose }: SearchDialogOverlayProps): React.JSX.Element {
  return <button className={getSearchDialogBackdropClassName(isClosing)} type="button" aria-label="Close search" onClick={onClose} />;
}
