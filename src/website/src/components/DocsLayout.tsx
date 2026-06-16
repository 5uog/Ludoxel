import { ChevronRight, FileText, Home as HomeIcon, Layers, List, Menu, Settings, Shield, Sparkles, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

import { docsSections, docsIntro, onThisPage } from '../data/docs';
import { docsSidebarSections, type DocsSidebarItem } from '../data/navigation';

const iconMap: Record<DocsSidebarItem['icon'], React.ComponentType<{ className?: string }>> = {
  file: FileText,
  wrench: Wrench,
  layers: Layers,
  settings: Settings,
  sparkles: Sparkles,
  shield: Shield,
};

export default function DocsLayout(): React.JSX.Element {
  return (
    <div className="docs-shell">
      <div className="lg:hidden fixed top-20 left-4 z-40">
        <button aria-label="Open navigation" className="p-2 rounded-md bg-background border border-border hover:bg-secondary transition-colors" type="button">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <aside className="hidden lg:block w-64 shrink-0 border-r border-sidebar-border bg-sidebar-background sticky top-16 h-[calc(100vh-4rem)]">
        <div className="relative overflow-hidden h-full py-6">
          <div className="h-full w-full rounded-[inherit] overflow-y-auto">
            <div className="space-y-6 px-4">
              {docsSidebarSections.map((section) => (
                <div key={section.title}>
                  <h3 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</h3>
                  <div className="relative mt-1">
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-sidebar-background border-r border-sidebar-border" />
                    <div className="relative">
                      {section.items.map((item) => {
                        const Icon = iconMap[item.icon];
                        const isActive = item.href === '/docs/overview';

                        return (
                          <Link
                            className={
                              isActive
                                ? 'relative flex items-center gap-3 pl-6 pr-3 py-2 text-sm transition-colors text-foreground font-medium'
                                : 'relative flex items-center gap-3 pl-6 pr-3 py-2 text-sm transition-colors text-muted-foreground hover:text-foreground'
                            }
                            key={item.href}
                            to={item.href}
                          >
                            {isActive ? <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-primary" /> : null}
                            <Icon className={isActive ? 'h-4 w-4 shrink-0 text-primary' : 'h-4 w-4 shrink-0'} />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-4 md:px-6 lg:px-12 pt-16 lg:pt-10 pb-10 overflow-hidden">
        <div className="max-w-3xl w-full">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link className="hover:text-foreground transition-colors flex items-center gap-1" to="/docs/overview">
              <HomeIcon className="h-4 w-4" />
              <span>Docs</span>
            </Link>
            <div className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              <span className="hover:text-foreground transition-colors cursor-pointer">{docsIntro.eyebrow}</span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{docsIntro.title}</span>
            </div>
          </nav>

          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">{docsIntro.title}</h1>
            <p className="text-lg text-muted-foreground mb-12">{docsIntro.description}</p>
          </div>

          <div className="space-y-12">
            {docsSections.map((section) => (
              <section className="scroll-mt-24" id={section.id} key={section.id}>
                <h2 className="font-semibold tracking-tight mb-4 text-2xl">{section.title}</h2>
                <div className="text-muted-foreground leading-relaxed space-y-4">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.items ? (
                    <ul className="list-disc list-inside space-y-2 ml-2 mt-4">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <aside className="hidden xl:block w-56 shrink-0 sticky top-24 h-fit pr-6">
        <div className="flex items-center gap-2 text-sm font-semibold mb-4">
          <List className="h-4 w-4" />
          <span>On this page</span>
        </div>

        <nav className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-sidebar-background border-r border-sidebar-border" />
          <div className="relative">
            {onThisPage.map((item, index) => (
              <a
                className={
                  index === 0
                    ? 'relative block w-full text-left text-sm py-1.5 transition-colors pl-4 text-foreground font-medium'
                    : 'relative block w-full text-left text-sm py-1.5 transition-colors pl-4 text-muted-foreground hover:text-foreground'
                }
                href={item.href}
                key={item.href}
              >
                {index === 0 ? <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" /> : null}
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      </aside>
    </div>
  );
}
