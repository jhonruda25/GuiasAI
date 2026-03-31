ALTER TABLE "work_guides"
ADD COLUMN "has_cover" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "cover_image_data_url" TEXT;

