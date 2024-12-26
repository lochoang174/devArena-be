import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CourseStatusService } from './course-status.service';
import { CreateCourseStatusDto } from './dto/create-course-status.dto';
import { UpdateCourseStatusDto } from './dto/update-course-status.dto';

@Controller('course-status')
export class CourseStatusController {
  constructor(private readonly courseStatusService: CourseStatusService) {}

  @Post()
  create(@Body() createCourseStatusDto: CreateCourseStatusDto) {
    return this.courseStatusService.create(createCourseStatusDto);
  }

  @Get()
  findAll() {
    return this.courseStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseStatusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseStatusDto: UpdateCourseStatusDto) {
    return this.courseStatusService.update(+id, updateCourseStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseStatusService.remove(+id);
  }
}
