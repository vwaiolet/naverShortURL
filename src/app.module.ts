import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UrlModule } from './url/url.module';

function validateConfig(config: Record<string, unknown>) {
  const requiredKeys = ['CLIENT_ID', 'CLIENT_SECRET'] as const;

  for (const key of requiredKeys) {
    const value = config[key];

    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`${key} is required.`);
    }
  }

  const port = config.NODE_PORT;
  if (
    port !== undefined &&
    (!Number.isInteger(Number(port)) || Number(port) <= 0)
  ) {
    throw new Error('NODE_PORT must be a positive integer.');
  }

  const timeout = config.NAVER_API_TIMEOUT_MS;
  if (
    timeout !== undefined &&
    (!Number.isInteger(Number(timeout)) || Number(timeout) <= 0)
  ) {
    throw new Error('NAVER_API_TIMEOUT_MS must be a positive integer.');
  }

  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateConfig }),
    UrlModule,
  ],
})
export class AppModule {}
