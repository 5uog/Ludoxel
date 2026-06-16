import Footer from '../components/Footer';
import Header from '../components/Header';
import { changelogEntries } from '../data/changelog';

export default function ChangelogPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <Header activePath="/changelog" />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">Changelog</h1>
            <p className="text-xl text-primary font-medium mb-4">Public website notes</p>
            <p className="text-muted-foreground max-w-2xl">Stay up to date with public Ludoxel website changes without invented release artifacts or placeholder installer claims.</p>
          </div>

          <div className="space-y-12">
            {changelogEntries.map((entry) => (
              <div className="flex flex-col md:flex-row gap-6 md:gap-12" key={entry.date}>
                <div className="md:w-48 md:sticky md:top-24 md:self-start flex-shrink-0">
                  <div className="flex flex-col gap-3">
                    <span className="text-sm font-medium text-muted-foreground">{entry.date}</span>
                    <div className="flex flex-row md:flex-col gap-2 flex-wrap">
                      {entry.tags.map((tag) => (
                        <span className="changelog-badge" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1 pb-12 border-b border-border last:border-b-0">
                  <div className="space-y-6">
                    {entry.sections.map((section) => (
                      <div className="space-y-3" key={section.title}>
                        <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
                        <ul className="space-y-2">
                          {section.items.map((item) => (
                            <li className="flex items-start gap-2 text-muted-foreground text-sm leading-relaxed" key={item}>
                              <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
