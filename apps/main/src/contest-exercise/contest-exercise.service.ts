import { Injectable } from '@nestjs/common';
import { CreateContestExerciseDto } from './dto/create-contest-exercise.dto';
import { UpdateContestExerciseDto } from './dto/update-contest-exercise.dto';
import { CONTEST_DESCRIPTION_MODEL, CONTEST_EXERCISE_MODEL } from '../schemas/mongoose.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContestExercise, ContestExerciseDocument } from '../schemas/contest-exercise.schema';
import { ContestDescription, ContestDescriptionDocument } from '../schemas/contest-description.schema';

@Injectable()
export class ContestExerciseService {
  constructor(
    @InjectModel(ContestExercise.name)
    private readonly contestExerciseModel: Model<ContestExerciseDocument>,
    @InjectModel(ContestDescription.name)
    private readonly contestDescriptionModel: Model<ContestDescriptionDocument>,
  ) {}

  create(createContestExerciseDto: CreateContestExerciseDto) {
    return 'This action adds a new contestExercise';
  }

  findAll() {
    return `This action returns all contestExercise`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contestExercise`;
  }

  update(id: number, updateContestExerciseDto: UpdateContestExerciseDto) {
    return `This action updates a #${id} contestExercise`;
  }

  remove(id: number) {
    return `This action removes a #${id} contestExercise`;
  }
}
