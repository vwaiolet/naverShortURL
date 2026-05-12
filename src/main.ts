import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);
  const port = Number(configService.get<number | string>('NODE_PORT', 3000));

  await app.listen(port);
  logger.log(`Node.js server listening at port ${port}`);
}
bootstrap();
