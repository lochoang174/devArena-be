import { Module } from '@nestjs/common';
import { CourseStatusService } from './course-status.service';
import { CourseStatusController } from './course-status.controller';

@Module({
  controllers: [CourseStatusController],
  providers: [CourseStatusService],
})
export class CourseStatusModule {}
