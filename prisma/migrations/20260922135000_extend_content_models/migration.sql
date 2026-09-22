-- AlterTable
ALTER TABLE `case_studies` ADD COLUMN `process_images` TEXT NOT NULL DEFAULT '[]',
    ADD COLUMN `work_process` TEXT NOT NULL DEFAULT '',
    MODIFY `before_image_url` VARCHAR(512) NOT NULL DEFAULT '',
    MODIFY `after_image_url` VARCHAR(512) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `services` ADD COLUMN `image_url` VARCHAR(512) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `site_settings` ADD COLUMN `business_hours` VARCHAR(100) NOT NULL DEFAULT '평일·주말 24시간 상담 가능',
    ADD COLUMN `email` VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN `ga_measurement_id` VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN `google_ads_send_to` VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN `google_site_verification` VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN `gtm_id` VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN `hero_image_url` VARCHAR(512) NOT NULL DEFAULT '',
    ADD COLUMN `logo_image_url` VARCHAR(512) NOT NULL DEFAULT '',
    ADD COLUMN `naver_analytics_id` VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN `naver_site_verification` VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN `notify_email` VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN `service_area_list` TEXT NOT NULL DEFAULT '',
    ADD COLUMN `site_url` VARCHAR(255) NOT NULL DEFAULT '',
    MODIFY `tagline` VARCHAR(200) NOT NULL DEFAULT '막힘은 해결하고, 일상은 흐르게',
    MODIFY `kakao_talk_url` VARCHAR(255) NOT NULL DEFAULT '',
    MODIFY `naver_blog_url` VARCHAR(255) NOT NULL DEFAULT '',
    MODIFY `service_areas` VARCHAR(255) NOT NULL DEFAULT '경기·수도권 전지역 출장 가능',
    MODIFY `business_number` VARCHAR(50) NOT NULL DEFAULT '',
    MODIFY `address` VARCHAR(200) NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE `site_photos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(512) NOT NULL,
    `caption` VARCHAR(200) NOT NULL DEFAULT '',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `site_photos_is_active_sort_order_idx`(`is_active`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media_assets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(512) NOT NULL,
    `original_name` VARCHAR(255) NOT NULL DEFAULT '',
    `mime_type` VARCHAR(50) NOT NULL DEFAULT '',
    `width` INTEGER NOT NULL DEFAULT 0,
    `height` INTEGER NOT NULL DEFAULT 0,
    `size` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `media_assets_url_key`(`url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
