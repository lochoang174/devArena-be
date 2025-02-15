import { NestFactory } from '@nestjs/core';
import { CompileModule } from './compile.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigService } from "@nestjs/config";
import { COMPILE_PACKAGE_NAME, COMPILE_SERVICE_NAME } from '@app/common';

async function bootstrap() {

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(CompileModule, {
    transport: Transport.GRPC,
    options: {
      
      package: 'compile',
      protoPath: join(__dirname, '../../../proto/compile.proto'), // Đường dẫn đúng
      url: '0.0.0.0:5000'  // Quan trọng: Listen trên tất cả interfaces
      
    },
  });  

  // const port = configService.get<number>("PORT");

  await app.listen();
}
bootstrap();
  