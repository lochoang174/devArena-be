import { NestFactory } from '@nestjs/core';
import { ContestModule } from './contest.module';

async function bootstrap() {
  const app = await NestFactory.create(ContestModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
