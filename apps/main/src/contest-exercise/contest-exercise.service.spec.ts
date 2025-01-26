import { Test, TestingModule } from '@nestjs/testing';
import { ContestExerciseService } from './contest-exercise.service';

describe('ContestExerciseService', () => {
  let service: ContestExerciseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContestExerciseService],
    }).compile();

    service = module.get<ContestExerciseService>(ContestExerciseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
