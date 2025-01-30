import { Test, TestingModule } from '@nestjs/testing';
import { ContestExerciseController } from './contest-exercise.controller';
import { ContestExerciseService } from './contest-exercise.service';

describe('ContestExerciseController', () => {
  let controller: ContestExerciseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContestExerciseController],
      providers: [ContestExerciseService],
    }).compile();

    controller = module.get<ContestExerciseController>(ContestExerciseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
