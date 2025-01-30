import { Test, TestingModule } from '@nestjs/testing';
import { ContestStatusController } from './contest-status.controller';
import { ContestStatusService } from './contest-status.service';

describe('ContestStatusController', () => {
  let controller: ContestStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContestStatusController],
      providers: [ContestStatusService],
    }).compile();

    controller = module.get<ContestStatusController>(ContestStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
