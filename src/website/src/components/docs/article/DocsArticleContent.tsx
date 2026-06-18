/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type DocsPageContent } from '../../../data/docs/types';
import DocsArticleReferences from './DocsArticleReferences';

type InlineTextPart = string | React.JSX.Element;

type DocsArticleContentProps = {
  page: DocsPageContent;
};

function renderInlineText(text: string): InlineTextPart[] {
  return text
    .split(/(`[^`]+`)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
        return (
          <code className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[0.92em] text-foreground" key={`${part}-${index}`}>
            {part.slice(1, -1)}
          </code>
        );
      }

      return part;
    });
}

export default function DocsArticleContent({ page }: DocsArticleContentProps): React.JSX.Element {
  return (
    <div className="space-y-12">
      {page.sections.map((section, index) => (
        <section className={`scroll-mt-24 page-reveal page-reveal-delay-${Math.min(index + 1, 4)}`} id={section.id} key={section.id}>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">{section.title}</h2>

          <div className="space-y-4 leading-relaxed text-muted-foreground">
            {section.body.map((paragraph, paragraphIndex) => (
              <p key={`${section.id}-paragraph-${paragraphIndex}`}>{renderInlineText(paragraph)}</p>
            ))}

            {section.items ? (
              <ul className="ml-2 mt-4 list-inside list-disc space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={`${section.id}-item-${itemIndex}`}>{renderInlineText(item)}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ))}

      <DocsArticleReferences references={page.references} />
    </div>
  );
}
