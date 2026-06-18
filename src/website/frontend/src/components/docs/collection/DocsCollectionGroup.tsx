/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Link } from 'react-router-dom';

import { getDocsPageHref } from '../../../data/docs/articles';
import { docsSearchSections, type DocsPageContent, type DocsSearchSection } from '../../../data/docs/types';
import { firstPageHrefForCategory, firstPageHrefForGroup, firstPageHrefForSubcategory, groupPagesByGroup, groupPagesBySubcategory } from '../logic/docsCollectionGrouping';
import { DocsTree, DocsTreeItem } from './DocsCollectionTree';

type ArticleGroupHeadingLevel = 'h3' | 'h4';

type ArticleTitleListProps = {
  pages: DocsPageContent[];
};

type ArticleGroupListProps = {
  pagesByGroup: Map<string, DocsPageContent[]>;
  headingLevel: ArticleGroupHeadingLevel;
};

type DocsRootCollectionProps = {
  pagesByCategory: Map<DocsSearchSection, DocsPageContent[]>;
};

type DocsCategoryCollectionProps = {
  pagesBySubcategory: Map<string, DocsPageContent[]>;
};

type DocsSubcategoryCollectionProps = {
  pagesByGroup: Map<string, DocsPageContent[]>;
};

export function ArticleTitleList({ pages }: ArticleTitleListProps): React.JSX.Element {
  return (
    <DocsTree>
      {pages.map((page, index) => (
        <DocsTreeItem contentClassName="leading-relaxed" isLast={index === pages.length - 1} key={getDocsPageHref(page)} lineOffset="article">
          <Link className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline" to={getDocsPageHref(page)}>
            {page.title}
          </Link>
        </DocsTreeItem>
      ))}
    </DocsTree>
  );
}

function ArticleGroupList({ pagesByGroup, headingLevel }: ArticleGroupListProps): React.JSX.Element {
  const Heading = headingLevel;
  const groupEntries = [...pagesByGroup.entries()];

  return (
    <DocsTree className="[--docs-tree-item-py:0.625rem]">
      {groupEntries.map(([group, groupPages], index) => (
        <DocsTreeItem contentClassName="space-y-2" isLast={index === groupEntries.length - 1} key={group} lineOffset="text-sm">
          <Heading className="text-sm font-medium">
            <Link className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline" to={firstPageHrefForGroup(groupPages)}>
              {group}
            </Link>
          </Heading>

          <ArticleTitleList pages={groupPages} />
        </DocsTreeItem>
      ))}
    </DocsTree>
  );
}

export function DocsRootCollection({ pagesByCategory }: DocsRootCollectionProps): React.JSX.Element {
  return (
    <div className="grid items-start gap-x-10 gap-y-12 xl:grid-cols-2 2xl:grid-cols-3">
      {docsSearchSections
        .map((section) => {
          const sectionPages = pagesByCategory.get(section);

          if (sectionPages === undefined || sectionPages.length === 0) {
            return null;
          }

          const subcategoryEntries = [...groupPagesBySubcategory(sectionPages).entries()];

          return (
            <section className="page-reveal page-reveal-delay-2" key={section}>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight">
                <Link className="text-foreground underline-offset-4 transition-colors hover:text-muted-foreground hover:underline" to={firstPageHrefForCategory(sectionPages)}>
                  {section}
                </Link>
              </h2>

              <DocsTree className="[--docs-tree-item-py:0.75rem]">
                {subcategoryEntries.map(([subcategory, subcategoryPages], index) => {
                  const pagesByGroup = groupPagesByGroup(subcategoryPages);

                  return (
                    <DocsTreeItem contentClassName="space-y-3" isLast={index === subcategoryEntries.length - 1} key={subcategory} lineOffset="text-base">
                      <h3 className="text-base font-medium">
                        <Link className="text-foreground underline-offset-4 transition-colors hover:text-muted-foreground hover:underline" to={firstPageHrefForSubcategory(subcategoryPages)}>
                          {subcategory}
                        </Link>
                      </h3>

                      <ArticleGroupList pagesByGroup={pagesByGroup} headingLevel="h4" />
                    </DocsTreeItem>
                  );
                })}
              </DocsTree>
            </section>
          );
        })
        .filter(Boolean)}
    </div>
  );
}

export function DocsCategoryCollection({ pagesBySubcategory }: DocsCategoryCollectionProps): React.JSX.Element {
  const subcategoryEntries = [...pagesBySubcategory.entries()];

  return (
    <div className="space-y-10">
      {subcategoryEntries.map(([subcategory, subcategoryPages], index) => {
        const pagesByGroup = groupPagesByGroup(subcategoryPages);

        return (
          <section className={`page-reveal page-reveal-delay-${Math.min(index + 2, 4)}`} key={subcategory}>
            <h2 className="mb-4 text-2xl font-semibold tracking-tight">
              <Link className="text-foreground underline-offset-4 transition-colors hover:text-muted-foreground hover:underline" to={firstPageHrefForSubcategory(subcategoryPages)}>
                {subcategory}
              </Link>
            </h2>

            <ArticleGroupList pagesByGroup={pagesByGroup} headingLevel="h3" />
          </section>
        );
      })}
    </div>
  );
}

export function DocsSubcategoryCollection({ pagesByGroup }: DocsSubcategoryCollectionProps): React.JSX.Element {
  const groupEntries = [...pagesByGroup.entries()];

  return (
    <div className="space-y-10">
      {groupEntries.map(([group, groupPages], index) => (
        <section className={`page-reveal page-reveal-delay-${Math.min(index + 2, 4)}`} key={group}>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            <Link className="text-foreground underline-offset-4 transition-colors hover:text-muted-foreground hover:underline" to={firstPageHrefForGroup(groupPages)}>
              {group}
            </Link>
          </h2>

          <ArticleTitleList pages={groupPages} />
        </section>
      ))}
    </div>
  );
}
