import { Module } from '@nestjs/common';
import { CourseStatusService } from './course-status.service';
import { CourseStatusController } from './course-status.controller';
import { UserModule } from '../user/user.module';
import { CourseModule } from '../course/course.module';
import { ExerciseStatusModule } from '../exercise-status/exercise-status.module';

@Module({
  controllers: [CourseStatusController],
  providers: [CourseStatusService],
  imports: [CourseModule, UserModule, ExerciseStatusModule] 
})
export class CourseStatusModule {}
