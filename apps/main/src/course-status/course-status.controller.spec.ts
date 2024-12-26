import { Test, TestingModule } from '@nestjs/testing';
import { CourseStatusController } from './course-status.controller';
import { CourseStatusService } from './course-status.service';

describe('CourseStatusController', () => {
  let controller: CourseStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseStatusController],
      providers: [CourseStatusService],
    }).compile();

    controller = module.get<CourseStatusController>(CourseStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
