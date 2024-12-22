import { Injectable } from '@nestjs/common';
import { CreateGraphExerciseInput } from './dto/create-graph-exercise.input';
import { UpdateGraphExerciseInput } from './dto/update-graph-exercise.input';

@Injectable()
export class GraphExerciseService {
  create(createGraphExerciseInput: CreateGraphExerciseInput) {
    return 'This action adds a new graphExercise';
  }

  findAll() {
    return `This action returns all graphExercise`;
  }

  findOne(id: number) {
    return `This action returns a #${id} graphExercise`;
  }

  update(id: number, updateGraphExerciseInput: UpdateGraphExerciseInput) {
    return `This action updates a #${id} graphExercise`;
  }

  remove(id: number) {
    return `This action removes a #${id} graphExercise`;
  }
}
