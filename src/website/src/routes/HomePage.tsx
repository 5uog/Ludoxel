/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import Footer from '../components/Footer';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';

export default function HomePage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
      <Header activePath="/" />
      <main className="flex-1">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}
