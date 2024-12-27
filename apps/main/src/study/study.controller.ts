import {
  Body,
  Controller,
  Delete,

  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { StudyService } from "./study.service";
import { CreateStudyDto } from "./dto/createStudy.dto";
import { RolesGuard } from "../auth/guards/role.guard";
import { Roles } from "@app/common";


@Controller("study")
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

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

  @Get(":id")
  @UseGuards(RolesGuard)
  @Roles(["admin"])
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
}
