import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Validation (Gelen veriyi otomatik kontrol et)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 2. Swagger (Dokümantasyon)
  const config = new DocumentBuilder()
    .setTitle('Todo Auth API')
    .setDescription('Prisma 6 ve JWT ile Güvenli Todo Uygulaması')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
bootstrap();
