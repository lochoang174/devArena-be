import { Injectable } from "@nestjs/common";
import { CreateContestDescriptionDto } from "./dto/create-contest-description.dto";
import { UpdateContestDescriptionDto } from "./dto/update-contest-description.dto";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CONTEST_DESCRIPTION_MODEL } from "../schemas/mongoose.model";
import { ContestDescription, ContestDescriptionDocument } from "../schemas/contest-description.schema";

@Injectable()
export class ContestDescriptionService {
  constructor(
    @InjectModel(ContestDescription.name)
    private readonly contestDescriptionModel: Model<ContestDescriptionDocument>,
  ) {}

  async create(createContestDescriptionDto: CreateContestDescriptionDto) {
    try {
      const createdContestDescription = new this.contestDescriptionModel(
        {
          ...createContestDescriptionDto,
          status: "draft",
        }
      );
      return await createdContestDescription.save();
    } catch (error) {
      throw new Error(`Failed to create contest description: ${error.message}`);
    }
  }

  async findAll() {
    try {
      return await this.contestDescriptionModel.find().exec();
    } catch (error) {
      throw new Error(`Failed to fetch contest descriptions: ${error.message}`);
    }
  }

  async findOne(id: string) {
    try {
      const contestDescription = await this.contestDescriptionModel
        .findById(id)
        .exec();
      if (!contestDescription) {
        throw new Error("Contest description not found");
      }
      return contestDescription;
    } catch (error) {
      throw new Error(`Failed to fetch contest description: ${error.message}`);
    }
  }

  async update(
    id: string,
    updateContestDescriptionDto: UpdateContestDescriptionDto,
  ) {
    try {
      const updatedContestDescription = await this.contestDescriptionModel
        .findByIdAndUpdate(id, updateContestDescriptionDto, { new: true })
        .exec();

      if (!updatedContestDescription) {
        throw new Error("Contest description not found");
      }
      return updatedContestDescription;
    } catch (error) {
      throw new Error(`Failed to update contest description: ${error.message}`);
    }
  }

  async publish(id: string) {
    return await this.contestDescriptionModel.findByIdAndUpdate(id, { status: "published" }, { new: true }).exec();
  }

  async remove(id: string) {
    try {
      const deletedContestDescription = await this.contestDescriptionModel
        .findByIdAndDelete(id)
        .exec();

      if (!deletedContestDescription) {
        throw new Error("Contest description not found");
      }
      return deletedContestDescription;
    } catch (error) {
      throw new Error(`Failed to delete contest description: ${error.message}`);
    }
  }
  async findByStatus(status: string) {
    try {
      return await this.contestDescriptionModel.find({ status: status }).exec();
    } catch (error) {
      throw new Error(`Failed to fetch contest exercises by status: ${error.message}`);
    }
  }
}
