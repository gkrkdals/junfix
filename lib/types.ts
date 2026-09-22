// 앱 전역에서 쓰는 도메인 타입.
// 클라이언트 컴포넌트도 import 하므로 서버 전용 모듈(fs, prisma)을 넣지 않는다.
// DB 행 -> 이 타입으로의 변환은 lib/repository.ts 가 담당한다.

export interface SiteSettings {
  siteName: string;
  tagline: string;
  representativeName: string;
  phoneNumber: string;
  telNumber: string;
  kakaoTalkUrl: string;
  naverBlogUrl: string;
  businessNumber: string;
  address: string;

  siteUrl: string;
  email: string;
  businessHours: string;
  /** 서비스 가능 지역 목록. 줄바꿈 구분 텍스트. */
  serviceAreaList: string;
  logoImageUrl: string;
  heroImageUrl: string;
  notifyEmail: string;
  gaMeasurementId: string;
  gtmId: string;
  naverAnalyticsId: string;
  googleAdsSendTo: string;
  naverSiteVerification: string;
  googleSiteVerification: string;
}

export interface ServiceItem {
  id: number;
  slug: string;
  category: 'plumbing' | 'aircon';
  title: string;
  subtitle: string;
  iconName: string;
  symptoms: string[];
  causes: string[];
  inspectionMethod: string;
  workProcess: string[];
  equipment: string[];
  imageUrl: string;
  orderNum: number;
  isActive: boolean;
}

export interface CaseStudy {
  id: number;
  serviceId: number | null;
  title: string;
  serviceCategory: string;
  region: string;
  symptom: string;
  cause: string;
  /** 작업 과정 */
  workProcess: string;
  /** 해결 결과 */
  solution: string;
  equipment: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  /** 작업 과정 사진 URL 목록 */
  processImages: string[];
  naverBlogLink: string;
  date: string;
  isFeatured: boolean;
}

export interface PricingItem {
  id: number;
  serviceName: string;
  category: 'fixed' | 'quote';
  priceDisplay: string;
  description: string;
  notice: string;
  orderNum: number;
  isActive: boolean;
}

export interface ReviewItem {
  id: number;
  customerName: string;
  region: string;
  serviceType: string;
  rating: number;
  comment: string;
  date: string;
  isActive: boolean;
}

export interface SitePhoto {
  id: number;
  url: string;
  caption: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MediaAsset {
  id: number;
  url: string;
  originalName: string;
  mimeType: string;
  width: number;
  height: number;
  size: number;
  createdAt: string;
}

export type InquiryStatus = '접수완료' | '상담진행중' | '출동예약' | '시공완료';

export interface InquiryItem {
  id: number;
  customerName: string;
  phoneNumber: string;
  region: string;
  serviceType: string;
  description: string;
  preferredTime: string;
  status: InquiryStatus;
  memo: string;
  createdAt: string;
}

export interface AppData {
  settings: SiteSettings;
  services: ServiceItem[];
  caseStudies: CaseStudy[];
  pricing: PricingItem[];
  reviews: ReviewItem[];
  inquiries: InquiryItem[];
  sitePhotos: SitePhoto[];
}
