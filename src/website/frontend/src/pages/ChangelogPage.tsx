/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import ChangelogLayout from '../components/changelog/ChangelogLayout';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';

export default function ChangelogPage(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <Header activePath="/changelog" />
      <ChangelogLayout />
      <Footer />
    </div>
  );
}
