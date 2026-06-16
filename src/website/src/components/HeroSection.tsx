/*
 * SPDX-FileCopyrightText: 2026 Kento Konishi
 * SPDX-License-Identifier: LicenseRef-All-Rights-Reserved
 */
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { heroShortcuts } from '../data/home';
import AnimatedText from './AnimatedText';
import SearchCommand from './SearchCommand';

const heroTitle = 'Challenge AI across blocks and boards.';
const heroDescription =
  'Ludoxel is a desktop voxel sandbox built with Python, PyQt6, OpenGL, and WGPU. This site documents the application structure, renderer behavior, AI NPC systems, Othello mode, settings, and project changes.';

export default function HeroSection(): React.JSX.Element {
  return (
    <section className="relative flex flex-col items-center justify-center px-4 md:px-8 pt-32 md:pt-40 pb-12 md:pb-16 overflow-hidden min-h-[500px]">
      <Link className="page-reveal inline-flex items-center gap-2 pl-4 pr-2 py-2 mb-8 text-sm text-muted-foreground bg-[#121314] rounded-full" to="/docs/overview">
        <span>Welcome to Ludoxel.</span>
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1B1C1D]">
          <ChevronRight className="w-4 h-4" />
        </span>
      </Link>

      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-center tracking-tighter mb-6">
        <AnimatedText text={heroTitle} />
      </h1>

      <p className="text-base md:text-lg text-muted-foreground text-center max-w-2xl mb-10">
        <AnimatedText text={heroDescription} delayStepMs={8} initialDelayMs={260} />
      </p>

      <div className="page-reveal page-reveal-delay-2 w-full max-w-2xl">
        <SearchCommand variant="hero" placeholder="Search (e.g. renderer, AI NPC)" />
      </div>

      <div className="page-reveal page-reveal-delay-3 flex flex-wrap items-center justify-center gap-3 mt-8">
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
    </section>
  );
}
