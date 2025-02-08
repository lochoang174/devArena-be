import { Injectable } from '@nestjs/common';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { Achievement, AchievementDocument, AchievementSchema, } from '../schemas/achievement.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { async, retry } from 'rxjs';
import { AchievementStatusService } from '../achievement-status/achievement-status.service';

@Injectable()
export class AchievementService {

  constructor(
    @InjectModel(Achievement.name) private achievementModel: Model<AchievementDocument>,
    private readonly achievementStatusService: AchievementStatusService,

  ) { }

  async create(createAchievementDto: CreateAchievementDto):
    Promise<AchievementDocument> {
    console.log("createAchievementDto", createAchievementDto);
    const newAchievement = new this.achievementModel(createAchievementDto);
    return newAchievement.save();
  }

  //get all achievements
  async findAll(): Promise<Achievement[]> {
    return this.achievementModel.find().exec();
  }

  //get one achievement by refId and score
  async findOneByRefIdAndScore(refId: string, requiredScore: number): Promise<Achievement> {
    return this.achievementModel.findOne({ refId, requiredScore: { $eq: requiredScore } }).lean().exec();
  }

  //get all achievements by refId
  async findAllByRefId(refId: string): Promise<Achievement[]> {
    return this.achievementModel.find({ refId }).exec();
  }

  async getAchievementById(id: string): Promise<Achievement> {
    return this.achievementModel.findById(id).exec();
  }

  async getAchievementsByUserId(userId: string) {
    const achievementStatus = await this.achievementStatusService.findAllByUserId(userId);
    const achievementIds = achievementStatus.map((achievement) => achievement.achievementId);
    const achievements = await this.achievementModel.find({ _id: { $in: achievementIds } }).select("title requiredScore image").exec();
    return achievements;
  }

  //patch achievement
  async patch(id: string, updateAchievementDto: Partial<CreateAchievementDto>): Promise<Achievement> {
    if (updateAchievementDto == undefined) return null;
    return this.achievementModel.findByIdAndUpdate(new Types.ObjectId(id), updateAchievementDto, { new: true }).exec();
  }

  // update achievement
  async update(id: string, updateAchievementDto: Partial<CreateAchievementDto>): Promise<Achievement> {
    console.log(id, updateAchievementDto);
    return this.achievementModel.findByIdAndUpdate(new Types.ObjectId(id), updateAchievementDto, { new: true }).exec();
  }

  // delete achievement
  async delete(id: string) {
    return this.achievementModel.findByIdAndDelete(new Types.ObjectId(id));
  }

  async deleteAll() {
    return this.achievementModel.deleteMany({});
  }
}
