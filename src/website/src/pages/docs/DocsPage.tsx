/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useParams } from 'react-router-dom';

import DocsLayout from '../../components/docs/DocsLayout';
import Footer from '../../components/layout/Footer';
import Header from '../../components/layout/Header';
import { getDocsPageHref } from '../../data/docs/articles';
import { getDocsCollection, getDocsCollectionHref, getDocsPage } from '../../data/docs/collections';
import NotFoundPage from '../not-found/NotFoundPage';

export default function DocsPage(): React.JSX.Element {
  const params = useParams();
  const docsPath = params['*'];
  const page = getDocsPage(docsPath);

  if (page !== undefined) {
    return (
      <div className="flex min-h-screen flex-col overflow-x-clip bg-background">
        <Header activePath={getDocsPageHref(page)} />
        <DocsLayout page={page} />
        <Footer />
      </div>
    );
  }

  const collection = getDocsCollection(docsPath);

  if (collection !== undefined) {
    return (
      <div className="flex min-h-screen flex-col overflow-x-clip bg-background">
        <Header activePath={getDocsCollectionHref(collection.pathSegments)} />
        <DocsLayout collection={collection} />
        <Footer />
      </div>
    );
  }

  return <NotFoundPage />;
}
