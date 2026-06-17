/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { useParams } from 'react-router-dom';

import DocsLayout from '../components/DocsLayout';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { getDocsCollection, getDocsCollectionHref, getDocsPage, getDocsPageHref } from '../data/docs';
import NotFoundPage from './NotFoundPage';

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
