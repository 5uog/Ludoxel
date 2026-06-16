import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { heroShortcuts } from '../data/home';
import SearchCommand from './SearchCommand';

export default function HeroSection(): React.JSX.Element {
  return (
    <section className="relative flex flex-col items-center justify-center px-4 md:px-8 pt-32 md:pt-40 pb-12 md:pb-16 overflow-hidden min-h-[500px]">
      <div className="hero-wave-video" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" style={{ zIndex: 1 }} />

      <div className="relative flex flex-col items-center" style={{ zIndex: 2 }}>
        <Link className="inline-flex items-center gap-2 pl-4 pr-2 py-2 mb-8 text-sm text-muted-foreground bg-[#121314] rounded-full" to="/docs/overview">
          <span>Welcome to Ludoxel.</span>
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1B1C1D]">
            <ChevronRight className="w-4 h-4" />
          </span>
        </Link>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-center tracking-tighter mb-6">Your Voxel Sandbox Knowledge Hub.</h1>

        <p className="text-base md:text-lg text-muted-foreground text-center max-w-2xl mb-12">
          Clear, structured documentation to help you understand Ludoxel faster. Explore renderer notes, AI NPC behavior, Othello mode, settings, and public project notes.
        </p>

        <div className="w-full max-w-2xl">
          <SearchCommand variant="hero" placeholder="Search (e.g. renderer, AI NPC)" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <span className="text-sm text-muted-foreground">Search shortcuts:</span>
          {heroShortcuts.map((shortcut) => (
            <Link
              className="inline-flex items-center px-4 py-2 text-sm text-muted-foreground border border-border rounded-xl transition-colors hover:text-foreground hover:border-muted-foreground/50"
              key={shortcut.href}
              to={shortcut.href}
            >
              {shortcut.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
