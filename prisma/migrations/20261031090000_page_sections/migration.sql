ALTER TABLE "SiteSettings" ADD COLUMN     "leadMagnetEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sections" JSONB NOT NULL DEFAULT '{}';
