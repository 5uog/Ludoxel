import { Search, X } from 'lucide-react';
import { type ChangeEvent, type KeyboardEvent, type MouseEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { searchIndex } from '../data/searchIndex';

type SearchCommandProps = {
  variant: 'header' | 'hero';
  placeholder: string;
};

export default function SearchCommand({ variant, placeholder }: SearchCommandProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent): void => {
      const isCommandSearch = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';

      if (isCommandSearch) {
        event.preventDefault();
        setIsOpen(true);
      }

      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return searchIndex;
    }

    return searchIndex.filter((entry) => {
      const searchableText = `${entry.title} ${entry.description} ${entry.section}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });
  }, [query]);

  const handleButtonClick = (): void => {
    setIsOpen(true);
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.currentTarget === event.target) {
      setIsOpen(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const buttonClassName =
    variant === 'hero'
      ? 'search-bar-gradient-border bg-accent/5 rounded-xl inline-flex items-center justify-between py-4 pl-4 pr-3 w-full max-w-full gap-5 hover:bg-accent/5 transition-colors cursor-pointer'
      : 'hidden lg:inline-flex search-bar-gradient-border items-center justify-between py-2 pl-6 pr-2.5 w-[309px] min-w-[309px] gap-5 hover:bg-accent/5 transition-colors cursor-pointer';

  return (
    <>
      <button className={buttonClassName} type="button" onClick={handleButtonClick}>
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">{placeholder}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <kbd className="flex items-center justify-center w-6 h-6 rounded-md bg-secondary text-xs font-semibold text-muted-foreground">⌘</kbd>
          <kbd className="flex items-center justify-center w-6 h-6 rounded-md bg-secondary text-xs font-semibold text-muted-foreground">K</kbd>
        </div>
      </button>

      {isOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={handleBackdropClick}>
          <div aria-modal="true" className="command-panel" role="dialog" aria-label="Search documentation">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                autoFocus
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Search (e.g. renderer, AI NPC)"
                type="search"
                value={query}
              />
              <button
                aria-label="Close search"
                className="flex items-center justify-center w-8 h-8 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {filteredEntries.map((entry) => (
                <Link className="command-result" key={entry.href} to={entry.href} onClick={() => setIsOpen(false)}>
                  <span className="text-sm font-medium text-foreground">{entry.title}</span>
                  <span className="text-xs text-muted-foreground">{entry.description}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
