/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import DocsLayout from '../components/DocsLayout';
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function DocsOverviewPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header activePath="/docs/overview" />
      <DocsLayout />
      <Footer />
    </div>
  );
}
