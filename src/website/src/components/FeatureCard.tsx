import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { CategoryCard } from '../data/home';

type FeatureCardProps = CategoryCard;

export default function FeatureCard({ actionLabel, description, href, title, visualKind }: FeatureCardProps): React.JSX.Element {
  return (
    <div className="group flex flex-col rounded-[2rem] overflow-hidden border border-border transition-colors hover:border-muted-foreground/30">
      <div className="p-4 pb-0">
        <div aria-label={visualKind} className="relative w-full aspect-[16/9] overflow-hidden rounded-[1.5rem]">
          <div className="visual-placeholder" />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <Link className="inline-flex items-center gap-2 text-sm text-foreground transition-colors group-hover:text-muted-foreground" to={href}>
          <span>{actionLabel}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
