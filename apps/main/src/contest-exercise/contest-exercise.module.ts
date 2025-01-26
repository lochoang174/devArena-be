import { Module } from '@nestjs/common';
import { ContestExerciseService } from './contest-exercise.service';
import { ContestExerciseController } from './contest-exercise.controller';

@Module({
  controllers: [ContestExerciseController],
  providers: [ContestExerciseService],
})
export class ContestExerciseModule {}
