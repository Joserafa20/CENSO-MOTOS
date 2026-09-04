# Sistema de Censo de Motos

**Alcaldía Municipal de Sabanalarga, Atlántico**

Aplicación web responsive/PWA para realizar, administrar, consultar y certificar el censo municipal de motocicletas y motocarros.

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand, React Hook Form, Zod
- **Backend:** NestJS 10, TypeScript, Prisma 5, JWT (Passport), Swagger
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Infrastructure:** Docker, Docker Compose

## Prerequisites

- Node.js >= 20.0.0
- Docker & Docker Compose
- npm >= 10.5.0

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` (root) and `apps/backend/.env`
3. Install dependencies: `npm install`
4. Start Docker services: `docker-compose up -d`
5. Initialize database: `npm run db:migrate`
6. Seed initial data: `npm run db:seed`
7. Start development: `npm run dev`

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- Swagger Docs: `http://localhost:3001/api/docs`

## Project Structure

```
censo-motos/
├── apps/
│   ├── backend/       # NestJS API
│   └── frontend/      # Next.js Web App
├── packages/
│   └── shared/        # Shared types, schemas, utils
├── docker-compose.yml
└── package.json
```

## Key Features

- **Mobile First:** Diseñado para dispositivos móviles con formularios por pasos.
- **Tres roles:** Administrador, Censista, Ciudadano.
- **Motor de reglas:** Validación condicional de campos según tipo de vehículo.
- **Certificados PDF:** Generación de certificados con código QR de validación.
- **Consulta pública:** Consulta de censo por número de placa.
- **Dashboard:** Panel administrativo con estadísticas y filtros.

## Scripts

- `npm run dev`: Iniciar entorno de desarrollo
- `npm run build`: Construir para producción
- `npm run test`: Ejecutar pruebas
- `npm run lint`: Verificar código
- `npm run db:migrate`: Ejecutar migraciones de Prisma
- `npm run db:seed`: Sembrar datos iniciales
