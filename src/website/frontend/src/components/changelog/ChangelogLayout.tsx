/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { createPortal } from 'react-dom';

import { changelogEntries } from '../../data/changelog';
import AnimatedText from '../animation/AnimatedText';
import ChangelogEntryList from './entry/ChangelogEntryList';
import { useChangelogControls } from './logic/useChangelogControls';
import ChangelogPagination from './pagination/ChangelogPagination';
import ChangelogSearchPanel from './search/ChangelogSearchPanel';
import ChangelogSearchTrigger from './search/ChangelogSearchTrigger';

const CHANGELOG_ENTRIES_PER_PAGE = 6;

export default function ChangelogLayout(): React.JSX.Element {
  const controls = useChangelogControls(changelogEntries, CHANGELOG_ENTRIES_PER_PAGE);

  return (
    <main className="flex-1 pb-16 pt-24">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <header className="mb-12">
          <div className="page-reveal mb-3">
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              <AnimatedText text="Changelog" />
            </h1>
          </div>

          <p className="page-reveal page-reveal-delay-2 mb-4 text-xl font-medium text-primary">Ludoxel desktop application release notes</p>

          <p className="page-reveal page-reveal-delay-3 max-w-2xl text-muted-foreground">
            Track user-visible changes to the Ludoxel desktop application without treating local build artifacts as release authority.
          </p>
        </header>

        <div className="page-reveal page-reveal-delay-2 mb-10 w-full max-w-150">
          <ChangelogSearchTrigger onOpen={controls.openPanel} />
        </div>

        <ChangelogEntryList entries={controls.visibleEntries} />

        <ChangelogPagination
          currentPage={controls.currentPage}
          goToPage={controls.goToPage}
          handlePageJumpChange={controls.handlePageJumpChange}
          handlePageJumpKeyDown={controls.handlePageJumpKeyDown}
          jumpToPage={controls.jumpToPage}
          pageJumpValue={controls.pageJumpValue}
          totalPages={controls.totalPages}
        />
      </div>

      {controls.isPanelOpen ? createPortal(<ChangelogSearchPanel controls={controls} />, document.body) : null}
    </main>
  );
}
