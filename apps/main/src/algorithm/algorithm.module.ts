import { Module } from '@nestjs/common';
import { AlgorithmService } from './algorithm.service';
import { AlgorithmController } from './algorithm.controller';
import { ExerciseStatusModule } from '../exercise-status/exercise-status.module';

@Module({
  imports: [ExerciseStatusModule],
  controllers: [AlgorithmController],
  providers: [AlgorithmService],
  exports: [AlgorithmService],
})
export class AlgorithmModule { }
