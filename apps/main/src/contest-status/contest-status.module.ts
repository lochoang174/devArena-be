import { Module } from '@nestjs/common';
import { ContestStatusService } from './contest-status.service';
import { ContestStatusController } from './contest-status.controller';

@Module({
  controllers: [ContestStatusController],
  providers: [ContestStatusService],
})
export class ContestStatusModule {}
