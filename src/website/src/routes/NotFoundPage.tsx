/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { Link } from 'react-router-dom';

import Footer from '../components/Footer';
import Header from '../components/Header';

export default function NotFoundPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">Page not found</h1>
            <p className="text-muted-foreground max-w-2xl">The requested Ludoxel documentation page does not exist.</p>
          </div>

          <Link
            className="inline-flex items-center px-4 py-2 text-sm text-muted-foreground border border-border rounded-xl transition-colors hover:text-foreground hover:border-muted-foreground/50"
            to="/"
          >
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
