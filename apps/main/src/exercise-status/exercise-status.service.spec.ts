import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseStatusService } from './exercise-status.service';

describe('ExerciseStatusService', () => {
  let service: ExerciseStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExerciseStatusService],
    }).compile();

    service = module.get<ExerciseStatusService>(ExerciseStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
