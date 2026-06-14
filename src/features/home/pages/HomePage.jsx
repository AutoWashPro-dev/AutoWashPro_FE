import HeroSection from '../components/HeroSection';
import ServiceSection from '../components/ServiceSection';
import PricingSection from '../components/PricingSection';
import ContactSection from '../components/ContactSection';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full bg-[#f7fafd]">
      <HeroSection />
      <ServiceSection />
      <PricingSection />
      <ContactSection />
    </div>
  );
}