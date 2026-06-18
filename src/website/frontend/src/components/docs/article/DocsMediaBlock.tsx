/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type DocsMediaBlock as DocsMediaBlockContent } from '../../../data/docs/types';
import DocsImageBlock from './DocsImageBlock';
import DocsVideoBlock from './DocsVideoBlock';

type DocsMediaBlockProps = {
  block: DocsMediaBlockContent;
  blockIndex: number;
  sectionId: string;
};

export default function DocsMediaBlock({ block, blockIndex, sectionId }: DocsMediaBlockProps): React.JSX.Element {
  if (block.kind === 'image') {
    return <DocsImageBlock block={block} blockIndex={blockIndex} sectionId={sectionId} />;
  }

  return <DocsVideoBlock block={block} blockIndex={blockIndex} sectionId={sectionId} />;
}
