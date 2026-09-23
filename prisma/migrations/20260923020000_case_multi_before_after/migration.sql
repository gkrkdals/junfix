-- 작업 전/후 사진을 여러 장 저장. 기존 단일 사진은 목록의 첫 장으로 옮긴다.
ALTER TABLE `case_studies`
  ADD COLUMN `before_images` TEXT NOT NULL DEFAULT '[]',
  ADD COLUMN `after_images` TEXT NOT NULL DEFAULT '[]';

UPDATE `case_studies` SET `before_images` = JSON_ARRAY(`before_image_url`) WHERE `before_image_url` <> '';
UPDATE `case_studies` SET `after_images` = JSON_ARRAY(`after_image_url`) WHERE `after_image_url` <> '';
