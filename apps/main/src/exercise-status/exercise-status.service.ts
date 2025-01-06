import { Injectable } from "@nestjs/common";
import { CreateExerciseStatusDto } from "./dto/create-exercise-status.dto";
import { UpdateExerciseStatusDto } from "./dto/update-exercise-status.dto";
import { ExerciseStatusDocument } from "../schemas/exerciseStatus.schema";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ExerciseService } from "../exercise/exercise.service";

@Injectable()
export class ExerciseStatusService {
  constructor(
    @InjectModel("ExerciseStatus")
    private exerciseStatusModel: Model<ExerciseStatusDocument>,
    private readonly exerciseService: ExerciseService,
  ) { }
  async create(createExerciseStatusDto: CreateExerciseStatusDto): Promise<ExerciseStatusDocument> {
    const newExerciseStatus = new this.exerciseStatusModel(createExerciseStatusDto);
    return newExerciseStatus.save();
  }

  async update(id: string, updateExerciseStatusDto: Partial<CreateExerciseStatusDto>): Promise<ExerciseStatusDocument> {
    return this.exerciseStatusModel.findByIdAndUpdate(new Types.ObjectId(id), updateExerciseStatusDto, { new: true }).exec();
  }
  // async initExerciseStatus(userId: string, courseId: string) {
  //   const exercises = await this.exerciseService.findAllByCourseId(courseId);

  //   const exerciseStatuses = exercises.map((exercise) => ({
  //     exerciseId: exercise._id,
  //     userId,
  //     status: "NOT_STARTED",
  //     submission: [],
  //   }));

  //   return await this.exerciseStatusModel.insertMany(exerciseStatuses);
  // }

  async findAllByUserAndCourse(userId: string, courseId: string) {
    const exercises = await this.exerciseService.findAllByCourseId(courseId);
    const exerciseIds = exercises.map((exercise) => exercise._id);

    return await this.exerciseStatusModel
      .find({ userId, exerciseId: { $in: exerciseIds } }).select("_id exerciseId status").exec();
  }
}
