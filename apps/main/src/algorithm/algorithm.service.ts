import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Algorithm, AlgorithmDocument } from "../schemas/algorithm.schema";
import { CreateAlgorithmDto } from "./dto/createAlgorithm.dto";
import { ExerciseStatusService } from "../exercise-status/exercise-status.service";
@Injectable()
export class AlgorithmService {

  constructor(
    @InjectModel(Algorithm.name)
    private algorithmModel: Model<AlgorithmDocument>,
    private readonly exerciseStatusService: ExerciseStatusService,

  ) { }
  async findSolutionCode(exerciseId: string, language: string) {
    //find soultion code by exerciseId and language
    const id = new Types.ObjectId(exerciseId); // Convert exerciseId to ObjectId if it's a string
    const solution = await this.algorithmModel.findOne({ _id: id }).select('solutions').exec().then((data) => {
      return data.solutions.find((solution) => solution.language === language).code;
    });
    console.log("solution", solution);
    return solution;
  }
  async create(createAlgorithmDto: CreateAlgorithmDto): Promise<Algorithm> {
    const algorithm = new this.algorithmModel({
      _id: new Types.ObjectId(),
      ...createAlgorithmDto,
    });
    return algorithm.save();
  }

  async update(
    id: string,
    updateAlgorithmDto: Partial<CreateAlgorithmDto>,
  ): Promise<Algorithm> {
    return this.algorithmModel
      .findByIdAndUpdate(new Types.ObjectId(id), updateAlgorithmDto, {
        new: true,
      })
      .exec();
  }

  async delete(id: string): Promise<Algorithm> {
    return this.algorithmModel
      .findOneAndDelete({ _id: new Types.ObjectId(id) })
      .exec();
  }

  async findAll(): Promise<Algorithm[]> {
    return this.algorithmModel.find().exec();
  }
  async findById(id: string): Promise<Algorithm> {
    const algorithm = await this.algorithmModel
      .findById(new Types.ObjectId(id))
      .exec();
    if (!algorithm) {
      throw new NotFoundException("Algorithm not found");
    }
    return algorithm;
  }


  async findExercises(): Promise<Algorithm[]> {
    return this.algorithmModel.find().select('_id title difficulty tags score type').exec();
  }

  async findAllByUser(userId: string): Promise<{
    exercisesStatus: any[];
    exercises: Algorithm[];
  }> {
    const exercises = await this.findExercises();
    const exercisesStatus = await this.exerciseStatusService.findAllAlgorithmByUser(userId);
    return { exercisesStatus, exercises };
  }
}

