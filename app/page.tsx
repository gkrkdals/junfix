import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ServicesSection from '@/components/ServicesSection';
import WhyJunfix from '@/components/WhyJunfix';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import PricingSection from '@/components/PricingSection';
import ReviewsSection from '@/components/ReviewsSection';
import InquirySection from '@/components/InquirySection';
import Footer from '@/components/Footer';
import { listCaseStudies, listPricing, listReviews, listServices } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // 4개 섹션 데이터를 한 번에 조회 (공개 페이지이므로 비활성 항목은 제외)
  const [services, caseStudies, pricing, reviews] = await Promise.all([
    listServices({ activeOnly: true }),
    listCaseStudies(),
    listPricing({ activeOnly: true }),
    listReviews({ activeOnly: true }),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* 1. 메인 배너 & 긴급출동 히어로 */}
        <Hero />

        {/* 2. 주요 서비스 안내 (하수구, 싱크대, 변기, 고압세척, 누수 등 + 에어컨 분리 섹션) */}
        <ServicesSection services={services} />

        {/* 3. 준픽스 소개 및 4대 핵심 강점 (100% 직영, 최신장비, 투명비용, AS) */}
        <WhyJunfix />

        {/* 4. 실제 시공사례 (Before & After 비교 슬라이더, 블로그 연동) */}
        <CaseStudiesSection initialCases={caseStudies} />

        {/* 5. 작업비용 안내 (첨부 사진 100% 동일 양식: 기본 비용 + 현장 견적) */}
        <PricingSection pricing={pricing} />

        {/* 6. 고객 후기 */}
        <ReviewsSection reviews={reviews} />

        {/* 7. 상담 및 간편 출동 접수 폼 */}
        <InquirySection />
      </main>
      <Footer />
    </div>
  );
}
