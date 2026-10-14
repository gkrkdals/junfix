-- AlterTable
ALTER TABLE `site_settings` ADD COLUMN `google_ads_inquiry_send_to` VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN `google_ads_message_send_to` VARCHAR(100) NOT NULL DEFAULT '';
