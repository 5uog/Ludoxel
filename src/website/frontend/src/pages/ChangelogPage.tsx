/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import AnimatedText from '../components/animation/AnimatedText';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';
import { changelogEntries } from '../data/changelog';

type ChangelogInlinePart = string | React.JSX.Element;

function isEscaped(text: string, index: number): boolean {
  let backslashCount = 0;

  for (let cursor = index - 1; cursor >= 0 && text[cursor] === '\\'; cursor -= 1) {
    backslashCount += 1;
  }

  return backslashCount % 2 === 1;
}

function findClosingBacktick(text: string, fromIndex: number): number {
  let cursor = fromIndex;

  while (cursor < text.length) {
    const nextIndex = text.indexOf('`', cursor);

    if (nextIndex === -1) {
      return -1;
    }

    if (!isEscaped(text, nextIndex)) {
      return nextIndex;
    }

    cursor = nextIndex + 1;
  }

  return -1;
}

function unescapeBackticks(text: string): string {
  return text.replace(/\\`/g, '`');
}

function pushTextPart(parts: ChangelogInlinePart[], text: string): void {
  if (text.length > 0) {
    parts.push(unescapeBackticks(text));
  }
}

function renderChangelogItemText(text: string): ChangelogInlinePart[] {
  const parts: ChangelogInlinePart[] = [];
  let cursor = 0;
  let plainStart = 0;

  while (cursor < text.length) {
    if (text[cursor] === '`' && !isEscaped(text, cursor)) {
      const codeEnd = findClosingBacktick(text, cursor + 1);

      if (codeEnd !== -1) {
        pushTextPart(parts, text.slice(plainStart, cursor));
        parts.push(
          <code className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[0.92em] text-foreground" key={`code-${cursor}-${codeEnd}`}>
            {unescapeBackticks(text.slice(cursor + 1, codeEnd))}
          </code>,
        );
        cursor = codeEnd + 1;
        plainStart = cursor;
        continue;
      }
    }

    cursor += 1;
  }

  pushTextPart(parts, text.slice(plainStart));
  return parts;
}

export default function ChangelogPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Header activePath="/changelog" />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="mb-16">
            <div className="page-reveal mb-3">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                <AnimatedText text="Changelog" />
              </h1>
            </div>

            <p className="page-reveal page-reveal-delay-2 text-xl text-primary font-medium mb-4">Ludoxel desktop application release notes</p>

            <p className="page-reveal page-reveal-delay-3 text-muted-foreground max-w-2xl">
              Track user-visible changes to the Ludoxel desktop application without treating local build artifacts as release authority.
            </p>
          </div>

          <div className="space-y-12">
            {changelogEntries.map((entry, entryIndex) => (
              <div className={`page-reveal page-reveal-delay-${Math.min(entryIndex + 1, 4)} flex flex-col md:flex-row gap-6 md:gap-12`} key={entry.date}>
                <div className="md:w-48 md:sticky md:top-24 md:self-start shrink-0">
                  <div className="flex flex-col gap-3">
                    <span className="text-sm font-medium text-muted-foreground">{entry.date}</span>

                    <div className="flex flex-row md:flex-col gap-2 flex-wrap">
                      {entry.tags.map((tag) => (
                        <span className="changelog-badge" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 pb-12 border-b border-border last:border-b-0">
                  <div className="space-y-6">
                    {entry.sections.map((section) => (
                      <div className="space-y-3" key={section.title}>
                        <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>

                        <ul className="space-y-2">
                          {section.items.map((item) => (
                            <li className="flex items-start gap-2 text-muted-foreground text-sm leading-relaxed" key={item}>
                              <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                              <span>{renderChangelogItemText(item)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
