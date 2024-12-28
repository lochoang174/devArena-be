import { Resolver, Query, Args } from "@nestjs/graphql";
import { StudyService } from "../study/study.service";
import { GraphExercise } from "./entities/graph-exercise.entity";
import { Public, Roles } from "@app/common";
import { Study } from "../schemas/study.schema";
import { UseGuards } from "@nestjs/common";
import { RolesGuard } from "../auth/guards/role.guard";

@Resolver(() => GraphExercise)
export class GraphExerciseResolver {


  constructor(private readonly studyService: StudyService) {}
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @Query(() => [Study], { name: "findAll" })
  async findAll(): Promise<Study[]> {

    return this.studyService.findAll();  // Adjust this if you want to return the whole array
  }

  @Public()
  @Query(() => GraphExercise, { name: "graphExercise" })
  async findOne(@Args("id") id: string) {
    return this.studyService.findById(id);
  }

  @Public()
  @Query(() => [GraphExercise], { name: "exercisesByCourse" })
  async findByCourse(@Args("courseId") courseId: string) {
    return this.studyService.findExercisesByCourse(courseId);
  }
}
