/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { getDocsArticlePaginationLinks } from '../../../data/docs/articles';
import {
  type DocsArticleContentBlock,
  type DocsCodeBlock as DocsCodeBlockContent,
  type DocsCodeContentBlock,
  type DocsInlineText,
  type DocsListBlock,
  type DocsMathBlock,
  type DocsNoteBlock as DocsNoteBlockContent,
  type DocsPageContent,
  type DocsSection,
  type DocsStepsBlock,
  getDocsHrefFromSegments,
} from '../../../data/docs/types';
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

function renderBodyParagraph(section: DocsSection, paragraph: DocsInlineText, paragraphIndex: number, keyPrefix = `${section.id}-body`): React.JSX.Element[] {
  if (typeof paragraph !== 'string') {
    return [<p key={`${keyPrefix}-${paragraphIndex}-text-0`}>{renderInlineText(paragraph)}</p>];
  }

  return splitDisplayMath(paragraph).map((block, blockIndex) => {
    if (block.kind === 'math') {
      return <DocsMath displayMode expression={block.expression} key={`${keyPrefix}-${paragraphIndex}-math-${blockIndex}`} />;
    }

    return <p key={`${keyPrefix}-${paragraphIndex}-text-${blockIndex}`}>{renderInlineText(block.text)}</p>;
  });
}

function renderMathBlock(block: DocsMathBlock, sectionId: string, blockIndex: number, keyPrefix = `${sectionId}-math`): React.JSX.Element {
  return (
    <figure className="my-6" key={`${keyPrefix}-${blockIndex}`}>
      <DocsMath displayMode={block.displayMode ?? true} expression={block.expression} />
      {block.caption ? <figcaption className="mt-2 text-sm text-muted-foreground">{renderInlineText(block.caption)}</figcaption> : null}
    </figure>
  );
}

function renderNoteBlock(block: DocsNoteBlockContent, sectionId: string, blockIndex: number, keyPrefix = `${sectionId}-note`): React.JSX.Element {
  return <DocsNoteBlock block={block} blockIndex={blockIndex} key={`${keyPrefix}-${blockIndex}`} sectionId={sectionId} />;
}

function toDocsCodeBlock(block: DocsCodeContentBlock): DocsCodeBlockContent {
  const { kind: _kind, ...codeBlock } = block;

  return codeBlock as DocsCodeBlockContent;
}

function renderListBlock(block: DocsListBlock, sectionId: string, blockIndex: number, keyPrefix = `${sectionId}-list`): React.JSX.Element {
  const ListElement = block.ordered === true ? 'ol' : 'ul';
  const listStyleClassName = block.ordered === true ? 'list-decimal' : 'list-disc';

  return (
    <ListElement className={`ml-2 mt-4 list-inside ${listStyleClassName} space-y-2`} key={`${keyPrefix}-${blockIndex}`}>
      {block.items.map((item, itemIndex) => (
        <li key={`${keyPrefix}-${blockIndex}-item-${itemIndex}`}>{renderInlineText(item)}</li>
      ))}
    </ListElement>
  );
}

function renderStepsBlock(block: DocsStepsBlock, section: DocsSection, blockIndex: number, keyPrefix = `${section.id}-steps`): React.JSX.Element {
  return (
    <div className="ml-3.5 my-6" key={`${keyPrefix}-${blockIndex}`} role="list">
      {block.steps.map((step, stepIndex) => {
        const hasLine = stepIndex < block.steps.length - 1;
        const stepContentKey = `${keyPrefix}-${blockIndex}-step-${stepIndex}`;

        return (
          <div className="group/step relative flex items-start pb-6 last:pb-0" id={step.id} key={stepContentKey} role="listitem">
            {hasLine ? <div className="absolute top-11 h-[calc(100%-2.75rem)] w-px bg-border" aria-hidden="true" /> : null}

            <div className="absolute -ml-3.25 py-2" aria-hidden="true">
              <div className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground ring-1 ring-border">{stepIndex + 1}</div>
            </div>

            <div className="w-full min-w-0 overflow-hidden pl-8 pr-px">
              <p className="mt-2 font-semibold text-foreground">{renderInlineText(step.title)}</p>
              <div className="space-y-4">{step.content.flatMap((contentBlock, contentIndex) => renderContentBlock(contentBlock, section, contentIndex, stepContentKey))}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function renderContentBlock(block: DocsArticleContentBlock, section: DocsSection, blockIndex: number, keyPrefix = `${section.id}-content`): React.JSX.Element[] {
  if (block.kind === 'paragraph') {
    return renderBodyParagraph(section, block.text, blockIndex, keyPrefix);
  }

  if (block.kind === 'list') {
    return [renderListBlock(block, section.id, blockIndex, keyPrefix)];
  }

  if (block.kind === 'code') {
    return [<DocsCodeBlock block={toDocsCodeBlock(block)} blockIndex={blockIndex} key={`${keyPrefix}-code-${blockIndex}`} sectionId={section.id} />];
  }

  if (block.kind === 'media') {
    return [<DocsMediaBlock block={block.media} blockIndex={blockIndex} key={`${keyPrefix}-media-${blockIndex}`} sectionId={section.id} />];
  }

  if (block.kind === 'math') {
    return [renderMathBlock(block.math, section.id, blockIndex, keyPrefix)];
  }

  if (block.kind === 'note') {
    return [renderNoteBlock(block.note, section.id, blockIndex, keyPrefix)];
  }

  return [renderStepsBlock(block, section, blockIndex, keyPrefix)];
}

function renderLegacySectionEntry(section: DocsSection, key: string): React.JSX.Element[] {
  if (key === 'body' && section.body) {
    return section.body.flatMap((paragraph, paragraphIndex) => renderBodyParagraph(section, paragraph, paragraphIndex));
  }

  if (key === 'items' && section.items) {
    return [renderListBlock({ kind: 'list', items: section.items }, section.id, 0, `${section.id}-items`)];
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
  if (section.content !== undefined) {
    return section.content.flatMap((block, blockIndex) => renderContentBlock(block, section, blockIndex));
  }

  return Object.keys(section).flatMap((key) => renderLegacySectionEntry(section, key));
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
