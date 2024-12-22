import { Test, TestingModule } from '@nestjs/testing';
import { GraphExerciseService } from './graph-exercise.service';

describe('GraphExerciseService', () => {
  let service: GraphExerciseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphExerciseService],
    }).compile();

    service = module.get<GraphExerciseService>(GraphExerciseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
