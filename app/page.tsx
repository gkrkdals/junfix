import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ServicesSection from '@/components/ServicesSection';
import PricingSection from '@/components/PricingSection';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import ReviewsSection from '@/components/ReviewsSection';
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

  // 흐름: 배너 → 주요 서비스 → 기본 가격 → 실제 작업 사례 → 후기 → 상담
  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <ServicesSection services={services} caseStudies={caseStudies} />
        <PricingSection pricing={pricing} />
        <CaseStudiesSection cases={caseStudies} services={services} photos={sitePhotos} />
        <ReviewsSection reviews={reviews} />
        <InquirySection services={services} />
      </main>
      <Footer />
      <FloatingActionBar />
    </div>
  );
}
