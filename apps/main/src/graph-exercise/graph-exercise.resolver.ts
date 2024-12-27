import { Resolver, Query, Args } from "@nestjs/graphql";
import { StudyService } from "../study/study.service";
import { GraphExercise } from "./entities/graph-exercise.entity";
import { Public } from "@app/common";

@Resolver(() => GraphExercise)
export class GraphExerciseResolver {
  constructor(private readonly studyService: StudyService) {}
  @Public()
  @Query(() => [GraphExercise], { name: "graphExercises" })
  async findAll() {
    return this.studyService.findAll();
  }

  @Public()
  @Query(() => GraphExercise, { name: "graphExercise" })
  async findOne(@Args("id") id: string) {
    return this.studyService.findById(id);
  }

  // @Query(() => [GraphExercise], { name: "exercisesByDifficulty" })
  // async findByDifficulty(@Args("difficulty") difficulty: string) {
  //   return this.studyService.findExercisesByDifficulty(difficulty);
  // }
  @Public()
  @Query(() => [GraphExercise], { name: "exercisesByCourse" })
  async findByCourse(@Args("courseId") courseId: string) {
    return this.studyService.findExercisesByCourse(courseId);
  }
}
