/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { createPortal } from 'react-dom';

import SearchDialog from './dialog/SearchDialog';
import { type SearchCommandProps } from './logic/searchCommand.types';
import { useSearchCommand } from './logic/useSearchCommand';
import SearchTrigger from './trigger/SearchTrigger';

export default function SearchCommand({ variant, placeholder, enableShortcut = false, entries }: SearchCommandProps): React.JSX.Element {
  const search = useSearchCommand(enableShortcut, entries);

  return (
    <>
      <SearchTrigger placeholder={placeholder} variant={variant} onOpen={search.openSearch} />

      {search.isOpen ? createPortal(<SearchDialog {...search} />, document.body) : null}
    </>
  );
}
