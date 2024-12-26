import { Module } from '@nestjs/common';
import { ExerciseStatusService } from './exercise-status.service';
import { ExerciseStatusController } from './exercise-status.controller';

@Module({
  controllers: [ExerciseStatusController],
  providers: [ExerciseStatusService],
})
export class ExerciseStatusModule {}
