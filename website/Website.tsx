import React, { useState } from 'react';
import { WebsiteLayout } from './components/WebsiteLayout';
import { HomePage } from './pages/HomePage';
import { FeaturesPage } from './pages/FeaturesPage';
import { PricingPage } from './pages/PricingPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { FAQPage } from './pages/FAQPage';

type PageType = 'home' | 'features' | 'pricing' | 'testimonials' | 'faq';

export const Website: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const navigate = (page: string, feature?: string) => {
    setCurrentPage(page as PageType);
    if (feature) {
      setActiveFeature(feature);
    } else {
      setActiveFeature(null);
    }
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'features':
        return <FeaturesPage activeFeature={activeFeature} />;
      case 'pricing':
        return <PricingPage />;
      case 'testimonials':
        return <TestimonialsPage />;
      case 'faq':
        return <FAQPage />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <WebsiteLayout currentPage={currentPage} onNavigate={navigate}>
      {renderPage()}
    </WebsiteLayout>
  );
};

export default Website;
