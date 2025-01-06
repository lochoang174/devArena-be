import { Module } from "@nestjs/common";
import { StudyService } from "./study.service";
import { StudyController } from "./study.controller";
import { DatabaseModule } from "@app/common/databases"; // Đảm bảo DatabaseModule được nhập khẩu
import { MongooseModule } from "@nestjs/mongoose";
import { Study, StudySchema } from "../schemas/study.schema";
import { ExerciseModule } from "../exercise/exercise.module";
import { MongooseModelsModule } from "../schemas/mongoose.model";
import { ExerciseStatusModule } from "../exercise-status/exercise-status.module";

@Module({
  imports: [ExerciseStatusModule],
  controllers: [StudyController],
  providers: [StudyService],
  exports: [StudyService],
  // imports: [MongooseModelsModule],
})
export class StudyModule { }

