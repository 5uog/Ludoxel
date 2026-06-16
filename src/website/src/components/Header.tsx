import { ArrowUpRight, Compass, Menu, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { getStartedHref, mainNavigation } from '../data/navigation';
import SearchCommand from './SearchCommand';

type HeaderProps = {
  activePath?: string;
};

export default function Header({ activePath }: HeaderProps): React.JSX.Element {
  const location = useLocation();
  const currentPath = activePath ?? location.pathname;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-300 bg-transparent border-b border-white/10">
      <nav className="flex items-center justify-between w-full max-w-[90rem] mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center gap-6">
          <Link className="flex items-center gap-2" to="/">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-300 to-zinc-100">
                <Compass className="w-5 h-5 text-zinc-900" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Ludoxel</h1>
            </div>
          </Link>
          <SearchCommand variant="header" placeholder="Search..." />
        </div>

        <div className="flex items-center gap-2">
          <nav className="hidden lg:flex items-center gap-1">
            {mainNavigation.map((item) => {
              const isActive = currentPath === item.href;
              const className = isActive
                ? 'px-3 py-2 text-sm font-medium transition-colors rounded-xl text-foreground'
                : 'px-3 py-2 text-sm font-medium transition-colors rounded-xl text-muted-foreground hover:text-foreground';

              return (
                <Link className={className} to={item.href} key={item.href}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            className="hidden lg:inline-flex items-center justify-center gap-1 py-3 px-5 bg-primary text-primary-foreground text-sm font-medium rounded-xl transition-colors hover:bg-primary/90"
            to={getStartedHref}
          >
            <span>Get started</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>

          <div className="lg:hidden flex items-center gap-2">
            <button
              aria-label="Search"
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground hover:border-muted-foreground/50"
              type="button"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              aria-label="Open menu"
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground hover:border-muted-foreground/50"
              type="button"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
