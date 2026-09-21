-- ==========================================================
-- 준픽스 (JUNPIKS) 공식 데이터베이스 스키마 DDL (ANSI SQL)
-- 지원: SQLite / PostgreSQL / MySQL
-- ==========================================================

-- 1. 관리자 계정 테이블
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 사이트 기본 설정 및 업체 정보
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_name VARCHAR(100) DEFAULT '준픽스 (JUNPIKS)',
    tagline VARCHAR(200) DEFAULT '막힘은 해결하고, 일상은 흐르게 - 경기·수도권 전지역 출장 전문설비',
    representative_name VARCHAR(50) DEFAULT '염준혁',
    phone_number VARCHAR(30) DEFAULT '010-2703-1491',
    tel_number VARCHAR(30) DEFAULT '010-2703-1491',
    kakao_talk_url VARCHAR(255) DEFAULT 'https://open.kakao.com/',
    naver_blog_url VARCHAR(255) DEFAULT 'https://blog.naver.com/',
    service_areas VARCHAR(255) DEFAULT '경기·수도권 전지역 30분~1시간 내 긴급출동',
    business_number VARCHAR(50) DEFAULT '',
    address VARCHAR(200) DEFAULT '경기·수도권 전지역 출동대기',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 서비스 분류 및 상세 안내
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,    -- 'plumbing' (설비 메인) 또는 'aircon' (에어컨 별도)
    title VARCHAR(100) NOT NULL,
    subtitle VARCHAR(200),
    icon_name VARCHAR(50),
    symptoms TEXT,                    -- 주요 증상
    causes TEXT,                      -- 발생 가능한 원인
    inspection_method TEXT,           -- 현장 점검 방식
    work_process TEXT,                -- 작업 방법
    equipment TEXT,                   -- 사용 첨단 장비
    order_num INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1
);

-- 4. 시공사례 (Before & After 포함)
CREATE TABLE IF NOT EXISTS case_studies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER,
    title VARCHAR(200) NOT NULL,
    region VARCHAR(100) NOT NULL,     -- 작업 지역
    symptom VARCHAR(255) NOT NULL,    -- 고객 증상
    cause TEXT NOT NULL,              -- 문제 원인
    solution TEXT NOT NULL,           -- 작업 과정 및 해결 결과
    equipment TEXT,                   -- 사용 장비
    before_image_url TEXT,            -- 작업 전 사진
    after_image_url TEXT,             -- 작업 후 사진
    naver_blog_link VARCHAR(255),     -- 네이버 블로그 링크
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT 0,    -- 메인 노출 여부
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

-- 5. 작업비용 안내 (투명 견적표)
CREATE TABLE IF NOT EXISTS pricing_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'plumbing',
    price_display VARCHAR(100) NOT NULL, -- 예: '50,000원~', '현장 견적'
    is_custom_quote BOOLEAN DEFAULT 0,  -- 현장 견적 여부
    description VARCHAR(255),
    notice VARCHAR(255) DEFAULT '배관 상태, 작업 난이도 및 현장 여건에 따라 변동될 수 있습니다.',
    order_num INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1
);

-- 6. 고객 후기
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name VARCHAR(50) NOT NULL,
    region VARCHAR(50),
    service_type VARCHAR(50),
    rating INTEGER DEFAULT 5,
    comment TEXT NOT NULL,
    created_date VARCHAR(20),
    is_active BOOLEAN DEFAULT 1
);

-- 7. 고객 상담 및 출동 접수 내역
CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    region VARCHAR(100) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    preferred_time VARCHAR(100),
    status VARCHAR(20) DEFAULT '접수완료', -- '접수완료', '상담진행중', '출동예약', '시공완료'
    memo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
