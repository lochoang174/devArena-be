import { Test, TestingModule } from '@nestjs/testing';
import { CompileController } from './compile.controller';
import { CompileService } from './compile.service';

describe('CompileController', () => {
  let compileController: CompileController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CompileController],
      providers: [CompileService],
    }).compile();

    compileController = app.get<CompileController>(CompileController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(compileController.getHello()).toBe('Hello World!');
    });
  });
});
