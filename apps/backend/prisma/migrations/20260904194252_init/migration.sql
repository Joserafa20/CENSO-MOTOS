-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'CENSISTA');

-- CreateEnum
CREATE TYPE "EstadoCenso" AS ENUM ('BORRADOR', 'FINALIZADO', 'CERTIFICADO_GENERADO');

-- CreateEnum
CREATE TYPE "TipoVehiculo" AS ENUM ('MOTOCICLETA', 'MOTOCARRO');

-- CreateEnum
CREATE TYPE "ActividadMototaxi" AS ENUM ('MOTOTAXI', 'FAMILIAR');

-- CreateEnum
CREATE TYPE "Propiedad" AS ENUM ('PROPIA', 'PAGA_TARIFA');

-- CreateEnum
CREATE TYPE "Modalidad" AS ENUM ('ESTACION', 'CIRCULANTE');

-- CreateEnum
CREATE TYPE "Horario" AS ENUM ('DIURNO', 'NOCTURNO');

-- CreateEnum
CREATE TYPE "EstadoCertificado" AS ENUM ('VALIDO', 'ANULADO');

-- CreateEnum
CREATE TYPE "EstadoStation" AS ENUM ('ACTIVA', 'INACTIVA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "censuses" (
    "id" TEXT NOT NULL,
    "codigo_censo" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "tipo_vehiculo" "TipoVehiculo" NOT NULL,
    "actividad" "ActividadMototaxi",
    "propiedad" "Propiedad",
    "modalidad" "Modalidad",
    "valor_tarifa" DECIMAL(10,2),
    "estacion_id" TEXT,
    "documentos_al_dia" BOOLEAN,
    "horario" "Horario",
    "censista_id" TEXT NOT NULL,
    "estado" "EstadoCenso" NOT NULL DEFAULT 'BORRADOR',
    "fecha_censo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitud" DECIMAL(10,8),
    "longitud" DECIMAL(11,8),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "censuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stations" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "estado" "EstadoStation" NOT NULL DEFAULT 'ACTIVA',
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "census_id" TEXT NOT NULL,
    "codigo_certificado" TEXT NOT NULL,
    "qr_token" TEXT NOT NULL,
    "fecha_generacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoCertificado" NOT NULL DEFAULT 'VALIDO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidad_id" TEXT,
    "descripcion" TEXT,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_documento_key" ON "users"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "censuses_codigo_censo_key" ON "censuses"("codigo_censo");

-- CreateIndex
CREATE INDEX "censuses_placa_idx" ON "censuses"("placa");

-- CreateIndex
CREATE INDEX "censuses_censista_id_idx" ON "censuses"("censista_id");

-- CreateIndex
CREATE INDEX "censuses_estado_idx" ON "censuses"("estado");

-- CreateIndex
CREATE INDEX "censuses_fecha_censo_idx" ON "censuses"("fecha_censo");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_census_id_key" ON "certificates"("census_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_codigo_certificado_key" ON "certificates"("codigo_certificado");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_qr_token_key" ON "certificates"("qr_token");

-- CreateIndex
CREATE INDEX "audit_logs_usuario_id_idx" ON "audit_logs"("usuario_id");

-- CreateIndex
CREATE INDEX "audit_logs_entidad_entidad_id_idx" ON "audit_logs"("entidad", "entidad_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "censuses" ADD CONSTRAINT "censuses_estacion_id_fkey" FOREIGN KEY ("estacion_id") REFERENCES "stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "censuses" ADD CONSTRAINT "censuses_censista_id_fkey" FOREIGN KEY ("censista_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_census_id_fkey" FOREIGN KEY ("census_id") REFERENCES "censuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
