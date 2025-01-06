import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { StudyModule } from '../study/study.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { COMPILE_SERVICE_NAME } from '@app/common';
import { join } from 'path';

@Module({
  providers: [SocketGateway, SocketService],
  imports:[StudyModule,
     ClientsModule.register([
              {
                name: COMPILE_SERVICE_NAME,
                transport: Transport.GRPC,
                options: {
                  package: 'compile',
                  protoPath: join(__dirname, '../../../proto/compile.proto'), // Đường dẫn đúng
                },
              },
            ]),
  ]
})
export class SocketModule {}
