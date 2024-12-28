import { Injectable } from "@nestjs/common";
import { CreateExerciseStatusDto } from "./dto/create-exercise-status.dto";
import { UpdateExerciseStatusDto } from "./dto/update-exercise-status.dto";
import { ExerciseStatusDocument } from "../schemas/exerciseStatus.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ExerciseService } from "../exercise/exercise.service";

@Injectable()
export class ExerciseStatusService {
  constructor(
    @InjectModel("ExerciseStatus")
    private exerciseStatusModel: Model<ExerciseStatusDocument>,
    private readonly exerciseService: ExerciseService,
  ) {}
  create(createExerciseStatusDto: CreateExerciseStatusDto) {
    return "This action adds a new exerciseStatus";
  }

  async initExerciseStatus(userId: string, courseId: string) {
    const exercises = await this.exerciseService.findAllByCourseId(courseId);

    const exerciseStatuses = exercises.map((exercise) => ({
      exerciseId: exercise._id,
      userId,
      status: "NOT_STARTED",
      submission: [],
    }));

    return await this.exerciseStatusModel.insertMany(exerciseStatuses);
  }
}
