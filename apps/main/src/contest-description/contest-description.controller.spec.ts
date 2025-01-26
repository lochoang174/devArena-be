import { Test, TestingModule } from '@nestjs/testing';
import { ContestDescriptionController } from './contest-description.controller';
import { ContestDescriptionService } from './contest-description.service';

describe('ContestDescriptionController', () => {
  let controller: ContestDescriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContestDescriptionController],
      providers: [ContestDescriptionService],
    }).compile();

    controller = module.get<ContestDescriptionController>(ContestDescriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
