/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type DocsPageContent, type DocsSection } from '../../../data/docs/types';
import DocsArticleReferences from './DocsArticleReferences';
import DocsCodeBlock from './DocsCodeBlock';
import { renderInlineText } from './DocsInlineText';
import DocsMediaBlock from './DocsMediaBlock';

type DocsArticleContentProps = {
  page: DocsPageContent;
};

function renderSectionEntry(section: DocsSection, key: string): React.JSX.Element[] {
  if (key === 'body') {
    return section.body.map((paragraph, paragraphIndex) => <p key={`${section.id}-body-${paragraphIndex}`}>{renderInlineText(paragraph)}</p>);
  }

  if (key === 'items' && section.items) {
    return [
      <ul className="ml-2 mt-4 list-inside list-disc space-y-2" key={`${section.id}-items`}>
        {section.items.map((item, itemIndex) => (
          <li key={`${section.id}-item-${itemIndex}`}>{renderInlineText(item)}</li>
        ))}
      </ul>,
    ];
  }

  if (key === 'codeBlocks' && section.codeBlocks) {
    return section.codeBlocks.map((block, blockIndex) => <DocsCodeBlock block={block} blockIndex={blockIndex} key={`${section.id}-code-${blockIndex}`} sectionId={section.id} />);
  }

  if (key === 'mediaBlocks' && section.mediaBlocks) {
    return section.mediaBlocks.map((block, blockIndex) => <DocsMediaBlock block={block} blockIndex={blockIndex} key={`${section.id}-media-${blockIndex}`} sectionId={section.id} />);
  }

  return [];
}

function renderSectionContent(section: DocsSection): React.JSX.Element[] {
  return Object.keys(section).flatMap((key) => renderSectionEntry(section, key));
}

export default function DocsArticleContent({ page }: DocsArticleContentProps): React.JSX.Element {
  return (
    <div className="space-y-12">
      {page.sections.map((section, index) => (
        <section className={`scroll-mt-24 page-reveal page-reveal-delay-${Math.min(index + 1, 4)}`} id={section.id} key={section.id}>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">{section.title}</h2>

          <div className="space-y-4 leading-relaxed text-muted-foreground">{renderSectionContent(section)}</div>
        </section>
      ))}

      <DocsArticleReferences references={page.references} />
    </div>
  );
}
