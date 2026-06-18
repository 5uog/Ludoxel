/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { getDocsArticlePaginationLinks } from '../../../data/docs/articles';
import { type DocsMathBlock, type DocsNoteBlock as DocsNoteBlockContent, type DocsPageContent, type DocsSection, getDocsHrefFromSegments } from '../../../data/docs/types';
import DocsArticleFeedback from './DocsArticleFeedback';
import DocsArticlePagination from './DocsArticlePagination';
import DocsArticleReferences from './DocsArticleReferences';
import DocsCodeBlock from './DocsCodeBlock';
import DocsCopyrightBanner from './DocsCopyrightBanner';
import { renderInlineText } from './DocsInlineText';
import DocsMath from './DocsMath';
import DocsMediaBlock from './DocsMediaBlock';
import DocsNoteBlock from './DocsNoteBlock';
import DocsSectionHeading from './DocsSectionHeading';

type DocsArticleContentProps = {
  page: DocsPageContent;
};

type DisplayMathTextBlock =
  | {
      kind: 'text';
      text: string;
    }
  | {
      kind: 'math';
      expression: string;
    };

function isEscaped(text: string, index: number): boolean {
  let backslashCount = 0;

  for (let cursor = index - 1; cursor >= 0 && text[cursor] === '\\'; cursor -= 1) {
    backslashCount += 1;
  }

  return backslashCount % 2 === 1;
}

function findUnescapedSequence(text: string, sequence: string, fromIndex: number): number {
  let cursor = fromIndex;

  while (cursor < text.length) {
    const nextIndex = text.indexOf(sequence, cursor);

    if (nextIndex === -1) {
      return -1;
    }

    if (!isEscaped(text, nextIndex)) {
      return nextIndex;
    }

    cursor = nextIndex + sequence.length;
  }

  return -1;
}

function splitDisplayMath(text: string): DisplayMathTextBlock[] {
  const blocks: DisplayMathTextBlock[] = [];
  let cursor = 0;
  let textStart = 0;

  while (cursor < text.length) {
    if (text[cursor] === '`') {
      const codeEnd = text.indexOf('`', cursor + 1);

      if (codeEnd !== -1) {
        cursor = codeEnd + 1;
        continue;
      }
    }

    if (text.startsWith('$$', cursor) && !isEscaped(text, cursor)) {
      const mathEnd = findUnescapedSequence(text, '$$', cursor + 2);

      if (mathEnd !== -1) {
        const leadingText = text.slice(textStart, cursor);

        if (leadingText.length > 0) {
          blocks.push({ kind: 'text', text: leadingText });
        }

        blocks.push({
          kind: 'math',
          expression: text.slice(cursor + 2, mathEnd).trim(),
        });

        cursor = mathEnd + 2;
        textStart = cursor;
        continue;
      }
    }

    cursor += 1;
  }

  const trailingText = text.slice(textStart);

  if (trailingText.length > 0) {
    blocks.push({ kind: 'text', text: trailingText });
  }

  return blocks.length > 0 ? blocks : [{ kind: 'text', text }];
}

function renderBodyParagraph(section: DocsSection, paragraph: string, paragraphIndex: number): React.JSX.Element[] {
  return splitDisplayMath(paragraph).map((block, blockIndex) => {
    if (block.kind === 'math') {
      return <DocsMath displayMode expression={block.expression} key={`${section.id}-body-${paragraphIndex}-math-${blockIndex}`} />;
    }

    return <p key={`${section.id}-body-${paragraphIndex}-text-${blockIndex}`}>{renderInlineText(block.text)}</p>;
  });
}

function renderMathBlock(block: DocsMathBlock, sectionId: string, blockIndex: number): React.JSX.Element {
  return (
    <figure className="my-6" key={`${sectionId}-math-${blockIndex}`}>
      <DocsMath displayMode={block.displayMode ?? true} expression={block.expression} />
      {block.caption ? <figcaption className="mt-2 text-sm text-muted-foreground">{renderInlineText(block.caption)}</figcaption> : null}
    </figure>
  );
}

function renderNoteBlock(block: DocsNoteBlockContent, sectionId: string, blockIndex: number): React.JSX.Element {
  return <DocsNoteBlock block={block} blockIndex={blockIndex} key={`${sectionId}-note-${blockIndex}`} sectionId={sectionId} />;
}

function renderSectionEntry(section: DocsSection, key: string): React.JSX.Element[] {
  if (key === 'body') {
    return section.body.flatMap((paragraph, paragraphIndex) => renderBodyParagraph(section, paragraph, paragraphIndex));
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

  if (key === 'mathBlocks' && section.mathBlocks) {
    return section.mathBlocks.map((block, blockIndex) => renderMathBlock(block, section.id, blockIndex));
  }

  if (key === 'noteBlocks' && section.noteBlocks) {
    return section.noteBlocks.map((block, blockIndex) => renderNoteBlock(block, section.id, blockIndex));
  }

  return [];
}

function renderSectionContent(section: DocsSection): React.JSX.Element[] {
  return Object.keys(section).flatMap((key) => renderSectionEntry(section, key));
}

export default function DocsArticleContent({ page }: DocsArticleContentProps): React.JSX.Element {
  const articleAnimationKey = page.pathSegments.join('/');
  const pagePath = getDocsHrefFromSegments(page.pathSegments);
  const paginationLinks = getDocsArticlePaginationLinks(page);

  return (
    <div className="space-y-12">
      <DocsCopyrightBanner animationKey={articleAnimationKey} key={`${articleAnimationKey}-copyright-banner`} />

      {page.sections.map((section, index) => (
        <section className={`scroll-mt-24 page-reveal page-reveal-delay-${Math.min(index + 1, 4)}`} id={section.id} key={section.id}>
          <DocsSectionHeading sectionId={section.id} title={section.title} />

          <div className="space-y-4 leading-relaxed text-muted-foreground">{renderSectionContent(section)}</div>
        </section>
      ))}

      <DocsArticleReferences references={page.references} />

      <section aria-labelledby="docs-article-feedback-title" className="feedback-toolbar flex w-full flex-col gap-y-8 pb-16">
        <DocsArticleFeedback pagePath={pagePath} />
        <DocsArticlePagination links={paginationLinks} />
      </section>
    </div>
  );
}
