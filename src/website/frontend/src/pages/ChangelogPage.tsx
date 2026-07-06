/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import ChangelogLayout from '../features/changelog/components/ChangelogLayout';
import Footer from '../features/layout/components/Footer';
import Header from '../features/layout/components/Header';

export default function ChangelogPage(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      <Header activePath="/changelog" />
      <ChangelogLayout />
      <Footer />
    </div>
  );
}
