import { Test, TestingModule } from '@nestjs/testing';
import { ContestDescriptionService } from './contest-description.service';

describe('ContestDescriptionService', () => {
  let service: ContestDescriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContestDescriptionService],
    }).compile();

    service = module.get<ContestDescriptionService>(ContestDescriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
