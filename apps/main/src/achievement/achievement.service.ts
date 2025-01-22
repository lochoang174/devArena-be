import { Injectable } from '@nestjs/common';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { Achievement, AchievementDocument, AchievementSchema, } from '../schemas/achievement.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AchievementService {

  constructor(
    @InjectModel(Achievement.name) private achievementModel: Model<AchievementDocument>,
  ) { }

  async create(createAchievementDto: CreateAchievementDto):
    Promise<Achievement> {

    const newAchievement = new this.achievementModel(createAchievementDto);
    return newAchievement.save();
  }

  findAll() {
    return `This action returns all achievement`;
  }

  findOne(id: number) {
    return `This action returns a #${id} achievement`;
  }

  update(id: number, updateAchievementDto: UpdateAchievementDto) {
    return `This action updates a #${id} achievement`;
  }

  remove(id: number) {
    return `This action removes a #${id} achievement`;
  }
}
