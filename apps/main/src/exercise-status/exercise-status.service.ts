import { Injectable } from "@nestjs/common";
import { CreateExerciseStatusDto } from "./dto/create-exercise-status.dto";
import { UpdateExerciseStatusDto } from "./dto/update-exercise-status.dto";
import { ExerciseStatusDocument } from "../schemas/exerciseStatus.schema";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ExerciseService } from "../exercise/exercise.service";
import { stat } from "fs";

@Injectable()
export class ExerciseStatusService {
  constructor(
    @InjectModel("ExerciseStatus")
    private exerciseStatusModel: Model<ExerciseStatusDocument>,
    private readonly exerciseService: ExerciseService,
  ) { }
  async create(createExerciseStatusDto: CreateExerciseStatusDto): Promise<ExerciseStatusDocument> {
    const newExerciseStatus = {
      ...createExerciseStatusDto,
      status: "in-progress",
    }
    return this.exerciseStatusModel.create(newExerciseStatus);
  }

  async update(userId: string, exerciseId: string) {
    //only update status
    return this.exerciseStatusModel.findOneAndUpdate({ userId, exerciseId }, { status: "completed" }).exec();
  }

  async findOneByUSerAndExercise(userId: string, exerciseId: string) {
    return this.exerciseStatusModel.findOne({ userId, exerciseId }).exec();
  }


  async initExerciseStatus(createExerciseStatusDto: CreateExerciseStatusDto) {
    // const exercises = await this.exerciseService.findAllByCourseId(courseId);

    // const exerciseStatuses = exercises.map((exercise) => ({
    //   exerciseId: exercise._id,
    //   userId,
    //   status: "in-progress",
    //   submission: [],
    // }));

    // return await this.exerciseStatusModel.insertMany(exerciseStatuses);
  }

  async findAllByUserAndCourse(userId: string, courseId: string) {
    const exercises = await this.exerciseService.findAllByCourseId(courseId);
    const exerciseIds = exercises.map((exercise) => exercise._id);

    return await this.exerciseStatusModel
      .find({ userId, exerciseId: { $in: exerciseIds } }).select("_id exerciseId status").exec();
  }
}
