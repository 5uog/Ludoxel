/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { type ChangelogEntry } from '../../../../data/changelog';
import ChangelogInlineText from './ChangelogInlineText';

type ChangelogEntryCardProps = {
  entry: ChangelogEntry;
  revealDelay: number;
};

export default function ChangelogEntryCard({ entry, revealDelay }: ChangelogEntryCardProps): React.JSX.Element {
  return (
    <article className={`page-reveal page-reveal-delay-${revealDelay} flex flex-col gap-6 md:flex-row md:gap-12`}>
      <div className="shrink-0 md:sticky md:top-24 md:w-48 md:self-start">
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-muted-foreground">{entry.date}</span>

          <div className="flex flex-row flex-wrap gap-2 md:flex-col">
            {entry.tags.map((tag) => (
              <span className="changelog-badge" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 border-b border-border pb-12 last:border-b-0">
        <div className="space-y-6">
          {entry.sections.map((section) => (
            <section className="space-y-3" key={section.title}>
              <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>

              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li className="flex min-w-0 items-start gap-2 text-sm leading-relaxed text-muted-foreground" key={item}>
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current text-primary" />
                    <span className="min-w-0 wrap:anywhere">
                      <ChangelogInlineText text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
