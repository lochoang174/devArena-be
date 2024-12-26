import { NestFactory, Reflector } from '@nestjs/core';
import { MainModule } from './main.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransformInterceptor } from '@app/common';
import { JwtAuthGuard } from './auth/guards/jwt.guard';

async function bootstrap() {
  const app = await NestFactory.create(MainModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector)
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  const port = configService.get<number>('PORT');

  await app.listen(port);
}
bootstrap();
