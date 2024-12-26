import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseStatusController } from './exercise-status.controller';
import { ExerciseStatusService } from './exercise-status.service';

describe('ExerciseStatusController', () => {
  let controller: ExerciseStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseStatusController],
      providers: [ExerciseStatusService],
    }).compile();

    controller = module.get<ExerciseStatusController>(ExerciseStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
