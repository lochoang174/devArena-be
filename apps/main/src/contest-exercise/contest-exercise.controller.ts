import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { ContestExerciseService } from "./contest-exercise.service";
import { CreateContestExerciseDto } from "./dto/create-contest-exercise.dto";
import { UpdateContestExerciseDto } from "./dto/update-contest-exercise.dto";
import { Roles } from "@app/common/decorators/customize";
import { RolesGuard } from "../auth/guards/role.guard";

@Controller("contest-exercise")
export class ContestExerciseController {
  constructor(
    private readonly contestExerciseService: ContestExerciseService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(["admin"])
  create(@Body() createContestExerciseDto: CreateContestExerciseDto) {
    return this.contestExerciseService.create(createContestExerciseDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(["admin", "client"])
  findAll() {
    return this.contestExerciseService.findAll();
  }

  @Get("/detail/:id")
  @UseGuards(RolesGuard)
  @Roles(["admin", "client"])
  findOne(@Param("id") id: string) {
    return this.contestExerciseService.findOne(id);
  }


  @Get("/contest/:contest")
  @UseGuards(RolesGuard)
  @Roles(["admin", "client"])
  findByContest(@Param("contest") id: string) {

    return this.contestExerciseService.findByContestId(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(["admin"])
  update(
    @Param("id") id: string,
    @Body() updateContestExerciseDto: UpdateContestExerciseDto,
  ) {
    return this.contestExerciseService.update(id, updateContestExerciseDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(["admin"])
  remove(@Param("id") id: string) {
    return this.contestExerciseService.remove(id);
  }
  
}
