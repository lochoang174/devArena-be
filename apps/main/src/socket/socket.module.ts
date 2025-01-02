import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { StudyModule } from '../study/study.module';

@Module({
  providers: [SocketGateway, SocketService],
  imports:[StudyModule]
})
export class SocketModule {}
