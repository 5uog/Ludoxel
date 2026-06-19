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
    'Ludoxel code excerpts, documentation text, examples, and other Ludoxel original materials displayed in these documentation pages are protected under the copyright of Kento Konishi (小西拳斗) and governed by the root ',
    {
      kind: 'link',
      label: 'LICENSE',
      href: 'https://github.com/5uog/Ludoxel/blob/main/LICENSE',
    },
    '. Unauthorized use does not receive any permission from this notice. Any dispute arising out of or relating to the LICENSE, Ludoxel original materials, the Documentation Site, or unauthorized use is governed by the laws of Japan and is subject to the exclusive jurisdiction of the Tokyo District Court as the court of first instance, to the maximum extent permitted by applicable law. For detailed legal documentation concerning these materials and notices, refer to the ',
    {
      kind: 'link',
      label: 'Legal documentation',
      href: '/docs/legal',
    },
    ' page.',
  ],
};

export default function DocsCopyrightBanner({ animationKey }: DocsCopyrightBannerProps): React.JSX.Element {
  return (
    <div aria-label="Copyright notice" className="page-reveal page-reveal-delay-2 mb-8" key={`${animationKey}-copyright-notice`}>
      <DocsNoteBlock block={COPYRIGHT_NOTICE} blockIndex={0} sectionId="docs-copyright-notice" />
    </div>
  );
}
