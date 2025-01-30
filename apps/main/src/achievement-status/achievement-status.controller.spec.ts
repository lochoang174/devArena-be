import { Test, TestingModule } from '@nestjs/testing';
import { AchievementStatusController } from './achievement-status.controller';
import { AchievementStatusService } from './achievement-status.service';

describe('AchievementStatusController', () => {
  let controller: AchievementStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchievementStatusController],
      providers: [AchievementStatusService],
    }).compile();

    controller = module.get<AchievementStatusController>(AchievementStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
