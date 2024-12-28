import { DatabaseModule } from "@app/common";
import { Global, Module } from "@nestjs/common";
import { getModelToken, MongooseModule } from "@nestjs/mongoose";
import { StudySchema } from "./study.schema";
import { User, UserSchema } from "./user.schema";
import { ExerciseSchema } from "./exercise.schema";
import { AlgorithmSchema } from "./algorithm.schema";
import { ExerciseStatusSchema } from "./exerciseStatus.schema";
import { CourseStatusSchema } from "./courseStatus.schema";
import { CourseSchema } from "./course.schema";

export const EXERCISE_MODEL = "ExerciseModel";
export const STUDY_MODEL = "StudyModel";
export const USER_MODEL = "UserModel";
export const ALGORITHM_MODEL = "AlgorithmModel";
export const COURSE_MODEL = "CourseModel";
export const COURSE_STATUS_MODEL = "CourseStatusModel";
export const EXERCISE_STATUS_MODEL = "ExerciseStatusModel";
const MODELS = [
  {
    name: "ExerciseModel",
    schema: ExerciseSchema,
    discriminators: [
      { name: "StudyModel", schema: StudySchema },
      { name: "AlgorithmModel", schema: AlgorithmSchema },
    ],
  },
  { name: USER_MODEL, schema: UserSchema },
  { name: COURSE_MODEL, schema: CourseSchema },
  { name: COURSE_STATUS_MODEL, schema: CourseStatusSchema },
  { name: EXERCISE_STATUS_MODEL, schema: ExerciseStatusSchema },
];

@Global()
@Module({
  //   imports: [MongooseModule.forFeature(MODELS)],
  providers: [
    {
      provide: EXERCISE_MODEL,
      useFactory: (exerciseModel) => exerciseModel,
      inject: [getModelToken(EXERCISE_MODEL)],
    },
    {
      provide: USER_MODEL,
      useFactory: (user) => user,
      inject: [getModelToken(USER_MODEL)],
    },
    {
      provide: STUDY_MODEL,
      useFactory: (exerciseModel) => exerciseModel.discriminators[STUDY_MODEL],
      inject: [getModelToken(EXERCISE_MODEL)],
    },
    {
      provide: ALGORITHM_MODEL,
      useFactory: (exerciseModel) =>
        exerciseModel.discriminators[ALGORITHM_MODEL],
      inject: [getModelToken(EXERCISE_MODEL)],
    },
    {
      provide: COURSE_MODEL,
      useFactory: (courseModel) => courseModel,
      inject: [getModelToken(COURSE_MODEL)],
    },
    {
      provide: COURSE_STATUS_MODEL,
      useFactory: (courseStatusModel) => courseStatusModel,
      inject: [getModelToken(COURSE_STATUS_MODEL)],
    },
    {
      provide: EXERCISE_STATUS_MODEL,
      useFactory: (exerciseStatusModel) => exerciseStatusModel,
      inject: [getModelToken(EXERCISE_STATUS_MODEL)],
    },
  ],
  imports: [DatabaseModule, DatabaseModule.forFeature(MODELS)],
  exports: [
    DatabaseModule,
    EXERCISE_MODEL,
    STUDY_MODEL,
    USER_MODEL,
    COURSE_MODEL,
    COURSE_STATUS_MODEL,
    EXERCISE_STATUS_MODEL,
  ],
})
export class MongooseModelsModule {}
