import { ArrowRight, LifeBuoy, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

import { supportCards } from '../data/home';

export default function SupportSection(): React.JSX.Element {
  return (
    <section className="py-10 md:py-14 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-[2rem] border border-border overflow-hidden p-6 md:p-10 support-panel-background">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Community &amp; support</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supportCards.map((card) => {
              const Icon = card.icon === 'message' ? MessageSquare : LifeBuoy;

              return (
                <Link
                  className="group flex flex-col lg:flex-row items-center gap-4 p-5 bg-background border border-border rounded-[2rem] transition-colors hover:border-muted-foreground/30"
                  key={card.href}
                  style={{
                    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 3px 6px 0px, rgba(255, 255, 255, 0.03) 0px -3px 2px 0px inset, rgba(255, 255, 255, 0.1) 0px 0.6px 0.36px -1.17px inset',
                  }}
                  to={card.href}
                >
                  <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full border border-border">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                  </div>

                  <div className="inline-flex items-center gap-2 text-sm text-foreground transition-colors group-hover:text-muted-foreground">
                    <span>{card.actionLabel}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
