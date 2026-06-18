/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import HomeBackgroundVideo from '../components/home/HomeBackgroundVideo';
import HeroSection from '../components/home/HeroSection';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';

export default function HomePage(): React.JSX.Element {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-hidden bg-background">
      <HomeBackgroundVideo />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header activePath="/" />
        <main className="flex-1">
          <HeroSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
