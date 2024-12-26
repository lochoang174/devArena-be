import { Test, TestingModule } from '@nestjs/testing';
import { CourseStatusService } from './course-status.service';

describe('CourseStatusService', () => {
  let service: CourseStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseStatusService],
    }).compile();

    service = module.get<CourseStatusService>(CourseStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
