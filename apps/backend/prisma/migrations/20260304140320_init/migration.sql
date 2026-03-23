-- CreateEnum
CREATE TYPE "WorkGuideStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "work_guides" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "target_audience" TEXT NOT NULL,
    "status" "WorkGuideStatus" NOT NULL DEFAULT 'PENDING',
    "content" JSONB,
    "global_score" INTEGER,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_guides_pkey" PRIMARY KEY ("id")
);
