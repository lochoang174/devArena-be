import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseStatusDto } from './create-course-status.dto';

export class UpdateCourseStatusDto extends PartialType(CreateCourseStatusDto) {}
