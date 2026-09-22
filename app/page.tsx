import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ServicesSection from '@/components/ServicesSection';
import PricingSection from '@/components/PricingSection';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import AboutSection from '@/components/AboutSection';
import ReviewsSection from '@/components/ReviewsSection';
import ServiceAreaSection from '@/components/ServiceAreaSection';
import InquirySection from '@/components/InquirySection';
import Footer from '@/components/Footer';
import FloatingActionBar from '@/components/FloatingActionBar';
import { listCaseStudies, listPricing, listReviews, listServices, listSitePhotos } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [services, caseStudies, pricing, reviews, sitePhotos] = await Promise.all([
    listServices({ activeOnly: true }),
    listCaseStudies(),
    listPricing({ activeOnly: true }),
    listReviews({ activeOnly: true }),
    listSitePhotos({ activeOnly: true }),
  ]);

  // 흐름: 어떤 업체인지(배너) → 주요 서비스 → 기본 가격 → 실제 사례 → 소개 → 후기 → 지역 → 상담
  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <ServicesSection services={services} caseStudies={caseStudies} />
        <PricingSection pricing={pricing} />
        <CaseStudiesSection cases={caseStudies} services={services} />
        <AboutSection photos={sitePhotos} />
        <ReviewsSection reviews={reviews} />
        <ServiceAreaSection />
        <InquirySection services={services} />
      </main>
      <Footer />
      <FloatingActionBar />
    </div>
  );
}
