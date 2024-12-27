import { NestFactory, Reflector } from '@nestjs/core';
import { MainModule } from './main.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MAIN_SERVICE, TransformInterceptor } from '@app/common';
import { Transport } from '@nestjs/microservices';
import { JwtAuthGuard } from './auth/guards/jwt.guard';

async function bootstrap() {
  const app = await NestFactory.create(MainModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice({
    name: MAIN_SERVICE,
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: configService.get('TCP_PORT'),
    },
  });
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
