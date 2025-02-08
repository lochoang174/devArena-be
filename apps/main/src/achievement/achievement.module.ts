import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { AchievementSchema } from '../schemas/achievement.schema';
import { Achievement } from '../schemas/achievement.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AchievementStatusModule } from '../achievement-status/achievement-status.module';

@Module({
  imports: [AchievementStatusModule],
  controllers: [AchievementController],
  providers: [AchievementService],
  exports: [AchievementService],

})
export class AchievementModule { }
