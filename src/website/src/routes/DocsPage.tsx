/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Link, useParams } from 'react-router-dom';

import DocsLayout from '../components/DocsLayout';
import Footer from '../components/Footer';
import Header from '../components/Header';
import SearchCommand from '../components/SearchCommand';
import { docsSearchSections, getDocsCollection, getDocsCollectionHref, getDocsPage, getDocsPageHref, type DocsCollection, type DocsPageContent, type DocsSearchSection } from '../data/docs';
import NotFoundPage from './NotFoundPage';

type GroupedDocsPages = Map<DocsSearchSection, Map<string, Map<string, DocsPageContent[]>>>;

function groupDocsPages(pages: DocsPageContent[]): GroupedDocsPages {
  const groupedPages: GroupedDocsPages = new Map();

  pages.forEach((page) => {
    const categoryPages = groupedPages.get(page.category) ?? new Map<string, Map<string, DocsPageContent[]>>();
    const subcategoryPages = categoryPages.get(page.subcategory) ?? new Map<string, DocsPageContent[]>();
    const groupPages = subcategoryPages.get(page.group) ?? [];

    groupPages.push(page);
    subcategoryPages.set(page.group, groupPages);
    categoryPages.set(page.subcategory, subcategoryPages);
    groupedPages.set(page.category, categoryPages);
  });

  return groupedPages;
}

function firstPageInSubcategory(subcategoryPages: Map<string, DocsPageContent[]>): DocsPageContent | undefined {
  for (const pages of subcategoryPages.values()) {
    return pages[0];
  }

  return undefined;
}

function firstPageInCategory(categoryPages: Map<string, Map<string, DocsPageContent[]>>): DocsPageContent | undefined {
  for (const subcategoryPages of categoryPages.values()) {
    const page = firstPageInSubcategory(subcategoryPages);

    if (page !== undefined) {
      return page;
    }
  }

  return undefined;
}

function DocsIndexPage({ collection }: { collection: DocsCollection }): React.JSX.Element {
  const groupedPages = groupDocsPages(collection.pages);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Header activePath="/docs" />
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="mb-10 page-reveal">
            <p className="text-sm font-medium text-muted-foreground mb-3">Docs</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">{collection.title}</h1>
            <p className="text-muted-foreground max-w-3xl leading-relaxed">{collection.description}</p>
          </div>

          <div className="page-reveal page-reveal-delay-1 mb-12 max-w-2xl">
            <SearchCommand variant="hero" placeholder="Search documentation articles" />
          </div>

          <div className="space-y-10">
            {docsSearchSections
              .filter((section) => groupedPages.has(section))
              .map((section) => {
                const categoryPages = groupedPages.get(section);

                if (categoryPages === undefined) {
                  return null;
                }

                const categoryPath = firstPageInCategory(categoryPages)?.pathSegments.slice(0, 1) ?? [];

                return (
                  <section className="page-reveal page-reveal-delay-2" key={section}>
                    <div className="mb-4">
                      <Link className="text-2xl font-semibold tracking-tight text-foreground transition-colors hover:text-muted-foreground" to={getDocsCollectionHref(categoryPath)}>
                        {section}
                      </Link>
                    </div>

                    <div className="space-y-6">
                      {[...categoryPages.entries()].map(([subcategory, subcategoryPages]) => {
                        const subcategoryPath = firstPageInSubcategory(subcategoryPages)?.pathSegments.slice(0, 2) ?? categoryPath;

                        return (
                          <div className="border-l border-border pl-4" key={subcategory}>
                            <Link className="text-base font-medium text-foreground transition-colors hover:text-muted-foreground" to={getDocsCollectionHref(subcategoryPath)}>
                              {subcategory}
                            </Link>

                            <div className="mt-3 space-y-4">
                              {[...subcategoryPages.entries()].map(([group, groupPages]) => {
                                const groupPath = groupPages[0]?.pathSegments.slice(0, 3) ?? subcategoryPath;

                                return (
                                  <div key={group}>
                                    <Link className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" to={getDocsCollectionHref(groupPath)}>
                                      {group}
                                    </Link>

                                    <ul className="mt-2 grid gap-2 md:grid-cols-2">
                                      {groupPages.map((page) => (
                                        <li key={getDocsPageHref(page)}>
                                          <Link className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4" to={getDocsPageHref(page)}>
                                            {page.title}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function DocsPage(): React.JSX.Element {
  const params = useParams();
  const docsPath = params['*'];
  const page = getDocsPage(docsPath);

  if (page !== undefined) {
    return (
      <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
        <Header activePath={getDocsPageHref(page)} />
        <DocsLayout page={page} />
        <Footer />
      </div>
    );
  }

  const collection = getDocsCollection(docsPath);

  if (collection !== undefined) {
    return <DocsIndexPage collection={collection} />;
  }

  return <NotFoundPage />;
}
