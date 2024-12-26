import { Injectable } from '@nestjs/common';
import { CreateCourseStatusDto } from './dto/create-course-status.dto';
import { UpdateCourseStatusDto } from './dto/update-course-status.dto';

@Injectable()
export class CourseStatusService {
  create(createCourseStatusDto: CreateCourseStatusDto) {
    return 'This action adds a new courseStatus';
  }

  findAll() {
    return `This action returns all courseStatus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} courseStatus`;
  }

  update(id: number, updateCourseStatusDto: UpdateCourseStatusDto) {
    return `This action updates a #${id} courseStatus`;
  }

  remove(id: number) {
    return `This action removes a #${id} courseStatus`;
  }
}
