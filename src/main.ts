import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // CORS
  const corsOrigin = config.get<string>('CORS_ORIGIN') ?? '*';
  const corsOrigins = corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins.length <= 1 ? corsOrigins[0] ?? '*' : corsOrigins,
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('UrSinger API')
    .setDescription('API de UrSinger - Plataforma de entrenamiento vocal')
    .setVersion('1.0')
    .addTag('Authentication', 'Endpoints de autenticación (registro e inicio de sesión)')
    .addTag('Profile', 'Endpoints de gestión de perfil de usuario')
    .addTag('Calibration', 'Endpoints de calibración de micrófono')
    .addTag('Metrics', 'Endpoints de métricas vocales para ML')
    .addTag('Health', 'Endpoints de health check')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido del login',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'UrSinger API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(config.get('PORT') ?? 3000);
  console.log(`🚀 API up on :${config.get('PORT')}`);
  console.log(`📚 Swagger docs at http://localhost:${config.get('PORT')}/api/docs`);
}
bootstrap();
