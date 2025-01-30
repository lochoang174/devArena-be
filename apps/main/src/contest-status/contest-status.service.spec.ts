import { Test, TestingModule } from '@nestjs/testing';
import { ContestStatusService } from './contest-status.service';

describe('ContestStatusService', () => {
  let service: ContestStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContestStatusService],
    }).compile();

    service = module.get<ContestStatusService>(ContestStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
