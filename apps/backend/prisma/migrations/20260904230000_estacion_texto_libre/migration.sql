-- Replace estacion FK with free-text field
ALTER TABLE "censuses" ADD COLUMN IF NOT EXISTS "estacion_nombre" TEXT;
ALTER TABLE "censuses" DROP CONSTRAINT IF EXISTS "censuses_estacion_id_fkey";
ALTER TABLE "censuses" DROP COLUMN IF EXISTS "estacion_id";
