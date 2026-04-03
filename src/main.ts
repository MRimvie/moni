import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Moni API')
    .setDescription('API de gestion intelligente de budget personnel')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'Endpoints d\'authentification')
    .addTag('Users', 'Gestion des utilisateurs')
    .addTag('Revenus', 'Gestion des revenus')
    .addTag('Depenses', 'Gestion des dépenses')
    .addTag('Budgets', 'Gestion des budgets')
    .addTag('Epargne', 'Gestion de l\'épargne')
    .addTag('Notifications', 'Gestion des notifications')
    .addTag('Conseils', 'Conseils financiers')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n🚀 Application démarrée sur http://localhost:${port}`);
  console.log(`📚 Documentation Swagger disponible sur http://localhost:${port}/api\n`);
}

bootstrap();
