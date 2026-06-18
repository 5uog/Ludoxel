/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type DocsNoteBlock as DocsNoteBlockContent } from '../../../data/docs/types';
import DocsNoteBlock from './DocsNoteBlock';

type DocsCopyrightBannerProps = {
  animationKey: string;
};

const COPYRIGHT_NOTICE: DocsNoteBlockContent = {
  type: 'warning',
  content: [
    'Ludoxel code excerpts, documentation text, examples, and other Ludoxel original materials displayed in these documentation pages are protected under the copyright of Kento Konishi (小西拳斗) and governed by the root LICENSE. ',
    {
      kind: 'link',
      label: 'Read the root LICENSE.',
      href: 'https://github.com/5uog/Ludoxel/blob/main/LICENSE',
    },
    ' This non-dismissible notice is part of the documentation page and does not grant permission beyond the controlling license text.',
  ],
};

export default function DocsCopyrightBanner({ animationKey }: DocsCopyrightBannerProps): React.JSX.Element {
  return (
    <div aria-label="Copyright notice" className="page-reveal page-reveal-delay-2 mb-8" key={`${animationKey}-copyright-notice`}>
      <DocsNoteBlock block={COPYRIGHT_NOTICE} blockIndex={0} sectionId="docs-copyright-notice" />
    </div>
  );
}
