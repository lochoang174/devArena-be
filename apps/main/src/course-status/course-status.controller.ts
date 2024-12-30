import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { CourseStatusService } from "./course-status.service";
import { CreateCourseStatusDto } from "./dto/create-course-status.dto";
import { UpdateCourseStatusDto } from "./dto/update-course-status.dto";

@Controller("course-status")
export class CourseStatusController {
  constructor(private readonly courseStatusService: CourseStatusService) {}

  @Post("enroll")
  async enrollCourse(@Body() body: CreateCourseStatusDto) {
    return await this.courseStatusService.checkAndCreateCourseStatus(
      body.userId,
      body.courseId,
    );
  }

  @Get("user/:userId")
  async getUserCourseStatuses(@Param("userId") userId: string) {
    return await this.courseStatusService.getUserCourseStatuses(userId);
  }
  @Get(":courseStatusId")
  async getCourseStatusById(@Param("courseStatusId") courseStatusId: string) {
    return await this.courseStatusService.getCourseStatusById(courseStatusId);
  }
}
