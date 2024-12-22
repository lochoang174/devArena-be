import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { GraphExerciseService } from './graph-exercise.service';
import { GraphExercise } from './entities/graph-exercise.entity';
import { CreateGraphExerciseInput } from './dto/create-graph-exercise.input';
import { UpdateGraphExerciseInput } from './dto/update-graph-exercise.input';

@Resolver(() => GraphExercise)
export class GraphExerciseResolver {
  constructor(private readonly graphExerciseService: GraphExerciseService) {}

  @Mutation(() => GraphExercise)
  createGraphExercise(@Args('createGraphExerciseInput') createGraphExerciseInput: CreateGraphExerciseInput) {
    return this.graphExerciseService.create(createGraphExerciseInput);
  }

  @Query(() => [GraphExercise], { name: 'graphExercise' })
  findAll() {
    return this.graphExerciseService.findAll();
  }

  @Query(() => GraphExercise, { name: 'graphExercise' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.graphExerciseService.findOne(id);
  }

  @Mutation(() => GraphExercise)
  updateGraphExercise(@Args('updateGraphExerciseInput') updateGraphExerciseInput: UpdateGraphExerciseInput) {
    return this.graphExerciseService.update(updateGraphExerciseInput.id, updateGraphExerciseInput);
  }

  @Mutation(() => GraphExercise)
  removeGraphExercise(@Args('id', { type: () => Int }) id: number) {
    return this.graphExerciseService.remove(id);
  }
}
