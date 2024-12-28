import { Global, Module } from "@nestjs/common";
import { ExerciseService } from "./exercise.service";
import { ExerciseController } from "./exercise.controller";
import { Study, StudySchema } from "../schemas/study.schema";
import { DatabaseModule } from "@app/common";
import { getModelToken } from "@nestjs/mongoose";
import { CourseModule } from "../course/course.module";

export const EXERCISE_MODEL = "ExerciseModel";
export const STUDY_MODEL = "StudyModel";

// const MODELS = [
//   {
//     name: "ExerciseModel", // Sử dụng "Exercise" thay vì "ExerciseModel"
//     schema: ExerciseSchema,
//     discriminators: [{ name: "StudyModel", schema: StudySchema }],
//   },
// ];

@Global()
@Module({
  controllers: [ExerciseController],
  providers: [
    ExerciseService,

  ],
  imports: [CourseModule],
  exports: [ExerciseService],

})
export class ExerciseModule {}
