import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Algorithm, AlgorithmDocument } from "../schemas/algorithm.schema";
import { CreateAlgorithmDto } from "./dto/createAlgorithm.dto";
@Injectable()
export class AlgorithmService {
  constructor(
    @InjectModel(Algorithm.name)
    private algorithmModel: Model<AlgorithmDocument>,
  ) {}

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
}
