/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import HeroSection from '../features/home/components/HeroSection';
import Footer from '../features/layout/components/Footer';
import Header from '../features/layout/components/Header';

export default function HomePage(): React.JSX.Element {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-hidden bg-background">
      <Header activePath="/" />
      <main className="flex-1">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}
