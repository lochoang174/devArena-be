import { Injectable } from "@nestjs/common";
import { CreateContestExerciseDto } from "./dto/create-contest-exercise.dto";
import { UpdateContestExerciseDto } from "./dto/update-contest-exercise.dto";
import {
  CONTEST_DESCRIPTION_MODEL,
  CONTEST_EXERCISE_MODEL,
} from "../schemas/mongoose.model";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  ContestExercise,
  ContestExerciseDocument,
} from "../schemas/contest-exercise.schema";
import {
  ContestDescription,
  ContestDescriptionDocument,
} from "../schemas/contest-description.schema";
import { CustomException } from "@app/common";

@Injectable()
export class ContestExerciseService {
  constructor(
    @InjectModel(ContestExercise.name)
    private readonly contestExerciseModel: Model<ContestExerciseDocument>,
    @InjectModel(ContestDescription.name)
    private readonly contestDescriptionModel: Model<ContestDescriptionDocument>,
  ) {}

  async create(
    createContestExerciseDto: CreateContestExerciseDto,
  ): Promise<ContestExercise> {
    try {
      const createdExercise = new this.contestExerciseModel(
        {
          _id: new Types.ObjectId(),
          ...createContestExerciseDto,
        }
      );
      return await createdExercise.save();
    } catch (error) {
      throw new Error(`Failed to create contest exercise: ${error.message}`);
    }
  }

  async findAll(): Promise<ContestExercise[]> {
    try {
      return await this.contestExerciseModel.find().exec();
    } catch (error) {
      throw new Error(`Failed to fetch contest exercises: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<ContestExercise> {
    try {
      const exercise = await this.contestExerciseModel.findById(id).exec();
      if (!exercise) {
        throw new Error("Contest exercise not found");
      }
      return exercise;
    } catch (error) {
      throw new Error(`Failed to fetch contest exercise: ${error.message}`);
    }
  }

  async findByContestId(contestId: string): Promise<ContestExercise[]> {
 
      const exercises = await this.contestExerciseModel
        .find({ contestId: contestId })
        .select("title content difficulty score")
        .exec();
      if (!exercises || exercises.length === 0) {
        throw new CustomException("No exercises found for this contest", 404);
      }

      return exercises;

  }

  async update(
    id: string,
    updateContestExerciseDto: UpdateContestExerciseDto,
  ): Promise<ContestExercise> {
    try {
      const updatedExercise = await this.contestExerciseModel
        .findByIdAndUpdate(id, updateContestExerciseDto, { new: true })
        .exec();
      if (!updatedExercise) {
        throw new Error("Contest exercise not found");
      }
      return updatedExercise;
    } catch (error) {
      throw new Error(`Failed to update contest exercise: ${error.message}`);
    }
  }

  async remove(id: string): Promise<ContestExercise> {
    try {
      const deletedExercise = await this.contestExerciseModel
        .findByIdAndDelete(id)
        .exec();
      if (!deletedExercise) {
        throw new Error("Contest exercise not found");
      }
      return deletedExercise;
    } catch (error) {
      throw new Error(`Failed to delete contest exercise: ${error.message}`);
    }
  }

}
