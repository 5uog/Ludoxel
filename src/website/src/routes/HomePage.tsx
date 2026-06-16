import AssistantPreview from '../components/AssistantPreview';
import FeatureGrid from '../components/FeatureGrid';
import Footer from '../components/Footer';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import SupportSection from '../components/SupportSection';

export default function HomePage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header activePath="/" />
      <main>
        <HeroSection />
        <FeatureGrid />
        <SupportSection />
        <AssistantPreview />
      </main>
      <Footer />
    </div>
  );
}
