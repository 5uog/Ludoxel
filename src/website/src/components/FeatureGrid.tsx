import { categoryCards } from '../data/home';
import FeatureCard from './FeatureCard';

export default function FeatureGrid(): React.JSX.Element {
  return (
    <section className="px-4 md:px-8 py-10 md:py-14">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10">Explore by category</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryCards.map((card) => (
            <FeatureCard actionLabel={card.actionLabel} description={card.description} href={card.href} key={card.href} title={card.title} visualKind={card.visualKind} />
          ))}
        </div>
      </div>
    </section>
  );
}
