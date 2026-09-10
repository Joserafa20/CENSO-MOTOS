-- Convert actividad column from enum to free text
ALTER TABLE "censuses" ALTER COLUMN "actividad" TYPE TEXT USING "actividad"::TEXT;

-- Drop the enum type if no other columns use it
DROP TYPE IF EXISTS "ActividadMototaxi";
