import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3001;
  await app.listen(port);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  console.log(`Backend rodando na porta ${port}`);
}
bootstrap();
