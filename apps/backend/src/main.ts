import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ThrottlerModule } from '@nestjs/throttler';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.use(compression());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }));

  // Rate limiting — global: 100 requests per 60 seconds
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger with module tags
  const config = new DocumentBuilder()
    .setTitle('Censo Motos API')
    .setDescription(
      'Sistema de Censo de Motos — API REST para la Alcaldía Municipal de Sabanalarga.\n\n' +
      '**Módulos:**\n' +
      '- **Auth** — Autenticación JWT (login, logout, perfil)\n' +
      '- **Users** — Gestión de usuarios del sistema\n' +
      '- **Censuses** — Creación, edición y finalización de censos\n' +
      '- **Stations** — Gestión de estaciones de censo\n' +
      '- **Censistas** — Gestión de censistas\n' +
      '- **Certificates** — Generación de certificados PDF con QR\n' +
      '- **Dashboard** — Estadísticas y reportes administrativos\n' +
      '- **Audit** — Registro de auditoría del sistema\n' +
      '- **Public** — Consulta pública de censos por código o placa\n' +
      '- **Health** — Health checks del sistema'
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese el token JWT obtenido del endpoint /auth/login',
      },
      'jwt-auth',
    )
    .addTag('Auth', 'Autenticación y autorización')
    .addTag('Users', 'Administración de usuarios')
    .addTag('Censuses', 'Gestión de censos de motocicletas')
    .addTag('Stations', 'Gestión de estaciones de censo')
    .addTag('Censistas', 'Gestión de censistas')
    .addTag('Certificates', 'Generación de certificados')
    .addTag('Dashboard', 'Estadísticas y reportes')
    .addTag('Audit', 'Registro de auditoría')
    .addTag('Public', 'Consulta pública')
    .addTag('Health', 'Health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`Application running on: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
