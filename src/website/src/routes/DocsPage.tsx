/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Navigate, useParams } from 'react-router-dom';

import DocsLayout from '../components/DocsLayout';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { docsHomeHref } from '../data/navigation';
import { getDocsPage, getDocsPageHref } from '../data/docs';

export default function DocsPage(): React.JSX.Element {
  const { slug } = useParams();
  const page = getDocsPage(slug);

  if (page === undefined) {
    return <Navigate to={docsHomeHref} replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Header activePath={getDocsPageHref(page)} />
      <DocsLayout page={page} />
      <Footer />
    </div>
  );
}
