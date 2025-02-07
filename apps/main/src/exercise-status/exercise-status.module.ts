import { Module } from '@nestjs/common';
import { ExerciseStatusService } from './exercise-status.service';
import { ExerciseStatusController } from './exercise-status.controller';
import { ExerciseModule } from '../exercise/exercise.module';
import { AlgorithmModule } from '../algorithm/algorithm.module';

@Module({
  controllers: [ExerciseStatusController],
  providers: [ExerciseStatusService],
  imports: [ExerciseModule],
  exports: [ExerciseStatusService],
})
export class ExerciseStatusModule { }
