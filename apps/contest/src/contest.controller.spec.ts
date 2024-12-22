import { Test, TestingModule } from '@nestjs/testing';
import { ContestController } from './contest.controller';
import { ContestService } from './contest.service';

describe('ContestController', () => {
  let contestController: ContestController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ContestController],
      providers: [ContestService],
    }).compile();

    contestController = app.get<ContestController>(ContestController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(contestController.getHello()).toBe('Hello World!');
    });
  });
});
