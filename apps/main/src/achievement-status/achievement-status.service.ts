import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAchievementStatusDto } from './dto/create-achievement-status.dto';
import { UpdateAchievementStatusDto } from './dto/update-achievement-status.dto';
import { InjectModel } from '@nestjs/mongoose';
import { AchievementStatus } from '../schemas/achievementStatus.schema';
import mongoose, { Model, ObjectId } from 'mongoose';
import { AchievementStatusDocument } from '../schemas/achievementStatus.schema';

@Injectable()
export class AchievementStatusService {

  constructor(
    @InjectModel("AchievementStatus")
    private achievementStatusModel: Model<AchievementStatus>,
  ) { }
  async create(createAchievementStatusDto: CreateAchievementStatusDto): Promise<AchievementStatusDocument> {
    try {
      // Check if the achievement status already exists
      const existingAchievementStatus = await this.achievementStatusModel.findOne({
        userId: createAchievementStatusDto.userId,
        achievementId: createAchievementStatusDto.achievementId,
      });

      if (existingAchievementStatus) {
        // Return the existing achievement status or handle it as needed
        return existingAchievementStatus;
      }

      // Create a new achievement status if it doesn't exist
      const newAchievementStatus = new this.achievementStatusModel(createAchievementStatusDto);
      return newAchievementStatus.save();
    } catch (err) {
      throw new HttpException(
        { success: false, message: 'Failed to create achievement status' },
        HttpStatus.CONFLICT,
      );
    }
  }

  async findByUserIdAndAchievementId(userId: string, achievementId: string) {
    return this.achievementStatusModel.findOne({ userId, achievementId }).exec();
  }

  //check exist achievement status by userId  and achievementId
  async checkExist(userId: string, achievementId: string) {
    return this.achievementStatusModel.findOne({
      userId,
      achievementId,
    }).exec();
  }

  async findAll(): Promise<AchievementStatus[]> {
    return this.achievementStatusModel.find().exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} achievementStatus`;
  }
  async update(id: string, updateAchievementStatusDto: UpdateAchievementStatusDto) {
    const objectId = new mongoose.Types.ObjectId(id); // Ensure it's a Mongoose ObjectId

    const existingAchievementStatus = await this.achievementStatusModel.findById(objectId);

    if (!existingAchievementStatus) {
      throw new NotFoundException(`Achievement status with ID ${id} not found`);
    }

    Object.assign(existingAchievementStatus, updateAchievementStatusDto);

    return await existingAchievementStatus.save();
  }



  remove(id: number) {
    return `This action removes a #${id} achievementStatus`;
  }
}
