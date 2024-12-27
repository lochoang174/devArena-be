import { Module } from '@nestjs/common';
import { GraphExerciseService } from './graph-exercise.service';
import { GraphExerciseResolver } from './graph-exercise.resolver';
import { StudyModule } from '../study/study.module';

@Module({
  providers: [GraphExerciseResolver, GraphExerciseService],
  imports: [StudyModule],
})
export class GraphExerciseModule {}
