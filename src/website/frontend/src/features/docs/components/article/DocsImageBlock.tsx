/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type DocsImageMediaBlock } from '../../../../data/docs/types';
import DocsMediaFrame from './DocsMediaFrame';

type DocsImageBlockProps = {
  block: DocsImageMediaBlock;
  blockIndex: number;
  sectionId: string;
};

export default function DocsImageBlock({ block }: DocsImageBlockProps): React.JSX.Element {
  return (
    <DocsMediaFrame caption={block.caption}>
      <img className="block max-h-136 w-full object-contain" src={block.src} alt={block.alt} loading="lazy" />
    </DocsMediaFrame>
  );
}
