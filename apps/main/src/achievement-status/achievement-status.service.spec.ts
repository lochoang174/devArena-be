import { Test, TestingModule } from '@nestjs/testing';
import { AchievementStatusService } from './achievement-status.service';

describe('AchievementStatusService', () => {
  let service: AchievementStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AchievementStatusService],
    }).compile();

    service = module.get<AchievementStatusService>(AchievementStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
