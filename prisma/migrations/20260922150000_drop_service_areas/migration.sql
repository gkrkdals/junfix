-- 출장 지역 요약 문구("경기·수도권 전지역 출장 가능") 필드 제거. 지역은 service_area_list 목록만 쓴다.
ALTER TABLE `site_settings` DROP COLUMN `service_areas`;
