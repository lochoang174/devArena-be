import { Module } from '@nestjs/common';
import { GraphExerciseService } from './graph-exercise.service';
import { GraphExerciseResolver } from './graph-exercise.resolver';

@Module({
  providers: [GraphExerciseResolver, GraphExerciseService],
})
export class GraphExerciseModule {}
