import { NestFactory } from '@nestjs/core';
import { CompileModule } from './compile.module';

async function bootstrap() {
  const app = await NestFactory.create(CompileModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
