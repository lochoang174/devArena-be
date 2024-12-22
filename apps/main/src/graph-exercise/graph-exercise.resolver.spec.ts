import { Test, TestingModule } from '@nestjs/testing';
import { GraphExerciseResolver } from './graph-exercise.resolver';
import { GraphExerciseService } from './graph-exercise.service';

describe('GraphExerciseResolver', () => {
  let resolver: GraphExerciseResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphExerciseResolver, GraphExerciseService],
    }).compile();

    resolver = module.get<GraphExerciseResolver>(GraphExerciseResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
