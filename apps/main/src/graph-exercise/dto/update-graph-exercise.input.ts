import { CreateGraphExerciseInput } from './create-graph-exercise.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateGraphExerciseInput extends PartialType(CreateGraphExerciseInput) {
  @Field(() => Int)
  id: number;
}
