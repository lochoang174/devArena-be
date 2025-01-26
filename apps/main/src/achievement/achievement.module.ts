import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { AchievementSchema } from '../schemas/achievement.schema';
import { Achievement } from '../schemas/achievement.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Achievement.name, schema: AchievementSchema }]), // Register AchievementModel
  ],
  controllers: [AchievementController],
  providers: [AchievementService],

})
export class AchievementModule { }
