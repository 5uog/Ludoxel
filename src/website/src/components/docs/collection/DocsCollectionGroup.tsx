/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Link } from 'react-router-dom';

import { getDocsPageHref } from '../../../data/docs/articles';
import { docsSearchSections, type DocsPageContent, type DocsSearchSection } from '../../../data/docs/types';
import { firstPageHrefForCategory, firstPageHrefForGroup, firstPageHrefForSubcategory, groupPagesByGroup, groupPagesBySubcategory } from '../logic/docsCollectionGrouping';

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
    <ul className="space-y-2 border-l border-border pl-4">
      {pages.map((page) => (
        <li className="leading-relaxed" key={getDocsPageHref(page)}>
          <Link className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline" to={getDocsPageHref(page)}>
            {page.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ArticleGroupList({ pagesByGroup, headingLevel }: ArticleGroupListProps): React.JSX.Element {
  const Heading = headingLevel;

  return (
    <div className="space-y-5 border-l border-border pl-4">
      {[...pagesByGroup.entries()].map(([group, groupPages]) => (
        <div key={group}>
          <Heading className="mb-2 text-sm font-medium">
            <Link className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline" to={firstPageHrefForGroup(groupPages)}>
              {group}
            </Link>
          </Heading>

          <ArticleTitleList pages={groupPages} />
        </div>
      ))}
    </div>
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

          const pagesBySubcategory = groupPagesBySubcategory(sectionPages);

          return (
            <section className="page-reveal page-reveal-delay-2" key={section}>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight">
                <Link className="text-foreground underline-offset-4 transition-colors hover:text-muted-foreground hover:underline" to={firstPageHrefForCategory(sectionPages)}>
                  {section}
                </Link>
              </h2>

              <div className="space-y-6">
                {[...pagesBySubcategory.entries()].map(([subcategory, subcategoryPages]) => {
                  const pagesByGroup = groupPagesByGroup(subcategoryPages);

                  return (
                    <div className="border-l border-border pl-4" key={subcategory}>
                      <h3 className="mb-3 text-base font-medium">
                        <Link className="text-foreground underline-offset-4 transition-colors hover:text-muted-foreground hover:underline" to={firstPageHrefForSubcategory(subcategoryPages)}>
                          {subcategory}
                        </Link>
                      </h3>

                      <ArticleGroupList pagesByGroup={pagesByGroup} headingLevel="h4" />
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
        .filter(Boolean)}
    </div>
  );
}

export function DocsCategoryCollection({ pagesBySubcategory }: DocsCategoryCollectionProps): React.JSX.Element {
  return (
    <div className="space-y-10">
      {[...pagesBySubcategory.entries()].map(([subcategory, subcategoryPages], index) => {
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
  return (
    <div className="space-y-10">
      {[...pagesByGroup.entries()].map(([group, groupPages], index) => (
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
