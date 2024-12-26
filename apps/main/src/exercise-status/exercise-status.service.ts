import { Injectable } from '@nestjs/common';
import { CreateExerciseStatusDto } from './dto/create-exercise-status.dto';
import { UpdateExerciseStatusDto } from './dto/update-exercise-status.dto';

@Injectable()
export class ExerciseStatusService {
  create(createExerciseStatusDto: CreateExerciseStatusDto) {
    return 'This action adds a new exerciseStatus';
  }

  findAll() {
    return `This action returns all exerciseStatus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} exerciseStatus`;
  }

  update(id: number, updateExerciseStatusDto: UpdateExerciseStatusDto) {
    return `This action updates a #${id} exerciseStatus`;
  }

  remove(id: number) {
    return `This action removes a #${id} exerciseStatus`;
  }
}
