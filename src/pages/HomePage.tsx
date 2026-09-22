import React, { useState, useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { IntroSection } from '../components/home/IntroSection';
import { GlobalNetworkMap } from '../components/home/GlobalNetworkMap';
import { ServicesScrollStory } from '../components/home/ServicesScrollStory';
import { LogisticsJourney } from '../components/home/LogisticsJourney';
import { IndustriesInteractive } from '../components/home/IndustriesInteractive';
import { TechnologySection } from '../components/home/TechnologySection';
import { StatisticsSection } from '../components/home/StatisticsSection';
import { CaseStudiesSection } from '../components/home/CaseStudiesSection';
import { TestimonialsSlider } from '../components/home/TestimonialsSlider';
import { FaqSection } from '../components/home/FaqSection';
import { FinalCta } from '../components/home/FinalCta';
import { IntroLoader } from '../components/ui/IntroLoader';
import { updatePageSeo } from '../services/seoService';

export const HomePage: React.FC = () => {
  const [showLoader, setShowLoader] = useState(() => {
    // Only show loader once per session or on first visit
    const hasSeen = sessionStorage.getItem('nexora_intro_seen');
    return !hasSeen;
  });

  useEffect(() => {
    updatePageSeo({
      title: 'NEXORA LOGISTICS | Moving The World. Moving Your Business.',
      description: 'Next-generation international freight forwarding, live satellite cargo tracking, priority air charters, and intelligent supply chain orchestration.',
      schema: {
        '@context': 'https://schema.org',
        '@type': 'LogisticsService',
        'name': 'NEXORA LOGISTICS',
        'url': 'https://nexoralogistics.com',
        'logo': 'https://nexoralogistics.com/logo.png',
        'description': 'Global multi-modal freight forwarding and intelligent supply chain solutions.',
        'areaServed': 'Worldwide',
      }
    });
  }, []);

  const handleLoaderComplete = () => {
    sessionStorage.setItem('nexora_intro_seen', 'true');
    setShowLoader(false);
  };

  return (
    <div className="w-full">
      {/* Cinematic Intro Loader */}
      {showLoader && <IntroLoader onComplete={handleLoaderComplete} />}

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Editorial Introduction */}
      <IntroSection />

      {/* 3. Global Trade Network & Interactive Map */}
      <GlobalNetworkMap />

      {/* 4. Services Scroll Story */}
      <ServicesScrollStory />

      {/* 5. Logistics Journey */}
      <LogisticsJourney />

      {/* 6. Built For Every Industry */}
      <IndustriesInteractive />

      {/* 7. Technology & CyberFreight HUD */}
      <TechnologySection />

      {/* 8. Global Statistics Counters */}
      <StatisticsSection />

      {/* 9. Case Studies */}
      <CaseStudiesSection />

      {/* 10. Testimonials Slider */}
      <TestimonialsSlider />

      {/* 11. FAQ Accordion */}
      <FaqSection />

      {/* 12. Final CTA Banner */}
      <FinalCta />
    </div>
  );
};
