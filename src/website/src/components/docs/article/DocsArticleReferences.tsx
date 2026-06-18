/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Link } from 'react-router-dom';

import { type DocsReference } from '../../../data/docs/types';

type DocsArticleReferencesProps = {
  references?: DocsReference[];
};

export default function DocsArticleReferences({ references }: DocsArticleReferencesProps): React.JSX.Element | null {
  if (references === undefined || references.length === 0) {
    return null;
  }

  return (
    <section className="scroll-mt-24 border-t border-border pt-8" id="see-also">
      <h2 className="mb-4 text-2xl font-semibold tracking-tight">See also</h2>
      <ul className="list-disc space-y-2 pl-5">
        {references.map((reference) => (
          <li className="text-muted-foreground" key={reference.href}>
            <Link className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline" to={reference.href}>
              {reference.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
