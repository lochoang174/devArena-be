import { Module } from '@nestjs/common';
import { AchievementStatusService } from './achievement-status.service';
import { AchievementStatusController } from './achievement-status.controller';

@Module({
  controllers: [AchievementStatusController],
  providers: [AchievementStatusService],
  exports: [AchievementStatusService],
})
export class AchievementStatusModule { }
