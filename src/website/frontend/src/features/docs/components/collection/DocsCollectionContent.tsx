/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useMemo } from 'react';

import { type DocsCollection } from '../../../../data/docs/collections';
import { groupPagesByCategory, groupPagesByGroup, groupPagesBySubcategory } from '../../lib/docsCollectionGrouping';
import { ArticleTitleList, DocsCategoryCollection, DocsRootCollection, DocsSubcategoryCollection } from './DocsCollectionGroup';

type DocsCollectionContentProps = {
  collection: DocsCollection;
};

export default function DocsCollectionContent({ collection }: DocsCollectionContentProps): React.JSX.Element {
  const pagesByCategory = useMemo(() => groupPagesByCategory(collection.pages), [collection.pages]);
  const pagesBySubcategory = useMemo(() => groupPagesBySubcategory(collection.pages), [collection.pages]);
  const pagesByGroup = useMemo(() => groupPagesByGroup(collection.pages), [collection.pages]);

  return (
    <div className="space-y-10">
      {collection.pathSegments.length === 0 ? <DocsRootCollection pagesByCategory={pagesByCategory} /> : null}
      {collection.pathSegments.length === 1 ? <DocsCategoryCollection pagesBySubcategory={pagesBySubcategory} /> : null}
      {collection.pathSegments.length === 2 ? <DocsSubcategoryCollection pagesByGroup={pagesByGroup} /> : null}

      {collection.pathSegments.length === 3 ? (
        <section className="page-reveal page-reveal-delay-2">
          <ArticleTitleList pages={collection.pages} />
        </section>
      ) : null}
    </div>
  );
}
