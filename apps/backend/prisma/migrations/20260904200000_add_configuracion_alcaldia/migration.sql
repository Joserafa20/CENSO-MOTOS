-- CreateTable
CREATE TABLE "configuracion_alcaldia" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL DEFAULT 'Alcaldía Municipal de Sabanalarga',
    "nit" TEXT,
    "municipio" TEXT NOT NULL DEFAULT 'Sabanalarga',
    "departamento" TEXT NOT NULL DEFAULT 'Atlántico',
    "alcalde" TEXT,
    "cargo" TEXT,
    "logo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_alcaldia_pkey" PRIMARY KEY ("id")
);
