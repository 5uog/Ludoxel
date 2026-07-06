/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { parseChangelogInlineText } from '../../lib/changelogInlineText';

const CHANGELOG_INLINE_CODE_CLASS_NAME =
  'inline max-w-full whitespace-normal break-words rounded border border-border bg-secondary px-1.5 py-0.5 align-baseline font-mono text-[0.92em] text-foreground [overflow-wrap:anywhere] [word-break:break-word]';

type ChangelogInlineTextProps = {
  text: string;
};

export default function ChangelogInlineText({ text }: ChangelogInlineTextProps): React.JSX.Element {
  return (
    <>
      {parseChangelogInlineText(text).map((part, index) => {
        if (part.kind === 'text') {
          return <span key={`text-${index}`}>{part.text}</span>;
        }

        return (
          <code className={CHANGELOG_INLINE_CODE_CLASS_NAME} key={part.key}>
            {part.code}
          </code>
        );
      })}
    </>
  );
}
