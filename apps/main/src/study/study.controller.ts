import {
  Body,
  Controller,
  Delete,

  Get,
  HttpStatus,
  HttpException,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { StudyService } from "./study.service";
import { CreateStudyDto } from "./dto/createStudy.dto";
import { RolesGuard } from "../auth/guards/role.guard";
import { Public, Roles } from "@app/common";
import { combineLatest } from "rxjs";


@Controller("study")
export class StudyController {
  constructor(private readonly studyService: StudyService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(["admin"])
  async create(@Body() createStudyDto: CreateStudyDto) {
    return await this.studyService.create(createStudyDto);
  }

  @Put(":id")
  @UseGuards(RolesGuard)
  @Roles(["admin"])
  async update(
    @Param("id") id: string,
    @Body() updateStudyDto: Partial<CreateStudyDto>,
  ) {
    return await this.studyService.update(id, updateStudyDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(["admin"])
  async delete(@Param("id") id: string) {
    return await this.studyService.delete(id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(["admin"])
  async findAll() {
    return await this.studyService.findAll();
  }

  @Public()
  @Get(":id")
  async findById(@Param("id") id: string) {
    return await this.studyService.findById(id);
  }

  @Get("condition")
  @UseGuards(RolesGuard)
  @Roles(["admin"])
  async findByCondition(@Body() condition: any) {
    return await this.studyService.findByCondition(condition);
  }

  @Get("course/:courseId")
  @UseGuards(RolesGuard)
  @Roles(["admin"])
  async findExercisesByCourse(@Param("courseId") courseId: string) {
    return await this.studyService.findExercisesByCourse(courseId);
  }

  @Get("course/:courseId/user/:userId")
  @Roles(["admin", "client"])
  async findAllByUserAndCourse(
    @Param("courseId") courseId: string,
    @Param("userId") userId: string
  ) {
    try {
      return await this.studyService.findAllByUserAndCourse(userId, courseId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND); // Or use BAD_REQUEST based on the error type
    }
  }


}
