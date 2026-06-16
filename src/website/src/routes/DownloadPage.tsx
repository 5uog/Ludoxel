import { Link } from 'react-router-dom';

import Footer from '../components/Footer';
import Header from '../components/Header';

export default function DownloadPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <Header activePath="/download" />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">Download</h1>
            <p className="text-xl text-primary font-medium mb-4">Current public build status</p>
            <p className="text-muted-foreground max-w-2xl">
              This page records the public download status without placeholder installer claims, mirrored reference assets, or unverified release artifacts.
            </p>
          </div>

          <div className="space-y-12">
            <section className="scroll-mt-24">
              <h2 className="font-semibold tracking-tight mb-4 text-2xl">Public build status</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>No installer artifact is published by this website page. Use the documentation overview to understand the implemented systems before changing the desktop application.</p>
                <Link
                  className="inline-flex items-center px-4 py-2 text-sm text-muted-foreground border border-border rounded-xl transition-colors hover:text-foreground hover:border-muted-foreground/50"
                  to="/docs/overview"
                >
                  Open Overview
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
