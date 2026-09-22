import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ServicesSection from '@/components/ServicesSection';
import WhyJunfix from '@/components/WhyJunfix';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import PricingSection from '@/components/PricingSection';
import ReviewsSection from '@/components/ReviewsSection';
import ServiceAreaSection from '@/components/ServiceAreaSection';
import InquirySection from '@/components/InquirySection';
import Footer from '@/components/Footer';
import FloatingActionBar from '@/components/FloatingActionBar';
import {
  listCaseStudies,
  listPricing,
  listReviews,
  listServices,
  listSitePhotos,
} from '@/lib/repository';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // 공개 페이지이므로 비활성 항목은 제외
  const [services, caseStudies, pricing, reviews, sitePhotos] = await Promise.all([
    listServices({ activeOnly: true }),
    listCaseStudies(),
    listPricing({ activeOnly: true }),
    listReviews({ activeOnly: true }),
    listSitePhotos({ activeOnly: true }),
  ]);

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0">
      <Navbar />
      <main className="flex-grow">
        {/* 1. 메인 배너 */}
        <Hero />

        {/* 2. 주요 서비스 (하수구·배관·누수 + 에어컨 별도 영역) */}
        <ServicesSection services={services} caseStudies={caseStudies} />

        {/* 3. 준픽스 소개 및 강점 + 차량·장비·현장 사진 */}
        <WhyJunfix photos={sitePhotos} />

        {/* 4. 시공사례 + 작업 전·후 비교 */}
        <CaseStudiesSection cases={caseStudies} services={services} />

        {/* 5. 작업비용 안내 */}
        <PricingSection pricing={pricing} />

        {/* 6. 고객후기 (등록된 후기가 있을 때만) */}
        <ReviewsSection reviews={reviews} />

        {/* 7. 서비스 가능지역 */}
        <ServiceAreaSection />

        {/* 8. 상담 및 문의 */}
        <InquirySection services={services} />
      </main>
      <Footer />
      <FloatingActionBar />
    </div>
  );
}
