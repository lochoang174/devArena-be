import { Global, Module } from "@nestjs/common";
import { ExerciseService } from "./exercise.service";
import { ExerciseController } from "./exercise.controller";
import { Study, StudySchema } from "../schemas/study.schema";
import { DatabaseModule } from "@app/common";
import { getModelToken } from "@nestjs/mongoose";

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
    // {
    //   provide: EXERCISE_MODEL,
    //   useFactory: (exerciseModel) => exerciseModel,
    //   inject: [getModelToken(EXERCISE_MODEL)],
    // },
    // {
    //   provide: STUDY_MODEL,
    //   useFactory: (exerciseModel) => exerciseModel.discriminators[STUDY_MODEL],
    //   inject: [getModelToken(EXERCISE_MODEL)],
    // },
  ],
  // imports: [DatabaseModule, DatabaseModule.forFeature(MODELS)],
  // exports: [DatabaseModule, ExerciseService, EXERCISE_MODEL, STUDY_MODEL],
})
export class ExerciseModule {}
