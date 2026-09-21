-- CreateTable
CREATE TABLE `admin_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'admin',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admin_users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `site_name` VARCHAR(100) NOT NULL DEFAULT '준픽스 (JUNFIX)',
    `tagline` VARCHAR(200) NOT NULL DEFAULT '막힘은 해결하고, 일상은 흐르게 - 젊은 기술, 정직한 서비스',
    `representative_name` VARCHAR(50) NOT NULL DEFAULT '염준혁',
    `phone_number` VARCHAR(30) NOT NULL DEFAULT '010-2703-1491',
    `tel_number` VARCHAR(30) NOT NULL DEFAULT '010-2703-1491',
    `kakao_talk_url` VARCHAR(255) NOT NULL DEFAULT 'https://open.kakao.com/me/junfix',
    `naver_blog_url` VARCHAR(255) NOT NULL DEFAULT 'https://blog.naver.com/junfix_official',
    `service_areas` VARCHAR(255) NOT NULL DEFAULT '경기·수도권 전지역 출장 가능 (평일·주말 24시간 상담)',
    `business_number` VARCHAR(50) NOT NULL DEFAULT '123-45-67890',
    `address` VARCHAR(200) NOT NULL DEFAULT '경기 및 수도권 전지역 긴급출동 대기',
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(50) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `subtitle` VARCHAR(200) NOT NULL,
    `icon_name` VARCHAR(50) NOT NULL,
    `symptoms` TEXT NOT NULL,
    `causes` TEXT NOT NULL,
    `inspection_method` TEXT NOT NULL,
    `work_process` TEXT NOT NULL,
    `equipment` TEXT NOT NULL,
    `order_num` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `services_slug_key`(`slug`),
    INDEX `services_is_active_order_num_idx`(`is_active`, `order_num`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `case_studies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `service_id` INTEGER NULL,
    `title` VARCHAR(200) NOT NULL,
    `service_category` VARCHAR(100) NOT NULL,
    `region` VARCHAR(100) NOT NULL,
    `symptom` VARCHAR(255) NOT NULL,
    `cause` TEXT NOT NULL,
    `solution` TEXT NOT NULL,
    `equipment` VARCHAR(255) NOT NULL,
    `before_image_url` TEXT NOT NULL,
    `after_image_url` TEXT NOT NULL,
    `naver_blog_link` VARCHAR(255) NOT NULL DEFAULT '',
    `date` VARCHAR(30) NOT NULL,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `case_studies_service_id_idx`(`service_id`),
    INDEX `case_studies_is_featured_created_at_idx`(`is_featured`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pricing_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `service_name` VARCHAR(100) NOT NULL,
    `category` VARCHAR(50) NOT NULL DEFAULT 'fixed',
    `price_display` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `notice` VARCHAR(255) NOT NULL DEFAULT '',
    `order_num` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `pricing_items_is_active_order_num_idx`(`is_active`, `order_num`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_name` VARCHAR(50) NOT NULL,
    `region` VARCHAR(50) NOT NULL DEFAULT '',
    `service_type` VARCHAR(50) NOT NULL DEFAULT '',
    `rating` INTEGER NOT NULL DEFAULT 5,
    `comment` TEXT NOT NULL,
    `date` VARCHAR(20) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `reviews_is_active_created_at_idx`(`is_active`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inquiries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_name` VARCHAR(50) NOT NULL,
    `phone_number` VARCHAR(30) NOT NULL,
    `region` VARCHAR(100) NOT NULL,
    `service_type` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL DEFAULT '',
    `preferred_time` VARCHAR(100) NOT NULL DEFAULT '',
    `status` VARCHAR(20) NOT NULL DEFAULT '접수완료',
    `memo` TEXT NOT NULL DEFAULT '',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `inquiries_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `case_studies` ADD CONSTRAINT `case_studies_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
